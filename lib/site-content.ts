import {
  ShieldCheck,
  FileText,
  Sparkles,
  Workflow,
  Boxes,
  Landmark,
  Truck,
  LineChart,
  Building2,
  MapPin,
  FileCheck,
  FileSignature,
  Eye,
  Hospital,
  Stethoscope,
  Pill,
  FlaskConical,
  HeartHandshake,
  Factory,
} from 'lucide-react';

export const manufacturers = [
  'Zybio',
  'Mindray',
  'Edan',
  'Contec',
  'Heal Force',
  'Comen',
  'Philips',
  'GE HealthCare',
  'Siemens Healthineers',
  'Bionet',
];

export const segments = [
  { label: 'Hospitals', icon: Hospital },
  { label: 'Clinics', icon: Stethoscope },
  { label: 'Pharmacies', icon: Pill },
  { label: 'Diagnostic Laboratories', icon: FlaskConical },
  { label: 'NGOs', icon: HeartHandshake },
  { label: 'Government Health Institutions', icon: Landmark },
  { label: 'Manufacturers', icon: Factory },
  { label: 'Distributors', icon: Truck },
  { label: 'Medical Suppliers', icon: Boxes },
  { label: 'Healthcare Networks', icon: Building2 },
];

export const capabilities = [
  {
    title: 'Supplier Verification',
    desc: 'Every manufacturer and distributor is vetted before joining the network.',
    icon: ShieldCheck,
  },
  {
    title: 'RFQ Management',
    desc: 'Send, track, and compare requests for quotation from one workspace.',
    icon: FileText,
  },
  {
    title: 'Smart Supplier Matching',
    desc: 'Requests are routed to the right suppliers by category, certification, and history.',
    icon: Sparkles,
  },
  {
    title: 'Procurement Workflow Automation',
    desc: 'Approvals, documentation, and order status move without manual chasing.',
    icon: Workflow,
  },
  {
    title: 'Inventory Management',
    desc: 'Visibility into stock and reorder needs across locations.',
    icon: Boxes,
  },
  {
    title: 'Supply Chain Financing',
    desc: 'Financing options structured around procurement cycles.',
    icon: Landmark,
  },
  {
    title: 'Logistics & Fulfilment',
    desc: 'Coordinated delivery from supplier to facility, tracked end to end.',
    icon: Truck,
  },
  {
    title: 'Procurement Analytics & Intelligence',
    desc: 'Spend, supplier performance, and cycle-time data in one view.',
    icon: LineChart,
  },
  {
    title: 'Manufacturer & Distributor Network',
    desc: 'Direct access to verified manufacturers and their distribution partners.',
    icon: Building2,
  },
  {
    title: 'Multi-location Purchasing',
    desc: 'Coordinate procurement across facilities and regions from one account.',
    icon: MapPin,
  },
  {
    title: 'Digital Documentation',
    desc: 'Certifications, compliance records, and order paperwork, stored and searchable.',
    icon: FileCheck,
  },
  {
    title: 'Contract Procurement',
    desc: 'Standing agreements and recurring orders managed alongside one-off RFQs.',
    icon: FileSignature,
  },
  {
    title: 'Spend Visibility',
    desc: 'A clear, auditable record of what was procured, from whom, and at what cost.',
    icon: Eye,
  },
];

export const workflowSteps = [
  'Discover verified suppliers and manufacturers.',
  'Compare products, certifications, and quotations.',
  'Send RFQs to multiple suppliers at once.',
  'Manage approvals and procurement digitally.',
  'Track logistics and fulfilment end to end.',
  'Monitor procurement analytics and spend.',
  'Build long-term, direct supplier relationships.',
];

export const stories = [
  {
    name: 'Amara Osei',
    role: 'Procurement Lead',
    org: 'Regional Hospital Network',
    quote:
      'Lockseed replaced a patchwork of emails and phone calls with a single procurement workflow. Our team finally has one place to source, request, and track.',
    outcome: 'Faster time-to-quote',
  },
  {
    name: 'Rahul Mehta',
    role: 'Supply Chain Manager',
    org: 'Multi-site Clinic Group',
    quote:
      'Every manufacturer and supplier on the network is verified before we ever see them. That removed an entire layer of due diligence from our process.',
    outcome: 'Fewer manual verification steps',
  },
  {
    name: 'Elena Vasquez',
    role: 'Director of Operations',
    org: 'Diagnostics Provider',
    quote:
      'We file a request, track it in one ledger, and never lose a thread in someone’s inbox. It behaves like infrastructure, not a marketplace listing.',
    outcome: 'Centralized procurement tracking',
  },
];

export const supplierCategories = [
  'Pharmaceuticals & APIs',
  'PPE & Protective Equipment',
  'Diagnostics & Laboratory',
  'Surgical Instruments',
  'Medical Devices & Equipment',
  'Dental Supplies',
  'Medical Oxygen & Consumables',
  'Hospital Furniture & Infrastructure',
  'Other',
];

export const supplierDocChecklist = [
  { id: 'registration', label: 'Company registration / business license' },
  { id: 'tax', label: 'Tax compliance / PIN certificate' },
  { id: 'product_certs', label: 'Product certifications / quality documents' },
  { id: 'distribution', label: 'Distribution or manufacturer authorization letters' },
  { id: 'insurance', label: 'Liability / product insurance (if applicable)' },
];
