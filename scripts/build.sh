#!/bin/bash
set -e

# Function to build a package
build_package() {
  local package=$1
  echo "Building @dzb-cv/$package..."
  cd "packages/$package"
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies for @dzb-cv/$package..."
    pnpm install
  fi
  
  # Run build
  pnpm run build
  cd ../..
}

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf packages/*/dist

# Build packages in dependency order
echo "Building packages..."

# 1. Build types package first (no dependencies)
build_package "types"

# 2. Build testing package (depends on types)
build_package "testing"

# 3. Build core package (depends on types and testing)
build_package "core"

# 4. Build remaining packages in parallel
echo "Building remaining packages..."
for pkg in templates cli; do
  if [ -d "packages/$pkg" ]; then
    build_package "$pkg" &
  fi
done

# Wait for all parallel builds to complete
wait

echo "Build complete!"
