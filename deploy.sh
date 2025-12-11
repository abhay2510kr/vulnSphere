#!/bin/bash
set -e

echo "🚀 Deploying VulnSphere..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

# Build and start services
echo "🏗️ Building and starting services..."
docker compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ VulnSphere is ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8000/api/v1"
echo "📋 Admin: http://localhost:8000/admin"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@vulnsphere.com"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📚 API Documentation: http://localhost:8000/api/docs"
