import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import FloatingPlayer from './components/FloatingPlayer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OrderPage from './pages/OrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import PortfolioPage from './pages/PortfolioPage';
import MusicPage from './pages/MusicPage';
import MusicDetailPage from './pages/MusicDetailPage';
import GalleryPage from './pages/GalleryPage';
import AdminPage from './pages/AdminPage';
import ServantPage from './pages/ServantPage';
import ServantPublicView from './pages/ServantPublicView';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFoundPage from './pages/NotFoundPage';
import './styles/App.css';

// Helper component to render Toast from context
const MusicToast = () => {
  const { toast } = useMusic();
  if (!toast) return null;
  return (
    <div className="music-toast-container">
      <div className="music-toast">
        <i className="fas fa-music"></i>
        <span>{toast}</span>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Router>
          <ScrollToTop />
          <Navigation />
          <MusicToast />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/order-history" element={<OrderHistoryPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/music/:id" element={<MusicDetailPage />} />
              <Route path="/gallery/:type" element={<GalleryPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/servant" element={<ServantPage />} />
              <Route path="/servant-view/:name" element={<ServantPublicView />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <FloatingPlayer />
          <Footer />
        </Router>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;
