#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"

# Make Python scripts executable
chmod +x "$SCRIPT_DIR/reorganize_assets.py"
chmod +x "$SCRIPT_DIR/update_references.py"

# Create backup
print_status "Creating backup of assets directory..."
BACKUP_DIR="$WORKSPACE_ROOT/assets_backup_$(date +%Y%m%d_%H%M%S)"
cp -r "$WORKSPACE_ROOT/assets" "$BACKUP_DIR"

# Run the reorganization script
print_status "Running asset reorganization..."
python3 "$SCRIPT_DIR/reorganize_assets.py"

if [ $? -ne 0 ]; then
    print_error "Asset reorganization failed!"
    print_status "Restoring from backup..."
    rm -rf "$WORKSPACE_ROOT/assets"
    mv "$BACKUP_DIR" "$WORKSPACE_ROOT/assets"
    exit 1
fi

# Update references in the codebase
print_status "Updating file references..."
python3 "$SCRIPT_DIR/update_references.py"

if [ $? -ne 0 ]; then
    print_error "Reference update failed!"
    print_warning "Manual intervention may be required."
    print_warning "Backup is available at: $BACKUP_DIR"
    exit 1
fi

# Create a summary of changes
print_status "Creating summary of changes..."
echo "Asset Reorganization Summary" > "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "===========================" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "Executed on: $(date)" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "Backup Location: $BACKUP_DIR" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "Changes Made:" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "- Reorganized files according to new structure" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "- Updated file naming conventions" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "- Updated references in codebase" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "For detailed changes, see:" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"
echo "- reorganization_log.json" >> "$WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md"

print_status "Reorganization complete!"
print_status "Backup available at: $BACKUP_DIR"
print_status "Summary available at: $WORKSPACE_ROOT/assets/system/tracking/reorganization_summary.md" 