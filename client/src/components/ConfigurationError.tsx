import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/supabase";

export function ConfigurationError() {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <Alert variant="destructive" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Missing required environment variables. Please configure the following in your Vercel dashboard:
        </p>
        <ul className="list-disc list-inside space-y-1 font-mono text-sm">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="mt-2 text-sm">
          Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
        </p>
      </AlertDescription>
    </Alert>
  );
}
