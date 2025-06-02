import {Routes} from '@angular/router';
import {DataComponent} from './features/data/data.component';
import {AnalysisComponent} from './features/analysis/analysis.component';
import {MonitorComponent} from './features/monitor/monitor.component';

export const routes: Routes = [
  {path: '', redirectTo: 'data', pathMatch: 'full'},
  {path: 'data', component: DataComponent},
  {path: 'analysis', component: AnalysisComponent},
  {path: 'monitor', component: MonitorComponent}
];
