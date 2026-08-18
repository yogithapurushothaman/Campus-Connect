from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from campus_connect.config import Config

engine = create_engine(
    Config.DATABASE_URL,
    connect_args={"check_same_thread": False} if Config.DATABASE_URL.startswith("sqlite") else {},
    echo=False
)

SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionFactory)

Base = declarative_base()

def get_db():
    """Generator for database session dependency"""
    db = db_session()
    try:
        yield db
    finally:
        db.close()
