"""Lightweight local stub for the `groq` package used by the demo.

This avoids an ImportError when a different `groq` package API is installed
and allows the FastAPI app to start for local testing. It provides a minimal
`Groq` class with a `chat.completions.create` method that yields no chunks.
"""
from typing import Iterable


class _Delta:
    def __init__(self, content=None):
        self.content = content


class _Choice:
    def __init__(self, delta):
        self.delta = delta


class _Chunk:
    def __init__(self, content=None):
        self.choices = [ _Choice(_Delta(content)) ]


class _Completions:
    def create(self, *args, **kwargs) -> Iterable[_Chunk]:
        # Return an empty iterator (no streamed chunks). This keeps the
        # `llm.groq_api.groq_api_call` function functional during local runs.
        return []


class _Chat:
    def __init__(self):
        self.completions = _Completions()


class Groq:
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.chat = _Chat()
