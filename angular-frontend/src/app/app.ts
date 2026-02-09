import { Component, signal } from '@angular/core';
import {DeparturesComponent} from './departures/departures';

@Component({
  selector: 'app-root',
  imports: [DeparturesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-frontend');
}
