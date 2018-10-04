import {
  GatesConfigType,
  GateRuleType,
  GatesActionRulesType,
  GatesControllerRulesType,
  GatesActionRulesObjectType,
} from './GateTypes';
import { AbstractActionController, ControllerType } from 'stix';

export class Gate {
  public static rules (rules: [ typeof AbstractActionController, GatesActionRulesType ][]): GatesConfigType {
    return new Map<typeof AbstractActionController, GatesActionRulesType>(rules);
  }

  public static compose (controller: ControllerType, rules: GatesActionRulesObjectType, baseRules?: GateRuleType): GatesControllerRulesType {
    return [ controller, Gate.composeWithBaseRules(rules, baseRules) ];
  }

  public static composeWithBaseRules (rules: GatesActionRulesObjectType, baseRules?: GateRuleType): GatesActionRulesType {
    if (!baseRules) {
      return rules;
    }

    return Object.keys(rules).reduce((gates: GatesActionRulesObjectType, action: string) => {
      gates[action] = [].concat(baseRules, rules[action]);

      return gates;
    }, {} as GatesActionRulesType);
  }

  public static applicableGates (controller: typeof AbstractActionController, action: string, pool: GatesConfigType): GatesActionRulesType {
    const fallbackGate: GatesActionRulesType = pool.has('*') ? pool.get('*') : false;

    // Controller not defined in pool, fallback to *, or hard default (false).
    if (!pool.has(controller.constructor as typeof AbstractActionController)) {
      return fallbackGate;
    }

    const controllerGates = pool.get(controller.constructor as typeof AbstractActionController) as GatesActionRulesObjectType;

    // No gates specified for action, fallback to controller *, or *, or hard default (false).
    if (controllerGates[action] === undefined) {
      return controllerGates['*'] === undefined ? fallbackGate : controllerGates['*'];
    }

    // We found very specific rules.
    return controllerGates[action];
  }
}
