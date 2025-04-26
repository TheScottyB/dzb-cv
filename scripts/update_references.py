#!/usr/bin/env python3

import os
import json
import re
from typing import Dict, List, Set, Tuple
from pathlib import Path

class ReferenceUpdater:
    def __init__(self, root_dir: str):
        self.root_dir = root_dir
        self.moves_log_path = os.path.join(root_dir, 'assets', 'system', 'tracking', 'reorganization_log.json')
        self.file_moves: Dict[str, str] = {}
        self.updated_files: Set[str] = set()
        
    def load_moves(self) -> None:
        """Load the moves log to get old and new file paths."""
        try:
            with open(self.moves_log_path, 'r') as f:
                moves = json.load(f)
                for move in moves:
                    old_path = move['old_path']
                    new_path = move['new_path']
                    # Store both absolute and relative paths
                    self.file_moves[old_path] = new_path
                    self.file_moves[os.path.relpath(old_path, self.root_dir)] = os.path.relpath(new_path, self.root_dir)
        except Exception as e:
            print(f"Error loading moves log: {e}")
            return

    def find_files_to_update(self) -> List[str]:
        """Find all files that might contain references to moved files."""
        files_to_check = []
        for root, _, files in os.walk(self.root_dir):
            # Skip node_modules, .git, and other unnecessary directories
            if any(part.startswith('.') for part in Path(root).parts) or 'node_modules' in root:
                continue
                
            for file in files:
                # Only check text files that might contain references
                if file.endswith(('.md', '.ts', '.tsx', '.js', '.jsx', '.json', '.py', '.html', '.css')):
                    files_to_check.append(os.path.join(root, file))
        return files_to_check

    def update_references_in_file(self, file_path: str) -> bool:
        """Update references in a single file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            made_changes = False
            
            # Update references
            for old_path, new_path in self.file_moves.items():
                # Handle both forward and backslashes
                old_path_norm = old_path.replace('\\', '/')
                new_path_norm = new_path.replace('\\', '/')
                
                # Create patterns for different ways paths might be referenced
                patterns = [
                    re.escape(old_path_norm),  # Full path
                    re.escape(os.path.basename(old_path_norm)),  # Just filename
                    re.escape(old_path_norm.replace(self.root_dir, '')).lstrip('/'),  # Relative to root
                ]
                
                for pattern in patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        # Replace the path while preserving the original case
                        def replace_case(match):
                            old = match.group(0)
                            new = new_path_norm
                            # If the old path was all uppercase, make the new path uppercase
                            if old.isupper():
                                return new.upper()
                            # If the old path was title case, make the new path title case
                            if old.istitle():
                                return new.title()
                            return new
                            
                        content = re.sub(pattern, replace_case, content, flags=re.IGNORECASE)
                        made_changes = True
                        
            if made_changes:
                # Write updated content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.updated_files.add(file_path)
                print(f"Updated references in: {file_path}")
                return True
                
            return False
            
        except Exception as e:
            print(f"Error updating references in {file_path}: {e}")
            return False

    def update_all_references(self) -> None:
        """Update all references to moved files in the codebase."""
        print("Loading moves log...")
        self.load_moves()
        
        if not self.file_moves:
            print("No file moves found in the log.")
            return
            
        print("\nFinding files to update...")
        files_to_update = self.find_files_to_update()
        
        print(f"\nChecking {len(files_to_update)} files for references...")
        files_updated = 0
        for file_path in files_to_update:
            if self.update_references_in_file(file_path):
                files_updated += 1
                
        print(f"\nFinished updating references:")
        print(f"- Files checked: {len(files_to_update)}")
        print(f"- Files updated: {files_updated}")
        print(f"- References updated: {len(self.updated_files)}")
        
        # Save summary
        summary = {
            'files_checked': len(files_to_update),
            'files_updated': files_updated,
            'updated_files': list(self.updated_files)
        }
        
        summary_path = os.path.join(self.root_dir, 'assets', 'system', 'tracking', 'reference_updates.json')
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)

def main():
    # Get the workspace root directory
    workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Initialize and run the updater
    updater = ReferenceUpdater(workspace_root)
    updater.update_all_references()

if __name__ == "__main__":
    main() 