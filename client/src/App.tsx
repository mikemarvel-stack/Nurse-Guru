import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Home } from '@/pages/Home';
import { Browse } from '@/pages/Browse';
import { Categories } from '@/pages/Categories';
import { DocumentDetail } from '@/pages/DocumentDetail';
import { Cart } from '@/pages/Cart';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { SellerDashboard } from '@/pages/SellerDashboard';
import { Orders } from '@/pages/Orders';
import { Profile } from '@/pages/Profile';
import { Help } from '@/pages/Help';
import { Contact } from '@/pages/Contact';
import { Terms } from '@/pages/Terms';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/document/:id" element={<DocumentDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/help" element={<Help />} />
              <Route path="/faq" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Placeholder routes for future implementation */}
              <Route path="/privacy" element={<div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold">Privacy Policy</h1>
                <p className="mt-4 text-gray-600">Coming soon...</p>
              </div>} />
              <Route path="/pricing" element={<div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold">Pricing</h1>
                <p className="mt-4 text-gray-600">Coming soon...</p>
              </div>} />
              <Route path="/cookies" element={<div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold">Cookie Policy</h1>
                <p className="mt-4 text-gray-600">Coming soon...</p>
              </div>} />
              
              {/* 404 */}
              <Route path="*" element={<div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="mt-4 text-gray-600">Page not found</p>
                <a href="/" className="mt-4 inline-block text-teal-600 hover:underline">
                  Go back home
                </a>
              </div>} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
