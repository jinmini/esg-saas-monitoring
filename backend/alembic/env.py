import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# 🚨 [수정 1] 로컬 개발 환경 우선 로드
# 1. .env.dev가 있으면 무조건 그걸 씁니다. (안전빵)
# 2. 없으면 .env.prod를 씁니다.
env_file_dev = Path(__file__).parent.parent / '.env.dev'
env_file_prod = Path(__file__).parent.parent / '.env.prod'

if env_file_dev.exists():
    load_dotenv(env_file_dev)
    print(f"✅ Loaded environment from {env_file_dev}")
elif env_file_prod.exists():
    load_dotenv(env_file_prod)
    print(f"⚠️ Loaded environment from {env_file_prod}")

from shared.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        return database_url
    from core.config import settings
    return settings.DATABASE_URL

def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    db_url = get_url()
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = db_url

    # 🚨 [수정 2] 로컬호스트가 아닐 때만 SSL 적용 (Supabase 대응)
    connect_args = {}
    if "localhost" not in db_url and "127.0.0.1" not in db_url:
        connect_args = {"ssl": "require"}

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args,  # 조건부 SSL 적용
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()