import React, { useState, useEffect } from 'react';
import { X, Save, ChevronDown, HelpCircle } from 'lucide-react';

const FormFieldEditor = ({ field, onSave, onClose }) => {
  const [fieldData, setFieldData] = useState({
    id: null,
    tempId: null,
    label: '',
    type: 'TEXT',
    required: false,
    orderIndex: 0,
    placeholder: '',
    helpText: '',
    options: null
  });

  const [optionsText, setOptionsText] = useState('');
  const [activeSection, setActiveSection] = useState('basic'); // For accordion sections

  useEffect(() => {
    if (field) {
      const fieldDataCopy = {
        id: field.id ?? null,
        tempId: field.tempId ?? null,
        label: field.label || '',
        type: field.type || 'TEXT',
        required: field.required || false,
        orderIndex: field.orderIndex || 0,
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        options: field.options || null
      };
      
      setFieldData(fieldDataCopy);
      
      if (['DROPDOWN', 'CHECKBOX', 'RADIO'].includes(field.type) && field.options) {
        try {
          if (typeof field.options === 'string') {
            const optionsArray = JSON.parse(field.options);
            setOptionsText(optionsArray.join('\n'));
          } else if (Array.isArray(field.options)) {
            setOptionsText(field.options.join('\n'));
          } else {
            setOptionsText('');
          }
        } catch (e) {
          setOptionsText('');
        }
      } else {
        setOptionsText('');
      }
    }
  }, [field]);

  const handleSave = () => {
    let finalOptions = null;
    
    if (['DROPDOWN', 'CHECKBOX', 'RADIO'].includes(fieldData.type)) {
      const optionsArray = optionsText
        .split('\n')
        .map(option => option.trim())
        .filter(option => option.length > 0);
      
      finalOptions = optionsArray.length > 0 ? JSON.stringify(optionsArray) : null;
    }

    const savedField = {
      ...fieldData,
      options: finalOptions
    };

    onSave(savedField);
  };

  const handleChange = (fieldName, value) => {
    setFieldData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const isOptionField = ['DROPDOWN', 'CHECKBOX', 'RADIO'].includes(fieldData.type);

  if (!field) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700/50">
          <div className="text-center text-red-400">
            <p>Error: No field data provided</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-700 rounded-lg text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col border border-gray-700/50">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700/50 flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {field.id ? 'Edit Field' : 'New Field'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{fieldData.type} Field</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Basic Settings - Always visible */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium flex items-center gap-2">
                  Field Label <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fieldData.label}
                  onChange={(e) => handleChange('label', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 focus:border-purple-500 transition-all"
                  placeholder="What should this field be called?"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <div>
                  <span className="text-gray-300 font-medium block">Required Field</span>
                  <span className="text-gray-500 text-sm">Users must fill this field</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fieldData.required}
                    onChange={(e) => handleChange('required', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Advanced Settings - Accordion */}
            <div className="border border-gray-700/50 rounded-lg">
              {/* Text Settings Accordion */}
              <div>
                <button
                  onClick={() => toggleSection('text')}
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-700/30 transition-colors"
                >
                  <span className="font-medium text-gray-300">Text & Display Settings</span>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      activeSection === 'text' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeSection === 'text' && (
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Placeholder Text</label>
                      <input
                        type="text"
                        value={fieldData.placeholder}
                        onChange={(e) => handleChange('placeholder', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 focus:border-purple-500 transition-all"
                        placeholder="Hint text for users"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 font-medium flex items-center gap-2">
                        Help Text <HelpCircle className="w-4 h-4 text-gray-500" />
                      </label>
                      <input
                        type="text"
                        value={fieldData.helpText}
                        onChange={(e) => handleChange('helpText', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 focus:border-purple-500 transition-all"
                        placeholder="Additional information for users"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Options Accordion - Only show for relevant field types */}
              {isOptionField && (
                <div className="border-t border-gray-700/50">
                  <button
                    onClick={() => toggleSection('options')}
                    className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-700/30 transition-colors"
                  >
                    <span className="font-medium text-gray-300">
                      {fieldData.type === 'DROPDOWN' && 'Dropdown Options'}
                      {fieldData.type === 'CHECKBOX' && 'Checkbox Options'}
                      {fieldData.type === 'RADIO' && 'Radio Options'}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        activeSection === 'options' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {activeSection === 'options' && (
                    <div className="px-4 pb-4">
                      <textarea
                        value={optionsText}
                        onChange={(e) => setOptionsText(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 focus:border-purple-500 transition-all"
                        rows="4"
                        placeholder="Enter each option on a new line"
                      />
                      <div className="text-gray-500 text-sm mt-2 space-y-1">
                        <div>• Enter each option on a new line</div>
                        <div>• Options will be saved as a list</div>
                        <div>• Leave empty if no options needed</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Field Type Information */}
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-blue-300 text-sm">
                <strong className="block mb-1">{fieldData.type} Field Type</strong>
                {fieldData.type === 'TEXT' && 'Single-line text input for short answers'}
                {fieldData.type === 'EMAIL' && 'Validates email address format automatically'}
                {fieldData.type === 'NUMBER' && 'Accepts numeric input only with validation'}
                {fieldData.type === 'TEXTAREA' && 'Multi-line text input for longer responses'}
                {fieldData.type === 'DATE' && 'Date picker for calendar selection'}
                {fieldData.type === 'PHONE' && 'Phone number input with formatting'}
                {fieldData.type === 'DROPDOWN' && 'Dropdown menu for single selection'}
                {fieldData.type === 'CHECKBOX' && 'Multiple selection from checkbox list'}
                {fieldData.type === 'RADIO' && 'Single selection from radio buttons'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700/50 flex-shrink-0 bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all border border-gray-600/30 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!fieldData.label.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormFieldEditor;