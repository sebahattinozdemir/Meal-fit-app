export interface BodyProgressEntry {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  note?: string;
  createdAt: string;
}

export interface ChartPoint {
  label: string;
  value: number;
  date?: string;
}
