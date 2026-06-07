import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css', './app.layout.css'],
  // Los providers de Firebase y Firestore deben ir en main.ts o bootstrapApplication, no aquÃ­
})
export class App {
  protected title = 'FrontGamez';
}


