@echo off
echo 🚀 Starting MapStore2 with PostgreSQL Database...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service status
echo 📊 Checking service status...
docker-compose ps

echo.
echo ✅ MapStore2 with PostgreSQL is starting up!
echo.
echo 🌐 Access MapStore2 at: http://localhost:8080
echo 🗄️ PostgreSQL Database: localhost:5432
echo    - Database: geostore
echo    - Username: geostore
echo    - Password: geostore
echo.
echo 📋 Useful commands:
echo    - View logs: docker-compose logs -f
echo    - Stop services: docker-compose down
echo    - Restart services: docker-compose restart
echo.
echo 🔍 To check database connection:
echo    docker exec -it postgres psql -U geostore -d geostore
echo.
pause 