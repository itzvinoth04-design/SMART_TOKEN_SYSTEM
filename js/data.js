/**
 * QueueLess - Smart College Queue and Token Management System
 * data.js: Core Data Store, LocalStorage Persistence, and Queue Calculations
 */

// Storage Keys
const STORAGE_KEYS = {
  TOKENS: 'queueless_tokens',
  SERVICES: 'queueless_services',
  COUNTERS: 'queueless_counters',
  STAFF: 'queueless_staff',
  NOTIFICATIONS: 'queueless_notifications',
  SETTINGS: 'queueless_settings',
  AUTH: 'queueless_auth',
  STUDENT_PROFILE: 'queueless_student_profile'
};

// Default College Services (16 Required Services)
const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    code: 'CERT',
    name: 'Bonafide Certificate',
    department: 'Administrative Office',
    icon: 'fa-id-card-clip',
    description: 'Verification of student enrollment for bus pass, passport, bank, or visa.',
    avgDuration: 5, // in minutes
    maxCapacity: 60,
    prefix: 'CERT',
    documentsRequired: ['Student ID Card Copy', 'Fee Clearance Slip'],
    isActive: true
  },
  {
    id: 'srv-2',
    code: 'TC',
    name: 'Transfer Certificate (TC)',
    department: 'Administrative Office',
    icon: 'fa-file-signature',
    description: 'Official transfer certificate and conduct record for graduation or transfer.',
    avgDuration: 10,
    maxCapacity: 30,
    prefix: 'TC',
    documentsRequired: ['No-Due Clearance Form', 'Original ID Card Surrender', 'Admission Receipt'],
    isActive: true
  },
  {
    id: 'srv-3',
    code: 'COND',
    name: 'Conduct Certificate',
    department: 'Student Affairs',
    icon: 'fa-award',
    description: 'Official endorsement of character and behavioral record during study.',
    avgDuration: 5,
    maxCapacity: 40,
    prefix: 'COND',
    documentsRequired: ['Student ID Card', 'Department HOD Recommendation'],
    isActive: true
  },
  {
    id: 'srv-4',
    code: 'CC',
    name: 'Course Completion Certificate',
    department: 'Academic Section',
    icon: 'fa-graduation-cap',
    description: 'Provisional course completion declaration before degree convocation.',
    avgDuration: 8,
    maxCapacity: 45,
    prefix: 'CC',
    documentsRequired: ['Final Semester Marksheet Photocopy', 'Hall Ticket'],
    isActive: true
  },
  {
    id: 'srv-5',
    code: 'MARK',
    name: 'Semester Marksheet / Transcript',
    department: 'Examination Cell',
    icon: 'fa-file-lines',
    description: 'Official grade transcripts, duplicate marksheets, or grade verification.',
    avgDuration: 7,
    maxCapacity: 50,
    prefix: 'MARK',
    documentsRequired: ['Semester Exam Registration Slip', 'Payment Receipt for Transcript'],
    isActive: true
  },
  {
    id: 'srv-6',
    code: 'FEE',
    name: 'Fee Payment Receipt',
    department: 'Accounts Office',
    icon: 'fa-receipt',
    description: 'Duplicate tuition, hostel, or exam fee payment vouchers and receipts.',
    avgDuration: 4,
    maxCapacity: 80,
    prefix: 'FEE',
    documentsRequired: ['Bank Transaction UTR / Challan Copy', 'Student ID Card'],
    isActive: true
  },
  {
    id: 'srv-7',
    code: 'SCHOL',
    name: 'Scholarship Enquiry',
    department: 'Accounts Office',
    icon: 'fa-hand-holding-dollar',
    description: 'Government, merit, and private scholarship status, verification, and disbursement.',
    avgDuration: 8,
    maxCapacity: 40,
    prefix: 'SCHOL',
    documentsRequired: ['Scholarship Application Copy', 'Income Certificate', 'Community Certificate'],
    isActive: true
  },
  {
    id: 'srv-8',
    code: 'TUIT',
    name: 'Tuition Fee and Payment Enquiry',
    department: 'Accounts Office',
    icon: 'fa-wallet',
    description: 'Fee installment requests, fee structure breakdowns, and fine waivers.',
    avgDuration: 6,
    maxCapacity: 60,
    prefix: 'TUIT',
    documentsRequired: ['Parent Authorization Letter (if applicable)', 'Current Fee Demand Note'],
    isActive: true
  },
  {
    id: 'srv-9',
    code: 'EXAM',
    name: 'Examination and Hall Ticket Enquiry',
    department: 'Examination Cell',
    icon: 'fa-clipboard-check',
    description: 'Hall ticket issuance, timetable discrepancies, and revaluation forms.',
    avgDuration: 6,
    maxCapacity: 75,
    prefix: 'EXAM',
    documentsRequired: ['Exam Registration Form', 'Fee Payment Proof'],
    isActive: true
  },
  {
    id: 'srv-10',
    code: 'ADM',
    name: 'Admission Enquiry',
    department: 'Administrative Office',
    icon: 'fa-building-columns',
    description: 'Lateral entry, document verification, branch change, and quota queries.',
    avgDuration: 12,
    maxCapacity: 35,
    prefix: 'ADM',
    documentsRequired: ['Allotment Letter', '10th & 12th Original Marksheets'],
    isActive: true
  },
  {
    id: 'srv-11',
    code: 'IDC',
    name: 'ID Card Issue or Replacement',
    department: 'Student Affairs',
    icon: 'fa-address-card',
    description: 'New RFID student smartcard or replacement for damaged/lost ID cards.',
    avgDuration: 5,
    maxCapacity: 50,
    prefix: 'IDC',
    documentsRequired: ['Police Loss Report or Damaged Card', 'Passport Photo', 'Fee Challan'],
    isActive: true
  },
  {
    id: 'srv-12',
    code: 'HOST',
    name: 'Hostel Office Enquiry',
    department: 'Hostel Office',
    icon: 'fa-bed',
    description: 'Room allocation, mess fee clearance, vacate requests, and hostel leave pass.',
    avgDuration: 7,
    maxCapacity: 40,
    prefix: 'HOST',
    documentsRequired: ['Hostel Fee Receipt', 'Warden Recommendation Slip'],
    isActive: true
  },
  {
    id: 'srv-13',
    code: 'TRANS',
    name: 'Transport Office Enquiry',
    department: 'Transport Office',
    icon: 'fa-bus',
    description: 'College bus pass renewal, route modifications, and transport fee payment.',
    avgDuration: 5,
    maxCapacity: 50,
    prefix: 'TRANS',
    documentsRequired: ['Transport Fee Receipt', 'Route Change Application'],
    isActive: true
  },
  {
    id: 'srv-14',
    code: 'LIB',
    name: 'Library Clearance',
    department: 'Library',
    icon: 'fa-book-open-reader',
    description: 'Book return audit, overdue fine settlement, and digital library card clearance.',
    avgDuration: 4,
    maxCapacity: 70,
    prefix: 'LIB',
    documentsRequired: ['Student ID Card', 'Library Due Slip'],
    isActive: true
  },
  {
    id: 'srv-15',
    code: 'NODUE',
    name: 'No-Due Certificate',
    department: 'Administrative Office',
    icon: 'fa-stamp',
    description: 'Consolidated institutional clearance from all departments for semester/final exit.',
    avgDuration: 9,
    maxCapacity: 40,
    prefix: 'NODUE',
    documentsRequired: ['Signed Department Clearance Slips', 'Original ID Card'],
    isActive: true
  },
  {
    id: 'srv-16',
    code: 'GEN',
    name: 'General Student Enquiry',
    department: 'Student Support',
    icon: 'fa-circle-question',
    description: 'Helpdesk for student grievances, general administrative guidance, and queries.',
    avgDuration: 5,
    maxCapacity: 100,
    prefix: 'GEN',
    documentsRequired: ['Student ID Card'],
    isActive: true
  }
];

