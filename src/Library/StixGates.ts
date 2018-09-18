import { GateConfigInterface } from '.';
import { gatesMiddleware } from '../middleware';
import { ModuleInterface, Application } from 'stix';

export class StixGates implements ModuleInterface {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public bootstrap(): void {
    const app    = this.app;
    const server = app.getServer();

    server.use(gatesMiddleware(app, app.getConfig<GateConfigInterface>('gates')));
  }
}
