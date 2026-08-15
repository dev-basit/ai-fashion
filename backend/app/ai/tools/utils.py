from langchain_core.runnables import RunnableConfig


def _cfg(config: RunnableConfig) -> dict:
    return ((config or {}).get("configurable") or {})


def get_user_id(config: RunnableConfig) -> str:
    return _cfg(config).get("user_id", "")