// Default Counters
const DEFAULT_COUNTERS = [
  {
    id: 'cnt-1',
    number: 1,
    name: 'Counter 1 – Certificate Section',
    department: 'Administrative Office',
    assignedStaff: 'Mrs. Rekha Sharma',
    staffEmail: 'staff@college.edu',
    status: 'Serving', // Serving, Available, Paused, Offline
    currentToken: 'CERT-024',
    studentsServedToday: 18,
    activeServices: ['Bonafide Certificate', 'Transfer Certificate (TC)', 'Admission Enquiry', 'No-Due Certificate']
  },
  {
    id: 'cnt-2',
    number: 2,
    name: 'Counter 2 – Accounts & Finance',
    department: 'Accounts Office',
    assignedStaff: 'Mr. Rajesh Kumar',
    staffEmail: 'rajesh.k@college.edu',
    status: 'Available',
    currentToken: null,
    studentsServedToday: 24,
    activeServices: ['Fee Payment Receipt', 'Scholarship Enquiry', 'Tuition Fee and Payment Enquiry']
  },
  {
    id: 'cnt-3',
    number: 3,
    name: 'Counter 3 – Examination Cell',
    department: 'Examination Cell',
    assignedStaff: 'Dr. S. Meenakshi',
    staffEmail: 'meenakshi.s@college.edu',
    status: 'Serving',
    currentToken: 'MARK-019',
    studentsServedToday: 15,
    activeServices: ['Semester Marksheet / Transcript', 'Examination and Hall Ticket Enquiry']
  },
  {
    id: 'cnt-4',
    number: 4,
    name: 'Counter 4 – Student Support & Services',
    department: 'Student Support',
    assignedStaff: 'Mr. David Paul',
    staffEmail: 'david.p@college.edu',
    status: 'Available',
    currentToken: null,
    studentsServedToday: 19,
    activeServices: ['Conduct Certificate', 'ID Card Issue or Replacement', 'Hostel Office Enquiry', 'Transport Office Enquiry', 'Library Clearance', 'General Student Enquiry']
  }
];

