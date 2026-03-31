import React from 'react';

const FormPreview = ({ formData }) => {
  const renderField = (field) => {
    const baseInputClasses = "w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600";
    const baseCheckboxClasses = "w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500";
    
    switch (field.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled
          />
        );
      
      case 'EMAIL':
        return (
          <input
            type="email"
            placeholder={field.placeholder || 'Enter your email'}
            className={baseInputClasses}
            disabled
          />
        );
      
      case 'NUMBER':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            min={field.minValue}
            max={field.maxValue}
            className={baseInputClasses}
            disabled
          />
        );
      
      case 'DROPDOWN':
        let dropdownOptions = [];
        try {
          dropdownOptions = JSON.parse(field.options || '[]');
        } catch (e) {
          dropdownOptions = [];
        }
        
        return (
          <select className={baseInputClasses} disabled>
            <option value="">{field.placeholder || 'Select an option'}</option>
            {dropdownOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'CHECKBOX':
        let checkboxOptions = [];
        try {
          checkboxOptions = JSON.parse(field.options || '[]');
        } catch (e) {
          checkboxOptions = [];
        }
        
        return (
          <div className="space-y-2">
            {checkboxOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`checkbox-${field.id}-${index}`}
                  className={baseCheckboxClasses}
                  disabled
                />
                <label htmlFor={`checkbox-${field.id}-${index}`} className="text-gray-300 text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'TEXTAREA':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={4}
            className={baseInputClasses}
            disabled
          />
        );
      
      case 'DATE':
        return (
          <input
            type="date"
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled
          />
        );
      
      case 'PHONE':
        return (
          <input
            type="tel"
            placeholder={field.placeholder || 'Enter your phone number'}
            className={baseInputClasses}
            disabled
          />
        );
      
      case 'RADIO':
        let radioOptions = [];
        try {
          radioOptions = JSON.parse(field.options || '[]');
        } catch (e) {
          radioOptions = [];
        }
        
        return (
          <div className="space-y-2">
            {radioOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  id={`radio-${field.id}-${index}`}
                  name={`radio-${field.id}`}
                  className={baseCheckboxClasses}
                  disabled
                />
                <label htmlFor={`radio-${field.id}-${index}`} className="text-gray-300 text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled
          />
        );
    }
  };

  if (!formData || !formData.fields) {
    return (
      <div className="text-gray-400 text-center py-8">
        No form data to preview
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      {/* Form Header */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-2">
          {formData.title || 'Registration Form'}
        </h4>
        {formData.deadline && (
          <div className="text-sm text-gray-400">
            Deadline: {new Date(formData.deadline).toLocaleString()}
          </div>
        )}
        {formData.maxResponses && (
          <div className="text-sm text-gray-400">
            Max Responses: {formData.maxResponses}
          </div>
        )}
        {!formData.isActive && (
          <div className="text-sm text-yellow-400 mt-1">
            ⚠️ Form is currently inactive
          </div>
        )}
      </div>

      {/* Form Fields */}
      {formData.fields.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          No fields added yet
        </div>
      ) : (
        <div className="space-y-6">
          {formData.fields
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((field) => (
            <div key={field.id} className="space-y-3">
              <label className="block text-gray-300 text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              
              {renderField(field)}
              
              {field.helpText && (
                <div className="text-xs text-gray-400 mt-1">
                  {field.helpText}
                </div>
              )}
            </div>
          ))}
          
          {/* Submit Button Preview */}
          <div className="pt-4 border-t border-gray-600 mt-6">
            <button
              type="button"
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg opacity-50 cursor-not-allowed font-medium hover:bg-purple-700 transition-colors"
              disabled
            >
              Submit Registration
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              This is a preview. Submit button is disabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormPreview;