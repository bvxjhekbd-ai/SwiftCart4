import { ThemeProvider } from "../ThemeProvider";
import { Hero } from "../Hero";

export default function HeroExample() {
  return (
    <ThemeProvider>
      <Hero />
    </ThemeProvider>
  );
}
