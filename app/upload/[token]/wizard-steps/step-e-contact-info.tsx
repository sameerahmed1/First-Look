"use client";

import { User, Mail, Phone } from "lucide-react";

interface StepE_ContactInfoProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerEmail: string;
  onCustomerEmailChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
}

export function StepE_ContactInfo({
  customerName,
  onCustomerNameChange,
  customerEmail,
  onCustomerEmailChange,
  customerPhone,
  onCustomerPhoneChange,
}: StepE_ContactInfoProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          Your contact information will only be shared with your contractor. They'll use
          it to follow up with questions, schedule a visit, or provide an estimate.
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            required
            placeholder="John Smith"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            required
            placeholder="john.smith@example.com"
            value={customerEmail}
            onChange={(e) => onCustomerEmailChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            required
            placeholder="(555) 123-4567"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Include area code. This is the best number to reach you.
        </p>
      </div>

      {/* Privacy Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          By submitting this form, you agree to be contacted by the contractor regarding
          your repair request. Your information will not be shared with third parties.
        </p>
      </div>
    </div>
  );
}
