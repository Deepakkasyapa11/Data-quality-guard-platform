from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class DQResult(Base):
    __tablename__ = "quality_logs"
    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String)
    rule_type = Column(String) 
    severity = Column(String) 
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)