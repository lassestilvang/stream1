import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display search interface on page load", async ({ page }) => {
    // Check that the main heading is visible
    await expect(page.locator("h1")).toContainText("Movie & TV Show Search");

    // Check that the search bar is visible
    await expect(
      page.locator('input[placeholder="Search for movies or TV shows..."]')
    ).toBeVisible();

    // Check that the type selector is visible
    await expect(page.locator('[data-testid="type-selector"]')).toBeVisible();

    // Check that the search button is visible
    await expect(page.locator('button:has-text("Search")')).toBeVisible();
  });

  test("should search for movies successfully", async ({ page }) => {
    // Mock the TMDB API response
    await page.route("**/search/movie**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              id: 1,
              title: "Test Movie",
              overview: "This is a test movie description",
              release_date: "2023-01-01",
              poster_path: "/test-poster.jpg",
            },
          ],
        }),
      });
    });

    // Enter search query
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test Movie"
    );

    // Click search button
    await page.click('button:has-text("Search")');

    // Wait for results to appear
    await expect(page.locator('h2:has-text("Search Results")')).toBeVisible();

    // Check that the movie card appears
    await expect(
      page.locator('.grid [data-testid="movie-card"]')
    ).toBeVisible();
    await expect(page.locator('h3:has-text("Test Movie")')).toBeVisible();
  });

  test("should search for TV shows successfully", async ({ page }) => {
    // Mock the TMDB API response for TV shows
    await page.route("**/search/tv**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              id: 1,
              name: "Test TV Show",
              overview: "This is a test TV show description",
              first_air_date: "2023-01-01",
              poster_path: "/test-poster.jpg",
            },
          ],
        }),
      });
    });

    // Select TV Show type
    await page.click('[data-testid="type-selector"]');
    await page.click("text=TV Show");

    // Enter search query
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test TV Show"
    );

    // Click search button
    await page.click('button:has-text("Search")');

    // Wait for results to appear
    await expect(page.locator('h2:has-text("Search Results")')).toBeVisible();

    // Check that the TV show card appears
    await expect(
      page.locator('.grid [data-testid="movie-card"]')
    ).toBeVisible();
    await expect(page.locator('h3:has-text("Test TV Show")')).toBeVisible();
  });

  test("should show loading state during search", async ({ page }) => {
    // Mock a slow API response
    await page.route("**/search/movie**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay response
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    // Enter search query
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test Movie"
    );

    // Click search button
    await page.click('button:has-text("Search")');

    // Check loading state
    await expect(page.locator('button:has-text("Searching...")')).toBeVisible();
    await expect(page.locator("text=Searching...")).toBeVisible();
  });

  test("should show no results message for empty search", async ({ page }) => {
    // Mock empty results
    await page.route("**/search/movie**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    // Enter search query
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Non-existent Movie"
    );

    // Click search button
    await page.click('button:has-text("Search")');

    // Check no results message
    await expect(page.locator("text=No results found")).toBeVisible();
  });

  test("should handle search API errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/search/movie**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    // Enter search query
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test Movie"
    );

    // Click search button
    await page.click('button:has-text("Search")');

    // Should show error state or fallback gracefully
    // The app should handle this without crashing
    await expect(
      page.locator('h1:has-text("Movie & TV Show Search")')
    ).toBeVisible();
  });

  test("should disable search button when loading", async ({ page }) => {
    // Mock a slow API response
    await page.route("**/search/movie**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay response
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    // Enter search query
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test Movie"
    );

    // Click search button
    await page.click('button:has-text("Search")');

    // Button should be disabled and show loading state
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeDisabled();
    await expect(searchButton).toHaveText("Searching...");
  });

  test("should clear previous results when starting new search", async ({
    page,
  }) => {
    // Mock first search
    await page.route("**/search/movie**", async (route) => {
      const url = route.request().url();
      if (url.includes("query=First")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            results: [
              {
                id: 1,
                title: "First Movie",
                overview: "First movie description",
                release_date: "2023-01-01",
                poster_path: "/test-poster.jpg",
              },
            ],
          }),
        });
      } else if (url.includes("query=Second")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            results: [
              {
                id: 2,
                title: "Second Movie",
                overview: "Second movie description",
                release_date: "2023-01-01",
                poster_path: "/test-poster.jpg",
              },
            ],
          }),
        });
      }
    });

    // First search
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "First Movie"
    );
    await page.click('button:has-text("Search")');
    await expect(page.locator('h3:has-text("First Movie")')).toBeVisible();

    // Second search
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Second Movie"
    );
    await page.click('button:has-text("Search")');
    await expect(page.locator('h3:has-text("Second Movie")')).toBeVisible();

    // First movie should no longer be visible
    await expect(page.locator('h3:has-text("First Movie")')).not.toBeVisible();
  });
});
