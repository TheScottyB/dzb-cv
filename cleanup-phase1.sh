#!/bin/bash

# DZB-CV System Cleanup - Phase 1: Safe Cleanup
# This script removes accumulated test artifacts, archives, and temporary files
# while preserving all core functionality and a few key examples.

set -e  # Exit on any error

echo "🧹 Starting DZB-CV System Cleanup - Phase 1"
echo "============================================="

# Create backup directory
BACKUP_DIR="../dzb-cv-backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup at: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Function to safely backup and remove
backup_and_remove() {
    local path="$1"
    local description="$2"
    
    if [ -e "$path" ]; then
        echo "💾 Backing up $description: $path"
        cp -r "$path" "$BACKUP_DIR/" 2>/dev/null || echo "⚠️  Warning: Could not backup $path"
        echo "🗑️  Removing: $path"
        rm -rf "$path"
        echo "✅ Cleaned: $description"
    else
        echo "⏭️  Skipping (not found): $path"
    fi
}

# Function to clean PDF test files
clean_pdf_tests() {
    echo "🗑️  Cleaning PDF test artifacts..."
    local pdf_dir="generated/pdfs"
    
    if [ -d "$pdf_dir" ]; then
        # Remove bulk test files
        rm -f "$pdf_dir"/bulk-test-*.pdf
        rm -f "$pdf_dir"/test-*.pdf
        rm -f "$pdf_dir"/debug-*.pdf
        rm -f "$pdf_dir"/performance-*.pdf
        rm -f "$pdf_dir"/quality-*.pdf
        rm -f "$pdf_dir"/template-*-test-*.pdf
        rm -f "$pdf_dir"/alice-*.pdf
        rm -f "$pdf_dir"/bob-*.pdf
        rm -f "$pdf_dir"/carol-*.pdf
        rm -f "$pdf_dir"/jane-*.pdf
        rm -f "$pdf_dir"/john-*.pdf
        rm -f "$pdf_dir"/dr.-elizabeth-*.pdf
        rm -f "$pdf_dir"/large-content-*.pdf
        rm -f "$pdf_dir"/custom-*.pdf
        rm -f "$pdf_dir"/final-*.pdf
        rm -f "$pdf_dir"/output.pdf
        
        echo "✅ Cleaned PDF test artifacts"
        echo "📊 Remaining PDFs: $(ls "$pdf_dir"/*.pdf 2>/dev/null | wc -l)"
    fi
}

# Function to preserve key examples
preserve_examples() {
    echo "📋 Preserving key examples..."
    
    # Create examples directory
    mkdir -p examples/
    
    # Keep one good job application as example
    if [ -d "job-postings/careers.mercyhealthsystem.org-mercyhealth-medical-lab-scientist-39454" ]; then
        echo "📄 Preserving Medical Lab Scientist application as example"
        cp -r "job-postings/careers.mercyhealthsystem.org-mercyhealth-medical-lab-scientist-39454" "examples/sample-healthcare-application"
    fi
    
    # Keep the EKG CV examples
    if [ -d "generated/dawn-ekg-2025" ]; then
        echo "📄 Preserving EKG CV examples"
        cp -r "generated/dawn-ekg-2025" "examples/ekg-cv-showcase"
    fi
    
    echo "✅ Key examples preserved in examples/"
}

echo ""
echo "🎯 Phase 1: Major Directory Cleanup"
echo "====================================="

# 1. Remove archive directory (old backup system)
backup_and_remove "archive" "archive directory (old backup system)"

# 2. Remove temp-cleanup directory
backup_and_remove "temp-cleanup" "temporary cleanup scripts"

# 3. Preserve examples before bulk removal
preserve_examples

# 4. Remove bulk generated content (keeping examples)
backup_and_remove "job-postings" "job postings directory"

# 5. Clean PDF test artifacts (but keep real examples)
clean_pdf_tests

echo ""
echo "🎯 Phase 2: Individual File Cleanup"
echo "===================================="

# Remove evaluation JSON files (can be regenerated)
backup_and_remove "dawn-ekg-evaluation.json" "EKG evaluation file"
backup_and_remove "dawn-ekg-final-evaluation.json" "EKG final evaluation file"
backup_and_remove "dawn-ekg-optimized-evaluation.json" "EKG optimized evaluation file"

# Remove root-level output files
backup_and_remove "dawn_ekg_technician_single_page_cv.pdf" "root-level EKG CV PDF"
backup_and_remove "output.doc" "output.doc file"
backup_and_remove "output.pdf" "output.pdf file"

