import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

declare const Chart: {
  new (context: CanvasRenderingContext2D | HTMLCanvasElement | { canvas: HTMLCanvasElement } | string, config: any): any;
  register(...args: any[]): void;
  helpers: any;
};

interface Division {
  name: string;
  districts: string[];
}

interface Phase {
  name: string;
  days: number;
  cost: number;
  color: string;
  percent: number;
  startDay?: number;
}

interface QualityOption {
  label: string;
  value: string;
}

interface Resource {
  name: string;
  icon: string;
  quantity: string;
  quality: string;
  amount: number;
  qualityOptions: QualityOption[];
  selectedQuality: string;
  baseQuantity: number; // Store numeric quantity for calculation
  baseUnitPrice: number; // Base price per unit
}

// Chart.js configuration for the pie chart
const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

const CHART_LABELS = [
  'Brickwork and Plastering',
  'Flooring & Tiling',
  'Electric Wiring',
  'Home Design & Approval',
  'Excavation',
  'Footing & Foundation'
];

const CHART_DATA = [25, 20, 15, 10, 15, 15];
const CHART_BACKGROUND_COLORS = [
  'rgb(255, 182, 193)', // Pink
  'rgb(128, 0, 128)',   // Purple
  'rgb(255, 165, 0)',   // Orange
  'rgb(255, 255, 0)',   // Yellow
  'rgb(0, 128, 0)',     // Green
  'rgb(0, 0, 0)'        // Black
];

@Component({
  selector: 'app-cost-calculator',
  templateUrl: './cost-calculator.component.html',
  styleUrls: ['./cost-calculator.component.scss']
})
export class CostCalculatorComponent implements AfterViewInit {
  @ViewChild('pieChart') private chartRef!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  ngAfterViewInit() {
    this.initChart();
  }
  
  costItems: Array<{name: string, color: string, percent: number}> = [];
  
  // Color mapping for phases
  private phaseColors: { [key: string]: string } = {
    'Home Design & Approval': '#FFFF00',
    'Excavation': '#008000',
    'Footing & Foundation': '#000000',
    'RCC Work - Columns & Slabs': '#0000FF',
    'Roof Slab': '#FF0000',
    'Brickwork and Plastering': '#FFC0CB',
    'Flooring & Tiling': '#800080',
    'Electric Wiring': '#FFA500',
    'Water Supply & Plumbing': '#808080',
    'Door': '#A52A2A'
  };

  tooltip = {
    visible: false,
    x: 0,
    y: 0,
    text: '',
    color: ''
  };

  get conicGradient() {
    if (!this.costItems || this.costItems.length === 0) {
      return '';
    }
    let currentDeg = 0;
    const totalPercent = this.costItems.reduce((sum, i) => sum + i.percent, 0);
    return this.costItems
      .map((item) => {
        const angle = (item.percent / totalPercent) * 360;
        const nextDeg = currentDeg + angle;
        const gradient = `${item.color} ${currentDeg}deg ${nextDeg}deg`;
        currentDeg = nextDeg;
        return gradient;
      })
      .join(', ');
  }

  // 🟡 Show tooltip on hover or click
  showTooltip(event: MouseEvent, item: any) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const donutRect = (event.currentTarget as HTMLElement).closest('.donut-chart')?.getBoundingClientRect();
    
    if (donutRect) {
      // Calculate position relative to donut chart
      this.tooltip.x = event.clientX - donutRect.left;
      this.tooltip.y = event.clientY - donutRect.top;
    } else {
      this.tooltip.x = event.offsetX + 10;
      this.tooltip.y = event.offsetY + 10;
    }
    
    // Store the color for this slice
    this.tooltip.color = item.color;
    
