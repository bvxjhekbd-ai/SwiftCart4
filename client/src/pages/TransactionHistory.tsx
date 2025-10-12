import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function TransactionHistory() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View all deposits and purchases</p>
      </div>

      {!transactions || transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <Card key={transaction.id} data-testid={`transaction-${transaction.id}`}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-4">
                  {transaction.type === "deposit" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <ArrowDownCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                      <ArrowUpCircle className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold capitalize">{transaction.type}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      transaction.type === "deposit" ? "text-green-500" : ""
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}₦
                    {Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  <Badge
                    variant={transaction.status === "completed" ? "default" : "secondary"}
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
