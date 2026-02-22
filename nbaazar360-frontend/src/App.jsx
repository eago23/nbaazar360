import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Scroll to Top on Navigation
import ScrollToTop from './components/ScrollToTop'

// Layout
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import VendorLayout from './components/VendorLayout'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import Exploration from './pages/Exploration'
import LocationView from './pages/LocationView'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Vendors from './pages/Vendors'
import VendorProfile from './pages/VendorProfile'
import Search from './pages/Search'
import Login from './pages/Login'
import PrivacyPolicy from './pages/PrivacyPolicy'

// Vendor Pages
import VendorRegister from './pages/vendor/VendorRegister'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorProfileEdit from './pages/vendor/VendorProfileEdit'
import VendorStories from './pages/vendor/VendorStories'
import VendorStoryForm from './pages/vendor/VendorStoryForm'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVendorApproval from './pages/admin/AdminVendorApproval'
import AdminManageVendors from './pages/admin/AdminManageVendors'
import AdminManageContent from './pages/admin/AdminManageContent'
import AdminAddLocation from './pages/admin/AdminAddLocation'
import AdminAddEvent from './pages/admin/AdminAddEvent'
import AdminAddStory from './pages/admin/AdminAddStory'
import AdminEditStory from './pages/admin/AdminEditStory'
import AdminEditLocation from './pages/admin/AdminEditLocation'
import AdminEditEvent from './pages/admin/AdminEditEvent'
import AdminAnalytics from './pages/admin/AdminAnalytics'

// Protected Route
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
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
      </Router>
    </AuthProvider>
  )
}

export default App
