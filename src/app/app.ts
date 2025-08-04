import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { VideogamesMenuComponent } from './videogames/videogames-menu.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideogamesMenuComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css', './app.layout.css'],
  // Los providers de Firebase y Firestore deben ir en main.ts o bootstrapApplication, no aquí
})
export class App {
  protected title = 'FrontGamez';
}
