import { GateConfigInterface } from '.';
import { gatesMiddleware } from '../middleware';
import { Config, Event, LoggerService, ModuleInterface, ModuleManager, ResponseService, ServerService } from 'stix';

export class Gates implements ModuleInterface {
  public onBootstrap (event: Event<ModuleManager>): void {
    const serviceManager = event.getTarget().getApplication().getServiceManager();

    serviceManager.get(ServerService).useBefore('dispatch', gatesMiddleware(
      serviceManager.get(Config).of<GateConfigInterface>('gates'),
      serviceManager.get(ResponseService),
      serviceManager.get(LoggerService),
    ));
  }
}
