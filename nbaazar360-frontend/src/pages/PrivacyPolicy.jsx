import { useEffect } from 'react'
import { Shield, Lock, Eye, Database } from 'lucide-react'

function PrivacyPolicy() {
  useEffect(() => {
    document.title = "n'Bazaar360 - Politika e Privatësisë"
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white py-12 border-b-2 border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Politika e Privatësisë
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Si i mbrojmë dhe përdorim të dhënat tuaja
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Intro */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <p className="text-gray-700">
            n'Bazaar360 respekton privatësinë tuaj. Kjo politikë shpjegon si grumbullojmë, përdorim dhe mbrojmë informacionin tuaj.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">

          {/* Section 1 */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Çfarë Informacioni Grumbullojmë
                </h2>
                <ul className="text-gray-700 space-y-2">
                  <li>• Emri dhe email-i juaj (vetëm për regjistrimin e tregtarëve)</li>
                  <li>• Informacioni i biznesit (për dyqanet e regjistruara)</li>
                  <li>• Të dhëna anonime të vizitave (për statistika)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Si e Përdorim Informacionin
                </h2>
                <ul className="text-gray-700 space-y-2">
                  <li>• Për të administruar llogaritë e tregtarëve</li>
                  <li>• Për të përmirësuar përvojën e përdoruesit</li>
                  <li>• Për të dërguar njoftime për ngjarje (me pëlqimin tuaj)</li>
                  <li>• Për statistika dhe analizë (të dhëna anonime)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Si i Mbrojmë Të Dhënat
                </h2>
                <ul className="text-gray-700 space-y-2">
                  <li>• Fjalëkalimet janë të enkriptuar</li>
                  <li>• Të dhënat ruhen në serverë të sigurt</li>
                  <li>• Nuk i ndajmë informacionin tuaj me palë të treta</li>
                  <li>• Hyrja në të dhëna është e kufizuar vetëm për administratorë</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Të Drejtat Tuaja
                </h2>
                <ul className="text-gray-700 space-y-2">
                  <li>• Mund të shikoni të dhënat tuaja në çdo kohë</li>
                  <li>• Mund të kërkoni fshirjen e llogarisë suaj</li>
                  <li>• Mund të përditësoni informacionin tuaj</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Cookies (Biskota)
            </h2>
            <p className="text-gray-700 mb-3">
              Përdorim cookies vetëm për të ruajtur sesionin tuaj kur jeni të kyçur. Nuk përdorim cookies për reklamim apo ndjekje.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            Kjo politikë është përditësuar për herë të fundit: Shkurt 2026
          </p>
          <p className="text-sm text-gray-600 text-center mt-2">
            Për pyetje rreth privatësisë, kontaktoni: <a href="mailto:info@tirana.al" className="text-primary hover:underline">info@tirana.al</a>
          </p>
        </div>

      </div>
    </div>
  )
}

export default PrivacyPolicy
