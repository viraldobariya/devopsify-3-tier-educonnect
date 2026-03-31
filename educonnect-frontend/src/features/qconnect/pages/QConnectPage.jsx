import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchQuestions } from '../../../api/qnaApi';
import { Search, MessageSquare, ArrowUp, ArrowDown, User, Plus, FileText, Loader } from 'lucide-react';

const QConnectMainPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchQuestions = async (reset = false) => {
    try {
      setLoading(true);
      setIsSearching(true);
      const res = await searchQuestions({
        search,
        page: reset ? 0 : page,
        size: 10,
      });

      if (res.status === 200) {
        const newQuestions = res.data.content;
        setQuestions((prev) =>
          reset ? newQuestions : [...prev, ...newQuestions]
        );
        setHasMore(!res.data.last);
        setError(null);
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchQuestions(true);
  }, []);

  useEffect(() => {
    if (page === 0) return;
    fetchQuestions(false);
  }, [page]);

  const searchHandler = () => {
    setQuestions([]);
    setPage(0);
    fetchQuestions(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Q-Connect</h1>
          </div>
          <p className="text-gray-400">Ask questions, share knowledge, and connect with the community</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link
            to="post"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ask Question
          </Link>
          <Link
            to="myquestion"
            className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            My Questions
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative mb-10">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchHandler()}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              placeholder="Search questions, topics, or keywords..."
              disabled={loading}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader className="h-5 w-5 text-purple-500 animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={searchHandler}
            className="px-4 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-900/40 border border-red-700/50 rounded-xl flex items-center gap-3">
          <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Questions Section */}
      <div className="space-y-6 mb-10">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors overflow-hidden"
          >
            <div className="p-6">
              <div className="flex gap-5">
                {/* Vote Section */}
                <div className="flex flex-col items-center w-16">
                  <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  <span className="font-semibold text-white text-xl my-1">
                    {formatNumber(question.votes || 0)}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowDown className="h-5 w-5" />
                  </button>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-400">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{formatNumber(question.noOfAnswers || 0)}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Link
                      to={`question/${question.id}`}
                      className="text-xl font-semibold text-white hover:text-purple-400 transition-colors"
                    >
                      {question.title}
                    </Link>
                  </div>
                  
                  <p className="mt-3 text-gray-300 line-clamp-2">
                    {question.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-lg flex items-center gap-1"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-700 p-1.5 rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-gray-300">{question.author.username}</span>
                        <span className="mx-2">•</span>
                        <span>Asked on {formatDate(question.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-full">
                        {question.views || 0} views
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && questions.length > 0 && (
        <div className="flex justify-center my-8">
          <Loader className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
      )}

      {!loading && hasMore && questions.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-5 py-2.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            Load More Questions
          </button>
        </div>
      )}

      {!loading && !hasMore && questions.length > 0 && (
        <div className="text-center py-6 text-gray-400 border-t border-gray-800 mt-8">
          You've reached the end of questions
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div className="text-center py-16 bg-gray-800/40 rounded-xl border border-gray-700">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
            <MessageSquare className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Questions Found</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            {search ? 
              `No results found for "${search}". Try different keywords.` : 
              'Be the first to ask a question in the community.'
            }
          </p>
          <Link 
            to="post"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ask a Question
          </Link>
        </div>
      )}
    </div>
  );
};

export default QConnectMainPage;