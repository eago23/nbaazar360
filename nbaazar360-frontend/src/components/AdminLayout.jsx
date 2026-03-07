import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home
} from 'lucide-react'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Paneli', exact: true },
    { path: '/admin/miratime', icon: UserCheck, label: 'Miratime' },
    { path: '/admin/tregtaret', icon: Users, label: 'Tregtarët' },
    { path: '/admin/permbajtje', icon: FileText, label: 'Përmbajtja' },
    { path: '/admin/analitika', icon: BarChart3, label: 'Analitika' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-secondary transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">n'</span>
              </div>
              <span className="font-semibold text-xl text-white">Bazaar360</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Administrator</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors min-h-[44px]"
              >
                <Home size={16} />
                <span className="text-sm">Faqja</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px]"
              >
                <LogOut size={16} />
                <span className="text-sm">Dil</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-2 sm:py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-secondary min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-base sm:text-xl font-semibold text-secondary truncate">Paneli i Administratorit</h1>
            <div className="w-10 lg:hidden" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
