import { QRCodeSVG } from 'qrcode.react'
import { X, Download, Printer } from 'lucide-react'

function QRCodeModal({ story, onClose }) {
  // Generate the story URL - this is what QR code will open
  const storyUrl = `${window.location.origin}/histori-ar/${story.id}`

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      // White background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 512, 512)
      ctx.drawImage(img, 0, 0, 512, 512)

      // Download as PNG
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-histori-${story.id}-${story.title?.replace(/\s+/g, '-') || 'story'}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            QR Code - Histori AR
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Mbyll"
          >
            <X size={24} />
          </button>
        </div>

        {/* Story Info */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {story.title || story.business_name || 'Histori AR'}
          </h3>
          {story.business_name && story.title && (
            <p className="text-sm text-primary font-medium">
              {story.business_name}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Skanoni me kameren e telefonit per te pare historine
          </p>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center mb-6 p-8 bg-white border-4 border-gray-900 rounded-2xl shadow-inner">
          <QRCodeSVG
            id="qr-code-svg"
            value={storyUrl}
            size={280}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* URL Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 text-center font-medium">
            Link i Historise:
          </p>
          <p className="text-xs text-gray-700 break-all text-center font-mono">
            {storyUrl}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Download size={20} />
            <span>Shkarko PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-primary hover:text-primary hover:bg-gray-50 transition-colors font-semibold"
          >
            <Printer size={20} />
            <span>Printo</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            Shkarkoni, printoni dhe vendoseni ne Pazarin e Ri. Vizitoret skanojne me kameren e telefonit.
          </p>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0 {
            position: static !important;
          }
          #qr-code-svg,
          #qr-code-svg * {
            visibility: visible !important;
          }
          #qr-code-svg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(2);
          }
        }
      `}</style>
    </div>
  )
}

export default QRCodeModal
