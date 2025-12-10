#!/usr/bin/env python3
"""
Script to remove remaining duplicate UI functions from game.js
"""

# Read the file
with open('src/client/js/game.js', 'r') as f:
    lines = f.readlines()

# Find and remove duplicate startLobbyShopRendering (keep only the delegation)
# Find the second occurrence (the implementation)
found_first = False
start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if 'function startLobbyShopRendering()' in line:
        if not found_first:
            found_first = True
        else:
            # This is the duplicate implementation
            start_idx = i - 2  # Include the comment and blank line before
            # Find the end of this function
            brace_count = 0
            in_function = False
            for j in range(i, len(lines)):
                if '{' in lines[j]:
                    in_function = True
                    brace_count += lines[j].count('{')
                if in_function:
                    brace_count -= lines[j].count('}')
                    if brace_count == 0:
                        end_idx = j + 1
                        break
            break

if start_idx and end_idx:
    # Also remove stopLobbyShopRendering and setupLobbyShopHandler that follow
    # Find the end of setupLobbyShopHandler
    for i in range(end_idx, min(end_idx + 200, len(lines))):
        if 'function setupLobbyShopHandler()' in lines[i]:
            # Find the end of this function
            brace_count = 0
            in_function = False
            for j in range(i, len(lines)):
                if '{' in lines[j]:
                    in_function = True
                    brace_count += lines[j].count('{')
                if in_function:
                    brace_count -= lines[j].count('}')
                    if brace_count == 0:
                        end_idx = j + 1
                        break
            break
    
    print(f"Removing duplicate lobby shop functions: lines {start_idx+1} to {end_idx}")
    lines = lines[:start_idx] + lines[end_idx:]

# Find and remove loadShopItems implementation
for i, line in enumerate(lines):
    if '// Load shop items' in line and i < len(lines) - 1 and 'function loadShopItems(category)' in lines[i+1]:
        start_idx = i
        # Find the end - look for the next major function or comment
        end_idx = None
        brace_count = 0
        in_function = False
        for j in range(i+1, len(lines)):
            if 'function loadShopItems(category)' in lines[j]:
                if '{' in lines[j]:
                    in_function = True
                    brace_count += lines[j].count('{')
            if in_function:
                brace_count += lines[j].count('{')
                brace_count -= lines[j].count('}')
                if brace_count == 0:
                    end_idx = j + 1
                    break
        
        if end_idx:
            print(f"Removing loadShopItems implementation: lines {start_idx+1} to {end_idx}")
            lines = lines[:start_idx] + lines[end_idx:]
        break

# Find and remove createShopItemCard implementation
for i, line in enumerate(lines):
    if '// Create shop item card' in line and i < len(lines) - 1 and 'function createShopItemCard' in lines[i+1]:
        start_idx = i
        # Find the end
        end_idx = None
        brace_count = 0
        in_function = False
        for j in range(i+1, len(lines)):
            if 'function createShopItemCard' in lines[j]:
                if '{' in lines[j]:
                    in_function = True
                    brace_count += lines[j].count('{')
            if in_function:
                brace_count += lines[j].count('{')
                brace_count -= lines[j].count('}')
                if brace_count == 0:
                    end_idx = j + 1
                    break
        
        if end_idx:
            print(f"Removing createShopItemCard implementation: lines {start_idx+1} to {end_idx}")
            lines = lines[:start_idx] + lines[end_idx:]
        break

# Find and remove buyShopItem implementation
for i, line in enumerate(lines):
    if '// Buy shop item' in line and i < len(lines) - 1 and 'function buyShopItem' in lines[i+1]:
        start_idx = i
        # Find the end
        end_idx = None
        brace_count = 0
        in_function = False
        for j in range(i+1, len(lines)):
            if 'function buyShopItem' in lines[j]:
                if '{' in lines[j]:
                    in_function = True
                    brace_count += lines[j].count('{')
            if in_function:
                brace_count += lines[j].count('{')
                brace_count -= lines[j].count('}')
                if brace_count == 0:
                    end_idx = j + 1
                    break
        
        if end_idx:
            print(f"Removing buyShopItem implementation: lines {start_idx+1} to {end_idx}")
            lines = lines[:start_idx] + lines[end_idx:]
        break

# Write the modified content
with open('src/client/js/game.js', 'w') as f:
    f.writelines(lines)

print("\n✅ All remaining UI function duplicates removed")
