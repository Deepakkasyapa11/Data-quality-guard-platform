from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, database

app = FastAPI(title="Data Quality Metadata API")
models.Base.metadata.create_all(bind=database.engine)

@app.get("/health")
def health_check():
    return {"status": "active", "engine": "FastAPI"}

@app.get("/logs")
def get_logs(db: Session = Depends(database.SessionLocal)):
    return db.query(models.DQResult).all()