import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-menu.component.html',
  styleUrls: ['./dashboard-menu.component.css']
})
export class DashboardMenuComponent {}

