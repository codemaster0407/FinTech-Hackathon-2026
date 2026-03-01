from groq import Groq
from dotenv import load_dotenv
import os 
load_dotenv()

GROQ_KEY = os.getenv("GROQ_KEY")
client = Groq(api_key = GROQ_KEY)

def groq_api_call(prompt):
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
        {
            "role": "user",
            "content": prompt
        }
        ],
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        reasoning_effort="medium",
        stream=True,
        stop=None
    )
    text = ''
    for chunk in completion:
        # print(chunk.choices[0].delta.content or "", end="")
        text += chunk.choices[0].delta.content or ""
    # print('\n')
    return text