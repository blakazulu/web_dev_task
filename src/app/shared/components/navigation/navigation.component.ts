import {Component, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatIconModule, MatListModule, MatButtonModule, MatToolbarModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  isExpanded = signal(true);
  
  navLinks = [
    {
      path: 'data', 
      label: 'Data Management', 
      icon: 'assignment', 
      description: 'Manage trainee records and test results'
    },
    {
      path: 'analysis', 
      label: 'Performance Analysis', 
      icon: 'bar_chart', 
      description: 'Visualize data with interactive charts'
    },
    {
      path: 'monitor', 
      label: 'Monitor Overview', 
      icon: 'monitor', 
      description: 'Quick pass/fail status overview'
    }
  ];

  constructor(private router: Router) {
  }

  toggleSideNav(): void {
    this.isExpanded.update(current => !current);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
