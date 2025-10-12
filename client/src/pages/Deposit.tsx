import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Wallet, CreditCard } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Deposit() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

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

  const depositMutation = useMutation({
    mutationFn: async (depositAmount: number) => {
      // Initialize deposit
      const response = await apiRequest("POST", "/api/deposits/initialize", {
        amount: depositAmount,
      });

      const { reference, amount: paymentAmount } = await response.json();

      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      
      if (!paystackPublicKey) {
        toast({
          title: "Configuration Error",
          description: "Payment system not configured. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Check if Paystack script is loaded
      if (!(window as any).PaystackPop) {
        toast({
          title: "Payment System Error",
          description: "Paystack payment system is not loaded. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      // Initialize Paystack popup
      const handler = (window as any).PaystackPop.setup({
        key: paystackPublicKey,
        email: (user as any)?.email || "user@example.com",
        amount: paymentAmount * 100, // Paystack expects amount in kobo
        ref: reference,
        onClose: function() {
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment",
          });
        },
        callback: function(response: any) {
          // Verify payment
          apiRequest("POST", "/api/deposits/verify", {
            reference: response.reference,
            amount: depositAmount,
          })
            .then((verifyResponse) => verifyResponse.json())
            .then((data) => {
              toast({
                title: "Deposit Successful",
                description: `₦${depositAmount.toLocaleString()} added to your wallet`,
              });

              queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
              setAmount("");
            })
            .catch((error) => {
              toast({
                title: "Verification Failed",
                description: "Payment verification failed. Contact support.",
                variant: "destructive",
              });
            });
        },
      });

      handler.openIframe();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to initialize deposit",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    const depositAmount = parseInt(amount);
    if (isNaN(depositAmount) || depositAmount < 100 || depositAmount > 1000000) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be between ₦100 and ₦1,000,000",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(depositAmount);
  };

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Deposit Funds</h1>
        <p className="text-muted-foreground">Add money to your wallet</p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="text-wallet-balance">
              ₦{(user as any)?.walletBalance?.toLocaleString() || "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Amount</CardTitle>
          <CardDescription>
            Minimum: ₦100, Maximum: ₦1,000,000
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              max="1000000"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-deposit-amount"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setAmount("1000")}
              data-testid="button-quick-1000"
            >
              ₦1,000
            </Button>
            <Button
              variant="outline"
              onClick={() => setAmount("5000")}
              data-testid="button-quick-5000"
            >
              ₦5,000
            </Button>
            <Button
              variant="outline"
              onClick={() => setAmount("10000")}
              data-testid="button-quick-10000"
            >
              ₦10,000
            </Button>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleDeposit}
            disabled={depositMutation.isPending}
            data-testid="button-deposit"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {depositMutation.isPending ? "Processing..." : "Deposit with Paystack"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
