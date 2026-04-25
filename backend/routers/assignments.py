from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/api/assignments",
    tags=["Assignments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.AssignmentOut, status_code=201)
def assign_asset(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Assign an asset safely**
    Ensures the asset is 'Available', creates an assignment record, and updates asset status.
    """
    asset = db.query(models.Asset).filter(models.Asset.id == assignment.asset_id).first()
    if not asset or asset.status != "Available":
        raise HTTPException(status_code=400, detail="Asset is not available or does not exist")
        
    user = db.query(models.User).filter(models.User.id == assignment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_assignment = models.Assignment(
        user_id=assignment.user_id,
        asset_id=assignment.asset_id
    )
    
    asset.status = "Assigned"

    # Log Audit Trail
    audit_log = models.AuditLog(
        asset_id=assignment.asset_id,
        user_id=assignment.user_id,
        action=f"Asset assigned to user {assignment.user_id}"
    )
    
    db.add(new_assignment)
    db.add(audit_log)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

@router.put("/{assignment_id}/return", response_model=schemas.AssignmentOut)
def return_asset(assignment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Return an asset**
    Marks an active assignment as completed and frees up the asset.
    """
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id, models.Assignment.return_date == None).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Active assignment not found")
        
    from sqlalchemy.sql import func
    assignment.return_date = func.now()
    
    asset = db.query(models.Asset).filter(models.Asset.id == assignment.asset_id).first()
    if asset:
        asset.status = "Available"
        # Log Audit Trail
        audit_log = models.AuditLog(
            asset_id=asset.id,
            user_id=current_user.id,
            action="Asset returned and marked Available"
        )
        db.add(audit_log)
        
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/", response_model=list[schemas.AssignmentOut])
def read_assignments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    **View all assignments**
    Returns a list of all assignment records.
    """
    return db.query(models.Assignment).offset(skip).limit(limit).all()
