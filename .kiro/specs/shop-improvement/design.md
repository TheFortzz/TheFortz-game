# Shop System Improvement Design

## Overview

The shop system improvement focuses on creating a comprehensive, visually stunning, and fully functional item browsing and purchasing interface with detailed vehicle rendering capabilities. The design addresses current issues with limited item variety, poor visual representation, and basic interactions by implementing a complete solution that includes comprehensive vehicle collections, proper asset format usage, enhanced animations, and sophisticated rendering systems. The system will display all possible tank-weapon combinations across multiple color variants, proper jet and car collections from asset folders, and engaging click interactions with item enlargement and buy button animations.

## Architecture

The shop system follows a modular architecture with clear separation of concerns:

### Component Structure
```
Shop System
├── Shop UI Controller (JavaScript)
│   ├── Category Management
│   ├── Item Rendering
│   ├── Scroll Control
│   └── Purchase Logic
├── Shop Styling (CSS)
│   ├── Layout Styles
│   ├── Animation Definitions
│   ├── Responsive Design
│   └── Theme Integration
└── Data Integration
    ├── Item Data Management
    ├── Currency System
    └── Inventory Tracking
```

### State Management
- **Category State**: Tracks current active category (tanks, jets, cars, music)
- **Scroll State**: Manages horizontal scroll position for item navigation
- **Item State**: Tracks ownership, pricing, and availability of items
- **UI State**: Controls loading states, animations, and user interactions

## Components and Interfaces

### 1. Shop UI Controller (`ShopController`)

**Purpose**: Manages all shop interactions, comprehensive item rendering, and enhanced animations

**Key Methods**:
- `switchCategory(category)`: Handles category switching with proper state management
- `renderItems(category)`: Renders comprehensive item collections for the specified category
- `handleItemClick(item)`: Processes item selection with enlargement animations and purchase logic
- `updateScrollPosition(direction)`: Manages horizontal scrolling through large item collections
- `initializeShop()`: Sets up initial shop state and event listeners
- `generateTankVariants()`: Creates all tank-weapon-color combinations
- `loadAssetsByCategory(category)`: Loads appropriate assets (GIF for tanks, PNG for jets/cars)
- `animateItemEnlargement(item)`: Handles click animation and buy button display
- `resetItemSize(item)`: Returns enlarged items to normal size

**Interface**:
```javascript
class ShopController {
  constructor(gameState, currencySystem, inventorySystem, assetManager)
  switchCategory(category: string): void
  renderItems(category: string): void
  handleItemClick(itemId: string, category: string): void
  updateScrollPosition(direction: 'left' | 'right'): void
  initializeShop(): void
  generateTankVariants(): TankVariant[]
  loadAssetsByCategory(category: string): Promise<Asset[]>
  animateItemEnlargement(itemElement: HTMLElement): void
  resetItemSize(itemElement: HTMLElement): void
}
```

### 2. Comprehensive Item Renderer (`ItemRenderer`)

**Purpose**: Handles detailed visual representation of all shop items with proper asset management

**Key Methods**:
- `createItemElement(item, category)`: Creates DOM element for shop item with enhanced styling
- `renderTankWithWeapon(tankBody, weaponType, colorScheme)`: Renders half-body tank with mounted weapon using GIF assets
- `renderJetModel(jetType, colorScheme)`: Renders jet using PNG assets from jet folder
- `renderRaceVehicle(carType, colorScheme)`: Renders racing vehicle using assets from race folder
- `createFallbackVisual(item)`: Creates colored fallback when images fail
- `updateItemStatus(itemElement, status)`: Updates visual status indicators
- `loadAssetWithFormat(path, format)`: Loads assets with proper format validation
- `generateTankWeaponCombinations()`: Creates all possible tank-weapon combinations
- `applyColorScheme(element, colorScheme)`: Applies color variants to rendered items

**Asset Format Requirements**:
- Tanks: GIF format for animated rendering
- Jets: PNG format from assets/jet directory
- Cars: PNG format from assets/race directory
- Music: Icon-based representation

### 3. Shop Styling System

**Purpose**: Provides comprehensive CSS styling for all shop components

**Key Features**:
- Responsive grid layout for items
- Smooth animations and transitions
- Category-specific color schemes
- Hover and click feedback effects
- Loading state indicators

### 4. Currency Integration

**Purpose**: Handles purchase transactions and currency validation

