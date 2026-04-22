import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, assets, assignments, maintenance, dashboard, audit_logs
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Creating database tables if they do not exist...")
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("Successfully connected and synced models with Supabase!")
except Exception as e:
    logger.error(f"Error connecting to Supabase: {e}")

app = FastAPI(
    title="Tessa Cloud Asset Management API",
    description="Atomic APIs for Asset Management",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tessa-frontend.vercel.app"], # Just to be safe
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(assets.router)
app.include_router(assignments.router)
app.include_router(maintenance.router)
app.include_router(dashboard.router)
app.include_router(audit_logs.router)
