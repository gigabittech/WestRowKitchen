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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Ticket, Plus, Edit, Trash2 } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  minimumOrder: number;
  maxUsage: number;
  currentUsage: number;
  userLimit: number;
  startDate: string;
  endDate: string;
  restaurantId?: string;
  restaurantName?: string;
  isActive: boolean;
};

type Restaurant = {
  id: string;
  name: string;
};

export default function AdminCoupons() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [couponForm, setCouponForm] = useState({
    code: "", title: "", description: "", discountType: "percentage" as "percentage" | "fixed" | "free_delivery",
    discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "",
    startDate: "", endDate: "", restaurantId: "", isActive: true
  });

  const [couponDialog, setCouponDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as Coupon | null});
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; id: string; type: string; name: string}>({
    open: false, id: "", type: "", name: ""
  });

  // Check authorization
  if (!isAuthenticated || user?.role !== "admin") {
    return <div className="text-center py-8">Unauthorized access</div>;
  }

  // Data fetching
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const response = await fetch("/api/admin/coupons");
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json();
    },
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const response = await fetch("/api/restaurants");
      if (!response.ok) throw new Error("Failed to fetch restaurants");
      return response.json();
    },
  });

  // Mutations
  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/coupons", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setCouponDialog({open: false, mode: "create", data: null});
      setCouponForm({
        code: "", title: "", description: "", discountType: "percentage",
        discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "",
        startDate: "", endDate: "", restaurantId: "", isActive: true
      });
      toast({ title: "Success", description: "Coupon created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/coupons/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setCouponDialog({open: false, mode: "edit", data: null});
      setCouponForm({
        code: "", title: "", description: "", discountType: "percentage",
        discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "",
        startDate: "", endDate: "", restaurantId: "", isActive: true
      });
      toast({ title: "Success", description: "Coupon updated successfully!" });
    },
    onError: handleMutationError,
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/coupons/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setDeleteDialog({open: false, id: "", type: "", name: ""});
      toast({ title: "Success", description: "Coupon deleted successfully!" });
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

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponForm.code.trim()) {
      toast({ title: "Error", description: "Coupon code is required", variant: "destructive" });
      return;
    }

    const data = {
      code: couponForm.code.toUpperCase().trim(),
      title: couponForm.title.trim(),
      description: couponForm.description.trim(),
      discountType: couponForm.discountType,
      discountValue: couponForm.discountType !== "free_delivery" ? parseFloat(couponForm.discountValue) : 0,
      minimumOrder: couponForm.minimumOrder ? parseFloat(couponForm.minimumOrder) : 0,
      maxUsage: couponForm.maxUsage ? parseInt(couponForm.maxUsage) : null,
      userLimit: couponForm.userLimit ? parseInt(couponForm.userLimit) : 1,
      startDate: couponForm.startDate,
      endDate: couponForm.endDate,
      restaurantId: couponForm.restaurantId || null,
      isActive: couponForm.isActive
    };

    if (couponDialog.mode === "create") {
      createCouponMutation.mutate(data);
    } else {
      updateCouponMutation.mutate({ ...data, id: couponDialog.data?.id });
    }
  };

  const openEditCoupon = (coupon: Coupon) => {
    setCouponForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discountType as "percentage" | "fixed" | "free_delivery",
      discountValue: coupon.discountValue?.toString() || "",
      minimumOrder: coupon.minimumOrder?.toString() || "",
      maxUsage: coupon.maxUsage?.toString() || "",
      userLimit: coupon.userLimit?.toString() || "",
      startDate: coupon.startDate.slice(0, 16),
      endDate: coupon.endDate.slice(0, 16),
      restaurantId: coupon.restaurantId || "",
      isActive: coupon.isActive
    });
    setCouponDialog({open: true, mode: "edit", data: coupon});
  };

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialog({open: true, id, type: "coupon", name});
  };

  const confirmDelete = () => {
    deleteCouponMutation.mutate(deleteDialog.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog open={couponDialog.open} onOpenChange={(open) => setCouponDialog({...couponDialog, open})}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setCouponForm({
                code: "", title: "", description: "", discountType: "percentage",
                discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "",
                startDate: "", endDate: "", restaurantId: "", isActive: true
              });
              setCouponDialog({open: true, mode: "create", data: null});
            }} data-testid="button-add-coupon">
              <Plus className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {couponDialog.mode === "create" ? "Add New Coupon" : "Edit Coupon"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCouponSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input 
                  id="code"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="WELCOME20"
                  required
                  data-testid="input-coupon-code"
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  value={couponForm.title}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Welcome Discount"
                  required
                  data-testid="input-coupon-title"
                />
              </div>
              {/* More form fields would be here */}
              <DialogFooter className="col-span-2">
                <Button type="submit" disabled={createCouponMutation.isPending || updateCouponMutation.isPending} data-testid="button-save-coupon">
                  {(createCouponMutation.isPending || updateCouponMutation.isPending) ? "Saving..." : "Save Coupon"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Coupons ({coupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon: Coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono">{coupon.code}</TableCell>
                  <TableCell className="font-medium">{coupon.title}</TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}%` :
                     coupon.discountType === "fixed" ? `$${coupon.discountValue}` :
                     "Free Delivery"}
                  </TableCell>
                  <TableCell>
                    {coupon.currentUsage || 0} / {coupon.maxUsage || "∞"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditCoupon(coupon)}
                        data-testid={`button-edit-coupon-${coupon.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(coupon.id, coupon.code)}
                        data-testid={`button-delete-coupon-${coupon.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({...deleteDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete coupon "{deleteDialog.name}". This action cannot be undone.
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