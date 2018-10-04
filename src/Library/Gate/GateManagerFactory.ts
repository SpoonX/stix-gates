import { Config, FactoryInterface, ServiceManager } from 'stix';
import { GateManager } from './GateManager';
import { GateManagerConfigType } from './GateManagerConfigType';

export const GateManagerFactory: FactoryInterface = (sm: ServiceManager) => {
  return new GateManager(sm, sm.get(Config).of<GateManagerConfigType>('gate'));
};
