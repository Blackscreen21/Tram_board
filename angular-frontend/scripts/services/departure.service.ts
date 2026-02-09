import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, map} from 'rxjs';
import {IDeparture} from './IDeparture';

@Injectable({
  providedIn: 'root'
})
export class DepartureService {
  constructor(private http: HttpClient) { }

  getEA(){
    return this.http.get<IDeparture[]>('http://localhost:3000/api/departures/ea');
  }
  getSE(){
      return this.http.get<IDeparture[]>('http://localhost:3000/api/departures/se');
  }

  getAll() {
    return forkJoin({
      ea: this.getEA(),
      se: this.getSE()
    }).pipe(
      map(result => {
        const combined :IDeparture[] = [...result.ea, ...result.se];
        combined.sort((a, b) => new Date(a.estimatedTime).getTime() - new Date(b.estimatedTime).getTime());
        return combined;
      })
    );
  }
}

