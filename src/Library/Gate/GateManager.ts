import { Instantiable, AbstractFileBasedPluginManager, ServiceManager } from 'stix';
import { GateManagerConfigType } from './GateManagerConfigType';
import { AbstractGate } from './AbstractGate';

export class GateManager extends AbstractFileBasedPluginManager {
  constructor (creationContext: ServiceManager, config: GateManagerConfigType) {
    super(creationContext, config.locations, config.gates);
  }

  public getGate (Gate: Instantiable<Object>): AbstractGate {
    return this.getPlugin(Gate) as AbstractGate;
  }
}
