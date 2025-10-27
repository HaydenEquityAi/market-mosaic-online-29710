#!/bin/bash

# Financial Market Backend Setup Script

echo "🚀 Starting Financial Market Backend Setup..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server"
else
    echo "✅ .env file exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check if using Docker
echo ""
read -p "Do you want to use Docker for PostgreSQL and Redis? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi

    echo "🐳 Starting Docker containers..."
    docker-compose up -d postgres redis

    echo "⏳ Waiting for database to be ready..."
    sleep 10

    echo "✅ Docker containers started"
else
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed."
    fi

    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        echo "⚠️  Redis CLI not found. Make sure Redis is installed."
    fi

    echo "⚠️  Please ensure PostgreSQL and Redis are running manually."
    echo ""
    read -p "Press enter to continue..."
fi

# Setup database
echo ""
read -p "Do you want to set up the database schema? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name (default: financial_market_db): " DB_NAME
    DB_NAME=${DB_NAME:-financial_market_db}

    echo "🗄️  Creating database and schema..."
    
    if command -v psql &> /dev/null; then
        createdb $DB_NAME 2>/dev/null
        psql -d $DB_NAME -f src/config/schema.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Database schema created"
        else
            echo "⚠️  Database schema may already exist or there was an error"
        fi
    else
        echo "⚠️  Please run this manually:"
        echo "   createdb $DB_NAME"
        echo "   psql -d $DB_NAME -f src/config/schema.sql"
    fi
fi

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Summary
echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your API keys and configuration"
echo "   2. Make sure PostgreSQL and Redis are running"
echo "   3. Run 'npm run dev' to start the development server"
echo "   4. Visit http://localhost:3010/health to check if the server is running"
echo ""
echo "📚 Documentation: See README.md for more information"
echo ""
