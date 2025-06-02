export interface TestResult {
  id: number;
  traineeId: number;
  traineeName?: string; // Optional denormalized field for convenience
  date: Date;
  grade: number;
  subject: string;
}
