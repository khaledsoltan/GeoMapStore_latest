@echo off
echo 🔍 Checking PostgreSQL Database Connection...

echo.
echo 📊 Database Information:
echo    Host: localhost
echo    Port: 5432
echo    Database: geostore
echo    Username: geostore
echo    Password: geostore
echo.

echo 🧪 Testing connection...
docker exec -it postgres psql -U geostore -d geostore -c "\dt" 2>nul
if errorlevel 1 (
    echo ❌ Database connection failed!
    echo.
    echo 🔧 Troubleshooting steps:
    echo    1. Make sure Docker containers are running: docker-compose ps
    echo    2. Check container logs: docker-compose logs postgres
    echo    3. Restart services: docker-compose restart
    echo.
) else (
    echo ✅ Database connection successful!
    echo.
    echo 📋 Available tables:
    docker exec -it postgres psql -U geostore -d geostore -c "\dt"
    echo.
)

echo 🔍 To connect to database manually:
echo    docker exec -it postgres psql -U geostore -d geostore
echo.
pause 