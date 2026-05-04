import { useState } from "react";
import { useSelector } from "react-redux";
import { saveQuestion } from "../../../api/qnaApi";
import { MessageSquare, Tag, BookOpen, Send, Loader, X } from "lucide-react";

const PostQuestion = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const currentUser = useSelector(store => store.auth.user);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onChange = (e) => {
    setErrorMessage("");
    setValidationErrors({});
    setForm(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const validateForm = () => {
    const errors = {};
    const regex = /^(?=.{1,25}$)(?:[a-zA-Z0-9]{1,10})(?: (?:[a-zA-Z0-9]{1,10})){0,4}$/;
    
    if (!form.title) {
      errors.title = "Title is required";
    } else if (form.title.length < 8) {
      errors.title = "Title must be at least 8 characters";
    }
    
    if (!form.description) {
      errors.description = "Description is required";
    } else if (form.description.length < 20) {
      errors.description = "Description must be at least 20 characters";
    }
    
    if (!form.tags) {
      errors.tags = "Tags are required";
    } else if (!regex.test(form.tags)) {
      errors.tags = "Invalid tags format. Max 5 tags, 25 chars total, 10 chars each";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const postHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await saveQuestion({
        title: form.title,
        description: form.description,
        tags: form.tags,
        authorUsername: currentUser.username
      });
      
      if (res.status === 200) {
        setForm({ title: "", description: "", tags: "" });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setErrorMessage(res.statusText + " from Backend.");
      }
    } catch (e) {
      setErrorMessage("Something went wrong. Please try again.");
      console.log("error while saving question.", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-600 p-2 rounded-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Post a New Question</h1>
          <p className="text-gray-400 mt-1">Share your knowledge and get answers</p>
        </div>
      </div>
      
      {success ? (
        <div className="p-6 bg-green-900/20 border border-green-700/50 rounded-xl mb-6 flex flex-col items-center">
          <div className="bg-green-600/20 p-3 rounded-full mb-4">
            <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">Question Posted!</h3>
          <p className="text-gray-300 mt-2 text-center">
            Your question has been successfully posted. You can view it in the Q&A section.
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="mt-4 px-5 py-2.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Post Another Question
          </button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={postHandler}>
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Title *
            </label>
            <input
              className={`w-full px-4 py-3 bg-gray-700/60 text-white rounded-lg border ${
                validationErrors.title ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
              onChange={onChange}
              value={form.title}
              type="text"
              name="title"
              id="title"
              placeholder="Enter your question title"
            />
            {validationErrors.title && (
              <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {validationErrors.title}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Minimum 8 characters. Be specific and imagine you're asking another person.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Description *
            </label>
            <textarea
              className={`w-full px-4 py-3 bg-gray-700/60 text-white rounded-lg border ${
                validationErrors.description ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/30 min-h-[200px]`}
              onChange={onChange}
              value={form.description}
              id="description"
              name="description"
              placeholder="Provide detailed information about your question"
            />
            {validationErrors.description && (
              <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {validationErrors.description}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Minimum 20 characters. Include all the information someone would need to answer your question.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="tag" className="block text-sm font-medium text-gray-300 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags *
            </label>
            <input
              className={`w-full px-4 py-3 bg-gray-700/60 text-white rounded-lg border ${
                validationErrors.tags ? 'border-red-500' : 'border-gray-600 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
              onChange={onChange}
              type="text"
              value={form.tags}
              name="tags"
              id="tag"
              placeholder="tag1 tag2 tag3"
            />
            {validationErrors.tags && (
              <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {validationErrors.tags}
              </p>
            )}
            <div className="text-xs text-gray-500 mt-1">
              <p>• Maximum 5 tags with maximum 25 characters total</p>
              <p>• Each tag can have maximum 10 characters</p>
              <p>• Separate tags with spaces</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">javascript</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">react</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">programming</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">webdev</span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-900/40 border border-red-700/50 rounded-xl flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
              loading 
                ? "bg-purple-700 cursor-not-allowed" 
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/30"
            }`}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Posting Question...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Post Your Question
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default PostQuestion;