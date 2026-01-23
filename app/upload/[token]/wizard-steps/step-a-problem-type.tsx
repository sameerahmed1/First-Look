"use client";

import { Home, Droplet, Zap, Wind, Hammer, AlertTriangle } from "lucide-react";

interface StepA_ProblemTypeProps {
  value: string;
  onChange: (value: string) => void;
}

const PROBLEM_TYPES = [
  {
    id: "roof",
    label: "Roof - Leak or Missing Shingles",
    icon: Home,
    color: "bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    id: "plumbing",
    label: "Plumbing - Leak or Water Damage",
    icon: Droplet,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "electrical",
    label: "Electrical - Outlet or Wiring Issue",
    icon: Zap,
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  },
  {
    id: "hvac",
    label: "HVAC - Heating or Cooling Problem",
    icon: Wind,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    id: "structural",
    label: "Structural - Foundation, Walls, or Floor",
    icon: AlertTriangle,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    id: "general",
    label: "General Repair - Other Issue",
    icon: Hammer,
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
  },
];

export function StepA_ProblemType({ value, onChange }: StepA_ProblemTypeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PROBLEM_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.label;

        return (
          <button
            key={type.id}
            onClick={() => onChange(type.label)}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              isSelected
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-50"
                : type.color
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  isSelected ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    isSelected ? "text-blue-900" : "text-gray-900"
                  }`}
                >
                  {type.label}
                </h3>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
