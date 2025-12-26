from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app import models
from typing import List, Tuple

def calculate_hourly_cost(monthly_cost: Decimal, hours_per_month: int) -> Decimal:
    """Calcula el coste por hora de un empleado"""
    if hours_per_month == 0:
        return Decimal(0)
    return monthly_cost / Decimal(hours_per_month)

def get_time_entries_for_month(db: Session, year: int, month: int) -> List[models.TimeEntry]:
    """Obtiene todas las entradas de tiempo para un mes específico"""
    return db.query(models.TimeEntry).filter(
        extract('year', models.TimeEntry.entry_date) == year,
        extract('month', models.TimeEntry.entry_date) == month
    ).all()

def calculate_project_costs(db: Session, project_id: int, year: int, month: int) -> Decimal:
    """Calcula el coste total de un proyecto en un mes"""
    entries = db.query(models.TimeEntry).join(models.Employee).filter(
        models.TimeEntry.project_id == project_id,
        extract('year', models.TimeEntry.entry_date) == year,
        extract('month', models.TimeEntry.entry_date) == month
    ).all()
    
    total_cost = Decimal(0)
    for entry in entries:
        hourly_cost = calculate_hourly_cost(
            entry.employee.monthly_cost,
            entry.employee.hours_per_month
        )
        total_cost += entry.hours * hourly_cost
    
    return total_cost

def calculate_project_revenue(project: models.Project, year: int, month: int, db: Session) -> Decimal:
    """Calcula los ingresos de un proyecto en un mes"""
    if project.price_type == "fixed":
        return project.price_value
    else:  # hourly
        # Suma las horas facturables del mes
        total_hours = db.query(func.sum(models.TimeEntry.hours)).filter(
            models.TimeEntry.project_id == project.id,
            extract('year', models.TimeEntry.entry_date) == year,
            extract('month', models.TimeEntry.entry_date) == month
        ).scalar() or Decimal(0)
        return total_hours * project.price_value

def calculate_project_margin(revenue: Decimal, cost: Decimal) -> Decimal:
    """Calcula el margen de un proyecto"""
    return revenue - cost

def get_project_status(margin: Decimal, revenue: Decimal) -> str:
    """Determina el estado del proyecto (semáforo)"""
    if revenue == 0:
        return "red"
    margin_percentage = (margin / revenue) * 100
    if margin_percentage >= 15:
        return "green"
    elif margin_percentage >= 0:
        return "yellow"
    else:
        return "red"

def calculate_employee_revenue_attributed(
    db: Session, 
    employee_id: int, 
    year: int, 
    month: int
) -> Decimal:
    """Calcula los ingresos atribuidos a un empleado en un mes"""
    # Obtener todas las entradas del empleado en el mes
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.employee_id == employee_id,
        extract('year', models.TimeEntry.entry_date) == year,
        extract('month', models.TimeEntry.entry_date) == month
    ).all()
    
    total_revenue = Decimal(0)
    
    for entry in entries:
        project = entry.project
        # Calcular ingresos del proyecto en el mes
        project_revenue = calculate_project_revenue(project, year, month, db)
        
        # Calcular total de horas del proyecto en el mes
        project_total_hours = db.query(func.sum(models.TimeEntry.hours)).filter(
            models.TimeEntry.project_id == project.id,
            extract('year', models.TimeEntry.entry_date) == year,
            extract('month', models.TimeEntry.entry_date) == month
        ).scalar() or Decimal(0)
        
        if project_total_hours > 0:
            # Atribuir ingresos proporcionalmente a las horas del empleado
            employee_share = entry.hours / project_total_hours
            total_revenue += project_revenue * employee_share
    
    return total_revenue

def calculate_employee_margin(
    revenue_attributed: Decimal,
    monthly_cost: Decimal
) -> Decimal:
    """Calcula el margen de un empleado"""
    return revenue_attributed - monthly_cost

def get_employee_status(margin: Decimal, monthly_cost: Decimal) -> str:
    """Determina el estado del empleado (semáforo)"""
    if monthly_cost == 0:
        return "green"
    
    margin_percentage = (margin / monthly_cost) * 100
    
    if margin_percentage >= 10:
        return "green"
    elif margin_percentage >= -10:
        return "yellow"
    else:
        return "red"

