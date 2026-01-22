"use client";

import { useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Building2,
  Upload,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { updateProfile, uploadLogo } from "@/app/actions/update-profile";

interface SettingsClientProps {
  user: User;
  profile: {
    id: string;
    email: string;
    business_name: string | null;
    logo_url: string | null;
    created_at: string;
  } | null;
}

export function SettingsClient({ user, profile }: SettingsClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(profile?.business_name || "");
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    profile?.logo_url || null
  );

  const [isSaving, setSaving] = useState(false);
  const [isUploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, GIF, WebP, or SVG image.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setLogoFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const result = await uploadLogo(formData);

      if (!result.url) {
        setError(result.error || "Failed to upload logo");
        setUploadingLogo(false);
        return;
      }

      setLogoUrl(result.url);
      setLogoPreview(result.url);
      setLogoFile(null);
      setSuccess("Logo uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error uploading logo:", err);
      setError("An unexpected error occurred while uploading the logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }

    setSaving(true);

    try {
      const result = await updateProfile({
        businessName: businessName.trim(),
        logoUrl: logoUrl || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setSuccess(null);
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("An unexpected error occurred while saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Profile
              </CardTitle>
              <CardDescription>
                Update your business information for customer-facing pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Smith & Sons Contracting"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
                <p className="mt-1 text-sm text-gray-500">
                  This name will appear on your upload links and customer communications
                </p>
              </div>

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>

                {/* Preview */}
                {logoPreview ? (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-24 w-auto max-w-xs object-contain border border-gray-300 rounded-lg bg-white p-2"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No logo uploaded</p>
                    </div>
                  </div>
                )}

                {/* Upload Controls */}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>

                  {logoFile && (
                    <Button
                      size="sm"
                      onClick={handleLogoUpload}
                      disabled={isUploadingLogo}
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Recommended: PNG or SVG with transparent background. Max 5MB.
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* White Labeling Preview */}
          {(businessName || logoPreview) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription>
                  This is how customers will see your branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    {logoPreview && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={logoPreview}
                          alt={businessName || "Company logo"}
                          className="h-16 object-contain"
                        />
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">
                      {businessName || "Your Business Name"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                      Customer Upload Portal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
