import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileAttachment } from '../models/file-attachment.model';

@Injectable({
  providedIn: 'root'
})
export class FileAttachmentService {
  private apiUrl = 'https://localhost:7094/api/FileAttachments';

  constructor(private http: HttpClient) { }

  getFilesByEmployeeId(employeeId: string): Observable<FileAttachment[]> {
    return this.http.get<FileAttachment[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getFileById(id: string): Observable<FileAttachment> {
    return this.http.get<FileAttachment>(`${this.apiUrl}/${id}`);
  }

  addFile(employeeId: string, file: File): Observable<FileAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileAttachment>(`${this.apiUrl}/employee/${employeeId}`, formData);
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadFile(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }
}