// Default Staff Accounts
const DEFAULT_STAFF = [
  {
    id: 'stf-1',
    name: 'Mrs. Rekha Sharma',
    email: 'staff@college.edu',
    role: 'Staff',
    department: 'Administrative Office',
    assignedCounterId: 'cnt-1',
    status: 'Active',
    servedCount: 18,
    avgTimeMins: 4.8
  },
  {
    id: 'stf-2',
    name: 'Mr. Rajesh Kumar',
    email: 'rajesh.k@college.edu',
    role: 'Staff',
    department: 'Accounts Office',
    assignedCounterId: 'cnt-2',
    status: 'Active',
    servedCount: 24,
    avgTimeMins: 5.2
  },
  {
    id: 'stf-3',
    name: 'Dr. S. Meenakshi',
    email: 'meenakshi.s@college.edu',
    role: 'Staff',
    department: 'Examination Cell',
    assignedCounterId: 'cnt-3',
    status: 'Active',
    servedCount: 15,
    avgTimeMins: 6.5
  },
  {
    id: 'stf-4',
    name: 'Mr. David Paul',
    email: 'david.p@college.edu',
    role: 'Staff',
    department: 'Student Support',
    assignedCounterId: 'cnt-4',
    status: 'Active',
    servedCount: 19,
    avgTimeMins: 4.5
  }
];

// Default Student Profile
const DEFAULT_STUDENT_PROFILE = {
  name: 'Aarav Patel',
  registerNumber: '21BCE1042',
  email: 'student@college.edu',
  department: 'Computer Science and Engineering',
  yearSemester: '3rd Year / 6th Semester',
  phone: '+91 98765 43210',
  batch: '2023 - 2027',
  avatarUrl: ''
};

