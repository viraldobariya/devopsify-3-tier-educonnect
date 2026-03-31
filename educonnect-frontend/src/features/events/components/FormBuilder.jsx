import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Eye, Settings, GripVertical, Sparkles, Layout, Zap, Save, X, ArrowLeft, ArrowRight, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import FormFieldEditor from './FormFieldEditor';
import FormPreview from './FormPreview';
import eventApi from '../../../api/eventApi';

const FIELD_TYPES = [
  { id: 'TEXT', label: 'Text Input', icon: '📝', description: 'Single line text input', color: 'from-blue-500 to-cyan-500' },
  { id: 'EMAIL', label: 'Email', icon: '📧', description: 'Email address field', color: 'from-green-500 to-emerald-500' },
  { id: 'NUMBER', label: 'Number', icon: '🔢', description: 'Numeric input field', color: 'from-purple-500 to-pink-500' },
  { id: 'DROPDOWN', label: 'Dropdown', icon: '📋', description: 'Select from options', color: 'from-orange-500 to-red-500' },
  { id: 'CHECKBOX', label: 'Checkbox', icon: '☑️', description: 'Multiple selection', color: 'from-indigo-500 to-purple-500' },
  { id: 'TEXTAREA', label: 'Text Area', icon: '📄', description: 'Multi-line text input', color: 'from-teal-500 to-green-500' },
  { id: 'DATE', label: 'Date', icon: '📅', description: 'Date picker', color: 'from-red-500 to-orange-500' },
  { id: 'PHONE', label: 'Phone', icon: '📱', description: 'Phone number field', color: 'from-yellow-500 to-amber-500' },
  { id: 'RADIO', label: 'Radio', icon: '🔘', description: 'Single selection', color: 'from-pink-500 to-rose-500' }
];

