# 🗄️ MapStore2 PostgreSQL Database Setup

This guide will help you set up MapStore2 with PostgreSQL database instead of the default H2 database.

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Port 8080 and 5432 available

## 🚀 Quick Start

### 1. Start MapStore2 with PostgreSQL

**Windows:**
```cmd
cd MapStore2
start-postgres.bat
```

**Linux/Mac:**
```bash
cd MapStore2
./start-postgres.sh
```

### 2. Verify Installation

**Check Database Connection:**
```cmd
check-database.bat
```

**Or manually:**
```cmd
docker exec -it postgres psql -U geostore -d geostore
```

## 🔧 Configuration Details

### Database Configuration

The PostgreSQL configuration is in:
- `docker/geostore-datasource-ovr-postgres.properties`

**Connection Details:**
- **Host:** localhost (or postgres container)
- **Port:** 5432
- **Database:** geostore
- **Username:** geostore
- **Password:** geostore
- **Schema:** geostore

### Docker Services

1. **PostgreSQL Database**
   - Container: `postgres`
   - Image: `geosolutions-mapstore/postgis`
   - Port: 5432
   - Data: Persistent volume `pg_data`

2. **MapStore2 Application**
   - Container: `mapstore`
   - Port: 8080
   - Depends on: PostgreSQL

3. **Nginx Proxy** (Optional)
   - Container: `proxy`
   - Port: 80
   - Routes traffic to MapStore2

## 📊 Database Schema

The database includes these main tables:
- `gs_user` - User accounts
- `gs_category` - Resource categories
- `gs_resource` - MapStore resources
- `gs_attribute` - Resource attributes
- `gs_security` - Security rules

## 🔍 Useful Commands

### Docker Commands

```cmd
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Check status
docker-compose ps
```

### Database Commands

```cmd
# Connect to database
docker exec -it postgres psql -U geostore -d geostore

# List tables
\dt

# List schemas
\dn

# Exit database
\q
```

### PostgreSQL Queries

```sql
-- Check users
SELECT * FROM geostore.gs_user;

-- Check resources
SELECT * FROM geostore.gs_resource;

-- Check categories
SELECT * FROM geostore.gs_category;
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port 5432 already in use**
   ```cmd
   # Check what's using the port
   netstat -ano | findstr :5432
   
   # Stop conflicting service or change port in docker-compose.yml
   ```

2. **Database connection failed**
   ```cmd
   # Check container status
   docker-compose ps
   
   # Check logs
   docker-compose logs postgres
   
   # Restart services
   docker-compose restart
   ```

3. **Insufficient memory**
   - Increase Docker memory limit
   - Close other applications

### Reset Database

To start with a fresh database:

```cmd
# Stop services
docker-compose down

# Remove volume
docker volume rm mapstore2_pg_data

# Start again
start-postgres.bat
```

## 🔐 Security Notes

- Default credentials are for development only
- Change passwords for production
- Consider using environment variables for sensitive data
- Enable SSL for production deployments

## 📈 Performance Tips

- PostgreSQL is much faster than H2 for production use
- Consider adding indexes for frequently queried columns
- Monitor database performance with:
  ```sql
  SELECT * FROM pg_stat_activity;
  ```

## 🌐 Access URLs

- **MapStore2:** http://localhost:8080
- **Database:** localhost:5432
- **Default Admin:** admin/admin

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running
3. Ensure ports are available
4. Check system resources

---

**✅ Your MapStore2 is now running with PostgreSQL!** 