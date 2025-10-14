import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Store, ArrowLeft, User as UserIcon, Mail, Lock, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getAuthHeaders, supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if user is in recovery mode by seeing if they have a recovery token
      const params = new URLSearchParams(window.location.hash.substring(1));
      const type = params.get('type');
      
      if (type === 'recovery' || !session?.access_token) {
        setIsRecoveryMode(true);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const authHeaders = await getAuthHeaders();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (authHeaders.Authorization) {
        headers["Authorization"] = authHeaders.Authorization;
      }

      const response = await fetch("/api/auth?action=update-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isAuthError || response.status === 401) {
          throw new Error("Authentication session missing. Please use the password reset link from your email to reset your password.");
        }
        throw new Error(data.message || "Failed to update password");
      }

      toast({
        title: "Password updated!",
        description: "Your password has been successfully changed. Please use your new password on your next login.",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold">slick logs marketplace</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">My Account</h1>
          <p className="text-muted-foreground">Manage your account information and settings</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <div 
                  className="text-lg font-mono bg-muted p-3 rounded-md"
                  data-testid="text-user-email"
                >
                  {user.email}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Full Name</Label>
                <div className="text-lg" data-testid="text-user-name">
                  {user.firstName} {user.lastName}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Wallet Balance</Label>
                <div className="text-2xl font-bold text-primary" data-testid="text-wallet-balance">
                  ₦{user.walletBalance?.toLocaleString() || 0}
                </div>
              </div>

              {user.isAdmin && (
                <>
                  <Separator />
                  <div className="bg-primary/10 p-3 rounded-md">
                    <p className="text-sm font-medium text-primary">Admin Account</p>
                    <p className="text-sm text-muted-foreground">You have administrative privileges</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRecoveryMode && (
                <Alert className="mb-4" data-testid="alert-recovery-mode">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You're in password recovery mode. Please use the{" "}
                    <button 
                      type="button"
                      className="underline hover:no-underline font-medium"
                      onClick={() => setLocation('/reset-password')}
                      data-testid="button-go-to-reset"
                    >
                      password reset page
                    </button>
                    {" "}to reset your password.
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    data-testid="input-new-password"
                  />
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    data-testid="input-confirm-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isChangingPassword || isRecoveryMode}
                  data-testid="button-change-password"
                >
                  {isChangingPassword ? "Updating password..." : "Change Password"}
                </Button>
                {isRecoveryMode && (
                  <p className="text-sm text-muted-foreground">
                    Password change is disabled in recovery mode
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
