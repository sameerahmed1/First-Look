"use client";

import { useState } from "react";
import { VideoUploader } from "@/components/video-uploader";
import { analyzeMedia, analyzeMultipleMedia } from "@/app/actions/analyze-media";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DamageAnalysis } from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Wrench,
  FileText,
  Gauge,
} from "lucide-react";

type AnalysisState =
  | { status: "idle" }
  | { status: "analyzing" }
  | { status: "success"; data: DamageAnalysis }
  | { status: "error"; message: string };

export default function Home() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: "idle",
  });

  const handleUploadComplete = (urls: string[]) => {
    setUploadedUrls(urls);
  };

  const handleAnalyze = async () => {
    if (uploadedUrls.length === 0) return;

    setAnalysisState({ status: "analyzing" });

    try {
      const result =
        uploadedUrls.length === 1
          ? await analyzeMedia(uploadedUrls[0])
          : await analyzeMultipleMedia(uploadedUrls);

      if (result.success && result.data) {
        setAnalysisState({ status: "success", data: result.data });
      } else {
        setAnalysisState({
          status: "error",
          message: result.error || "Analysis failed",
        });
      }
    } catch (error) {
      setAnalysisState({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };

  const handleReset = () => {
    setUploadedUrls([]);
    setAnalysisState({ status: "idle" });
  };

  const getSeverityColor = (score: number) => {
    if (score <= 3) return "text-green-600";
    if (score <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityBgColor = (score: number) => {
    if (score <= 3) return "bg-green-100 dark:bg-green-900/30";
    if (score <= 6) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getSeverityLabel = (score: number) => {
    if (score === 0) return "No damage";
    if (score <= 3) return "Minor";
    if (score <= 6) return "Moderate";
    if (score <= 8) return "Significant";
    return "Severe";
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">First Look</h1>
          <p className="text-muted-foreground text-lg">
            Upload photos or a short video of your repair job for an instant
            AI-powered damage assessment.
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>
              Share images or a 30-second video of the damage from different
              angles for the most accurate assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoUploader
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
            />

            {/* Analyze Button */}
            {uploadedUrls.length > 0 && analysisState.status !== "success" && (
              <div className="mt-6">
                <Button
                  onClick={handleAnalyze}
                  disabled={analysisState.status === "analyzing"}
                  className="w-full"
                  size="lg"
                >
                  {analysisState.status === "analyzing" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" />
                      Get Damage Assessment
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {analysisState.status === "error" && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive">
                    Analysis Failed
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysisState.message}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyze}
                    className="mt-3"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisState.status === "success" && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <CardTitle>Draft Estimate</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </div>
              <CardDescription>
                AI-generated assessment based on uploaded media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Severity Score */}
              <div
                className={`p-4 rounded-lg ${getSeverityBgColor(analysisState.data.severity_score_1_to_10)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gauge
                      className={`w-6 h-6 ${getSeverityColor(analysisState.data.severity_score_1_to_10)}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Severity Score
                      </p>
                      <p
                        className={`text-2xl font-bold ${getSeverityColor(analysisState.data.severity_score_1_to_10)}`}
                      >
                        {analysisState.data.severity_score_1_to_10} / 10
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBgColor(analysisState.data.severity_score_1_to_10)} ${getSeverityColor(analysisState.data.severity_score_1_to_10)}`}
                  >
                    {getSeverityLabel(analysisState.data.severity_score_1_to_10)}
                  </span>
                </div>
              </div>

              {/* Damage Type & Trade Needed */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Damage Type
                  </p>
                  <p className="font-semibold">
                    {analysisState.data.damage_type}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Recommended Trade
                    </p>
                  </div>
                  <p className="font-semibold">
                    {analysisState.data.estimated_trade_needed}
                  </p>
                </div>
              </div>

              {/* Summary for Homeowner */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Summary
                  </p>
                </div>
                <p className="text-foreground leading-relaxed">
                  {analysisState.data.summary_for_homeowner}
                </p>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center">
                This is an AI-generated estimate for informational purposes
                only. Please consult with a licensed professional for an
                accurate assessment and quote.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
