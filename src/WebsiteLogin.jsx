import { use, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { db } from './firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

export default function WebsiteLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  const navigate = useNavigate()

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginStatus(null);

    try {
      const hashedPassword = hashPassword(credentials.password);
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', credentials.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        if (userData.password === hashedPassword) {
          setLoginStatus('success');
          navigate('/customiser');
        } else {
          setLoginStatus('error');
        }
      } else {
        setLoginStatus('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading || !credentials.email || !credentials.password}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Status Messages */}
            {loginStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Login successful! Redirecting...</span>
              </div>
            )}

            {/* Status Messages */}
            {loginStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Login successful! Redirecting...</span>
              </div>
            )}

            {loginStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Invalid email or password. Please try again.</span>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <button className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </button>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CV Customizer. All rights reserved.</p>
          <p className="mt-1">Made with ❤️ by <a href="https://www.linkedin.com/in/abdelmalek-belghomari/">Abdelmalek Belghomari</a></p>
        </div>    
      </div>
    </div>
  );
}