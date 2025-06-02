import {AfterViewInit, ChangeDetectionStrategy, Component, computed, OnInit, signal, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';

import {TraineeService} from '../../core/services/trainee.service';
import {FilterStateService} from '../../core/services/filter-state.service';
import {Trainee} from '../../core/models/trainee';
import {TestResult} from '../../core/models/test-result';
import {MonitorFilter} from '../../core/models/filters';
import {TraineeStatus} from '../../core/models/trainee-status';

@Component({
  selector: 'app-monitor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss'
})
export class MonitorComponent implements OnInit, AfterViewInit {
  // View children for table, paginator, and sort
  @ViewChild(MatTable) table!: MatTable<TraineeStatus>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data sources
  trainees = signal<Trainee[]>([]);
  testResults = signal<TestResult[]>([]);

  // Processed status data
  traineeStatuses = signal<TraineeStatus[]>([]);
  filteredStatuses = signal<TraineeStatus[]>([]);

  // Table data source with pagination support
  dataSource = new MatTableDataSource<TraineeStatus>([]);

  // Table configuration
  displayedColumns: string[] = ['id', 'name', 'average', 'exams', 'status'];

  // Threshold for passing
  passThreshold = 65;

  // Filter reference - will be set in constructor
  filter = signal<MonitorFilter>({ids: [], names: '', state: {passed: true, failed: true}});

  // Available options for filters
  availableIds = computed(() => [...new Set(this.traineeStatuses().map(status => status.id))]);

  constructor(
    private traineeService: TraineeService,
    private filterStateService: FilterStateService
  ) {
    // Use the service's filter for persistence across navigation
    this.filter = this.filterStateService.monitorFilter;
  }

  ngOnInit(): void {
    // Get data from service
    this.trainees.set(this.traineeService.trainees());
    this.testResults.set(this.traineeService.testResults());

    // Process trainee statuses
    this.calculateTraineeStatuses();

    // Initial filter application
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    // Setup paginator and sort for the table
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Restore pagination state from service
      const savedPagination = this.filterStateService.monitorPagination();
      if (this.paginator) {
        this.paginator.pageSize = savedPagination.pageSize;
        this.paginator.pageIndex = savedPagination.pageIndex;

        // Subscribe to page events to save state
        this.paginator.page.subscribe(event => {
          this.filterStateService.updateMonitorPagination(event.pageSize, event.pageIndex);
        });
      }

      // Apply initial filters
      setTimeout(() => {
        this.applyFilters();
      });
    }
  }

  /**
   * Calculates status for each trainee based on their test results
   */
  calculateTraineeStatuses(): void {
    const statuses: TraineeStatus[] = [];

    // Process each trainee
    this.trainees().forEach(trainee => {
      // Get test results for this trainee
      const traineeResults = this.testResults().filter(result => result.traineeId === trainee.id);

      if (traineeResults.length > 0) {
        // Calculate average grade
        const totalGrade = traineeResults.reduce((sum, result) => sum + result.grade, 0);
        const average = totalGrade / traineeResults.length;

        // Create status object
        statuses.push({
          id: trainee.id,
          name: trainee.name,
          average: Math.round(average * 10) / 10, // Round to 1 decimal place
          exams: traineeResults.length,
          passed: average >= this.passThreshold
        });
      }
    });

    // Update signals
    this.traineeStatuses.set(statuses);
    this.filteredStatuses.set(statuses);
  }

  /**
   * Update filter IDs
   */
  updateFilterIds(ids: number[]): void {
    this.filterStateService.updateMonitorFilterIds(ids);
    this.applyFilters();
  }

  /**
   * Handle input event from name filter
   */
  handleNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.updateFilterName(input.value);
    }
  }

  /**
   * Update filter name
   */
  updateFilterName(names: string): void {
    this.filterStateService.updateMonitorFilterName(names);
    this.applyFilters();
  }

  /**
   * Update filter passed state
   */
  updateFilterPassedState(passed: boolean): void {
    this.filterStateService.updateMonitorFilterPassedState(passed);
    this.applyFilters();
  }

  /**
   * Update filter failed state
   */
  updateFilterFailedState(failed: boolean): void {
    this.filterStateService.updateMonitorFilterFailedState(failed);
    this.applyFilters();
  }

  /**
   * Applies filters based on signal values
   */
  applyFilters(): void {
    const currentFilter = this.filter();

    // Start with all statuses
    let filtered = this.traineeStatuses();

    // Filter by selected IDs if any are selected
    if (currentFilter.ids.length > 0) {
      filtered = filtered.filter(status => currentFilter.ids.includes(status.id));
    }

    // Filter by name (case insensitive contains)
    if (currentFilter.names) {
      const nameFilter = currentFilter.names.toLowerCase();
      filtered = filtered.filter(status =>
        status.name.toLowerCase().includes(nameFilter)
      );
    }

    // Filter by pass/fail state
    if (!currentFilter.state.passed) {
      filtered = filtered.filter(status => !status.passed);
    }

    if (!currentFilter.state.failed) {
      filtered = filtered.filter(status => status.passed);
    }

    // Update filtered statuses
    this.filteredStatuses.set(filtered);

    // Update the data source
    this.dataSource.data = filtered;

    // Refresh table and ensure paginator is updated
    if (this.table) {
      this.table.renderRows();
    }

    // Reset to first page when filter changes
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.filterStateService.resetMonitorFilter();
    this.applyFilters();
  }

  /**
   * Gets CSS class for status indicator based on passed state
   */
  getStatusClass(status: TraineeStatus): string {
    return status.passed ? 'status-passed' : 'status-failed';
  }

  /**
   * Gets tooltip text for status indicator
   */
  getStatusTooltip(status: TraineeStatus): string {
    return status.passed
      ? `Passed (${status.average}% > ${this.passThreshold}%)`
      : `Failed (${status.average}% < ${this.passThreshold}%)`;
  }

  /**
   * Returns the count of passed trainees in the filtered results
   */
  getPassedCount(): number {
    return this.filteredStatuses().filter(status => status.passed).length;
  }

  /**
   * Returns the count of failed trainees in the filtered results
   */
  getFailedCount(): number {
    return this.filteredStatuses().filter(status => !status.passed).length;
  }
}
