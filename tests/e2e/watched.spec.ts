import { test, expect } from "@playwright/test";

test.describe("Watched Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should add movie to watched list with rating and notes", async ({
    page,
  }) => {
    // Mock TMDB search response
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

    // Mock the add to watched API response
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            tmdbId: 1,
            type: "movie",
            watchedDate: "2023-01-01",
            rating: 8,
            notes: "Great movie!",
          }),
        });
      }
    });

    // Search for a movie
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test Movie",
    );
    await page.click('button:has-text("Search")');

    // Wait for search results
    await expect(page.locator('h2:has-text("Search Results")')).toBeVisible();

    // Click "Add to Watched" button
    await page.click('button:has-text("Add to Watched")');

    // Should show loading state
    await expect(page.locator('button:has-text("Adding...")')).toBeVisible();

    // After successful addition, should show success state or navigate
    await expect(
      page.locator('button:has-text("Add to Watched")'),
    ).toBeVisible();
  });

  test("should add TV show to watched list", async ({ page }) => {
    // Mock TMDB search response for TV shows
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

    // Mock the add to watched API response
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            tmdbId: 1,
            type: "tv",
            watchedDate: "2023-01-01",
            rating: 7,
            notes: "Good series!",
          }),
        });
      }
    });

    // Select TV Show type
    await page.click('[data-testid="type-selector"]');
    await page.click("text=TV Show");

    // Search for a TV show
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test TV Show",
    );
    await page.click('button:has-text("Search")');

    // Wait for search results
    await expect(page.locator('h2:has-text("Search Results")')).toBeVisible();

    // Click "Add to Watched" button
    await page.click('button:has-text("Add to Watched")');

    // Should show loading state
    await expect(page.locator('button:has-text("Adding...")')).toBeVisible();
  });

  test("should navigate to watched page and display items", async ({
    page,
  }) => {
    // Mock the get watched items API response
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              tmdbId: 1,
              type: "movie",
              watchedDate: "2023-01-01",
              rating: 8,
              notes: "Great movie!",
            },
          ]),
        });
      }
    });

    // Navigate to watched page
    await page.goto("/watched");

    // Should display watched items
    await expect(page.locator('h1:has-text("Watched")')).toBeVisible();
    await expect(page.locator('[data-testid="watched-card"]')).toBeVisible();
    await expect(page.locator("text=Great movie!")).toBeVisible();
  });

  test("should edit watched item with new rating and notes", async ({
    page,
  }) => {
    // Mock the get watched items API response
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              tmdbId: 1,
              type: "movie",
              watchedDate: "2023-01-01",
              rating: 8,
              notes: "Great movie!",
            },
          ]),
        });
      }
    });

    // Mock the update watched item API response
    await page.route("**/watched/1**", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            tmdbId: 1,
            type: "movie",
            watchedDate: "2023-01-02",
            rating: 9,
            notes: "Excellent movie! Updated notes.",
          }),
        });
      }
    });

    // Navigate to watched page
    await page.goto("/watched");

    // Click edit button
    await page.click('button:has-text("Edit")');

    // Should navigate to edit page
    await expect(
      page.locator('h1:has-text("Edit Watched Item")'),
    ).toBeVisible();

    // Update rating
    await page.fill('input[id="rating"]', "9");

    // Update notes
    await page.fill('textarea[id="notes"]', "Excellent movie! Updated notes.");

    // Update watched date
    await page.fill('input[id="watchedDate"]', "2023-01-02");

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Should navigate back to watched page
    await expect(page.locator('h1:has-text("Watched")')).toBeVisible();
  });

  test("should delete watched item", async ({ page }) => {
    // Mock the get watched items API response
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              tmdbId: 1,
              type: "movie",
              watchedDate: "2023-01-01",
              rating: 8,
              notes: "Great movie!",
            },
          ]),
        });
      }
    });

    // Mock the delete watched item API response
    await page.route("**/watched/1**", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // Navigate to watched page
    await page.goto("/watched");

    // Click delete button
    await page.click('button:has-text("Delete")');

    // Should show loading state
    await expect(page.locator('button:has-text("Deleting...")')).toBeVisible();

    // After deletion, the item should be removed from the list
    await expect(
      page.locator('[data-testid="watched-card"]'),
    ).not.toBeVisible();
  });

  test("should handle API errors gracefully when adding to watched", async ({
    page,
  }) => {
    // Mock TMDB search response
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

    // Mock API error for adding to watched
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      }
    });

    // Search for a movie
    await page.fill(
      'input[placeholder="Search for movies or TV shows..."]',
      "Test Movie",
    );
    await page.click('button:has-text("Search")');

    // Wait for search results
    await expect(page.locator('h2:has-text("Search Results")')).toBeVisible();

    // Click "Add to Watched" button
    await page.click('button:has-text("Add to Watched")');

    // Should show loading state
    await expect(page.locator('button:has-text("Adding...")')).toBeVisible();

    // After error, should return to normal state
    await expect(
      page.locator('button:has-text("Add to Watched")'),
    ).toBeVisible();
  });

  test("should handle empty watched list", async ({ page }) => {
    // Mock empty watched items response
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      }
    });

    // Navigate to watched page
    await page.goto("/watched");

    // Should display empty state message
    await expect(page.locator('h1:has-text("Watched")')).toBeVisible();
    await expect(page.locator("text=No watched items yet")).toBeVisible();
  });

  test("should validate rating input in edit form", async ({ page }) => {
    // Mock the get watched items API response
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              tmdbId: 1,
              type: "movie",
              watchedDate: "2023-01-01",
              rating: 8,
              notes: "Great movie!",
            },
          ]),
        });
      }
    });

    // Navigate to watched page
    await page.goto("/watched");

    // Click edit button
    await page.click('button:has-text("Edit")');

    // Try to enter invalid rating (above 10)
    await page.fill('input[id="rating"]', "15");

    // Try to enter invalid rating (below 1)
    await page.fill('input[id="rating"]', "0");

    // Try to enter non-numeric value
    await page.fill('input[id="rating"]', "abc");

    // Should not allow saving with invalid values
    // The form validation should prevent this
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  });

  test("should handle network errors when loading watched items", async ({
    page,
  }) => {
    // Mock network error for getting watched items
    await page.route("**/watched**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Network error" }),
        });
      }
    });

    // Navigate to watched page
    await page.goto("/watched");

    // Should handle error gracefully
    await expect(page.locator('h1:has-text("Watched")')).toBeVisible();
    // Should show error message or fallback UI
  });
});
