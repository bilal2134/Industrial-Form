import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { State } from '../models/state.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private apiUrl = 'https://localhost:7094/api/Statenames';

  constructor(private http: HttpClient) { }

  getAllStates(): Observable<State[]> {
    return this.http.get<State[]>(this.apiUrl);
  }

  getStateById(id: string): Observable<State> {
    return this.http.get<State>(`${this.apiUrl}/${id}`);
  }

  createState(state: State): Observable<State> {
    return this.http.post<State>(this.apiUrl, state);
  }

  updateState(id: string, state: State): Observable<State> {
    return this.http.put<State>(`${this.apiUrl}/${id}`, state);
  }

  deleteState(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
