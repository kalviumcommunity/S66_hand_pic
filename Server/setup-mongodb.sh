#!/bin/bash

echo "🔧 Setting up MongoDB locally..."

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is already installed"
else
    echo "📦 Installing MongoDB..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew tap mongodb/brew
            brew install mongodb-community
        else
            echo "❌ Homebrew not found. Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y mongodb
    else
        echo "❌ Unsupported OS. Please install MongoDB manually."
        exit 1
    fi
fi

# Start MongoDB service
echo "🚀 Starting MongoDB service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start mongodb-community
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
fi

# Check if MongoDB is running
sleep 3
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running successfully!"
    echo "🌐 You can now start your server with: npm start"
else
    echo "❌ Failed to start MongoDB. Please check the installation."
fi
