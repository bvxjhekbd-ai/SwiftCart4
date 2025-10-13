import { ThemeProvider } from "../ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "../AdminSidebar";

export default function AdminSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ThemeProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-[400px] w-full">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="mt-2 text-muted-foreground">
              Select an item from the sidebar
            </p>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
