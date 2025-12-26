from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, CheckConstraint, TIMESTAMP, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'admin' or 'employee'
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    employee = relationship("Employee", back_populates="user", uselist=False)

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    monthly_cost = Column(Numeric(12, 2), nullable=False)
    hours_per_month = Column(Integer, default=160)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User", back_populates="employee")
    time_entries = relationship("TimeEntry", back_populates="employee")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price_type = Column(String, nullable=False)  # 'fixed' or 'hourly'
    price_value = Column(Numeric(12, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    time_entries = relationship("TimeEntry", back_populates="project")

class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    entry_date = Column(Date, nullable=False)
    hours = Column(Numeric(5, 2), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    employee = relationship("Employee", back_populates="time_entries")
    project = relationship("Project", back_populates="time_entries")

