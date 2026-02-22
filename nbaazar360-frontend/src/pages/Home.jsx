import { Link } from 'react-router-dom'
import { ArrowRight, Compass, BookOpen, Calendar, Store, Navigation, Facebook, Instagram } from 'lucide-react'

function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Softer Design */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image - Better fitting */}
        <div className="absolute inset-0">
          <div className="w-full h-full">
            <img
              src="https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio-700x409.png"
              className="w-full h-full object-cover object-center"
              alt="Pazari i Ri"
              style={{ filter: 'brightness(0.7)' }}
            />
          </div>
          {/* Softer, warmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/40 to-gray-900/70" />
        </div>

        {/* Hero Content - More natural spacing */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Small badge - softer style */}
          <div className="inline-block mb-8 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <span className="text-white/90 font-medium text-sm">
              Eksperiencë Kulturore Dixhitale
            </span>
          </div>

          {/* Main Heading - Softer typography */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Pazari i Ri
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-red-200 mb-8">
            I Rizbuluar
          </h2>

          {/* Subtitle - Better readability */}
          <p className="text-lg md:text-xl text-gray-200 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Zbuloni Pazarin e Ri si kurrë më parë. Një hapësirë ku historia, kultura dhe jeta moderne e Tiranës bashkohen në një përvojë unike digjitale.
          </p>

          {/* CTA Buttons - Softer design */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/eksplorimi-360"
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-300"
            >
              <Compass size={20} />
              <span>Fillo Eksplorimin</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/histori-ar"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white/95 backdrop-blur-sm text-secondary font-semibold rounded-xl shadow-lg hover:bg-white transition-all duration-300"
            >
              <BookOpen size={20} />
              <span>Shiko Historinë AR</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Cards with Images */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Eksploro në Mënyra të Ndryshme
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Zgjedh mënyrën tënde të preferuar për të zbuluar Pazarin e Ri të Tiranës
            </p>
          </div>

          {/* Cards Grid - Compact cards with images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: 360° Exploration */}
            <Link to="/eksplorimi-360" className="group">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Background Image with Overlay */}
                <img
                  src="https://bigsee.eu/wp-content/uploads/2019/03/01_bazaar-tirana.jpg.webp"
                  alt="360° Exploration"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div className="w-12 h-12 bg-blue-500/90 backdrop-blur rounded-full flex items-center justify-center">
                    <Navigation className="text-white" size={24} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Eksplorimi 360°
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      Vizitoni çdo cep të pazarit përmes teknologjisë panoramike interaktive
                    </p>
                    <span className="text-white font-semibold flex items-center group-hover:gap-2 transition-all">
                      Mëso më shumë <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: AR Stories */}
            <Link to="/histori-ar" className="group">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Background Image with Overlay */}
                <img
                  src="https://d10ic2gxw9yhll.cloudfront.net/public/DigitalAsset/d14d127efa8e863acb7c09b916629991/d14d127efa8e863acb7c09b916629991/full/original/0/default.jpeg"
                  alt="AR Stories"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-800/50 to-purple-700/30" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                    <BookOpen className="text-purple-600" size={24} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Histori AR
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      Zbuloni energjinë e pazarit përmes realitetit virtual
                    </p>
                    <span className="text-white font-semibold flex items-center group-hover:gap-2 transition-all">
                      Mëso më shumë <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: Events */}
            <Link to="/ngjarje" className="group">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Background Image with Overlay - Download from Instagram and save to public/images/ */}
                <img
                  src="/images/events-card.jpg"
                  alt="Events"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-800/50 to-green-700/30" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                    <Calendar className="text-green-600" size={24} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Ngjarje
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      Mos humbisni asnjë ngjarje apo aktivitet në pazar
                    </p>
                    <span className="text-white font-semibold flex items-center group-hover:gap-2 transition-all">
                      Mëso më shumë <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 4: Businesses */}
            <Link to="/tregtaret" className="group">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Background Image with Overlay - Download from Instagram and save to public/images/ */}
                <img
                  src="/images/business-card.jpg"
                  alt="Businesses"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div className="w-12 h-12 bg-orange-500/90 backdrop-blur rounded-full flex items-center justify-center">
                    <Store className="text-white" size={24} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Bizneset
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      Njihuni me bizneset dhe artizanët e Pazarit të Ri
                    </p>
                    <span className="text-white font-semibold flex items-center group-hover:gap-2 transition-all">
                      Mëso më shumë <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Na ndiqni në rrjetet sociale
          </h2>
          <p className="text-gray-600 mb-8">
            Qëndroni të përditësuar me lajmet dhe ngjarjet më të fundit nga Pazari i Ri
          </p>

          <div className="flex justify-center space-x-6">
            <a
              href="https://www.facebook.com/pazariiritirane/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Facebook size={24} />
              <span className="font-semibold">Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/pazariiri_newbazaar/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-colors"
            >
              <Instagram size={24} />
              <span className="font-semibold">Instagram</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