// Default System Settings
const DEFAULT_SETTINGS = {
  collegeName: 'Apex Institute of Engineering & Technology',
  tagline: 'Autonomous Institution • Approved by AICTE, Accredited NAAC A++',
  campusLocation: 'Anna Salai Campus, Chennai, Tamil Nadu',
  openingHours: '09:00 AM - 04:30 PM',
  workingDays: 'Monday - Friday (1st & 3rd Saturday Working)',
  maxTokensPerStudent: 3,
  defaultServiceDuration: 6, // minutes
  enableNotifications: true,
  autoAdvanceSimulation: false,
  version: '2.4.0'
};

// Generate realistic date helper
function getRelativeTimeString(minutesAgo) {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return d.toISOString();
}

function formatDisplayTime(isoString) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDisplayDate(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

// Default Tokens (At least 12 realistic records covering all statuses)
const DEFAULT_TOKENS = [
  // 1. Serving at Counter 1
  {
    id: 'tok-1',
    tokenNumber: 'CERT-024',
    serviceId: 'srv-1',
    serviceName: 'Bonafide Certificate',
    department: 'Administrative Office',
    studentName: 'Aarav Patel',
    registerNumber: '21BCE1042',
    studentEmail: 'student@college.edu',
    purpose: 'Passport Application Verification and Police Clearance',
    remarks: 'Urgent processing requested for passport interview on Friday',
    documentsVerified: true,
    status: 'Processing', // Waiting, Called, Processing, Completed, Cancelled
    priority: false,
    priorityReason: '',
    counterId: 'cnt-1',
    counterName: 'Counter 1 – Certificate Section',
    createdAt: getRelativeTimeString(25),
    calledAt: getRelativeTimeString(10),
    startedAt: getRelativeTimeString(5),
    completedAt: null,
    actualDurationMins: null,
    staffNotes: 'Verified original fee slip. Issuing signed bonafide.'
  },
  // 2. Serving at Counter 3
  {
    id: 'tok-2',
    tokenNumber: 'MARK-019',
    serviceId: 'srv-5',
    serviceName: 'Semester Marksheet / Transcript',
    department: 'Examination Cell',
    studentName: 'Sneha Venkatesh',
    registerNumber: '21BEC1018',
    studentEmail: 'sneha.v@college.edu',
    purpose: 'Official Transcript for Higher Studies Application',
    remarks: 'Applying for Masters in German Universities',
    documentsVerified: true,
    status: 'Called',
    priority: false,
    priorityReason: '',
    counterId: 'cnt-3',
    counterName: 'Counter 3 – Examination Cell',
    createdAt: getRelativeTimeString(30),
    calledAt: getRelativeTimeString(3),
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: 'Transcript packet ready for signature.'
  },
  // 3. Waiting tokens
  {
    id: 'tok-3',
    tokenNumber: 'CERT-025',
    serviceId: 'srv-1',
    serviceName: 'Bonafide Certificate',
    department: 'Administrative Office',
    studentName: 'Rohan Sharma',
    registerNumber: '22BME1009',
    studentEmail: 'rohan.s@college.edu',
    purpose: 'State Bus Pass Concession renewal',
    remarks: 'Route 42 MTC bus pass',
    documentsVerified: true,
    status: 'Waiting',
    priority: false,
    priorityReason: '',
    counterId: null,
    counterName: null,
    createdAt: getRelativeTimeString(18),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: ''
  },
  {
    id: 'tok-4',
    tokenNumber: 'CERT-026',
    serviceId: 'srv-1',
    serviceName: 'Bonafide Certificate',
    department: 'Administrative Office',
    studentName: 'Pooja Sundaram',
    registerNumber: '21BIT1055',
    studentEmail: 'pooja.s@college.edu',
    purpose: 'Education Loan Interest Subsidy Verification',
    remarks: 'SBI Loan scheme',
    documentsVerified: true,
    status: 'Waiting',
    priority: true,
    priorityReason: 'Bank submission deadline today 3:00 PM (Approved by Dean)',
    counterId: null,
    counterName: null,
    createdAt: getRelativeTimeString(14),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: 'Dean priority slip attached.'
  },
  {
    id: 'tok-5',
    tokenNumber: 'FEE-018',
    serviceId: 'srv-6',
    serviceName: 'Fee Payment Receipt',
    department: 'Accounts Office',
    studentName: 'Karthik Raja',
    registerNumber: '23BCS1088',
    studentEmail: 'karthik.r@college.edu',
    purpose: 'Semester 5 Tuition Fee duplicate receipt',
    remarks: 'Lost original receipt during shifting',
    documentsVerified: true,
    status: 'Waiting',
    priority: false,
    priorityReason: '',
    counterId: null,
    counterName: null,
    createdAt: getRelativeTimeString(12),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: ''
  },
  {
    id: 'tok-6',
    tokenNumber: 'SCHOL-009',
    serviceId: 'srv-7',
    serviceName: 'Scholarship Enquiry',
    department: 'Accounts Office',
    studentName: 'Ananya Mukherjee',
    registerNumber: '22BCE1073',
    studentEmail: 'ananya.m@college.edu',
    purpose: 'NSP Post Matric Scholarship disbursement enquiry',
    remarks: 'NSP Portal status showing pending college verification',
    documentsVerified: true,
    status: 'Waiting',
    priority: false,
    priorityReason: '',
    counterId: null,
    counterName: null,
    createdAt: getRelativeTimeString(11),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: ''
  },
  {
    id: 'tok-7',
    tokenNumber: 'IDC-012',
    serviceId: 'srv-11',
    serviceName: 'ID Card Issue or Replacement',
    department: 'Student Affairs',
    studentName: 'Mohammed Zeeshan',
    registerNumber: '23BME1032',
    studentEmail: 'zeeshan.m@college.edu',
    purpose: 'Damaged RFID barcode replacement',
    remarks: 'Barcode reader in library unable to scan card',
    documentsVerified: true,
    status: 'Waiting',
    priority: false,
    priorityReason: '',
    counterId: null,
    counterName: null,
    createdAt: getRelativeTimeString(8),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: ''
  },
  {
    id: 'tok-8',
    tokenNumber: 'EXAM-014',
    serviceId: 'srv-9',
    serviceName: 'Examination and Hall Ticket Enquiry',
    department: 'Examination Cell',
    studentName: 'Divya Krishnan',
    registerNumber: '21BCE1090',
    studentEmail: 'divya.k@college.edu',
    purpose: 'Correction in father name on Hall Ticket',
    remarks: 'Name misspelled as "Ramesh Kumar" instead of "Ramakrishnan"',
    documentsVerified: true,
    status: 'Waiting',
    priority: false,
    priorityReason: '',
    counterId: null,
    counterName: null,
    createdAt: getRelativeTimeString(5),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: ''
  },
  // 4. Completed Tokens Today
  {
    id: 'tok-9',
    tokenNumber: 'CERT-023',
    serviceId: 'srv-1',
    serviceName: 'Bonafide Certificate',
    department: 'Administrative Office',
    studentName: 'Vikram Seth',
    registerNumber: '21BCE1004',
    studentEmail: 'vikram.s@college.edu',
    purpose: 'Passport office verification letter',
    remarks: '',
    documentsVerified: true,
    status: 'Completed',
    priority: false,
    priorityReason: '',
    counterId: 'cnt-1',
    counterName: 'Counter 1 – Certificate Section',
    createdAt: getRelativeTimeString(55),
    calledAt: getRelativeTimeString(45),
    startedAt: getRelativeTimeString(42),
    completedAt: getRelativeTimeString(35),
    actualDurationMins: 7,
    staffNotes: 'Certificate delivered and acknowledgement signed.'
  },
  {
    id: 'tok-10',
    tokenNumber: 'FEE-017',
    serviceId: 'srv-6',
    serviceName: 'Fee Payment Receipt',
    department: 'Accounts Office',
    studentName: 'Harini Balaji',
    registerNumber: '22BEE1015',
    studentEmail: 'harini.b@college.edu',
    purpose: 'Hostel fee receipt for income tax deduction',
    remarks: '',
    documentsVerified: true,
    status: 'Completed',
    priority: false,
    priorityReason: '',
    counterId: 'cnt-2',
    counterName: 'Counter 2 – Accounts & Finance',
    createdAt: getRelativeTimeString(70),
    calledAt: getRelativeTimeString(50),
    startedAt: getRelativeTimeString(48),
    completedAt: getRelativeTimeString(43),
    actualDurationMins: 5,
    staffNotes: 'Stamped duplicate receipt issued.'
  },
  {
    id: 'tok-11',
    tokenNumber: 'TC-004',
    serviceId: 'srv-2',
    serviceName: 'Transfer Certificate (TC)',
    department: 'Administrative Office',
    studentName: 'Naveen Chandran',
    registerNumber: '20BCE1022',
    studentEmail: 'naveen.c@college.edu',
    purpose: 'Graduation TC issuance for MBA admission',
    remarks: '',
    documentsVerified: true,
    status: 'Completed',
    priority: false,
    priorityReason: '',
    counterId: 'cnt-1',
    counterName: 'Counter 1 – Certificate Section',
    createdAt: getRelativeTimeString(95),
    calledAt: getRelativeTimeString(80),
    startedAt: getRelativeTimeString(78),
    completedAt: getRelativeTimeString(68),
    actualDurationMins: 10,
    staffNotes: 'No-due forms verified. TC #TC-2026-904 issued.'
  },
  // 5. Cancelled token
  {
    id: 'tok-12',
    tokenNumber: 'HOST-003',
    serviceId: 'srv-12',
    serviceName: 'Hostel Office Enquiry',
    department: 'Hostel Office',
    studentName: 'Sanjay Reddy',
    registerNumber: '23BCE1104',
    studentEmail: 'sanjay.r@college.edu',
    purpose: 'Room change request from Block D to Block B',
    remarks: 'Changed mind, roommate issue resolved',
    documentsVerified: false,
    status: 'Cancelled',
    priority: false,
    priorityReason: '',
    counterId: null,
    counterName: null,
    createdAt: getRelativeTimeString(110),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    actualDurationMins: null,
    staffNotes: 'Cancelled by student.'
  }
];

// Default Sample Notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Token Being Processed',
    message: 'Your token CERT-024 is currently being processed at Counter 1 – Certificate Section.',
    time: getRelativeTimeString(5),
    read: false,
    type: 'info', // info, success, warning, alert
    targetRole: 'Student',
    targetEmail: 'student@college.edu'
  },
  {
    id: 'notif-2',
    title: 'Your Turn! Token Called',
    message: 'Token CERT-024 has been called! Please proceed immediately to Counter 1.',
    time: getRelativeTimeString(10),
    read: false,
    type: 'success',
    targetRole: 'Student',
    targetEmail: 'student@college.edu'
  },
  {
    id: 'notif-3',
    title: 'Token Generated Successfully',
    message: 'Your token CERT-024 for Bonafide Certificate was generated. Estimated wait time: ~15 mins.',
    time: getRelativeTimeString(25),
    read: true,
    type: 'info',
    targetRole: 'Student',
    targetEmail: 'student@college.edu'
  },
  {
    id: 'notif-4',
    title: 'Previous Request Completed',
    message: 'Your request for Fee Payment Receipt (FEE-012) was marked completed.',
    time: getRelativeTimeString(180),
    read: true,
    type: 'success',
    targetRole: 'Student',
    targetEmail: 'student@college.edu'
  },
  {
    id: 'notif-5',
    title: 'Priority Case Flagged',
    message: 'Token CERT-026 (Pooja Sundaram) was marked urgent by Dean approval.',
    time: getRelativeTimeString(14),
    read: false,
    type: 'warning',
    targetRole: 'Staff',
    targetEmail: 'staff@college.edu'
  }
];

