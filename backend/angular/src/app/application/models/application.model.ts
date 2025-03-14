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
  id: number;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  address: string;
}

export interface ApplicationDocument {
  id: number;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface ApplicationComment {
  id?: number;
  userId: number;
  userName: string;
  text: string;
  timestamp: string;
}

export interface FarmLocation {
  latitude: number;
  longitude: number;
  address: string;
  size: number;
  crops: string[];
}

export interface Review {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comments: string;
  timestamp: string;
}

export interface Application {
  id: number;
  applicationNumber: string;
  title: string;
  applicant: Applicant;
  farmLocation: FarmLocation;
  documents: ApplicationDocument[];
  status: ApplicationStatus;
  submittedAt: Date;
  updatedAt: Date;
  comments: ApplicationComment[];
  reviews: Review[];
}
