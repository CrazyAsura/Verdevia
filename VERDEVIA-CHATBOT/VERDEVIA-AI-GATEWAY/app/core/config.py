from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "gemma4:e4b"
    ollama_fallback_model: str = "gemma4:e4b"
    ollama_embedding_model: str = "nomic-embed-text"
    ai_gateway_log_level: str = "INFO"
    chroma_persist_dir: str = "./data/chroma"
    rag_upload_dir: str = "./data/uploads"
    rag_collection_name: str = "VERDEVIA_rag"
    rag_chunk_size: int = 900
    rag_chunk_overlap: int = 120
    rag_top_k: int = 6
    rag_max_context_chars: int = 9000
    rag_cache_size: int = 256
    dspark_enabled: bool = True
    ollama_temperature: float = 0.15
    ollama_top_p: float = 0.85
    ollama_repeat_penalty: float = 1.18
    ollama_num_predict: int = 1800
    ollama_num_ctx: int = 8192
    ollama_keep_alive: str = "10m"
    ollama_timeout_seconds: int = 300

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
