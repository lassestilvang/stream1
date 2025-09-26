import { cn } from "../../lib/utils";

describe("cn utility function", () => {
  it("combines single class name", () => {
    expect(cn("class1")).toBe("class1");
  });

  it("combines multiple class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("handles undefined values", () => {
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
  });

  it("handles null values", () => {
    expect(cn("class1", null, "class2")).toBe("class1 class2");
  });

  it("handles empty strings", () => {
    expect(cn("class1", "", "class2")).toBe("class1 class2");
  });

  it("handles falsy values", () => {
    expect(cn("class1", false, "class2")).toBe("class1 class2");
  });

  it("handles object syntax", () => {
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
  });

  it("handles array syntax", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
  });

  it("merges conflicting Tailwind classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("preserves non-conflicting classes when merging", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toContain("px-4");
    expect(result).toContain("py-1");
  });

  it("handles complex Tailwind merging", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles responsive classes", () => {
    expect(cn("md:px-2", "md:px-4")).toBe("md:px-4");
  });

  it("handles hover states", () => {
    expect(cn("hover:text-red-500", "hover:text-blue-500")).toBe(
      "hover:text-blue-500"
    );
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles single empty string", () => {
    expect(cn("")).toBe("");
  });

  it("handles mixed valid and invalid inputs", () => {
    expect(cn("class1", null, undefined, "", false, "class2")).toBe(
      "class1 class2"
    );
  });

  it("preserves important modifiers", () => {
    const result = cn("!text-red-500", "text-blue-500");
    expect(result).toContain("!text-red-500");
  });

  it("handles arbitrary values", () => {
    expect(cn("bg-[#ff0000]", "bg-[#0000ff]")).toBe("bg-[#0000ff]");
  });

  it("handles opacity modifiers", () => {
    expect(cn("bg-red-500/50", "bg-red-500/75")).toBe("bg-red-500/75");
  });

  it("returns string type", () => {
    const result = cn("class1");
    expect(typeof result).toBe("string");
  });

  it("handles large number of classes", () => {
    const classes = Array.from({ length: 100 }, (_, i) => `class${i}`);
    const result = cn(...classes);
    expect(result).toContain("class0");
    expect(result).toContain("class99");
  });

  // Edge case: Extremely large number of classes
  it("handles extremely large number of classes", () => {
    const classes = Array.from({ length: 10000 }, (_, i) => `class${i}`);
    const result = cn(...classes);
    expect(result).toContain("class0");
    expect(result).toContain("class9999");
    expect(typeof result).toBe("string");
  });

  // Edge case: Deeply nested arrays
  it("handles deeply nested arrays", () => {
    const nested = [[["class1", "class2"]], "class3"];
    const result = cn(nested);
    expect(result).toBe("class1 class2 class3");
  });

  // Edge case: Circular references (should not crash)
  it("handles circular references gracefully", () => {
    const obj: any = { class1: true };
    obj.self = obj; // Circular reference
    expect(() => cn(obj)).not.toThrow();
  });

  // Edge case: Invalid input types
  it("handles invalid input types", () => {
    expect(() => cn(null as any)).not.toThrow();
    expect(() => cn(undefined as any)).not.toThrow();
    expect(() => cn(123 as any)).not.toThrow();
    expect(() => cn({} as any)).not.toThrow();
    expect(() => cn(Symbol("test") as any)).not.toThrow();
  });

  // Edge case: Mixed valid and deeply invalid inputs
  it("handles mixed valid and deeply invalid inputs", () => {
    const result = cn(
      "class1",
      null,
      undefined,
      { class2: true },
      [null, "class3", undefined],
      123,
      { toString: () => "class4" }
    );
    expect(result).toContain("class1");
    expect(result).toContain("class2");
    expect(result).toContain("class3");
    expect(result).toContain("toString");
  });

  // Edge case: Classes with extreme lengths
  it("handles classes with extreme lengths", () => {
    const longClass = "a".repeat(10000);
    const result = cn(longClass);
    expect(result).toBe(longClass);
    expect(result.length).toBe(10000);
  });

  // Edge case: Many conflicting Tailwind classes
  it("handles many conflicting Tailwind classes", () => {
    const conflicting = Array.from({ length: 100 }, (_, i) => `px-${i}`);
    const result = cn(...conflicting);
    expect(result).toMatch(/^px-\d+$/); // Should contain only one px-* class
  });

  // Edge case: Empty objects and arrays
  it("handles empty objects and arrays", () => {
    expect(cn({}, [])).toBe("");
    expect(cn({})).toBe("");
    expect(cn([])).toBe("");
  });

  // Edge case: Functions as values
  it("handles functions as conditional values", () => {
    expect(cn({ class1: () => true, class2: () => false })).toBe(
      "class1 class2"
    );
  });

  // Edge case: Non-string keys in objects
  it("handles non-string keys in objects", () => {
    const obj = { class1: true, [Symbol("test")]: true, 123: true };
    const result = cn(obj);
    expect(result).toContain("class1");
    // Non-string keys should be ignored
  });
});
