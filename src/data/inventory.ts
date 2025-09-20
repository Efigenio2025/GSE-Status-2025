export type TruckStatus = 'Running' | 'Not Running'

export interface DeiceTruck {
  id: string
  assetNumber: string
  name: string
  location: string
  type1Capacity: number
  type1Level: number
  type4Capacity: number
  type4Level: number
  fuelPercent: number
  status: TruckStatus
  heaterOn: boolean
  lastUpdated: string
  notes: string
}

export interface BulkTank {
  id: string
  name: string
  fluidType: 'Type I' | 'Type IV'
  capacity: number
  level: number
  location: string
  lastSampled: string
  notes: string
}

export const initialDeiceTrucks: DeiceTruck[] = [
  {
    id: 'truck-ds032',
    assetNumber: 'DS032',
    name: 'North Pad Deice Truck',
    location: 'Gate 14 Apron',
    type1Capacity: 1200,
    type1Level: 980,
    type4Capacity: 300,
    type4Level: 240,
    fuelPercent: 74,
    status: 'Running',
    heaterOn: true,
    lastUpdated: '2025-03-19T09:10:00Z',
    notes: 'Truck staged at gate 14 with fluid topped ahead of the first push.',
  },
  {
    id: 'truck-ds033',
    assetNumber: 'DS033',
    name: 'Central Alley Deice Truck',
    location: 'Gate 18 Alley',
    type1Capacity: 1200,
    type1Level: 760,
    type4Capacity: 300,
    type4Level: 190,
    fuelPercent: 58,
    status: 'Running',
    heaterOn: false,
    lastUpdated: '2025-03-19T08:45:00Z',
    notes: 'Crew swap scheduled at 10:00, heater standing by for colder temps.',
  },
  {
    id: 'truck-ds034',
    assetNumber: 'DS034',
    name: 'Hangar Reserve Deice Truck',
    location: 'Hangar Bay 2',
    type1Capacity: 1200,
    type1Level: 340,
    type4Capacity: 300,
    type4Level: 80,
    fuelPercent: 36,
    status: 'Not Running',
    heaterOn: false,
    lastUpdated: '2025-03-19T07:55:00Z',
    notes: 'Down for heater igniter replacement; parts on the way from stores.',
  },
  {
    id: 'truck-ds035',
    assetNumber: 'DS035',
    name: 'Remote Stand Deice Truck',
    location: 'Remote Stand 4',
    type1Capacity: 1200,
    type1Level: 1120,
    type4Capacity: 300,
    type4Level: 265,
    fuelPercent: 82,
    status: 'Running',
    heaterOn: true,
    lastUpdated: '2025-03-19T09:02:00Z',
    notes: 'Assigned to remote stand operations; heater already circulating.',
  },
]

export const initialBulkTanks: BulkTank[] = [
  {
    id: 'bulk-type-i',
    name: 'Bulk Tank – Type I',
    fluidType: 'Type I',
    capacity: 10000,
    level: 7325,
    location: 'Central Fluid Farm',
    lastSampled: '2025-03-19T05:20:00Z',
    notes: 'Night crew transferred 1,200 gallons to trucks before dawn.',
  },
  {
    id: 'bulk-type-iv',
    name: 'Bulk Tank – Type IV',
    fluidType: 'Type IV',
    capacity: 6000,
    level: 4120,
    location: 'Central Fluid Farm',
    lastSampled: '2025-03-19T05:25:00Z',
    notes: 'Maintaining above 60% for the afternoon departure bank.',
  },
]
