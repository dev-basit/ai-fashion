from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from app.config.config import config

llm = ChatOpenAI(
    model=config.openai_chat_model,
    api_key=config.openai_api_key,
    streaming=True,
)

embeddings = OpenAIEmbeddings(
    model=config.openai_embedding_model,
    api_key=config.openai_api_key,
)
