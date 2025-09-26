# Test Suite Documentation

This document provides comprehensive documentation for the entire test suite of the movie tracking application. It covers test structure, frameworks, coverage goals, CI integration, and guidelines for maintaining and extending the test suite.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Testing Frameworks](#testing-frameworks)
- [Coverage Goals](#coverage-goals)
- [CI Integration](#ci-integration)
- [Running Tests](#running-tests)
- [Test Patterns and Best Practices](#test-patterns-and-best-practices)
- [Adding New Tests](#adding-new-tests)
- [Maintainability Notes](#maintainability-notes)

## Overview

The test suite is designed to ensure the reliability, performance, and correctness of the movie tracking application. It employs a multi-layered testing strategy that includes unit tests, integration tests, end-to-end tests, and performance benchmarks.

The suite tests:

- React components and hooks
- API routes and database operations
- External API integrations (TMDB)
- State management (Zustand stores)
- User interface interactions
- Performance characteristics

## Test Structure

The test suite is organized into four main categories:

### Unit Tests (`tests/unit/`)

**Purpose:** Test individual functions, components, and modules in isolation.

**Framework:** Jest with jsdom environment

**Coverage:** 90% minimum for branches, functions, lines, and statements

**Examples:**

- Component rendering and interactions
- Utility functions
- State store operations
- Database query functions

**Sample Structure:**

```
tests/unit/
├── store.test.ts          # Zustand store operations
├── utils.test.ts          # Utility functions
├── db.test.ts             # Database operations
├── useWatched.test.ts     # Custom hooks
├── Navigation.test.tsx    # React components
├── MovieCard.test.tsx
├── SearchBar.test.tsx
├── WatchedCard.test.tsx
└── auth/
    └── nextauth.test.ts   # Authentication logic
```

### Integration Tests (`tests/integration/`)

**Purpose:** Test interactions between multiple components, API routes, and external services.

**Framework:** Jest with Node.js environment

**Coverage:** 90% minimum for branches, functions, lines, and statements

**Examples:**

- API route handlers with database interactions
- Authentication flows
- External API integrations

**Sample Structure:**

```
tests/integration/
├── auth/
│   └── signup.test.ts     # User registration flow
├── tmdb/
│   ├── movie.test.ts      # TMDB movie API integration
│   ├── search.test.ts     # TMDB search functionality
│   └── tv.test.ts         # TMDB TV show API integration
├── watched/
│   ├── route.test.ts      # Watched items API routes
│   └── [id].test.ts       # Individual watched item operations
└── watchlist/
    ├── route.test.ts      # Watchlist API routes
    └── [id].test.ts       # Individual watchlist operations
```

### End-to-End Tests (`tests/e2e/`)

**Purpose:** Test complete user workflows from the browser perspective.

**Framework:** Playwright

**Examples:**

- User search and discovery flows
- Watched list management
- Authentication flows

**Sample Structure:**

```
tests/e2e/
├── search.spec.ts         # Search functionality
├── watched.spec.ts        # Watched items management
└── playwright.config.ts   # E2E test configuration
```

### Performance Benchmarks (`tests/benchmark/`)

**Purpose:** Measure and monitor performance characteristics of critical functions.

**Framework:** Tinybench

**Examples:**

- Component rendering performance
- Database operation speeds
- API response times
- State management efficiency

**Sample Structure:**

```
tests/benchmark/
├── components.bench.tsx   # Component rendering benchmarks
├── db.bench.ts           # Database operation benchmarks
├── state.bench.ts        # State management benchmarks
├── tmdb.bench.ts         # TMDB API benchmarks
├── utils.bench.ts        # Utility function benchmarks
└── README.md             # Benchmark documentation
```

## Testing Frameworks

### Jest

- **Primary unit and integration testing framework**
- **Configuration:** `jest.config.js` (unit), `jest.integration.config.js` (integration)
- **Features:**
  - TypeScript support via `ts-jest`
  - ESM support with `useESM: true`
  - Custom module mapping for `@/` imports
  - Coverage reporting with thresholds
  - Setup files for environment configuration

### Playwright

- **End-to-end testing framework**
- **Configuration:** `playwright.config.ts`
- **Features:**
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Mobile viewport testing
  - Automatic screenshot/video capture on failures
  - API mocking capabilities
  - Parallel test execution

### Tinybench

- **Performance benchmarking framework**
- **Usage:** Direct execution with `tsx`
- **Features:**
  - Precise timing measurements
  - Memory usage tracking
  - Statistical analysis (mean, min, max, std dev)
  - Custom benchmark suites

## Coverage Goals

The test suite maintains a minimum coverage threshold of **90%** across all metrics:

- **Branches:** 90%
- **Functions:** 90%
- **Lines:** 90%
- **Statements:** 90%

Coverage is measured separately for:

- Unit tests (app/, components/, lib/, hooks/, state/)
- Integration tests (API routes and database operations)

Coverage reports are generated in multiple formats:

- Text output in console
- LCOV format for CI integration
- JSON format for programmatic analysis

## CI Integration

Tests are automatically run on every push and pull request to the main branch via GitHub Actions.

### CI Pipeline (`ci.yml`)

**Jobs:**

1. **Unit Tests**

   - Runs on Ubuntu with Node.js 18, 20, 22
   - Executes `pnpm test:unit --coverage`
   - Uploads coverage to Codecov

2. **Integration Tests**

   - Runs on Ubuntu with Node.js 20
   - Requires PostgreSQL service
   - Executes `pnpm test:integration --coverage`
   - Uploads coverage to Codecov

3. **E2E Tests**

   - Runs on Ubuntu with Node.js 20
   - Builds the application
   - Executes `pnpm test:e2e`
   - Uploads test results and artifacts

4. **Benchmarks**

   - Runs on Ubuntu with Node.js 20
   - Executes `pnpm test:bench`
   - Uploads benchmark results

5. **Coverage Check**
   - Combines coverage from unit and integration tests
   - Ensures minimum thresholds are met
   - Fails CI if coverage drops below 90%

## Running Tests

### Prerequisites

Ensure all dependencies are installed:

```bash
pnpm install
```

Set up environment variables:

```bash
cp .env.example .env.local
# Add required API keys and database URLs
```

### Running All Tests

```bash
# Run all unit and integration tests
pnpm test

# Run specific test types
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests only
pnpm test:e2e              # End-to-end tests
pnpm test:e2e:ui           # E2E tests with UI mode
pnpm test:e2e:headed       # E2E tests in headed mode
pnpm test:e2e:debug        # E2E tests in debug mode
pnpm test:bench            # Performance benchmarks
```

### Running Individual Test Files

```bash
# Unit tests
npx jest tests/unit/store.test.ts
npx jest tests/unit/components/MovieCard.test.tsx

# Integration tests
npx jest --config jest.integration.config.js tests/integration/watched/route.test.ts

# E2E tests
npx playwright test tests/e2e/search.spec.ts
npx playwright test tests/e2e/search.spec.ts --headed  # Run in browser

# Benchmarks
npx tsx tests/benchmark/components.bench.tsx
```

### Coverage Reports

```bash
# Generate coverage report for unit tests
pnpm test:unit --coverage

# Generate coverage report for integration tests
pnpm test:integration --coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Test Patterns and Best Practices

### Unit Test Patterns

**Mocking Strategy:**

```typescript
// Mock external dependencies
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock libraries
jest.mock("sonner", () => ({
  toast: { error: jest.fn() },
}));
```

**State Testing:**

```typescript
describe("Search Store", () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: "",
      results: [],
      loading: false,
    });
  });

  it("updates query correctly", () => {
    useSearchStore.getState().setQuery("test");
    expect(useSearchStore.getState().query).toBe("test");
  });
});
```

**Component Testing:**

```typescript
import { render, screen } from "@testing-library/react";

it("renders movie card", () => {
  render(<MovieCard item={sampleMovie} />);
  expect(screen.getByText("Movie Title")).toBeInTheDocument();
});
```

### Integration Test Patterns

**API Route Testing:**

```typescript
import { createMocks } from "node-mocks-http";

describe("/api/watched", () => {
  it("returns watched items", async () => {
    const mockUser = { id: "user-123" };
    mockAuth.mockResolvedValue({ user: mockUser });

    const { req } = createMocks({ method: "GET" });
    const response = await GET(req as any);

    expect(response.status).toBe(200);
  });
});
```

**Database Mocking:**

```typescript
const mockSelect = jest.fn().mockReturnValue({
  from: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      orderBy: jest.fn().mockResolvedValue(mockItems),
    }),
  }),
});
mockDb.select.mockImplementation(mockSelect);
```

### E2E Test Patterns

**Page Interaction Testing:**

```typescript
test("searches for movies", async ({ page }) => {
  await page.goto("/");

  // Mock API response
  await page.route("**/search/movie**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [mockMovie] }),
    });
  });

  // Interact with page
  await page.fill('input[placeholder="Search..."]', "Test Movie");
  await page.click('button:has-text("Search")');

  // Assert results
  await expect(page.locator('h3:has-text("Test Movie")')).toBeVisible();
});
```

### Performance Benchmark Patterns

**Component Benchmarking:**

```typescript
bench
  .add("MovieCard render", () => {
    render(<MovieCard item={sampleMovie} />);
  })
  .add("MovieCard list render", () => {
    const movies = generateMovies(20);
    render(
      <div>
        {movies.map((movie) => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    );
  });
```

## Adding New Tests

### Unit Tests

1. **Create test file** in appropriate `tests/unit/` subdirectory
2. **Follow naming convention:** `ComponentName.test.tsx` or `functionName.test.ts`
3. **Mock external dependencies** (fetch, libraries, stores)
4. **Test edge cases** and error conditions
5. **Ensure 90% coverage** for new code

### Integration Tests

1. **Create test file** in `tests/integration/` subdirectory matching API structure
2. **Mock database operations** using Drizzle mock patterns
3. **Mock authentication** using `node-mocks-http`
4. **Test error scenarios** and validation
5. **Include concurrent operation tests** where applicable

### E2E Tests

1. **Create spec file** in `tests/e2e/` directory
2. **Use descriptive test names** and page object patterns
3. **Mock external APIs** to ensure consistent results
4. **Test user journeys** end-to-end
5. **Include accessibility checks** where relevant

### Benchmarks

1. **Create bench file** in `tests/benchmark/` directory
2. **Define performance thresholds** in benchmark suite
3. **Use realistic data sizes** for meaningful measurements
4. **Include setup/cleanup** for database benchmarks
5. **Document expected performance** in benchmark README

## Maintainability Notes

### Test Organization

- **Group related tests** using `describe` blocks
- **Use clear, descriptive test names** that explain the behavior being tested
- **Follow consistent naming conventions** across the suite
- **Keep test files focused** on single responsibilities

### Mock Management

- **Centralize mock setup** in `jest.setup.ts` or `jest.setup.integration.ts`
- **Use factory functions** for complex mock data
- **Keep mocks up-to-date** with API changes
- **Document mock behaviors** in test comments

### Coverage Maintenance

- **Monitor coverage reports** regularly
- **Address coverage gaps** immediately when adding new code
- **Avoid excluding code** from coverage without justification
- **Use coverage thresholds** to prevent regressions

### Performance Monitoring

- **Run benchmarks regularly** during development
- **Set realistic performance expectations** based on use cases
- **Monitor benchmark results** in CI
- **Optimize based on benchmark insights**

### Test Data Management

- **Use consistent sample data** across tests
- **Generate test data programmatically** for large datasets
- **Clean up test data** in integration tests
- **Avoid hard-coded IDs** that may conflict

### CI/CD Considerations

- **Keep test execution time reasonable** (< 10 minutes total)
- **Parallelize tests** where possible
- **Use appropriate resource allocation** for different test types
- **Monitor flaky tests** and address root causes

### Documentation Updates

- **Keep this README current** with framework changes
- **Document new test patterns** as they emerge
- **Update coverage goals** based on project needs
- **Include examples** for complex testing scenarios

This comprehensive test suite ensures the movie tracking application maintains high quality, performance, and reliability across all layers of the stack.
