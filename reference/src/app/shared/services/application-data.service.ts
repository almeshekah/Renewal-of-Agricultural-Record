import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Application data interface
export interface FormApplicationData {
  personalInfo: {
    fullName: string;
    nationalId: string;
    email: string;
    mobile: string;
    address: string;
  };
  farmInfo: {
    farmName: string;
    region: string;
    city: string;
    location: string;
    farmSize: number;
    cropTypes: string[];
    hasIrrigationSystem: boolean;
  };
  licenseInfo: {
    hasPreviousLicense: boolean;
    previousLicenseNumber: string;
    previousLicenseDate: string;
    reasonForRenewal: string;
  };
  documents: {
    nationalIdCopy: File | null;
    landDeedCopy: File | null;
    previousLicenseCopy: File | null;
    additionalDocuments: File | null;
  };
  termsAgreed: boolean;
  declarationCorrect: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationDataService {
  private applicationDataSubject = new BehaviorSubject<FormApplicationData | null>(null);
  applicationData$ = this.applicationDataSubject.asObservable();

  constructor() {
    // Try to load from localStorage on initialization
    this.loadFromLocalStorage();
  }

  setApplicationData(data: FormApplicationData): void {
    // Store the data in the subject
    this.applicationDataSubject.next(data);

    // Make a serializable copy without File objects for localStorage
    const serializableData = this.makeSerializable(data);
    localStorage.setItem('submitted_application_data', JSON.stringify(serializableData));
  }

  getCurrentApplicationData(): FormApplicationData | null {
    return this.applicationDataSubject.value;
  }

  clearApplicationData(): void {
    this.applicationDataSubject.next(null);
    localStorage.removeItem('submitted_application_data');
  }

  private loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('submitted_application_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        this.applicationDataSubject.next(parsedData);
      } catch (e) {
        console.error('Error loading application data from localStorage:', e);
        localStorage.removeItem('submitted_application_data');
      }
    }
  }

  private makeSerializable(data: FormApplicationData): any {
    // Create a deep copy of the data
    const copy = JSON.parse(JSON.stringify(data));

    // Replace File objects with file names
    if (copy.documents) {
      Object.keys(copy.documents).forEach(key => {
        const fileObj = data.documents[key as keyof typeof data.documents];
        if (fileObj instanceof File) {
          copy.documents[key] = {
            name: fileObj.name,
            type: fileObj.type,
            size: fileObj.size,
          };
        }
      });
    }

    return copy;
  }
}
