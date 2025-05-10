#!/bin/bash
# Migration script for refactoring the project structure

# Create new directory structure
echo "Creating new directory structure..."
mkdir -p src/{core/{types,services,utils/__tests__},commands/__tests__,cli}
mkdir -p src/core/types/__tests__
mkdir -p src/core/services/__tests__

# Create placeholder files to maintain structure in git
touch src/core/types/.gitkeep
touch src/core/services/.gitkeep
touch src/core/utils/.gitkeep
touch src/commands/.gitkeep
touch src/cli/.gitkeep

echo "Directory structure created successfully."

# Reminder for next steps
echo "Next steps:"
echo "1. Run 'chmod +x migrate.sh && ./migrate.sh' to execute this script"
echo "2. Update tsconfig.json with path mappings"
echo "3. Create vitest.config.ts"
echo "4. Begin migrating types from shared/types to core/types"

