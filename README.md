# My Movie App

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44.5-orange)](https://orm.drizzle.team/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5.0.0--beta.29-green)](https://next-auth.js.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.55.1-green)](https://playwright.dev/)

A modern, full-stack web application for tracking movies and TV shows. Search for content using The Movie Database (TMDB) API, maintain personal watchlists, and keep track of what you've watched with ratings and notes.

## Features

- **User Authentication**: Secure sign-up and sign-in with email/password credentials
- **Movie & TV Show Search**: Powerful search functionality powered by TMDB API
- **Watchlist Management**: Add movies and TV shows to your personal watchlist
- **Watched Tracking**: Mark items as watched with custom ratings (1-10) and personal notes
- **Personal Dashboard**: View your watched history and pending watchlist
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Real-time Updates**: Instant UI updates with Zustand state management

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Lucide React** - Beautiful icons
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **NextAuth.js 5** - Authentication framework
- **Drizzle ORM** - Type-safe SQL query builder
- **PostgreSQL** (Neon) - Cloud database
- **Upstash Redis** - Caching and session storage

### APIs & Services

- **TMDB API** - Movie and TV show data
- **Neon** - Serverless PostgreSQL
- **Upstash** - Serverless Redis

### Development & Testing

- **ESLint** - Code linting
- **Jest** - Unit testing
- **Playwright** - End-to-end testing
- **Drizzle Kit** - Database migrations

## Project Structure

```
my-movie-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── tmdb/                 # TMDB API proxy
│   │   ├── watched/              # Watched list CRUD
│   │   └── watchlist/            # Watchlist CRUD
│   ├── auth/                     # Authentication pages
│   ├── watched/                  # Watched list page
│   ├── watchlist/                # Watchlist page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   ├── ui/                       # Radix UI components
│   └── ...                       # Custom components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── db.ts                     # Database configuration
│   ├── tmdb.ts                   # TMDB API client
│   └── utils.ts                  # Helper functions
├── state/                        # Zustand stores
├── tests/                        # Test files
│   ├── e2e/                      # End-to-end tests
│   └── unit/                     # Unit tests
├── public/                       # Static assets
├── drizzle/                      # Database migrations
└── ...config files
```

## Prerequisites

Before running this application, make sure you have the following:

- **Node.js** (version 18 or higher)
- **pnpm** package manager
- **Accounts for external services**:
  - [TMDB API Key](https://www.themoviedb.org/settings/api) - For movie/TV data
  - [Neon Database](https://neon.tech) - PostgreSQL database
  - [Upstash Redis](https://upstash.com) - Redis for caching

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd my-movie-app
   ```

2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

## Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.local .env.local
   ```

2. Fill in your environment variables in `.env.local`:

   ```env
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secure-random-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # TMDB API
   TMDB_API_KEY=your-tmdb-api-key-here

   # Database
   DATABASE_URL=your-neon-database-connection-string

   # Redis (Upstash)
   UPSTASH_REDIS_REST_URL=your-upstash-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
   ```

   **Security Note**: Never commit your `.env.local` file to version control.

## Database Setup

1. Create a new database in [Neon](https://neon.tech)
2. Copy the connection string and add it to `DATABASE_URL`
3. Run database migrations:
   ```bash
   pnpm drizzle-kit push
   ```

## Running Locally

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The app will automatically reload when you make changes to the code.

## Testing

### Unit Tests

Run unit tests with Jest:

```bash
pnpm test
```

### Integration Tests

Run integration tests with Jest (requires database):

```bash
pnpm test:integration
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode for debugging
pnpm test:e2e:ui

# Run in headed mode
pnpm test:e2e:headed

# Run in debug mode
pnpm test:e2e:debug
```

### Performance Benchmarks

Run performance benchmarks with Tinybench:

```bash
pnpm test:bench
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment. The CI pipeline runs automatically on pushes to the `main` branch and on pull requests.

### CI Pipeline Overview

The CI pipeline consists of the following jobs:

1. **Unit Tests** - Runs unit tests with coverage on Node.js versions 18, 20, and 22
2. **Integration Tests** - Runs integration tests with PostgreSQL database service
3. **E2E Tests** - Runs end-to-end tests with Playwright after building the application
4. **Benchmarks** - Runs performance benchmarks and captures results
5. **Coverage Check** - Combines coverage reports and uploads to Codecov

### Coverage Requirements

- **Overall Coverage Threshold**: 90% (branches, functions, lines, statements)
- Coverage reports are generated in text, LCOV, and JSON formats
- Reports are uploaded to [Codecov](https://codecov.io) for detailed analysis

### Failure Reporting

- On test failures, detailed logs and stack traces are captured as artifacts
- E2E test results include screenshots, videos, and Playwright reports
- Benchmark results are saved as artifacts for performance tracking

### Local Development

To run the full test suite locally (excluding E2E tests):

```bash
# Run all tests
pnpm test && pnpm test:integration

# Run with coverage
pnpm test --coverage && pnpm test:integration --coverage
```

For E2E tests, ensure the application is built and running:

```bash
pnpm build && pnpm start
# In another terminal
pnpm test:e2e
```

## Building for Production

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Deployment to Vercel

### Automatic Deployment

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Vercel will automatically detect Next.js and configure the build settings
3. Add your environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from your `.env.local` file

### Manual Deployment

1. Install Vercel CLI:

   ```bash
   pnpm install -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```

3. Follow the prompts and add environment variables when asked.

### Environment Variables for Vercel

Make sure to set these environment variables in your Vercel project:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your production URL)
- `TMDB_API_KEY`
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## API Routes

The application includes the following API endpoints:

- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `GET/POST /api/auth/signup` - User registration
- `GET/POST /api/tmdb/search` - Search movies/TV shows
- `GET/POST /api/watched` - Manage watched items
- `GET/POST/PUT/DELETE /api/watched/[id]` - Watched item CRUD
- `GET/POST /api/watchlist` - Manage watchlist
- `GET/POST/PUT/DELETE /api/watchlist/[id]` - Watchlist item CRUD

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run tests: `pnpm test && pnpm test:e2e`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing movie and TV show data
- [Neon](https://neon.tech) for serverless PostgreSQL
- [Upstash](https://upstash.com) for serverless Redis
- [Vercel](https://vercel.com) for hosting platform
