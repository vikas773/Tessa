from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import models, schemas, auth, io, csv
from database import get_db

router = APIRouter(
    prefix="/api/assets",
    tags=["Assets"],
    responses={404: {"description": "Asset not found"}},
)

@router.post("/", response_model=schemas.AssetOut, status_code=201)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    """
    **Add a new asset**
    Database Action: INSERT a new row into assets table with name, type, serial_number, purchase_date, status='Available'.
    """
    new_asset = models.Asset(**asset.model_dump())
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

@router.get("/", response_model=list[schemas.AssetOut])
def read_assets(
    search: str = Query(None),
    asset_type: str = Query(None, alias="type"),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    **View and Filter Assets**
    Supports searching by name/serial and filtering by type/status.
    """
    query = db.query(models.Asset)
    
    if search:
        query = query.filter(
            (models.Asset.name.ilike(f"%{search}%")) | 
            (models.Asset.serial_number.ilike(f"%{search}%"))
        )
    if asset_type:
        query = query.filter(models.Asset.type == asset_type)
    if status:
        query = query.filter(models.Asset.status == status)
        
    return query.all()

@router.get("/export/csv")
def export_assets_csv(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **Export Assets to CSV**
    Generates a downloadable CSV report of all assets in the system.
    """
    assets = db.query(models.Asset).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Type", "Serial Number", "Status", "Value"])
    
    for asset in assets:
        writer.writerow([asset.id, asset.name, asset.type, asset.serial_number, asset.status, asset.value])
        
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tessa_assets_report.csv"}
    )

@router.get("/my", response_model=list[schemas.AssetOut])
def get_my_assets(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    **View My Assigned Assets**
    Returns a list of assets currently assigned to the authenticated user.
    """
    assignments = db.query(models.Assignment).filter(
        models.Assignment.user_id == current_user.id,
        models.Assignment.return_date == None
    ).all()
    
    asset_ids = [a.asset_id for a in assignments]
    if not asset_ids:
        return []
        
    return db.query(models.Asset).filter(models.Asset.id.in_(asset_ids)).all()

@router.get("/{asset_id}", response_model=schemas.AssetOut)
def read_asset(asset_id: int, db: Session = Depends(get_db)):
    """
    **View single asset details**
    Database Action: SELECT row from assets table WHERE id = given id.
    """
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    """
    **Delete asset**
    Database Action: DELETE row from assets table WHERE id = given id.
    """
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
    return {"message": "Asset successfully deleted"}

@router.put("/{asset_id}", response_model=schemas.AssetOut)
def update_asset(asset_id: int, asset_update: schemas.AssetUpdate, db: Session = Depends(get_db)):
    """
    **Update asset details**
    Database Action: UPDATE assets table SET name, type, serial_number, or status WHERE id = given id.
    """
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    update_data = asset_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.put("/{asset_id}/mark-broken", response_model=schemas.AssetOut)
def mark_asset_broken(asset_id: int, db: Session = Depends(get_db)):
    """
    **Mark asset as broken**
    Database Action: UPDATE assets table SET status = 'Broken' WHERE id = given id.
    """
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset.status = "Broken"
    db.commit()
    db.refresh(asset)
    return asset
