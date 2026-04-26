# Power BI Spider Chart

A custom spider/radar chart visual for Power BI with auto-scaling, collision-aware value labels, and rich formatting options.

![Spider Chart Preview](assets/icon-preview.png)

## Features

### Data Visualization
- **Per-Axis Auto-Scaling**: Each axis independently scales based on its own data range for accurate representation
- **Global Scale Mode**: Use a single unified scale across all axes for direct comparison
- **Multiple Series Support**: Overlay multiple polygons (e.g., Player A vs Player B vs Player C)
- **Smart Value Labels**: Collision-aware positioning with 4 fallback distances — labels never overlap
- **Axis Scale Values**: Optional tick labels displayed along each axis
- **Highlight Support**: Cross-filtering from other visuals dims non-selected data

### Formatting Options
| Card | Controls |
|------|----------|
| **Spider Shape** | Polygon or Circle grid, Start Angle (-180° to 180°) |
| **Grid Lines** | Show/hide, Grid levels (2–15), Color, Stroke width |
| **Axis Labels** | Show/hide, Font size, Color |
| **Axis Scale** | Show/hide scale values along axes, Font size, Color |
| **Value Labels** | Show/hide data point values, Font size, Color |
| **Data Points** | Fill opacity (0–100%), Stroke width, Show dots, Dot size |
| **Series Colors** | 6 individual color pickers for each series |
| **Legend** | Show/hide, Font size, Position (Top/Bottom/Left/Right) |
| **Scale Settings** | Auto Scale toggle, Min/Max override values |

### Interactive Features
- **Tooltips** on hover over data points
- **Click-to-select** for cross-filtering with other visuals
- **Responsive layout** — chart auto-fits the viewport

## Installation

### From Package
1. Download the `.pbiviz` file from the `dist/` folder
2. Open Power BI Desktop
3. Go to **Visualizations** pane → **Import a visual from a file** (three dots menu)
4. Select the downloaded `.pbiviz` file
5. The Spider Chart visual will appear in your visualizations pane

### From Source
```bash
# Clone the repository
git clone https://github.com/belcouact/powerbi-spiderChart.git
cd powerbi-spiderChart

# Install dependencies
npm install

# Start development server (hot-reload)
npm run start

# Build for production
npm run pbiviz package
```

The packaged visual will be output to the `dist/` folder.

## Usage

### Data Fields
| Field | Type | Description |
|-------|------|-------------|
| **Axis Category** | Grouping | Labels for each axis (e.g., Speed, Strength, Agility) |
| **Legend Series** | Grouping | Series for multiple overlapping polygons (e.g., Player A, Player B) |
| **Axis Value** | Measure | Numeric values for each axis |

### Sample Data
```csv
Category,Series,Value
Speed,Player A,85
Strength,Player A,72
Agility,Player A,90
Endurance,Player A,68
Defense,Player A,78
Power,Player A,82
Speed,Player B,70
Strength,Player B,88
Agility,Player B,65
Endurance,Player B,92
Defense,Player B,85
Power,Player B,75
```

### Tips
- **Auto Scale ON**: Each axis scales independently — best when axes measure different units or ranges
- **Auto Scale OFF**: All axes share the same scale — best for direct comparison across axes
- **Min Override**: Acts as a floor value when auto-scaling is enabled
- **Value Labels**: When labels overlap, the algorithm tries 4 positions before hiding the label to keep the chart readable

## Project Structure
```
powerbi-spiderChart/
├── assets/              # Visual icons
│   ├── icon.png         # 32x32 main icon
│   ├── icon-20.png      # 20x20 pane icon
│   └── icon-preview.png # 64x64 preview
├── dist/                # Packaged .pbiviz file
├── src/
│   ├── visual.ts        # Main visual rendering logic
│   └── settings.ts      # Formatting settings model
├── style/
│   └── visual.less      # Visual styles
├── capabilities.json    # Data roles and formatting properties
├── pbiviz.json          # Visual metadata
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## Technologies
- **Power BI Visuals API** 5.3.0
- **D3.js** for SVG rendering
- **TypeScript** for type-safe development
- **powerbi-visuals-utils-formattingmodel** for formatting pane

## License
MIT

## Author
Alex Luo — aluo@wlgore.com
