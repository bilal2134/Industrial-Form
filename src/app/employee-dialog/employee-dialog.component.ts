import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../Services/employee.service';
import { StateService } from '../Services/state.service';
import { FileAttachment } from '../models/file-attachment.model';
import { FileAttachmentService } from '../Services/file-attachment.service';
import { State } from '../models/state.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ClientService } from '../Services/client.service';
import { Client } from '../models/client.model';
import { forkJoin } from 'rxjs';
import { MessageService } from '../Services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-employee-dialog',
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.css']
})
export class EmployeeDialogComponent implements OnInit {
  employeeForm: FormGroup;
  states: State[] = [];
  clients: Client[] = [];
  files: FileAttachment[] = [];
  isPresent: boolean = false;
  uploadedFiles: File[] = [];
  uploadedFileUrl: SafeUrl | null = null;
  _clientSettedValue:any;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,

    private stateService: StateService,
    private fileAttachmentService: FileAttachmentService,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<EmployeeDialogComponent>,
    private messageService: MessageService,
    private dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: Employee,
    private sanitizer: DomSanitizer
  ) {
    this.employeeForm = this.fb.group({
      name: [data?.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(30), this.noNumberInNameValidator]],
      email: [data?.email || '', [Validators.required, Validators.email, this.emailValidator]],
      clientId: [data?.client?.id || '', [Validators.required, this.clientValidator]],
      dateOfBirth: [data?.dateOfBirth ? new Date(data.dateOfBirth) : null, [Validators.required, this.dateOfBirthValidator]],
      experienceStartDate: [data?.experienceStartDate ? new Date(data.experienceStartDate) : null],
      experienceEndDate: [data?.experienceEndDate ? new Date(data.experienceEndDate) : null],
      hourlyRate: [data?.hourlyRate || 0, [Validators.required, this.hourlyRateValidator]],
      changeState: [data?.changeState || false],
      gender: [data?.gender || 'male'],
      states: [data?.states || [], [this.stateValidator]], // 1 change made here
      isPresent: [data?.isPresent || false],
      yearsOfExperience: [{value: '', disabled: true}]
    }, { validators: this.dateRangeValidator });

    this.isPresent = !!data?.isPresent;
    this.updateYearsOfExperience();
  }

  ngOnInit(): void {
    this.loadStates();
    this.loadClients();
    if (this.data?.id) {
      this.loadFiles(this.data.id);
    }
    this.employeeForm.get('experienceStartDate')?.valueChanges.subscribe(() => this.updateYearsOfExperience());
    this.employeeForm.get('experienceEndDate')?.valueChanges.subscribe(() => this.updateYearsOfExperience());
    this.employeeForm.get('changeState')?.valueChanges.subscribe(() => this.onChangeState());
    this.onChangeState();
    if (this.data && this.data.states && this.data.states.length > 0) {
      console.log("StatesIds", this.data.states);
      // 1st change here
      this.employeeForm.patchValue({ stateIds: this.data.states });
    }
  }

  loadStates(): void {
    this.stateService.getAllStates().subscribe(states => {
      this.states = states;
      console.log("States", states);
      if (this.data?.states) {
        console.log("StatesIds", this.data.states);
        this.employeeForm.patchValue({ stateIds: this.data.states });
      }
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe(clients => {
      console.log('Fetched clients in component:', clients); // Add this line to log the clients in component
      this.clients = clients;
      console.log('employee data ', this.data)
      if (this.data?.clientName) {
        this._clientSettedValue = this.data.clientName;
        this.employeeForm.patchValue({ clientId: this.data.clientId });
        console.log(this._clientSettedValue)
        console.log(this.employeeForm.get('clientId')?.value)
      }
    });
  }
  ClientChanged(event:any){
    //god forgive me
    console.log('event',event)
    this.clients.forEach((client)=>{
      if(client.name == event.value){
        this.employeeForm.patchValue({ clientId: client.id });
      }
    })
    console.log(this._clientSettedValue)
    console.log(this.employeeForm.get('clientId')?.value)
  }

  loadFiles(employeeId: string): void {
    this.fileAttachmentService.getFilesByEmployeeId(employeeId).subscribe(files => this.files = files);
  }

  calculateYearsOfExperience(startDate?: Date, endDate?: Date): string {
    if (!startDate) return '0 years 0 months';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    return `${diffYears} years ${diffMonths} months`;
  }

  updateYearsOfExperience(): void {
    const startDate = this.employeeForm.get('experienceStartDate')?.value;
    const endDate = this.isPresent ? new Date() : this.employeeForm.get('experienceEndDate')?.value;
    const experience = this.calculateYearsOfExperience(startDate, endDate);
    this.employeeForm.patchValue({ yearsOfExperience: experience });
  }

  // onSave(): void {
    
  //   if (this.employeeForm.valid) {
  //     const employee: Employee = this.employeeForm.value;
  //     if (this.data?.id) {
  //       this.employeeService.updateEmployee(this.data.id, employee).subscribe(() => {
  //         if (this.uploadedFiles.length > 0) {
  //           const uploadObservables = this.uploadedFiles.map(file => 
  //             this.fileAttachmentService.addFile(this.data.id!, file)
  //           );
  //           forkJoin(uploadObservables).subscribe(() => {
  //             this.messageService.showSuccess('Employee updated successfully');
  //             this.dialogRef.close(true);
  //           });
  //         } else {
  //           this.messageService.showSuccess('Employee updated successfully');
  //           this.dialogRef.close(true);
  //         }
  //       });
  //     } else {
  //       this.employeeService.createEmployee(employee).subscribe((createdEmployee) => {
  //         if (this.uploadedFiles.length > 0) {
  //           const uploadObservables = this.uploadedFiles.map(file => 
  //             this.fileAttachmentService.addFile(createdEmployee.id!, file)
  //           );
  //           forkJoin(uploadObservables).subscribe(() => {
  //             this.messageService.showSuccess('Employee created successfully');
  //             this.dialogRef.close(true);
  //           });
  //         } else {
  //           this.messageService.showSuccess('Employee created successfully');
  //           this.dialogRef.close(true);
  //         }
  //       });
  //     }
  //   }
  // }

  onSave(): void {
    if (this.employeeForm.valid) {
      const employee: Employee = this.employeeForm.value;
      if (this.data?.id) {
        this.employeeService.updateEmployee(this.data.id, employee).subscribe({
          next: () => {
            if (this.uploadedFiles.length > 0) {
              const uploadObservables = this.uploadedFiles.map(file => 
                this.fileAttachmentService.addFile(this.data.id!, file)
              );
              forkJoin(uploadObservables).subscribe(() => {
                this.messageService.showSuccess('Employee updated successfully');
                this.dialogRef.close(true);
              });
            } else {
              this.messageService.showSuccess('Employee updated successfully');
              this.dialogRef.close(true);
            }
          },
          error: (error) => {
            if (error.error && error.error.message === 'An employee with this email already exists.') {
              this.employeeForm.get('email')?.setErrors({ emailTaken: true });
            } else {
              this.messageService.showError('An error occurred while updating the employee');
            }
          }
        });
      } else {
        this.employeeService.createEmployee(employee).subscribe({
          next: (createdEmployee) => {
            if (this.uploadedFiles.length > 0) {
              const uploadObservables = this.uploadedFiles.map(file => 
                this.fileAttachmentService.addFile(createdEmployee.id!, file)
              );
              forkJoin(uploadObservables).subscribe(() => {
                this.messageService.showSuccess('Employee created successfully');
                this.dialogRef.close(true);
              });
            } else {
              this.messageService.showSuccess('Employee created successfully');
              this.dialogRef.close(true);
            }
          },
          error: (error) => {
            if (error.error && error.error.message === 'An employee with this email already exists.') {
              this.employeeForm.get('email')?.setErrors({ emailTaken: true });
            } else {
              this.messageService.showError('An employee with this email already exists');
            }
          }
        });
      }
    }
  }
  onDeleteUploadedFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  onDeleteFile(fileId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this file?' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fileAttachmentService.deleteFile(fileId).subscribe(() => {
          this.messageService.showSuccess('File deleted successfully');
          this.loadFiles(this.data.id!);
        });
      }
    });
  }

  onUploadFiles(event: any): void {
    const files: FileList = event.target.files;
    const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes

    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxFileSize) {
          this.messageService.showError('File size should not exceed 5 MB');
          return;
        }
        this.uploadedFiles.push(files[i]);
      }

      if (this.data?.id) {
        // If editing an existing employee, upload files immediately
        const uploadObservables = this.uploadedFiles.map(file => 
          this.fileAttachmentService.addFile(this.data.id!, file)
        );
        forkJoin(uploadObservables).subscribe(() => {
          this.loadFiles(this.data.id!);
          this.uploadedFiles = []; // Clear the uploaded files array
        });
      }
    }
  }

  getSafeUrl(file: File): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }

  onDownloadFile(file: FileAttachment): void {
    this.fileAttachmentService.downloadFile(file.id).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = file.fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  toggleIsPresent(): void {
    this.isPresent = !this.isPresent;
    if (this.isPresent) {
      this.employeeForm.get('experienceEndDate')?.setValue(new Date());
    } else {
      this.employeeForm.get('experienceEndDate')?.setValue(null);
    }
    this.updateYearsOfExperience();
  }
/// validators
// uniqueEmailValidator(): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     if (!control.value) {
//       return of(null);
//     }
//     return this.employeeService.checkEmailExists(control.value).pipe(
//       map(isTaken => (isTaken ? { emailTaken: true } : null)),
//       catchError(() => of(null))
//     );
//   };
// }
noNumberInNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && /\d/.test(value)) {
    return { numberInName: true };
  }
  return null;
}

