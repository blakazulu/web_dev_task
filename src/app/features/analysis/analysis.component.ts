import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnd,
  CdkDragHandle,
  CdkDragStart,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';

import {TraineeService} from '../../core/services/trainee.service';
import {FilterStateService} from '../../core/services/filter-state.service';
import {TestResult} from '../../core/models/test-result';
import {Trainee} from '../../core/models/trainee';
import Chart from '../../core/utils/chart-utils';

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie';
  chart?: Chart;
  visible: boolean;
}

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList
  ]
})
export class AnalysisComponent implements OnInit, AfterViewInit {
  // Canvas references for charts
  @ViewChild('chartCanvas1') chartCanvas1!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas2') chartCanvas2!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas3') chartCanvas3!: ElementRef<HTMLCanvasElement>;

  // Trainees and test results from service
  trainees = signal<Trainee[]>([]);
  testResults = signal<TestResult[]>([]);

  // Use filter state service for state persistence
  // Available subjects for selection
  availableSubjects = computed(() => {
    const subjects = new Set<string>();
    this.testResults().forEach(result => subjects.add(result.subject));
    return Array.from(subjects).sort();
  });
  // Chart configuration
  chartConfigs: ChartConfig[] = [
    {
      id: 'chart1',
      title: 'Chart 1: Grades average over time for students with ID (for each student)',
      type: 'line',
      visible: true
    },
    {id: 'chart2', title: 'Chart 2: Students averages for students with chosen ID', type: 'bar', visible: true},
    {id: 'chart3', title: 'Chart 3: Grades averages per subject', type: 'bar', visible: false}
  ];
  // Currently visible charts
  visibleCharts = signal<ChartConfig[]>([]);
  hiddenChart = signal<ChartConfig | null>(null);
  // Hidden chart drag state
  private isDraggingHiddenChart = false;
  private draggedOverIndex: number | null = null;

  constructor(
    private traineeService: TraineeService,
    private filterStateService: FilterStateService,
    private cdr: ChangeDetectorRef
  ) {
  }

  // For template binding
  get traineeIdsValue(): number[] {
    return this.filterStateService.analysisFilter().ids;
  }

  set traineeIdsValue(value: number[]) {
    this.filterStateService.updateAnalysisFilterIds(value);
  }

  get subjectsValue(): string[] {
    return this.filterStateService.analysisFilter().subjects;
  }

  set subjectsValue(value: string[]) {
    this.filterStateService.updateAnalysisFilterSubjects(value);
  }

  ngOnInit(): void {
    this.trainees.set(this.traineeService.trainees());
    this.testResults.set(this.traineeService.testResults());

    // Initialize visible and hidden charts
    this.visibleCharts.set([this.chartConfigs[0], this.chartConfigs[1]]);
    this.hiddenChart.set(this.chartConfigs[2]);
  }

  ngAfterViewInit(): void {
    // Initialize charts after view init
    setTimeout(() => this.initializeCharts(), 0);
  }

  initializeCharts(): void {
    this.destroyCharts();

    // Initialize visible charts
    this.initializeChart('chart1');
    this.initializeChart('chart2');
    this.initializeChart('chart3', false);

    this.cdr.markForCheck();
  }

  initializeChart(chartId: string, redraw: boolean = true): void {
    const config = this.chartConfigs.find(c => c.id === chartId);
    if (!config) return;

    // Destroy existing chart if it exists
    if (config.chart) {
      config.chart.destroy();
      config.chart = undefined;
    }

    let canvas: HTMLCanvasElement | null = null;

    switch (chartId) {
      case 'chart1':
        canvas = this.chartCanvas1?.nativeElement;
        if (canvas && redraw) {
          config.chart = this.createGradesOverTimeChart(canvas);
        }
        break;
      case 'chart2':
        canvas = this.chartCanvas2?.nativeElement;
        if (canvas && redraw) {
          config.chart = this.createStudentAveragesChart(canvas);
        }
        break;
      case 'chart3':
        canvas = this.chartCanvas3?.nativeElement;
        if (canvas && redraw) {
          config.chart = this.createSubjectAveragesChart(canvas);
        }
        break;
    }
  }

  // Create Chart 1: Grades average over time for students with ID
  createGradesOverTimeChart(canvas: HTMLCanvasElement): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) return {} as Chart;

    const selectedIds = this.filterStateService.analysisFilter().ids;
    if (selectedIds.length === 0) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Grades average over time (select trainee IDs)',
              font: {size: 16}
            }
          }
        }
      });
    }

    // Process data for each selected trainee
    const datasets = selectedIds.map(traineeId => {
      const traineeResults = this.testResults()
        .filter(result => result.traineeId === traineeId)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const trainee = this.trainees().find(t => t.id === traineeId);
      const traineeLabel = trainee ? trainee.name : `Trainee #${traineeId}`;

      return {
        label: traineeLabel,
        data: traineeResults.map(result => result.grade),
        borderColor: this.getRandomColor(traineeId),
        backgroundColor: this.getRandomColor(traineeId, 0.2),
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.2,
        fill: false
      };
    });

    // Get all test result dates for all selected trainees and sort them
    const allDates = this.testResults()
      .filter(result => selectedIds.includes(result.traineeId))
      .map(result => result.date)
      .sort((a, b) => a.getTime() - b.getTime());

    // Format dates for labels
    const dateLabels = Array.from(new Set(
      allDates.map(date => date.toLocaleDateString())
    ));

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Grade'
            },
            max: 100
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Grades average over time',
            font: {size: 16}
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // Create Chart 2: Students averages for students with chosen ID
  createStudentAveragesChart(canvas: HTMLCanvasElement): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) return {} as Chart;

    const selectedIds = this.filterStateService.analysisFilter().ids;
    if (selectedIds.length === 0) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Student averages (select trainee IDs)',
              font: {size: 16}
            }
          }
        }
      });
    }

    // Calculate average grades for each selected trainee
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    selectedIds.forEach(traineeId => {
      const traineeResults = this.testResults().filter(result => result.traineeId === traineeId);
      if (traineeResults.length === 0) return;

      const trainee = this.trainees().find(t => t.id === traineeId);
      const traineeLabel = trainee ? trainee.name : `Trainee #${traineeId}`;

      const avgGrade = traineeResults.reduce((sum, result) => sum + result.grade, 0) / traineeResults.length;

      labels.push(traineeLabel);
      data.push(parseFloat(avgGrade.toFixed(1)));
      colors.push(this.getRandomColor(traineeId, 0.7));
    });

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Grade',
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Grade'
            },
            max: 100
          },
          x: {
            title: {
              display: true,
              text: 'Trainee'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Student Averages',
            font: {size: 16}
          },
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Create Chart 3: Grades averages per subject
  createSubjectAveragesChart(canvas: HTMLCanvasElement): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) return {} as Chart;

    const selectedSubjects = this.filterStateService.analysisFilter().subjects;
    if (selectedSubjects.length === 0) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Grades averages per subject (select subjects)',
              font: {size: 16}
            }
          }
        }
      });
    }

    // Calculate average grades for each subject
    const data: number[] = [];
    const colors: string[] = [];

    selectedSubjects.forEach((subject, index) => {
      const subjectResults = this.testResults().filter(result => result.subject === subject);
      if (subjectResults.length === 0) return;

      const avgGrade = subjectResults.reduce((sum, result) => sum + result.grade, 0) / subjectResults.length;

      data.push(parseFloat(avgGrade.toFixed(1)));
      colors.push(this.getRandomColor(index, 0.7));
    });

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: selectedSubjects,
        datasets: [{
          label: 'Average Grade',
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Grade'
            },
            max: 100
          },
          x: {
            title: {
              display: true,
              text: 'Subject'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Subject Averages',
            font: {size: 16}
          },
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Handle trainee ID selection changes
  onTraineeSelectionChange(): void {
    this.updateCharts('chart1');
    this.updateCharts('chart2');
  }

  // Handle subject selection changes
  onSubjectSelectionChange(): void {
    this.updateCharts('chart3');
  }

  // Update charts when selections change
  updateCharts(chartId?: string): void {
    if (chartId) {
      // Update specific chart
      this.initializeChart(chartId);
    } else {
      // Update all visible charts
      this.visibleCharts().forEach(chart => this.initializeChart(chart.id));
    }
  }

  // Handle drag start for hidden chart
  onHiddenChartDragStart(event: CdkDragStart): void {
    this.isDraggingHiddenChart = true;
    this.cdr.markForCheck(); // Mark for change detection
  }

  // Handle drag end for hidden chart
  onHiddenChartDragEnd(event: CdkDragEnd): void {
    // Get the drop position and identify the chart we're dropping onto
    const dragPosition = event.dropPoint;
    const chartElements = document.querySelectorAll('.chart-card');

    // Find which chart card the hidden chart was dropped on
    let droppedOnIndex = -1;
    chartElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      if (dragPosition.x >= rect.left && dragPosition.x <= rect.right &&
        dragPosition.y >= rect.top && dragPosition.y <= rect.bottom) {
        droppedOnIndex = index;
      }
    });

    // If dropped on a valid chart, swap them
    if (droppedOnIndex !== -1) {
      this.swapChart(droppedOnIndex);
    }

    // Reset drag state
    this.isDraggingHiddenChart = false;
    this.draggedOverIndex = null;
    this.cdr.markForCheck(); // Mark for change detection
  }

  // Handle drag and drop of charts (for reordering visible charts)
  onChartDropped(event: CdkDragDrop<ChartConfig[]>): void {
    // Handle reordering the visible charts
    const visibleCharts = [...this.visibleCharts()];
    moveItemInArray(visibleCharts, event.previousIndex, event.currentIndex);
    this.visibleCharts.set(visibleCharts);

    // Reinitialize charts to update the view
    setTimeout(() => {
      this.initializeCharts();
      this.cdr.markForCheck(); // Mark for change detection
    }, 0);
  }

  // Swap a visible chart with the hidden chart
  swapChart(visibleIndex: number): void {
    const visibleCharts = [...this.visibleCharts()];
    const hiddenChart = this.hiddenChart();

    if (hiddenChart && visibleIndex < visibleCharts.length) {
      // Get the chart that will be replaced
      const replacedChart = visibleCharts[visibleIndex];

      // Swap the charts
      visibleCharts[visibleIndex] = hiddenChart;
      this.hiddenChart.set(replacedChart);
      this.visibleCharts.set(visibleCharts);

      // Reinitialize charts to update the view
      setTimeout(() => {
        this.initializeCharts();
      }, 0);
    }
  }

  // Destroy all charts to prevent memory leaks
  destroyCharts(): void {
    this.chartConfigs.forEach(config => {
      if (config.chart) {
        config.chart.destroy();
        config.chart = undefined;
      }
    });
  }

  // Generate a consistent random color based on an ID
  getRandomColor(id: number, alpha: number = 1): string {
    const hash = id * 137.5;
    const r = (hash * 123) % 255;
    const g = (hash * 457) % 255;
    const b = (hash * 789) % 255;
    return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
  }
}
