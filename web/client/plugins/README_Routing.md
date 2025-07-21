# Routing Plugin - Point & Marker Drawing Functionality

## Overview

The Routing plugin has been enhanced with point and marker drawing functionality that allows users to place both simple points and styled markers on the map for routing purposes.

## Features

### Drawing Modes
- **Points**: Simple geometric points with basic styling
- **Markers**: Styled points with icons and enhanced visual appearance

### Drawing Controls
- **Mode Selection**: Toggle between Point and Marker drawing modes
- **Draw**: Click the draw button to start placing points/markers on the map
- **Stop Drawing**: Click "Stop" to end the drawing session
- **Clear Points**: Click "Clear" to remove all drawn points and markers

### User Interface
- **Mode Selector**: Radio buttons to choose between Point and Marker modes
- **Drawing Toolbar**: Contains buttons for drawing, stopping, and clearing
- **Status Indicator**: Shows when drawing mode is active
- **Points/Markers List**: Displays all drawn features with their coordinates and types
- **Instructions**: Provides guidance when no features are drawn

## How to Use

1. **Open the Routing Plugin**: Click on the "Routing" button in the sidebar menu
2. **Select Drawing Mode**: Choose between "Points" or "Markers" using the toggle buttons
3. **Start Drawing**: Click "Draw Points" or "Draw Markers" to activate drawing mode
4. **Place Features**: Click anywhere on the map to place points or markers
5. **View Features**: Drawn features are listed in the dialog with their coordinates and types
6. **Stop Drawing**: Click "Stop" when finished placing features
7. **Clear Features**: Use "Clear" to remove all features and start over

## Visual Differences

### Points
- Simple geometric circles or squares
- Basic styling with fill and stroke colors
- Smaller visual footprint
- Good for precise location marking

### Markers
- Styled with icons (map markers)
- Larger visual presence
- More prominent appearance
- Better for user-friendly location marking

## Technical Implementation

### Components
- **Routing Component**: Main plugin component with drawing interface
- **Mode Selector**: ToggleButtonGroup for switching between drawing modes
- **Drawing State Management**: Uses Redux to manage drawing status and features
- **Feature Storage**: Maintains list of drawn features with unique IDs and types

### Redux Integration
- **Actions**: Uses `changeDrawingStatus` from the draw actions
- **State**: Connects to `state.draw` for drawing status and features
- **Reducer**: Handles drawing state changes in the Routing reducer

### Drawing Workflow
1. User selects drawing mode (Point/Marker) → updates local state
2. User clicks draw button → dispatches `changeDrawingStatus('start', mode, 'routing')`
3. Map enters drawing mode → user can click to place features
4. Features are captured → stored in `tempFeatures` and displayed in UI
5. User clicks "Stop" → dispatches `changeDrawingStatus('clean')`
6. Drawing mode ends → features remain visible in the list

### Feature Types
- **Point**: Uses 'Point' geometry type with basic styling
- **Marker**: Uses 'Marker' geometry type with icon styling
- Both types store their drawing mode for display purposes

## Configuration

The plugin is already configured in:
- `localConfig.json`: Plugin is enabled in the sidebar
- `pluginsConfig.json`: Plugin metadata and settings
- Translation files: UI text is internationalized

## Future Enhancements

Potential improvements for the routing functionality:
- Route calculation between drawn points/markers
- Feature reordering and editing
- Export/import of feature collections
- Integration with routing services
- Distance and time calculations
- Custom marker icons and styles
- Feature labeling and annotation

## Dependencies

- React Bootstrap for UI components (including ToggleButtonGroup)
- Redux for state management
- MapStore2 drawing system for map interactions
- UUID for unique feature identification 