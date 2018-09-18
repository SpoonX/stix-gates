# stix-gates

A [stix](https://github.com/SpoonX/stix) module that allows you to setup enrichers, validators and infinitely more for actions.

## What are gates?

Gates are like middleware, but different. They allow you to grant or reject passage. They sit between your router and your action, securing your endpoints. Here's a simplified overview of the flow:

```
Request--->Router+--->Gates+------>Dispatcher+
                 |         |                 |
                 v         v                 v
                404       4xx               2xx
                 |         |                 |
                 +---------+-----------------+-->Response
```

- The request will pass through the gates **in the order you defined them**.
- A gate is allowed to return `undefined`, `boolean` or a `stix.Response` instance.
- If a gate denies access to the request, the request goes straight to the response phase.

## Setup

If you initialized a new stix project using the [boards cli stix preset](https://github.com/SpoonX/boards-preset-stix), stix-gates will already be included in your project and you can move on to the [using section](#using). If not, keep reading.

1. In your stix project, simply run `yarn add stix-gates`.
2. Add the module to your project's `src/config/modules.ts`:

```ts
import { ModuleManagerConfigInterface } from 'stix';
import { StixGates } from 'stix-gates';

export const modules: ModuleManagerConfigInterface = [
  StixGates,
  // Your other modules.
];
```

### Setting up gates

Setting up stix-gates is easy.

1. Make sure you have a `gates.ts` at `src/config/gates.ts`.
2. Add it to your config (_add `export * from './gates';` to your `src/config/index.ts`_)

Done. The stix-gates module will do the rest... Except for writing your gates of course, for which I do encourage you to keep reading!

## Using

Using gates is, in the spirit of stix as magic-less as possible. This means that you maintain a clear overview of what's going on, and you can **cmd+click/ctrl+click** _(I don't judge... Publicly.)_ your way through your codebase as happy as the day you were born.

### Gates configuration

Let's take a look at the `src/config/gates.ts` file.

```ts
import { Gate } from 'stix-gates';
import { SomeController } from '../api/controllers';
import { isAuthenticated, isNotGuest } from '../api/gates';

const compose = Gate.compose;

export const gates = {
  // By default, allow no access to anything.
  // This is also the stix-gates default when no gates were found.
  '*': false,

  // Compose some rules for the UserController.
  // Produces: { UserController: { profile: [ isAuthenticated, isNotGuest ] } }
  ...compose(UserController, { profile: [ isNotGuest ] }, [ isAuthenticated ]),

  // Allow access to all actions, except one.
  // Produces: { OpenController: { '*': true, secretAction: false } }
  ...compose(OpenController, { '*': true, secretAction: false }),
};
```

As you can see, you can use the reference to your controller, and similarly to your gates. Strings also work, so using `Gate.compose()` is optional.

### Gate implementation

Now that you know how to configure gates, you'll need to start writing them.

You can put your gates anywhere you like. They can even be imported from other modules, how convenient is that? Here are a couple of examples to help you understand how gates work.

**Simple result**

```ts
import { ContextInterface } from 'stix';

export const isAuthenticated = async (ctx: ContextInterface) => {
  return !!ctx.state.user;
};
```

- Gates can be async functions.
- `ctx` is the [koa context](https://koajs.com/#context). It holds the request, response, body etc.
- When a gate returns `false`, stix-gates will create a `ClientErrorResponse.forbidden()` response for you.
- When it returns `true`, the next gate will be applied. If this was the last gate, the action will be dispatched.

**Default value**

```ts
import { ContextInterface } from 'stix';

export const isAuthenticated = async (ctx: ContextInterface) => {
  if (!ctx.state.user) {
    return false;
  }
};
```

- Gates are not required to return a value.
- When nothing was returned (or `undefined`) the gate passes automatically (defaulting to `true`).
- This allows you to use gates to patch the `ctx` with additional data. One example is using a gate to fetch a user from the database based on the user_id provided in the JWT.

**Custom response**

```ts
import { ContextInterface } from 'stix';
import { ClientErrorResponse } from '../responses';

export const isAuthenticated = async (ctx: ContextInterface) => {
  if (!ctx.state.user) {
    return ClientErrorResponse.unauthorized();
  }
};
```

- Returning `false` from a gate defaults to a `ClientErrorResponse.forbidden()` denying the request.
- Returning **any other `Response` type will result in the request being denied** with your custom response.
- This allows you to decide what type of response gets sent back.

## Helpers

stix-gates comes with a couple of helpers to make working with it even more fun.

### Gate.compose(controller, rules, baseRules?)

This is a simple utility that helps you compose your gates. Using this allows you to keep the reference to the controllers and gates you use, making it easier to navigate through your IDE. On top of that, it allows you to define some baseRules, and it'll merge those in for every action.

Code speaks. This example uses the `baseRules`:

```ts
compose(UserController, { profile: [ isNotGuest ] }, [ isAuthenticated ]);

// Produces:
{
  UserController: {
    profile: [ isAuthenticated, isNotGuest ],
  },
}
```

And here's a simple example using booleans:

```ts
// Allow access to all actions, except one.
compose(OpenController, { '*': true, secretAction: false });

// Produces:
{
  OpenController: {
    '*': true,
    secretAction: false,
  }
}
```

This is especially useful if your rules repeat often.

## License

MIT.
