import { Application, ApplicationStatus } from '../models/application.model';

export const MOCK_APPLICATIONS: Application[] = [
  // Application ready for Agriculture Manager review
  {
    id: 501,
    applicationNumber: 'ARR-2025-501',
    title: 'Farm Expansion Project',
    applicant: {
      id: 201,
      name: 'Mohammed Al-Harbi',
      email: 'mohammed.alharbi@example.com',
      phone: '+966 55 987 6543',
      nationalId: '1098765432',
      address: '45 Prince Sultan Road, Jeddah',
    },
    farmLocation: {
      latitude: 26.317167,
      longitude: 50.144767,
      address: 'Northern Agricultural Zone, Sector B, Jeddah',
      size: 420,
      crops: ['Wheat', 'Barley', 'Date Palms'],
    },
    documents: [
      {
        id: 5001,
        name: 'Land Deed Certificate',
        type: 'PDF',
        url: 'assets/documents/sample_deed.pdf',
        uploadedAt: new Date('2025-02-01'),
      },
      {
        id: 5002,
        name: 'Environmental Impact Assessment',
        type: 'PDF',
        url: 'assets/documents/sample_assessment.pdf',
        uploadedAt: new Date('2025-02-03'),
      },
      {
        id: 5003,
        name: 'Previous Agricultural Records',
        type: 'XLSX',
        url: 'assets/documents/sample_records.xlsx',
        uploadedAt: new Date('2025-02-05'),
      },
    ],
    status: ApplicationStatus.APPROVED_BY_LP,
    submittedAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-10'),
    comments: [],
    reviews: [
      {
        reviewerId: 'lp-1',
        reviewerName: 'Ahmed Mohammed',
        reviewerRole: 'LP_SPECIALIST',
        decision: 'APPROVE',
        comments:
          'All land planning requirements have been met. The proposed farm expansion complies with zoning regulations and environmental standards.',
        timestamp: new Date('2025-02-10').toISOString(),
      },
    ],
  },

  // Application ready for COO review
  {
    id: 502,
    applicationNumber: 'ARR-2025-502',
    title: 'Smart Irrigation Project',
    applicant: {
      id: 202,
      name: 'Sara Al-Zahrani',
      email: 'sara.alzahrani@example.com',
      phone: '+966 50 876 5432',
      nationalId: '2109876543',
      address: '78 King Abdullah Road, Riyadh',
    },
    farmLocation: {
      latitude: 24.633333,
      longitude: 46.716667,
      address: 'Central Agricultural District, Zone 5, Riyadh',
      size: 550,
      crops: ['Tomatoes', 'Cucumbers', 'Lettuce', 'Peppers'],
    },
    documents: [
      {
        id: 6001,
        name: 'Smart Irrigation Proposal',
        type: 'PDF',
        url: 'assets/documents/sample_irrigation.pdf',
        uploadedAt: new Date('2025-01-15'),
      },
      {
        id: 6002,
        name: 'Technology Specifications',
        type: 'PDF',
        url: 'assets/documents/sample_specs.pdf',
        uploadedAt: new Date('2025-01-16'),
      },
      {
        id: 6003,
        name: 'Water Conservation Analysis',
        type: 'PDF',
        url: 'assets/documents/sample_water.pdf',
        uploadedAt: new Date('2025-01-17'),
      },
    ],
    status: ApplicationStatus.APPROVED_BY_AGRICULTURE,
    submittedAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-25'),
    comments: [],
    reviews: [
      {
        reviewerId: 'lp-2',
        reviewerName: 'Fatima Al-Otaibi',
        reviewerRole: 'LP_SPECIALIST',
        decision: 'APPROVE',
        comments:
          'The irrigation project meets all land planning requirements and environmental standards.',
        timestamp: new Date('2025-01-20').toISOString(),
      },
      {
        reviewerId: 'agr-1',
        reviewerName: 'Khalid Al-Saud',
        reviewerRole: 'AGRICULTURE_MANAGER',
        decision: 'APPROVE',
        comments:
          'The smart irrigation technology proposed will significantly improve water efficiency and crop yield. Approved for implementation.',
        timestamp: new Date('2025-01-25').toISOString(),
      },
    ],
  },

  // Application in draft state
  {
    id: 503,
    applicationNumber: 'ARR-2025-503',
    title: 'Organic Farm Certification',
    applicant: {
      id: 203,
      name: 'Abdullah Al-Qahtani',
      email: 'abdullah.qahtani@example.com',
      phone: '+966 54 765 4321',
      nationalId: '3210987654',
      address: '123 Olaya Street, Riyadh',
    },
    farmLocation: {
      latitude: 24.774265,
      longitude: 46.738586,
      address: 'Eastern Agricultural Zone, Block C, Riyadh',
      size: 300,
      crops: ['Organic Dates', 'Organic Vegetables'],
    },
    documents: [],
    status: ApplicationStatus.DRAFT,
    submittedAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-01'),
    comments: [],
    reviews: [],
  },

  // Application submitted and pending LP review
  {
    id: 504,
    applicationNumber: 'ARR-2025-504',
    title: 'Greenhouse Expansion',
    applicant: {
      id: 204,
      name: 'Noura Al-Dosari',
      email: 'noura.dosari@example.com',
      phone: '+966 56 654 3210',
      nationalId: '4321098765',
      address: '456 Tahlia Street, Jeddah',
    },
    farmLocation: {
      latitude: 21.543333,
      longitude: 39.172778,
      address: 'Western Agricultural Zone, Sector 7, Jeddah',
      size: 250,
      crops: ['Tomatoes', 'Bell Peppers', 'Strawberries'],
    },
    documents: [
      {
        id: 7001,
        name: 'Greenhouse Design Plans',
        type: 'PDF',
        url: 'assets/documents/sample_greenhouse.pdf',
        uploadedAt: new Date('2025-02-20'),
      },
      {
        id: 7002,
        name: 'Environmental Assessment',
        type: 'PDF',
        url: 'assets/documents/sample_env_assessment.pdf',
        uploadedAt: new Date('2025-02-21'),
      },
    ],
    status: ApplicationStatus.PENDING_LP_REVIEW,
    submittedAt: new Date('2025-02-22'),
    updatedAt: new Date('2025-02-22'),
    comments: [],
    reviews: [],
  },

  // Application rejected by LP
  {
    id: 505,
    applicationNumber: 'ARR-2025-505',
    title: 'Livestock Integration Project',
    applicant: {
      id: 205,
      name: 'Hassan Al-Ghamdi',
      email: 'hassan.ghamdi@example.com',
      phone: '+966 59 543 2109',
      nationalId: '5432109876',
      address: '789 King Fahd Road, Dammam',
    },
    farmLocation: {
      latitude: 26.432937,
      longitude: 50.10363,
      address: 'Eastern Province Agricultural District, Zone 3, Dammam',
      size: 600,
      crops: ['Alfalfa', 'Barley', 'Wheat'],
    },
    documents: [
      {
        id: 8001,
        name: 'Livestock Integration Plan',
        type: 'PDF',
        url: 'assets/documents/sample_livestock.pdf',
        uploadedAt: new Date('2025-01-05'),
      },
      {
        id: 8002,
        name: 'Waste Management Plan',
        type: 'PDF',
        url: 'assets/documents/sample_waste.pdf',
        uploadedAt: new Date('2025-01-06'),
      },
    ],
    status: ApplicationStatus.REJECTED_BY_LP,
    submittedAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-15'),
    comments: [],
    reviews: [
      {
        reviewerId: 'lp-3',
        reviewerName: 'Omar Al-Farsi',
        reviewerRole: 'LP_SPECIALIST',
        decision: 'REJECT',
        comments:
          'The proposed livestock integration does not comply with current zoning regulations for this agricultural district. The waste management plan is insufficient for the scale of the operation.',
        timestamp: new Date('2025-01-15').toISOString(),
      },
    ],
  },
];
