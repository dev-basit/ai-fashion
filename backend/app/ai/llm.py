from functools import lru_cache

from langchain_openai import ChatOpenAI

from app.config import AIModel, settings


@lru_cache
def get_llm(model: str = AIModel.GPT_4O_MINI, temperature: float = 0.7) -> ChatOpenAI:
    return ChatOpenAI(model=model, temperature=temperature, api_key=settings.OPENAI_API_KEY)
