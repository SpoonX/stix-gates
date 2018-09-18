import { ContextInterface, Response } from 'stix';

export type GateType = { [action: string]: GatesType };

export type GateActionsType = GatesType | GateType;

export type GatesType = Array<GateFunction | boolean> | GateFunction | boolean;

export type BaseRulesType = Array<GateFunction | boolean> | GateFunction | boolean;

export type GateResultType = boolean | Response | void;

export type GateReturnType = Promise<GateResultType>;

export type GateFunction = (ctx: ContextInterface) => GateReturnType;
