export interface CarbonCalculation {
  computeTimeMs: number;
  energyKwh: number;
  co2Grams: number;
  provider: string;
  model: string;
  equivalents: {
    trees: number;
    carMiles: number;
    phoneCharges: number;
  };
  offsetCost: number;
}

export interface ModelPowerConsumption {
  [provider: string]: {
    [model: string]: number; // watts
  };
}

export class CarbonCalculator {
  // Average power consumption per AI provider/model (watts)
  // Based on industry estimates and research
  private readonly POWER_CONSUMPTION: ModelPowerConsumption = {
    openai: {
      'gpt-4': 300,
      'gpt-4-turbo': 280,
      'gpt-3.5-turbo': 150,
      'gpt-3.5-turbo-16k': 180,
    },
    anthropic: {
      'claude-3-opus': 280,
      'claude-3-sonnet': 200,
      'claude-3-haiku': 120,
      'claude-2': 250,
    },
    google: {
      'gemini-pro': 250,
      'gemini-pro-vision': 280,
      'gemini-ultra': 320,
    },
  };

  // Carbon intensity by region (gCO2/kWh)
  private readonly CARBON_INTENSITY = {
    'us-east': 385,      // US East Coast average
    'us-west': 250,      // US West Coast (more renewable)
    'eu-west': 200,      // EU Western Europe
    'asia-pacific': 450, // Asia Pacific average
    global: 385,         // Global average
  };

  // Carbon offset cost per ton (USD)
  private readonly OFFSET_COST_PER_TON = 15;

  /**
   * Calculate carbon footprint for AI model inference
   */
  calculate(
    provider: string,
    model: string,
    computeTimeMs: number,
    region: string = 'global'
  ): CarbonCalculation {
    // Get power consumption for model (default to 200W if unknown)
    const powerWatts =
      this.POWER_CONSUMPTION[provider]?.[model] || 200;

    // Calculate energy consumption
    const computeTimeHours = computeTimeMs / (1000 * 60 * 60);
    const energyKwh = (powerWatts * computeTimeHours) / 1000;

    // Get carbon intensity for region
    const carbonIntensity =
      this.CARBON_INTENSITY[region as keyof typeof this.CARBON_INTENSITY] ||
      this.CARBON_INTENSITY.global;

    // Calculate CO2 emissions
    const co2Grams = energyKwh * carbonIntensity;

    // Calculate equivalents
    const equivalents = this.calculateEquivalents(co2Grams);

    // Calculate offset cost
    const offsetCost = (co2Grams / 1000000) * this.OFFSET_COST_PER_TON;

    return {
      computeTimeMs,
      energyKwh,
      co2Grams,
      provider,
      model,
      equivalents,
      offsetCost,
    };
  }

  /**
   * Calculate real-world equivalents for CO2 emissions
   */
  private calculateEquivalents(co2Grams: number) {
    // 1 tree absorbs ~21kg CO2 per year
    const trees = Math.ceil((co2Grams / 1000) / 21);

    // 1 mile driven = ~404g CO2
    const carMiles = co2Grams / 404;

    // 1 phone charge = ~8g CO2
    const phoneCharges = co2Grams / 8;

    return {
      trees,
      carMiles: Math.round(carMiles * 100) / 100,
      phoneCharges: Math.round(phoneCharges),
    };
  }

  /**
   * Format carbon footprint for display
   */
  formatCarbonFootprint(co2Grams: number): string {
    if (co2Grams < 1) {
      return `${(co2Grams * 1000).toFixed(2)}mg CO₂`;
    } else if (co2Grams < 1000) {
      return `${co2Grams.toFixed(2)}g CO₂`;
    } else {
      return `${(co2Grams / 1000).toFixed(2)}kg CO₂`;
    }
  }

  /**
   * Get offset recommendations
   */
  getOffsetRecommendation(co2Grams: number): {
    trees: number;
    cost: number;
    methods: Array<{
      name: string;
      description: string;
      cost: number;
    }>;
  } {
    const trees = Math.ceil((co2Grams / 1000) / 21);
    const cost = (co2Grams / 1000000) * this.OFFSET_COST_PER_TON;

    const methods = [
      {
        name: 'Tree Planting',
        description: `Plant ${trees} tree${trees > 1 ? 's' : ''} to offset this carbon`,
        cost: trees * 1.5, // $1.5 per tree
      },
      {
        name: 'Renewable Energy Credits',
        description: 'Purchase renewable energy certificates',
        cost: cost * 0.8,
      },
      {
        name: 'Carbon Capture',
        description: 'Support direct air capture technology',
        cost: cost * 1.2,
      },
    ];

    return { trees, cost, methods };
  }

  /**
   * Compare carbon footprint across providers
   */
  compareProviders(
    computeTimeMs: number,
    region: string = 'global'
  ): Array<{
    provider: string;
    model: string;
    co2Grams: number;
    formatted: string;
  }> {
    const comparisons: Array<{
      provider: string;
      model: string;
      co2Grams: number;
      formatted: string;
    }> = [];

    for (const [provider, models] of Object.entries(this.POWER_CONSUMPTION)) {
      for (const [model, _] of Object.entries(models)) {
        const result = this.calculate(provider, model, computeTimeMs, region);
        comparisons.push({
          provider,
          model,
          co2Grams: result.co2Grams,
          formatted: this.formatCarbonFootprint(result.co2Grams),
        });
      }
    }

    // Sort by lowest carbon footprint
    return comparisons.sort((a, b) => a.co2Grams - b.co2Grams);
  }

  /**
   * Calculate total carbon footprint for multiple datasets
   */
  calculateTotal(calculations: CarbonCalculation[]): {
    totalCo2Grams: number;
    totalEnergyKwh: number;
    totalOffsetCost: number;
    formatted: string;
    equivalents: {
      trees: number;
      carMiles: number;
      phoneCharges: number;
    };
  } {
    const totalCo2Grams = calculations.reduce((sum, c) => sum + c.co2Grams, 0);
    const totalEnergyKwh = calculations.reduce((sum, c) => sum + c.energyKwh, 0);
    const totalOffsetCost = calculations.reduce((sum, c) => sum + c.offsetCost, 0);

    return {
      totalCo2Grams,
      totalEnergyKwh,
      totalOffsetCost,
      formatted: this.formatCarbonFootprint(totalCo2Grams),
      equivalents: this.calculateEquivalents(totalCo2Grams),
    };
  }

  /**
   * Get sustainability rating (A-F scale)
   */
  getSustainabilityRating(co2Grams: number): {
    rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    description: string;
    color: string;
  } {
    if (co2Grams < 10) {
      return {
        rating: 'A',
        description: 'Excellent - Very low carbon footprint',
        color: 'green',
      };
    } else if (co2Grams < 50) {
      return {
        rating: 'B',
        description: 'Good - Low carbon footprint',
        color: 'lightgreen',
      };
    } else if (co2Grams < 100) {
      return {
        rating: 'C',
        description: 'Average - Moderate carbon footprint',
        color: 'yellow',
      };
    } else if (co2Grams < 200) {
      return {
        rating: 'D',
        description: 'Below Average - High carbon footprint',
        color: 'orange',
      };
    } else if (co2Grams < 500) {
      return {
        rating: 'E',
        description: 'Poor - Very high carbon footprint',
        color: 'red',
      };
    } else {
      return {
        rating: 'F',
        description: 'Critical - Extremely high carbon footprint',
        color: 'darkred',
      };
    }
  }
}

// Singleton instance
export const carbonCalculator = new CarbonCalculator();
