from sqlalchemy import Column, Integer, String
from db import Base

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True)
    user_name = Column(String)
    gift = Column(String)
    position = Column(Integer)