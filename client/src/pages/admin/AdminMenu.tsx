import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MenuSquare, Plus, Edit, Trash2 } from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  preparationTime: number;
  image: string;
  isAvailable: boolean;
  restaurantId: string;
  restaurantName: string;
};

type Restaurant = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  restaurantId: string;
};

export default function AdminMenu() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");

  const [menuItemForm, setMenuItemForm] = useState({
    name: "", description: "", price: "", categoryId: "", preparationTime: "", image: "", isAvailable: true
  });

  const [menuItemDialog, setMenuItemDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as MenuItem | null});
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; id: string; type: string; name: string}>({
    open: false, id: "", type: "", name: ""
  });

  // Check authorization
  if (!isAuthenticated || user?.role !== "admin") {
    return <div className="text-center py-8">Unauthorized access</div>;
  }

  // Data fetching
  const { data: restaurants = [] } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const response = await fetch("/api/restaurants");
      if (!response.ok) throw new Error("Failed to fetch restaurants");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories", selectedRestaurant],
    queryFn: async () => {
      if (!selectedRestaurant) return [];
      const response = await fetch(`/api/restaurants/${selectedRestaurant}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
    enabled: !!selectedRestaurant,
  });

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["admin-menu-items", selectedRestaurant],
    queryFn: async () => {
      if (!selectedRestaurant) return [];
      const response = await fetch(`/api/restaurants/${selectedRestaurant}/menu`);
      if (!response.ok) throw new Error("Failed to fetch menu items");
      return response.json();
    },
    enabled: !!selectedRestaurant,
  });

  // Mutations
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/restaurants/${selectedRestaurant}/menu`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items", selectedRestaurant] });
      setMenuItemDialog({open: false, mode: "create", data: null});
      setMenuItemForm({name: "", description: "", price: "", categoryId: "", preparationTime: "", image: "", isAvailable: true});
      toast({ title: "Success", description: "Menu item created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/menu-items/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items", selectedRestaurant] });
      setMenuItemDialog({open: false, mode: "edit", data: null});
      setMenuItemForm({name: "", description: "", price: "", categoryId: "", preparationTime: "", image: "", isAvailable: true});
      toast({ title: "Success", description: "Menu item updated successfully!" });
    },
    onError: handleMutationError,
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/menu-items/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items", selectedRestaurant] });
      setDeleteDialog({open: false, id: "", type: "", name: ""});
      toast({ title: "Success", description: "Menu item deleted successfully!" });
    },
    onError: handleMutationError,
  });

  function handleMutationError(error: any) {
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
      title: "Error",
      description: "An error occurred. Please try again.",
      variant: "destructive",
    });
  }

  const handleMenuItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!menuItemForm.name.trim()) {
      toast({ title: "Error", description: "Menu item name is required", variant: "destructive" });
      return;
    }

    if (!menuItemForm.categoryId) {
      toast({ title: "Error", description: "Category is required", variant: "destructive" });
      return;
    }

    const data = {
      name: menuItemForm.name.trim(),
      description: menuItemForm.description.trim(),
      price: parseFloat(menuItemForm.price),
      categoryId: menuItemForm.categoryId,
      preparationTime: parseInt(menuItemForm.preparationTime) || 15,
      image: menuItemForm.image.trim(),
      isAvailable: menuItemForm.isAvailable
    };

    if (menuItemDialog.mode === "create") {
      createMenuItemMutation.mutate(data);
    } else {
      updateMenuItemMutation.mutate({ ...data, id: menuItemDialog.data?.id });
    }
  };

  const openEditMenuItem = (menuItem: MenuItem) => {
    setMenuItemForm({
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price.toString(),
      categoryId: menuItem.categoryId,
      preparationTime: menuItem.preparationTime.toString(),
      image: menuItem.image,
      isAvailable: menuItem.isAvailable
    });
    setMenuItemDialog({open: true, mode: "edit", data: menuItem});
  };

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialog({open: true, id, type: "menu-item", name});
  };

  const confirmDelete = () => {
    deleteMenuItemMutation.mutate(deleteDialog.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
      </div>

      {/* Restaurant Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="restaurant-select">Select Restaurant:</Label>
            <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
              <SelectTrigger className="w-64" data-testid="select-restaurant">
                <SelectValue placeholder="Choose a restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant: Restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedRestaurant && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Menu Items</h2>
            <Dialog open={menuItemDialog.open} onOpenChange={(open) => setMenuItemDialog({...menuItemDialog, open})}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setMenuItemForm({name: "", description: "", price: "", categoryId: "", preparationTime: "", image: "", isAvailable: true});
                  setMenuItemDialog({open: true, mode: "create", data: null});
                }} data-testid="button-add-menu-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {menuItemDialog.mode === "create" ? "Add New Menu Item" : "Edit Menu Item"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMenuItemSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input 
                      id="name"
                      value={menuItemForm.name}
                      onChange={(e) => setMenuItemForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      data-testid="input-menu-item-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input 
                      id="price"
                      type="number"
                      step="0.01"
                      value={menuItemForm.price}
                      onChange={(e) => setMenuItemForm(prev => ({ ...prev, price: e.target.value }))}
                      required
                      data-testid="input-menu-item-price"
                    />
                  </div>
                  {/* More form fields would be here */}
                  <DialogFooter className="col-span-2">
                    <Button type="submit" disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending} data-testid="button-save-menu-item">
                      {(createMenuItemMutation.isPending || updateMenuItemMutation.isPending) ? "Saving..." : "Save Menu Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MenuSquare className="w-5 h-5" />
                Menu Items ({menuItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item: MenuItem) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.categoryName}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch checked={item.isAvailable} disabled />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditMenuItem(item)}
                              data-testid={`button-edit-menu-item-${item.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(item.id, item.name)}
                              data-testid={`button-delete-menu-item-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({...deleteDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteDialog.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}