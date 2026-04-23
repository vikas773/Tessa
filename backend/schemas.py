from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "Employee"

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None

class AssetCreate(BaseModel):
    name: str
    type: str
    serial_number: str
    purchase_date: Optional[datetime] = None

class AssetOut(BaseModel):
    id: int
    name: str
    type: str
    serial_number: Optional[str] = None
    purchase_date: Optional[datetime] = None
    status: str
    class Config:
        from_attributes = True

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None

# Assignments
class AssignmentCreate(BaseModel):
    user_id: int
    asset_id: int

class AssignmentOut(BaseModel):
    id: int
    user_id: int
    asset_id: int
    assigned_date: datetime
    return_date: Optional[datetime] = None
    class Config:
        from_attributes = True

# Maintenance
class MaintenanceCreate(BaseModel):
    asset_id: int
    issue_description: str

class MaintenanceOut(BaseModel):
    id: int
    asset_id: int
    user_id: int
    issue_description: str
    status: str
    class Config:
        from_attributes = True

# Dashboard
class DashboardStats(BaseModel):
    total_assets: int
    assigned_assets: int
    available_assets: int
    maintenance_assets: int

# Audit Logs
class AuditLogOut(BaseModel):
    id: int
    action: str
    user_id: Optional[int]
    asset_id: Optional[int]
    timestamp: datetime
    class Config:
        from_attributes = True

# Asset Requests
class AssetRequestCreate(BaseModel):
    asset_type: str
    reason: Optional[str] = None

class AssetRequestOut(BaseModel):
    id: int
    user_id: int
    asset_type: str
    reason: Optional[str]
    status: str
    request_date: datetime
    class Config:
        from_attributes = True
