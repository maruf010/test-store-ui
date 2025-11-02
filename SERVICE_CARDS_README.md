# Service Cards Implementation

## Overview
This implementation creates a service card system with 7 cards loaded from JSON data, featuring 3 different card design types that users can switch between.

## Components Created

### 1. ServiceCardComponent (`src/app/service-card/`)
- **Location**: `src/app/service-card/`
- **Files**:
  - `service-card.component.ts` - Component logic with ServiceCard interface
  - `service-card.component.html` - Template with 3 design variants
  - `service-card.component.scss` - Styling for all 3 card types

### 2. Card Design Types

#### Type 1: Vertical Card
- Traditional card layout with image on top
- Full details displayed vertically
- Grid layout with multiple cards per row
- Best for showcasing services in a gallery view

#### Type 2: Horizontal Card (Image Right)
- Image positioned on the right side
- Content on the left
- Single column layout
- Ideal for detailed service listings

#### Type 3: Compact Horizontal Card
- Smaller image on the left
- Compact information display
- Single column layout
- Perfect for list-style browsing

## Data Structure

### JSON File: `src/assets/data/services.json`
Contains 7 service cards with the following properties:
- `id`: Unique identifier
- `title`: Service name
- `category`: Service categories
- `rating`: Service rating (out of 5)
- `image`: Service image URL
- `joinedDate`: Date joined
- `location`: Service location
- `schedule`: Working hours
- `price`: Starting price
- `priceUnit`: Price unit (e.g., "H" for hourly)

## Features

### Design Switcher
- 3 buttons at the top of the page
- Icons representing each layout type
- Active state highlighting
- Smooth transitions between layouts

### Responsive Design
- Mobile-friendly layouts
- Adaptive grid systems
- Touch-friendly buttons
- Optimized for all screen sizes

### Animations
- Fade-in effect when cards load
- Hover effects on cards and buttons
- Smooth transitions between design types

## Usage

The home page (`/`) displays:
1. Header with "Our Services" title
2. "Cost Calculator" button (existing functionality)
3. Design type switcher with 3 options
4. Grid of 7 service cards in the selected design type

Users can click any of the 3 design buttons to change how the cards are displayed.

## Styling

- Modern, clean design with soft shadows
- Orange accent color (#ff6b35) for CTAs
- Gradient background
- Consistent spacing and typography
- Professional card hover effects

## Technical Details

- Uses Angular's `*ngFor` to iterate over services
- Uses `*ngIf` to conditionally render design types
- Loads data via fetch API from JSON file
- Type-safe with TypeScript interfaces
- Fully integrated with existing routing
