import { GateActionsInterface } from './GateActionsInterface';
import { GatesInterface } from './GatesInterface';
import { GatesType, GateType, BaseRulesType } from './GateTypes';
import { ControllerManager, ControllerType } from 'stix';

export class Gate {
  public static compose (controller: ControllerType, rules: GateActionsInterface, baseRules?: GatesType): GatesInterface {
    return { [ControllerManager.getControllerName(controller)]: Gate.composeWithBaseRules(rules, baseRules) };
  }

  public static composeWithBaseRules(rules: GateActionsInterface, baseRules?: BaseRulesType): GateActionsInterface {
    if (!baseRules) {
      return rules;
    }

    return Object.keys(rules).reduce((gates: GateActionsInterface, action: string) => {
      gates[action] = [].concat(baseRules, rules[action]);

      return gates;
    }, {} as GateActionsInterface);
  }

  public static applicableGates(controller: string, action: string, pool: GatesInterface): GatesType {
    const fallbackGate: GatesType = pool['*'] as GatesType || false;

    // Controller not defined in pool, fallback to *, or hard default (false).
    if (pool[controller] === undefined) {
      return fallbackGate;
    }

    const controllerGates = pool[controller] as GateType;

    // No gates specified for action, fallback to controller *, or *, or hard default (false).
    if (controllerGates[action] === undefined) {
      return controllerGates['*'] === undefined ? fallbackGate : controllerGates['*'];
    }

    // We found very specific rules.
    return controllerGates[action];
  }
}
