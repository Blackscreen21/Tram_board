import { Component, signal } from '@angular/core';
import {DeparturesComponent} from './departures/departures';
import {Footer} from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [DeparturesComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-frontend');
}
