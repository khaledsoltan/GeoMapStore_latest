# Custom Routing Icon Feature

## Overview
This feature adds a custom routing icon to the Routing plugin in MapStore2. The custom icon is designed specifically for routing and navigation purposes with a blue gradient design.

## Features

### Custom Routing Icon
- **SVG Design**: Custom-designed routing icon with blue gradient background
- **Route Path**: White route path with start and end points
- **Direction Arrow**: Visual direction indicator
- **Professional Look**: Clean, modern design suitable for mapping applications

### Integration
- **Symbol Library**: Added to MapStore2's symbol library (`symbols.json`)
- **Plugin Integration**: Seamlessly integrated into the Routing plugin
- **Drawing Support**: Supports drawing custom route icons on the map
- **UI Updates**: Updated interface to reflect custom icon usage

## Technical Details

### File Structure
```
MapStore2/web/client/product/assets/symbols/
├── routing-icon.svg          # Custom routing icon SVG
└── symbols.json              # Updated symbol library

MapStore2/web/client/plugins/
└── routing.jsx               # Updated routing plugin
```

### Icon Specifications
- **Size**: 32x32 pixels
- **Format**: SVG with embedded gradients
- **Colors**: Blue gradient (#0066cc to #004499)
- **Features**: Route path, start/end points, direction arrow

### Usage
1. Open the Routing plugin
2. Select "Custom Route Icons" mode
3. Click "Draw Custom Route Icons" button
4. Click on the map to place custom routing icons
5. Icons will appear with the custom blue routing design

## Customization
The routing icon can be customized by:
- Modifying the SVG file (`routing-icon.svg`)
- Adjusting colors in the gradient definitions
- Changing the route path design
- Updating icon size and anchor points

## Browser Compatibility
- Supports all modern browsers with SVG support
- Responsive design that scales appropriately
- Optimized for web mapping applications 