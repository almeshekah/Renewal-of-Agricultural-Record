export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  PENDING_LP_REVIEW = 'PENDING_LP_REVIEW',
  APPROVED_BY_LP = 'APPROVED_BY_LP',
  REJECTED_BY_LP = 'REJECTED_BY_LP',
  PENDING_AGRICULTURE_REVIEW = 'PENDING_AGRICULTURE_REVIEW',
  APPROVED_BY_AGRICULTURE = 'APPROVED_BY_AGRICULTURE',
  REJECTED_BY_AGRICULTURE = 'REJECTED_BY_AGRICULTURE',
  PENDING_COO_REVIEW = 'PENDING_COO_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type ApplicationStatusType = keyof typeof ApplicationStatus;

export interface Applicant {
  id: string;
  name: string;
  nationalId?: string;
  email: string;
  phone: string;
  address?: string;
}

export interface ApplicationDocument {
  id: number;
  type: string;
  name: string;
  size: number;
  contentType: string;
  uploadDate: string;
  content?: File;
}

export interface ApplicationComment {
  id?: number;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface FarmLocation {
  address: string;
  size?: number;
  crops?: string[];
  hasIrrigationSystem?: boolean;
  region?: string;
}

export interface Review {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comments: string;
  timestamp: string;
}

export interface PreviousLicense {
  number: string;
  issueDate: string;
  expiryDate: string;
  activityType?: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  title: string;
  applicant: Applicant;
  farmLocation?: FarmLocation;
  address?: string;
  recordType?: string;
  previousLicense?: PreviousLicense;
  documents?: ApplicationDocument[];
  status: ApplicationStatus;
  submissionDate: string | null;
  processInstanceId?: string;
  updatedAt: string | Date;
  comments?: ApplicationComment[];
  reviews?: Review[];
}
