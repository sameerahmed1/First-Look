"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Mail,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Info,
} from "lucide-react";
import type { AIAnalysis, CaptureData } from "@/types";

interface JobBriefCardProps {
  project: {
    id: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    project_name: string;
    status: string;
    created_at: string;
    capture_data: CaptureData | null;
    ai_analysis: AIAnalysis | null;
    project_media: Array<{
      id: string;
      file_url: string;
      file_type: string;
    }>;
  };
  onStatusChange: (status: "new" | "pending" | "analyzed" | "reviewed" | "quoted" | "completed" | "archived") => void;
  onDelete: () => void;
}

export function JobBriefCard({
  project,
  onStatusChange,
  onDelete,
}: JobBriefCardProps) {
  const [scopeToggles, setScopeToggles] = useState<Record<number, boolean>>(
    project.ai_analysis?.scope_hypotheses.reduce((acc, hyp, idx) => {
      acc[idx] = hyp.selected;
      return acc;
    }, {} as Record<number, boolean>) || {}
  );

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Emergency":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold cursor-help">
                  <AlertTriangle className="w-4 h-4" />
                  Emergency
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Active hazard - needs immediate response</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "24-48hrs":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold cursor-help">
                  <Clock className="w-4 h-4" />
                  24-48hrs
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Active damage progression - should be addressed soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Routine":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold cursor-help">
                  <CheckCircle2 className="w-4 h-4" />
                  Routine
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stable issue - can be scheduled normally</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  const aiAnalysis = project.ai_analysis;
  const captureData = project.capture_data;

  // Build SMS/Email content
  const buildRequestInfoSMS = () => {
    const missing = aiAnalysis?.missing_evidence || [];
    if (missing.length === 0) return "Hi, I'd like to discuss your project.";
    return `Hi ${project.customer_name}, thanks for submitting your project. To help with the assessment, could you send me: ${missing.join(", ")}? Thanks!`;
  };

  const buildScheduleVisitSMS = () => {
    const availability = captureData?.availability;
    if (availability) {
      return `Hi ${project.customer_name}, I've reviewed your ${captureData?.problem_type || "project"}. I can visit on one of the times you mentioned: ${availability}. Which works best?`;
    }
    return `Hi ${project.customer_name}, I've reviewed your ${captureData?.problem_type || "project"}. When would be a good time for me to come take a look in person?`;
  };

  const buildBallparkSMS = () => {
    if (!aiAnalysis) return "";
    const mostLikely = aiAnalysis.scenarios.find(s => s.label === "Most Likely");
    const priceRange = mostLikely?.price || "TBD";
    return `Hi ${project.customer_name}, based on the photos and info you provided, I estimate this project at ${priceRange}. I'd be happy to schedule a visit to provide a detailed quote. When works for you?`;
  };

  const smsLink = (message: string) => {
    const phone = project.customer_phone?.replace(/\D/g, "") || "";
    return `sms:${phone}${phone.startsWith("1") ? "" : ""}?body=${encodeURIComponent(message)}`;
  };

  const mailtoLink = (subject: string, body: string) => {
    return `mailto:${project.customer_email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      {/* Header: Urgency + Risk Flags */}
      {aiAnalysis && (
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {getUrgencyBadge(aiAnalysis.triage.urgency)}
            {aiAnalysis.triage.risk_flags.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-2 cursor-help">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {aiAnalysis.triage.risk_flags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-xs"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Potential risks identified by AI analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}

      {/* Media Preview */}
      {project.project_media.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Media ({project.project_media.length})
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {project.project_media.map((media) => (
              <a
                key={media.id}
                href={media.file_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
              >
                {media.file_type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={media.file_url}
                    alt="Project media"
                    className="w-full h-full object-cover"
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: AI Summary & Missing Evidence */}
      {aiAnalysis && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                AI Summary
              </h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI-generated executive summary of the issue</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">{aiAnalysis.summary}</p>
          </div>

          {aiAnalysis.missing_evidence.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-800 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Missing Evidence
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional photos or info that would help refine the assessment</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h4>
              <ul className="space-y-1">
                {aiAnalysis.missing_evidence.map((item, idx) => (
                  <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Scope Hypotheses */}
      {aiAnalysis && aiAnalysis.scope_hypotheses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-foreground">
              Scope Hypotheses
            </h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle items on/off based on your assessment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            {aiAnalysis.scope_hypotheses.map((hypothesis, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  scopeToggles[idx]
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                    : "border-border bg-card hover:bg-muted"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setScopeToggles({ ...scopeToggles, [idx]: !scopeToggles[idx] });
                }}
              >
                <input
                  type="checkbox"
                  checked={scopeToggles[idx] || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    setScopeToggles({ ...scopeToggles, [idx]: e.target.checked });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span
                  className={`text-sm ${
                    scopeToggles[idx]
                      ? "font-medium text-green-900 dark:text-green-100"
                      : "text-foreground"
                  }`}
                >
                  {hypothesis.item}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Pricing Scenarios */}
      {aiAnalysis && aiAnalysis.scenarios && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-bold">Pricing Scenarios</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Three scenarios based on scope and complications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiAnalysis.scenarios.map((scenario, idx) => {
              const isBestCase = scenario.label === "Best Case";
              const isMostLikely = scenario.label === "Most Likely";
              const isWorstCase = scenario.label === "Worst Case";

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    isBestCase
                      ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700"
                      : isMostLikely
                      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400 dark:ring-blue-600 ring-opacity-50 md:scale-105"
                      : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700"
                  }`}
                >
                  <div className="mb-2">
                    <h5
                      className={`text-sm font-bold uppercase tracking-wide ${
                        isBestCase
                          ? "text-green-700 dark:text-green-400"
                          : isMostLikely
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {scenario.label}
                    </h5>
                    <p
                      className={`text-2xl font-extrabold mt-1 ${
                        isBestCase
                          ? "text-green-900 dark:text-green-100"
                          : isMostLikely
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-red-900 dark:text-red-100"
                      }`}
                    >
                      {scenario.price}
                    </p>
                  </div>
                  <p className="text-xs text-foreground/80">{scenario.description}</p>
                </div>
              );
            })}
          </div>

          {/* Variables Section */}
          {aiAnalysis.variables && aiAnalysis.variables.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h5 className="text-xs font-semibold text-foreground mb-2">
                Variables that could shift cost:
              </h5>
              <ul className="space-y-1">
                {aiAnalysis.variables.map((variable, idx) => (
                  <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                    <span>{variable}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground italic text-center">
            Estimates sourced from 2026 National Averages. Final quote requires site visit.
          </p>
        </div>
      )}

      {/* Capture Data Context (Collapsible) */}
      {captureData && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-foreground hover:text-primary">
            View Homeowner Context
          </summary>
          <div className="mt-3 p-4 bg-muted rounded-lg text-sm space-y-2">
            <div>
              <span className="font-medium">Problem Type:</span> {captureData.problem_type}
            </div>
            <div>
              <span className="font-medium">Home Type:</span>{" "}
              {captureData.home_info.home_type}
              {captureData.home_info.year_built && ` (Built ${captureData.home_info.year_built})`}
            </div>
            <div>
              <span className="font-medium">When Noticed:</span> {captureData.context.when_noticed}
            </div>
            <div>
              <span className="font-medium">Weather Related:</span>{" "}
              {captureData.context.weather_related ? "Yes" : "No"}
            </div>
            {captureData.context.additional_notes && (
              <div>
                <span className="font-medium">Notes:</span> {captureData.context.additional_notes}
              </div>
            )}
            {captureData.availability && (
              <div>
                <span className="font-medium">Availability:</span> {captureData.availability}
              </div>
            )}
          </div>
        </details>
      )}

      {/* Footer: Action Buttons */}
      <div className="pt-4 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {project.customer_phone && (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <a href={smsLink(buildRequestInfoSMS())}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Info
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <a href={smsLink(buildScheduleVisitSMS())}>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Visit
                </a>
              </Button>
              <Button
                variant="default"
                size="sm"
                asChild
                className="w-full"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <a href={smsLink(buildBallparkSMS())}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Send Ballpark
                </a>
              </Button>
            </>
          )}
          {!project.customer_phone && project.customer_email && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full col-span-3"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <a href={mailtoLink("Re: Your Project", `Hi ${project.customer_name},\n\nI've reviewed your project submission. `)}>
                <Mail className="w-4 h-4 mr-2" />
                Email Customer
              </a>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={project.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(e.target.value as "new" | "pending" | "analyzed" | "reviewed" | "quoted" | "completed" | "archived");
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background text-foreground"
          >
            <option value="new">New</option>
            <option value="pending">Pending</option>
            <option value="analyzed">Analyzed</option>
            <option value="reviewed">Reviewed</option>
            <option value="quoted">Quoted</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
