#!/bin/bash

# Chrome Installation Script for GitHub Codespaces
# This script installs Chrome/Chromium for PDF generation in Dawn's Codespace

echo "🚀 Installing Chrome for PDF generation in Codespaces..."

# Check if running in Codespaces
if [ "$CODESPACES" != "true" ]; then
    echo "⚠️  This script is designed for GitHub Codespaces"
    echo "💡 For local installation, please install Chrome manually"
    exit 1
fi

# Update package lists
echo "📦 Updating package lists..."
sudo apt-get update

# Install Chrome dependencies
echo "🔧 Installing Chrome dependencies..."
sudo apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    software-properties-common

# Add Chrome repository
echo "📡 Adding Chrome repository..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# Update package lists again
echo "🔄 Updating package lists with Chrome repository..."
sudo apt-get update

# Install Chrome
echo "🌐 Installing Google Chrome..."
sudo apt-get install -y google-chrome-stable

# Verify installation
echo "✅ Verifying Chrome installation..."
if command -v google-chrome &> /dev/null; then
    echo "✅ Chrome installed successfully!"
    google-chrome --version
    
    # Test Chrome with headless mode
    echo "🧪 Testing Chrome headless mode..."
    google-chrome --headless --disable-gpu --dump-dom https://www.google.com > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Chrome headless mode working!"
    else
        echo "⚠️  Chrome headless mode test failed, but Chrome is installed"
    fi
    
else
    echo "❌ Chrome installation failed"
    echo "🔧 Trying alternative: Installing Chromium..."
    
    # Fallback to Chromium
    sudo apt-get install -y chromium-browser
    
    if command -v chromium-browser &> /dev/null; then
        echo "✅ Chromium installed successfully!"
        chromium-browser --version
    else
        echo "❌ Both Chrome and Chromium installation failed"
        echo "💡 You can still use the HTML fallback for manual PDF conversion"
        exit 1
    fi
fi

echo ""
echo "🎉 Chrome/Chromium installation complete!"
echo ""
echo "📋 You can now use:"
echo "   node scripts/generate-pdf-simple.js output/dawn-ekg-cv-2025-08-03.md"
echo "   pnpm run generate:pdf"
echo ""
echo "✨ PDF generation should now work automatically!"