# Profit Desk Backend

API REST para gestión de rentabilidad de empleados y proyectos.

## Setup

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

3. Crear base de datos:
```bash
createdb profitdesk
```

4. Ejecutar servidor:
```bash
python run.py
```

La API estará disponible en `http://localhost:8000`

## Documentación

Una vez ejecutando, la documentación interactiva está en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints principales

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login
- `GET /employees` - Listar empleados
- `POST /employees` - Crear empleado
- `GET /projects` - Listar proyectos
- `POST /projects` - Crear proyecto
- `GET /time-entries` - Listar entradas de tiempo
- `POST /time-entries` - Crear entrada de tiempo
- `GET /report/summary?month=YYYY-MM` - Resumen del mes
- `GET /export/csv?month=YYYY-MM` - Exportar CSV