const FormBuilder = ({ eventId, form, onFormSaved, onClose ,shareEventData , shareBannerFile , onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
    isActive: true,
    maxResponses: 1,
    fields: []
  });
  const [editingField, setEditingField] = useState(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draggedField, setDraggedField] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');

  useEffect(() => {
    if (form) {
      // Format the form data exactly as backend expects
      setFormData({
        title: form.title || '',
        deadline: form.deadline ? form.deadline.slice(0, 16) : '',
        isActive: form.isActive !== undefined ? form.isActive : true,
        maxResponses: form.maxResponses || 1,
        fields: form.fields ? form.fields.map(field => ({
          id: field.id, // Keep the original backend ID
          label: field.label || '',
          type: field.type || 'TEXT',
          required: field.required || false,
          orderIndex: field.orderIndex || 0,
          placeholder: field.placeholder || '',
          helpText: field.helpText || '',
          options: field.options || null
        })) : []
      });
    }
  }, [form]);

  const addField = (fieldType) => {
    const newField = {
      id: null, // null for new fields (backend will assign ID)
      tempId: `temp-${Date.now()}-${Math.random()}`, // unique temporary ID for new fields
      label: '', 
      type: fieldType.id,
      required: false,
      orderIndex: formData.fields.length + 1,
      placeholder: '',
      helpText: '',
      options: ['DROPDOWN', 'CHECKBOX', 'RADIO'].includes(fieldType.id) ? '[]' : null
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setEditingField(newField);
    setShowFieldEditor(true);
  };

  const editField = (field) => {
    setEditingField(field);
    setShowFieldEditor(true);
  };

  const saveField = (updatedField) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => {
        // Match by ID for existing fields, or by tempId for new fields
        if (field.id && updatedField.id && field.id === updatedField.id) {
          return updatedField;
        }
        if (field.tempId && updatedField.tempId && field.tempId === updatedField.tempId) {
          return updatedField;
        }
        return field;
      })
    }));
    setShowFieldEditor(false);
    setEditingField(null);
  };

  const deleteField = (fieldIdentifier) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => 
        field.id !== fieldIdentifier && field.tempId !== fieldIdentifier
      ).map((field, index) => ({ ...field, orderIndex: index + 1 }))
    }));
  };

  const handleDragStart = (e, field) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedField) return;
    
    const draggedIndex = formData.fields.findIndex(field => 
      (field.id && draggedField.id && field.id === draggedField.id) ||
      (field.tempId && draggedField.tempId && field.tempId === draggedField.tempId)
    );
    if (draggedIndex === dropIndex) return;
    
    const newFields = [...formData.fields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(dropIndex, 0, removed);
    
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      orderIndex: index + 1
    }));
    
    setFormData(prev => ({
      ...prev,
      fields: updatedFields
    }));
    
    setDraggedField(null);
  };

  // Helper function to format options for backend
  const formatOptionsForBackend = (options) => {
    if (!options || options === '[]' || options === 'null') return null;
    
    try {
      // If it's already a stringified array, return as is
      if (typeof options === 'string' && options.startsWith('[')) {
        return options;
      }
      
      // If it's an array, stringify it
      if (Array.isArray(options)) {
        return JSON.stringify(options);
      }
      
      return null;
    } catch (error) {
      console.error('Error formatting options:', error);
      return null;
    }
  };


  const createEvent = async (bannerFile, eventData) => {
    try {
      const response = await eventApi.createEvent(eventData, bannerFile);
      onEventCreated(response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Format deadline correctly for LocalDateTime (remove timezone info)
    const formatDeadlineForBackend = (deadlineString) => {
      if (!deadlineString) return null;
      
      // Remove the 'Z' timezone indicator and any milliseconds
      // LocalDateTime format: "2025-09-30T03:30:00"
      const date = new Date(deadlineString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    // Prepare data for backend exactly as required
    const apiFormData = {
      title: formData.title,
      isActive: formData.isActive,
      maxResponses: formData.maxResponses,
      deadline: formatDeadlineForBackend(formData.deadline),
      fields: formData.fields.map(field => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        orderIndex: field.orderIndex,
        placeholder: field.placeholder || null,
        helpText: field.helpText || null,
        options: formatOptionsForBackend(field.options),
        isDeleted: false
      }))
    };

    // console.log('Sending to backend:', JSON.stringify(apiFormData, null, 2));

    let response;
    if (form?.id) {
      response = await eventApi.updateForm(eventId, form.id, apiFormData);
    } else {
      const eventResponse = await createEvent(shareBannerFile, shareEventData);
      console.log('Created event:', eventResponse);
      
      response = await eventApi.createForm(eventResponse.id, apiFormData);
    }

    onFormSaved(response.data);
    onClose();
  } catch (err) {
    console.error('Error saving form:', err);
    setError(err.response?.data?.message || err.message || 'Failed to save form. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {form?.id ? 'Edit Registration Form' : 'Create Registration Form'}
              </h2>
              <p className="text-gray-400 text-sm">Design your event registration form</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Tab Navigation */}
            <div className="flex bg-gray-700/50 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'builder' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Builder
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Builder Panel */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${
            activeTab === 'builder' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}>
            <div className="flex-1 p-6 overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">Error Saving Form</div>
                      <div className="text-sm opacity-90">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Settings */}
                <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Form Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-gray-300 font-medium">Form Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-600/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-500/30 focus:border-purple-500/50 transition-all"
                        placeholder="Enter form title..."
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-300 font-medium">Submission Deadline</label>
                      <input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-600/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-500/30 focus:border-purple-500/50 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-300 font-medium">Max Responses *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxResponses}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxResponses: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-3 bg-gray-600/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-500/30 focus:border-purple-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="text-gray-300">Form is active and accepting responses</label>
                  </div>
                </div>

                {/* Field Types Palette */}
                <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Add Field Types
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {FIELD_TYPES.map(fieldType => (
                      <button
                        key={fieldType.id}
                        type="button"
                        onClick={() => addField(fieldType)}
                        className="group p-4 bg-gray-600/30 rounded-xl border border-gray-500/30 hover:border-gray-400/50 hover:scale-105 transition-all duration-300 text-left"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${fieldType.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <span className="text-2xl">{fieldType.icon}</span>
                        </div>
                        <div className="font-semibold text-white mb-1">{fieldType.label}</div>
                        <div className="text-gray-400 text-sm">{fieldType.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields List */}
                <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-purple-400" />
                      Form Fields ({formData.fields.length})
                    </h3>
                    {formData.fields.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <HelpCircle className="w-4 h-4" />
                        Drag to reorder fields
                      </div>
                    )}
                  </div>
                  
                  {formData.fields.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layout className="w-10 h-10 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">No fields added yet</h4>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Start building your form by selecting a field type from the options above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.fields.map((field, index) => (
                        <div
                          key={field.id || field.tempId || `temp-${index}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, field)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`group bg-gray-600/30 rounded-xl p-4 flex items-center justify-between cursor-move transition-all duration-300 border-2 ${
                            dragOverIndex === index 
                              ? 'border-purple-500/50 bg-purple-500/10' 
                              : 'border-gray-500/30 hover:border-gray-400/50'
                          } ${
                            (draggedField?.id && field.id && draggedField.id === field.id) ||
                            (draggedField?.tempId && field.tempId && draggedField.tempId === field.tempId)
                              ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-3 text-gray-400 group-hover:text-purple-400 transition-colors">
                              <GripVertical className="w-5 h-5" />
                              <div className="text-sm font-mono bg-gray-700/50 px-2 py-1 rounded">
                                #{index + 1}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-white font-semibold">{field.label || 'Unnamed Field'}</div>
                                {field.required && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                                    Required
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 capitalize">
                                  {field.type.toLowerCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                {field.placeholder && <span>Placeholder: "{field.placeholder}"</span>}
                                {field.helpText && <span>Help: "{field.helpText}"</span>}
                                {field.options && field.options !== '[]' && <span>Options: {field.options}</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => editField(field)}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                              title="Edit field"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteField(field.id || field.tempId)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Delete field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-600/30">
                  <div className="text-sm text-gray-400">
                    {formData.fields.length > 0 ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Ready to save {formData.fields.length} field{formData.fields.length !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      'Add at least one field to save the form'
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all border border-gray-600/30"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || formData.fields.length === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {form?.id ? 'Update Form' : 'Create Form'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${
            activeTab === 'preview' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-400" />
                  Form Preview
                </h3>
                <p className="text-gray-400 mb-6">This is how your form will appear to registrants</p>
                <FormPreview formData={formData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {showFieldEditor && (
        <FormFieldEditor
          field={editingField}
          onSave={saveField}
          onClose={() => {
            setShowFieldEditor(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

export default FormBuilder;