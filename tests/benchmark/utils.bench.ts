import { Bench } from "tinybench";
import { cn } from "../../lib/utils";

const bench = new Bench({
  name: "Utility Functions Benchmarks",
  time: 1000,
});

// Utility Functions Benchmarks
// Thresholds: < 1ms for all operations (cn function should be very fast)

bench
  .add("cn - single class", () => {
    cn("bg-red-500");
  })
  .add("cn - multiple classes", () => {
    cn("bg-red-500", "text-white", "p-4");
  })
  .add("cn - with conditional classes", () => {
    cn("bg-red-500", true && "text-white", false && "hidden");
  })
  .add("cn - with falsy values", () => {
    cn("bg-red-500", null, undefined, "", 0, false);
  })
  .add("cn - large number of classes (10)", () => {
    cn(
      "bg-red-500",
      "text-white",
      "p-4",
      "m-2",
      "rounded",
      "shadow",
      "hover:bg-red-600",
      "focus:outline-none",
      "transition",
      "duration-200"
    );
  })
  .add("cn - large number of classes (20)", () => {
    cn(
      "bg-red-500",
      "text-white",
      "p-4",
      "m-2",
      "rounded",
      "shadow",
      "hover:bg-red-600",
      "focus:outline-none",
      "transition",
      "duration-200",
      "w-full",
      "h-10",
      "flex",
      "items-center",
      "justify-center",
      "gap-2",
      "font-medium",
      "text-sm",
      "border",
      "border-gray-300"
    );
  })
  .add("cn - with Tailwind responsive classes", () => {
    cn("bg-red-500", "md:bg-blue-500", "lg:bg-green-500");
  })
  .add("cn - complex conditional logic", () => {
    const isActive = Math.random() > 0.5;
    const isDisabled = Math.random() > 0.5;
    const size = Math.random() > 0.5 ? "large" : "small";

    cn(
      "btn",
      isActive && "active",
      isDisabled && "disabled",
      size === "large" && "btn-large",
      size === "small" && "btn-small"
    );
  });

export default bench;

// Run benchmarks if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bench.run().then(() => {
    console.table(bench.table());
  });
}
