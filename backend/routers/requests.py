from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/api/requests",
    tags=["Asset Requests"],
)

@router.post("/", response_model=schemas.AssetRequestOut, status_code=201)
def create_asset_request(request: schemas.AssetRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Submit an asset request**
    Allows employees to request new hardware or furniture.
    """
    new_request = models.AssetRequest(
        user_id=current_user.id,
        asset_type=request.asset_type,
        reason=request.reason,
        status="Pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/", response_model=list[schemas.AssetRequestOut])
def list_all_requests(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **List all requests (Admin/Manager)**
    """
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.AssetRequest).order_by(models.AssetRequest.request_date.desc()).all()

@router.get("/my", response_model=list[schemas.AssetRequestOut])
def list_my_requests(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **List my own requests**
    """
    return db.query(models.AssetRequest).filter(models.AssetRequest.user_id == current_user.id).order_by(models.AssetRequest.request_date.desc()).all()

@router.put("/{request_id}/status", response_model=schemas.AssetRequestOut)
def update_request_status(request_id: int, status: str, rejection_reason: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Approve/Reject Request (Admin/Manager)**
    """
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    req = db.query(models.AssetRequest).filter(models.AssetRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    req.status = status
    if status == "Rejected":
        req.rejection_reason = rejection_reason
        
    db.commit()
    db.refresh(req)
    return req
