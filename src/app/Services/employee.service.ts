// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { PaginatedResult } from '../models/paginated-result.model';
// import { Employee } from '../models/employee.model';





// @Injectable({
//   providedIn: 'root'
// })
// export class EmployeeService {
//   private apiUrl = 'https://localhost:7094/api/Employees';

//   constructor(private http: HttpClient) { }
//   getAllEmployees(): Observable<Employee[]> {
//     return this.http.get<Employee[]>(`${this.apiUrl}`);
//   }

//   getEmployees(pageNumber: number, pageSize: number, searchQuery: string): Observable<PaginatedResult<Employee>> {
//     let params = new HttpParams()
//       .set('pageNumber', pageNumber.toString())
//       .set('pageSize', pageSize.toString());
//     if (searchQuery) {
//       params = params.set('searchQuery', searchQuery);
//     }
//     return this.http.get<PaginatedResult<Employee>>(this.apiUrl, { params });
//   }

//   getEmployeeById(id: string): Observable<Employee> {
//     return this.http.get<Employee>(`${this.apiUrl}/${id}`);
//   }

//   createEmployee(employee: Employee): Observable<Employee> {
//     return this.http.post<Employee>(this.apiUrl, employee);
//   }

//   updateEmployee(id: string, employee: Employee): Observable<Employee> {
//     return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
//   }

//   deleteEmployee(id: string): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`);
//   }

//   addStateToEmployee(employeeId: string, stateId: string): Observable<void> {
//     return this.http.post<void>(`${this.apiUrl}/${employeeId}/states/${stateId}`, {});
//   }

//   removeStateFromEmployee(employeeId: string, stateId: string): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${employeeId}/states/${stateId}`);
//   }
// }



import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../models/paginated-result.model';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://localhost:7094/api/Employees';

  constructor(private http: HttpClient) { }
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}`);
  }

  // checkEmailExists(email: string): Observable<boolean> {
  //   return this.http.get<boolean>(`/api/employees/check-email?email=${email}`);
  // }

  getEmployees(pageNumber: number, pageSize: number, searchQuery: string): Observable<PaginatedResult<Employee>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    if (searchQuery) {
      params = params.set('searchQuery', searchQuery);
    }
    return this.http.get<PaginatedResult<Employee>>(this.apiUrl, { params });
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: string, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addStateToEmployee(employeeId: string, stateId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${employeeId}/states/${stateId}`, {});
  }

  removeStateFromEmployee(employeeId: string, stateId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${employeeId}/states/${stateId}`);
  }
}
