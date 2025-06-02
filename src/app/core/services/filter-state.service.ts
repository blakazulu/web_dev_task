import {Injectable, signal} from '@angular/core';
import {AnalysisFilter, DataFilter, MonitorFilter} from '../models/filters';

interface PaginationState {
  pageSize: number;
  pageIndex: number;
}

@Injectable({
  providedIn: 'root' // This makes it a singleton service
})
export class FilterStateService {
  // Signal for Monitor component filters
  monitorFilter = signal<MonitorFilter>({
    ids: [],
    names: '',
    state: {passed: true, failed: true}
  });

  // Pagination state for Monitor component
  monitorPagination = signal<PaginationState>({pageSize: 10, pageIndex: 0});

  // Signal for Data component filters (if needed)
  dataFilter = signal<DataFilter>({
    id: undefined,
    name: undefined,
    grade: undefined,
    date: undefined,
    subject: undefined
  });

  // Pagination state for Data component
  dataPagination = signal<PaginationState>({pageSize: 10, pageIndex: 0});

  // Signal for Analysis component filters (if needed)
  analysisFilter = signal<AnalysisFilter>({
    ids: [],
    subjects: []
  });

  // Pagination state for Analysis component
  analysisPagination = signal<PaginationState>({pageSize: 10, pageIndex: 0});

  constructor() {
  }

  // Monitor filter methods
  updateMonitorFilterIds(ids: number[]): void {
    this.monitorFilter.update(filter => ({
      ...filter,
      ids
    }));
  }

  updateMonitorFilterName(names: string): void {
    this.monitorFilter.update(filter => ({
      ...filter,
      names
    }));
  }

  updateMonitorFilterPassedState(passed: boolean): void {
    this.monitorFilter.update(filter => ({
      ...filter,
      state: {...filter.state, passed}
    }));
  }

  updateMonitorFilterFailedState(failed: boolean): void {
    this.monitorFilter.update(filter => ({
      ...filter,
      state: {...filter.state, failed}
    }));
  }

  resetMonitorFilter(): void {
    this.monitorFilter.set({
      ids: [],
      names: '',
      state: {passed: true, failed: true}
    });
  }

  updateMonitorPagination(pageSize: number, pageIndex: number): void {
    this.monitorPagination.set({pageSize, pageIndex});
  }

  updateDataPagination(pageSize: number, pageIndex: number): void {
    this.dataPagination.set({pageSize, pageIndex});
  }

  updateAnalysisPagination(pageSize: number, pageIndex: number): void {
    this.analysisPagination.set({pageSize, pageIndex});
  }

  // Analysis filter methods
  updateAnalysisFilterIds(ids: number[]): void {
    this.analysisFilter.update(filter => ({
      ...filter,
      ids
    }));
  }

  updateAnalysisFilterSubjects(subjects: string[]): void {
    this.analysisFilter.update(filter => ({
      ...filter,
      subjects
    }));
  }

  resetAnalysisFilter(): void {
    this.analysisFilter.set({
      ids: [],
      subjects: []
    });
  }
}
