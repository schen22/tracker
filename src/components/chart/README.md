# Chart Components Architecture

This directory contains the refactored chart components for the TrendAnalysis module, organized for better modularity and maintainability.

## Component Structure

### Core Components

#### `HourlyChart.js`
- **Purpose**: Main chart component that orchestrates all sub-components
- **Responsibilities**: Layout, data flow coordination, and integration
- **Dependencies**: All sub-components and custom hooks

#### `ChartLines.js`
- **Purpose**: Renders all chart lines (pees, poops, activities)
- **Responsibilities**: Line configuration, opacity management for hidden lines
- **Features**: Centralized line styling and behavior

#### `NighttimeControls.js`
- **Purpose**: UI controls for nighttime exclusion settings
- **Responsibilities**: Checkbox and time selectors for nighttime configuration
- **Features**: Configurable start/end times, toggle functionality

#### `PatternAnalysisCard.js`
- **Purpose**: Displays pattern analysis results
- **Responsibilities**: Formatted display of insights and tips
- **Features**: Styled card with bullet points and helpful tips

## Utility Modules

### `src/utils/patternAnalysis.js`
- **Purpose**: Business logic for pattern detection and analysis
- **Key Functions**:
  - `generatePatternAnalysis()` - Main analysis orchestrator
  - `getPeakHours()` - Finds peak activity hours
  - `analyzeFeedingCorrelation()` - Feeding/bathroom correlations
  - `analyzeTrainingCorrelation()` - Training/bathroom correlations
  - `findQuietPeriods()` - Identifies inactive periods
  - `findMostActiveHour()` - Peak bathroom activity detection
  - `isNighttime()` - Nighttime range checking

### `src/utils/hourlyDataTransform.js`
- **Purpose**: Data transformation and processing utilities
- **Key Functions**:
  - `transformHourlyData()` - Main transformation pipeline
  - `createComplete24HourData()` - Fill missing hours with zeros
  - `filterActivitiesByDays()` - Date range filtering
  - `calculateHourlyActivityFrequency()` - Activity counting by hour
  - `combineDataWithActivities()` - Merge potty and activity data

### `src/hooks/useHourlyChart.js`
- **Purpose**: Custom hook for chart state management
- **Responsibilities**:
  - State management (hidden lines, nighttime settings)
  - Data processing orchestration
  - Event handler coordination
  - Memoized computations for performance

## Benefits of This Architecture

### 🧩 **Modularity**
- Each component has a single, well-defined responsibility
- Components can be tested and modified independently
- Easier to add new chart types or modify existing ones

### 🔧 **Maintainability** 
- Business logic separated from UI components
- Utility functions are pure and testable
- Clear separation of concerns

### 🚀 **Reusability**
- Utility functions can be used across different components
- Chart components can be easily composed in different ways
- Pattern analysis logic is framework-agnostic

### 🎯 **Testability**
- Each module can be unit tested independently
- Pure functions make testing predictable
- Mock dependencies are easier to manage

### 📚 **Readability**
- Smaller, focused files are easier to understand
- Clear naming conventions and documentation
- Logical organization of related functionality

## Usage Example

```javascript
import HourlyChart from './chart/HourlyChart';

// Simple usage - the component handles all complexity internally
<HourlyChart
  data={hourlyTrends}
  title="Hourly Potty & Activity Patterns (Last 7 Days)"
  activities={activities}
  height={200}
/>
```

## Future Enhancements

This modular structure makes it easy to add:
- Additional chart types (bar charts, scatter plots)
- New pattern analysis algorithms
- Different time ranges (daily, weekly, monthly)
- Export functionality for charts and data
- Custom theming and styling options

## Testing

Each module should be tested independently:
- **Utilities**: Unit tests for pure functions
- **Hooks**: Custom hook testing with React Testing Library
- **Components**: Integration tests for UI behavior
- **End-to-end**: Full chart functionality testing