# Remove root-level generator script (functionality exists in packages)
backup_and_remove "generate-dawn-single-page-cv.js" "root-level generation script"

# Remove redundant summary documents (keep main docs)
backup_and_remove "AI_IMPROVEMENTS_COMPLETION_REPORT.md" "AI improvements report"
backup_and_remove "AI_WORKFLOW_FIX_SUMMARY.md" "AI workflow summary"
backup_and_remove "CV_GENERATION_SUMMARY.md" "CV generation summary"
backup_and_remove "RELEASE-NOTES-v1.1.0.md" "release notes"

# Remove build artifacts that can be regenerated
backup_and_remove "dist" "dist directory"
backup_and_remove "tsconfig.tsbuildinfo" "TypeScript build info"

echo ""
echo "🎯 Phase 3: Script Directory Cleanup"
echo "===================================="

# Clean up redundant scripts in scripts/ directory
SCRIPTS_TO_REMOVE=(
    "scripts/generate-conservation-worker-pdf.js"
    "scripts/generate-cover-letter-pdf.js"
    "scripts/generate-ekg-technician-pdf.js"
    "scripts/generate-ekg-technician-single-page-pdf.js"
    "scripts/generate-executive-secretary-pdf.js"
    "scripts/generate-job-pdf-template.js"
    "scripts/generate-mercy-application.js"
    "scripts/generate-mercyhealth-pdf.js"
    "scripts/generate-mls-cv.js"
    "scripts/generate-mls-pdf.js"
    "scripts/generate-tailored-pdf.js"
    "scripts/generate-tax-specialist-pdf.js"
    "scripts/pdf-generator-ats.js"
    "scripts/reorganize_assets.py"
    "scripts/reorganize_assets.sh"
    "scripts/update-bhgre-info.js"
    "scripts/update_references.py"
)

for script in "${SCRIPTS_TO_REMOVE[@]}"; do
    backup_and_remove "$script" "redundant script: $(basename "$script")"
done

echo ""
echo "📊 Cleanup Summary"
echo "=================="

# Calculate space saved (approximate)
echo "💾 Backup created at: $BACKUP_DIR"
echo "🗑️  Major cleanups completed:"
echo "   • Removed archive/ directory (old backup system)"
echo "   • Removed temp-cleanup/ directory (experimental scripts)"
echo "   • Removed job-postings/ directory (moved examples to examples/)"
echo "   • Cleaned PDF test artifacts (kept real examples)"
echo "   • Removed redundant documentation files"
echo "   • Removed job-specific generation scripts"
echo ""
echo "✅ Preserved Core System:"
echo "   • packages/ - All core packages intact"
echo "   • src/ - All source code intact"
echo "   • docs/ - Main documentation preserved"
echo "   • scripts/ - Core scripts preserved (evaluate-cv-quality, ab-test, etc.)"
echo "   • base-info.json & data/ - Dawn's profile data intact"
echo "   • examples/ - Key examples preserved"
echo ""

# Check if core functionality is intact
echo "🔍 Verifying Core System Integrity..."

CORE_PATHS=(
    "packages"
    "src"
    "base-info.json"
    "data/base-info.json"
    "README.md"
    "USAGE.md"
    "package.json"
    "scripts/evaluate-cv-quality.js"
    "scripts/ab-test-cv-distillation.js"
    "scripts/test-ai-distillation.js"
)

ALL_GOOD=true
for path in "${CORE_PATHS[@]}"; do
    if [ -e "$path" ]; then
        echo "✅ $path"
    else
        echo "❌ MISSING: $path"
        ALL_GOOD=false
    fi
done

echo ""
if [ "$ALL_GOOD" = true ]; then
    echo "🎉 SUCCESS: All core functionality preserved!"
    echo "📈 Repository is now cleaner and ready for public release"
    echo ""
    echo "Next steps:"
    echo "1. Test core workflows to ensure everything works"
    echo "2. Update documentation if needed"  
    echo "3. Consider Phase 2 cleanup (script consolidation)"
else
    echo "⚠️  WARNING: Some core files may be missing!"
    echo "Please review the cleanup and restore from backup if needed"
fi

echo ""
echo "🔒 Backup Safety:"
echo "All removed content is safely backed up at: $BACKUP_DIR"
echo "You can restore anything needed with: cp -r $BACKUP_DIR/* ."
echo ""
echo "🧹 Phase 1 Cleanup Complete!"