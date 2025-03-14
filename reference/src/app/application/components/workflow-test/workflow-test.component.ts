import { Component, OnInit } from '@angular/core';
import { Application, ApplicationStatus } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';
import { WorkflowService } from '../../services/workflow.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-workflow-test',
  templateUrl: './workflow-test.component.html',
  styleUrls: ['./workflow-test.component.scss'],
})
export class WorkflowTestComponent implements OnInit {
  testApplication: Application;
  currentStep: number = 0;
  isLoading: boolean = false;
  statusMessage: string = '';
  errorMessage: string = '';

  // localStorage keys
  private readonly STORAGE_APP_KEY = 'agricultural_workflow_application';
  private readonly STORAGE_STEP_KEY = 'agricultural_workflow_current_step';
  private readonly STORAGE_TEST_APPS_KEY = 'agricultural_test_applications';
  private readonly STORAGE_SUBMITTED_APP_KEY = 'submitted_application_data';
  private readonly STORAGE_SUBMITTED_DETAILS_KEY = 'submitted_application_details';

  readonly workflowSteps = [
    { label: 'Submit Application', status: ApplicationStatus.SUBMITTED },
    { label: 'L&P Specialist Review', status: ApplicationStatus.UNDER_REVIEW_LP },
    { label: 'L&P Specialist Decision', status: ApplicationStatus.APPROVED_BY_LP },
    { label: 'Agriculture Manager Review', status: ApplicationStatus.UNDER_REVIEW_MANAGER },
    { label: 'Agriculture Manager Decision', status: ApplicationStatus.APPROVED_BY_MANAGER },
    { label: 'COO Review', status: ApplicationStatus.UNDER_REVIEW_COO },
    { label: 'Final Decision', status: ApplicationStatus.APPROVED },
  ];

  // User information for test workflows
  readonly userInfo = {
    lpSpecialist: { role: 'lp-specialist' as const, id: '101', name: 'Mohammed Al Qahtani' },
    manager: { role: 'agriculture-manager' as const, id: '102', name: 'Saeed Al Ghamdi' },
    coo: { role: 'coo' as const, id: '103', name: 'Abdullah Al Otaibi' },
  };

  constructor(
    private applicationService: ApplicationService,
    private workflowService: WorkflowService
  ) {}

  ngOnInit(): void {
    // First try to load the current application or create a new one
    if (!this.loadFromLocalStorage()) {
      this.createFromSubmittedData();
    }
  }

  // Create test application from the form data
  private createFromSubmittedData(): void {
    // First try to use the detailed submitted application
    const submittedDetails = localStorage.getItem(this.STORAGE_SUBMITTED_DETAILS_KEY);
    if (submittedDetails) {
      try {
        const details = JSON.parse(submittedDetails);

        // Create application with submitted details
        this.createApplicationFromDetails(details);
        return;
      } catch (e) {
        console.error('Error creating from submitted details:', e);
      }
    }

    // Fall back to using the full form data
    const storedData = localStorage.getItem(this.STORAGE_SUBMITTED_APP_KEY);
    if (storedData) {
      try {
        const formData = JSON.parse(storedData);

        // Use form data to create a test application
        this.createTestApplicationWithFormData(formData);
      } catch (e) {
        console.error('Error creating from submitted data:', e);
        // Fall back to mock data
        this.createMockApplication();
      }
    } else {
      // No submitted data, create mock
      this.createMockApplication();
    }
  }

