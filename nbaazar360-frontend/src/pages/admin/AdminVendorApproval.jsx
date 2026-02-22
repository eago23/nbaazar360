import { useState, useEffect } from 'react'
import { Check, X, Mail, Phone, MapPin, Store, AlertCircle, FileText, ExternalLink, RefreshCw } from 'lucide-react'
import { adminVendorsAPI } from '../../services/api'

function AdminVendorApproval() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchPendingVendors()
  }, [])

  const fetchPendingVendors = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get ALL vendors
      const response = await adminVendorsAPI.getAll()

      // API interceptor already extracts response.data.data to response.data
      // So response.data is now the inner data object directly
      const allVendors = response.data?.vendors || response.data || []

      // Filter for pending status ONLY
      const pendingVendors = Array.isArray(allVendors)
        ? allVendors.filter(vendor => vendor.status === 'pending')
        : []

      setVendors(pendingVendors)
    } catch (error) {
      console.error('Error fetching pending vendors:', error)
      setError(error.response?.data?.message || 'Gabim gjatë ngarkimit të tregtarëve')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await adminVendorsAPI.approve(id)
      setVendors(vendors.filter(v => v.id !== id))
    } catch (error) {
      console.error('Error approving vendor:', error)
      alert(error.response?.data?.message || 'Gabim gjatë miratimit')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal)
    try {
      await adminVendorsAPI.reject(rejectModal, rejectReason)
      setVendors(vendors.filter(v => v.id !== rejectModal))
      setRejectModal(null)
      setRejectReason('')
    } catch (error) {
      console.error('Error rejecting vendor:', error)
      alert(error.response?.data?.message || 'Gabim gjatë refuzimit')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-lg font-medium text-red-800 mb-2">Gabim</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPendingVendors}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Provo Përsëri</span>
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary">Miratime Tregtarësh</h1>
        <button
          onClick={fetchPendingVendors}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          <span>Rifresko</span>
        </button>
      </div>

      {vendors.length > 0 ? (
        <div className="space-y-4">
          {vendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Vendor Info */}
                <div className="flex items-start space-x-4 flex-1">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.business_name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Store className="text-primary" size={28} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary">{vendor.business_name}</h3>
                    {vendor.category && (
                      <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {vendor.category}
                      </span>
                    )}
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span>{vendor.email}</span>
                      </div>
                      {vendor.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone size={14} className="text-gray-400" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{vendor.location}</span>
                        </div>
                      )}
                    </div>
                    {vendor.description && (
                      <p className="mt-3 text-sm text-gray-600 max-w-xl">
                        {vendor.description}
                      </p>
                    )}

                    {/* ID Document */}
                    {vendor.id_document_url && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Dokument Identifikimi</span>
                        </div>
                        <a
                          href={vendor.id_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <span>Shiko Dokumentin</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}

                    <p className="mt-3 text-xs text-gray-400">
                      Regjistruar: {new Date(vendor.created_at).toLocaleDateString('sq-AL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 lg:flex-shrink-0">
                  <button
                    onClick={() => setRejectModal(vendor.id)}
                    disabled={actionLoading === vendor.id}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <X size={18} />
                    <span>Refuzo</span>
                  </button>
                  <button
                    onClick={() => handleApprove(vendor.id)}
                    disabled={actionLoading === vendor.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === vendor.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Mirato</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">
            Nuk ka kërkesa në pritje
          </h3>
          <p className="text-gray-500">
            Të gjitha kërkesat për regjistrim janë shqyrtuar
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary">Refuzo Kërkesën</h3>
                <p className="text-sm text-gray-500">
                  Jepni një arsye për refuzimin e këtij tregtari
                </p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-4"
              placeholder="Arsyeja e refuzimit (opsionale)..."
            />
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setRejectModal(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anulo
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Konfirmo Refuzimin'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVendorApproval
