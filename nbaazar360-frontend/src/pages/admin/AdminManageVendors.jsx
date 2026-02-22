import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Store, Mail, Phone, MapPin, Eye, MoreVertical, CheckCircle, XCircle, Trash2, Ban, RefreshCw } from 'lucide-react'
import { adminVendorsAPI } from '../../services/api'

function AdminManageVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionMenu, setActionMenu] = useState(null)

  useEffect(() => {
    fetchVendors()
  }, [statusFilter])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const response = await adminVendorsAPI.getAll(params)
      const vendorsData = response.data?.vendors || response.data || []
      setVendors(Array.isArray(vendorsData) ? vendorsData : [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            <span>Aktiv</span>
          </span>
        )
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            Në pritje
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle size={12} />
            <span>Refuzuar</span>
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <XCircle size={12} />
            <span>Pezulluar</span>
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {status || 'I panjohur'}
          </span>
        )
    }
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-secondary mb-4 sm:mb-6">Menaxho Tregtarët</h1>

      {/* Filters - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kërko tregtarë..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Status Filter - Scrollable on mobile */}
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {[
                { id: 'all', label: 'Të gjitha' },
                { id: 'active', label: 'Aktivë' },
                { id: 'pending', label: 'Në pritje' },
                { id: 'rejected', label: 'Të refuzuar' },
                { id: 'suspended', label: 'Të pezulluar' }
              ].map(status => (
                <button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    statusFilter === status.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vendors List - Mobile Responsive */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredVendors.length > 0 ? (
        <div className="space-y-3 sm:space-y-0">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Tregtari</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Kontakti</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statusi</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Regjistruar</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVendors.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {vendor.logo_url ? (
                            <img
                              src={vendor.logo_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Store className="text-primary" size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-secondary">{vendor.business_name}</p>
                            {vendor.category && (
                              <p className="text-xs text-gray-500">{vendor.category}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            <span>{vendor.email}</span>
                          </div>
                          {vendor.phone && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Phone size={14} className="text-gray-400" />
                              <span>{vendor.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(vendor.status)}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                        {new Date(vendor.created_at).toLocaleDateString('sq-AL')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActionMenu(actionMenu === vendor.id ? null : vendor.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={20} className="text-gray-500" />
                          </button>
                          {actionMenu === vendor.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                              <Link
                                to={`/tregtaret/${vendor.username}`}
                                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                              >
                                <Eye size={16} className="text-gray-500" />
                                <span>Shiko Profilin</span>
                              </Link>
                              {vendor.status === 'pending' && (
                                <>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await adminVendorsAPI.approve(vendor.id)
                                        fetchVendors()
                                      } catch (error) {
                                        console.error('Error approving vendor:', error)
                                        alert('Gabim gjatë miratimit')
                                      }
                                      setActionMenu(null)
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-green-600"
                                  >
                                    <CheckCircle size={16} />
                                    <span>Mirato</span>
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await adminVendorsAPI.reject(vendor.id, '')
                                        fetchVendors()
                                      } catch (error) {
                                        console.error('Error rejecting vendor:', error)
                                        alert('Gabim gjatë refuzimit')
                                      }
                                      setActionMenu(null)
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
                                  >
                                    <XCircle size={16} />
                                    <span>Refuzo</span>
                                  </button>
                                </>
                              )}
                              {vendor.status === 'active' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Jeni i sigurt që doni të pezulloni këtë tregtar?')) {
                                      try {
                                        await adminVendorsAPI.suspend(vendor.id, 'Pezulluar nga administratori')
                                        fetchVendors()
                                      } catch (error) {
                                        console.error('Error suspending vendor:', error)
                                        alert('Gabim gjatë pezullimit')
                                      }
                                    }
                                    setActionMenu(null)
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 hover:bg-orange-50 w-full text-left text-orange-600"
                                >
                                  <Ban size={16} />
                                  <span>Pezullo</span>
                                </button>
                              )}
                              {vendor.status === 'suspended' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await adminVendorsAPI.unsuspend(vendor.id)
                                      fetchVendors()
                                    } catch (error) {
                                      console.error('Error unsuspending vendor:', error)
                                      alert('Gabim gjatë riaktivizimit')
                                    }
                                    setActionMenu(null)
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 hover:bg-green-50 w-full text-left text-green-600"
                                >
                                  <RefreshCw size={16} />
                                  <span>Riaktivizo</span>
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  if (window.confirm('KUJDES: Jeni i sigurt që doni të fshini këtë tregtar? Ky veprim nuk mund të zhbëhet!')) {
                                    try {
                                      await adminVendorsAPI.delete(vendor.id)
                                      fetchVendors()
                                    } catch (error) {
                                      console.error('Error deleting vendor:', error)
                                      alert('Gabim gjatë fshirjes')
                                    }
                                  }
                                  setActionMenu(null)
                                }}
                                className="flex items-center space-x-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
                              >
                                <Trash2 size={16} />
                                <span>Fshi</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredVendors.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start space-x-3 mb-3">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Store className="text-primary" size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary truncate">{vendor.business_name}</h3>
                    {vendor.category && (
                      <p className="text-xs text-gray-500">{vendor.category}</p>
                    )}
                    <div className="mt-2">
                      {getStatusBadge(vendor.status)}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-sm mb-3 pl-1">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  {vendor.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  <Link
                    to={`/tregtaret/${vendor.username}`}
                    className="flex-1 py-2 px-3 text-center border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Shiko
                  </Link>
                  {vendor.status === 'pending' && (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            await adminVendorsAPI.approve(vendor.id)
                            fetchVendors()
                          } catch (error) {
                            alert('Gabim gjatë miratimit')
                          }
                        }}
                        className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Mirato
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await adminVendorsAPI.reject(vendor.id, '')
                            fetchVendors()
                          } catch (error) {
                            alert('Gabim gjatë refuzimit')
                          }
                        }}
                        className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        Refuzo
                      </button>
                    </>
                  )}
                  {vendor.status === 'active' && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Jeni i sigurt që doni të pezulloni këtë tregtar?')) {
                          try {
                            await adminVendorsAPI.suspend(vendor.id, 'Pezulluar nga administratori')
                            fetchVendors()
                          } catch (error) {
                            alert('Gabim gjatë pezullimit')
                          }
                        }
                      }}
                      className="flex-1 py-2 px-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                    >
                      Pezullo
                    </button>
                  )}
                  {vendor.status === 'suspended' && (
                    <button
                      onClick={async () => {
                        try {
                          await adminVendorsAPI.unsuspend(vendor.id)
                          fetchVendors()
                        } catch (error) {
                          alert('Gabim gjatë riaktivizimit')
                        }
                      }}
                      className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Riaktivizo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
          <Store className="mx-auto text-gray-300 mb-4" size={40} />
          <p className="text-gray-500 text-sm sm:text-base">Nuk u gjetën tregtarë</p>
        </div>
      )}
    </div>
  )
}

export default AdminManageVendors