**Key Methods**:
- `validatePurchase(itemPrice, playerCurrency)`: Checks if purchase is possible
- `processPurchase(itemId, price)`: Executes purchase transaction
- `updatePlayerCurrency(newAmount)`: Updates player's currency display

## Data Models

### Enhanced Shop Item Model
```javascript
{
  id: string,
  name: string,
  category: 'tanks' | 'jets' | 'cars' | 'music',
  price: number,
  owned: boolean,
  equipped: boolean,
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  colorScheme: 'blue' | 'camo' | 'purple' | 'red',
  preview: {
    image: string,
    format: 'gif' | 'png',
    fallbackColor: string,
    icon: string
  },
  tankConfig?: {
    bodyType: string,
    weaponType: string,
    weaponIndex: number // 1-8 for the 8 weapon types
  },
  jetConfig?: {
    modelType: string,
    assetPath: string
  },
  carConfig?: {
    vehicleType: string,
    assetPath: string
  },
  stats?: {
    damage?: number,
    health?: number,
    speed?: number,
    fireRate?: number
  },
  animations: {
    enlargeScale: number,
    enlargeDuration: number,
    showBuyButton: boolean
  }
}
```

### Enhanced Category Configuration
```javascript
{
  tanks: {
    title: 'TANKS SHOP',
    color: '#00f7ff',
    assetFormat: 'gif',
    assetPath: 'assets/tank',
    renderingMode: 'half-body',
    weaponTypes: 8,
    colorVariants: ['blue', 'camo', 'purple', 'red'],
    items: ShopItem[]
  },
  jets: {
    title: 'JETS SHOP', 
    color: '#a855f7',
    assetFormat: 'png',
    assetPath: 'assets/jet',
    renderingMode: 'full-model',
    colorVariants: ['blue', 'purple', 'red', 'gold'],
    items: ShopItem[]
  },
  cars: {
    title: 'CARS SHOP',
    color: '#ec4899',
    assetFormat: 'png',
    assetPath: 'assets/race',
    renderingMode: 'full-model',
    colorVariants: ['blue', 'red', 'yellow', 'green'],
    items: ShopItem[]
  },
  music: {
    title: 'MUSIC SHOP',
    color: '#fbbf24',
    assetFormat: 'icon',
    renderingMode: 'thematic-icon',
    items: ShopItem[]
  }
}
```
## C
orrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties related to tank rendering (2.1, 2.2, 6.1, 6.2, 8.1, 8.2, 8.3) can be combined into comprehensive tank rendering properties
- Properties about asset format usage (2.3, 2.4, 6.3, 6.4, 6.5, 8.4, 8.5, 8.6) can be merged into asset format compliance properties
- Properties about item interaction and animations (3.1, 3.2, 3.3, 3.8) can be consolidated into interaction behavior properties
- Properties about currency integration (7.1, 7.2, 7.3, 7.4, 7.5) can be combined into currency system properties
- Properties about visual consistency (2.7, 5.1, 5.3) can be merged into a single consistency property

Property 1: Category switching updates UI state
*For any* valid category (tanks, jets, cars, music), switching to that category should update the active button highlight, category title, and display the correct items for that category
**Validates: Requirements 1.2, 1.3**

Property 2: Item rendering completeness
*For any* shop item, the rendered element should contain all required information including preview, name, and price with appropriate styling
**Validates: Requirements 1.4**

Property 3: Loading state feedback
*For any* loading operation, the system should provide visual feedback to indicate loading state
**Validates: Requirements 1.5**

Property 4: Comprehensive tank rendering
*For any* tank category display, all tank color variants (blue, camo, purple, red) should be rendered with half-body visualization showing all 8 weapon type combinations using GIF format assets
**Validates: Requirements 2.1, 2.2, 6.1, 6.2, 8.1, 8.2, 8.3**

Property 5: Asset format compliance
*For any* vehicle category, items should use the correct asset format (GIF for tanks, PNG for jets and cars) from the appropriate asset directories
**Validates: Requirements 2.3, 2.4, 6.3, 6.4, 6.5, 8.4, 8.5, 8.6**

Property 6: Music item representation
*For any* music item, the display should show distinctive thematic icons representing different music genres
**Validates: Requirements 2.5, 6.6**

Property 7: Image fallback handling
*For any* item with a failed image load, the system should display a colored fallback representation instead of broken images
**Validates: Requirements 2.6**

