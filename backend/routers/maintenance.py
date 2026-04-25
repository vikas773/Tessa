from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/api/maintenance",
    tags=["Maintenance"],
)

@router.post("/", response_model=schemas.MaintenanceOut, status_code=201)
def create_maintenance_ticket(ticket: schemas.MaintenanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Create a maintenance ticket**
    Marks the asset as 'Under Maintenance' and logs the issue.
    """
    asset = db.query(models.Asset).filter(models.Asset.id == ticket.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.status = "Under Maintenance"
    
    new_ticket = models.Maintenance(
        asset_id=ticket.asset_id,
        user_id=current_user.id,
        issue_description=ticket.issue_description,
        status="Pending"
    )
    
    # Log Audit Trail
    audit_log = models.AuditLog(
        asset_id=ticket.asset_id,
        user_id=current_user.id,
        action=f"Maintenance requested: {ticket.issue_description}"
    )
    
    db.add(new_ticket)
    db.add(audit_log)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("/my", response_model=list[schemas.MaintenanceOut])
def get_my_maintenance_tickets(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Fetch My Reports**
    Returns a list of maintenance tickets submitted by the authenticated user.
    """
    return db.query(models.Maintenance).filter(models.Maintenance.user_id == current_user.id).all()

@router.get("", response_model=list[schemas.MaintenanceOut])
@router.get("/", response_model=list[schemas.MaintenanceOut])
def list_maintenance_tickets(db: Session = Depends(get_db)):
    """
    **List all maintenance tickets (Admin/Manager)**
    """
    return db.query(models.Maintenance).order_by(models.Maintenance.id.desc()).all()

@router.put("/{ticket_id}", response_model=schemas.MaintenanceOut)
def update_maintenance_ticket(ticket_id: int, status: str, db: Session = Depends(get_db)):
    """
    **Update ticket status**
    Possible values: Pending, In Progress, Closed.
    """
    ticket = db.query(models.Maintenance).filter(models.Maintenance.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = status
    
    # If closed, mark asset as available again
    if status == "Closed":
        asset = db.query(models.Asset).filter(models.Asset.id == ticket.asset_id).first()
        if asset:
            asset.status = "Available"
            
    db.commit()
    db.refresh(ticket)
    return ticket
