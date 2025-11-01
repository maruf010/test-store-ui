# Home Construction Cost Calculator

An Angular application for calculating home construction costs with Bangladesh division and district selection.

## Features

- Division (State) selection dropdown
- District (City) selection based on selected division
- Area input field
- Area unit selection (Sq. Feet / Sq. Meter)
- Responsive design

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Usage

1. Click the "Cost Calculator" button to open the calculator
2. Select a state (division) from the dropdown
3. Select a city (district) from the dropdown
4. Enter the area value
5. Choose the area unit (Sq. Feet or Sq. Meter)
6. Click "Next" to proceed

## Project Structure

```
src/
  app/
    app.component.ts      # Main component with logic
    app.component.html    # Main component template
    app.component.css     # Main component styles
    app.module.ts         # App module
  styles.css              # Global styles
  index.html              # Main HTML file
  main.ts                 # Bootstrap file
```

## Technologies Used

- Angular 17
- TypeScript
- HTML/CSS

