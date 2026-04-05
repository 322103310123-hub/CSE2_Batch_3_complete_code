import json
import os
import asyncio
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini Client
client = genai.Client()

async def mark_as_rejected(scheme_name: str):
    """Utility to mark a scheme as rejected in the database."""
    try:
        from app.core.database import AsyncSessionLocal
        from app.models.proposed_schemes import ProposedScheme
        from sqlalchemy import update
        async with AsyncSessionLocal() as db:
            await db.execute(update(ProposedScheme).where(ProposedScheme.scheme_name == scheme_name).values(status="rejected"))
            await db.commit()
    except Exception as e:
        print(f"Failed to update db status to rejected: {e}")

def verify_and_extract_scheme_data(scheme_name: str, state: str, sector: str, category: str) -> Optional[Dict[str, Any]]:
    """Use Gemini AI Mode to search for and verify the scheme, then extract details."""
    
    prompt = f"""
    You are an expert AI scheme researcher for an application providing schemes/scholarships in India.
    Your task is to search your knowledge base (or use Google Search) to verify a user-proposed scheme.
    
    Proposed Scheme details:
    - Name: "{scheme_name}"
    - State: "{state}"
    - Sector: "{sector}"
    - Category: "{category}"
    
    INSTRUCTIONS:
    1. Search internal knowledge for this scheme. Evaluate if it actually exists as a real governmental or legitimate private scheme.
    2. If the scheme DOES NOT exist, is a hallucination, or is entirely fictional, return exactly "FALSE_NOT_FOUND".
    3. If the scheme DOES exist, extract its details and format them EXACTLY as the following JSON structure. Do not include markdown code block syntax (like ```json). Return ONLY the raw JSON object.
    
    JSON STRUCTURE TO FILL:
    {{
        "Title": "Full verified title of the scheme",
        "Oppurtunity_category": "Scholarships / Schemes & Welfare / Internships etc",
        "Sector": "{sector}",
        "Organisation": "Name of the funding or organizing body",
        "State": "Applicable State (or 'All India')",
        "Gender_Eligibility": "Female only / Male only / All genders",
        "Eligible_Income": "E.g., Low Income, BPL, or No Income Limit",
        "Eligible_Caste": "E.g., SC/ST, OBC, All categories",
        "Education": "Minimum education required (e.g. Primary, Secondary, Bachelor, All)",
        "Eligible_Agegroup": "Child (0-5) / Youth (5-18) / Adult (18-60) / Senior (60+) / All ages",
        "Disability_Eligibility": "All / Specific disability names / Not applicable",
        "Country": "India",
        "Apply_Link": "Original application link if known, otherwise an empty string or 'Search online'",
        "Apply_Link.1": "Link"
    }}
    """
    
    try:
        print(f"Calling Google AI for: {scheme_name}...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}],
            )
        )
        
        result_text = response.text.strip()
        
        if "FALSE_NOT_FOUND" in result_text:
            return None
            
        # Clean up if the AI accidentally adds markdown
        if result_text.startswith("```json"):
            result_text = result_text.replace("```json", "", 1)
        if result_text.endswith("```"):
            result_text = result_text.rsplit("```", 1)[0]
            
        result_text = result_text.strip()
        scheme_data = json.loads(result_text)
        return scheme_data
        
    except Exception as e:
        print(f"Error during Google AI verification: {e}")
        return None


async def process_proposed_scheme(scheme_name: str, state: str, sector: str, category: str):
    """Background task to fully process and auto-add a proposed scheme using AI Mode."""
    
    print(f"Starting background processing for proposed scheme: {scheme_name}")
    print(f"Using direct Google AI mode instead of local web scraping...")
    
    extracted_data = verify_and_extract_scheme_data(scheme_name, state, sector, category)
    
    if not extracted_data:
        print(f"AI Verification Failed. Scheme '{scheme_name}' is not found or quota limit hit. Marking as rejected.")
        await mark_as_rejected(scheme_name)
        return
        
    print(f"AI Verification Successful! Scheme '{scheme_name}' verified and formatted.")
    
    # Add perfectly formatted JSON data to the correct dataset
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_file_path = os.path.join(BASE_DIR, "data", "health_dataset.json" if category.lower() == 'health' else "education_datset1.json")
    
    try:
        with open(data_file_path, 'r', encoding='utf-8') as f:
            current_data = json.load(f)
            
        current_data.append(extracted_data)
        
        with open(data_file_path, 'w', encoding='utf-8') as f:
            json.dump(current_data, f, indent=4, ensure_ascii=False)
            
        print(f"Successfully auto-added '{scheme_name}' to {os.path.basename(data_file_path)}!")
        
        # Update database status to approved
        from app.core.database import AsyncSessionLocal
        from app.models.proposed_schemes import ProposedScheme
        from sqlalchemy import update
        async with AsyncSessionLocal() as db:
            await db.execute(update(ProposedScheme).where(ProposedScheme.scheme_name == scheme_name).values(status="approved"))
            await db.commit()
            
    except Exception as e:
        print(f"Error writing to JSON dataset: {e}")
        await mark_as_rejected(scheme_name)
