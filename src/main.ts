import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import Chart.js utilities to register all required components
import './app/core/utils/chart-utils';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
