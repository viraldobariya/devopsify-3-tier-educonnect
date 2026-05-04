import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  fetchQuestionById,
  postAnswer,
  voteQuestion,
  voteAnswer,
} from '../../../api/qnaApi';
import { ArrowUp, ArrowDown, MessageSquare, User, Clock, Edit, Send, Loader } from 'lucide-react';

const Question = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        const res = await fetchQuestionById(id);
        if (res.status === 200) {
          setQuestion(res.data);
        } else {
          setError("Failed to load question.");
        }
      } catch (err) {
        setError(err.message || 'Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  const handleVote = async (type) => {
    if (type === question.userVote) return;
    try {
      const res = await voteQuestion({
        questionId: question.id,
        userId: currentUser.id,
        type
      });
      if (res.status === 200) {
        let tempVoteCount = question.voteCount;

        if (question.userVote === "UPVOTE") tempVoteCount -= 2;
        if (question.userVote === "DOWNVOTE") tempVoteCount += 2;
        if (question.userVote === "") tempVoteCount += type === "UPVOTE" ? 1 : -1;
        setQuestion(prev => ({...prev, userVote: type, voteCount: tempVoteCount}));
      }
    } catch (err) {
      setError(err.message || 'Failed to vote');
    }
  };

  const handleAnswerVote = async (answerId, type) => {
    const answer = question.answers.find(a => a.id === answerId);
    if (answer.userVote === type) return;
    
    try {
      const res = await voteAnswer({
        answerId,
        userId: currentUser.id,
        type
      });
      if (res.status === 200) {
        let userVote = answer.userVote;
        let tempVoteCount = answer.voteCount;

        if (userVote === "UPVOTE") tempVoteCount -= 2;
        if (userVote === "DOWNVOTE") tempVoteCount += 2;
        if (userVote === "") tempVoteCount += type === "UPVOTE" ? 1 : -1;
        
        setQuestion(prev => ({
          ...prev,
          answers: prev.answers.map(a => 
            a.id === answerId 
              ? {...a, userVote: type, voteCount: tempVoteCount} 
              : a
          )
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to vote');
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      setError('Answer cannot be empty');
      return;
    }

    try {
      setSubmittingAnswer(true);
      const res = await postAnswer({
        questionId: question.id,
        description: answerContent,
        authorId: currentUser.id
      });
      if (res.status === 200) {
        setQuestion(prev => ({
          ...prev,
          answers: [res.data, ...prev.answers]
        }));
        setAnswerContent('');
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const toggleAnswerExpansion = (id) => {
    setExpandedAnswer(expandedAnswer === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6 mb-8"></div>
            
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-700 rounded-md"></div>
              <div className="h-8 w-20 bg-gray-700 rounded-md"></div>
              <div className="h-8 w-28 bg-gray-700 rounded-md"></div>
            </div>
          </div>
          
          <div className="mt-12">
            <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse mb-8">
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-4/6 mb-6"></div>
                <div className="h-8 w-32 bg-gray-700 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="p-4 bg-red-900/40 border border-red-700/50 rounded-xl flex items-center gap-3">
          <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-16 bg-gray-800/40 rounded-xl border border-gray-700">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
            <MessageSquare className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Question Not Found</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            The question you're looking for doesn't exist or may have been removed.
          </p>
          <Link 
            to="/qna"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 inline-flex items-center gap-2"
          >
            Browse Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Question Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 mb-10 overflow-hidden">
        <div className="p-6">
          <div className="flex gap-5">
            {/* Vote Section */}
            <div className="flex flex-col items-center w-16">
              <button
                onClick={() => handleVote('UPVOTE')}
                disabled={currentUser.id === question.author.id}
                className={`p-2 rounded-lg transition-colors ${
                  question.userVote === 'UPVOTE'
                    ? 'text-green-400 bg-green-900/20'
                    : 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                } ${currentUser.id === question.author.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <span className="font-semibold text-white text-xl my-1">
                {question.voteCount || 0}
              </span>
              <button
                onClick={() => handleVote('DOWNVOTE')}
                disabled={currentUser.id === question.author.id}
                className={`p-2 rounded-lg transition-colors ${
                  question.userVote === 'DOWNVOTE'
                    ? 'text-red-400 bg-red-900/20'
                    : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                } ${currentUser.id === question.author.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowDown className="h-5 w-5" />
              </button>
              
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{question.answers.length || 0}</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-4">
                {question.title}
              </h1>
              
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-line text-gray-300">{question.description}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-lg flex items-center gap-1"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-700 p-1.5 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-gray-300">{question.author.username}</span>
                    <span className="mx-2">•</span>
                    <span>Asked {formatRelativeTime(question.createdAt)}</span>
                  </div>
                </div>
                
                {question.updatedAt !== question.createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>edited {formatRelativeTime(question.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>
        </div>

        {question.answers.length === 0 ? (
          <div className="text-center py-8 bg-gray-800/40 rounded-xl border border-gray-700">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Edit className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Answers Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Be the first to share your knowledge and help the community!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
              >
                <div className="p-6">
                  <div className="flex gap-5">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center w-16">
                      <button
                        onClick={() => handleAnswerVote(answer.id, 'UPVOTE')}
                        className={`p-2 rounded-lg transition-colors ${
                          answer.userVote === 'UPVOTE'
                            ? 'text-green-400 bg-green-900/20'
                            : 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                        }`}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </button>
                      <span className="font-semibold text-white text-xl my-1">
                        {answer.voteCount || 0}
                      </span>
                      <button
                        onClick={() => handleAnswerVote(answer.id, 'DOWNVOTE')}
                        className={`p-2 rounded-lg transition-colors ${
                          answer.userVote === 'DOWNVOTE'
                            ? 'text-red-400 bg-red-900/20'
                            : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                        }`}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1">
                      <div className="prose prose-invert max-w-none">
                        <p className={`whitespace-pre-line text-gray-300 ${expandedAnswer !== answer.id && 'line-clamp-4'}`}>
                          {answer.description}
                        </p>
                      </div>
                      
                      {answer.description.length > 300 && (
                        <button 
                          onClick={() => toggleAnswerExpansion(answer.id)}
                          className="text-purple-400 hover:text-purple-300 text-sm mt-2 flex items-center gap-1"
                        >
                          {expandedAnswer === answer.id ? 'Show less' : 'Read more'}
                        </button>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-700 p-1.5 rounded-full">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-gray-300">{answer.author.username}</span>
                            <span className="mx-2">•</span>
                            <span>Answered {formatRelativeTime(answer.createdAt)}</span>
                          </div>
                        </div>
                        
                        {/* {answer.updatedAt !== answer.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {console.log(answer.updatedAt)}
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answer Form */}
      {currentUser.id !== question.author?.id && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Edit className="h-5 w-5 text-purple-400" />
            Your Answer
          </h2>
          
          {error && (
            <div className="p-4 mb-4 bg-red-900/40 border border-red-700/50 rounded-xl flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleAnswerSubmit}>
            <textarea
              className="w-full px-4 py-3 bg-gray-700/60 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 min-h-[150px] mb-4"
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Provide a detailed answer to help the community..."
            />
            
            <button
              type="submit"
              disabled={submittingAnswer}
              className={`px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                submittingAnswer 
                  ? "bg-purple-700 cursor-not-allowed" 
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/30"
              }`}
            >
              {submittingAnswer ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Posting Answer...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Post Your Answer
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Question;