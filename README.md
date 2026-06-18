# StationX

A lightweight, modular backend framework for Node.js built with TypeScript.

I built StationX to understand what actually happens inside a framework like Express — routing, middleware pipelines, schema validation, file serving. The best way to understand a tool is to build one.

---

## Features

- **Routing** — Define routes with `route()` or group them under a base path with `use()` and `path()`
- **Dynamic params** — Capture URL segments with `@param` syntax (`/@id` → `ctx.params.id`)
- **Schema validation** — Built-in `sx` library with a chainable API (string, number, boolean, date, array, object, email, minLength, positive, default, optional...)
- **Middleware pipeline** — `createMiddleware()` with per-path ignore rules, runs before and after route handlers. Auto-loaded from the `middlewares/` directory
- **Logging** — Built-in `log` utility (`log.title()`) for formatted console output
- **Static file serving** — HTML views, static assets, and media files served from configurable directories
- **Environment management** — `sxEnv.load()` / `sxEnv.get()` for `.env` handling
- **Hot reloading** — `stationx start` watches for file changes and restarts automatically
- **CLI scaffolding** — `stationx init <name>` generates a new project with modular structure

---

## Getting Started

```bash
# Scaffold a new project
stationx init my-app

# Navigate into it
cd my-app

# Install dependencies
pnpm install

# Start with hot reloading
stationx start
```

Or install directly:

```bash
npm install station-x
```

---

## Usage

### Basic route

```ts
import { route } from 'station-x';

route('/hello', {
  GET: (ctx) => ctx.status(200).json({ message: "Hello from StationX" })
});
```

### Grouped routes with dynamic params

```ts
import { use, path } from 'station-x';
import { userSchema } from './modules/users/schema.js';

const userRoutes = use('/users', [
  path('/', {
    GET: (ctx) => {
      ctx.status(200).json({ users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] });
    },
    POST: (ctx) => {
      try {
        const newUser = userSchema.parse(ctx.body);
        ctx.status(201).json({ message: 'User created', user: newUser });
      } catch (error) {
        ctx.status(400).json({ errors: error.errors });
      }
    }
  }),
  path('/@id', {
    GET: (ctx) => {
      const { id } = ctx.params; // @id maps to ctx.params.id
      ctx.status(200).json({ id });
    }
  })
]);
```

### Schema validation with `sx`

```ts
import { sx } from 'station-x';

export const userSchema = sx.schema({
  id: sx.number().positive(),
  name: sx.string().minLength(3).maxLength(50),
  email: sx.string().email().optional(),
  age: sx.number().positive().int().optional(),
  isActive: sx.boolean().default(true)
});

// parse() throws if validation fails, with error details in error.errors
try {
  const newUser = userSchema.parse(ctx.body);
  ctx.status(201).json({ user: newUser });
} catch (error) {
  ctx.status(400).json({ errors: error.errors });
}
```

Available validators: `string`, `number`, `boolean`, `date`, `array`, `object`. Chainable modifiers: `minLength`, `maxLength`, `email`, `positive`, `int`, `optional`, `default`.

### Middleware

```ts
import { createMiddleware, log } from 'station-x';

export default createMiddleware({
  ignore: ['/home', '/health-check'], // paths to skip
  handler: async (ctx, next) => {
    console.info(`${log.title('[INCOMING]')} ${ctx.req.method} - ${ctx.req.url}`);
    await next();
    console.info(`${log.title('[OUTGOING]')} ${ctx.req.method} - ${ctx.req.url} - STATUS ${ctx.statusCode}`);
    return true;
  },
});
```

Middlewares are auto-loaded from the `middlewares/` directory. Import them in `index.js` and they're part of the pipeline.

### File serving

StationX maps directories to URL patterns automatically:

| Directory | URL pattern | Example |
|-----------|-------------|---------|
| `views/` | `/` and `/<page>` | `/about` → `views/about.html` |
| `static/` | `/static/<path>` | `/static/js/app.js` → `static/js/app.js` |
| `media/` | `/media/<file>` | `/media/logo.svg` → `media/logo.svg` |

Root (`/`) maps to `views/index.html`. Directory names are configurable when you call `createServer()`.

### Environment variables

```env
# .env
SECRET_API_KEY=your_secret_key
APP_PORT=8080
DATABASE_URL=postgres://user:pass@host:5432/db
```

```ts
import { createServer, sxEnv } from 'station-x';

sxEnv.load();

const port = sxEnv.get('APP_PORT') || 3000;
const apiKey = sxEnv.get('SECRET_API_KEY');

const server = createServer();
server.listen(port, () => {
  console.log(`StationX running at http://localhost:${port}`);
});
```

---

## Project structure

```
my-app/
├── index.js                  # Entry point
├── package.json
├── .env                      # Environment variables
├── middlewares/              # Auto-loaded middleware
│   └── logger.js
├── modules/                  # Feature modules
│   ├── app/
│   │   ├── controllers.js
│   │   ├── routes.js
│   │   └── schema.js
│   └── users/
│       ├── routes.js
│       └── schema.js
├── media/                    # Images, videos, etc.
│   └── logo.svg
├── static/                   # CSS, client-side JS, fonts
│   ├── js/
│   │   └── index.js
│   └── styles/
│       └── style.css
└── views/                    # HTML templates
    ├── index.html
    └── pages/
        └── how-to.html
```

---

## Why I built this

I wanted to understand routing internals, middleware chaining, and schema validation at a lower level than using existing libraries allows. StationX is the result — functional enough to build real APIs with, simple enough that every line of it makes sense to me.

---

## License

ISC
