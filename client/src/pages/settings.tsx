import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import NavigationHeader from "@/components/navigation-header";
import { Settings, User, Bell, Shield, Trash2, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  
  // Password change settings
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: false,
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setProfileSettings({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      
      // Parse notification preferences from user data
      if (user.notificationPreferences) {
        const prefs = typeof user.notificationPreferences === 'string' 
          ? JSON.parse(user.notificationPreferences)
          : user.notificationPreferences;
        setNotificationSettings(prefs);
      }
    }
  }, [user]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Notification preferences mutation
  const notificationMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest("PUT", "/api/user/notifications", preferences);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("PUT", "/api/user/password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordSettings({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      const message = error.message.includes("Current password is incorrect") 
        ? "Current password is incorrect"
        : "Failed to change password. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Account deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/user/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });
      // Redirect to home page
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate({
      firstName: profileSettings.firstName,
      lastName: profileSettings.lastName,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordSettings.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordSettings.currentPassword,
      newPassword: passwordSettings.newPassword,
    });
  };

  const handleNotificationUpdate = async (newPreferences: any) => {
    setNotificationSettings(newPreferences);
    notificationMutation.mutate(newPreferences);
  };

  const handleDeleteAccount = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                <p className="text-orange-100">Manage your account preferences and settings</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs defaultValue="profile" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center px-6 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 hover:bg-gray-50"
                  data-testid="tab-profile"
                >
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center px-6 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 hover:bg-gray-50"
                  data-testid="tab-notifications"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="flex items-center px-6 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 hover:bg-gray-50"
                  data-testid="tab-privacy"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy & Security
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 mt-0">
                {/* Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details and personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileSettings.firstName}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter your first name"
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileSettings.lastName}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter your last name"
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileSettings.email}
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                          placeholder="Email cannot be changed"
                          data-testid="input-email"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Email address cannot be changed for security reasons
                        </p>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={profileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {profileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Password Change */}
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={passwordSettings.currentPassword}
                            onChange={(e) => setPasswordSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Enter current password"
                            required
                            data-testid="input-current-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordSettings.newPassword}
                            onChange={(e) => setPasswordSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Enter new password (min 6 characters)"
                            required
                            data-testid="input-new-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordSettings.confirmPassword}
                          onChange={(e) => setPasswordSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          required
                          data-testid="input-confirm-password"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={passwordMutation.isPending}
                        data-testid="button-change-password"
                      >
                        {passwordMutation.isPending ? "Changing..." : "Change Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose what notifications you'd like to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="orderUpdates" className="text-sm font-medium">
                          Order Updates
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive notifications about your order status
                        </p>
                      </div>
                      <Switch
                        id="orderUpdates"
                        checked={notificationSettings.orderUpdates}
                        onCheckedChange={(checked) => handleNotificationUpdate({ ...notificationSettings, orderUpdates: checked })}
                        disabled={notificationMutation.isPending}
                        data-testid="switch-order-updates"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="promotions" className="text-sm font-medium">
                          Promotions & Offers
                        </Label>
                        <p className="text-sm text-gray-500">
                          Get notified about special deals and discounts
                        </p>
                      </div>
                      <Switch
                        id="promotions"
                        checked={notificationSettings.promotions}
                        onCheckedChange={(checked) => handleNotificationUpdate({ ...notificationSettings, promotions: checked })}
                        disabled={notificationMutation.isPending}
                        data-testid="switch-promotions"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newsletter" className="text-sm font-medium">
                          Newsletter
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive our weekly newsletter with food tips and recipes
                        </p>
                      </div>
                      <Switch
                        id="newsletter"
                        checked={notificationSettings.newsletter}
                        onCheckedChange={(checked) => handleNotificationUpdate({ ...notificationSettings, newsletter: checked })}
                        disabled={notificationMutation.isPending}
                        data-testid="switch-newsletter"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>
                      Manage your privacy settings and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-red-600">Danger Zone</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" data-testid="button-delete-account">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteMutation.isPending}
                              data-testid="button-confirm-delete"
                            >
                              {deleteMutation.isPending ? "Deleting..." : "Yes, delete my account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}