dateOfBirthValidator(control: AbstractControl): ValidationErrors | null {
  const dob = new Date(control.value);
  const today = new Date();
  const minAge = 18;
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  return dob <= maxDate && dob <= today ? null : { invalidDateOfBirth: true };
}

  areBothDatesEntered(): boolean {
    const startDate = this.employeeForm.get('experienceStartDate')?.value;
    const endDate = this.employeeForm.get('experienceEndDate')?.value;
    return !!startDate && !!endDate;
  }

  dateRangeValidator(group: FormGroup): ValidationErrors | null {
    const start = group.get('experienceStartDate')?.value;
    const end = group.get('experienceEndDate')?.value;
    if (!start || !end) {
      return null; 
    }
    return start < end ? null : { invalidDateRange: true };
  }

  decimalPlacesValidator(decimalPlaces: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null || control.value === '') return null;
      const regex = new RegExp(`^-?\\d*(\\.\\d{1,${decimalPlaces}})?$`);
      return regex.test(control.value) ? null : { invalidDecimal: true };
    };
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (email && email.indexOf('@') !== -1) {
      const [, domain] = email.split('@');
      if (domain && domain.indexOf('.') === -1) {
        return { invalidEmailFormat: true };
      }
    }
    return null;
  }

  hourlyRateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value == null || value === '') return null;
    return /^\d+(\.\d{1,2})?$/.test(value) && parseFloat(value) > 0 ? null : { invalidHourlyRate: true };
  }

  clientValidator(control: AbstractControl): ValidationErrors | null {
    return control.value ? null : { clientRequired: true };
  }
  stateValidator(control: AbstractControl): ValidationErrors | null {
    return control.value && control.value.length > 0 ? null : { stateRequired: true };
  }
  onChangeState(): void {
    const changeState = this.employeeForm.get('changeState')?.value;
    const hourlyRateControl = this.employeeForm.get('hourlyRate');
    
    if (changeState) {
      hourlyRateControl?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
    } else {
      hourlyRateControl?.setValidators([Validators.required, Validators.min(0), this.decimalPlacesValidator(2)]);
    }
    
    hourlyRateControl?.updateValueAndValidity();
  }
}
