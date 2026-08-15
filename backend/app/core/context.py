from contextvars import ContextVar
from supabase import Client

_db_var: ContextVar[Client] = ContextVar("db")
_user_var: ContextVar = ContextVar("current_user")
_token_var: ContextVar[str] = ContextVar("token")


def get_db() -> Client:
    return _db_var.get()


def get_current_user():
    return _user_var.get()


def get_token() -> str:
    return _token_var.get()
