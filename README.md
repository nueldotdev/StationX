# StationX: A Backend Playground for the Passionately Bored

> The following was generated with AI because I was too lazy to do it myself, have fun reading... If you dare. Lol


Ever found yourself staring at the ceiling, wondering "What if I built my *own* backend framework?" No? Just me? Well, here we are! StationX is my answer to that particular brand of developer boredom and endless curiosity. It's a lightweight backend framework that lets you build web applications with a focus on simplicity and a dash of modular fun.

While it might not have the battle-hardened wisdom (or the security audits 😅) of its older, more established cousins, StationX provides a surprisingly robust playground for whipping up APIs and serving content without getting bogged down in endless configuration. Think of it as your personal sandbox to experiment, learn, and maybe even build something cool.

## What's Inside This Box of Curiosities? (Features!)

StationX gives you the essentials to get creative:

*   **Intuitive Routing**: Define your web paths with ease and keep your endpoints neatly organized.
*   **Smart Schema Validation (`sx`)**: Tired of messy data? `sx` is here to make sure your data behaves, with a super-friendly, chainable validation library.
*   **Flexible Middleware**: Want to log every request, check auth, or just say hello before your main logic runs? Middleware has got your back.
*   **Effortless File Serving**: HTML, CSS, JS, images—serve them all without breaking a sweat. Your frontend will thank you.
*   **"Magic" Hot Reloading**: Make a change, save, and *poof*! Your server restarts automatically. More coding, less waiting.
*   **Modular Design**: Keeps your project tidy by encouraging you to organize your features into neat, little modules. Future-you will be grateful.

## Deep Dive into the Fun Stuff (Features Explained)

### 1. Defining Your Paths: The `route` Function

At its heart, StationX is all about guiding traffic. The `route` function is your trusty signpost, letting you define individual URLs and what happens when someone (or something) tries to access them using different HTTP methods (GET, POST, PUT, DELETE, etc.).

**Example: Your first "Hello World" endpoint!**

```javascript
import { route } from 'station-x';

route('/hello', {
  GET: (ctx) => ctx.status(200).json({ message: "Hello from StationX! Welcome to the playground." })
});
```

Send a GET request to `/hello`, and StationX will cheerfully respond with your message.

### 2. Keeping Things Tidy: Grouping Routes with `use`

As your project grows, a single `/` route can get… crowded. That's where `use` comes in! It lets you group related routes under a common base path, making your project feel less like a tangled mess and more like a well-organized library. The `path` helper is your secret weapon within `use` to define those sub-routes.

**Example: User Management Routes**

```javascript
import { use, path } from 'station-x';
import { userSchema } from './modules/users/schema.js';

const userRoutes = use('/users', [
  path('/', {
    GET: (ctx) => {
      // Imagine fetching a list of all your awesome users here
      ctx.status(200).json({ users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] });
    },
    POST: (ctx) => {
      try {
        const newUser = userSchema.parse(ctx.body);
        // Hooray, valid data! Now, let's pretend to save this new user.
        ctx.status(201).json({ message: 'User successfully created (probably)! ', user: newUser });
      } catch (error) {
        // Oops, something's not right with the data.
        ctx.status(400).json({ errors: error.errors });
      }
    }
  }),
  path('/@id', {
    GET: (ctx) => {
      const { id } = ctx.params; // Grab that dynamic ID from the URL!
      // Time to look up a user by their ID
      ctx.status(200).json({ message: `Fetching user number: ${id}. Hope they exist!` });
    }
  })
]);
```

Notice the magical `@id`? That's how you capture dynamic bits from the URL. Super handy!

### 3. Taming Your Data: Schema Validation with `sx`

Let's be honest, data can be wild. `sx` is your friendly data wrangler, a schema validation library that makes sure your incoming data (from forms, APIs, wherever) is exactly what you expect. It's all about defining clear rules and chaining them together like a pro.

**Example: Validating User Data Like a Boss**

```javascript
import { sx } from 'station-x';

export const userSchema = sx.schema({
  id: sx.number().positive(), // Must be a positive number
  name: sx.string().minLength(3).maxLength(50), // Between 3 and 50 characters
  email: sx.string().email().optional(), // An optional, but valid, email format
  age: sx.number().positive().int().optional(), // An optional, positive integer
  isActive: sx.boolean().default(true) // If not provided, it's true by default!
});

// How you'd use it in a controller (let's say for a POST /users request):
// try {
//   const newUser = userSchema.parse(ctx.body); // 'parse' will throw if validation fails
//   // If you reached here, your data is golden! Time to save it.
//   ctx.status(201).json({ message: 'User data valid and ready!', user: newUser });
// } catch (error) {
//   // Validation failed. 'error.errors' will tell you why.
//   ctx.status(400).json({ errors: error.errors });
// }
```

`sx` has a whole arsenal of validators to play with: `string`, `number`, `boolean`, `date`, `array`, `object`, and more! You can chain `minLength`, `email`, `positive`, and many others to build your perfect data guardian.

### 4. Intercepting Requests: The Middleware Magic

Think of middleware as the bouncers, doormen, or even the greeters at your API's entrance. They can do stuff *before* your main route logic kicks in, and even *after* it's done. Perfect for logging, authentication checks, or just doing a little dance.

**Example: Our Friendly Logger Middleware (`middlewares/logger.js`)**

