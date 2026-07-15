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
  MonitorSmartphone,
  BadgeCheck,
  Wrench,
  Cpu,
} from 'lucide-react';

/** Partner brands shown on the landing page and suppliers network. */
export const manufacturers = [
  { name: 'Zybio', domain: 'zybio.com' },
  { name: 'Mindray', domain: 'mindray.com' },
  { name: 'Edan', domain: 'edan.com' },
  { name: 'Contec', domain: 'contecmed.com' },
  { name: 'Heal Force', domain: 'healforce.com' },
  { name: 'Comen', domain: 'comen.com' },
  { name: 'Philips', domain: 'philips.com' },
  { name: 'GE HealthCare', domain: 'gehealthcare.com' },
  { name: 'Siemens Healthineers', domain: 'siemens-healthineers.com' },
  { name: 'Bionet', domain: 'bionet.com' },
  { name: 'Roche', domain: 'roche.com' },
  { name: 'Abbott', domain: 'abbott.com' },
  { name: 'BD', domain: 'bd.com' },
  { name: 'Sysmex', domain: 'sysmex.com' },
  { name: 'Dräger', domain: 'draeger.com' },
  { name: 'Olympus', domain: 'olympus-global.com' },
  { name: 'Medtronic', domain: 'medtronic.com' },
  { name: 'Fujifilm', domain: 'fujifilm.com' },
  { name: 'Canon Medical', domain: 'global.medical.canon' },
  { name: 'Samsung Medison', domain: 'samsunghealthcare.com' },
  { name: 'Nihon Kohden', domain: 'nihonkohden.com' },
  { name: 'Beckman Coulter', domain: 'beckmancoulter.com' },
  { name: 'Thermo Fisher', domain: 'thermofisher.com' },
  { name: 'Wondfo', domain: 'wondfo.com' },
  { name: 'Snibe', domain: 'snibe.com' },
  { name: 'SonoScape', domain: 'sonoscape.com' },
  { name: 'Biolight', domain: 'biolight.com.cn' },
  { name: 'Yuwell', domain: 'yuwell.com' },
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
    desc: 'AI-powered matching routes requests by certification, price history, and delivery reliability.',
    icon: Sparkles,
  },
  {
    title: 'LockseedX Inventory',
    desc: 'Healthcare inventory management software for hospitals, clinics, pharmacies and laboratories.',
    icon: MonitorSmartphone,
  },
  {
    title: 'Procurement Workflow Automation',
    desc: 'Approvals, documentation, and order status move without manual chasing.',
    icon: Workflow,
  },
  {
    title: 'Healthcare Financing Access',
    desc: 'Access equipment, PO, supplier, and invoice financing through trusted financial partners.',
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
    desc: 'Direct access to verified manufacturers, APIs, and contract manufacturing partners.',
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
  {
    title: 'Inventory Management',
    desc: 'Visibility into stock and reorder needs across locations with LockseedX.',
    icon: Boxes,
  },
];

/** Service pillars for Africa's Healthcare Procurement Infrastructure. */
export const servicePillars = [
  {
    id: 'digital-health',
    title: 'Digital Health & Healthcare IT',
    icon: Cpu,
    intro:
      'Software and digital tools that help facilities run procurement and inventory with enterprise clarity.',
    items: [
      {
        name: 'LockseedX',
        desc: 'Healthcare Inventory Management Software for hospitals, clinics, pharmacies and laboratories.',
      },
    ],
  },
  {
    id: 'financing',
    title: 'Healthcare Financing',
    icon: Landmark,
    intro:
      'Lockseed Supply works with trusted financial partners to help healthcare providers access equipment financing, purchase order financing, supplier financing, invoice financing and equipment leasing solutions.',
    items: [
      { name: 'Equipment financing', desc: 'Via trusted financial partners' },
      { name: 'Purchase order financing', desc: 'Via trusted financial partners' },
      { name: 'Supplier financing', desc: 'Via trusted financial partners' },
      { name: 'Invoice financing', desc: 'Via trusted financial partners' },
      { name: 'Equipment leasing', desc: 'Via trusted financial partners' },
    ],
  },
  {
    id: 'regulatory',
    title: 'Regulatory & Quality Services',
    icon: BadgeCheck,
    intro: 'Compliance support that keeps suppliers and products audit-ready across markets.',
    items: [
      { name: 'GMP Verification', desc: '' },
      { name: 'FDA Documentation', desc: '' },
      { name: 'CE Documentation', desc: '' },
      { name: 'Product Registration Support', desc: '' },
      { name: 'Quality Audits', desc: '' },
      { name: 'Supplier Compliance Verification', desc: '' },
    ],
  },
  {
    id: 'after-sales',
    title: 'After-Sales Services',
    icon: Wrench,
    intro: 'Keep equipment performing after delivery — from install to spare parts.',
    items: [
      { name: 'Equipment Installation', desc: '' },
      { name: 'Preventive Maintenance', desc: '' },
      { name: 'Equipment Calibration', desc: '' },
      { name: 'Biomedical Engineering Services', desc: '' },
      { name: 'User Training', desc: '' },
      { name: 'Warranty Management', desc: '' },
      { name: 'Spare Parts Supply', desc: '' },
    ],
  },
];

export const platformValueProps = [
];

export const workflowSteps = [
  'Discover verified suppliers and manufacturers.',
  'Compare products, certifications, and quotations.',
  'Send RFQs to multiple suppliers at once.',
  'Manage approvals and procurement digitally with LockseedX.',
  'Access financing options through trusted financial partners.',
  'Track logistics and fulfilment end to end.',
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

export function brandLogoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}
