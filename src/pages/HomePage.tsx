import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextNew';

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors">
                ?§Î¨∏ÏßÄ Í¥ÄÎ¶??úÏä§??
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ?Ä?úÎ≥¥??
                  </Link>
                  <Link 
                    to="/create"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ?§Î¨∏ÏßÄ ?ùÏÑ±
                  </Link>
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{user?.name}</span>??
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Î°úÍ∑∏?ÑÏõÉ ?òÏãúÍ≤†Ïäµ?àÍπå?')) {
                        logout();
                      }
                    }}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Î°úÍ∑∏?ÑÏõÉ
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/signup"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ?åÏõêÍ∞Ä??
                  </Link>
                  <Link 
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Í∞ïÏÇ¨ Î°úÍ∑∏??
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Í∞ïÏÇ¨?Ä ?àÎ†®?ùÏùÑ ?ÑÌïú ?§Î¨∏ÏßÄ ?åÎû´??
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Google Forms ?§Ì??ºÏùò ÏßÅÍ??ÅÏù∏ ?§Î¨∏ÏßÄ ?ùÏÑ±, Î∞∞Ìè¨, Î∂ÑÏÑù ?ÑÍµ¨
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">?§Î¨∏ÏßÄ ?ùÏÑ±</h3>
                    <p className="text-sm text-gray-600">
                      ?úÎûòÍ∑????úÎ°≠?ºÎ°ú ?ΩÍ≤å ?§Î¨∏ÏßÄÎ•?ÎßåÎì§?¥Î≥¥?∏Ïöî
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">?¨Ïö¥ Î∞∞Ìè¨</h3>
                    <p className="text-sm text-gray-600">
                      ÎßÅÌÅ¨ Í≥µÏú†Î°?Í∞ÑÌé∏?òÍ≤å ?§Î¨∏ÏßÄÎ•?Î∞∞Ìè¨?òÏÑ∏??
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">?§ÏãúÍ∞?Î∂ÑÏÑù</h3>
                    <p className="text-sm text-gray-600">
                      ?ëÎãµÎ•? ?¥Î¶≠Î•????§ÏãúÍ∞??µÍ≥ÑÎ•??ïÏù∏?òÏÑ∏??
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <Link 
              to="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors inline-block"
            >
              ?§Î¨∏ÏßÄ ÎßåÎì§Í∏??úÏûë?òÍ∏∞
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
