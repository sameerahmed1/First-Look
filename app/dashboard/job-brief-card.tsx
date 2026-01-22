"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  onStatusChange: (status: string) => void;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Emergency":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Emergency
          </div>
        );
      case "24-48hrs":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            24-48hrs
          </div>
        );
      case "Routine":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Routine
          </div>
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
    return `Hi ${project.customer_name}, I've reviewed your ${captureData?.problem_type || "project"}. When would be a good time for me to come take a look in person?`;
  };

  const buildBallparkSMS = () => {
    if (!aiAnalysis) return "";
    return `Hi ${project.customer_name}, based on the photos and info you provided, I estimate this project at ${formatCurrency(aiAnalysis.price_breakdown.range_low)} - ${formatCurrency(aiAnalysis.price_breakdown.range_high)}. I'd be happy to schedule a visit to provide a detailed quote. When works for you?`;
  };

  const smsLink = (message: string) => {
    const phone = project.customer_phone?.replace(/\D/g, "") || "";
    return `sms:${phone}${phone.startsWith("1") ? "" : ""}?body=${encodeURIComponent(message)}`;
  };

  const mailtoLink = (subject: string, body: string) => {
    return `mailto:${project.customer_email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header: Urgency + Trade */}
      {aiAnalysis && (
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {getUrgencyBadge(aiAnalysis.triage.urgency)}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">Trade:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                {aiAnalysis.triage.trade}
              </span>
            </div>
            {aiAnalysis.triage.risk_flags.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {aiAnalysis.triage.risk_flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Preview */}
      {project.project_media.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Media ({project.project_media.length})
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {project.project_media.map((media) => (
              <a
                key={media.id}
                href={media.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all"
              >
                {media.file_type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-400" />
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              AI Summary
            </h4>
            <p className="text-sm text-blue-800">{aiAnalysis.summary}</p>
          </div>

          {aiAnalysis.missing_evidence.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Missing Evidence
              </h4>
              <ul className="space-y-1">
                {aiAnalysis.missing_evidence.map((item, idx) => (
                  <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
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
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Scope Hypotheses (Toggle as needed)
          </h4>
          <div className="space-y-2">
            {aiAnalysis.scope_hypotheses.map((hypothesis, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  scopeToggles[idx]
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={scopeToggles[idx] || false}
                  onChange={(e) =>
                    setScopeToggles({ ...scopeToggles, [idx]: e.target.checked })
                  }
                  className="mt-0.5 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span
                  className={`text-sm ${
                    scopeToggles[idx]
                      ? "font-medium text-green-900"
                      : "text-gray-700"
                  }`}
                >
                  {hypothesis.item}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Pricing */}
      {aiAnalysis && (
        <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-700" />
            <h4 className="text-lg font-bold text-green-900">
              {formatCurrency(aiAnalysis.price_breakdown.range_low)} -{" "}
              {formatCurrency(aiAnalysis.price_breakdown.range_high)}
            </h4>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-1">
                Assumptions:
              </h5>
              <ul className="space-y-1">
                {aiAnalysis.price_breakdown.assumptions.map((assumption, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-1">
                Variables that could change price:
              </h5>
              <ul className="space-y-1">
                {aiAnalysis.price_breakdown.variables.map((variable, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">⚠</span>
                    <span>{variable}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Capture Data Context (Collapsible) */}
      {captureData && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
            View Homeowner Context
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm space-y-2">
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
          </div>
        </details>
      )}

      {/* Footer: Action Buttons */}
      <div className="pt-4 border-t space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {project.customer_phone && (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full"
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
            onChange={(e) => onStatusChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
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
