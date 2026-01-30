export interface StatisticalSummary {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
}

export function calculateStats(values: number[]): StatisticalSummary {
  if (values.length === 0) {
    return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, q1: 0, q3: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return { mean, median, stdDev, min, max, q1, q3 };
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function detectDrift(baseline: number[], current: number[], bins: number = 10): number {
  const baselineHist = createHistogram(baseline, bins);
  const currentHist = createHistogram(current, bins);

  return calculateKLDivergence(baselineHist, currentHist);
}

function createHistogram(values: number[], bins: number): number[] {
  if (values.length === 0) return new Array(bins).fill(0);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / bins || 1;
  const histogram = new Array(bins).fill(0);

  values.forEach((value) => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
    histogram[binIndex]++;
  });

  const total = histogram.reduce((a, b) => a + b, 0);
  return histogram.map((count) => count / total);
}

function calculateKLDivergence(p: number[], q: number[]): number {
  const epsilon = 1e-10;
  let divergence = 0;

  for (let i = 0; i < p.length; i++) {
    const pVal = p[i] + epsilon;
    const qVal = q[i] + epsilon;
    divergence += pVal * Math.log(pVal / qVal);
  }

  return divergence;
}

export function generateDistributionData(values: number[], bins: number = 20) {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / bins || 1;
  const histogram = new Array(bins).fill(0);

  values.forEach((value) => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
    histogram[binIndex]++;
  });

  return histogram.map((count, index) => ({
    bin: (min + index * binSize).toFixed(2),
    count,
  }));
}