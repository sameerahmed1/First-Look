"use client";

import type { SafetyChecks } from "@/types";
import { AlertTriangle } from "lucide-react";

interface StepB_SafetyGateProps {
  value: SafetyChecks;
  onChange: (value: SafetyChecks) => void;
}

const SAFETY_QUESTIONS = [
  {
    key: "active_dripping" as keyof SafetyChecks,
    label: "Is there active dripping or flowing water?",
    warning: true,
  },
  {
    key: "gas_smell" as keyof SafetyChecks,
    label: "Do you smell gas or natural gas?",
    warning: true,
  },
  {
    key: "sewage_backup" as keyof SafetyChecks,
    label: "Is there sewage backup or flooding?",
    warning: true,
  },
  {
    key: "electrical_sparking" as keyof SafetyChecks,
    label: "Do you see sparking or smell burning from electrical outlets?",
    warning: true,
  },
  {
    key: "structural_damage" as keyof SafetyChecks,
    label: "Is there visible structural damage (sagging ceiling, cracked foundation)?",
    warning: true,
  },
];

export function StepB_SafetyGate({ value, onChange }: StepB_SafetyGateProps) {
  const hasAnyConcerns = Object.values(value).some((v) => v === true);

  const toggleCheck = (key: keyof SafetyChecks) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      {hasAnyConcerns && (
        <div className="bg-red-100 border-2 border-red-600 rounded-lg p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 text-lg mb-2">
                SAFETY ALERT - IMMEDIATE ACTION REQUIRED
              </h3>
              <p className="text-red-800 mb-2">
                Based on your responses, this may be an emergency situation.
              </p>
              <ul className="text-red-800 space-y-1 list-disc list-inside">
                <li>
                  <strong>Gas smell:</strong> Evacuate immediately and call your gas
                  utility company or 911
                </li>
                <li>
                  <strong>Active water intrusion:</strong> Shut off water main if safe to
                  do so
                </li>
                <li>
                  <strong>Electrical hazards:</strong> Turn off power at breaker box if
                  safe
                </li>
                <li>
                  <strong>Structural damage:</strong> Evacuate and call emergency services
                </li>
              </ul>
              <p className="text-red-800 mt-3 font-semibold">
                You may continue this form to document the issue for your contractor, but
                please address immediate safety concerns first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safety Checklist */}
      <div className="space-y-3">
        {SAFETY_QUESTIONS.map((question) => {
          const isChecked = value[question.key];

          return (
            <button
              key={question.key}
              onClick={() => toggleCheck(question.key)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                isChecked
                  ? "border-red-600 bg-red-50"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isChecked
                      ? "bg-red-600 border-red-600"
                      : "border-gray-400 bg-white"
                  }`}
                >
                  {isChecked && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
                <span
                  className={`text-base ${
                    isChecked ? "font-semibold text-red-900" : "text-gray-700"
                  }`}
                >
                  {question.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!hasAnyConcerns && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            No immediate safety concerns detected. You can proceed with documenting your
            issue.
          </p>
        </div>
      )}
    </div>
  );
}
