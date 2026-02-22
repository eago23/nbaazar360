import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">n'</span>
              </div>
              <span className="font-semibold text-xl">Bazaar360</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Një udhëtim dixhital përmes Pazarit të dashur të Tiranës, duke ruajtur trashëgiminë kulturore përmes teknologjisë së avancuar.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">LIDHJE TË SHPEJTA</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Kryefaqja
                </Link>
              </li>
              <li>
                <Link to="/eksplorimi-360" className="text-gray-400 hover:text-white transition-colors">
                  Eksplorimi 360°
                </Link>
              </li>
              <li>
                <Link to="/histori-ar" className="text-gray-400 hover:text-white transition-colors">
                  Histori AR
                </Link>
              </li>
              <li>
                <Link to="/ngjarje" className="text-gray-400 hover:text-white transition-colors">
                  Ngjarje
                </Link>
              </li>
              <li>
                <Link to="/tregtaret" className="text-gray-400 hover:text-white transition-colors">
                  Bizneset
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-4">RRETH NESH</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/rreth-nesh" className="text-gray-400 hover:text-white transition-colors">
                  Misioni Ynë
                </Link>
              </li>
              <li>
                <Link to="/rreth-nesh" className="text-gray-400 hover:text-white transition-colors">
                  Trashëgimia Kulturore
                </Link>
              </li>
              <li>
                <Link to="/regjistrim" className="text-gray-400 hover:text-white transition-colors">
                  Bashkëpuno me Ne
                </Link>
              </li>
              <li>
                <Link to="/politika-e-privatesise" className="text-gray-400 hover:text-white transition-colors">
                  Politika e Privatësisë
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">NA VIZITONI</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Pazari i Ri<br />Tiranë, Shqipëri
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <a href="tel:08000888" className="text-gray-400 hover:text-white transition-colors">
                  0800 0888
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <a href="mailto:info@tirana.al" className="text-gray-400 hover:text-white transition-colors">
                  info@tirana.al
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 n'Bazaar360. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
