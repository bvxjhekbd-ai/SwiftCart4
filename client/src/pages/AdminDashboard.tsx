import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProductUploadForm } from "@/components/ProductUploadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";

// todo: remove mock functionality
const stats = [
  {
    title: "Total Products",
    value: "24",
    icon: Package,
    trend: "+12%",
  },
  {
    title: "Total Orders",
    value: "156",
    icon: ShoppingBag,
    trend: "+8%",
  },
  {
    title: "Revenue",
    value: "₦2,450,000",
    icon: DollarSign,
    trend: "+23%",
  },
  {
    title: "Growth",
    value: "+18%",
    icon: TrendingUp,
    trend: "This month",
  },
];

export default function AdminDashboard() {
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
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your products and track performance
              </p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.trend} from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <ProductUploadForm />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
