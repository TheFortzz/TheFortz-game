#!/usr/bin/env python3
"""
Script to remove ALL remaining duplicate shop and locker function implementations
"""

import re

# Read the file
with open('src/client/js/game.js', 'r') as f:
    content = f.read()

# List of functions to remove (keep only delegations)
functions_to_remove = [
    'loadShopItems',
    'buyShopItem',
    'createShopItemCard',
    'loadTankItems',
    'loadJetItems',
    'loadRaceItems',
    'createLockerItemCard',
]

# For each function, find and remove the implementation (not the delegation)
for func_name in functions_to_remove:
    # Find all occurrences of this function
    pattern = rf'(//[^\n]*\n)?function {func_name}\([^)]*\)\s*\{{'
    matches = list(re.finditer(pattern, content))
    
    if len(matches) > 1:
        # Keep the first (delegation), remove the rest
        for match in matches[1:]:
            start = match.start()
            # Find the end of this function by counting braces
            brace_count = 0
            i = match.end() - 1  # Start from the opening brace
            while i < len(content):
                if content[i] == '{':
                    brace_count += 1
                elif content[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        # Found the end
                        end = i + 1
                        # Include trailing newlines
                        while end < len(content) and content[end] in '\n ':
                            end += 1
                        
                        # Remove this function
                        print(f"Removing duplicate {func_name} implementation")
                        content = content[:start] + content[end:]
                        break
                i += 1

# Write the modified content
with open('src/client/js/game.js', 'w') as f:
    f.write(content)

print("\n✅ All duplicate shop and locker function implementations removed")
