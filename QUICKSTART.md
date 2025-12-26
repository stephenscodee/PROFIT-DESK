# 🚀 Inicio Rápido - Profit Desk

Guía rápida para poner en marcha el sistema en 5 minutos.

## Prerrequisitos

1. **PostgreSQL instalado y corriendo**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Linux
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Python 3.8+ y pip**
3. **Node.js 16+ y npm**

## Paso 1: Configurar Base de Datos

```bash
# Crear base de datos
createdb profitdesk

# O usando psql
psql postgres
CREATE DATABASE profitdesk;
\q
```

## Paso 2: Configurar Backend

```bash
cd backend

# Crear entorno virtual (recomendado)
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cat > .env << EOF
DATABASE_URL=postgresql://$(whoami)@localhost:5432/profitdesk
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EOF

# Las tablas se crean automáticamente al iniciar el servidor
# O puedes ejecutar manualmente:
# psql profitdesk < schema.sql
```

## Paso 3: Iniciar Backend

```bash
# Desde el directorio backend
python run.py
```

El backend estará en `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## Paso 4: Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# (Opcional) Configurar URL de API
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
EOF
```

## Paso 5: Iniciar Frontend

```bash
npm run dev
```

El frontend estará en `http://localhost:5173`

## Paso 6: Primera Configuración

1. **Registrarse**: Ve a `http://localhost:5173/register`
   - Crea una cuenta de administrador

2. **Añadir Empleados**: 
   - Ve a "Empleados" → "+ Añadir Empleado"
   - Ejemplo: Nombre "Juan", Coste Mensual "2500", Horas/Mes "160"

3. **Añadir Proyectos**:
   - Ve a "Proyectos" → "+ Añadir Proyecto"
   - Ejemplo: Nombre "Cliente A", Tipo "Fijo", Precio "5000"

4. **Registrar Horas**:
   - Ve a "Horas" → "+ Registrar Horas"
   - Selecciona empleado, proyecto, fecha y horas trabajadas

5. **Ver Dashboard**:
   - Ve al Dashboard principal
   - Selecciona el mes actual
   - Verás los cálculos de rentabilidad con semáforos 🟢🟡🔴

## 🎯 Datos de Prueba (Opcional)

Puedes usar estos datos para probar el sistema:

**Empleados:**
- María: 2500€/mes, 160h
- Juan: 3000€/mes, 160h
- Ana: 2000€/mes, 160h

**Proyectos:**
- Cliente A: Fijo, 5000€/mes
- Cliente B: Por hora, 50€/h
- Cliente C: Fijo, 3000€/mes

**Horas (ejemplo para este mes):**
- María → Cliente A: 80h
- Juan → Cliente B: 100h
- Ana → Cliente C: 60h

## 🔧 Troubleshooting

### Error: "No module named 'app'"
- Asegúrate de estar en el directorio `backend/`
- Verifica que el entorno virtual esté activado

### Error: "Connection refused" en PostgreSQL
- Verifica que PostgreSQL esté corriendo: `pg_isready`
- Verifica las credenciales en `.env`

### Error CORS en frontend
- Verifica que el backend esté corriendo en el puerto 8000
- Verifica la configuración CORS en `backend/app/main.py`

### Error: "Cannot find module"
- Ejecuta `npm install` en el directorio `frontend/`
- Verifica que Node.js esté instalado: `node --version`

## 📚 Próximos Pasos

1. **Validar con clientes reales**: Usa Google Sheets primero (ver README.md)
2. **Personalizar umbrales**: Ajusta los porcentajes de semáforos en `backend/app/calculations.py`
3. **Añadir más funcionalidades**: Ver roadmap en README.md

## 💡 Tips

- Usa el selector de mes en el Dashboard para ver diferentes períodos
- Exporta a CSV para compartir reportes con clientes
- Los cálculos se actualizan automáticamente al añadir/modificar horas

