import { GateManagerConfigType } from '.';
import * as config from '../config';
import {
  Config,
  DispatchMiddleware,
  Event,
  ModuleInterface,
  ModuleManager,
  ServerService,
} from 'stix';
import { GatesMiddleware } from './Gate/GatesMiddleware';

export class Gates implements ModuleInterface {
  public onBootstrap (event: Event<ModuleManager>): void {
    const serviceManager = event.getTarget().getApplication().getServiceManager();
    const gatesMiddleware = serviceManager.get(GatesMiddleware);

    gatesMiddleware.setConfig(serviceManager.get(Config).of<GateManagerConfigType>('gate').rules);

    serviceManager.get(ServerService).useBefore(DispatchMiddleware, gatesMiddleware);
  }

  getConfig () {
    return config;
  }
}