```javascript
import { createMiddleware, log } from "station-x";

export default createMiddleware({
  ignore: ['/home', '/health-check'], // Paths where our logger takes a break
  handler: async (ctx, next) => { 
    console.info(`${log.title('[INCOMING]')} ${ctx.req.method} - ${ctx.req.url}`);
    await next(); // This is the VIP pass to the next middleware or your route handler
    console.info(`${log.title('[OUTGOING]')} ${ctx.req.method} - ${ctx.req.url} - STATUS ${ctx.statusCode}`);
    return true; // Keep the show going!
  },
});
```

StationX is smart enough to find and load these middlewares from your `middlewares` directory automatically. Just import them in your `index.js`, and they'll be part of the request party!

### 5. Your Digital Billboard: Serving Files (HTML, Static, Media)

Building a backend isn't just about JSON. Sometimes, you just need to show off a pretty webpage or deliver some snazzy CSS. StationX makes serving files a breeze:

*   **HTML Pages**: Drop your `.html` files in the `views` directory. Request `/about`, get `views/about.html`. Simple. `/` gets `views/index.html`.
*   **Static Assets**: Your CSS, JavaScript, and other bits and bobs go into `static`. `/static/js/script.js` serves `static/js/script.js`.
*   **Media Files**: Images, videos, GIFs of cats—they all live in `media`. `/media/my-awesome-cat.gif` serves `media/my-awesome-cat.gif`.

Want to put them somewhere else? You can totally customize these directory names when you create your server!

**Examples of file-serving magic:**

```
// Hit http://localhost:3000/ to see your main landing page (views/index.html)
// Go to http://localhost:3000/pages/how-to for some helpful docs (views/pages/how-to.html)
// Your awesome JavaScript will be at http://localhost:3000/static/js/app.js
// And that glorious logo? http://localhost:3000/media/logo.svg
```

### 6. Secret Stash: Environment Variables with `sxEnv`

Nobody likes hardcoded secrets! `sxEnv` is your secure little vault for environment variables. Keep your API keys, database credentials, and other sensitive bits safe in a `.env` file, and `sxEnv` will load them up for your application.

**Example: Your `.env` file (keep this private!)**

```env
SECRET_API_KEY=super_secret_string_you_should_never_share
APP_PORT=8080
DATABASE_URL=postgres://user:pass@host:5432/db
```

**Using your secrets in `index.js`:**

```javascript
import { createServer, sxEnv } from 'station-x';

// Shhh... loading up our environment variables.
sxEnv.load(); 

const port = sxEnv.get('APP_PORT') || 3000; // Use the env var, or default to 3000
const apiKey = sxEnv.get('SECRET_API_KEY');

console.log(`My super secret API key starts with: ${apiKey.substring(0, 5)}...`);

const server = createServer();
server.listen(port, () => {
  console.log(`🌌 StationX is buzzing at http://localhost:${port}. Don't tell anyone your secrets!`);
});
```

### 7. Instant Gratification: Hot Reloading (CLI Superpower)

We're all about speed here. The StationX CLI comes with a built-in superpower: hot reloading! Just run your app with `stationx start`, and any time you tweak and save your code, the server will magically restart itself. No more manual `Ctrl+C` then `node index.js` dance!

**To unleash the hot reload beast:**

```bash
stationx start
```

### 8. The Zen of Organization: Modular Project Structure

StationX practically begs you to keep your codebase clean and organized. We love modules! They help you break down your app into logical, manageable chunks. Here's how a happy StationX project usually looks:

```
.
├── index.js                  # The grand orchestrator of your application
├── package.json              # Your project's identity card and dependency list
├── .env                      # Where your secrets (and configurations) hide
├── middlewares/              # Your bouncers and greeters for all incoming requests
│   └── logger.js             # Our example logging middleware
├── modules/                  # The heart of your modular design
│   ├── app/                  # A sample module for core application logic
│   │   ├── controllers.js    # The brains of your endpoints
│   │   ├── examples.js       # Example data or usage scenarios
│   │   ├── routes.js         # The map to your app's features
│   │   └── schema.js         # The strict librarian for your app's data
│   └── users/                # All things user-related (auth, profiles, etc.)
│       ├── routes.js         # User-specific URLs
│       └── schema.js         # How user data should look
├── media/                    # Your digital art gallery (images, videos)
│   └── logo.svg              # The glorious StationX logo!
├── static/                   # The public face: CSS, JavaScript, fonts
│   ├── js/
│   │   └── index.js          # Your client-side JavaScript
│   └── styles/
│       ├── how-to.css        # Styles specifically for the 'how-to' page
│       └── style.css         # Your main stylesheet
└── views/                    # Where your HTML templates reside
    ├── index.html            # Your welcome mat for the web
    └── pages/
        └── how-to.html       # The comprehensive guide to StationX
```

This structure isn't just pretty; it makes scaling your application and collaborating with others a much more pleasant experience.

## Getting Your Hands Dirty (Getting Started)

Ready to dive in and make some backend magic? It's super easy to spin up a new StationX project:

```bash
# First, tell StationX to set up a new project for you
stationx init my-awesome-backend

# Navigate into your freshly brewed project directory
cd my-awesome-backend

# Install all the necessary bits and bobs (pnpm, npm, or yarn will do the trick)
pnpm install

# And finally, unleash the development server with glorious hot reloading!
stationx start
```

In no time, you'll have a new project with our modular setup and some basic examples, ready for you to customize and build upon. The backend world awaits your creative touch!

## Got Ideas? Found a Bug? Let's Chat!

StationX is a passion project, and I'm always keen to hear your thoughts, suggestions, or if you stumbled upon a pesky bug. Feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/nueldotdev/StationX). Let's make this little framework even cooler together!

## The Legal Bits (License)

StationX is released under the ISC License. Keep calm and code on!  