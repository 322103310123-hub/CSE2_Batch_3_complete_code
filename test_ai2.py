import sys
import traceback
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client()

prompt = """
You are an expert AI scheme researcher for an application providing schemes/scholarships in India.
Your task is to search your knowledge base AND USE GOOGLE SEARCH to verify a user-proposed scheme.

Proposed Scheme details:
- Name: "pm vidyalakshmi scheme"
- State: "All India"
- Sector: "Government"
- Category: "Education"

INSTRUCTIONS:
1. Validate if this scheme actually exists as a real governmental or legitimate private scheme in India.
2. If the scheme DOES NOT exist, is a hallucination, or is entirely fictional, return exactly "FALSE_NOT_FOUND".
3. If the scheme DOES exist, extract its details and format them EXACTLY as the following JSON structure. Do not include markdown code block syntax (like ```json). Return ONLY the raw JSON object.

JSON STRUCTURE TO FILL:
{
    "Title": "Full verified title of the scheme",
    "Oppurtunity_category": "Scholarships / Schemes & Welfare / Internships etc",
    "Sector": "Government",
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
}
"""

try:
    print('Calling Google AI with Search...')
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[{"google_search": {}}],
        )
    )
    print('Raw response:')
    print(response.text)
except Exception as e:
    print('Exception occurred:')
    traceback.print_exc()
