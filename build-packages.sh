#!/bin/bash

# Build packages in the correct order
echo "Building packages..."

# First build foundation packages
echo "Building foundation packages..."
for pkg in types config utils; do
  if [ -d "packages/$pkg" ]; then
    echo "Building @dzb-cv/$pkg..."
    cd "packages/$pkg"
    npm run build
    cd ../..
  fi
done

# Then build testing package
echo "Building @dzb-cv/testing..."
cd packages/testing
npm run build
cd ../..

# Then build core package
echo "Building @dzb-cv/core..."
cd packages/core
npm run build
cd ../..

# Build remaining packages
for pkg in cli pdf templates; do
  if [ -d "packages/$pkg" ]; then
    echo "Building @dzb-cv/$pkg..."
    cd "packages/$pkg"
    npm run build
    cd ../..
  fi
done

echo "Build complete."
