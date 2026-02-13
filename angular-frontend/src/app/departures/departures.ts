import {Component, OnDestroy, OnInit,signal } from '@angular/core';
import {CommonModule } from '@angular/common';
import { DepartureService } from '../../../scripts/services/departure.service';
import { Subscription, timer } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import {IDeparture} from '../../../scripts/services/IDeparture';

@Component({
  selector: 'app-departures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departures.html',
  styleUrls: ['./departures.css']
})
export class DeparturesComponent implements OnInit, OnDestroy  {
  departures = signal<IDeparture[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  private subscription!: Subscription;

  constructor(private depService: DepartureService) { }

  ngOnInit(): void {
    this.subscription = timer(0, 60000)
      .pipe(
        exhaustMap(() => this.depService.getAll())
      )
      .subscribe({
        next: data => {
          const sorted = [...data].sort((a, b) =>
            a.plannedTime.localeCompare(b.plannedTime)
          );
          this.departures.set(sorted);
          this.loading.set(false);
          this.error.set(null);
        },
        error: err => {
          console.error('getAll() error:', err);
          this.error.set('Failed to load departures');
          this.loading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
