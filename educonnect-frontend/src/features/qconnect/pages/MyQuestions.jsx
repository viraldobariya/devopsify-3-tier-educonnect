import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { editQuestion, myQuestions } from "../../../api/qnaApi";
import { Edit, X, Save, Loader, MessageSquare, Tag, ChevronRight } from "lucide-react";

const MyQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [validationErrors, setValidationErrors] = useState({});
  const currentUser = useSelector(store => store.auth.user);

  useEffect(() => {
    const fetchMyQuestions = async () => {
      try {
        setLoading(true);
        const res = await myQuestions();
        if (res.status === 200) {
          setQuestions(res.data);
        } else {
          setError("Failed to fetch questions");
        }
      } catch (err) {
        setError("An error occurred while fetching questions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyQuestions();
  }, [currentUser.username]);

  const handleEditClick = (question) => {
    setEditingId(question.id);
    setEditForm({
      title: question.title,
      description: question.description
    });
    setValidationErrors({});
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", description: "" });
    setValidationErrors({});
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    
    if (!editForm.title) {
      errors.title = "Title cannot be empty";
    } else if (editForm.title.length < 8) {
      errors.title = "Title must be at least 8 characters";
    }
    
    if (!editForm.description) {
      errors.description = "Description cannot be empty";
    } else if (editForm.description.length < 20) {
      errors.description = "Description must be at least 20 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async (questionId) => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      const response = await editQuestion({
        id: questionId,
        title: editForm.title,
        description: editForm.description
      })

      if (response.status === 200) {
        setQuestions(prev =>
          prev.map(q => q.id === questionId ? {...q, title: editForm.title, description: editForm.description} : q)
        );
        setEditingId(null);
      } else {
        setError("Failed to update question");
      }
    } catch (err) {
      setError("An error occurred while updating the question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-purple-500" />
            My Questions
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your previously asked questions
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300">
          {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
        </div>
      </div>
      
      {loading && questions.length === 0 && (
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6 mb-6"></div>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-700 rounded-md"></div>
                  <div className="h-8 w-24 bg-gray-700 rounded-md"></div>
                </div>
                <div className="h-8 w-16 bg-gray-700 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-900/40 border border-red-700/50 rounded-xl flex items-center gap-3">
          <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div className="text-center py-12 bg-gray-800/40 rounded-xl border border-gray-700">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
            <MessageSquare className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Questions Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            You haven't posted any questions yet. When you do, they'll appear here.
          </p>
          <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
            Ask a Question
          </button>
        </div>
      )}

      <div className="space-y-6">
        {questions.map(question => (
          <div key={question.id} className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors">
            {editingId === question.id ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 bg-gray-700/60 text-white rounded-lg border ${
                      validationErrors.title ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
                    placeholder="Enter a clear and descriptive title"
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {validationErrors.title}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 bg-gray-700/60 text-white rounded-lg border ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/30 min-h-[150px]`}
                    placeholder="Provide details about your question..."
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {validationErrors.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleSaveEdit(question.id)}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="px-5 py-2.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white hover:text-purple-400 transition-colors cursor-pointer">
                      {question.title}
                    </h2>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <span>Posted on {formatDate(question.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{question.answers} answers</span>
                      <span className="mx-2">•</span>
                      <span>{question.views} views</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditClick(question)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
                
                <p className="text-gray-300 whitespace-pre-line">
                  {question.description.length > 200 
                    ? `${question.description.substring(0, 200)}...` 
                    : question.description
                  }
                </p>
                
                {question.description.length > 200 && (
                  <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                    Read more <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {question.tags.map(tag => (
                      <span 
                        key={tag.id} 
                        className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-lg flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyQuestions;