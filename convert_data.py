import pandas as pd
import json
import os

files = ["education datset1.xlsx", "health dataset.xlsx"]

for file in files:
    if not os.path.exists(file):
        print(f"File not found: {file}")
        continue
        
    print(f"Processing {file}...")
    try:
        df = pd.read_excel(file)
        print(f"Columns for {file}: {df.columns.tolist()}")
        print(f"First 2 rows:\n{df.head(2).to_dict(orient='records')}")
        
        json_filename = file.replace(".xlsx", ".json").replace(" ", "_")
        df.to_json(json_filename, orient="records", indent=4)
        print(f"Converted {file} to {json_filename}")
        
    except Exception as e:
        print(f"Error processing {file}: {e}")
