import { ThemeProvider } from "../ThemeProvider";
import { ProductUploadForm } from "../ProductUploadForm";

export default function ProductUploadFormExample() {
  return (
    <ThemeProvider>
      <div className="max-w-3xl p-8">
        <ProductUploadForm />
      </div>
    </ThemeProvider>
  );
}
