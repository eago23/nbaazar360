import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Search, User, LogOut } from 'lucide-react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout, isAdmin, isVendor } = useAuth()
  const navigate = useNavigate()

  const navLinks = [
    { path: '/', label: 'Kryefaqja' },
    { path: '/eksplorimi-360', label: 'Eksplorimi 360°' },
    { path: '/histori-ar', label: 'Histori AR' },
    { path: '/ngjarje', label: 'Ngjarje' },
    { path: '/kontakt', label: 'Kontakt' },
    { path: '/tregtaret', label: 'Bizneset' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/kerkim?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">n'</span>
            </div>
            <span className="font-semibold text-xl text-secondary">Bazaar360</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-secondary hover:text-primary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Admin/Vendor Link */}
            {isAdmin() && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-secondary hover:text-primary'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-secondary hover:text-primary transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={isAdmin() ? '/admin' : isVendor() ? '/tregtar' : '/'}
                  className="flex items-center space-x-2 text-secondary hover:text-primary"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">{user.business_name || user.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-secondary hover:text-primary transition-colors"
                  title="Dil"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/hyrje"
                  className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
                >
                  Hyrje
                </Link>
                <Link
                  to="/regjistrim"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Regjistrohu
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-secondary min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kërko vendndodhje, histori, ngjarje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark transition-colors"
              >
                Kërko
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={(e) => { handleSearch(e); setIsOpen(false); }} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kërko..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-primary text-white rounded-r-md hover:bg-primary-dark transition-colors min-w-[48px]"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-md text-base font-medium min-h-[48px] flex items-center ${
                    isActive
                      ? 'text-primary bg-red-50'
                      : 'text-secondary hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isAdmin() && (
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-md text-base font-medium text-secondary hover:bg-gray-50 min-h-[48px] flex items-center"
              >
                Admin
              </NavLink>
            )}

            <div className="pt-4 mt-4 border-t">
              {user ? (
                <div className="space-y-1">
                  <Link
                    to={isAdmin() ? '/admin' : isVendor() ? '/tregtar' : '/'}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-secondary min-h-[48px] flex items-center"
                  >
                    <User size={20} className="mr-2" />
                    {user.business_name || user.email}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="block w-full text-left px-4 py-3 text-red-600 min-h-[48px] flex items-center"
                  >
                    <LogOut size={20} className="mr-2" />
                    Dil
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/hyrje"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-secondary min-h-[48px] flex items-center justify-center border border-gray-300 rounded-md"
                  >
                    Hyrje
                  </Link>
                  <Link
                    to="/regjistrim"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 bg-primary text-white text-center rounded-md min-h-[48px] flex items-center justify-center"
                  >
                    Regjistrohu
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
