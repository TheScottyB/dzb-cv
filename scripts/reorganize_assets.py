#!/usr/bin/env python3

import os
import shutil
import json
from datetime import datetime
import re
from typing import Dict, List, Tuple

class AssetReorganizer:
    def __init__(self, root_dir: str):
        self.root_dir = root_dir
        self.asset_catalog_path = os.path.join(root_dir, 'assets', 'asset-catalog.json')
        self.new_structure = {
            'profiles': ['base/current', 'base/archive', 'federal/current', 'federal/drafts', 
                        'specialized/healthcare', 'specialized/real-estate'],
            'media': ['video/resume/final', 'video/resume/raw', 'video/interviews', 
                     'images/headshots', 'images/portfolio'],
            'documents': ['guides/application', 'guides/interview', 'certifications', 'references', 'general'],
            'applications': ['active', 'submitted', 'archive'],
            'system': ['templates', 'metadata', 'tracking', 'temp']
        }
        self.processed_files = set()
        
    def create_directory_structure(self):
        """Create the new directory structure."""
        for main_dir, subdirs in self.new_structure.items():
            for subdir in subdirs:
                full_path = os.path.join(self.root_dir, 'assets', main_dir, subdir)
                os.makedirs(full_path, exist_ok=True)
                print(f"Created directory: {full_path}")

    def generate_new_filename(self, old_name: str, file_type: str, category: str) -> str:
        """Generate new filename based on conventions."""
        # Remove file extension
        base_name = os.path.splitext(old_name)[0].lower()
        ext = os.path.splitext(old_name)[1].lower()
        date_str = datetime.now().strftime("%Y%m%d")
        
        # Extract position and employer info if present
        position_match = re.search(r'(patient.*?representative|patient.*?supervisor|executive.*?secretary)', base_name)
        position = position_match.group(1) if position_match else None
        
        employer_match = re.search(r'(mercyhealth|northwestern|dhs|bhgre)', base_name)
        employer = employer_match.group(1) if employer_match else None
        
        # Handle different file types and categories
        if category == 'federal':
            position_type = 'executive' if 'executive' in base_name else 'specialist'
            return f"cv-dzb-fed-{position_type}-{date_str}{ext}"
            
        elif category == 'healthcare':
            pos = 'psr' if position and 'representative' in position else 'pas'
            emp = 'mh' if employer and 'mercy' in employer else 'nm'
            return f"cv-dzb-{emp}-{pos}-{date_str}{ext}"
            
        elif category == 'real-estate':
            emp = 'bhgre' if employer and 'bhgre' in employer else 'realty'
            return f"cv-dzb-real_estate-{emp}-agent-{date_str}{ext}"
            
        elif 'profile' in base_name or 'resume' in base_name:
            if 'concise' in base_name:
                return f"profile-dzb-base-concise-{date_str}{ext}"
            return f"profile-dzb-base-full-{date_str}{ext}"
            
        elif file_type == 'video':
            duration = '30sec' if '30' in base_name else 'full'
            return f"video-dzb-resume-{duration}-{date_str}{ext}"
            
        elif file_type == 'cert':
            cert_type = 'general'
            if 'federal' in base_name:
                cert_type = 'federal'
            elif 'healthcare' in base_name:
                cert_type = 'healthcare'
            return f"cert-dzb-{cert_type}-{date_str}{ext}"
            
        # Default case - preserve meaningful parts of the original name
        clean_name = re.sub(r'[^a-z0-9-]', '-', base_name)
        return f"{file_type}-dzb-{clean_name}-{date_str}{ext}"

    def categorize_file(self, filename: str) -> Tuple[str, str]:
        """Categorize file by type and category."""
        lower_name = filename.lower()
        
        # Determine file type
        if any(term in lower_name for term in ['cv', 'resume']):
            file_type = 'cv'
        elif 'cover' in lower_name:
            file_type = 'cover'
        elif 'profile' in lower_name:
            file_type = 'profile'
        elif any(term in lower_name for term in ['cert', 'certification']):
            file_type = 'cert'
        elif any(ext in lower_name for ext in ['.mp4', '.avi', '.mov']):
            file_type = 'video'
        elif any(ext in lower_name for ext in ['.jpg', '.png', '.gif']):
            file_type = 'image'
        else:
            file_type = 'doc'
            
        # Determine category
        if 'federal' in lower_name:
            category = 'federal'
        elif any(term in lower_name for term in ['patient', 'health', 'medical', 'northwestern', 'mercy']):
            category = 'healthcare'
        elif any(term in lower_name for term in ['real', 'property', 'bhgre', 'realty']):
            category = 'real-estate'
        elif file_type in ['video', 'image']:
            category = 'media'
        elif any(term in lower_name for term in ['cert', 'certification', 'license']):
            category = 'certification'
        elif 'guide' in lower_name or 'manual' in lower_name:
            category = 'guide'
        else:
            category = 'general'
            
        return file_type, category

    def get_destination_path(self, filename: str, file_type: str, category: str) -> str:
        """Determine the destination path for a file."""
        if file_type == 'cv':
            if category == 'federal':
                return os.path.join('profiles', 'federal', 'current')
            elif category == 'healthcare':
                return os.path.join('profiles', 'specialized', 'healthcare')
            elif category == 'real-estate':
                return os.path.join('profiles', 'specialized', 'real-estate')
                
        elif file_type == 'profile':
            return os.path.join('profiles', 'base', 'current')
            
        elif file_type == 'video':
            if '30' in filename:
                return os.path.join('media', 'video', 'resume', 'final')
            return os.path.join('media', 'video', 'resume', 'raw')
            
        elif file_type == 'image':
            if 'headshot' in filename.lower():
                return os.path.join('media', 'images', 'headshots')
            return os.path.join('media', 'images', 'portfolio')
            
        elif file_type == 'cert':
            return os.path.join('documents', 'certifications')
            
        elif category == 'guide':
            if 'interview' in filename.lower():
                return os.path.join('documents', 'guides', 'interview')
            return os.path.join('documents', 'guides', 'application')
            
        return os.path.join('documents', 'general')

    def update_asset_catalog(self, old_path: str, new_path: str):
        """Update the asset catalog with new file locations."""
        try:
            with open(self.asset_catalog_path, 'r') as f:
                catalog = json.load(f)
                
            # Update paths in the catalog
            for asset in catalog.get('assets', []):
                if asset['path'] == old_path:
                    asset['path'] = new_path
                    asset['lastModified'] = datetime.now().isoformat()
                    
            # Write updated catalog
            with open(self.asset_catalog_path, 'w') as f:
                json.dump(catalog, f, indent=2)
                
        except Exception as e:
            print(f"Error updating asset catalog: {e}")

    def process_files(self):
        """Process all files in the assets directory."""
        assets_dir = os.path.join(self.root_dir, 'assets')
        moves_log = []
        
        for root, _, files in os.walk(assets_dir):
            for filename in files:
                if filename.startswith('.') or filename == 'asset-catalog.json':
                    continue
                    
                old_path = os.path.join(root, filename)
                
                # Skip if we've already processed this file
                if old_path in self.processed_files:
                    continue
                    
                file_type, category = self.categorize_file(filename)
                new_filename = self.generate_new_filename(filename, file_type, category)
                dest_subdir = self.get_destination_path(filename, file_type, category)
                new_path = os.path.join(assets_dir, dest_subdir, new_filename)
                
                # Create destination directory if it doesn't exist
                os.makedirs(os.path.dirname(new_path), exist_ok=True)
                
                try:
                    # Move the file
                    shutil.move(old_path, new_path)
                    print(f"Moved: {old_path} -> {new_path}")
                    
                    # Update asset catalog
                    self.update_asset_catalog(old_path, new_path)
                    
                    # Record the move
                    moves_log.append({
                        'old_path': old_path,
                        'new_path': new_path,
                        'file_type': file_type,
                        'category': category
                    })
                    
                    # Mark as processed
                    self.processed_files.add(new_path)
                    
                except Exception as e:
                    print(f"Error moving {filename}: {e}")
        
        # Save moves log
        log_dir = os.path.join(assets_dir, 'system', 'tracking')
        os.makedirs(log_dir, exist_ok=True)
        with open(os.path.join(log_dir, 'reorganization_log.json'), 'w') as f:
            json.dump(moves_log, f, indent=2)

def main():
    # Get the workspace root directory
    workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Initialize and run the reorganizer
    reorganizer = AssetReorganizer(workspace_root)
    
    # Create new directory structure
    print("Creating directory structure...")
    reorganizer.create_directory_structure()
    
    # Process files
    print("\nProcessing files...")
    reorganizer.process_files()
    
    print("\nReorganization complete. Check reorganization_log.json for details of all moves.")

if __name__ == "__main__":
    main() 