# Graphs Module

Historical data visualization with multiple chart types and customization options.

## Features

- **4 chart types** - Line, bar, pie, and donut charts
- **Multiple data sources** - Add multiple entities to single chart
- **Time period selection** - From 1 hour to 1 year of historical data
- **Aggregation options** - Average, sum, min, max, median, first, last, count, delta
- **Customization** - Colors, legend, grid, tooltips, and more
- **Responsive design** - Charts adapt to container size

## Configuration

### Chart Type

- **Line Chart** - Continuous data over time
- **Bar Chart** - Discrete data comparison
- **Pie Chart** - Part-to-whole relationships
- **Donut Chart** - Pie chart with center space

### Data Sources

- **Add Entity** - Select entities to plot
- **Display Name** - Optional custom name for entity
- **Attribute** - Use entity state or specific attribute
- **Use as Card Info** - Show entity info in card header

### Display Options

- **Show Graph Title** - Display chart title
- **Chart Title** - Custom title text
- **Time Period** - Historical data range (1h to 365d)
- **Normalize Values** - Scale different units to same range
- **Chart Height** - Chart height in pixels
- **Chart Width** - Chart width as percentage
- **Chart Alignment** - Left, center, right alignment

### Chart Options

- **Show Legend** - Display data series legend
- **Legend Position** - Top, bottom, left, right, or hidden
- **Show Grid** - Display background grid
- **Show Tooltips** - Interactive data tooltips
- **Background Color** - Chart background color

### Line Chart Options

- **Show Points** - Display data points
- **Fill Area** - Fill area under line
- **Line Style** - Solid, dashed, or dotted
- **Line Width** - Line thickness
- **Smooth Lines** - Curved line interpolation

### Pie/Donut Options

- **Show Title in Slice** - Display labels in pie slices
- **Show Value in Slice** - Display values in pie slices
- **Add Slice Gap** - Space between pie slices

## Time Periods

- **1h** - Last Hour
- **3h** - Last 3 Hours
- **6h** - Last 6 Hours
- **12h** - Last 12 Hours
- **24h** - Last 24 Hours
- **2d** - Last 2 Days
- **7d** - Last Week
- **30d** - Last Month
- **90d** - Last 3 Months
- **365d** - Last Year

## Examples

### Temperature Trend

Line chart showing temperature over the last 24 hours.

### Energy Usage

Bar chart comparing daily energy usage over the last week.

### Sensor Comparison

Multi-line chart comparing temperature and humidity trends.

### Device Status

Pie chart showing percentage of time devices were active.
