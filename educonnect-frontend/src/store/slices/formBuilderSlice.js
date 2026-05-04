import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventApi from '../../api/eventApi';

// Async thunks for form management
export const createForm = createAsyncThunk(
  'formBuilder/createForm',
  async ({ eventId, formData }, { rejectWithValue }) => {
    try {
      const response = await eventApi.createForm(eventId, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create form');
    }
  }
);

export const updateForm = createAsyncThunk(
  'formBuilder/updateForm',
  async ({ eventId, formId, formData }, { rejectWithValue }) => {
    try {
      const response = await eventApi.updateForm(eventId, formId, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update form');
    }
  }
);

export const fetchActiveForm = createAsyncThunk(
  'formBuilder/fetchActiveForm',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventApi.getActiveForm(eventId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'No active form found');
    }
  }
);

export const fetchFormById = createAsyncThunk(
  'formBuilder/fetchFormById',
  async ({ eventId, formId }, { rejectWithValue }) => {
    try {
      const response = await eventApi.getFormById(eventId, formId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch form');
    }
  }
);

export const submitForm = createAsyncThunk(
  'formBuilder/submitForm',
  async ({ eventId, formId, responses }, { rejectWithValue }) => {
    try {
      const response = await eventApi.submitForm(eventId, formId, responses);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit form');
    }
  }
);

export const updateFormSubmission = createAsyncThunk(
  'formBuilder/updateFormSubmission',
  async ({ eventId, formId, responses }, { rejectWithValue }) => {
    try {
      const response = await eventApi.updateFormSubmission(eventId, formId, responses);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update form submission');
    }
  }
);

export const fetchFormSubmission = createAsyncThunk(
  'formBuilder/fetchFormSubmission',
  async ({ eventId, formId }, { rejectWithValue }) => {
    try {
      const response = await eventApi.getFormSubmission(eventId, formId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch form submission');
    }
  }
);

const initialState = {
  // Current form being built/edited
  currentForm: null,
  
  // Form fields being edited
  fields: [],
  
  // Form metadata
  formMetadata: {
    title: '',
    deadline: null,
    isActive: true
  },
  
  // Field being edited
  editingField: null,
  
  // Form submission data
  submissionData: {},
  formResponses: {},
  
  // UI state
  showPreview: false,
  showFieldEditor: false,
  draggedField: null,
  dragOverIndex: null,
  
  // Loading states
  loading: false,
  submitting: false,
  
  // Error states
  error: null,
  fieldErrors: {},
  
  // Success message
  successMessage: null,
  
  // Validation state
  isFormValid: true
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    // Form metadata actions
    setFormTitle: (state, action) => {
      state.formMetadata.title = action.payload;
    },
    setFormDeadline: (state, action) => {
      state.formMetadata.deadline = action.payload;
    },
    setFormActive: (state, action) => {
      state.formMetadata.isActive = action.payload;
    },
    
    // Field management actions
    addField: (state, action) => {
      const newField = {
        id: Date.now(),
        ...action.payload,
        orderIndex: state.fields.length + 1
      };
      state.fields.push(newField);
    },
    updateField: (state, action) => {
      const { fieldId, fieldData } = action.payload;
      const index = state.fields.findIndex(field => field.id === fieldId);
      if (index !== -1) {
        state.fields[index] = { ...state.fields[index], ...fieldData };
      }
    },
    deleteField: (state, action) => {
      const fieldId = action.payload;
      state.fields = state.fields
        .filter(field => field.id !== fieldId)
        .map((field, index) => ({ ...field, orderIndex: index + 1 }));
    },
    reorderFields: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [movedField] = state.fields.splice(sourceIndex, 1);
      state.fields.splice(destinationIndex, 0, movedField);
      
      // Update order indices
      state.fields.forEach((field, index) => {
        field.orderIndex = index + 1;
      });
    },
    
    // Field editing actions
    setEditingField: (state, action) => {
      state.editingField = action.payload;
    },
    clearEditingField: (state) => {
      state.editingField = null;
    },
    
    // UI state actions
    togglePreview: (state) => {
      state.showPreview = !state.showPreview;
    },
    setShowPreview: (state, action) => {
      state.showPreview = action.payload;
    },
    setShowFieldEditor: (state, action) => {
      state.showFieldEditor = action.payload;
    },
    
    // Drag and drop actions
    setDraggedField: (state, action) => {
      state.draggedField = action.payload;
    },
    setDragOverIndex: (state, action) => {
      state.dragOverIndex = action.payload;
    },
    clearDragState: (state) => {
      state.draggedField = null;
      state.dragOverIndex = null;
    },
    
    // Form submission actions
    setFormResponse: (state, action) => {
      const { fieldId, value } = action.payload;
      state.formResponses[fieldId] = value;
    },
    setFormResponses: (state, action) => {
      state.formResponses = action.payload;
    },
    clearFormResponses: (state) => {
      state.formResponses = {};
    },
    
    // Validation actions
    setFieldError: (state, action) => {
      const { fieldId, error } = action.payload;
      state.fieldErrors[fieldId] = error;
    },
    clearFieldError: (state, action) => {
      const fieldId = action.payload;
      delete state.fieldErrors[fieldId];
    },
    clearAllFieldErrors: (state) => {
      state.fieldErrors = {};
    },
    setFormValid: (state, action) => {
      state.isFormValid = action.payload;
    },
    
    // General actions
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetFormBuilder: () => initialState,
    
    // Load form for editing
    loadFormForEditing: (state, action) => {
      const form = action.payload;
      state.currentForm = form;
      state.formMetadata = {
        title: form.title || '',
        deadline: form.deadline || null,
        isActive: form.isActive !== undefined ? form.isActive : true
      };
      state.fields = form.fields || [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Form
      .addCase(createForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
        state.successMessage = 'Form created successfully';
      })
      .addCase(createForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Form
      .addCase(updateForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateForm.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
        state.successMessage = 'Form updated successfully';
      })
      .addCase(updateForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Active Form
      .addCase(fetchActiveForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveForm.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchActiveForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Form by ID
      .addCase(fetchFormById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchFormById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit Form
      .addCase(submitForm.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitForm.fulfilled, (state, action) => {
        state.submitting = false;
        state.submissionData = action.payload;
        state.successMessage = 'Form submitted successfully';
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Update Form Submission
      .addCase(updateFormSubmission.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateFormSubmission.fulfilled, (state, action) => {
        state.submitting = false;
        state.submissionData = action.payload;
        state.successMessage = 'Form submission updated successfully';
      })
      .addCase(updateFormSubmission.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Fetch Form Submission
      .addCase(fetchFormSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionData = action.payload;
        
        // Convert responses to formResponses format
        if (action.payload.responses) {
          const responses = {};
          action.payload.responses.forEach(response => {
            responses[response.fieldId] = response.value;
          });
          state.formResponses = responses;
        }
      })
      .addCase(fetchFormSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setFormTitle,
  setFormDeadline,
  setFormActive,
  addField,
  updateField,
  deleteField,
  reorderFields,
  setEditingField,
  clearEditingField,
  togglePreview,
  setShowPreview,
  setShowFieldEditor,
  setDraggedField,
  setDragOverIndex,
  clearDragState,
  setFormResponse,
  setFormResponses,
  clearFormResponses,
  setFieldError,
  clearFieldError,
  clearAllFieldErrors,
  setFormValid,
  clearError,
  clearSuccessMessage,
  resetFormBuilder,
  loadFormForEditing
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;