import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Scroll to Top on Navigation
import ScrollToTop from './components/ScrollToTop'

// Layout (not lazy loaded - needed immediately)
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import VendorLayout from './components/VendorLayout'

// Protected Route
import ProtectedRoute from './components/ProtectedRoute'

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

// ============================================
// LAZY LOADED PAGES (Code Splitting)
// ============================================

// Public Pages
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Exploration = lazy(() => import('./pages/Exploration'))
const LocationView = lazy(() => import('./pages/LocationView'))
const Stories = lazy(() => import('./pages/Stories'))
const StoryDetail = lazy(() => import('./pages/StoryDetail'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Vendors = lazy(() => import('./pages/Vendors'))
const VendorProfile = lazy(() => import('./pages/VendorProfile'))
const Search = lazy(() => import('./pages/Search'))
const Login = lazy(() => import('./pages/Login'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Kontakt = lazy(() => import('./pages/Kontakt'))

// Vendor Pages
const VendorRegister = lazy(() => import('./pages/vendor/VendorRegister'))
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'))
const VendorProfileEdit = lazy(() => import('./pages/vendor/VendorProfileEdit'))
const VendorStories = lazy(() => import('./pages/vendor/VendorStories'))
const VendorStoryForm = lazy(() => import('./pages/vendor/VendorStoryForm'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminVendorApproval = lazy(() => import('./pages/admin/AdminVendorApproval'))
const AdminManageVendors = lazy(() => import('./pages/admin/AdminManageVendors'))
const AdminManageContent = lazy(() => import('./pages/admin/AdminManageContent'))
const AdminAddLocation = lazy(() => import('./pages/admin/AdminAddLocation'))
const AdminAddEvent = lazy(() => import('./pages/admin/AdminAddEvent'))
const AdminAddStory = lazy(() => import('./pages/admin/AdminAddStory'))
const AdminEditStory = lazy(() => import('./pages/admin/AdminEditStory'))
const AdminEditLocation = lazy(() => import('./pages/admin/AdminEditLocation'))
const AdminEditEvent = lazy(() => import('./pages/admin/AdminEditEvent'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Full-Screen Routes (NO navbar/footer) */}
            <Route path="/histori-ar/:id" element={<StoryDetail />} />
            <Route path="/eksplorimi-360/:id" element={<LocationView />} />

            {/* Public Routes (WITH navbar/footer) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="rreth-nesh" element={<About />} />
              <Route path="eksplorimi-360" element={<Exploration />} />
              <Route path="histori-ar" element={<Stories />} />
              <Route path="ngjarje" element={<Events />} />
              <Route path="ngjarje/:id" element={<EventDetail />} />
              <Route path="tregtaret" element={<Vendors />} />
              <Route path="tregtaret/:id" element={<VendorProfile />} />
              <Route path="kerkim" element={<Search />} />
              <Route path="hyrje" element={<Login />} />
              <Route path="regjistrim" element={<VendorRegister />} />
              <Route path="politika-e-privatesise" element={<PrivacyPolicy />} />
              <Route path="kontakt" element={<Kontakt />} />
            </Route>

            {/* Vendor Routes */}
            <Route path="/tregtar" element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorLayout />
              </ProtectedRoute>
            }>
              <Route index element={<VendorDashboard />} />
              <Route path="profili" element={<VendorProfileEdit />} />
              <Route path="historite" element={<VendorStories />} />
              <Route path="historite/e-re" element={<VendorStoryForm />} />
              <Route path="historite/:id/ndrysho" element={<VendorStoryForm />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="miratime" element={<AdminVendorApproval />} />
              <Route path="tregtaret" element={<AdminManageVendors />} />
              <Route path="permbajtje" element={<AdminManageContent />} />
              <Route path="vendndodhje/shto" element={<AdminAddLocation />} />
              <Route path="vendndodhje/:id/ndrysho" element={<AdminEditLocation />} />
              <Route path="ngjarje/shto" element={<AdminAddEvent />} />
              <Route path="ngjarje/:id/ndrysho" element={<AdminEditEvent />} />
              <Route path="histori/shto" element={<AdminAddStory />} />
              <Route path="histori/:id/ndrysho" element={<AdminEditStory />} />
              <Route path="analitika" element={<AdminAnalytics />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
