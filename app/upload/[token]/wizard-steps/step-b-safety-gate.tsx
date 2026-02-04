"use client";

import type { SafetyChecks } from "@/types";
import { Info } from "lucide-react";

interface StepB_SafetyGateProps {
  value: SafetyChecks;
  onChange: (value: SafetyChecks) => void;
}

const SAFETY_QUESTIONS = [
  {
    key: "active_dripping" as keyof SafetyChecks,
    label: "Is there active dripping or flowing water?",
    tip: "If safe, consider shutting off the water main to prevent further damage.",
  },
  {
    key: "gas_smell" as keyof SafetyChecks,
    label: "Do you smell gas or natural gas?",
    tip: "Leave the area and contact your gas utility company.",
  },
  {
    key: "sewage_backup" as keyof SafetyChecks,
    label: "Is there sewage backup or flooding?",
    tip: "Avoid contact with the water and keep the area ventilated.",
  },
  {
    key: "electrical_sparking" as keyof SafetyChecks,
    label: "Do you see sparking or smell burning from electrical outlets?",
    tip: "If safe, turn off power at the breaker box.",
  },
  {
    key: "structural_damage" as keyof SafetyChecks,
    label: "Is there visible structural damage (sagging ceiling, cracked foundation)?",
    tip: "Avoid the affected area until it can be assessed.",
  },
];

export function StepB_SafetyGate({ value, onChange }: StepB_SafetyGateProps) {
  const toggleCheck = (key: keyof SafetyChecks) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  return (
    <div className="space-y-6">
      {/* Safety Checklist */}
      <div className="space-y-3">
        {SAFETY_QUESTIONS.map((question) => {
          const isChecked = value[question.key];

          return (
            <div key={question.key}>
              <button
                onClick={() => toggleCheck(question.key)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  isChecked
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isChecked
                        ? "bg-amber-500 border-amber-500"
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
                      isChecked ? "font-medium text-amber-900" : "text-gray-700"
                    }`}
                  >
                    {question.label}
                  </span>
                </div>
              </button>
              {/* Inline tip when checked */}
              {isChecked && (
                <div className="mt-2 ml-10 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{question.tip}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-500">
        This helps your contractor understand the urgency of your situation.
      </p>
    </div>
  );
}
