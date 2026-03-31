import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import eventApi from '../../../api/eventApi';

const DynamicFormSubmission = ({ eventId, formId, existingSubmission, onSubmissionComplete, onClose }) => {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLastStep, setIsLastStep] = useState(false);

  useEffect(() => {
    loadForm();
    loadExistingSubmission();
  }, [eventId, formId]);

  useEffect(() => {
    // Check if current step is the last one
    const totalSteps = Math.ceil(form?.fields?.length / 3) || 1;
    setIsLastStep(currentStep === totalSteps - 1);
  }, [currentStep, form]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getFormById(eventId, formId);
      setForm(response.data);
      const initialResponses = {};
      response.data.fields.forEach(field => {
        // Initialize checkboxes as empty arrays and radios as empty strings
        if (field.type === 'CHECKBOX') {
          initialResponses[field.id] = [];
        } else {
          initialResponses[field.id] = '';
        }
      });
      setResponses(initialResponses);
    } catch (error) {
      console.error('Error loading form:', error);
      setGeneralError('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSubmission = async () => {
    try {
      const response = await eventApi.getFormSubmission(eventId, formId);
      if (response.data && response.data.responses) {
        const submissionResponses = {};
        response.data.responses.forEach(resp => {
          // Handle checkbox values (they might be stored as comma-separated strings or arrays)
          if (resp.value && typeof resp.value === 'string' && resp.value.includes(',')) {
            submissionResponses[resp.fieldId] = resp.value.split(',').map(item => item.trim());
          } else {
            submissionResponses[resp.fieldId] = resp.value;
          }
        });
        setResponses(submissionResponses);
      }
    } catch (error) {
      console.error('Error loading existing submission:', error);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

  const handlePhoneInput = (fieldId, value) => {
    // Only allow numbers, spaces, parentheses, hyphens, and plus sign
    const cleanedValue = value.replace(/[^\d\s\(\)\-+]/g, '');
    handleInputChange(fieldId, cleanedValue);
  };

  const handleCheckboxChange = (fieldId, optionValue, isChecked) => {
    setResponses(prev => {
      const currentValues = prev[fieldId] || [];
      let newValues;
      
      if (isChecked) {
        // Add the option to the array
        newValues = [...currentValues, optionValue];
      } else {
        // Remove the option from the array
        newValues = currentValues.filter(item => item !== optionValue);
      }
      
      return {
        ...prev,
        [fieldId]: newValues
      };
    });

    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    form.fields.forEach(field => {
      const value = responses[field.id];
      
      if (field.required) {
        if (field.type === 'CHECKBOX') {
          // For checkboxes, check if at least one option is selected
          if (!value || value.length === 0) {
            newErrors[field.id] = `${field.label} is required`;
            return;
          }
        } else {
          // For other fields, check if value exists and is not empty
          if (!value || value.toString().trim() === '') {
            newErrors[field.id] = `${field.label} is required`;
            return;
          }
        }
      }
      
      if (!value || (field.type !== 'CHECKBOX' && value.toString().trim() === '')) {
        return;
      }
      
      if (field.type === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }
      
      if (field.type === 'PHONE') {
        // Basic phone validation - at least 10 digits
        const digitCount = (value.match(/\d/g) || []).length;
        if (digitCount < 10) {
          newErrors[field.id] = 'Please enter a valid phone number with at least 10 digits';
        }
      }
      
      if (field.type === 'NUMBER') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          newErrors[field.id] = 'Please enter a valid number';
        } else {
          if (field.minValue !== undefined && numValue < field.minValue) {
            newErrors[field.id] = `Value must be at least ${field.minValue}`;
          }
          if (field.maxValue !== undefined && numValue > field.maxValue) {
            newErrors[field.id] = `Value must be at most ${field.maxValue}`;
          }
        }
      }
      
      if (field.type === 'TEXT') {
        if (field.minLength && value.length < field.minLength) {
          newErrors[field.id] = `Must be at least ${field.minLength} characters`;
        }
        if (field.maxLength && value.length > field.maxLength) {
          newErrors[field.id] = `Must be at most ${field.maxLength} characters`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setGeneralError(null);
    
    try {
      const apiResponses = Object.entries(responses)
        .filter(([fieldId, value]) => {
          // Filter out empty values based on field type
          if (Array.isArray(value)) {
            return value.length > 0; // For checkboxes, only include if at least one option is selected
          } else {
            return value !== '' && value !== null && value !== undefined;
          }
        })
        .map(([fieldId, value]) => ({
          fieldId: parseInt(fieldId),
          value: Array.isArray(value) ? value.join(',') : value.toString() // Convert arrays to comma-separated strings for API
        }));
      
      let response;
      if (existingSubmission) {
        response = await eventApi.updateFormSubmission(eventId, formId, apiResponses);
      } else {
        response = await eventApi.registerForEventWithForm(eventId, formId, apiResponses);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        onSubmissionComplete(response.data);
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setGeneralError(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case 'EMAIL': return <Mail className="w-5 h-5" />;
      case 'PHONE': return <Phone className="w-5 h-5" />;
      case 'DATE': return <Calendar className="w-5 h-5" />;
      case 'TEXTAREA': return <FileText className="w-5 h-5" />;
      case 'CHECKBOX': return <CheckCircle className="w-5 h-5" />;
      case 'RADIO': return <CheckCircle className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const renderField = (field) => {
    const fieldValue = responses[field.id] || '';
    const hasError = errors[field.id];
    
    const baseInputClasses = `w-full px-4 py-4 bg-gray-700/50 text-white rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 ${
      hasError 
        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
        : 'border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
    } focus:outline-none focus:scale-[1.02]`;

    // Parse options for fields that use them
    let options = [];
    try {
      options = JSON.parse(field.options || '[]');
    } catch (e) {
      options = [];
    }

    switch (field.type) {
      case 'TEXT':
        return (
          <div className="relative">
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
              minLength={field.minLength}
              maxLength={field.maxLength}
            />
          </div>
        );
      
      case 'EMAIL':
        return (
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'Enter your email'}
              className={`${baseInputClasses} pl-12`}
            />
          </div>
        );
      
      case 'NUMBER':
        return (
          <input
            type="number"
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            min={field.minValue}
            max={field.maxValue}
          />
        );
      
      case 'DROPDOWN':
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'CHECKBOX':
        const checkboxValues = Array.isArray(fieldValue) ? fieldValue : 
                              (fieldValue && typeof fieldValue === 'string' && fieldValue.includes(',')) ? 
                              fieldValue.split(',').map(item => item.trim()) : 
                              (fieldValue ? [fieldValue] : []);

        return (
          <div className="space-y-3">
            {options.map((option, index) => {
              const isChecked = checkboxValues.includes(option);
              return (
                <label key={index} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 ${
                    isChecked 
                      ? 'bg-purple-500 border-purple-500' 
                      : 'bg-gray-700/50 border-gray-500 group-hover:border-purple-400'
                  }`}>
                    {isChecked && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    value={option}
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-white text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'RADIO':
        return (
          <div className="space-y-3">
            {options.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                  fieldValue === option 
                    ? 'bg-purple-500 border-purple-500' 
                    : 'bg-gray-700/50 border-gray-500 group-hover:border-purple-400'
                }`}>
                  {fieldValue === option && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <input
                  type="radio"
                  value={option}
                  checked={fieldValue === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="hidden"
                />
                <span className="text-white text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={baseInputClasses}
          />
        );

      case 'PHONE':
        return (
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              value={fieldValue}
              onChange={(e) => handlePhoneInput(field.id, e.target.value)}
              placeholder={field.placeholder || 'Enter your phone number'}
              className={`${baseInputClasses} pl-12 backdrop-blur-md`}
              pattern="[0-9+\-\s\(\)]{10,}"
              title="Please enter a valid phone number (at least 10 digits)"
            />
          </div>
        );

      case 'DATE':
        return (
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Calendar className="w-5 h-5" />
            </div>
            <input
              type="date"
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`${baseInputClasses} pl-12`}
            />
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );
    }
  };

  const handleNextStep = () => {
    const totalSteps = Math.ceil(form.fields.length / 3);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-50 flex justify-center items-center p-4">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-white text-xl font-semibold">Loading form...</div>
            <div className="text-gray-400 mt-2">Preparing your registration experience</div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 z-50 flex justify-center items-center p-4">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-12 border border-green-500/30 shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Registration Complete!</h3>
          <p className="text-gray-300 mb-6">
            {existingSubmission ? 'Your registration has been updated successfully.' : 'Your spot has been secured for this event.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-50 flex justify-center items-center p-4">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl max-w-md">
          <div className="text-red-400 text-center mb-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <div className="text-xl font-semibold">Failed to load form</div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm rounded-t-2xl p-8 border-b border-gray-700/50 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-700/50 transition-all duration-300"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {form.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    {form.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Deadline: {new Date(form.deadline).toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Secure registration
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-white rounded-xl hover:bg-gray-700/50 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-300">
                Step {currentStep + 1} of {Math.ceil(form.fields.length / 3)}
              </div>
              <div className="text-sm text-gray-400">
                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / Math.ceil(form.fields.length / 3)) * 100}%` }}
              ></div>
            </div>
          </div>

          {generalError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">Submission Error</div>
                  <div className="text-sm opacity-90">{generalError}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {form.fields
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((field, index) => (
                <div 
                  key={field.id} 
                  className={`bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-300 hover:border-gray-600/50 ${
                    errors[field.id] ? 'border-red-500/30' : 'border-gray-600/30'
                  } ${index >= currentStep * 3 && index < (currentStep + 1) * 3 ? 'block' : 'hidden'}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      errors[field.id] 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {getFieldIcon(field.type)}
                    </div>
                    <div className="flex-1">
                      <label className="block text-white font-semibold text-lg mb-1">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {field.helpText && (
                        <div className="text-gray-400 text-sm">
                          {field.helpText}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {renderField(field)}
                  
                  {errors[field.id] && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-3">
                      <AlertCircle className="w-4 h-4" />
                      {errors[field.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-700/50">
              <div className="flex items-center gap-3 text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">
                  {isLastStep 
                    ? 'Review your information before submitting' 
                    : (existingSubmission ? 'Updating your registration' : 'Securing your spot')}
                </span>
              </div>
              
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-8 py-4 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all duration-300 font-semibold border border-gray-600/30"
                  >
                    Previous
                  </button>
                )}
                
                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Next
                    <Zap className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {existingSubmission ? 'Update Registration' : 'Complete Registration'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Security Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                SSL Encrypted
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Instant Confirmation
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Process
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFormSubmission;