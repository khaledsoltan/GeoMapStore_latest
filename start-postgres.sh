#!/bin/bash

echo "🚀 Starting MapStore2 with PostgreSQL Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove existing volumes (optional - uncomment if you want fresh database)
# echo "🗑️ Removing existing database volumes..."
# docker volume rm mapstore2_pg_data

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ MapStore2 with PostgreSQL is starting up!"
echo ""
echo "🌐 Access MapStore2 at: http://localhost:8080"
echo "🗄️ PostgreSQL Database: localhost:5432"
echo "   - Database: geostore"
echo "   - Username: geostore"
echo "   - Password: geostore"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo ""
echo "🔍 To check database connection:"
echo "   docker exec -it postgres psql -U geostore -d geostore" 