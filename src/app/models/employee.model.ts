import { FileAttachment } from "./file-attachment.model";

import { Client } from './client.model';

export interface Employee {
  id?: string;
  name: string;
  email: string;
  clientId?: string;
  clientName?: string;
  client?: Client; // Include the Client object
  experienceStartDate?: Date;
  experienceEndDate?: Date;
  hourlyRate?: number;
  isPresent?: boolean;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  changeState?: boolean;
  states?: string[];
  fileAttachments?: FileAttachment[];
}
