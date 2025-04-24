#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Setting up development environment...${NC}"

# Check for Volta
if ! command -v volta &> /dev/null; then
  echo -e "${YELLOW}Volta not found. Installing...${NC}"
  curl https://get.volta.sh | bash
  export VOLTA_HOME="$HOME/.volta"
  export PATH="$VOLTA_HOME/bin:$PATH"
  echo -e "${GREEN}Volta installed successfully!${NC}"
fi

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
  echo -e "${YELLOW}pnpm not found. Installing via Volta...${NC}"
  volta install pnpm@8.12.1
  echo -e "${GREEN}pnpm installed successfully!${NC}"
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
pnpm install

# Install Python dependencies
echo -e "${GREEN}Installing Python dependencies...${NC}"
cd python
pip install -r requirements.txt
cd ..

# Set up Git hooks
echo -e "${GREEN}Setting up Git hooks...${NC}"
pnpm prepare

echo -e "${GREEN}Setup complete! You can now start developing.${NC}"
echo -e "To start the development server, run: ${YELLOW}pnpm dev${NC}"
echo -e "To run tests, run: ${YELLOW}pnpm test${NC}" 