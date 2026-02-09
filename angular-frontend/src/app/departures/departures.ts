import {Component, OnDestroy, OnInit,signal } from '@angular/core';
import {CommonModule } from '@angular/common';
import { DepartureService } from '../services/departure.service';
import { Subscription, timer } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import {IDeparture} from '../services/IDeparture';

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
          this.departures.set(data);
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
