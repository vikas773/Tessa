from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String(50), default="Employee")  # Admin, Manager, Employee
    status = Column(String(50), default="Active")  # Active, Inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    type = Column(String(100))
    serial_number = Column(String(100), unique=True, index=True)
    purchase_date = Column(DateTime)
    status = Column(String(50), default="Available")  # Available, Assigned, Broken

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)  # No hard FK constraints per guidelines
    asset_id = Column(Integer)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now())
    return_date = Column(DateTime(timezone=True), nullable=True)

class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer)
    user_id = Column(Integer)
    issue_description = Column(Text, nullable=False)
    status = Column(String(50), default="Open")  # Open, Closed

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(200), nullable=False)
    user_id = Column(Integer, nullable=True)
    asset_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AuthLog(Base):
    __tablename__ = "auth_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    logout_timestamp = Column(DateTime(timezone=True), server_default=func.now())
