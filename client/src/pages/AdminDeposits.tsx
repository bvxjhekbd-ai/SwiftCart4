import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Calendar, User } from "lucide-react";
import type { Transaction, User as UserType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type DepositWithUser = Transaction & { user: UserType };

export default function AdminDeposits() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: deposits, isLoading } = useQuery<DepositWithUser[]>({
    queryKey: ["/api/admin?action=all-deposits"],
    enabled: isAuthenticated && user?.isAdmin === true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin?action=update-transaction-status&id=${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status Updated", description: "Transaction status has been updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin?action=all-deposits"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, user, setLocation]);

  if (authLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">All Deposits</h1>
              <p className="text-muted-foreground">
                View and manage all user deposits
              </p>
            </div>

            <div className="space-y-2">
              {deposits && deposits.length > 0 ? (
                deposits.map((deposit) => (
                  <Card key={deposit.id}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {deposit.user.email || deposit.user.firstName || 'Unknown User'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {deposit.createdAt ? new Date(deposit.createdAt).toLocaleString() : 'N/A'}
                          </div>
                          {deposit.reference && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Ref: {deposit.reference}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-500">
                            +₦{Math.abs(deposit.amount).toLocaleString()}
                          </p>
                          <Badge variant={deposit.status === "completed" ? "default" : deposit.status === "pending" ? "secondary" : "destructive"}>
                            {deposit.status}
                          </Badge>
                        </div>
                      </div>
                      {deposit.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: deposit.id, status: "completed" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatusMutation.mutate({ id: deposit.id, status: "failed" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex h-32 items-center justify-center">
                    <p className="text-muted-foreground">No deposits found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
