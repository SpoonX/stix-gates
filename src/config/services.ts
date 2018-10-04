import { GatesMiddleware } from '../Library/Gate/GatesMiddleware';
import { GateManager } from '../Library/Gate';
import { GateManagerFactory } from '../Library/Gate/GateManagerFactory';

export const services = {
  invokables: new Map<Function, Function>([
    [ GatesMiddleware, GatesMiddleware ],
  ]),
  factories: new Map<Function, Function>([
    [ GateManager, GateManagerFactory ],
  ]),
};
