from functools import lru_cache

from langchain_openai import OpenAIEmbeddings

from app.config import AIModel, settings


@lru_cache
def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model=AIModel.EMBEDDING, api_key=settings.OPENAI_API_KEY)
