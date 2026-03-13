import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navigation, Sparkles, Calendar, Store } from 'lucide-react'

function About() {
  useEffect(() => {
    document.title = "n'Bazaar360 - Rreth Nesh"
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as other pages */}
      <div className="bg-white py-12 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Rreth n'Bazaar360
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Platforma digjitale që sjell Pazarin e Ri në botën virtuale
          </p>
        </div>
      </div>

      {/* About Bazaar360 Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Çfarë është n'Bazaar360?
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  n'Bazaar360 është një nismë digjitale inovative që sjell Pazarin e Ri të Tiranës në botën virtuale. Kjo platformë u mundëson qytetarëve dhe turistëve të eksplorojnë këtë treg ikonik nga çdo vend dhe në çdo kohë.
                </p>
                <p>
                  Ne synojmë të promovojmë bizneset lokale të Pazarit të Ri — nga artizanët dhe fermerët te dyqanet dhe restorantet — duke u dhënë atyre një prani digjitale moderne dhe duke i lidhur me një audiencë më të gjerë.
                </p>
                <p>
                  Duke përdorur tura virtuale 360° dhe realitet të shtuar (AR), ne rikrijojmë përvojën e pazarit, duke ofruar një dritare digjitale në kulturën e tij të gjallë. Çdo dyqan dhe artizani është i pajisur me një kod QR unik që vizitorët mund ta skanojnë për të hyrë në profilin e biznesit, informacione shtesë dhe demonstrime të historive AR.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://bigsee.eu/wp-content/uploads/2019/03/01_bazaar-tirana.jpg.webp"
                alt="Pazari i Ri"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer - 4 Feature Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Çfarë Ofrojmë
            </h2>
            <p className="text-lg text-gray-600">
              Eksplorojeni Pazarin e Ri në mënyra të reja dhe inovative
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: 360° Tours */}
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Navigation className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ture 360°
              </h3>
              <p className="text-gray-600">
                Vizitoni çdo cep të pazarit përmes teknologjisë panoramike interaktive
              </p>
            </div>

            {/* Card 2: AR Stories */}
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Histori AR
              </h3>
              <p className="text-gray-600">
                Zbuloni energjinë e Pazarit
              </p>
            </div>

            {/* Card 3: Events */}
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ngjarje
              </h3>
              <p className="text-gray-600">
                Mbani veten të përditësuar me ngjarjet dhe aktivitetet në pazar
              </p>
            </div>

            {/* Card 4: Businesses */}
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Bizneset
              </h3>
              <p className="text-gray-600">
                Njihuni me bizneset që i japin jetë pazarit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History of Pazari i Ri */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1">
              <img
                src="https://d10ic2gxw9yhll.cloudfront.net/public/DigitalAsset/d14d127efa8e863acb7c09b916629991/d14d127efa8e863acb7c09b916629991/full/original/0/default.jpeg"
                alt="Pazari i Ri - Historia"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Historia e Pazarit të Ri
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Pazari i Ri, i njohur gjithashtu si "New Bazaar", është një nga destinacionet më të dashura të Tiranës. I ndërtuar fillimisht në vitet 1930, ai u rinovua plotësisht në vitin 2016, duke u shndërruar në një qendër të gjallë kulturore dhe gastronomike.
                </p>
                <p>
                  Sot, Pazari i Ri ofron një kombinim unik të traditës dhe modernitetit. Dyqane artizanale, restorante tradicionale, bare moderne dhe galeri arti bashkëjetojnë në harmoni, duke krijuar një atmosferë të paharrueshme.
                </p>
                <p>
                  Me n'Bazaar360, ne dëshirojmë të ndajmë këtë eksperiencë unike me të gjithë ata që duan të eksplorojnë kulturën shqiptare, pavarësisht se ku ndodhen në botë.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Gati të Eksploroni?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Filloni udhëtimin tuaj virtual nëpër Pazarin e Ri të Tiranës
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/eksplorimi-360"
              className="px-8 py-3 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Shiko 360°
            </Link>
            <Link
              to="/histori-ar"
              className="px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Zbulo Historitë
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
