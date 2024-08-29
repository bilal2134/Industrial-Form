import { Pipe, PipeTransform } from '@angular/core';
import { Employee } from '../models/employee.model';

@Pipe({
  name: 'yearsOfExperience'
})
export class YearsOfExperiencePipe implements PipeTransform {
  transform(employee: Employee): string {
    if (!employee.experienceStartDate) {
      return 'N/A';
    }

    const startDate = new Date(employee.experienceStartDate);
    const endDate = employee.experienceEndDate ? new Date(employee.experienceEndDate) : new Date();

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));

    return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  }
}