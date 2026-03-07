import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, AlertCircle, X } from 'lucide-react'
import { getErrorMessage } from '../utils/errorMessages'

function Login() {
  useEffect(() => {
    document.title = "n'Bazaar360 - Hyr"
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'vendor') {
        navigate('/tregtar')
      } else {
        navigate(from)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">n'</span>
            </div>
            <span className="font-semibold text-xl sm:text-2xl text-secondary">Bazaar360</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-secondary">Mirësevini përsëri</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Hyni në llogarinë tuaj</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-400 rounded-xl flex items-start justify-between animate-shake">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -mt-2"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="emri@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Fjalëkalimi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Hyr</span>
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Nuk keni llogari?{' '}
              <Link to="/regjistrim" className="text-primary hover:text-primary-dark font-medium">
                Regjistrohuni si tregtar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
