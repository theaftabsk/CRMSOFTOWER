'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Star, UploadCloud, 
  HelpCircle, AlertCircle, Loader2, Sparkles, Building2, Phone, Mail, User
} from 'lucide-react';
import { WebForm, WebFormField, WebFormTheme } from '@/types/crm';

interface FormRendererProps {
  form: Partial<WebForm>;
  previewMode?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  onSubmit?: (values: Record<string, any>) => Promise<void> | void;
  submitting?: boolean;
  submitted?: boolean;
  successMessage?: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  previewMode = false,
  device = 'desktop',
  onSubmit,
  submitting = false,
  submitted = false,
  successMessage,
}) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // for conversational / multi-step mode
  const [startTime] = useState<number>(Date.now());

  const fields = useMemo(() => form.fields || [], [form.fields]);
  const theme: WebFormTheme = useMemo(() => {
    return (
      form.theme || {
        preset: 'minimal_monochrome',
        layout: form.layout || 'classic',
        font: 'Inter',
        primary_color: '#111111',
        background_color: '#FFFFFF',
        surface_color: '#F8F8F8',
        border_color: '#E5E5E5',
        radius: '12px',
        button_radius: '8px',
        show_logo: true,
      }
    );
  }, [form.theme, form.layout]);

  const layout = theme.layout || form.layout || 'classic';

  // Evaluate Conditional Logic Rules
  const visibleFields = useMemo(() => {
    const rules = form.logic || [];
    return fields.filter((field) => {
      // Find rules where this field is target
      const targetingRules = rules.filter((r) => r.target_field_id === field.id);
      if (targetingRules.length === 0) return true;

      // Check if any rule conditions are triggered
      for (const rule of targetingRules) {
        const sourceVal = values[rule.field_id];
        let conditionMet = false;

        if (rule.condition === 'IS_FILLED') {
          conditionMet = sourceVal !== undefined && sourceVal !== '' && sourceVal !== null;
        } else if (rule.condition === 'EQUALS') {
          conditionMet = String(sourceVal).toLowerCase() === String(rule.value).toLowerCase();
        } else if (rule.condition === 'NOT_EQUALS') {
          conditionMet = String(sourceVal).toLowerCase() !== String(rule.value).toLowerCase();
        } else if (rule.condition === 'CONTAINS') {
          conditionMet = String(sourceVal || '').toLowerCase().includes(String(rule.value).toLowerCase());
        } else if (rule.condition === 'GREATER_THAN') {
          conditionMet = Number(sourceVal) > Number(rule.value);
        } else if (rule.condition === 'LESS_THAN') {
          conditionMet = Number(sourceVal) < Number(rule.value);
        }

        if (rule.action === 'SHOW') return conditionMet;
        if (rule.action === 'HIDE') return !conditionMet;
      }
      return true;
    });
  }, [fields, form.logic, values]);

  const handleInputChange = (fieldName: string, val: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: val }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[fieldName];
        return n;
      });
    }
  };

  const validateField = (field: WebFormField): boolean => {
    const val = values[field.name];
    if (field.required && (val === undefined || val === null || val === '')) {
      setErrors((prev) => ({ ...prev, [field.name]: `${field.label} is required.` }));
      return false;
    }
    if (field.type === 'email' && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setErrors((prev) => ({ ...prev, [field.name]: 'Please enter a valid email address.' }));
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    const currentField = visibleFields[currentStepIndex];
    if (currentField && !validateField(currentField)) return;

    if (currentStepIndex < visibleFields.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      triggerSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const triggerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate all visible fields
    const newErrors: Record<string, string> = {};
    for (const field of visibleFields) {
      const val = values[field.name];
      if (field.required && (val === undefined || val === null || val === '')) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const finalPayload = {
      ...values,
      _duration: durationSeconds,
    };

    if (onSubmit) {
      onSubmit(finalPayload);
    }
  };

  // Keyboard navigation for conversational layout
  useEffect(() => {
    if (layout !== 'conversational' || submitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent default submit if textarea isn't multiline
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleNextStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layout, currentStepIndex, visibleFields, values, submitted]);

  // Dynamic responsive wrapper styles
  const deviceWrapperClass = 
    device === 'mobile' ? 'max-w-[360px] mx-auto' :
    device === 'tablet' ? 'max-w-[640px] mx-auto' :
    'max-w-[720px] mx-auto';

  // Submission Complete screen
  if (submitted) {
    return (
      <div 
        className={`${deviceWrapperClass} p-8 text-center rounded-2xl border transition-all duration-300 shadow-sm my-6`}
        style={{
          backgroundColor: theme.background_color || '#FFFFFF',
          borderColor: theme.border_color || '#E5E5E5',
          fontFamily: theme.font || 'Inter',
        }}
      >
        <div className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#86EFAC] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-[#111111] mb-2">Thank You!</h3>
        <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed">
          {successMessage || form.success_message || 'Your inquiry has been successfully captured. Our sales advisory team will connect with you shortly.'}
        </p>
        {form.settings?.success_action === 'BOOK_MEETING' && (
          <div className="mt-5">
            <a 
              href="/book" 
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition"
              style={{ backgroundColor: theme.primary_color || '#111111' }}
            >
              <span>Schedule Discovery Meeting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // FIELD INPUT RENDERER HELPER
  const renderFieldInput = (field: WebFormField, isConversational = false) => {
    const val = values[field.name] ?? '';
    const err = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            rows={isConversational ? 4 : 3}
            placeholder={field.placeholder || 'Type your message...'}
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-none transition ${
              err ? 'border-[#DC2626]' : 'border-[#D4D4D4] focus:border-[#111111]'
            } ${isConversational ? 'text-base sm:text-lg' : ''}`}
            style={{ borderRadius: theme.button_radius || '8px' }}
          />
        );

      case 'select':
        return (
          <select
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-3.5 py-2 text-xs bg-white border rounded-lg focus:outline-none transition ${
              err ? 'border-[#DC2626]' : 'border-[#D4D4D4] focus:border-[#111111]'
            } ${isConversational ? 'text-sm py-3' : ''}`}
            style={{ borderRadius: theme.button_radius || '8px' }}
          >
            <option value="">{field.placeholder || '-- Select option --'}</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2 pt-1">
            {field.options?.map((opt, i) => (
              <label 
                key={i} 
                className={`flex items-center space-x-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                  val === opt.value ? 'bg-[#F9FAFB] border-[#111111]' : 'border-[#E5E5E5] hover:bg-[#FAFAFA]'
                }`}
              >
                <input 
                  type="radio" 
                  name={field.name} 
                  value={opt.value} 
                  checked={val === opt.value} 
                  onChange={() => handleInputChange(field.name, opt.value)}
                  className="text-[#111111] focus:ring-0"
                />
                <span className="text-xs font-medium text-[#111111]">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => handleInputChange(field.name, star)}
                className="p-1 rounded-md transition hover:scale-110"
              >
                <Star 
                  className={`w-6 h-6 ${
                    Number(val) >= star ? 'text-amber-400 fill-amber-400' : 'text-[#D4D4D4]'
                  }`} 
                />
              </button>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-start space-x-2.5 py-1 cursor-pointer">
            <input 
              type="checkbox" 
              checked={!!val} 
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="rounded border-[#D4D4D4] text-[#111111] focus:ring-0 mt-0.5"
            />
            <span className="text-xs text-[#333333] leading-snug">
              {field.description || field.placeholder || 'I agree to the terms and privacy policy.'}
            </span>
          </label>
        );

      default:
        return (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'number' || field.type === 'budget' ? 'number' : field.type === 'tel' ? 'tel' : 'text'}
            placeholder={field.placeholder || ''}
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-none transition ${
              err ? 'border-[#DC2626]' : 'border-[#D4D4D4] focus:border-[#111111]'
            } ${isConversational ? 'text-base sm:text-lg font-medium py-3.5' : ''}`}
            style={{ borderRadius: theme.button_radius || '8px' }}
          />
        );
    }
  };

  // LAYOUT 1: CONVERSATIONAL (TYPEFORM STYLE)
  if (layout === 'conversational') {
    const currentField = visibleFields[currentStepIndex] || visibleFields[0];
    const progressPercent = Math.round(((currentStepIndex + 1) / visibleFields.length) * 100);

    return (
      <div 
        className={`${deviceWrapperClass} rounded-2xl border p-6 sm:p-10 transition-all duration-300 my-4 shadow-sm`}
        style={{
          backgroundColor: theme.background_color || '#FFFFFF',
          borderColor: theme.border_color || '#E5E5E5',
          fontFamily: theme.font || 'Inter',
        }}
      >
        {/* Progress Strip */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-[11px] text-[#666666] mb-1.5 font-mono">
            <span>Question {currentStepIndex + 1} of {visibleFields.length}</span>
            <span>{progressPercent}% completed</span>
          </div>
          <div className="w-full bg-[#F0F0F0] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: theme.primary_color || '#111111'
              }}
            />
          </div>
        </div>

        {/* Current Question */}
        {currentField && (
          <div className="space-y-4 py-4 animate-in fade-in slide-in-from-right-2 duration-200">
            <div>
              <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-1">
                Step {currentStepIndex + 1}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111] leading-tight">
                {currentField.label}
                {currentField.required && <span className="text-[#DC2626] ml-1">*</span>}
              </h2>
              {currentField.description && (
                <p className="text-xs text-[#666666] mt-1">
                  {currentField.description}
                </p>
              )}
            </div>

            <div className="pt-2">
              {renderFieldInput(currentField, true)}
              {errors[currentField.name] && (
                <p className="text-[11px] text-[#DC2626] mt-1.5 flex items-center space-x-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors[currentField.name]}</span>
                </p>
              )}
            </div>

            {/* Conversational Navigation Dock */}
            <div className="flex items-center justify-between pt-6 border-t border-[#E5E5E5]">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="px-3.5 py-2 text-xs font-semibold text-[#666666] hover:text-[#111111] disabled:opacity-30 disabled:pointer-events-none rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white rounded-lg transition inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
                style={{
                  backgroundColor: theme.primary_color || '#111111',
                  borderRadius: theme.button_radius || '8px',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : currentStepIndex === visibleFields.length - 1 ? (
                  <>
                    <span>{form.submit_btn_text || 'Submit Inquiry'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-[#999999]">Press Enter ↵ to advance</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LAYOUT 2: CLASSIC SINGLE-PAGE FORM CARD
  return (
    <form 
      onSubmit={triggerSubmit}
      className={`${deviceWrapperClass} rounded-2xl border p-6 sm:p-8 transition-all duration-300 my-4 shadow-sm space-y-5`}
      style={{
        backgroundColor: theme.background_color || '#FFFFFF',
        borderColor: theme.border_color || '#E5E5E5',
        fontFamily: theme.font || 'Inter',
        borderRadius: theme.radius || '12px',
      }}
    >
      {/* Header & Logo */}
      <div className="border-b border-[#E5E5E5] pb-4 space-y-1">
        {theme.show_logo && (
          <div className="flex items-center space-x-2 mb-2 text-[#111111] font-bold text-xs">
            <Building2 className="w-4 h-4 text-[#888888]" />
            <span>{form.title ? form.title.split(' ')[0] : 'Enterprise'} CRM</span>
          </div>
        )}
        <h2 className="text-xl font-bold text-[#111111]">{form.title || 'Inbound Lead Form'}</h2>
        {form.description && (
          <p className="text-xs text-[#666666] leading-relaxed">{form.description}</p>
        )}
      </div>

      {/* Honeypot Spam field (Hidden) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <input 
          type="text" 
          name="website_hp" 
          tabIndex={-1} 
          autoComplete="off" 
          value={values.website_hp || ''} 
          onChange={(e) => handleInputChange('website_hp', e.target.value)} 
        />
      </div>

      {/* Fields Canvas */}
      <div className="space-y-4">
        {visibleFields.map((field, idx) => (
          <div key={field.id || field.name || `field_${idx}`} className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#111111] block">
                {field.label}
                {field.required && <span className="text-[#DC2626] ml-1">*</span>}
              </label>
              {field.help_text && (
                <span className="text-[10px] text-[#888888]">{field.help_text}</span>
              )}
            </div>

            {renderFieldInput(field)}

            {errors[field.name] && (
              <p className="text-[11px] text-[#DC2626] font-medium flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors[field.name]}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer Submit Action */}
      <div className="pt-3 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[10px] text-[#888888]">
          Protected with Honeypot &amp; Enterprise Rate Limiting
        </span>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 text-xs font-semibold text-white rounded-lg transition inline-flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
          style={{
            backgroundColor: theme.primary_color || '#111111',
            borderRadius: theme.button_radius || '8px',
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>{form.submit_btn_text || 'Submit Inquiry'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
