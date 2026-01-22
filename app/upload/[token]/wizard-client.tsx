"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CaptureData, SafetyChecks, HomeInfo, ContextInfo } from "@/types";
import { StepA_ProblemType } from "./wizard-steps/step-a-problem-type";
import { StepB_SafetyGate } from "./wizard-steps/step-b-safety-gate";
import { StepC_MediaCapture } from "./wizard-steps/step-c-media-capture";
import { StepD_Context } from "./wizard-steps/step-d-context";
import { StepE_ContactInfo } from "./wizard-steps/step-e-contact-info";
import { createProjectWithWizard } from "@/app/actions/projects";
import { CheckCircle2 } from "lucide-react";

interface WizardClientProps {
  token: string;
  contractorId: string;
  uploadLinkId: string;
  businessName: string;
  logoUrl: string | null;
  linkLabel: string | null;
}

type WizardStep = "problem" | "safety" | "media" | "context" | "contact" | "success";

export function GuidedCaptureWizard({
  token,
  contractorId,
  uploadLinkId,
  businessName,
  logoUrl,
  linkLabel,
}: WizardClientProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("problem");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  // Form state
  const [problemType, setProblemType] = useState<string>("");
  const [safetyChecks, setSafetyChecks] = useState<SafetyChecks>({
    active_dripping: false,
    gas_smell: false,
    sewage_backup: false,
    structural_damage: false,
    electrical_sparking: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [homeInfo, setHomeInfo] = useState<HomeInfo>({
    year_built: null,
    home_type: "Single Family",
    floors: 1,
    square_footage: null,
  });
  const [contextInfo, setContextInfo] = useState<ContextInfo>({
    when_noticed: "This week",
    weather_related: false,
    previous_repairs: false,
    additional_notes: "",
  });
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Check if there are any active safety concerns
  const hasActiveSafetyConcerns = Object.values(safetyChecks).some((v) => v === true);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Upload files to Supabase Storage
      const { uploadToSupabase } = await import("@/lib/supabase");
      const fileUrls: string[] = [];

      for (const file of uploadedFiles) {
        const { url, error: uploadError } = await uploadToSupabase(file);
        if (uploadError) {
          setError(`Failed to upload ${file.name}: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }
        fileUrls.push(url);
      }

      // Step 2: Build capture data
      const captureData: CaptureData = {
        problem_type: problemType,
        safety_checks: safetyChecks,
        home_info: homeInfo,
        context: contextInfo,
      };

      // Step 3: Submit project with wizard data
      const result = await createProjectWithWizard({
        contractorId,
        uploadLinkId,
        customerName,
        customerEmail,
        customerPhone,
        captureData,
        fileUrls,
      });

      if (!result.success) {
        setError(result.error || "Failed to submit project");
        setIsSubmitting(false);
        return;
      }

      setProjectName(result.projectName || "Your Project");
      setCurrentStep("success");
    } catch (err) {
      console.error("Error submitting project:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const stepConfig = {
    problem: {
      title: "What brings you here today?",
      subtitle: "Select the type of issue you're experiencing",
    },
    safety: {
      title: "Safety Check",
      subtitle: "Let us know if any of these apply to your situation",
    },
    media: {
      title: "Show us what you see",
      subtitle: "Upload photos or videos to help us understand the issue",
    },
    context: {
      title: "Tell us about your home",
      subtitle: "This helps us provide more accurate guidance",
    },
    contact: {
      title: "How can we reach you?",
      subtitle: "We'll use this to follow up on your project",
    },
  };

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {logoUrl && (
            <div className="flex justify-center mb-8">
              <img src={logoUrl} alt={businessName} className="h-16 object-contain" />
            </div>
          )}
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-xl text-gray-700 mb-2">
              Your project has been submitted successfully.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              <strong>{businessName}</strong> will review <strong>{projectName}</strong>{" "}
              and reach out to you soon.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-sm text-gray-700">
                Our AI has analyzed your submission and generated a detailed assessment.
                The contractor will use this to provide you with accurate guidance and
                pricing.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const config = stepConfig[currentStep as keyof typeof stepConfig];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          {logoUrl && (
            <div className="flex justify-center mb-4">
              <img src={logoUrl} alt={businessName} className="h-16 object-contain" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {linkLabel || `Report Issue to ${businessName}`}
          </h1>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["problem", "safety", "media", "context", "contact"].map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === step
                      ? "bg-blue-600 text-white"
                      : ["problem", "safety", "media", "context", "contact"].indexOf(
                          currentStep
                        ) >
                        ["problem", "safety", "media", "context", "contact"].indexOf(step)
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ["problem", "safety", "media", "context", "contact"].indexOf(
                        currentStep
                      ) > idx
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
          <p className="text-gray-600 mb-8">{config.subtitle}</p>

          {currentStep === "problem" && (
            <StepA_ProblemType value={problemType} onChange={setProblemType} />
          )}

          {currentStep === "safety" && (
            <StepB_SafetyGate value={safetyChecks} onChange={setSafetyChecks} />
          )}

          {currentStep === "media" && (
            <StepC_MediaCapture
              files={uploadedFiles}
              onChange={setUploadedFiles}
              hasActiveSafetyConcerns={hasActiveSafetyConcerns}
            />
          )}

          {currentStep === "context" && (
            <StepD_Context
              homeInfo={homeInfo}
              onHomeInfoChange={setHomeInfo}
              contextInfo={contextInfo}
              onContextInfoChange={setContextInfo}
            />
          )}

          {currentStep === "contact" && (
            <StepE_ContactInfo
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              customerEmail={customerEmail}
              onCustomerEmailChange={setCustomerEmail}
              customerPhone={customerPhone}
              onCustomerPhoneChange={setCustomerPhone}
            />
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={() => {
              const steps: WizardStep[] = [
                "problem",
                "safety",
                "media",
                "context",
                "contact",
              ];
              const currentIdx = steps.indexOf(currentStep);
              if (currentIdx > 0) {
                setCurrentStep(steps[currentIdx - 1]);
              }
            }}
            variant="outline"
            disabled={currentStep === "problem" || isSubmitting}
          >
            Back
          </Button>

          <Button
            onClick={() => {
              const steps: WizardStep[] = [
                "problem",
                "safety",
                "media",
                "context",
                "contact",
              ];
              const currentIdx = steps.indexOf(currentStep);

              if (currentStep === "contact") {
                handleSubmit();
              } else {
                setCurrentStep(steps[currentIdx + 1]);
              }
            }}
            disabled={
              (currentStep === "problem" && !problemType) ||
              (currentStep === "media" && uploadedFiles.length === 0) ||
              (currentStep === "contact" &&
                (!customerName || !customerEmail || !customerPhone)) ||
              isSubmitting
            }
          >
            {currentStep === "contact"
              ? isSubmitting
                ? "Submitting..."
                : "Submit"
              : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
