# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Install dependencies

```bash
npm install
```

### Run the backend server

The main entrypoint is `server.js` (not `index.js`). Prefer running it directly:

```bash
node server.js
```

For automatic reloads during development, you can use `nodemon` (already listed as a dependency):

```bash
npx nodemon server.js
```

> Note: `package.json` currently defines `"start": "node index.js"` but there is no `index.js` file in this directory. Until that is corrected, use the commands above instead of `npm start`.

### Tests and linting

There are currently no test or lint scripts defined in `package.json` and no test framework configured. If you add one (e.g. Jest, Mocha), also add the corresponding `npm` scripts so future agents can use them.

## High-level architecture

This project is a Node.js + Express REST API backed by MongoDB (via Mongoose), organized into feature-based route/controller/model layers with shared middleware, validation, and services.

### Entry point and application setup

- `server.js`
  - Creates the Express app and applies global middleware:
    - `cors` with an allowlist of frontend origins.
    - `express.json()` for JSON request bodies.
  - Registers routers under versioned API prefixes:
    - `/api/auth` → `router/auth-router.js`
    - `/api/form` → `router/contact_router.js`
    - `/api/admin` → `router/admin-router.js`
    - `/api/data` → `router/Mentee-router.js`
    - `/api/book` → `router/bookingRouter.js`
  - Wires in the global error handler `middleware/error_middleware.js` **after** all routes.
  - Connects to MongoDB via `util/db.js`, then starts the HTTP server.

### Database and models

MongoDB is accessed through Mongoose models in `models/`:

- `models/user_model.js`
  - User schema with `username`, `email`, `password`, `phone`, and `isadmin` flag.
  - `pre('save')` hook hashes passwords with `bcryptjs`.
  - Instance method `comparePassword(plainPassword)` for login.
  - Instance method `generateToken()` creating a JWT that encodes `userId`, `email`, and `isadmin` using `process.env.jwt_sec_key`.
- `models/Mentee-model.js`
  - Represents a mentor/mentee offering with `name`, `job_description`, `price_per_hour`, and `image`.
  - Uses the `Mentees` collection and timestamps.
- `models/Booking.js`
  - Stores booked sessions: `mentee` reference, `userName`, `userEmail`, `selectedTime`, and `zoomLink`, with timestamps.
- `models/contact_model.js`
  - Simple contact form submissions with `username`, `email`, and `message`.

MongoDB connectivity is encapsulated in:

- `util/db.js`
  - Loads environment variables via `dotenv` and calls `mongoose.connect(URI)`.
  - Treat the MongoDB connection URI as a secret even though it is currently in code; prefer moving it to an environment variable and reading it from `process.env` in future changes.

### Routing and controllers

Each feature exposes an Express router in `router/` and a corresponding controller in `controllers/`:

- **Authentication**
  - Router: `router/auth-router.js` mounted at `/api/auth`.
    - `POST /register` → `Register` controller, validated by Zod schema `signupSchema` via `middleware/valid_middleware.js`.
    - `GET /` → `home` controller (simple health/welcome endpoint).
    - `POST /login` → `login` controller, validated by `LoginSchema`.
    - `GET /User` → `User` controller, protected by `middleware/auth_middleware.js`.
  - Controller: `controllers/auth-controller.js`.
    - `Register` creates a new `User` after ensuring the email is unique and returns a JWT.
    - `login` verifies credentials using `comparePassword` and returns a JWT.
    - `User` returns the authenticated user data from `req.user`.

- **Admin**
  - Router: `router/admin-router.js` mounted at `/api/admin`.
    - User management: list all users, get by id, update, and delete under `/users` paths.
    - Contact management: list and delete contacts under `/contacts` paths.
    - All routes use `auth_middleware` and `admin_middleware` in sequence.
  - Controller: `controllers/admin-controllers.js` implements the CRUD and listing logic for users and contacts.

- **Mentees (mentors catalog)**
  - Router: `router/Mentee-router.js` mounted at `/api/data`.
    - `GET /mentees` → `getAllMentees` with optional query-based filtering by `name` and `skill`.
    - `GET /mentees/:id` → `getMenteeById`.
  - Controller: `controllers/Mentee_controller.js` runs the filtered Mongoose queries.

- **Contact form**
  - Router: `router/contact_router.js` mounted at `/api/form`.
    - `POST /contact` → `Contactform` controller.
  - Controller: `controllers/contact_controller.js` persists contact submissions into `Contact` documents.

- **Booking and payments**
  - Router: `router/bookingRouter.js` mounted at `/api/book`.
    - `POST /book-session` → `bookSession` controller.
  - Controller: `controllers/bookingController.js`.
    - Uses `Razorpay` to create payment orders (via `createPaymentOrder`) and stores payment metadata (IDs) alongside bookings.
    - After payment confirmation, uses `services/Zoomservice.js` to create a Zoom meeting, then saves a `Booking` document with the generated `zoomLink`.

When adding new features, follow this pattern: define a Mongoose model (if needed), write controller functions in `controllers/`, expose them via a dedicated router in `router/`, and mount that router in `server.js` under an appropriate `/api/...` prefix.

### Middleware and validation

Shared middleware in `middleware/` implements cross-cutting concerns:

- `auth_middleware.js`
  - Expects an `Authorization: Bearer <token>` header.
  - Verifies the JWT with `process.env.jwt_sec_key`.
  - Loads the user from MongoDB (excluding `password`) and attaches it as `req.user` and `req.userId`.
  - Use this to protect any route that requires an authenticated user.

- `admin_middleware.js`
  - Checks an admin flag on `req.user` (note the current code uses `req.user.isAdmin` whereas the model field is `isadmin`).
  - Use in combination with `auth_middleware` to restrict routes to admins only.

- `valid_middleware.js`
  - Higher-order middleware that takes a Zod schema and asynchronously parses `req.body`.
  - On success, replaces `req.body` with the parsed value and calls `next()`.
  - On validation failure, constructs an error object with `status` and `extraDetails` and forwards it to the global error handler.

- `error_middleware.js`
  - Centralized error handler reading `err.status`, `err.message`, and `err.extraDetails` and returning a JSON response.
  - When throwing or forwarding custom errors from controllers, set these properties to control the HTTP response.

### Validation schemas

- `validator/auth_valid.js`
  - Defines `LoginSchema` and `signupSchema` using Zod.
  - `LoginSchema` validates `email` and `password` with reasonable length constraints.
  - `signupSchema` extends `LoginSchema` with `username` and `phone` validation.
  - For new endpoints, define additional schemas in this or a new validator module and wrap routes with `valid_middleware`.

### External services and configuration

- `services/Zoomservice.js`
  - Generates a short-lived Zoom JWT using `ZOOM_API_KEY` and `ZOOM_API_SECRET` from the environment.
  - Exposes `createZoomMeeting(topic, startTime)` which calls Zoom's `users/me/meetings` API and returns the meeting join URL.
  - Used in `bookingController` to provision meetings when a session is booked.

- `controllers/bookingController.js`
  - Uses `Razorpay` with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the environment for payments.

Environment variables used across the codebase include (but may not be limited to):

- `jwt_sec_key` – JWT signing/verification secret.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` – Razorpay credentials.
- `ZOOM_API_KEY`, `ZOOM_API_SECRET` – Zoom API credentials.

Ensure these are set in the runtime environment (e.g. via a `.env` file loaded by `dotenv`) before starting the server.
