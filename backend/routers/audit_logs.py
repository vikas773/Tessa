from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/api/audit-logs",
    tags=["Audit Logs"],
)

@router.get("/", response_model=list[schemas.AuditLogOut])
def get_audit_logs(limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Fetch Recent Activities**
    Returns the latest audit logs for the dashboard activity feed.
    """
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
