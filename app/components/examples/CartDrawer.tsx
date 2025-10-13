import { ThemeProvider } from "../ThemeProvider";
import { CartDrawer } from "../CartDrawer";

export default function CartDrawerExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <p className="mb-4 text-muted-foreground">Click the cart icon to open:</p>
        <CartDrawer />
      </div>
    </ThemeProvider>
  );
}
