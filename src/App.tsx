import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { TicketsPage } from './pages/TicketsPage';
import { LoginPage } from './pages/LoginPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { SupportPage } from './pages/SupportPage';
import { TrackTicketPage } from './pages/TrackTicketPage';
import { RtlProvider } from './components/RtlProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './i18n/i18n';

function App() {
  return (
    <Router>
      <RtlProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/track" element={<TrackTicketPage />} />
              <Route path="/tickets/*" element={<TicketsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </RtlProvider>
    </Router>
  );
}

export default App;