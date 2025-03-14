export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW_LP = 'UNDER_REVIEW_LP',
  RETURNED_BY_LP = 'RETURNED_BY_LP',
  APPROVED_BY_LP = 'APPROVED_BY_LP',
  UNDER_REVIEW_MANAGER = 'UNDER_REVIEW_MANAGER',
  RETURNED_BY_MANAGER = 'RETURNED_BY_MANAGER',
  APPROVED_BY_MANAGER = 'APPROVED_BY_MANAGER',
  UNDER_REVIEW_COO = 'UNDER_REVIEW_COO',
  RETURNED_BY_COO = 'RETURNED_BY_COO',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// For backward compatibility with API responses that might use string literals
export type ApplicationStatusType =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW_LP'
  | 'RETURNED_BY_LP'
  | 'APPROVED_BY_LP'
  | 'UNDER_REVIEW_MANAGER'
  | 'RETURNED_BY_MANAGER'
  | 'APPROVED_BY_MANAGER'
  | 'UNDER_REVIEW_COO'
  | 'RETURNED_BY_COO'
  | 'APPROVED'
  | 'REJECTED';

export interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationalId?: string;
  address?: string;
}

export interface ApplicationDocument {
  id: number;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface ApplicationComment {
  id: number;
  content: string;
  createdBy: string;
  createdAt: Date;
  attachments?: ApplicationDocument[];
}

export interface FarmLocation {
  latitude?: number;
  longitude?: number;
  address: string;
  size?: number;
  crops?: string[];
}

export interface Review {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: string;
  comments: string;
  timestamp: string;
}

export interface Application {
  id: number;
  applicationNumber: string;
  title: string;
  description?: string;
  type?: string;
  applicant: Applicant;
  farmLocation: FarmLocation;
  documents: ApplicationDocument[];
  status: ApplicationStatus | ApplicationStatusType;
  submittedAt: Date;
  updatedAt: Date;
  comments: ApplicationComment[];
  reviewedByLp?: {
    userId: number;
    name: string;
    date: Date;
    result: 'approved' | 'returned';
  };
  reviewedByManager?: {
    userId: number;
    name: string;
    date: Date;
    result: 'approved' | 'returned';
  };
  reviewedByCoo?: {
    userId: number;
    name: string;
    date: Date;
    result: 'approved' | 'rejected';
  };
  reviews?: Review[];
}
