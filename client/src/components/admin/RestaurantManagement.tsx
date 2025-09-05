import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Truck,
  MapPin,
  Clock,
  ImageIcon,
  CheckCircle,
  XCircle
} from "lucide-react";
import { LogoUploader } from "@/components/LogoUploader";
import type { Restaurant, User } from "@shared/schema";

interface RestaurantManagementProps {
  user: User;
}

export default function RestaurantManagement({ user }: RestaurantManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to get default restaurant form
  const getDefaultRestaurantForm = () => ({
    name: "", description: "", cuisine: "", deliveryTime: "", deliveryFee: "", 
    minimumOrder: "", address: "", phone: "", image: "", rating: "", reviewCount: "",
    isOpen: true, // Restaurant open/closed status
    isTemporarilyClosed: false, // Temporary closure status
    timezone: "America/New_York", // Restaurant timezone
    operatingHoursMode: "default" as "default" | "advanced",
    defaultOpen: "09:00", defaultClose: "21:00",
    operatingHours: {
      monday: { open: "09:00", close: "21:00", closed: false },
      tuesday: { open: "09:00", close: "21:00", closed: false },
      wednesday: { open: "09:00", close: "21:00", closed: false },
      thursday: { open: "09:00", close: "21:00", closed: false },
      friday: { open: "09:00", close: "21:00", closed: false },
      saturday: { open: "09:00", close: "21:00", closed: false },
      sunday: { open: "09:00", close: "21:00", closed: false },
    }
  });

  // State management
  const [restaurantForm, setRestaurantForm] = useState(getDefaultRestaurantForm());
  const [restaurantDialog, setRestaurantDialog] = useState({
    open: false, 
    mode: "create" as "create" | "edit", 
    data: null as Restaurant | null
  });

  // Data fetching
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
    enabled: !!user?.isAdmin,
  });

  // Error handler
  const handleMutationError = (error: any) => {
    console.error("Mutation error:", error);
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
  };

  // Mutations
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/restaurants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setRestaurantDialog({open: false, mode: "create", data: null});
      setRestaurantForm(getDefaultRestaurantForm());
      toast({ title: "Success", description: "Restaurant created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async ({id, data}: {id: string, data: any}) => {
      const response = await apiRequest("PUT", `/api/restaurants/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setRestaurantDialog({open: false, mode: "create", data: null});
      setRestaurantForm(getDefaultRestaurantForm());
      toast({ title: "Success", description: "Restaurant updated successfully!" });
    },
    onError: handleMutationError,
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/restaurants/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "Success", description: "Restaurant deleted successfully!" });
    },
    onError: handleMutationError,
  });

  // Restaurant status toggle mutation
  const toggleRestaurantStatusMutation = useMutation({
    mutationFn: async ({ restaurantId, isOpen }: { restaurantId: string; isOpen: boolean }) => {
      const response = await apiRequest("PUT", `/api/restaurants/${restaurantId}/status`, { isOpen });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "Success", description: "Restaurant status updated!" });
    },
    onError: handleMutationError,
  });

  // Handlers
  const openEditRestaurant = (restaurant: Restaurant) => {
    // Get existing operating hours or use default structure
    const existingHours = restaurant.operatingHours || {
      monday: { open: "09:00", close: "21:00", closed: false },
      tuesday: { open: "09:00", close: "21:00", closed: false },
      wednesday: { open: "09:00", close: "21:00", closed: false },
      thursday: { open: "09:00", close: "21:00", closed: false },
      friday: { open: "09:00", close: "21:00", closed: false },
      saturday: { open: "09:00", close: "21:00", closed: false },
      sunday: { open: "09:00", close: "21:00", closed: false }
    };

    setRestaurantForm({
      name: restaurant.name,
      description: restaurant.description || "",
      cuisine: restaurant.cuisine,
      deliveryTime: restaurant.deliveryTime || "",
      deliveryFee: restaurant.deliveryFee || "",
      minimumOrder: restaurant.minimumOrder || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      image: restaurant.image || "",
      rating: restaurant.rating?.toString() || "0",
      reviewCount: restaurant.reviewCount?.toString() || "0",
      isOpen: restaurant.isOpen ?? true,
      isTemporarilyClosed: restaurant.isTemporarilyClosed ?? false,
      timezone: restaurant.timezone || "America/New_York",
      operatingHoursMode: "advanced",
      defaultOpen: "09:00",
      defaultClose: "21:00", 
      operatingHours: existingHours
    });
    setRestaurantDialog({open: true, mode: "edit", data: restaurant});
  };

  const handleRestaurantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = { ...restaurantForm };
    
    // Convert rating and reviewCount to numbers
    formData.rating = parseFloat(formData.rating) || 0;
    formData.reviewCount = parseInt(formData.reviewCount) || 0;
    
    // Remove temporary form fields
    delete formData.operatingHoursMode;
    delete formData.defaultOpen;
    delete formData.defaultClose;

    if (restaurantDialog.mode === "edit" && restaurantDialog.data) {
      updateRestaurantMutation.mutate({ id: restaurantDialog.data.id, data: formData });
    } else {
      createRestaurantMutation.mutate(formData);
    }
  };

  const toggleRestaurantStatus = (restaurantId: string, isOpen: boolean) => {
    toggleRestaurantStatusMutation.mutate({ restaurantId, isOpen });
  };

  const confirmDeleteRestaurant = (id: string) => {
    if (window.confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) {
      deleteRestaurantMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Restaurant Management
        </CardTitle>
        <Dialog open={restaurantDialog.open} onOpenChange={(open) => setRestaurantDialog(prev => ({...prev, open}))}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setRestaurantForm(getDefaultRestaurantForm());
                setRestaurantDialog({open: true, mode: "create", data: null});
              }}
              data-testid="button-add-restaurant"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {restaurantDialog.mode === "edit" ? "Edit Restaurant" : "Add New Restaurant"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleRestaurantSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Store className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Restaurant Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="name"
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter restaurant name"
                      required
                      data-testid="input-restaurant-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cuisine" className="text-sm font-medium">
                      Cuisine Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={restaurantForm.cuisine} onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, cuisine: value }))}>
                      <SelectTrigger data-testid="select-restaurant-cuisine">
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Mexican">Mexican</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Indian">Indian</SelectItem>
                        <SelectItem value="American">American</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Thai">Thai</SelectItem>
                        <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                        <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="Fast Food">Fast Food</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea 
                    id="description"
                    value={restaurantForm.description}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the restaurant"
                    rows={3}
                    data-testid="input-restaurant-description"
                  />
                </div>
              </div>

              {/* Restaurant Status & Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Settings className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Restaurant Status & Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Switch
                        checked={restaurantForm.isOpen}
                        onCheckedChange={(checked) => setRestaurantForm(prev => ({ ...prev, isOpen: checked }))}
                        data-testid="switch-restaurant-open"
                      />
                      Restaurant Open
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Controls if the restaurant accepts orders
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Switch
                        checked={restaurantForm.isTemporarilyClosed}
                        onCheckedChange={(checked) => setRestaurantForm(prev => ({ ...prev, isTemporarilyClosed: checked }))}
                        data-testid="switch-restaurant-temporarily-closed"
                      />
                      Temporarily Closed
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Mark as temporarily closed for maintenance
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium">
                      Timezone
                    </Label>
                    <Select value={restaurantForm.timezone} onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger data-testid="select-restaurant-timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (Chicago)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (Denver)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                        <SelectItem value="Asia/Dhaka">BST (Dhaka)</SelectItem>
                        <SelectItem value="Asia/Tokyo">JST (Tokyo)</SelectItem>
                        <SelectItem value="Europe/London">GMT (London)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Restaurant's local timezone for operating hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address"
                      value={restaurantForm.address}
                      onChange={(e) => setRestaurantForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address"
                      rows={2}
                      data-testid="input-restaurant-address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      data-testid="input-restaurant-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Restaurant Logo</h3>
                </div>
                
                <LogoUploader
                  currentImage={restaurantForm.image}
                  onImageChange={(imageUrl) => setRestaurantForm(prev => ({ ...prev, image: imageUrl }))}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRestaurantDialog({open: false, mode: "create", data: null})}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRestaurantMutation.isPending || updateRestaurantMutation.isPending}
                  data-testid="button-save-restaurant"
                >
                  {(createRestaurantMutation.isPending || updateRestaurantMutation.isPending) ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    restaurantDialog.mode === "edit" ? "Update Restaurant" : "Create Restaurant"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {restaurantsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading restaurants...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((restaurant: Restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {restaurant.image && (
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {restaurant.address}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{restaurant.cuisine}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {restaurant.isOpen ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Closed
                        </Badge>
                      )}
                      {restaurant.isTemporarilyClosed && (
                        <Badge variant="secondary">Temp. Closed</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{restaurant.rating || 0}</span>
                      <span className="text-muted-foreground">({restaurant.reviewCount || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRestaurantStatus(restaurant.id, !restaurant.isOpen)}
                        data-testid={`button-toggle-status-${restaurant.id}`}
                      >
                        {restaurant.isOpen ? "Close" : "Open"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditRestaurant(restaurant)}
                        data-testid={`button-edit-restaurant-${restaurant.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDeleteRestaurant(restaurant.id)}
                        data-testid={`button-delete-restaurant-${restaurant.id}`}
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
  );
}