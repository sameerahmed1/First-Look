"use client";

import { useState } from "react";
import { VideoUploader } from "@/components/video-uploader";
import { createProject } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, Upload } from "lucide-react";

interface CustomerUploadClientProps {
  token: string;
  contractorId: string;
  uploadLinkId: string;
  businessName: string;
  linkLabel: string | null;
}

type UploadState =
  | { status: "input" }
  | { status: "uploading" }
  | { status: "processing" }
  | { status: "success"; projectName: string }
  | { status: "error"; message: string };

export function CustomerUploadClient({
  contractorId,
  uploadLinkId,
  businessName,
  linkLabel,
}: CustomerUploadClientProps) {
  const [customerName, setCustomerName] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "input",
  });

  const handleUploadComplete = (urls: string[]) => {
    setUploadedUrls(urls);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setUploadState({
        status: "error",
        message: "Please enter your name",
      });
      return;
    }

    if (uploadedUrls.length === 0) {
      setUploadState({
        status: "error",
        message: "Please upload at least one photo or video",
      });
      return;
    }

    setUploadState({ status: "processing" });

    try {
      const result = await createProject({
        contractorId,
        uploadLinkId,
        customerName: customerName.trim(),
        fileUrls: uploadedUrls,
      });

      if (result.success) {
        setUploadState({
          status: "success",
          projectName: result.projectName || "Your Project",
        });
      } else {
        setUploadState({
          status: "error",
          message: result.error || "Failed to submit. Please try again.",
        });
      }
    } catch (error) {
      setUploadState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  // Success State
  if (uploadState.status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you, {customerName}! Your photos have been submitted to{" "}
              {businessName}.
            </p>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Project created:</p>
              <p className="font-semibold">{uploadState.projectName}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              {businessName} will review your submission and get back to you
              soon.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{businessName}</h1>
          {linkLabel && (
            <p className="text-lg text-muted-foreground">{linkLabel}</p>
          )}
          <p className="text-muted-foreground">
            Upload photos or a video of your repair project
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Your Photos</CardTitle>
            <CardDescription>
              Take clear photos or a short video from multiple angles to help us
              assess your project accurately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Name Input */}
            <div className="space-y-2">
              <label htmlFor="customerName" className="text-sm font-medium">
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Enter your full name"
                disabled={uploadState.status === "processing"}
              />
            </div>

            {/* File Uploader */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Photos / Video <span className="text-destructive">*</span>
              </label>
              <VideoUploader
                onUploadComplete={handleUploadComplete}
                maxFiles={5}
              />
            </div>

            {/* Error Message */}
            {uploadState.status === "error" && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {uploadState.message}
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={
                uploadState.status === "processing" || uploadedUrls.length === 0
              }
              className="w-full"
              size="lg"
            >
              {uploadState.status === "processing" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing your submission...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit to {businessName}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to share these images with {businessName}{" "}
              for assessment purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
