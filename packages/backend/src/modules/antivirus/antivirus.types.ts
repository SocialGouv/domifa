export type AntivirusScanResult =
  | { isInfected: false }
  | { isInfected: true; viruses: string[] };