  // Create application using the simplified submitted details
  private createApplicationFromDetails(details: any): void {
    const currentDate = new Date();

    this.testApplication = {
      id: parseInt(details.applicationId.replace('APP-', '')) || Math.floor(Math.random() * 10000),
      applicationNumber:
        details.applicationNumber ||
        `AGR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      title: details.title || 'Farm Renewal Application',
      description: 'Agricultural record renewal application',
      status: ApplicationStatus.SUBMITTED,
      submittedAt: currentDate,
      updatedAt: currentDate,
      applicant: {
        id: 999,
        name: details.applicantName || 'Applicant Name',
        email: 'demo@example.com',
        phone: '966512345678',
        nationalId: 'SA-ID-XXXXXXXXX',
        address: 'Demo Address',
      },
      farmLocation: {
        address: details.farmLocation || 'Unknown Location',
        size: details.farmSize || 100,
        crops: details.cropTypes || ['Unknown'],
      },
      reviews: [],
      documents: [],
      comments: [],
    } as unknown as Application;

    this.statusMessage = 'Application ready for review';
    this.currentStep = 0;

    // Save to localStorage
    this.saveToLocalStorage();
  }

  // Create test application using real form data
  private createTestApplicationWithFormData(formData: any): void {
    const mockId = Math.floor(Math.random() * 10000);
    const mockApplicationNumber = 'AGR-' + new Date().getFullYear() + '-' + mockId;
    const currentDate = new Date();

    // Extract personal info
    const personalInfo = formData.personalInfo || {};
    const farmInfo = formData.farmInfo || {};
    const licenseInfo = formData.licenseInfo || {};

    this.testApplication = {
      id: mockId,
      applicationNumber: mockApplicationNumber,
      title: `${personalInfo.fullName || 'New'}'s Farm Renewal Application`,
      description: licenseInfo.reasonForRenewal || 'Agricultural record renewal application',
      status: ApplicationStatus.SUBMITTED,
      submittedAt: currentDate,
      updatedAt: currentDate,
      applicant: {
        id: 999,
        name: personalInfo.fullName || 'Test Applicant',
        email: personalInfo.email || 'test@example.com',
        phone: personalInfo.mobile || '9665XXXXXXXX',
        nationalId: personalInfo.nationalId || 'XXXXXXXXXX',
        address: personalInfo.address || 'Test Address',
      },
      farmLocation: {
        address: farmInfo.location || 'Test Location',
        size: farmInfo.farmSize || 100,
        crops: farmInfo.cropTypes || ['Wheat'],
      },
      reviews: [],
      documents: [],
      comments: [],
    } as unknown as Application;

    this.statusMessage = 'Application ready for review';
    this.currentStep = 0;

    // Save to localStorage
    this.saveToLocalStorage();
  }

  // Save application state to localStorage
  private saveToLocalStorage(): void {
    if (this.testApplication) {
      const serialized = this.serializeApplication(this.testApplication);
      localStorage.setItem(this.STORAGE_APP_KEY, JSON.stringify(serialized));
      localStorage.setItem(this.STORAGE_STEP_KEY, this.currentStep.toString());
    }
  }

  // Load application state from localStorage
  private loadFromLocalStorage(): boolean {
    const savedApplication = localStorage.getItem(this.STORAGE_APP_KEY);
    const savedStep = localStorage.getItem(this.STORAGE_STEP_KEY);

    if (savedApplication) {
      try {
        const parsed = JSON.parse(savedApplication);
        this.testApplication = this.deserializeApplication(parsed);
        this.currentStep = savedStep ? parseInt(savedStep, 10) : 0;
        this.statusMessage = '';
        return true;
      } catch (e) {
        console.error('Error loading from localStorage:', e);
        // If there's an error parsing the saved data, clear it
        localStorage.removeItem(this.STORAGE_APP_KEY);
        localStorage.removeItem(this.STORAGE_STEP_KEY);
      }
    }
    return false;
  }

  createMockApplication(): void {
    // Initialize with a mock application directly without API calls
    const mockId = Math.floor(Math.random() * 10000);
    const mockApplicationNumber = 'AGR-' + new Date().getFullYear() + '-' + mockId;
    const currentDate = new Date();

    this.testApplication = {
      id: mockId,
      applicationNumber: mockApplicationNumber,
      title: 'Test Farm Renewal Application ' + currentDate.toISOString().slice(0, 10),
      description: 'Agricultural record renewal application for review and approval',
      status: ApplicationStatus.SUBMITTED,
      submittedAt: currentDate,
      updatedAt: currentDate,
      applicant: {
        id: 999,
        name: 'Mohammed Al Qahtani',
        email: 'mohammed@example.com',
        phone: '966512345678',
        nationalId: 'SA-ID-103458792',
        address: 'Al Olaya District, Riyadh, Saudi Arabia',
      },
      farmLocation: {
        address: 'Northern Agricultural District, Riyadh Region',
        size: 150,
        crops: ['Wheat', 'Dates', 'Vegetables'],
      },
      reviews: [],
      documents: [],
      comments: [],
    } as unknown as Application;

    this.statusMessage = 'Application ready for review';
    this.currentStep = 0;

    // Save to localStorage
    this.saveToLocalStorage();
  }

  // Replace the old loadOrCreateApplication method with the mock version
  loadOrCreateApplication(): void {
    if (!this.loadFromLocalStorage()) {
      this.createFromSubmittedData();
    }
  }

  createAndSubmitApplication(): void {
    // Reset workflow data
    localStorage.removeItem(this.STORAGE_APP_KEY);
    localStorage.removeItem(this.STORAGE_STEP_KEY);

    // Recreate from submitted data
    this.createFromSubmittedData();
  }

