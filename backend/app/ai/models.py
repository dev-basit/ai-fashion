from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from app.config.settings import settings

llm = ChatOpenAI(
    model=settings.openai_chat_model,
    api_key=settings.openai_api_key,
    streaming=True,
)

embeddings = OpenAIEmbeddings(
    model=settings.openai_embedding_model,
    api_key=settings.openai_api_key,
)
