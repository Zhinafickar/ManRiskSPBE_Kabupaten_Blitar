export const FREQUENCY_LEVELS_MAP: { [key: string]: number } = {
  'Hampir Tidak Terjadi': 1,
  'Jarang Terjadi': 2,
  'Kadang Terjadi': 3,
  'Sering Terjadi': 4,
  'Sangat Sering Terjadi': 5,
};

export const IMPACT_MAGNITUDES_MAP: { [key: string]: number } = {
  'Tidak Signifikan': 1,
  'Kurang Signifikan': 2,
  'Cukup Signifikan': 3,
  'Signifikan': 4,
  'Sangat Signifikan': 5,
};

const riskMatrix: { [key: number]: { [key: number]: string } } = {
    5: { 1: 'Rendah', 2: 'Sedang', 3: 'Bahaya', 4: 'Bahaya', 5: 'Bahaya' },
    4: { 1: 'Minor', 2: 'Rendah', 3: 'Sedang', 4: 'Bahaya', 5: 'Bahaya' },
    3: { 1: 'Minor', 2: 'Rendah', 3: 'Sedang', 4: 'Bahaya', 5: 'Bahaya' },
    2: { 1: 'Minor', 2: 'Rendah', 3: 'Rendah', 4: 'Bahaya', 5: 'Bahaya' },
    1: { 1: 'Minor', 2: 'Minor', 3: 'Rendah', 4: 'Sedang', 5: 'Bahaya' },
};

export type RiskLevel = 'Bahaya' | 'Sedang' | 'Rendah' | 'Minor' | null;

export interface RiskIndicator {
    level: RiskLevel;
    color: string;
}

export const getRiskLevel = (frequency: string, impactMagnitude: string): RiskIndicator => {
    const freqIndex = FREQUENCY_LEVELS_MAP[frequency];
    const impactIndex = IMPACT_MAGNITUDES_MAP[impactMagnitude];

    if (!freqIndex || !impactIndex) {
        return { level: null, color: 'bg-gray-400' };
    }

    const level = riskMatrix[freqIndex]?.[impactIndex] as RiskLevel;
    let color = 'bg-gray-400';
    switch (level) {
        case 'Bahaya':
            color = 'bg-red-600';
            break;
        case 'Sedang':
            color = 'bg-yellow-500';
            break;
        case 'Rendah':
            color = 'bg-green-600';
            break;
        case 'Minor':
            color = 'bg-blue-600';
            break;
    }
    return { level, color: `${color} text-white hover:bg-opacity-90` };
};
