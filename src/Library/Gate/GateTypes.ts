import { AbstractActionController, ContextInterface, ControllerType, Response, ServiceManagerConfigType } from 'stix';
import { AbstractGate } from './AbstractGate';

export type GatesType = Array<GateFunction | boolean> | GateFunction | boolean;

export type GateResultType = boolean | Response | void;

export type GateReturnType = Promise<GateResultType>;

export type GateFunction = (ctx: ContextInterface) => GateReturnType;

export type GateClassType = new () => AbstractGate;

export type GateClassesType = GateClassType[];

export type GatesControllerRulesType = [ ControllerType, GatesActionRulesType ];

export type GateRuleType = boolean | GateClassesType | GateClassType;

export type GatesActionRulesType = GateRuleType | GatesActionRulesObjectType;

export type GatesActionRulesObjectType = { [wildcardOrAction: string]: GateRuleType; };

export type GatesConfigType = Map<typeof AbstractActionController | string, GatesActionRulesType>;

export type GateManagerConfigType = Partial<{
  locations: string[];
  gates: ServiceManagerConfigType;
  rules: GatesConfigType;
}>;
