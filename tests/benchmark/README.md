# Performance Benchmarks

This directory contains performance benchmarks for critical functions in the movie tracking application. Benchmarks are implemented using the `tinybench` library and measure execution times, memory usage, and throughput for various operations.

## Running Benchmarks

To run all benchmarks:

```bash
# Run TMDB benchmarks
npx tsx tests/benchmark/tmdb.bench.ts

# Run DB benchmarks
npx tsx tests/benchmark/db.bench.ts

# Run component benchmarks (requires Jest environment)
npm test -- tests/benchmark/components.bench.tsx

# Run state benchmarks
npm test -- tests/benchmark/state.bench.ts

# Run utils benchmarks
npx tsx tests/benchmark/utils.bench.ts
```

## Benchmark Categories

### TMDB API Calls

**File:** `tmdb.bench.ts`

Benchmarks TMDB API operations including search and details fetching.

**Benchmarks:**

- `searchMovies - popular query`: Search for "batman"
- `searchMovies - specific query`: Search for "the dark knight 2008"
- `searchTVShows - popular query`: Search for "breaking bad"
- `searchTVShows - specific query`: Search for "stranger things season 1"
- `getMovieDetails - popular movie`: Get details for The Dark Knight (ID: 155)
- `getMovieDetails - recent movie`: Get details for Free Guy (ID: 550988)
- `getTVShowDetails - popular show`: Get details for Game of Thrones (ID: 1399)
- `getTVShowDetails - recent show`: Get details for Loki (ID: 84958)

**Performance Thresholds:**

- All operations: < 500ms for details, < 1000ms for searches
- Note: Includes network latency and TMDB API response times

### Database Operations

**File:** `db.bench.ts`

Benchmarks CRUD operations on watched and watchlist tables using Drizzle ORM.

**Benchmarks:**

- `watched - insert single record`: Insert one watched record
- `watched - select single record`: Select records for a user (limit 1)
- `watched - select multiple records (small)`: Select up to 10 records
- `watched - select multiple records (medium)`: Select up to 100 records
- `watched - update single record`: Update rating and notes
- `watched - delete single record`: Delete a record
- Similar operations for watchlist table

**Performance Thresholds:**

- Simple operations (insert/delete): < 50ms
- Select operations: < 100ms for small, < 200ms for medium
- Update operations: < 100ms

**Notes:**

- Uses test data and assumes test user exists
- Cleanup operations are performed to avoid data pollution

### Component Rendering

**File:** `components.bench.tsx`

Benchmarks React component rendering performance for MovieCard and WatchedCard components.

**Benchmarks:**

- `MovieCard - render single`: Render one MovieCard
- `MovieCard - render list (small: 5)`: Render 5 MovieCards
- `MovieCard - render list (medium: 20)`: Render 20 MovieCards
- `MovieCard - render list (large: 50)`: Render 50 MovieCards
- Similar benchmarks for WatchedCard

**Performance Thresholds:**

- Single component: < 50ms
- Small lists (5): < 100ms
- Medium lists (20): < 300ms
- Large lists (50): < 500ms

**Notes:**

- Uses React Testing Library with jsdom
- Mocks Next.js components and Zustand stores
- WatchedCard includes TMDB data fetching (mocked)

### State Management

**File:** `state.bench.ts`

Benchmarks Zustand store operations for watched management.

**Benchmarks:**

- `watched store - fetchWatched (mocked)`: Fetch watched items
- `watched store - addWatched (mocked)`: Add new watched item
- `watched store - updateWatched (mocked)`: Update existing item
- `watched store - deleteWatched (mocked)`: Delete item
- `state update - large list (100 items)`: Update state with 100 items
- `state update - large list (500 items)`: Update state with 500 items

**Performance Thresholds:**

- Store operations with mocked network: < 50ms
- State updates: < 10ms for small, < 50ms for large lists

**Notes:**

- Mocks fetch API calls
- Measures both network-included and pure state operations

### Utility Functions

**File:** `utils.bench.ts`

Benchmarks the `cn` utility function (clsx + tailwind-merge).

**Benchmarks:**

- `cn - single class`: Single CSS class
- `cn - multiple classes`: Multiple CSS classes
- `cn - with conditional classes`: Classes with boolean conditions
- `cn - with falsy values`: Classes with null/undefined/falsy values
- `cn - large number of classes (10/20)`: Many CSS classes
- `cn - with Tailwind responsive classes`: Responsive classes
- `cn - complex conditional logic`: Dynamic class generation

**Performance Thresholds:**

- All operations: < 1ms

**Notes:**

- The `cn` function should be extremely fast as it's used frequently in rendering

## Benchmark Results Interpretation

Each benchmark reports:

- **Average time**: Mean execution time
- **Min/Max time**: Fastest and slowest runs
- **Standard deviation**: Consistency of performance
- **Memory usage**: Memory consumption (if available)
- **Throughput**: Operations per second

Compare results against the documented thresholds. If benchmarks exceed thresholds, investigate:

1. Network issues (for API benchmarks)
2. Database performance (for DB benchmarks)
3. Component optimization (for rendering benchmarks)
4. State management efficiency (for store benchmarks)
5. Algorithm complexity (for utility functions)

## Environment Setup

Benchmarks require:

- TMDB API key in environment variables
- Database connection configured
- Node.js with TypeScript support
- Jest environment for component and state benchmarks

## Continuous Monitoring

Run these benchmarks:

- During development to catch performance regressions
- Before deployments to ensure performance standards
- When optimizing specific components or functions
