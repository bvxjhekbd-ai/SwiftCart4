import { Search, Store, Wallet, History, ShoppingBag, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { CartSheet } from "./CartSheet";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface HeaderProps {
  onPurchase?: (productId: string, price: number) => void;
}

export function Header({ onPurchase }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <a className="flex items-center gap-2" data-testid="link-home">
            <Store className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Digital Market
            </span>
          </a>
        </Link>

        <div className="flex flex-1 items-center gap-4 md:gap-6">
          <form className="hidden flex-1 md:block md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isAuthenticated && <CartSheet />}

          {isAuthenticated ? (
            <>
              <Link href="/deposit">
                <Button variant="outline" className="gap-2" data-testid="button-wallet">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    ₦{(user?.walletBalance || 0).toLocaleString()}
                  </span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" data-testid="button-account-menu">
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.isAdmin && (
                    <>
                      <Link href="/admin">
                        <DropdownMenuItem data-testid="menu-item-admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <Link href="/purchases">
                    <DropdownMenuItem data-testid="menu-item-purchases">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Purchases
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/transactions">
                    <DropdownMenuItem data-testid="menu-item-transactions">
                      <History className="mr-2 h-4 w-4" />
                      Transaction History
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/deposit">
                    <DropdownMenuItem data-testid="menu-item-deposit">
                      <Wallet className="mr-2 h-4 w-4" />
                      Deposit Funds
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" data-testid="menu-item-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login">Login / Sign Up</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
