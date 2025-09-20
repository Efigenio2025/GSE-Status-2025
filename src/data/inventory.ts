export type InventoryStatus = 'Operational' | 'Monitoring' | 'Offline';

type Issue = {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  timestamp: string;
  acknowledged: boolean;
};

type ActivitySnapshot = {
  label: string;
  value: number;
};

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: InventoryStatus;
  health: number;
  lastChecked: string;
  nextMaintenance: string;
  owner: string;
  notes: string;
  critical: boolean;
  issues: Issue[];
  activity: ActivitySnapshot[];
}

export const inventoryItems: InventoryItem[] = [
  {
    id: 'TX-204',
    name: 'Towing Tractor 204',
    category: 'Mobility',
    location: 'Pad A Apron',
    status: 'Operational',
    health: 97,
    lastChecked: '2025-03-19T09:15:00Z',
    nextMaintenance: '2025-04-05',
    owner: 'Launch Ops',
    notes: 'Battery swap scheduled for next rotation.',
    critical: false,
    issues: [
      {
        title: 'Tire pressure variance',
        impact: 'Low',
        timestamp: '2025-03-12T11:00:00Z',
        acknowledged: true,
      },
    ],
    activity: [
      { label: 'Deployments', value: 18 },
      { label: 'Standby', value: 6 },
      { label: 'Service', value: 1 },
    ],
  },
  {
    id: 'MPU-17',
    name: 'Mobile Power Unit 17',
    category: 'Power Distribution',
    location: 'Service Hangar',
    status: 'Monitoring',
    health: 74,
    lastChecked: '2025-03-19T07:42:00Z',
    nextMaintenance: '2025-03-25',
    owner: 'Electrical Team',
    notes: 'Load bank trending warmer than baseline, watching for drift.',
    critical: true,
    issues: [
      {
        title: 'Cooling loop restriction',
        impact: 'High',
        timestamp: '2025-03-18T15:30:00Z',
        acknowledged: true,
      },
      {
        title: 'Telemetry dropouts (intermittent)',
        impact: 'Medium',
        timestamp: '2025-03-16T09:20:00Z',
        acknowledged: false,
      },
    ],
    activity: [
      { label: 'Grid Support', value: 12 },
      { label: 'Diagnostics', value: 4 },
      { label: 'Idle', value: 9 },
    ],
  },
  {
    id: 'CRYO-03',
    name: 'Cryogenic Pump 03',
    category: 'Propellant',
    location: 'Storage Yard',
    status: 'Offline',
    health: 18,
    lastChecked: '2025-03-18T22:10:00Z',
    nextMaintenance: '2025-03-21',
    owner: 'Propulsion',
    notes: 'Seized impeller detected. Replacement assembly en route.',
    critical: true,
    issues: [
      {
        title: 'Impeller vibration spike',
        impact: 'High',
        timestamp: '2025-03-18T21:02:00Z',
        acknowledged: true,
      },
      {
        title: 'Pressure regulator fault',
        impact: 'High',
        timestamp: '2025-03-17T18:45:00Z',
        acknowledged: true,
      },
    ],
    activity: [
      { label: 'Active Transfer', value: 0 },
      { label: 'Purge Cycles', value: 1 },
      { label: 'Down', value: 6 },
    ],
  },
  {
    id: 'GC-88',
    name: 'Guidance Calibration Rack 88',
    category: 'Avionics',
    location: 'Integration Lab',
    status: 'Operational',
    health: 91,
    lastChecked: '2025-03-19T10:05:00Z',
    nextMaintenance: '2025-04-11',
    owner: 'Flight Controls',
    notes: 'Firmware 4.1 validated, ready for heavy simulation block.',
    critical: false,
    issues: [
      {
        title: 'Network handshake latency',
        impact: 'Low',
        timestamp: '2025-03-10T14:16:00Z',
        acknowledged: true,
      },
    ],
    activity: [
      { label: 'Calibrations', value: 22 },
      { label: 'Sim Time', value: 14 },
      { label: 'Maintenance', value: 2 },
    ],
  },
  {
    id: 'ADC-05',
    name: 'Avionics Diagnostic Cart 05',
    category: 'Diagnostics',
    location: 'Hangar Mezzanine',
    status: 'Monitoring',
    health: 63,
    lastChecked: '2025-03-19T06:52:00Z',
    nextMaintenance: '2025-03-28',
    owner: 'Systems Test',
    notes: 'Scope alignment requires recalibration after field run.',
    critical: false,
    issues: [
      {
        title: 'Sensor drift beyond tolerance',
        impact: 'Medium',
        timestamp: '2025-03-17T12:08:00Z',
        acknowledged: true,
      },
    ],
    activity: [
      { label: 'Diagnostics', value: 11 },
      { label: 'Field Support', value: 7 },
      { label: 'Standby', value: 5 },
    ],
  },
  {
    id: 'FUR-12',
    name: 'Fueling Umbilical Rig 12',
    category: 'Propellant',
    location: 'Pad B Core',
    status: 'Operational',
    health: 89,
    lastChecked: '2025-03-19T08:25:00Z',
    nextMaintenance: '2025-04-03',
    owner: 'Pad Crew',
    notes: 'Sequencer upgrade complete. Extra QA shift planned tonight.',
    critical: false,
    issues: [
      {
        title: 'Alignment jitter on clamp arm',
        impact: 'Low',
        timestamp: '2025-03-14T19:20:00Z',
        acknowledged: true,
      },
    ],
    activity: [
      { label: 'Fuel Loads', value: 9 },
      { label: 'Pre-Chill', value: 5 },
      { label: 'Hold', value: 2 },
    ],
  },
  {
    id: 'HSM-32',
    name: 'Hydraulics Service Module 32',
    category: 'Mechanicals',
    location: 'Utility Row',
    status: 'Offline',
    health: 29,
    lastChecked: '2025-03-18T20:11:00Z',
    nextMaintenance: '2025-03-22',
    owner: 'Recovery Ops',
    notes: 'Main pump replaced, awaiting pressure test clearance.',
    critical: true,
    issues: [
      {
        title: 'Return line leak detected',
        impact: 'High',
        timestamp: '2025-03-18T17:45:00Z',
        acknowledged: true,
      },
      {
        title: 'Accumulator pressure low',
        impact: 'Medium',
        timestamp: '2025-03-16T22:30:00Z',
        acknowledged: false,
      },
    ],
    activity: [
      { label: 'Service Runs', value: 3 },
      { label: 'Calibration', value: 1 },
      { label: 'Down', value: 5 },
    ],
  },
  {
    id: 'TRC-04',
    name: 'Thermal Regulation Cart 04',
    category: 'Environmental',
    location: 'Integration Lab',
    status: 'Operational',
    health: 94,
    lastChecked: '2025-03-19T09:58:00Z',
    nextMaintenance: '2025-04-07',
    owner: 'Thermal Systems',
    notes: 'Heat exchanger cleaned. Sensors recalibrated after field exercise.',
    critical: false,
    issues: [
      {
        title: 'Secondary fan vibration note',
        impact: 'Low',
        timestamp: '2025-03-15T10:50:00Z',
        acknowledged: true,
      },
    ],
    activity: [
      { label: 'Conditioning', value: 16 },
      { label: 'Standby', value: 4 },
      { label: 'Service', value: 1 },
    ],
  },
  {
    id: 'CRN-07',
    name: 'Communications Relay Node 07',
    category: 'Comms',
    location: 'Pad A Tower',
    status: 'Monitoring',
    health: 58,
    lastChecked: '2025-03-19T05:30:00Z',
    nextMaintenance: '2025-03-24',
    owner: 'Range Safety',
    notes: 'Occasional packet loss under high winds. Mesh network rerouting traffic.',
    critical: true,
    issues: [
      {
        title: 'Directional antenna jitter',
        impact: 'Medium',
        timestamp: '2025-03-18T04:42:00Z',
        acknowledged: false,
      },
      {
        title: 'Power amplifier thermal warning',
        impact: 'Medium',
        timestamp: '2025-03-17T16:12:00Z',
        acknowledged: true,
      },
    ],
    activity: [
      { label: 'Relay Time', value: 25 },
      { label: 'Fallback', value: 5 },
      { label: 'Down', value: 2 },
    ],
  },
];
