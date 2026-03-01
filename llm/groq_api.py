from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def groq_api_call(prompt: str) -> str:
    """Call Groq if API key is configured; otherwise return a quick fallback string.

    This avoids creating network clients at import time and makes the function
    safe to call in test environments where the key isn't available.
    """
    if not GROQ_API_KEY:
        return f"[LLM unavailable] {prompt[:200]}"

    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            reasoning_effort="medium",
            stream=True,
            stop=None,
        )

        text = ""
        for chunk in completion:
            text += chunk.choices[0].delta.content or ""

        return text
    except Exception as e:
        return f"[LLM error] {str(e)}"
