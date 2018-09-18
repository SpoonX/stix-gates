import { GatesType, GateType } from './GateTypes';

export interface GatesInterface {
  [controller: string]: GatesType | GateType;
}
