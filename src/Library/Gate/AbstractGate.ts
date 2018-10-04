import { AbstractResponseHelper, ContextInterface } from 'stix';

export abstract class AbstractGate extends AbstractResponseHelper {
  abstract passThrough (ctx?: ContextInterface): any;
}
