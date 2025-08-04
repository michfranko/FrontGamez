import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-videogames-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './videogames-menu.component.html',
  styleUrls: ['./videogames-menu.component.css', './videogames-menu.layout.css']
})
export class VideogamesMenuComponent {}
