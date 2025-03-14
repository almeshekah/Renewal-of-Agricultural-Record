import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDataService {
  private applicationData: any = null;

  constructor() {}

  /**
   * Set the application data
   * @param data The form data to store
   */
  setApplicationData(data: any): void {
    this.applicationData = data;
    // Optionally store in localStorage for persistence
    localStorage.setItem('agricultural_application_data', JSON.stringify(data));
  }

  /**
   * Get the stored application data
   * @returns The stored application data
   */
  getApplicationData(): any {
    // If data is not in memory, try to load from localStorage
    if (!this.applicationData) {
      const storedData = localStorage.getItem('agricultural_application_data');
      if (storedData) {
        this.applicationData = JSON.parse(storedData);
      }
    }
    return this.applicationData;
  }

  /**
   * Clear the stored application data
   */
  clearApplicationData(): void {
    this.applicationData = null;
    localStorage.removeItem('agricultural_application_data');
  }
}
