import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';

import {TraineeService} from '../../core/services/trainee.service';
import {FilterStateService} from '../../core/services/filter-state.service';
import {Trainee} from '../../core/models/trainee';
import {TestResult} from '../../core/models/test-result';
import {DataFilter} from '../../core/models/filters';

@Component({
  selector: 'app-data',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent implements OnInit, AfterViewInit {
  // Fixed mock data generation count (always 40 trainees)

  // Data sources using signals
  trainees = signal<Trainee[]>([]);
  testResults = signal<TestResult[]>([]);
  filteredTestResults = signal<TestResult[]>([]);

  // Table data source with pagination support
  dataSource = new MatTableDataSource<TestResult>([]);

  // Pagination
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TestResult>;

  defaultPageSize = 10;
  
  // Pagination helper methods
  getStartIndex(): number {
    return this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
  }
  
  getEndIndex(): number {
    return this.paginator ? (this.paginator.pageIndex + 1) * this.paginator.pageSize : this.defaultPageSize;
  }
  
  canNavigatePrevious(): boolean {
    return this.paginator ? this.paginator.pageIndex > 0 : false;
  }
  
  navigatePrevious(): void {
    if (this.paginator) {
      this.paginator.previousPage();
    }
  }
  
  canNavigateNext(): boolean {
    if (!this.paginator) return false;
    return this.paginator.pageIndex < (this.paginator.getNumberOfPages() - 1);
  }
  
  navigateNext(): void {
    if (this.paginator) {
      this.paginator.nextPage();
    }
  }

  // Selected item for details panel using signals
  selectedTestResult = signal<TestResult | null>(null);
  selectedTrainee = signal<Trainee | null>(null);

  // Form
  testResultForm: FormGroup;
  traineeForm: FormGroup;

  // Single filter query
  filterQuery = '';

  // Subject filter
  selectedSubject = 'All Subjects';

  // Expose Math for template usage
  Math = Math;

  // Filter reference - will be initialized in constructor
  filter = signal<DataFilter>({});
  // Subject options
  subjects = ['Math', 'Science', 'History', 'English', 'Programming', 'Art', 'Music', 'Physical Education'];

  constructor(
    private traineeService: TraineeService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private filterStateService: FilterStateService
  ) {
    // Use the service's filter for persistence
    this.filter = this.filterStateService.dataFilter;
    // Initialize forms
    this.testResultForm = this.formBuilder.group({
      id: ['', Validators.required],
      traineeId: ['', Validators.required],
      date: [new Date(), Validators.required],
      grade: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      subject: ['', Validators.required]
    });

    this.traineeForm = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateJoined: [new Date()],
      address: [''],
      city: [''],
      country: [''],
      zip: ['']
    });
  }

  /**
   * Parses and applies filter from the single input field
   * Handles special syntax like "ID:", ">", "<" for filtering
   */
  parseAndApplyFilter(event: KeyboardEvent): void {
    const filterValue = this.filterQuery?.trim().toLowerCase() || '';
    const newFilter: DataFilter = {
      id: '',
      name: '',
      subject: '',
      grade: {min: undefined, max: undefined},
      date: {after: undefined, before: undefined}
    };

    // Flag to indicate this is a general search (used in applyFilter)
    let isGeneralSearch = false;

    if (!filterValue) {
      this.filterStateService.dataFilter.set(newFilter);
      this.applyFilter();
      return;
    }

    try {
      // Use specific filter types with prefix
      if (filterValue.startsWith('id:')) {
        // Only set the ID filter, leave others empty
        newFilter.id = filterValue.substring(3).trim();
        console.log('Set ID filter:', newFilter.id);
      } else if (filterValue.startsWith('name:')) {
        // Only set the Name filter, leave others empty
        newFilter.name = filterValue.substring(5).trim();
        console.log('Set Name filter:', newFilter.name);
      } else if (filterValue.startsWith('subject:')) {
        // Only set the Subject filter, leave others empty
        newFilter.subject = filterValue.substring(8).trim();
        console.log('Set Subject filter:', newFilter.subject);
      } else if (filterValue.startsWith('>')) {
        // Check if it's a grade filter
        const gradeValue = parseInt(filterValue.substring(1).trim());
        if (!isNaN(gradeValue)) {
          // Only set the Grade min filter
          newFilter.grade = {min: gradeValue, max: undefined};
          console.log('Set Grade min filter:', gradeValue);
        }
      } else if (filterValue.startsWith('<')) {
        // Could be grade or date
        const gradeValue = parseInt(filterValue.substring(1).trim());
        if (!isNaN(gradeValue)) {
          // Only set the Grade max filter
          newFilter.grade = {min: undefined, max: gradeValue};
          console.log('Set Grade max filter:', gradeValue);
        } else {
          // Try parsing as date
          const dateStr = filterValue.substring(1).trim();
          const dateValue = new Date(dateStr);
          if (!isNaN(dateValue.getTime())) {
            // Only set the Date before filter
            newFilter.date = {after: undefined, before: dateValue};
            console.log('Set Date before filter:', dateValue);
          }
        }
      } else {
        // Generic search - search across all text fields
        // This is a general search, so we'll look for the term in ID, name and subject
        console.log('General search:', filterValue);
        newFilter.id = filterValue;
        newFilter.name = filterValue;
        isGeneralSearch = true; // Flag this as a general search

        // Check if the input matches any subject (partial match)
        const matchedSubject = this.subjects.some(
          subject => subject.toLowerCase().includes(filterValue)
        );
        if (matchedSubject) {
          newFilter.subject = filterValue;
          console.log('Found matching subject for:', filterValue);
        }
      }

      console.log('Applying filter:', newFilter, 'General search:', isGeneralSearch);
      this.filterStateService.dataFilter.set({...newFilter, isGeneralSearch});
      this.applyFilter();
    } catch (error) {
      console.error('Error parsing filter:', error);
      // In case of error, clear the filter
      this.filterStateService.dataFilter.set(newFilter);
      this.applyFilter();
    }
  }


  ngOnInit(): void {
    // Check if data already exists, if not generate 40 trainees
    if (this.traineeService.trainees().length === 0) {
      this.generateNewData();
    } else {
      // Use existing data
      this.trainees.set(this.traineeService.trainees());
      this.testResults.set(this.traineeService.testResults());
    }

    // Restore filter query from filter state
    this.restoreFilterQueryFromState();

    // Apply filters to update the view
    this.applyFilter();
  }

  /**
   * Filters test results by selected subject
   */
  filterBySubject(): void {
    const newFilter: DataFilter = {...this.filter()};

    if (this.selectedSubject === 'All Subjects') {
      // Clear subject filter
      newFilter.subject = '';
    } else {
      // Apply subject filter
      newFilter.subject = this.selectedSubject;
    }

    this.filterStateService.dataFilter.set(newFilter);
    this.applyFilter();
  }

  /**
   * Returns CSS class for grade badge based on grade value
   */
  getGradeColorClass(grade: number): string {
    if (grade >= 90) return 'grade-excellent';
    if (grade >= 80) return 'grade-good';
    if (grade >= 70) return 'grade-average';
    return 'grade-poor';
  }

  /**
   * Track function for ngFor to improve performance
   */
  trackByFn(index: number, item: any): any {
    return item.id;
  }

  ngAfterViewInit(): void {
    this.filteredTestResults.set(this.testResults());

    // Wait for the next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      // Set up sorting and pagination
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        // Set default page size
        this.paginator.pageSize = this.defaultPageSize;
      }
      
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }

      // Apply initial filter if there is any saved in state
      if (this.filter()) {
        this.applyFilter();
      }

      // Mark for check to refresh the view
      this.cdr.markForCheck();
    });
  }

  applyFilter(): void {
    console.log('Filter being applied:', this.filter());
    const filter = this.filter();
    let results = [...this.testResults()];

    // Check if we have any filter values
    const hasFilter = filter.id || filter.name || filter.subject ||
      filter.grade?.min !== undefined || filter.grade?.max !== undefined ||
      filter.date?.after || filter.date?.before;

    if (!hasFilter) {
      // No filter, show all results
      this.filteredTestResults.set(results);
      this.dataSource.data = results;
      if (this.paginator) {
        this.paginator.firstPage();
      }
      return;
    }

    // Debug the test results to check what we're filtering
    console.log('Sample test result for debugging:', results.length > 0 ? results[0] : 'No results');

    try {
      // Handle general search with OR logic between fields
      if (filter.isGeneralSearch) {
        console.log('Applying general search with OR logic');
        const allResults = [...this.testResults()];  // Start with all results
        let matchingResults: TestResult[] = [];  // Will hold all matching results

        // Match ID (test result ID or trainee ID)
        if (filter.id) {
          const idValue = filter.id.toString().toLowerCase();
          const idMatches = allResults.filter(result => {
            const testResultId = result.id.toString().toLowerCase();
            const traineeId = result.traineeId.toString().toLowerCase();
            return testResultId.includes(idValue) || traineeId.includes(idValue);
          });
          console.log(`ID matches found: ${idMatches.length}`);
          // Add unique matches to our results array
          matchingResults = [...matchingResults, ...idMatches.filter(match =>
            !matchingResults.some(existing => existing.id === match.id)
          )];
        }

        // Match name
        if (filter.name) {
          const nameValue = filter.name.toLowerCase();
          const nameMatches = allResults.filter(result => {
            if (!result.traineeName) return false;
            return result.traineeName.toLowerCase().includes(nameValue);
          });
          console.log(`Name matches found: ${nameMatches.length}`);
          // Add unique matches to our results array
          matchingResults = [...matchingResults, ...nameMatches.filter(match =>
            !matchingResults.some(existing => existing.id === match.id)
          )];
        }

        // Match subject
        if (filter.subject) {
          const subjectValue = filter.subject.toLowerCase();
          const subjectMatches = allResults.filter(result =>
            result.subject.toLowerCase().includes(subjectValue)
          );
          console.log(`Subject matches found: ${subjectMatches.length}`);
          // Add unique matches to our results array
          matchingResults = [...matchingResults, ...subjectMatches.filter(match =>
            !matchingResults.some(existing => existing.id === match.id)
          )];
        }

        console.log(`Total matches after OR logic: ${matchingResults.length}`);
        results = matchingResults;
      } else {
        // Traditional filtering with AND logic between fields
        // Filter by ID - includes both test result ID and trainee ID
        if (filter.id) {
          const idValue = filter.id.toString().toLowerCase();
          const beforeLength = results.length;

          results = results.filter(result => {
            const testResultId = result.id.toString().toLowerCase();
            const traineeId = result.traineeId.toString().toLowerCase();
            return testResultId.includes(idValue) || traineeId.includes(idValue);
          });

          console.log(`ID filter: ${beforeLength} -> ${results.length}`);
        }

        // Filter by name
        if (filter.name) {
          const nameValue = filter.name.toLowerCase();
          const beforeLength = results.length;

          results = results.filter(result => {
            // Safe access of potentially null trainee name
            if (!result.traineeName) return false;
            return result.traineeName.toLowerCase().includes(nameValue);
          });

          console.log(`Name filter: ${beforeLength} -> ${results.length}`);
        }

        // Filter by subject
        if (filter.subject) {
          const subjectValue = filter.subject.toLowerCase();
          const beforeLength = results.length;

          results = results.filter(result => {
            return result.subject.toLowerCase().includes(subjectValue);
          });

          console.log(`Subject filter: ${beforeLength} -> ${results.length}`);
        }
      }

      // The following filters always use AND logic, regardless of search type
      // Filter by grade range
      if (filter.grade?.min !== undefined) {
        const beforeLength = results.length;
        results = results.filter(result => result.grade >= filter.grade!.min!);
        console.log(`Grade min filter: ${beforeLength} -> ${results.length}`);
      }

      if (filter.grade?.max !== undefined) {
        const beforeLength = results.length;
        results = results.filter(result => result.grade <= filter.grade!.max!);
        console.log(`Grade max filter: ${beforeLength} -> ${results.length}`);
      }

      // Filter by date range
      if (filter.date?.after) {
        const afterDate = new Date(filter.date.after);
        const beforeLength = results.length;
        results = results.filter(result => new Date(result.date) >= afterDate);
        console.log(`Date after filter: ${beforeLength} -> ${results.length}`);
      }

      if (filter.date?.before) {
        const beforeDate = new Date(filter.date.before);
        const beforeLength = results.length;
        results = results.filter(result => new Date(result.date) <= beforeDate);
        console.log(`Date before filter: ${beforeLength} -> ${results.length}`);
      }
    } catch (error) {
      console.error('Error during filtering:', error);
    }

    console.log(`Filtered results: ${results.length} of ${this.testResults().length}`);

    // Apply all filters
    this.filteredTestResults.set(results);

    // Update the data source
    this.dataSource.data = results;

    // Reset to first page when filter changes
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  selectTestResult(testResult: TestResult): void {
    this.selectedTestResult.set(testResult);

    // Find the associated trainee
    const trainee = this.trainees().find(t => t.id === testResult.traineeId) || null;
    this.selectedTrainee.set(trainee);

    // Populate the form
    this.testResultForm.patchValue({
      id: testResult.id,
      traineeId: testResult.traineeId,
      date: new Date(testResult.date),
      grade: testResult.grade,
      subject: testResult.subject
    });

    // If trainee found, also populate trainee form
    if (trainee) {
      this.traineeForm.patchValue({
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
        dateJoined: new Date(trainee.dateJoined),
        address: trainee.address,
        city: trainee.city,
        country: trainee.country,
        zip: trainee.zip
      });
    }

    this.cdr.markForCheck();
  }

  clearSelection(): void {
    this.selectedTestResult.set(null);
    this.selectedTrainee.set(null);
    this.testResultForm.reset();
    this.traineeForm.reset();
    this.cdr.markForCheck();
  }

  /**
   * Generates a completely new dataset with 40 trainees
   */
  generateNewData(): void {
    // Always generate 40 trainees
    this.traineeService.generateData(40);

    // Reset selection and forms
    this.selectedTestResult.set(null);
    this.selectedTrainee.set(null);
    this.testResultForm.reset();
    this.traineeForm.reset();

    // Apply filters to update the view
    this.applyFilter();
  }

  saveTrainee(): void {
    if (this.traineeForm.valid) {
      const trainee: Trainee = this.traineeForm.value;

      if (this.selectedTrainee()) {
        // Update existing trainee
        this.traineeService.updateTrainee(trainee);
        this.snackBar.open('Trainee updated successfully', 'Close', {duration: 3000});
      } else {
        // Create new trainee
        this.traineeService.addTrainee(trainee);
        this.snackBar.open('Trainee added successfully', 'Close', {duration: 3000});
      }

      // Update local signal after service update
      this.trainees.set(this.traineeService.trainees());

      // Don't clear selection as we might be editing both test result and trainee
      // Just update the selectedTrainee
      this.selectedTrainee.set(trainee);
      this.cdr.markForCheck();
    }
  }

  deleteTestResult(testResult: TestResult): void {
    if (confirm(`Are you sure you want to delete test result ${testResult.id}?`)) {
      this.traineeService.deleteTestResult(testResult.id);
      this.snackBar.open('Test result deleted successfully', 'Close', {duration: 3000});

      // Update local signal after service update
      this.testResults.set(this.traineeService.testResults());

      if (this.selectedTestResult() && this.selectedTestResult()!.id === testResult.id) {
        this.clearSelection();
      }

      this.applyFilter();
    }
  }

  addNewTrainee(): void {
    // Clear current selection
    this.clearSelection();
    // Generate a new ID for the trainee
    const newId = this.generateNewId().toString();
    this.traineeForm.reset({
      id: newId,
      dateJoined: new Date()
    });

    // Also create a new test result for this trainee
    this.testResultForm.reset({
      id: this.generateNewId().toString(),
      traineeId: newId,
      date: new Date()
    });

    this.cdr.markForCheck();
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }

  /**
   * Restore the filter query input value from the current filter state
   */
  private restoreFilterQueryFromState(): void {
    const filter = this.filter();

    // If no filter is active, clear the query
    if (!filter || (!filter.id && !filter.name && !filter.subject &&
      !filter.grade?.min && !filter.grade?.max &&
      !filter.date?.before && !filter.date?.after)) {
      this.filterQuery = '';
      return;
    }

    // Reconstruct filter query based on the active filter
    if (filter.id && filter.isGeneralSearch) {
      this.filterQuery = filter.id; // General search
    } else if (filter.id) {
      this.filterQuery = `id:${filter.id}`;
    } else if (filter.name && filter.isGeneralSearch) {
      this.filterQuery = filter.name; // General search
    } else if (filter.name) {
      this.filterQuery = `name:${filter.name}`;
    } else if (filter.subject && filter.isGeneralSearch) {
      this.filterQuery = filter.subject; // General search
    } else if (filter.subject) {
      this.filterQuery = `subject:${filter.subject}`;
    } else if (filter.grade?.min !== undefined) {
      this.filterQuery = `>${filter.grade.min}`;
    } else if (filter.grade?.max !== undefined) {
      this.filterQuery = `<${filter.grade.max}`;
    } else if (filter.date?.before) {
      const dateString = filter.date.before.toISOString().split('T')[0];
      this.filterQuery = `<${dateString}`;
    } else if (filter.date?.after) {
      const dateString = filter.date.after.toISOString().split('T')[0];
      this.filterQuery = `>${dateString}`;
    }
  }

  private generateNewId(): number {
    // Generate a simple unique ID for new entities
    return Math.floor(Math.random() * 10000) + 1;
  }
}
