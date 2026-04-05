from google import genai
from dotenv import load_dotenv

load_dotenv()

def test():
    client = genai.Client()
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents="What is Pradhan Mantri Matru Vandana Yojana?"
    )
    print(response.text)

if __name__ == "__main__":
    test()
