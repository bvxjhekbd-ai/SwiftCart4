import { ThemeProvider } from "../ThemeProvider";
import { ThemeToggle } from "../ThemeToggle";

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="flex items-center gap-4 p-8">
        <span>Toggle theme:</span>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}
