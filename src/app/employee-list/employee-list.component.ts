import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { debounceTime, Subject } from 'rxjs';
import { EmployeeService } from '../Services/employee.service';
import { Employee } from '../models/employee.model';
import { PaginatedResult } from '../models/paginated-result.model';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  employees: Employee[] = [];
  displayedColumns: string[] = ['name', 'email', 'clientName', 'yearsOfExperience', 'gender', 'hourlyRate', 'actions'];
  pageNumber = 1;
  pageSize = 10;
  pageSizeOptions = [1, 2, 25, 50];
  totalCount = 0;
  searchQuery = '';
  searchSubject = new Subject<string>();

  @ViewChild(MatSort) sort!: MatSort;
  employeeDataSource = new MatTableDataSource<Employee>([]);

  constructor(private employeeService: EmployeeService,   private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchText) => {
      this.pageNumber = 1;
      this.searchQuery = searchText;
      this.loadEmployees();
    });
  }

  ngAfterViewInit(): void {
    this.employeeDataSource.sort = this.sort;
  }

  loadEmployees(): void {
    this.employeeService.getEmployees(this.pageNumber, this.pageSize, this.searchQuery)
      .subscribe((result: PaginatedResult<Employee>) => {
        this.employees = result.items;
        console.log('Loaded employees:', this.employees); // Log loaded employees
        this.totalCount = result.totalCount;
        this.employeeDataSource.data = this.employees;
      });
  }

  onSearch(searchText: string): void {
    this.searchSubject.next(searchText);
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.loadEmployees();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  openDialog(employee?: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '600px',
      position: { right: '10px', top: '15px', bottom: '0px' },
      data: employee ? { ...employee } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  deleteEmployee(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to delete this employee?' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeeService.deleteEmployee(id).subscribe(
          () => {
            this.snackBar.open('Employee deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadEmployees();
          },
          (error) => {
            this.snackBar.open('Error deleting employee', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        );
      }
    });
  }

  getYearsOfExperience(startDate: Date, endDate: Date): string {
    if (!startDate || !endDate) return '0 years 0 months';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const diffDate = new Date(diff);
    const years = diffDate.getUTCFullYear() - 1970; // 1970 is the epoch year
    const months = diffDate.getUTCMonth();
    return `${years} years ${months} months`;
  }
}
