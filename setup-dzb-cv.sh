#!/bin/bash

# DZB-CV Automated Setup Script
# This script automates the entire setup process for the DZB-CV project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js >= 20.10.0"
        exit 1
    fi
    
    local node_version
    node_version=$(node --version | sed 's/v//')
    local required_version="20.10.0"
    
    if ! printf '%s\n%s\n' "$required_version" "$node_version" | sort -V -C; then
        print_error "Node.js version $node_version is too old. Please install Node.js >= $required_version"
        exit 1
    fi
    
    print_success "Node.js version $node_version is supported"
}

# Function to check pnpm version
check_pnpm_version() {
    if ! command_exists pnpm; then
        print_warning "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
    fi
    
    local pnpm_version
    pnpm_version=$(pnpm --version)
    local required_version="10.9.0"
    
    if ! printf '%s\n%s\n' "$required_version" "$pnpm_version" | sort -V -C; then
        print_warning "pnpm version $pnpm_version might be too old. Recommended: >= $required_version"
    fi
    
    print_success "pnpm version $pnpm_version is available"
}

# Main setup function
main() {
    print_status "🚀 Starting DZB-CV automated setup..."
    echo
    
    # Check system requirements
    print_status "📋 Checking system requirements..."
    check_node_version
    check_pnpm_version
    echo
    
    # Install dependencies
    print_status "📦 Installing dependencies..."
    if pnpm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    echo
    
    # Build all packages
    print_status "🏗️  Building all packages..."
    if pnpm run build; then
        print_success "All packages built successfully"
    else
        print_error "Failed to build packages"
        exit 1
    fi
    echo
    
    # Test the CLI
    print_status "🧪 Testing CLI functionality..."
    if node packages/cli/dist/index.js --help >/dev/null 2>&1; then
        print_success "CLI is working correctly"
    else
        print_error "CLI test failed"
        exit 1
    fi
    echo
    
    # Optional: Link CLI globally
    read -p "$(echo -e "${BLUE}[QUESTION]${NC} Do you want to link the CLI globally for easier access? (y/N): ")" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "🔗 Linking CLI globally..."
        cd packages/cli
        
        # Check if we need sudo
        if npm link >/dev/null 2>&1; then
            print_success "CLI linked globally successfully"
            print_status "You can now use 'cv' command from anywhere!"
        else
            print_warning "Linking requires elevated permissions. Trying with sudo..."
            if sudo npm link; then
                print_success "CLI linked globally with sudo"
                print_status "You can now use 'cv' command from anywhere!"
            else
                print_error "Failed to link CLI globally"
                print_status "You can still use: node packages/cli/dist/index.js [command]"
            fi
        fi
        cd ../..
    else
        print_status "Skipping global CLI linking"
        print_status "You can use: node packages/cli/dist/index.js [command]"
    fi
    echo
    
    # Run a quick test
    print_status "🎯 Running a quick test..."
    if node packages/cli/dist/index.js create --name "Test User" --email "test@example.com" >/dev/null 2>&1; then
        print_success "Test CV creation successful"
    else
        print_warning "Test CV creation had issues (this might be normal)"
    fi
    echo
    
    # Final success message
    print_success "🎉 DZB-CV setup completed successfully!"
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                SETUP COMPLETE                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}Quick Start Commands:${NC}"
    
    if command_exists cv 2>/dev/null; then
        echo -e "  ${YELLOW}cv create --name \"Your Name\" --email \"your@email.com\"${NC}"
        echo -e "  ${YELLOW}cv --help${NC}"
    else
        echo -e "  ${YELLOW}node packages/cli/dist/index.js create --name \"Your Name\" --email \"your@email.com\"${NC}"
        echo -e "  ${YELLOW}node packages/cli/dist/index.js --help${NC}"
    fi
    echo
    echo -e "${BLUE}Development Commands:${NC}"
    echo -e "  ${YELLOW}pnpm test${NC}          # Run tests"
    echo -e "  ${YELLOW}pnpm run lint${NC}      # Check code style"  
    echo -e "  ${YELLOW}pnpm run build${NC}     # Rebuild packages"
    echo
    echo -e "${BLUE}Documentation:${NC}"
    echo -e "  ${YELLOW}USAGE.md${NC}           # Comprehensive usage guide"
    echo -e "  ${YELLOW}README.md${NC}          # Project overview"
    echo
}

# Run the main function
main "$@"