// Data Store Class
class DataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      this.saveServices(DEFAULT_SERVICES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COUNTERS)) {
      this.saveCounters(DEFAULT_COUNTERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      this.saveStaff(DEFAULT_STAFF);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOKENS)) {
      this.saveTokens(DEFAULT_TOKENS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.saveNotifications(DEFAULT_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.saveSettings(DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE)) {
      this.saveStudentProfile(DEFAULT_STUDENT_PROFILE);
    }
  }

  // Tokens
  getTokens() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOKENS)) || [];
    } catch (e) {
      console.error('Error parsing tokens from LocalStorage', e);
      return DEFAULT_TOKENS;
    }
  }

  saveTokens(tokens) {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'tokens' } }));
  }

  // Services
  getServices() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES)) || [];
    } catch (e) {
      console.error('Error parsing services', e);
      return DEFAULT_SERVICES;
    }
  }

  saveServices(services) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'services' } }));
  }

  // Counters
  getCounters() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUNTERS)) || [];
    } catch (e) {
      console.error('Error parsing counters', e);
      return DEFAULT_COUNTERS;
    }
  }

  saveCounters(counters) {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'counters' } }));
  }

  // Staff
  getStaff() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF)) || [];
    } catch (e) {
      console.error('Error parsing staff', e);
      return DEFAULT_STAFF;
    }
  }

  saveStaff(staff) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'staff' } }));
  }

  // Notifications
  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
    } catch (e) {
      console.error('Error parsing notifications', e);
      return DEFAULT_NOTIFICATIONS;
    }
  }

  saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'notifications' } }));
  }

  addNotification(title, message, type = 'info', targetRole = 'All', targetEmail = '') {
    const notifs = this.getNotifications();
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title,
      message,
      time: new Date().toISOString(),
      read: false,
      type,
      targetRole,
      targetEmail
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
    return newNotif;
  }

  // Settings
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'settings' } }));
  }

  // Student Profile
  getStudentProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE)) || DEFAULT_STUDENT_PROFILE;
    } catch (e) {
      return DEFAULT_STUDENT_PROFILE;
    }
  }

  saveStudentProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'profile' } }));
  }

  // Session Auth
  getAuth() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH)) || null;
    } catch (e) {
      return null;
    }
  }

  setAuth(user) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
  }

  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  // Reset to initial demo data
  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(DEFAULT_COUNTERS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(DEFAULT_TOKENS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(DEFAULT_STUDENT_PROFILE));
    window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'reset' } }));
  }

  // === SMART WAITING TIME & QUEUE CALCULATIONS ===

  /**
   * Calculate smart waiting time for a token or an upcoming request
   * Formula specified:
   * Estimated waiting time = Total expected service time of people ahead / Number of active counters serving the same queue
   */
  calculateEstimatedWaitTime(serviceId, currentTokenId = null) {
    const services = this.getServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return 10;

    const tokens = this.getTokens();
    const counters = this.getCounters();

    // 1. Identify active counters for this service/department
    const activeCounters = counters.filter(c => {
      const isOnline = c.status === 'Serving' || c.status === 'Available';
      const matchesDept = c.department === service.department;
      const matchesService = c.activeServices && c.activeServices.includes(service.name);
      return isOnline && (matchesDept || matchesService);
    });

    const activeCounterCount = Math.max(1, activeCounters.length);

    // 2. Identify tokens ahead in the same service/department queue
    // Queue includes 'Waiting' tokens created before currentToken
    // If currentTokenId is null, it calculates for a NEW token being added right now
    const waitingTokens = tokens.filter(t => {
      const isSameQueue = (t.serviceId === serviceId) || (t.department === service.department);
      return isSameQueue && (t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing');
    });

    let tokensAhead = 0;
    let totalExpectedTime = 0;

    if (currentTokenId) {
      const myToken = tokens.find(t => t.id === currentTokenId);
      if (!myToken) return 0;
      if (myToken.status === 'Processing') return 2;
      if (myToken.status === 'Called') return 0;
      if (myToken.status === 'Completed' || myToken.status === 'Cancelled') return 0;

      const myCreatedAt = new Date(myToken.createdAt).getTime();

      // Tokens ahead: Priority tokens first, then earlier created waiting tokens
      waitingTokens.forEach(t => {
        if (t.id === currentTokenId) return;
        const otherCreatedAt = new Date(t.createdAt).getTime();

        const isAhead = (t.priority && !myToken.priority) || 
                        (t.priority === myToken.priority && otherCreatedAt < myCreatedAt) ||
                        (t.status === 'Processing' || t.status === 'Called');

        if (isAhead) {
          tokensAhead++;
          const tService = services.find(s => s.id === t.serviceId);
          const duration = tService ? tService.avgDuration : 5;
          totalExpectedTime += duration;
        }
      });
    } else {
      // For a prospective new token being requested right now
      tokensAhead = waitingTokens.length;
      waitingTokens.forEach(t => {
        const tService = services.find(s => s.id === t.serviceId);
        totalExpectedTime += (tService ? tService.avgDuration : 5);
      });
    }

    // Include the estimated remaining time of currently processing token at counter
    const baseWait = Math.round(totalExpectedTime / activeCounterCount);
    // Minimum 2 minutes if someone is ahead, or service duration if next
    if (tokensAhead === 0) return 2;
    return Math.max(3, baseWait);
  }

  /**
   * Get queue position and number of people ahead
   */
  getQueuePosition(tokenId) {
    const tokens = this.getTokens();
    const myToken = tokens.find(t => t.id === tokenId);
    if (!myToken) return { position: 0, aheadCount: 0, currentlyServing: null };

    if (myToken.status === 'Processing') {
      return { position: 1, aheadCount: 0, isServing: true, currentlyServing: myToken.tokenNumber };
    }
    if (myToken.status === 'Called') {
      return { position: 1, aheadCount: 0, isCalled: true, currentlyServing: myToken.tokenNumber };
    }
    if (myToken.status === 'Completed' || myToken.status === 'Cancelled') {
      return { position: 0, aheadCount: 0, isClosed: true, currentlyServing: null };
    }

    // Find currently serving token for this department
    const servingToken = tokens.find(t => 
      t.department === myToken.department && 
      (t.status === 'Processing' || t.status === 'Called')
    );

    const myCreatedAt = new Date(myToken.createdAt).getTime();
    const departmentWaiting = tokens.filter(t => 
      t.department === myToken.department && 
      (t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing')
    );

    let aheadCount = 0;
    departmentWaiting.forEach(t => {
      if (t.id === tokenId) return;
      const otherCreatedAt = new Date(t.createdAt).getTime();
      const isAhead = (t.status === 'Processing' || t.status === 'Called') ||
                      (t.priority && !myToken.priority) ||
                      (t.priority === myToken.priority && otherCreatedAt < myCreatedAt);
      if (isAhead) aheadCount++;
    });

    return {
      position: aheadCount + 1,
      aheadCount: aheadCount,
      currentlyServing: servingToken ? servingToken.tokenNumber : 'None'
    };
  }

  /**
   * Generate next unique token number
   */
  generateNextTokenNumber(servicePrefix) {
    const tokens = this.getTokens();
    const prefix = servicePrefix || 'TKN';
    
    // Find highest number with this prefix today
    let highestNum = 0;
    tokens.forEach(t => {
      if (t.tokenNumber && t.tokenNumber.startsWith(prefix + '-')) {
        const numPart = parseInt(t.tokenNumber.split('-')[1], 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    });

    const nextNum = highestNum + 1;
    const formattedNum = nextNum.toString().padStart(3, '0');
    return `${prefix}-${formattedNum}`;
  }
}

// Global data store instance
const store = new DataStore();
window.queueLessStore = store;
