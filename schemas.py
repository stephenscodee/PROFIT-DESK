from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List

# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "admin"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Employee schemas
class EmployeeBase(BaseModel):
    name: str
    monthly_cost: Decimal
    hours_per_month: int = 160

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    monthly_cost: Optional[Decimal] = None
    hours_per_month: Optional[int] = None

class Employee(EmployeeBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    name: str
    price_type: str  # 'fixed' or 'hourly'
    price_value: Decimal

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    price_type: Optional[str] = None
    price_value: Optional[Decimal] = None

class Project(ProjectBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Time Entry schemas
class TimeEntryBase(BaseModel):
    employee_id: int
    project_id: int
    entry_date: date
    hours: Decimal
    note: Optional[str] = None

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(BaseModel):
    employee_id: Optional[int] = None
    project_id: Optional[int] = None
    entry_date: Optional[date] = None
    hours: Optional[Decimal] = None
    note: Optional[str] = None

class TimeEntry(TimeEntryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Report schemas
class ProjectReport(BaseModel):
    id: int
    name: str
    hours: Decimal
    cost: Decimal
    revenue: Decimal
    margin: Decimal
    status: str  # 'green', 'yellow', 'red'

class EmployeeReport(BaseModel):
    id: int
    name: str
    monthly_cost: Decimal
    revenue_attributed: Decimal
    margin: Decimal
    status: str  # 'green', 'yellow', 'red'

class SummaryReport(BaseModel):
    month: str
    total_profit: Decimal
    projects: List[ProjectReport]
    employees: List[EmployeeReport]

