import json
import os

edu_path = r"c:\Users\ASUS\Desktop\finalyear4\FinalYear\data\education_datset1.json"
health_path = r"c:\Users\ASUS\Desktop\finalyear4\FinalYear\data\health_dataset.json"

try:
    with open(edu_path, 'r', encoding='utf-8') as f:
        edu_data = json.load(f)
    print("--- EDUCATION SCHEMES ---")
    for s in edu_data:
        print(f"- {s.get('Title', 'Unknown')}")
except Exception as e:
    print(e)
    
print("\n--- HEALTH SCHEMES ---")
try:
    with open(health_path, 'r', encoding='utf-8') as f:
        health_data = json.load(f)
    for s in health_data:
        print(f"- {s.get('Title', 'Unknown')}")
except Exception as e:
    print(e)
