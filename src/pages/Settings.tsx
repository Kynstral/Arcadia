// noinspection ExceptionCaughtLocallyJS

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme-provider";
import { Moon, Palette, Scale, Sun, Upload, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthStatusProvider";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, userRole, userId } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [directAvatarUrl, setDirectAvatarUrl] = useState<string | null>(null);

  const [organizationName, setOrganizationName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  // Library Policies State
  const [dailyLateFeeRate, setDailyLateFeeRate] = useState("0.50");
  const [gracePeriodDays, setGracePeriodDays] = useState("0");
  const [maxLateFeeCap, setMaxLateFeeCap] = useState("50.00");
  const [maxRenewalsPerLoan, setMaxRenewalsPerLoan] = useState("2");
  const [memberBorrowingLimit, setMemberBorrowingLimit] = useState("5");
  const [isSavingPolicies, setIsSavingPolicies] = useState(false);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);

  const isLibrary = userRole === "Library";

  const loadSettings = useCallback(() => {
    try {
      const settingsKey = isLibrary ? "librarySettings" : "bookstoreSettings";
      const savedSettings = localStorage.getItem(settingsKey);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setOrganizationName(parsedSettings.name || "");
        setContactEmail(parsedSettings.contactEmail || "");
        setPhoneNumber(parsedSettings.phoneNumber || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, [isLibrary]);

  const loadLibraryPolicies = useCallback(async () => {
    if (!userId || !isLibrary) return;

    setIsLoadingPolicies(true);
    try {
      const { data, error } = await supabase
        .from("library_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setDailyLateFeeRate(data.daily_late_fee_rate?.toString() || "0.50");
        setGracePeriodDays(data.grace_period_days?.toString() || "0");
        setMaxLateFeeCap(data.max_late_fee_cap?.toString() || "50.00");
        setMaxRenewalsPerLoan(data.max_renewals_per_loan?.toString() || "2");
        setMemberBorrowingLimit(data.member_borrowing_limit?.toString() || "5");
      }
    } catch (error) {
      console.error("Error loading library policies:", error);
    } finally {
      setIsLoadingPolicies(false);
    }
  }, [userId, isLibrary]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");

      const metadata = user.user_metadata;
      if (metadata) {
        setFullName(metadata.full_name || user.email?.split("@")[0] || "User");

        if (!organizationName && metadata.full_name) {
          setOrganizationName(metadata.full_name);
        }
      } else {
        setFullName(user.email?.split("@")[0] || "User");
      }

      loadSettings();
    }

    if (userId) {
      fetchUserAvatar(userId);
      loadLibraryPolicies();
    }

    return () => {
      if (directAvatarUrl && directAvatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(directAvatarUrl);
      }
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, directAvatarUrl, loadSettings, loadLibraryPolicies, organizationName, user, userId]);

  const fetchUserAvatar = async (uid: string) => {
    try {
      const { data, error } = await supabase.storage.from("avatars").list("", {
        limit: 100,
        search: `avatar_${uid}`,
      });

      if (error) {
        console.error("Error listing avatars:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const sortedFiles = data.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const latestAvatar = sortedFiles[0];

        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from("avatars")
            .download(latestAvatar.name);

          if (downloadError) {
            console.error("Download error:", downloadError);
          } else if (fileData) {
            const objectUrl = URL.createObjectURL(fileData);

            setDirectAvatarUrl(objectUrl);
            return;
          }
        } catch (downloadErr) {
          console.error("Error downloading file:", downloadErr);
        }

        try {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(latestAvatar.name);

          if (urlData) {
            const testImg = new Image();
            testImg.onload = () => {
              setDirectAvatarUrl(urlData.publicUrl);
            };
            testImg.onerror = () => {
              console.error("Public URL image failed to load");
              setDirectAvatarUrl(null);
            };
            testImg.src = urlData.publicUrl;
          }
        } catch (urlErr) {
          console.error("Error getting public URL:", urlErr);
          setDirectAvatarUrl(null);
        }
      } else {
        setDirectAvatarUrl(null);
      }
    } catch (err) {
      console.error("Error in fetchUserAvatar:", err);
      setDirectAvatarUrl(null);
    }
  };

  const saveOrganizationSettings = () => {
    setIsSavingOrg(true);
    try {
      const settingsKey = isLibrary ? "librarySettings" : "bookstoreSettings";
      const settings = {
        name: organizationName,
        contactEmail,
        phoneNumber,
      };

      localStorage.setItem(settingsKey, JSON.stringify(settings));

      toast({
        title: "Settings saved",
        description: `Your ${isLibrary ? "library" : "book store"} settings have been updated successfully.`,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);

      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    if (!userId) return;

    setIsSavingProfile(true);
    try {
      if (avatarFile) {
        setIsUploading(true);

        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
          });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw uploadError;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            role: userRole,
          },
        });

        if (updateError) {
          console.error("Auth update error details:", updateError);
          throw updateError;
        }

        setIsUploading(false);
      } else {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            role: userRole,
          },
        });

        if (updateError) {
          console.error("Auth update error details:", updateError);
          throw updateError;
        }
      }

      setAvatarPreview(null);

      await fetchUserAvatar(userId);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
      setIsUploading(false);
    }
  };

  const saveLibraryPolicies = async () => {
    if (!userId) return;

    setIsSavingPolicies(true);
    try {
      const { error } = await supabase.from("library_settings").upsert(
        {
          user_id: userId,
          daily_late_fee_rate: parseFloat(dailyLateFeeRate),
          grace_period_days: parseInt(gracePeriodDays),
          max_late_fee_cap: parseFloat(maxLateFeeCap),
          max_renewals_per_loan: parseInt(maxRenewalsPerLoan),
          member_borrowing_limit: parseInt(memberBorrowingLimit),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      toast({
        title: "Policies updated",
        description: "Library policies have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving library policies:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving library policies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPolicies(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(fullName);

  const displayAvatar = avatarPreview || directAvatarUrl;

  return (
    <div className="page-transition space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and {isLibrary ? "library" : "book store"} settings.
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className={`grid w-full ${isLibrary ? "grid-cols-3" : "grid-cols-2"}`}>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          {isLibrary && (
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Policies
            </TabsTrigger>
          )}
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                      setTheme(prefersDark ? "dark" : "light");
                    }}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  {/* Custom avatar implementation */}
                  <div className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center bg-muted">
                    {displayAvatar ? (
                      <img
                        src={avatarPreview || (directAvatarUrl ? `${directAvatarUrl}` : undefined)}
                        alt="User avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error("Avatar image failed to load:", e);
                          if (directAvatarUrl) {
                          }
                          e.currentTarget.style.display = "none";

                          if (directAvatarUrl && directAvatarUrl.startsWith("blob:")) {
                            URL.revokeObjectURL(directAvatarUrl);
                            setDirectAvatarUrl(null);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-xl font-medium">
                        {initials || <User className="h-12 w-12" />}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <Label
                      htmlFor="avatar-upload"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="sr-only">Upload avatar</span>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">
                  {isLibrary ? "Library Information" : "Book Store Information"}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">{isLibrary ? "Library Name" : "Store Name"}</Label>
                    <Input
                      id="org-name"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={isLibrary ? "Central Library" : "Book Haven"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={saveProfile} disabled={isUploading || isSavingProfile}>
                  {isUploading ? "Uploading..." : isSavingProfile ? "Saving..." : "Save Profile"}
                </Button>
                <Button onClick={saveOrganizationSettings} disabled={isSavingOrg} variant="outline">
                  {isSavingOrg ? "Saving..." : "Save Organization"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab - Only for Library users */}
        {isLibrary && (
          <TabsContent value="policies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Library Policies</CardTitle>
                <CardDescription>Configure lending rules and fee structures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingPolicies ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading policies...</p>
                  </div>
                ) : (
                  <>
                    {/* Late Fee Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Late Fee Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="daily-late-fee">Daily Late Fee Rate</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id="daily-late-fee"
                              type="number"
                              min="0"
                              max="10"
                              step="0.10"
                              value={dailyLateFeeRate}
                              onChange={(e) => setDailyLateFeeRate(e.target.value)}
                              className="pl-6"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Per day overdue</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grace-period">Grace Period</Label>
                          <Input
                            id="grace-period"
                            type="number"
                            min="0"
                            max="7"
                            value={gracePeriodDays}
                            onChange={(e) => setGracePeriodDays(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">Days before fees start</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="max-fee-cap">Maximum Fee Cap</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id="max-fee-cap"
                              type="number"
                              min="0"
                              step="1.00"
                              value={maxLateFeeCap}
                              onChange={(e) => setMaxLateFeeCap(e.target.value)}
                              className="pl-6"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Maximum per book</p>
                        </div>
                      </div>
                    </div>

                    {/* Circulation Policies */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Circulation Policies</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="max-renewals">Maximum Renewals</Label>
                          <Input
                            id="max-renewals"
                            type="number"
                            min="0"
                            max="5"
                            value={maxRenewalsPerLoan}
                            onChange={(e) => setMaxRenewalsPerLoan(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">Per loan</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="borrowing-limit">Member Borrowing Limit</Label>
                          <Input
                            id="borrowing-limit"
                            type="number"
                            min="1"
                            max="20"
                            value={memberBorrowingLimit}
                            onChange={(e) => setMemberBorrowingLimit(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">Books per member</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveLibraryPolicies} disabled={isSavingPolicies}>
                        {isSavingPolicies ? "Saving..." : "Save Policies"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
};

export default Settings;
