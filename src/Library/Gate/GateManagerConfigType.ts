import { ServiceManagerConfigType } from 'stix';

export type GateManagerConfigType = Partial<{
  locations: string[];
  gates: ServiceManagerConfigType;
}>;
