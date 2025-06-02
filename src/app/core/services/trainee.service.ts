import {computed, Injectable, signal, Signal} from '@angular/core';
import {Trainee} from '../models/trainee';
import {TestResult} from '../models/test-result';
import {generateMockData, generateTestResults, generateTrainees} from '../utils/mock-data-generator';

@Injectable({
  providedIn: 'root'
})
export class TraineeService {
  // Default mock data sizes
  private defaultTraineeCount = 20;
  private minTestResultsPerTrainee = 3;
  private maxTestResultsPerTrainee = 10;

  // Mock data arrays initialized with a small default dataset
  private traineesData: Trainee[] = [];
  private testResultsData: TestResult[] = [];

  // Signals for state management
  private traineesSignal = signal<Trainee[]>(this.traineesData);
  // Expose as readonly signals
  readonly trainees = this.traineesSignal.asReadonly();
  private testResultsSignal = signal<TestResult[]>(this.testResultsData);
  readonly testResults = this.testResultsSignal.asReadonly();

  constructor() {
    // Initialize with default mock data
    this.generateData(this.defaultTraineeCount);
  }

  /**
   * Generates new mock data with the specified number of trainees
   * @param traineeCount Number of trainees to generate
   * @param minResults Minimum number of test results per trainee (default: 3)
   * @param maxResults Maximum number of test results per trainee (default: 10)
   */
  generateData(traineeCount: number, minResults: number = this.minTestResultsPerTrainee, maxResults: number = this.maxTestResultsPerTrainee): void {
    const {trainees, testResults} = generateMockData(traineeCount, minResults, maxResults);

    // Update the data arrays
    this.traineesData = trainees;
    this.testResultsData = testResults;

    // Update the signals
    this.traineesSignal.set(this.traineesData);
    this.testResultsSignal.set(this.testResultsData);
  }

  /**
   * Adds more trainees and their test results to the existing data
   * @param additionalTraineeCount Number of additional trainees to generate
   */
  addMoreTrainees(additionalTraineeCount: number): void {
    // Get the highest existing trainee ID
    const maxId = Math.max(...this.traineesData.map(t => t.id), 0);

    // Generate new trainees with IDs continuing from the max ID
    const newTrainees = generateTrainees(additionalTraineeCount).map((trainee, index) => {
      return {
        ...trainee,
        id: maxId + index + 1
      };
    });

    // Generate test results for the new trainees
    const newTestResults = generateTestResults(
      newTrainees,
      this.minTestResultsPerTrainee,
      this.maxTestResultsPerTrainee
    );

    // Update the data arrays
    this.traineesSignal.update(trainees => [...trainees, ...newTrainees]);
    this.testResultsSignal.update(results => [...results, ...newTestResults]);
  }

  // Get all trainees
  getTrainees(): Signal<Trainee[]> {
    return this.trainees;
  }

  // Get trainee by ID
  getTraineeById(id: number): Trainee | undefined {
    return this.traineesSignal().find(trainee => trainee.id === id);
  }

  // Get trainee by ID as a computed signal
  getTraineeSignalById(id: number): Signal<Trainee | undefined> {
    return computed(() => this.traineesSignal().find(trainee => trainee.id === id));
  }

  // Get all test results
  getTestResults(): Signal<TestResult[]> {
    return this.testResults;
  }

  // Get test results for a trainee
  getTestResultsByTraineeId(traineeId: number): TestResult[] {
    return this.testResultsSignal().filter(result => result.traineeId === traineeId);
  }

  // Get test results for a trainee as a computed signal
  getTestResultsSignalByTraineeId(traineeId: number): Signal<TestResult[]> {
    return computed(() => this.testResultsSignal().filter(result => result.traineeId === traineeId));
  }

  // Add a new trainee
  addTrainee(trainee: Trainee): void {
    this.traineesSignal.update(trainees => [...trainees, trainee]);
  }

  // Update a trainee
  updateTrainee(updatedTrainee: Trainee): void {
    this.traineesSignal.update(trainees =>
      trainees.map(trainee => trainee.id === updatedTrainee.id ? updatedTrainee : trainee)
    );
  }

  // Delete a trainee
  deleteTrainee(id: number): void {
    this.traineesSignal.update(trainees => trainees.filter(trainee => trainee.id !== id));

    // Also delete associated test results
    this.testResultsSignal.update(results => results.filter(result => result.traineeId !== id));
  }

  // Add a test result
  addTestResult(testResult: TestResult): void {
    this.testResultsSignal.update(results => [...results, testResult]);
  }

  // Update a test result
  updateTestResult(updatedResult: TestResult): void {
    this.testResultsSignal.update(results =>
      results.map(result => result.id === updatedResult.id ? updatedResult : result)
    );
  }

  // Delete a test result
  deleteTestResult(id: number): void {
    this.testResultsSignal.update(results => results.filter(result => result.id !== id));
  }
}
