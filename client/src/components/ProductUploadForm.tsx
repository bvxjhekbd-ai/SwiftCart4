import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";

export function ProductUploadForm() {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    accountUsername: "",
    accountPassword: "",
    accountEmail: "",
    additionalInfo: "",
    adminName: "",
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
      setImageUrl(""); // Clear URL if file is uploaded
    };
    reader.readAsDataURL(file);
  };

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/admin?action=create-product", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Created",
        description: "Account has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin?action=stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin?action=all-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        accountUsername: "",
        accountPassword: "",
        accountEmail: "",
        additionalInfo: "",
        adminName: "",
      });
      setImageUrl("");
      setImageFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.category || 
        !formData.accountUsername || !formData.accountPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseInt(formData.price),
      category: formData.category,
      images: imageFile ? [imageFile] : imageUrl ? [imageUrl] : ["https://picsum.photos/400/300"],
      accountUsername: formData.accountUsername,
      accountPassword: formData.accountPassword,
      accountEmail: formData.accountEmail || undefined,
      additionalInfo: formData.additionalInfo || undefined,
      adminName: formData.adminName || undefined,
      status: "available",
    };

    createProductMutation.mutate(productData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="imageFile">Upload Image</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              data-testid="input-image-file"
            />
            {imageFile && (
              <div className="mt-2">
                <img src={imageFile} alt="Preview" className="h-32 w-32 rounded object-cover" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Max size: 5MB. Supported: JPG, PNG, GIF, WebP
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Or Enter Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              data-testid="input-image-url"
              disabled={!!imageFile}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default placeholder image
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              placeholder="e.g., Premium Instagram Account with 10k Followers"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              data-testid="input-product-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail..."
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              data-testid="input-product-description"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₦)</Label>
              <Input
                id="price"
                type="number"
                min="100"
                max="1000000"
                placeholder="100 - 1,000,000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                data-testid="input-product-price"
              />
              <p className="text-xs text-muted-foreground">
                Min: ₦100, Max: ₦1,000,000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Account Credentials</h3>
            
            <div className="space-y-2">
              <Label htmlFor="accountUsername">Username *</Label>
              <Input
                id="accountUsername"
                placeholder="Account username"
                value={formData.accountUsername}
                onChange={(e) =>
                  setFormData({ ...formData, accountUsername: e.target.value })
                }
                data-testid="input-account-username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountPassword">Password *</Label>
              <Input
                id="accountPassword"
                type="text"
                placeholder="Account password"
                value={formData.accountPassword}
                onChange={(e) =>
                  setFormData({ ...formData, accountPassword: e.target.value })
                }
                data-testid="input-account-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountEmail">Email (Optional)</Label>
              <Input
                id="accountEmail"
                type="email"
                placeholder="account@email.com"
                value={formData.accountEmail}
                onChange={(e) =>
                  setFormData({ ...formData, accountEmail: e.target.value })
                }
                data-testid="input-account-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Info (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Recovery email, 2FA status, etc."
                rows={3}
                value={formData.additionalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, additionalInfo: e.target.value })
                }
                data-testid="input-additional-info"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminName">Admin Name (Optional)</Label>
            <Input
              id="adminName"
              placeholder="e.g., oneshotsx, admin1, etc."
              value={formData.adminName}
              onChange={(e) =>
                setFormData({ ...formData, adminName: e.target.value })
              }
              data-testid="input-admin-name"
            />
            <p className="text-xs text-muted-foreground">
              Enter your name or identifier to track who posted this account
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            data-testid="button-submit-product"
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending ? "Adding Account..." : "Add Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
