import { GateConfigInterface } from '../Library';
import { InvalidGateResultError, InvalidGateTypeError } from '../Library/Error';
import { Gate, GatesType, GateResultType, GateFunction } from '../Library/Gate';
import { ContextInterface, Response, Application } from 'stix';

export const gatesMiddleware = (app: Application, config: GateConfigInterface) => {
  return async function gates (ctx: ContextInterface, next: Function) {
    const clientError                = app.getResponseManager().clientError();
    const serverError                = app.getResponseManager().serverError();
    const logger                     = app.getLogger();
    const { action, controllerName } = ctx.state.dispatch;
    const gates: GatesType           = Gate.applicableGates(controllerName, action, config);


    // No gates/false? Either false or a bug. Refuse to grant access.
    if (!gates) {
      return ctx.state.response = clientError.forbidden();
    }

    // Boolean? We know it's truthy, user may pass through.
    if (typeof gates === 'boolean') {
      return next();
    }

    // Gates is a function, so a single check to perform. Woo.
    if (typeof gates === 'function') {
      const result: GateResultType = await passGate(ctx, app, gates);

      // Return and, if a truthy result call next, meaning no response was fabricated yet.
      return result && next();
    }

    // ... Now look what you did. Who's going to clean this up?...
    if (!Array.isArray(gates)) {
      const error = new InvalidGateTypeError([
        `Gate definition for "${controllerName}.${action}" was of unexpected type "${typeof gates}".`,
        'Expected one of: boolean, function or array of functions.',
      ].join(' '));

      logger.error(error.message, error);

      ctx.state.response = serverError.internalServerError(null, null, { error });

      return;
    }

    // Array or bust.
    for (let i = 0; i < gates.length; i++) {
      const gate = gates[i];

      // Weird... But whatever.
      if (typeof gate === 'boolean') {
        if (gate) {
          continue;
        }

        // False. Cut the chain.
        return ctx.state.response = clientError.forbidden();
      }

      const result: GateResultType = await passGate(ctx, app, gate);

      if (!result) {
        return;
      }
    }

    return next();
  };
};

const passGate = async (ctx: ContextInterface, app: Application, gate: GatesType): Promise<GateResultType> => {
  const { action, controllerName } = ctx.state.dispatch;
  const logger                     = app.getLogger();
  const serverError                = app.getResponseManager().serverError();
  const clientError                = app.getResponseManager().clientError();

  let result: GateResultType;

  try {
    result = await (gate as GateFunction)(ctx);
  } catch (error) {
    // Well, the gate was stormed and now there are dead bodies everywhere... Notify the user! :D
    logger.error(error.message, error);

    ctx.state.response = serverError.internalServerError(null, null, { error });

    return;
  }

  // Undefined? Gate was probably used to enrich ctx.
  if (typeof result === 'undefined') {
    return true;
  }

  // Boolean? Clear-cut answer! What was it?
  if (typeof result === 'boolean') {

    // Ahw shucks... Well, better notify the user.
    if (!result) {
      ctx.state.response = clientError.forbidden();

      return;
    }

    // All good, let them pass!
    return true;
  }

  // We got a response... No idea if that's good or bad, but let's notify the user.
  if (result instanceof Response) {
    ctx.state.response = result;

    return;
  }

  // No satifiable results... Produce an error and notify the user.
  const error = new InvalidGateResultError([
    `A gate for "${controllerName}.${action}" failed to produce a satisfiable result.`,
    'Expected one of: boolean, undefined or instanceof Result.',
    `instead got type "${typeof result}".`,
    'Did you forget to add a return statement?',
  ].join(' '));

  logger.error(error.message, error);

  ctx.state.response = serverError.internalServerError(null, null, { error });

  return;
};
