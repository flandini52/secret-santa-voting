from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time

# Database URL con fallback
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def create_engine_with_retry(database_url, max_retries=5, retry_delay=2):
    for attempt in range(max_retries):
        try:
            engine = create_engine(database_url)
            engine.connect()
            print(f"✓ Connesso al database al tentativo {attempt + 1}")
            return engine
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠ Tentativo {attempt + 1} fallito. Riprovo tra {retry_delay}s...")
                time.sleep(retry_delay)
            else:
                raise e

engine = create_engine_with_retry(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, index=True)
    ordered_gifts = Column(JSON)

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS - permetti tutti i domini (o specifica il tuo frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione, sostituisci con il tuo dominio frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VoteSchema(BaseModel):
    user: str
    ordered_gifts: List[str]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Secret Santa API"}

@app.post("/vote")
def save_vote(vote: VoteSchema):
    db = SessionLocal()
    try:
        db_vote = Vote(user_name=vote.user, ordered_gifts=vote.ordered_gifts)
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        return {"status": "ok", "id": db_vote.id}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

@app.get("/ranking")
def get_ranking():
    db = SessionLocal()
    try:
        votes = db.query(Vote).all()
        result = []
        for v in votes:
            for i, gift in enumerate(v.ordered_gifts):
                result.append({
                    "user_name": v.user_name,
                    "gift": gift,
                    "position": i + 1
                })
        return result
    finally:
        db.close()