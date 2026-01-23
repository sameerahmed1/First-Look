"use client";

import { useState } from "react";
import { User, Mail, Phone, Calendar, X } from "lucide-react";

interface StepE_ContactInfoProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerEmail: string;
  onCustomerEmailChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
  availability: string[];
  onAvailabilityChange: (slots: string[]) => void;
}

// Generate date options for the next 14 days
const getDateOptions = () => {
  const dates = [];
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return dates;
};

const formatDate = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${month}/${day} (${weekday})`;
};

const TIME_SLOTS = [
  "Morning (8am-12pm)",
  "Afternoon (12pm-5pm)",
  "Evening (5pm-8pm)",
];

export function StepE_ContactInfo({
  customerName,
  onCustomerNameChange,
  customerEmail,
  onCustomerEmailChange,
  customerPhone,
  onCustomerPhoneChange,
  availability,
  onAvailabilityChange,
}: StepE_ContactInfoProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const dates = getDateOptions();

  const addAvailabilitySlot = () => {
    if (selectedDate && selectedTime) {
      const slot = `${selectedDate} ${selectedTime}`;
      if (!availability.includes(slot)) {
        onAvailabilityChange([...availability, slot]);
      }
      setSelectedDate("");
      setSelectedTime("");
    }
  };

  const removeAvailabilitySlot = (slot: string) => {
    onAvailabilityChange(availability.filter((s) => s !== slot));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          Your contact information will only be shared with your contractor. They'll use
          it to follow up with questions, schedule a visit, or provide an estimate.
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            required
            placeholder="John Smith"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="email"
            required
            placeholder="john.smith@example.com"
            value={customerEmail}
            onChange={(e) => onCustomerEmailChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="tel"
            required
            placeholder="(555) 123-4567"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Include area code. This is the best number to reach you.
        </p>
      </div>

      {/* Availability Picker */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
          When are you available for a site visit? (Optional)
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Select a few times that work for you. This helps the contractor schedule faster.
        </p>

        <div className="space-y-3">
          {/* Date Selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Select Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a date...</option>
              {dates.map((date) => (
                <option key={date.toISOString()} value={formatDate(date)}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Select Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDate}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Choose a time...</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={addAvailabilitySlot}
            disabled={!selectedDate || !selectedTime}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Time Slot
          </button>

          {/* Selected Slots */}
          {availability.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Your Available Times ({availability.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {availability.map((slot, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => removeAvailabilitySlot(slot)}
                      className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-muted border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground">
          By submitting this form, you agree to be contacted by the contractor regarding
          your repair request. Your information will not be shared with third parties.
        </p>
      </div>
    </div>
  );
}
