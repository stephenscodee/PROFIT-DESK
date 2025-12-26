from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from datetime import datetime, date
from typing import List, Optional
import csv
import io

from app.database import get_db, engine, Base
from app import models, schemas
from app.auth import (
    authenticate_user, 
    create_access_token, 
    get_current_user, 
    get_current_admin_user,
    get_password_hash
)
from app.calculations import (
    calculate_project_costs,
    calculate_project_revenue,
    calculate_project_margin,
    get_project_status,
    calculate_employee_revenue_attributed,
    calculate_employee_margin,
    get_employee_status
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Profit Desk API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/auth/register", response_model=schemas.Token)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = models.User(
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create token
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Employee endpoints
@app.get("/employees", response_model=List[schemas.Employee])
def get_employees(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Employee).all()

@app.post("/employees", response_model=schemas.Employee)
def create_employee(
    employee: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(
    employee_id: int,
    employee: schemas.EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = employee.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted"}

# Project endpoints
@app.get("/projects", response_model=List[schemas.Project])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Project).all()

@app.post("/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.put("/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted"}

# Time Entry endpoints
@app.get("/time-entries", response_model=List[schemas.TimeEntry])
def get_time_entries(
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.TimeEntry)
    
    if month:
        year, month_num = map(int, month.split("-"))
        query = query.filter(
            extract('year', models.TimeEntry.entry_date) == year,
            extract('month', models.TimeEntry.entry_date) == month_num
        )
    
    return query.order_by(models.TimeEntry.entry_date.desc()).all()

@app.post("/time-entries", response_model=schemas.TimeEntry)
def create_time_entry(
    time_entry: schemas.TimeEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_entry = models.TimeEntry(**time_entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.put("/time-entries/{entry_id}", response_model=schemas.TimeEntry)
def update_time_entry(
    entry_id: int,
    time_entry: schemas.TimeEntryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_entry = db.query(models.TimeEntry).filter(models.TimeEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    update_data = time_entry.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_entry, field, value)
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.delete("/time-entries/{entry_id}")
def delete_time_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_entry = db.query(models.TimeEntry).filter(models.TimeEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    db.delete(db_entry)
    db.commit()
    return {"message": "Time entry deleted"}

# Report endpoints
@app.get("/report/summary", response_model=schemas.SummaryReport)
def get_summary_report(
    month: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    year, month_num = map(int, month.split("-"))
    summary_data = _generate_summary_report_data(db, year, month_num)
    
    return schemas.SummaryReport(
        month=month,
        total_profit=summary_data["total_profit"],
        projects=summary_data["projects"],
        employees=summary_data["employees"]
    )

@app.get("/report/employee/{employee_id}")
def get_employee_report(
    employee_id: int,
    month: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    year, month_num = map(int, month.split("-"))
    
    revenue_attributed = calculate_employee_revenue_attributed(
        db, employee_id, year, month_num
    )
    margin = calculate_employee_margin(revenue_attributed, employee.monthly_cost)
    status = get_employee_status(margin, employee.monthly_cost)
    
    return {
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "monthly_cost": employee.monthly_cost,
            "hours_per_month": employee.hours_per_month
        },
        "month": month,
        "revenue_attributed": revenue_attributed,
        "margin": margin,
        "status": status
    }

@app.get("/report/project/{project_id}")
def get_project_report(
    project_id: int,
    month: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    year, month_num = map(int, month.split("-"))
    
    cost = calculate_project_costs(db, project_id, year, month_num)
    revenue = calculate_project_revenue(project, year, month_num, db)
    margin = calculate_project_margin(revenue, cost)
    status = get_project_status(margin, revenue)
    
    # Get breakdown by employee
    entries = db.query(models.TimeEntry).join(models.Employee).filter(
        models.TimeEntry.project_id == project_id,
        extract('year', models.TimeEntry.entry_date) == year,
        extract('month', models.TimeEntry.entry_date) == month_num
    ).all()
    
    breakdown = []
    for entry in entries:
        hourly_cost = entry.employee.monthly_cost / entry.employee.hours_per_month
        breakdown.append({
            "employee_id": entry.employee.id,
            "employee_name": entry.employee.name,
            "hours": entry.hours,
            "cost": entry.hours * hourly_cost,
            "percentage": 0  # Will calculate below
        })
    
    total_hours = sum(b["hours"] for b in breakdown)
    for item in breakdown:
        if total_hours > 0:
            item["percentage"] = (item["hours"] / total_hours) * 100
    
    return {
        "project": {
            "id": project.id,
            "name": project.name,
            "price_type": project.price_type,
            "price_value": project.price_value
        },
        "month": month,
        "hours": total_hours,
        "cost": cost,
        "revenue": revenue,
        "margin": margin,
        "status": status,
        "breakdown": breakdown
    }

# Helper function to generate summary report data
def _generate_summary_report_data(db: Session, year: int, month_num: int):
    """Helper function to generate summary report data (used by both endpoint and CSV export)"""
    # Get all projects
    projects = db.query(models.Project).all()
    project_reports = []
    
    for project in projects:
        cost = calculate_project_costs(db, project.id, year, month_num)
        revenue = calculate_project_revenue(project, year, month_num, db)
        margin = calculate_project_margin(revenue, cost)
        status = get_project_status(margin, revenue)
        
        # Calculate total hours
        total_hours = db.query(func.sum(models.TimeEntry.hours)).filter(
            models.TimeEntry.project_id == project.id,
            extract('year', models.TimeEntry.entry_date) == year,
            extract('month', models.TimeEntry.entry_date) == month_num
        ).scalar() or 0
        
        project_reports.append(schemas.ProjectReport(
            id=project.id,
            name=project.name,
            hours=total_hours,
            cost=cost,
            revenue=revenue,
            margin=margin,
            status=status
        ))
    
    # Get all employees
    employees = db.query(models.Employee).all()
    employee_reports = []
    
    for employee in employees:
        revenue_attributed = calculate_employee_revenue_attributed(
            db, employee.id, year, month_num
        )
        margin = calculate_employee_margin(revenue_attributed, employee.monthly_cost)
        status = get_employee_status(margin, employee.monthly_cost)
        
        employee_reports.append(schemas.EmployeeReport(
            id=employee.id,
            name=employee.name,
            monthly_cost=employee.monthly_cost,
            revenue_attributed=revenue_attributed,
            margin=margin,
            status=status
        ))
    
    # Calculate total profit
    total_profit = sum(pr.margin for pr in project_reports)
    
    return {
        "total_profit": total_profit,
        "projects": project_reports,
        "employees": employee_reports
    }

# Export CSV
@app.get("/export/csv")
def export_csv(
    month: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    year, month_num = map(int, month.split("-"))
    
    # Get summary report data
    summary_data = _generate_summary_report_data(db, year, month_num)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Profit Desk Export", f"Month: {month}"])
    writer.writerow([])
    
    # Write summary
    writer.writerow(["SUMMARY"])
    writer.writerow(["Total Profit", summary_data["total_profit"]])
    writer.writerow([])
    
    # Write projects
    writer.writerow(["PROJECTS"])
    writer.writerow(["Name", "Hours", "Cost", "Revenue", "Margin", "Status"])
    for project in summary_data["projects"]:
        writer.writerow([
            project.name,
            project.hours,
            project.cost,
            project.revenue,
            project.margin,
            project.status
        ])
    writer.writerow([])
    
    # Write employees
    writer.writerow(["EMPLOYEES"])
    writer.writerow(["Name", "Monthly Cost", "Revenue Attributed", "Margin", "Status"])
    for employee in summary_data["employees"]:
        writer.writerow([
            employee.name,
            employee.monthly_cost,
            employee.revenue_attributed,
            employee.margin,
            employee.status
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=profitdesk_{month}.csv"}
    )

@app.get("/")
def root():
    return {"message": "Profit Desk API", "version": "1.0.0"}

