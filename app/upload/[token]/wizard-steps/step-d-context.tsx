"use client";

import type { HomeInfo, ContextInfo } from "@/types";

interface StepD_ContextProps {
  homeInfo: HomeInfo;
  onHomeInfoChange: (info: HomeInfo) => void;
  contextInfo: ContextInfo;
  onContextInfoChange: (info: ContextInfo) => void;
}

const HOME_TYPES: HomeInfo["home_type"][] = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Family",
  "Mobile Home",
  "Other",
];

const WHEN_NOTICED_OPTIONS: ContextInfo["when_noticed"][] = [
  "Today",
  "This week",
  "This month",
  "Longer",
  "Unknown",
];

export function StepD_Context({
  homeInfo,
  onHomeInfoChange,
  contextInfo,
  onContextInfoChange,
}: StepD_ContextProps) {
  return (
    <div className="space-y-8">
      {/* Home Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Type
            </label>
            <select
              value={homeInfo.home_type}
              onChange={(e) =>
                onHomeInfoChange({
                  ...homeInfo,
                  home_type: e.target.value as HomeInfo["home_type"],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              {HOME_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Year Built */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built (Optional)
            </label>
            <input
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              placeholder="e.g., 1995"
              value={homeInfo.year_built || ""}
              onChange={(e) =>
                onHomeInfoChange({
                  ...homeInfo,
                  year_built: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Floors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Floors
            </label>
            <select
              value={homeInfo.floors}
              onChange={(e) =>
                onHomeInfoChange({
                  ...homeInfo,
                  floors: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Floor" : "Floors"}
                </option>
              ))}
            </select>
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Footage (Optional)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="e.g., 2400"
              value={homeInfo.square_footage || ""}
              onChange={(e) =>
                onHomeInfoChange({
                  ...homeInfo,
                  square_footage: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Context Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Context</h3>
        <div className="space-y-4">
          {/* When Noticed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When did you first notice this issue?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {WHEN_NOTICED_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    onContextInfoChange({
                      ...contextInfo,
                      when_noticed: option,
                    })
                  }
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    contextInfo.when_noticed === option
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Related */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Is this related to recent weather (rain, storm, freeze)?
            </label>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  onContextInfoChange({
                    ...contextInfo,
                    weather_related: true,
                  })
                }
                className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  contextInfo.weather_related
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() =>
                  onContextInfoChange({
                    ...contextInfo,
                    weather_related: false,
                  })
                }
                className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  !contextInfo.weather_related
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Previous Repairs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have you had repairs done in this area before?
            </label>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  onContextInfoChange({
                    ...contextInfo,
                    previous_repairs: true,
                  })
                }
                className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  contextInfo.previous_repairs
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() =>
                  onContextInfoChange({
                    ...contextInfo,
                    previous_repairs: false,
                  })
                }
                className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  !contextInfo.previous_repairs
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Anything else you'd like the contractor to know? (e.g., 'Water stain appeared after heavy rain', 'Outlet stopped working suddenly')"
              rows={4}
              value={contextInfo.additional_notes}
              onChange={(e) =>
                onContextInfoChange({
                  ...contextInfo,
                  additional_notes: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