  // Mock the submitApplication to work with the mock application
  submitApplication(): void {
    if (!this.testApplication || this.isLoading) return;

    this.statusMessage = 'Finalizing application...';

    // Simulate a successful submission without API call
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.SUBMITTED;
      this.isLoading = false;
      this.statusMessage = 'Application ready for review';
      this.currentStep = 0;
      this.saveToLocalStorage();
    }, 500);
  }

  startLPSpecialistReview(): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = 'Starting L&P Specialist review...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.UNDER_REVIEW_LP;
      this.isLoading = false;
      this.statusMessage = 'L&P Specialist review started';
      this.currentStep = 1;
      this.saveToLocalStorage();
    }, 500);
  }

  approveLPSpecialist(): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = 'Approving application as L&P Specialist...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.APPROVED_BY_LP;
      this.testApplication.reviews = this.testApplication.reviews || [];
      this.testApplication.reviews.push({
        reviewerId: this.userInfo.lpSpecialist.id,
        reviewerName: this.userInfo.lpSpecialist.name,
        reviewerRole: this.userInfo.lpSpecialist.role,
        timestamp: new Date().toISOString(),
        decision: 'APPROVE',
        comments: 'Approved by L&P Specialist',
      });
      this.isLoading = false;
      this.statusMessage = 'Application approved by L&P Specialist';
      this.currentStep = 2;
      this.saveToLocalStorage();
    }, 500);
  }

  startManagerReview(): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = 'Starting Manager review...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.UNDER_REVIEW_MANAGER;
      this.isLoading = false;
      this.statusMessage = 'Manager review started';
      this.currentStep = 3;
      this.saveToLocalStorage();
    }, 500);
  }

  approveManager(): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = 'Approving application as Manager...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.APPROVED_BY_MANAGER;
      this.testApplication.reviews = this.testApplication.reviews || [];
      this.testApplication.reviews.push({
        reviewerId: this.userInfo.manager.id,
        reviewerName: this.userInfo.manager.name,
        reviewerRole: this.userInfo.manager.role,
        timestamp: new Date().toISOString(),
        decision: 'APPROVE',
        comments: 'Approved by Manager',
      });
      this.isLoading = false;
      this.statusMessage = 'Application approved by Manager';
      this.currentStep = 4;
      this.saveToLocalStorage();
    }, 500);
  }

  startCOOReview(): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = 'Starting COO review...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.UNDER_REVIEW_COO;
      this.isLoading = false;
      this.statusMessage = 'COO review started';
      this.currentStep = 5;
      this.saveToLocalStorage();
    }, 500);
  }

  approveCOO(): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = 'Approving application as COO...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.APPROVED;
      this.testApplication.reviews = this.testApplication.reviews || [];
      this.testApplication.reviews.push({
        reviewerId: this.userInfo.coo.id,
        reviewerName: this.userInfo.coo.name,
        reviewerRole: this.userInfo.coo.role,
        timestamp: new Date().toISOString(),
        decision: 'APPROVE',
        comments: 'Approved by COO',
      });
      this.isLoading = false;
      this.statusMessage = 'Application approved by COO';
      this.currentStep = 6;
      this.saveToLocalStorage();
    }, 500);
  }

  rejectCOO(): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = 'Rejecting application as COO...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.REJECTED;
      this.testApplication.reviews = this.testApplication.reviews || [];
      this.testApplication.reviews.push({
        reviewerId: this.userInfo.coo.id,
        reviewerName: this.userInfo.coo.name,
        reviewerRole: this.userInfo.coo.role,
        timestamp: new Date().toISOString(),
        decision: 'REJECT',
        comments: 'Rejected by COO',
      });
      this.isLoading = false;
      this.statusMessage = 'Application rejected by COO';
      this.currentStep = 6;
      this.saveToLocalStorage();
    }, 500);
  }

  returnApplication(role: 'lp-specialist' | 'agriculture-manager' | 'coo'): void {
    if (!this.testApplication || this.isLoading) return;

    this.isLoading = true;
    this.statusMessage = `Returning application as ${role}...`;
    this.errorMessage = '';

    let reviewer = {
      role: role,
      id: '',
      name: 'Unknown',
    };

    if (role === 'lp-specialist') {
      reviewer = this.userInfo.lpSpecialist;
    } else if (role === 'agriculture-manager') {
      reviewer = this.userInfo.manager;
    } else if (role === 'coo') {
      reviewer = this.userInfo.coo;
    }

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.SUBMITTED; // Using SUBMITTED instead of RETURNED
      this.testApplication.reviews = this.testApplication.reviews || [];
      this.testApplication.reviews.push({
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        reviewerRole: reviewer.role,
        timestamp: new Date().toISOString(),
        decision: 'RETURN',
        comments: `Returned by ${reviewer.name} for additional information or corrections`,
      });
      this.isLoading = false;
      this.statusMessage = `Application returned by ${reviewer.name}`;
      this.saveToLocalStorage();
    }, 500);
  }

  rejectApplication(role: 'lp-specialist'): void {
    if (!this.testApplication || this.isLoading || role !== 'lp-specialist') return;

    this.isLoading = true;
    this.statusMessage = 'Rejecting application as L&P Specialist...';
    this.errorMessage = '';

    // Mock the API call with a local update
    setTimeout(() => {
      this.testApplication.status = ApplicationStatus.REJECTED;
      this.testApplication.reviews = this.testApplication.reviews || [];
      this.testApplication.reviews.push({
        reviewerId: this.userInfo.lpSpecialist.id,
        reviewerName: this.userInfo.lpSpecialist.name,
        reviewerRole: this.userInfo.lpSpecialist.role,
        timestamp: new Date().toISOString(),
        decision: 'REJECT',
        comments: 'Rejected by L&P Specialist',
      });
      this.isLoading = false;
      this.statusMessage = 'Application rejected by L&P Specialist';
      this.currentStep = 1; // Keep the step at the specialist review step
      this.saveToLocalStorage();
    }, 500);
  }

  getStepClass(index: number): string {
    if (index < this.currentStep) {
      return 'completed';
    } else if (index === this.currentStep) {
      return 'active';
    } else {
      return 'disabled';
    }
  }

  getStatusClass(status: ApplicationStatus | string): string {
    if (!status) return '';

    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'status-draft';
      case ApplicationStatus.SUBMITTED:
        return 'status-submitted';
      case ApplicationStatus.UNDER_REVIEW_LP:
      case ApplicationStatus.UNDER_REVIEW_MANAGER:
      case ApplicationStatus.UNDER_REVIEW_COO:
        return 'status-under-review';
      case ApplicationStatus.APPROVED_BY_LP:
      case ApplicationStatus.APPROVED_BY_MANAGER:
      case ApplicationStatus.APPROVED:
        return 'status-approved';
      case ApplicationStatus.RETURNED_BY_LP:
      case ApplicationStatus.RETURNED_BY_MANAGER:
      case ApplicationStatus.RETURNED_BY_COO:
        return 'status-returned';
      case ApplicationStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  }

  // Add a method to clear localStorage and reset the application
  resetAllData(): void {
    localStorage.removeItem(this.STORAGE_APP_KEY);
    localStorage.removeItem(this.STORAGE_STEP_KEY);
    this.createMockApplication();
  }

  // Add a helper method to convert Date objects to strings for localStorage
  private serializeApplication(application: Application): any {
    // Create a deep copy to avoid modifying the original
    const serialized = JSON.parse(JSON.stringify(application));

    // Convert Date objects to ISO strings for JSON storage
    if (serialized.submittedAt) {
      serialized.submittedAt = application.submittedAt.toISOString();
    }
    if (serialized.updatedAt) {
      serialized.updatedAt = application.updatedAt.toISOString();
    }

    return serialized;
  }

  // Add a helper method to convert strings back to Date objects
  private deserializeApplication(serialized: any): Application {
    // Convert ISO strings back to Date objects
    if (serialized.submittedAt) {
      serialized.submittedAt = new Date(serialized.submittedAt);
    }
    if (serialized.updatedAt) {
      serialized.updatedAt = new Date(serialized.updatedAt);
    }

    return serialized as Application;
  }

  // Add this method to the component class
  getStatusDisplayValue(status: ApplicationStatus | string): string {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'Draft';
      case ApplicationStatus.SUBMITTED:
        return 'Submitted';
      case ApplicationStatus.UNDER_REVIEW_LP:
        return 'L&P Specialist Review';
      case ApplicationStatus.APPROVED_BY_LP:
        return 'Approved by L&P Specialist';
      case ApplicationStatus.UNDER_REVIEW_MANAGER:
        return 'Manager Review';
      case ApplicationStatus.APPROVED_BY_MANAGER:
        return 'Approved by Manager';
      case ApplicationStatus.UNDER_REVIEW_COO:
        return 'COO Review';
      case ApplicationStatus.APPROVED:
        return 'Approved';
      case ApplicationStatus.REJECTED:
        return 'Rejected';
      default:
        return status as string;
    }
  }
}
