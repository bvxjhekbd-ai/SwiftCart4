import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import type { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminProducts() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    accountUsername: "",
    accountPassword: "",
    accountEmail: "",
    additionalInfo: "",
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin?action=all-products"],
    enabled: isAuthenticated && user?.isAdmin === true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/admin?action=delete-product&id=${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin?action=all-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin?action=stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await apiRequest("PATCH", `/api/admin?action=update-product&id=${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin?action=all-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin?action=stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditDialogOpen(false);
      setProductToEdit(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setEditFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      accountUsername: product.accountUsername,
      accountPassword: product.accountPassword,
      accountEmail: product.accountEmail || "",
      additionalInfo: product.additionalInfo || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;

    const updateData = {
      title: editFormData.title,
      description: editFormData.description,
      price: parseInt(editFormData.price),
      category: editFormData.category,
      accountUsername: editFormData.accountUsername,
      accountPassword: editFormData.accountPassword,
      accountEmail: editFormData.accountEmail || undefined,
      additionalInfo: editFormData.additionalInfo || undefined,
    };

    editMutation.mutate({ id: productToEdit.id, data: updateData });
  };

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      window.location.href = "/";
    }
  }, [isAuthenticated, authLoading, user]);

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
              <h1 className="text-3xl font-bold">Manage Products</h1>
              <p className="text-muted-foreground">
                View and edit all accounts
              </p>
            </div>

            <div className="grid gap-4">
              {products && products.length > 0 ? (
                products.map((product: Product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{product.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mb-4">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">₦{product.price.toLocaleString()}</Badge>
                            <Badge variant="outline">{product.category}</Badge>
                            <Badge variant={product.status === "available" ? "default" : "secondary"}>
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(product)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">Username:</span> {product.accountUsername}
                        </div>
                        <div>
                          <span className="font-semibold">Password:</span> {product.accountPassword}
                        </div>
                        {product.accountEmail && (
                          <div>
                            <span className="font-semibold">Email:</span> {product.accountEmail}
                          </div>
                        )}
                        {product.additionalInfo && (
                          <div>
                            <span className="font-semibold">Additional Info:</span> {product.additionalInfo}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex h-32 items-center justify-center">
                    <p className="text-muted-foreground">No products added yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{productToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-product">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                required
                data-testid="input-edit-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                required
                data-testid="input-edit-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₦)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  required
                  data-testid="input-edit-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  required
                  data-testid="input-edit-category"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Account Username</Label>
              <Input
                id="edit-username"
                value={editFormData.accountUsername}
                onChange={(e) => setEditFormData({ ...editFormData, accountUsername: e.target.value })}
                required
                data-testid="input-edit-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Account Password</Label>
              <Input
                id="edit-password"
                value={editFormData.accountPassword}
                onChange={(e) => setEditFormData({ ...editFormData, accountPassword: e.target.value })}
                required
                data-testid="input-edit-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Account Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.accountEmail}
                onChange={(e) => setEditFormData({ ...editFormData, accountEmail: e.target.value })}
                data-testid="input-edit-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-info">Additional Info (Optional)</Label>
              <Textarea
                id="edit-info"
                value={editFormData.additionalInfo}
                onChange={(e) => setEditFormData({ ...editFormData, additionalInfo: e.target.value })}
                data-testid="input-edit-info"
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={editMutation.isPending}
                data-testid="button-save-edit"
              >
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
