import { User } from '../models/user.model';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'applicant1',
    email: 'applicant1@example.com',
    fullName: 'Ahmad Al Saud',
    role: 'applicant',
  },
  {
    id: 2,
    username: 'lp-specialist',
    email: 'lp-specialist@thiqah.sa',
    fullName: 'Mohammed Al Qahtani',
    role: 'lp-specialist',
  },
  {
    id: 3,
    username: 'agriculture-manager',
    email: 'agriculture-manager@thiqah.sa',
    fullName: 'Saeed Al Ghamdi',
    role: 'agriculture-manager',
  },
  {
    id: 4,
    username: 'coo',
    email: 'coo@thiqah.sa',
    fullName: 'Abdullah Al Otaibi',
    role: 'coo',
  },
  {
    id: 5,
    username: 'demo_user',
    email: 'demo@thiqah.sa',
    fullName: 'Demo User',
    role: 'applicant',
  },
];
