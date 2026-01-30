export interface ValidationStrategy {
  name: string;
  validate(data: any[], column: string, threshold?: number): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  failedRows: number[];
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export class CompletenessStrategy implements ValidationStrategy {
  name = 'Completeness';

  validate(data: any[], column: string): ValidationResult {
    const failedRows: number[] = [];
    
    data.forEach((row, index) => {
      const value = row[column];
      if (value === null || value === undefined || value === '') {
        failedRows.push(index);
      }
    });

    const failureRate = failedRows.length / data.length;
    const isValid = failureRate === 0;

    return {
      isValid,
      failedRows,
      message: isValid 
        ? `All ${data.length} rows have complete ${column} values`
        : `${failedRows.length} rows (${(failureRate * 100).toFixed(1)}%) have missing ${column} values`,
      severity: failureRate > 0.1 ? 'critical' : failureRate > 0.01 ? 'warning' : 'info',
    };
  }
}

export class NumericalRangeStrategy implements ValidationStrategy {
  name = 'NumericalRange';

  validate(data: any[], column: string, threshold: number = 3): ValidationResult {
    const failedRows: number[] = [];
    const values: number[] = [];

    data.forEach((row) => {
      const value = row[column];
      if (typeof value === 'number' && !isNaN(value)) {
        values.push(value);
      }
    });

    if (values.length === 0) {
      return {
        isValid: false,
        failedRows: [],
        message: `No valid numerical values found in ${column}`,
        severity: 'warning',
      };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    data.forEach((row, index) => {
      const value = row[column];
      if (typeof value === 'number' && !isNaN(value)) {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > threshold) {
          failedRows.push(index);
        }
      }
    });

    const failureRate = failedRows.length / data.length;
    const isValid = failedRows.length === 0;

    return {
      isValid,
      failedRows,
      message: isValid
        ? `All ${column} values within ${threshold} standard deviations (μ=${mean.toFixed(2)}, σ=${stdDev.toFixed(2)})`
        : `${failedRows.length} anomalies detected in ${column} (z-score > ${threshold})`,
      severity: failureRate > 0.05 ? 'critical' : failureRate > 0.01 ? 'warning' : 'info',
    };
  }
}

export class UniquenessStrategy implements ValidationStrategy {
  name = 'Uniqueness';

  validate(data: any[], column: string): ValidationResult {
    const seen = new Map<any, number[]>();
    const failedRows: number[] = [];

    data.forEach((row, index) => {
      const value = row[column];
      if (value !== null && value !== undefined) {
        if (seen.has(value)) {
          const indices = seen.get(value)!;
          if (indices.length === 1) {
            failedRows.push(indices[0]);
          }
          failedRows.push(index);
          indices.push(index);
        } else {
          seen.set(value, [index]);
        }
      }
    });

    const duplicateCount = failedRows.length;
    const isValid = duplicateCount === 0;

    return {
      isValid,
      failedRows,
      message: isValid
        ? `All ${data.length} ${column} values are unique`
        : `${duplicateCount} duplicate ${column} values detected`,
      severity: duplicateCount > 0 ? 'critical' : 'info',
    };
  }
}

export class ValidationEngine {
  private strategies: Map<string, ValidationStrategy> = new Map();

  constructor() {
    this.registerStrategy(new CompletenessStrategy());
    this.registerStrategy(new NumericalRangeStrategy());
    this.registerStrategy(new UniquenessStrategy());
  }

  registerStrategy(strategy: ValidationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  validate(strategyName: string, data: any[], column: string, threshold?: number): ValidationResult {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown validation strategy: ${strategyName}`);
    }
    return strategy.validate(data, column, threshold);
  }

  validateAll(data: any[], config: ValidationConfig[]): ValidationResult[] {
    return config.map((cfg) => this.validate(cfg.strategy, data, cfg.column, cfg.threshold));
  }
}

export interface ValidationConfig {
  strategy: string;
  column: string;
  threshold?: number;
}