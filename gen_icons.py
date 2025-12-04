#!/usr/bin/env python3
"""
Extract all icons from diagrams library and save to icons.json
"""

import json
import pkgutil
import inspect
import sys
from pathlib import Path

try:
    import diagrams
except ImportError:
    print("Error: diagrams package not found. Install with: pip install diagrams")
    sys.exit(1)


def get_icon_classes(module):
    """Extract icon classes from a module."""
    icons = []
    module_path = Path(module.__file__).parent
    base_import = module.__name__
    
    for importer, modname, ispkg in pkgutil.walk_packages(
        path=[str(module_path)],
        prefix=base_import + ".",
        onerror=lambda x: None
    ):
        try:
            actual_module = __import__(modname, fromlist=[""])
            
            # Get file path
            file_str = ""
            if hasattr(actual_module, '__file__') and actual_module.__file__:
                try:
                    file_path = Path(actual_module.__file__).relative_to(
                        Path(diagrams.__file__).parent
                    )
                    file_str = str(file_path).replace('\\', '/')
                except ValueError:
                    file_str = Path(actual_module.__file__).name
            
            # Extract classes
            for name, obj in inspect.getmembers(actual_module, inspect.isclass):
                if name.startswith('_') or obj.__module__ != actual_module.__name__:
                    continue
                
                # Check if it's a diagram icon class
                if not (hasattr(obj, '_icon') or hasattr(obj, 'icon_dir') or 
                        any(b.__name__ in ['Node', 'Graph'] for b in inspect.getmro(obj))):
                    continue
                
                # Extract docstring
                docstring = ""
                try:
                    doc = inspect.getdoc(obj)
                    if doc:
                        docstring = doc.split('\n')[0].strip()
                except:
                    pass
                
                # Get provider from path
                parts = actual_module.__name__.split('.')
                provider = parts[1] if len(parts) > 1 else "unknown"
                
                icons.append({
                    "name": name,
                    "import_path": f"{actual_module.__name__}.{name}",
                    "docstring": docstring,
                    "provider": provider,
                    "module": file_str,
                    "aliases": []
                })
        
        except Exception:
            pass
    
    return icons


def main():
    print("Extracting icons from diagrams library...\n")
    
    all_icons = []
    diagrams_path = Path(diagrams.__file__).parent
    
    # Process each provider
    for item in sorted(diagrams_path.iterdir()):
        if not item.is_dir() or item.name.startswith('_'):
            continue
        
        try:
            provider_module = __import__(f"diagrams.{item.name}", fromlist=[""])
            provider_icons = get_icon_classes(provider_module)
            all_icons.extend(provider_icons)
            print(f"✓ {item.name}: {len(provider_icons)} icons")
        except Exception:
            print(f"⊘ {item.name}: skipped")
    
    if not all_icons:
        print("\nError: No icons extracted")
        sys.exit(1)
    
    # Sort and save
    all_icons.sort(key=lambda x: (x["provider"], x["name"]))
    
    with open("icons.json", 'w') as f:
        json.dump(all_icons, f, indent=2)
    
    # Stats
    providers = {}
    for icon in all_icons:
        p = icon['provider']
        providers[p] = providers.get(p, 0) + 1
    
    print(f"\n✓ Extracted {len(all_icons)} total icons")
    print("\nBy provider:")
    for p in sorted(providers.keys()):
        print(f"  {p}: {providers[p]}")


if __name__ == "__main__":
    main()