Property 8: Visual consistency across categories
*For any* category of items, all items should maintain consistent sizing, alignment, and styling properties
**Validates: Requirements 2.7, 5.1, 5.3**

Property 9: Interactive feedback and animations
*For any* shop item, hovering should apply visual feedback effects and clicking should trigger enlargement animation with buy button display
**Validates: Requirements 3.1, 3.2, 3.3, 3.8**

Property 10: Item interaction behavior
*For any* shop item, clicking should trigger appropriate actions based on item status (purchase for purchasable, equip for owned/free) with proper notifications
**Validates: Requirements 3.4, 3.5, 3.6, 3.7**

Property 11: Scroll functionality and boundaries
*For any* item collection that exceeds display width, scroll controls should be functional, animate smoothly, and prevent over-scrolling beyond content boundaries
**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

Property 12: Category change scroll reset
*For any* category switch, the scroll position should reset to the beginning (position 0)
**Validates: Requirements 4.4**

Property 13: Price status color coding
*For any* item price status (FREE, OWNED, purchasable), the display should use appropriate color coding (green for FREE/OWNED, yellow for purchasable)
**Validates: Requirements 5.2, 5.4**

Property 14: Category-specific behavior maintenance
*For any* category switch, the system should maintain category-specific styling and behavior appropriate to that category type
**Validates: Requirements 6.7**

Property 15: Color variant completeness
*For any* vehicle type, all color variants (blue, camo, purple, red) should be represented and properly organized
**Validates: Requirements 6.8, 8.7**

Property 16: Currency system integration
*For any* purchase transaction, the system should validate currency, deduct correct amounts, update ownership status, and handle insufficient funds appropriately
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

Property 17: Rapid interaction robustness
*For any* sequence of rapid user interactions, the system should handle them gracefully without breaking or entering invalid states
**Validates: Requirements 9.4**

Property 18: State persistence across sessions
*For any* shop session, closing and reopening should restore the previous category and scroll state correctly
**Validates: Requirements 9.5**

## Error Handling

### Image Loading Failures
- **Fallback System**: When item images fail to load, display colored rectangles with category-appropriate colors
- **Retry Logic**: Implement automatic retry for failed image loads with exponential backoff
- **Error Logging**: Log image loading failures for debugging purposes

### Currency System Errors
- **Insufficient Funds**: Display clear error messages when players lack currency for purchases
- **Transaction Failures**: Handle network or system errors during purchase attempts
- **State Synchronization**: Ensure currency and ownership states remain synchronized

### UI State Errors
- **Category Loading Failures**: Gracefully handle cases where category data fails to load
- **Scroll Boundary Errors**: Prevent scroll positions from becoming invalid or causing UI breaks
- **Animation Interruptions**: Handle cases where animations are interrupted by rapid user interactions

### Network and Performance Errors
- **Slow Loading**: Provide loading indicators and timeout handling for slow operations
- **Memory Management**: Properly clean up DOM elements and event listeners to prevent memory leaks
- **Browser Compatibility**: Handle differences in CSS and JavaScript support across browsers

## Testing Strategy

### Unit Testing Approach
Unit tests will focus on:
- Individual component functionality (category switching, item rendering, scroll controls)
- Currency calculation and validation logic
- State management and persistence
- Error handling for edge cases
- DOM manipulation and event handling

### Property-Based Testing Approach
Property-based tests will use **fast-check** library for JavaScript and run a minimum of 100 iterations per test. Each test will be tagged with comments referencing the specific correctness property from this design document using the format: `**Feature: shop-improvement, Property {number}: {property_text}**`

Property-based tests will verify:
- Category switching behavior across all valid categories
- Item rendering consistency across different item types and states
- Scroll functionality with various item collection sizes
- Currency operations with different amounts and states
- UI state management under various interaction patterns
- Error handling with simulated failure conditions

The dual testing approach ensures comprehensive coverage: unit tests catch specific bugs and edge cases, while property tests verify that universal behaviors hold across all possible inputs and states.

### Test Data Generation
- **Category Generator**: Generates valid category names and configurations
- **Item Generator**: Creates shop items with various properties, prices, and ownership states
- **Currency Generator**: Produces different currency amounts including edge cases (0, negative, very large)
- **Interaction Generator**: Simulates user interaction sequences including rapid clicks and category switches
- **State Generator**: Creates various shop states for testing persistence and restoration