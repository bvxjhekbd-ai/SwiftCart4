import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HealthCheck {
  status: string;
  timestamp: string;
  environment: string;
  databaseConfigured: boolean;
  supabaseConfigured: boolean;
  supabaseServiceRoleConfigured: boolean;
}

export default function ApiDiagnostic() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authTest, setAuthTest] = useState<{ success: boolean; message: string } | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to API");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setAuthTest(null);
    try {
      const response = await fetch("/api/auth/user");
      if (response.status === 401) {
        setAuthTest({ success: true, message: "Auth endpoint working (401 Unauthorized - expected when not logged in)" });
      } else if (response.ok) {
        setAuthTest({ success: true, message: "Auth endpoint working (User data retrieved)" });
      } else {
        throw new Error(`Auth returned ${response.status}`);
      }
    } catch (err: any) {
      setAuthTest({ success: false, message: `Auth endpoint failed: ${err.message}` });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>API Diagnostic Tool</CardTitle>
          <CardDescription>
            Check if your backend API is working correctly on Vercel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Check */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Health Check</h3>
              <Button
                onClick={checkHealth}
                disabled={loading}
                size="sm"
                variant="outline"
                data-testid="button-refresh-health"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>API Connection Failed:</strong> {error}
                  <br />
                  <br />
                  This means your backend API is not accessible. Check:
                  <ul className="list-disc list-inside mt-2">
                    <li>Is the Vercel deployment complete?</li>
                    <li>Check Vercel logs for build/runtime errors</li>
                    <li>Verify the api/[...route].ts file was deployed</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {health && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">API is accessible</span>
                  <Badge variant="outline">{health.environment}</Badge>
                </div>

                <div className="grid gap-2 pl-7">
                  <StatusItem
                    label="Database Connection"
                    status={health.databaseConfigured}
                    successMessage="DATABASE_URL is configured"
                    errorMessage="DATABASE_URL is missing"
                  />
                  <StatusItem
                    label="Supabase Auth"
                    status={health.supabaseConfigured}
                    successMessage="SUPABASE_URL and SUPABASE_ANON_KEY configured"
                    errorMessage="Supabase environment variables missing"
                  />
                  <StatusItem
                    label="Supabase Service Role"
                    status={health.supabaseServiceRoleConfigured}
                    successMessage="SUPABASE_SERVICE_ROLE_KEY configured"
                    errorMessage="SUPABASE_SERVICE_ROLE_KEY is missing (required for auth)"
                  />
                </div>

                <p className="text-sm text-muted-foreground pl-7">
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Auth Test */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Authentication Test</h3>
              <Button
                onClick={testAuth}
                size="sm"
                variant="outline"
                data-testid="button-test-auth"
              >
                Test Auth Endpoint
              </Button>
            </div>

            {authTest && (
              <Alert variant={authTest.success ? "default" : "destructive"}>
                {authTest.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{authTest.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instructions */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Common Issues & Solutions</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">❌ API Connection Failed</p>
                <p className="text-muted-foreground">
                  • Check Vercel Function logs in your dashboard
                  <br />
                  • Ensure <code className="bg-muted px-1 rounded">api/[...route].ts</code> exists in deployment
                  <br />
                  • Verify build completed successfully
                </p>
              </div>
              <div>
                <p className="font-medium">❌ Missing Environment Variables</p>
                <p className="text-muted-foreground">
                  • Go to Vercel Project Settings → Environment Variables
                  <br />
                  • Add all required variables (see VERCEL_DEPLOYMENT.md)
                  <br />
                  • Redeploy after adding variables
                </p>
              </div>
              <div>
                <p className="font-medium">❌ Login works but immediately logs out</p>
                <p className="text-muted-foreground">
                  • This means SUPABASE_SERVICE_ROLE_KEY is missing
                  <br />
                  • The /api/auth/user endpoint cannot verify tokens without it
                  <br />
                  • Add the service role key and redeploy
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusItem({
  label,
  status,
  successMessage,
  errorMessage,
}: {
  label: string;
  status: boolean;
  successMessage: string;
  errorMessage: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {status ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
      ) : (
        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
      )}
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-muted-foreground">
          {status ? successMessage : errorMessage}
        </p>
      </div>
    </div>
  );
}