    // Find matching phase to get cost
    const phase = this.phases.find(p => p.name === item.name);
    if (phase && this.totalCost > 0) {
      const cost = phase.cost;
      // Create HTML with colored text
      this.tooltip.text = `<span style="color: ${item.color}; font-weight: bold;">${item.name}</span><br><span style="color: ${item.color}; font-weight: bold;">${item.percent}%</span> | BDT ${cost.toLocaleString()}`;
    } else {
      this.tooltip.text = `<span style="color: ${item.color}; font-weight: bold;">${item.name}</span><br><span style="color: ${item.color}; font-weight: bold;">${item.percent}%</span>`;
    }
    
    this.tooltip.visible = true;
  }

  hideTooltip() {
    this.tooltip.visible = false;
    this.tooltip.color = '';
  }

  // Get contrasting text color (black or white) based on background color
  getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Add missing properties
  selectedDivision: string = '';
  selectedDistrict: string = '';
  area: number = 5000;
  areaUnit: string = 'sqft';
  districts: string[] = [];
  showResults: boolean = false;
  
  phases: Phase[] = [];
  totalDays: number = 0;
  totalCost: number = 0;
  resources: Resource[] = [];

  divisions: Division[] = [
    {
      name: 'Dhaka',
      districts: ['Dhaka', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Tangail', 'Kishoreganj', 'Manikganj', 'Munshiganj', 'Faridpur', 'Madaripur', 'Shariatpur', 'Rajbari', 'Gopalganj']
    },
    {
      name: 'Mymensingh',
      districts: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur']
    },
    {
      name: 'Chittagong',
      districts: ['Chittagong', 'Cox\'s Bazar', 'Rangamati', 'Bandarban', 'Khagrachhari', 'Feni', 'Noakhali', 'Lakshmipur', 'Chandpur', 'Comilla', 'Brahmanbaria']
    },
    {
      name: 'Rajshahi',
      districts: ['Rajshahi', 'Pabna', 'Bogra', 'Sirajganj', 'Chapainawabganj', 'Naogaon', 'Natore', 'Joypurhat']
    },
    {
      name: 'Khulna',
      districts: ['Khulna', 'Bagerhat', 'Satkhira', 'Jessore', 'Jhenaidah', 'Magura', 'Narail', 'Kushtia', 'Meherpur', 'Chuadanga']
    },
    {
      name: 'Barisal',
      districts: ['Barisal', 'Bhola', 'Patuakhali', 'Barguna', 'Pirojpur', 'Jhalokathi']
    },
    {
      name: 'Sylhet',
      districts: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj']
    },
    {
      name: 'Rangpur',
      districts: ['Rangpur', 'Dinajpur', 'Lalmonirhat', 'Kurigram', 'Gaibandha', 'Nilphamari', 'Panchagarh', 'Thakurgaon']
    }
  ];

  // Add missing methods
  onMouseMove(event: MouseEvent) {
    // This can be used for general mouse tracking if needed
  }

  getSliceStyle(index: number): any {
    const item = this.costItems[index];
    const totalPercent = this.costItems.reduce((sum, i) => sum + i.percent, 0);
    let startAngle = 0;
    
    for (let i = 0; i < index; i++) {
      startAngle += (this.costItems[i].percent / totalPercent) * 360;
    }
    
    const angle = (item.percent / totalPercent) * 360;
    const endAngle = startAngle + angle;
    
    // Convert angles to radians (starting from top, clockwise)
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    // Calculate positions for the slice path (using percentage-based coordinates)
    const center = 50;
    const innerRadius = 23.4375; // 150px / 320px * 50% ≈ 23.4375%
    const outerRadius = 50;
    
    // Inner arc points
    const innerX1 = center + innerRadius * Math.cos(startAngleRad);
    const innerY1 = center + innerRadius * Math.sin(startAngleRad);
    const innerX2 = center + innerRadius * Math.cos(endAngleRad);
    const innerY2 = center + innerRadius * Math.sin(endAngleRad);
    
    // Outer arc points
    const outerX1 = center + outerRadius * Math.cos(startAngleRad);
    const outerY1 = center + outerRadius * Math.sin(startAngleRad);
    const outerX2 = center + outerRadius * Math.cos(endAngleRad);
    const outerY2 = center + outerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Create SVG path for the slice (donut segment)
    const path = `M ${outerX1} ${outerY1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`;
    
    return {
      clipPath: `path('${path}')`,
      cursor: 'pointer'
    };
  }

  onDivisionChange() {
    const division = this.divisions.find(d => d.name === this.selectedDivision);
    if (division) {
      this.districts = division.districts;
      this.selectedDistrict = ''; // Reset district selection
    } else {
      this.districts = [];
      this.selectedDistrict = '';
    }
  }

  onNext() {
    if (!this.selectedDivision || !this.selectedDistrict || !this.area) {
      alert('Please fill in all fields');
      return;
    }

    // Convert area to square feet if needed
    const areaInSqft = this.areaUnit === 'sqm' ? this.area * 10.764 : this.area;
    
    // Calculate costs based on area
    this.calculateCosts(areaInSqft);
    this.showResults = true;
  }

  onReset() {
    this.selectedDivision = '';
    this.selectedDistrict = '';
    this.area = 5000;
    this.areaUnit = 'sqft';
    this.districts = [];
    this.showResults = false;
    this.phases = [];
    this.totalDays = 0;
    this.totalCost = 0;
    this.resources = [];
  }

  calculateCosts(areaInSqft: number) {
    // Cost per square foot for Bangladesh construction (varies by division/city)
    // Average cost: 1000-1500 BDT per sqft for basic construction
    let costPerSqft = 1200; // Default in BDT
    
    // Adjust cost based on selected division/city (premium cities have higher costs)
    const premiumCities = ['Dhaka', 'Chittagong', 'Gazipur', 'Narayanganj'];
    if (this.selectedDistrict && premiumCities.includes(this.selectedDistrict)) {
      costPerSqft = 1500;
    } else if (this.selectedDivision && ['Dhaka', 'Chittagong'].includes(this.selectedDivision)) {
      costPerSqft = 1400;
    } else if (this.selectedDivision && ['Rajshahi', 'Khulna', 'Sylhet'].includes(this.selectedDivision)) {
      costPerSqft = 1300;
    }
    
    const baseCost = areaInSqft * costPerSqft;

    // Define phases with percentages
    const phasePercentages = [
      { name: 'Home Design & Approval', percent: 3.5, days: 46, color: '#FFE5CC' },
      { name: 'Excavation', percent: 1.8, days: 14, color: '#FFFF00' },
      { name: 'Footing & Foundation', percent: 13.1, days: 41, color: '#00FF00' },
      { name: 'RCC Work - Columns & Slabs', percent: 8.7, days: 17, color: '#000000' },
      { name: 'Roof Slab', percent: 7.3, days: 37, color: '#FF0000' },
      { name: 'Brickwork and Plastering', percent: 1.4, days: 8, color: '#808080' },
      { name: 'Flooring & Tiling', percent: 6.3, days: 25, color: '#FF69B4' },
      { name: 'Electric Wiring', percent: 1.8, days: 14, color: '#800080' },
      { name: 'Water Supply & Plumbing', percent: 1.1, days: 30, color: '#FFA500' },
      { name: 'Door', percent: 3.3, days: 15, color: '#404040' }
    ];

    // Calculate cumulative start days for Gantt chart
    let cumulativeDays = 0;
    this.phases = phasePercentages.map(phase => {
      const phaseData = {
        name: phase.name,
        days: phase.days,
        cost: Math.round(baseCost * phase.percent / 100),
        color: phase.color,
        percent: phase.percent,
        startDay: cumulativeDays
      };
      cumulativeDays += phase.days;
      return phaseData;
    });

    this.totalDays = this.phases.reduce((sum, phase) => sum + phase.days, 0);
    this.totalCost = this.phases.reduce((sum, phase) => sum + phase.cost, 0);

    // Update costItems from phases for donut chart
    this.costItems = this.phases.map(phase => ({
      name: phase.name,
      color: this.phaseColors[phase.name] || phase.color,
      percent: phase.percent
    }));

    // Define resources based on Bangladesh market rates
    // Approximate: 1 bag cement per 1.2 sqft, 4-5 kg steel per sqft
    const cementBags = Math.round(areaInSqft / 1.2);
    const steelKg = Math.round(areaInSqft * 4.5);
    const bricks = Math.round(areaInSqft * 8); // Approximately 8 bricks per sqft
    const sandCft = Math.round(areaInSqft * 1.5);
    const aggregateCft = Math.round(areaInSqft * 1.0);
    const paintSqft = Math.round(areaInSqft * 6); // Painting area calculation
    const flooringSqft = Math.round(areaInSqft * 1.0); // Flooring area
    const windowsSqft = Math.round(areaInSqft * 0.17); // ~17% of area for windows
    const doorsSqft = Math.round(areaInSqft * 0.18); // ~18% of area for doors
    const electricalSqft = Math.round(areaInSqft * 0.15); // ~15% of area for electrical
    const sanitarySqft = Math.round(areaInSqft * 1.0); // Sanitary fittings
    const contractorSqft = areaInSqft; // Contractor work per sqft
    
    // Base unit prices (Medium Grade / Standard)
    const cementBasePrice = 550; // BDT per bag
    const steelBasePrice = 85; // BDT per kg
    const brickBasePrice = 12; // BDT per piece
    const sandBasePrice = 50; // BDT per CFT
    const aggregateBasePrice = 60; // BDT per CFT
    const paintBasePrice = 22; // BDT per sqft for painting
    const flooringBasePrice = 98; // BDT per sqft for flooring
    const windowsBasePrice = 206; // BDT per sqft for windows
    const doorsBasePrice = 267; // BDT per sqft for doors
    const electricalBasePrice = 78; // BDT per sqft for electrical
    const sanitaryBasePrice = 60; // BDT per sqft for sanitary
    const contractorBasePrice = 190; // BDT per sqft for contractor
    const kitchenBasePrice = areaInSqft * 200; // BDT for kitchen work
    
    this.resources = [
      { 
        name: 'Cement', 
        icon: '🏗️', 
        quantity: `${cementBags} Bag`, 
        quality: 'Standard Grade', 
        baseQuantity: cementBags,
        baseUnitPrice: cementBasePrice,
        amount: Math.round(cementBags * cementBasePrice * 1.0), // Standard Grade = 1.0x
        qualityOptions: [
          { label: 'Premium Grade', value: 'Premium Grade' },
          { label: 'Standard Grade', value: 'Standard Grade' },
          { label: 'Basic Grade', value: 'Basic Grade' }
        ],
        selectedQuality: 'Standard Grade'
      },
      { 
        name: 'Steel', 
        icon: '🔩', 
        quantity: `${steelKg} KG`, 
        quality: 'Medium Grade', 
        baseQuantity: steelKg,
        baseUnitPrice: steelBasePrice,
        amount: Math.round(steelKg * steelBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Bricks', 
        icon: '🧱', 
        quantity: `${bricks} Per Piece`, 
        quality: 'Medium Grade', 
        baseQuantity: bricks,
        baseUnitPrice: brickBasePrice,
        amount: Math.round(bricks * brickBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Sand', 
        icon: '🏜️', 
        quantity: `${sandCft} CFT`, 
        quality: 'Medium Grade', 
        baseQuantity: sandCft,
        baseUnitPrice: sandBasePrice,
        amount: Math.round(sandCft * sandBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Aggregate', 
        icon: '🪨', 
        quantity: `${aggregateCft} CFT`, 
        quality: 'Medium Grade', 
        baseQuantity: aggregateCft,
        baseUnitPrice: aggregateBasePrice,
        amount: Math.round(aggregateCft * aggregateBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Painting', 
        icon: '🖌️', 
        quantity: `${paintSqft} Per Sq feet`, 
        quality: 'Medium Grade', 
        baseQuantity: paintSqft,
        baseUnitPrice: paintBasePrice,
        amount: Math.round(paintSqft * paintBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Flooring', 
        icon: '🔲', 
        quantity: `${flooringSqft} Per Sq feet`, 
        quality: 'Medium Grade', 
        baseQuantity: flooringSqft,
        baseUnitPrice: flooringBasePrice,
        amount: Math.round(flooringSqft * flooringBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Windows', 
        icon: '🪟', 
        quantity: `${windowsSqft} Per Sq feet`, 
        quality: 'Medium Grade', 
        baseQuantity: windowsSqft,
        baseUnitPrice: windowsBasePrice,
        amount: Math.round(windowsSqft * windowsBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Doors', 
        icon: '🚪', 
        quantity: `${doorsSqft} Per Sq feet`, 
        quality: 'Medium Grade', 
        baseQuantity: doorsSqft,
        baseUnitPrice: doorsBasePrice,
        amount: Math.round(doorsSqft * doorsBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Electrical fittings', 
        icon: '⚡', 
        quantity: `${electricalSqft} Per Sq feet`, 
        quality: 'Medium Grade', 
        baseQuantity: electricalSqft,
        baseUnitPrice: electricalBasePrice,
        amount: Math.round(electricalSqft * electricalBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Sanitary Fittings', 
        icon: '🚿', 
        quantity: `${sanitarySqft} Per Sq feet`, 
        quality: 'Medium Grade', 
        baseQuantity: sanitarySqft,
        baseUnitPrice: sanitaryBasePrice,
        amount: Math.round(sanitarySqft * sanitaryBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      },
      { 
        name: 'Kitchen Work', 
        icon: '🍽️', 
        quantity: '1 Unit', 
        quality: 'Semi Modular', 
        baseQuantity: 1,
        baseUnitPrice: kitchenBasePrice,
        amount: Math.round(kitchenBasePrice * 1.0), // Semi Modular = 1.0x
        qualityOptions: [
          { label: 'Platform and Sink', value: 'Platform and Sink' },
          { label: 'Semi Modular', value: 'Semi Modular' },
          { label: 'Fully Modular', value: 'Fully Modular' }
        ],
        selectedQuality: 'Semi Modular'
      },
      { 
        name: 'Contractor (RCC, BrickWork, plaster work)', 
        icon: '👷', 
        quantity: `${contractorSqft} Per Sq feet`, 
        quality: 'Medium Grade', 
        baseQuantity: contractorSqft,
        baseUnitPrice: contractorBasePrice,
        amount: Math.round(contractorSqft * contractorBasePrice * 1.0), // Medium Grade = 1.0x
        qualityOptions: [
          { label: 'Basic Grade', value: 'Basic Grade' },
          { label: 'Medium Grade', value: 'Medium Grade' },
          { label: 'Premium Grade', value: 'Premium Grade' }
        ],
        selectedQuality: 'Medium Grade'
      }
    ];
  }

  getTotalResourceAmount(): number {
    return this.resources.reduce((sum, resource) => sum + resource.amount, 0);
  }

  getMaxTimelineDays(): number {
    // Round up to nearest 50 for axis
    return Math.ceil(this.totalDays / 50) * 50 || 300;
  }

  getTimelineTicks(): number[] {
    const maxDays = this.getMaxTimelineDays();
    const ticks: number[] = [];
    const interval = maxDays <= 300 ? 50 : 100;
    for (let i = 0; i <= maxDays; i += interval) {
      ticks.push(i);
    }
    return ticks;
  }

  getPieChartBackground(): string {
    let gradient = 'conic-gradient(';
    let currentAngle = 0;
    
    this.phases.forEach((phase, index) => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + (phase.percent / 100) * 360;
      
      if (index > 0) gradient += ', ';
      gradient += `${phase.color} ${startAngle}deg ${endAngle}deg`;
      
      currentAngle = endAngle;
    });
    
    gradient += ')';
    return gradient;
  }

  onQualityChange(resource: Resource) {
    resource.quality = resource.selectedQuality;
    
    // Calculate price multiplier based on quality
    let priceMultiplier = 1.0; // Default (Medium Grade)
    
    if (resource.name === 'Cement') {
      // Cement: Premium Grade = 1.2x, Standard Grade = 1.0x, Basic Grade = 0.85x
      if (resource.selectedQuality === 'Premium Grade') {
        priceMultiplier = 1.2;
      } else if (resource.selectedQuality === 'Standard Grade') {
        priceMultiplier = 1.0;
      } else if (resource.selectedQuality === 'Basic Grade') {
        priceMultiplier = 0.85;
      }
    } else if (resource.name === 'Kitchen Work') {
      // Kitchen: Fully Modular = 1.5x, Semi Modular = 1.0x, Platform and Sink = 0.6x
      if (resource.selectedQuality === 'Fully Modular') {
        priceMultiplier = 1.5;
      } else if (resource.selectedQuality === 'Semi Modular') {
        priceMultiplier = 1.0;
      } else if (resource.selectedQuality === 'Platform and Sink') {
        priceMultiplier = 0.6;
      }
    } else {
      // For Steel, Bricks, Sand, Aggregate, Painting, Flooring, Windows, Doors, Electrical fittings, Sanitary Fittings, Contractor
      // Premium Grade = 1.3x, Medium Grade = 1.0x, Basic Grade = 0.75x
      if (resource.selectedQuality === 'Premium Grade') {
        priceMultiplier = 1.3;
      } else if (resource.selectedQuality === 'Medium Grade') {
        priceMultiplier = 1.0;
      } else if (resource.selectedQuality === 'Basic Grade') {
        priceMultiplier = 0.75;
      }
    }
    
    // Recalculate amount based on new quality
    resource.amount = Math.round(resource.baseQuantity * resource.baseUnitPrice * priceMultiplier);
  }

  onPrint() {
    const printContent = this.generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  onShare() {
    const shareText = this.generateShareText();
    if (navigator.share) {
      navigator.share({
        title: 'Construction Cost Estimate',
        text: shareText,
      }).catch(err => console.log('Error sharing', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Estimate copied to clipboard!');
      }).catch(err => {
        console.log('Error copying to clipboard', err);
      });
    }
  }

  private generatePrintContent(): string {
    const totalResourceAmount = this.getTotalResourceAmount();
    const currentDate = new Date().toLocaleDateString('en-BD', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let phasesHtml = '';
    this.phases.forEach(phase => {
      const phasePercent = ((phase.cost / this.totalCost) * 100).toFixed(2);
      phasesHtml += `
        <tr>
          <td>${phase.name}</td>
          <td>${phase.days} Days</td>
          <td>${phasePercent}%</td>
          <td>BDT ${phase.cost.toLocaleString()}</td>
        </tr>
      `;
    });

    let resourcesHtml = '';
    this.resources.forEach(resource => {
      resourcesHtml += `
        <tr>
          <td>${resource.icon} ${resource.name}</td>
          <td>${resource.quantity}</td>
          <td>${resource.selectedQuality}</td>
          <td>BDT ${resource.amount.toLocaleString()}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Construction Cost Estimate</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #ffc107;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #333;
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .info-section {
              margin-bottom: 25px;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .total-cost {
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              color: #ff9800;
              margin: 30px 0;
              padding: 20px;
              background: #fffde7;
              border-radius: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background: #ffc107;
              color: #333;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            td {
              padding: 10px 12px;
              border: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              color: #666;
              font-size: 12px;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              margin: 30px 0 15px 0;
              color: #333;
              border-left: 4px solid #ffc107;
              padding-left: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Home Construction Cost Estimate</h1>
            <p>Generated on: ${currentDate}</p>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="info-label">State:</span>
              <span class="info-value">${this.selectedDivision}</span>
            </div>
            <div class="info-row">
              <span class="info-label">City:</span>
              <span class="info-value">${this.selectedDistrict}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Area:</span>
              <span class="info-value">${this.area.toLocaleString()} ${this.areaUnit === 'sqft' ? 'Sq. Feet' : 'Sq. Meter'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Duration:</span>
              <span class="info-value">${this.totalDays} Days</span>
            </div>
          </div>

          <div class="total-cost">
            Total Estimated Cost: BDT ${this.totalCost.toLocaleString()}
          </div>

          <div class="section-title">Timeline Tracking: Cost Per Phase</div>
          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Duration</th>
                <th>Percentage</th>
                <th>Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              ${phasesHtml}
            </tbody>
          </table>

          <div class="section-title">Cost by Resource Allocation</div>
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Quantity</th>
                <th>Quality</th>
                <th>Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              ${resourcesHtml}
            </tbody>
            <tfoot>
              <tr style="background: #fffde7; font-weight: bold;">
                <td colspan="3" style="text-align: right; padding: 15px;">Total Amount:</td>
                <td style="font-size: 18px; color: #ff9800;">BDT ${totalResourceAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p><strong>Disclaimer:</strong> The costs indicated are approximate costs for each resource. Actual cost estimates may vary based on your location, market conditions, and specific requirements. Please consult with your contractor for a detailed estimate.</p>
            <p>This estimate does not include compound wall area.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateShareText(): string {
    const totalResourceAmount = this.getTotalResourceAmount();
    let text = `🏗️ Home Construction Cost Estimate\n\n`;
    text += `📍 Location: ${this.selectedDivision}, ${this.selectedDistrict}\n`;
    text += `📐 Area: ${this.area.toLocaleString()} ${this.areaUnit === 'sqft' ? 'Sq. Feet' : 'Sq. Meter'}\n`;
    text += `💰 Total Estimated Cost: BDT ${this.totalCost.toLocaleString()}\n`;
    text += `⏱️ Total Duration: ${this.totalDays} Days\n\n`;
    text += `📊 Resource Allocation:\n`;
    this.resources.forEach(resource => {
      text += `${resource.icon} ${resource.name}: ${resource.quantity} (${resource.selectedQuality}) - BDT ${resource.amount.toLocaleString()}\n`;
    });
    text += `\n💵 Total Resource Cost: BDT ${totalResourceAmount.toLocaleString()}\n`;
    return text;
  }

  private initChart() {
    if (this.chartRef) {
      const ctx = this.chartRef.nativeElement.getContext('2d');
      
      // Create the chart
      this.chart = new Chart(this.chartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: CHART_LABELS,
          datasets: [{
            data: CHART_DATA,
            backgroundColor: CHART_BACKGROUND_COLORS,
            borderWidth: 2,
            borderColor: '#fff',
            hoverOffset: 10
          }]
        },
        options: {
          cutout: '65%',
          responsive: true,
          maintainAspectRatio: true,
          layout: {
            padding: 80
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: (context: any) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${value}%`;
                }
              }
            }
          }
        },
        plugins: [{
          id: 'customLabels',
          afterDraw: (chart: any) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;
            
            chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
              const meta = chart.getDatasetMeta(datasetIndex);
              
              meta.data.forEach((element: any, index: number) => {
                const model = element;
                const midAngle = (element.startAngle + element.endAngle) / 2;
                
                // Calculate position for label
                const radius = element.outerRadius;
                const labelRadius = radius + 40;
                
                const x = centerX + Math.cos(midAngle) * labelRadius;
                const y = centerY + Math.sin(midAngle) * labelRadius;
                
                // Draw line from segment to label
                ctx.save();
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.beginPath();
                
                const lineStartX = centerX + Math.cos(midAngle) * radius;
                const lineStartY = centerY + Math.sin(midAngle) * radius;
                
                ctx.moveTo(lineStartX, lineStartY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                // Draw label text
                ctx.fillStyle = '#333';
                ctx.font = '14px Arial';
                ctx.textAlign = midAngle < Math.PI ? 'left' : 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(chart.data.labels[index], x + (midAngle < Math.PI ? 10 : -10), y);
                
                ctx.restore();
              });
            });
          }
        }]
      });
    }
  }
}

