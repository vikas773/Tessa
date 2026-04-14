from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Get Dashboard Statistics**
    Returns counts for total, assigned, available, and maintenance assets.
    """
    total = db.query(models.Asset).count()
    assigned = db.query(models.Asset).filter(models.Asset.status == "Assigned").count()
    available = db.query(models.Asset).filter(models.Asset.status == "Available").count()
    maintenance = db.query(models.Asset).filter(models.Asset.status == "Under Maintenance").count()
    
    return {
        "total_assets": total,
        "assigned_assets": assigned,
        "available_assets": available,
        "maintenance_assets": maintenance
    }
