import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Store, AlertCircle, CheckCircle } from 'lucide-react'
import { getErrorMessage, ERROR_MESSAGES } from '../../utils/errorMessages'

function VendorRegister() {
  useEffect(() => {
    document.title = "n'Bazaar360 - Regjistrohu"
  }, [])

  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    business_type: '',
    terms_accepted: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const categories = [
    { id: 'Restorant', label: 'Restorant' },
    { id: 'Kafe & Bar', label: 'Kafe & Bar' },
    { id: 'Artizanat & Suvenire', label: 'Artizanat & Suvenire' },
    { id: 'Prodhime Vendore', label: 'Prodhime Vendore' },
    { id: 'Dyqan', label: 'Dyqan' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(ERROR_MESSAGES.PASSWORDS_DONT_MATCH)
      return
    }
    if (formData.password.length < 8) {
      setError(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
      return
    }

    if (!formData.terms_accepted) {
      setError(ERROR_MESSAGES.TERMS_NOT_ACCEPTED)
      return
    }

    setLoading(true)

    try {
      await register({
        business_name: formData.business_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        business_type: formData.business_type,
        terms_accepted: 'true'
      })
      setSuccess(true)
    } catch (error) {
      console.error('Register error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-4">Regjistrimi u Krye!</h2>
            <p className="text-gray-600 mb-6">
              Kërkesa juaj për regjistrim u dërgua me sukses. Do të njoftoheni me email
              kur administratori të miratojë llogarinë tuaj.
            </p>
            <Link
              to="/hyrje"
              className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              Shko te Hyrja
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-secondary">Regjistrohu si Tregtar</h1>
          <p className="text-gray-600 mt-2">
            Bashkohuni me platformën tonë dhe ndani historinë tuaj me botën
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-secondary mb-2">
                Emri i Biznesit *
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="p.sh. Artizanat Shqiptare"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="emri@email.com"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                  Fjalëkalimi *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-2">
                  Konfirmo Fjalëkalimin *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Phone & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-2">
                  Telefoni
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+355 69 123 4567"
                />
              </div>
              <div>
                <label htmlFor="business_type" className="block text-sm font-medium text-secondary mb-2">
                  Kategoria *
                </label>
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Zgjidhni kategorinë</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-3">
              <input
                id="terms_accepted"
                name="terms_accepted"
                type="checkbox"
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="terms_accepted" className="text-sm text-gray-600">
                Pranoj <a href="/politika-e-privatesise" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark underline">kushtet dhe termat</a> e përdorimit të platformës *
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Dërgo Kërkesën</span>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Keni llogari?{' '}
              <Link to="/hyrje" className="text-primary hover:text-primary-dark font-medium">
                Hyni këtu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorRegister
