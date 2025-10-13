import { ThemeProvider } from "../ThemeProvider";
import Home from "../../pages/Home";

export default function HomeExample() {
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}
