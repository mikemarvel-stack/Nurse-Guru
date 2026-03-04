import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { lazyLoad } from '@/lib/lazy-load';
import { Toaster } from '@/components/ui/sonner';

// Lazy load pages
const Home = lazyLoad(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Browse = lazyLoad(() => import('@/pages/Browse').then(m => ({ default: m.Browse })));
const Categories = lazyLoad(() => import('@/pages/Categories').then(m => ({ default: m.Categories })));
const DocumentDetail = lazyLoad(() => import('@/pages/DocumentDetail').then(m => ({ default: m.DocumentDetail })));
const Cart = lazyLoad(() => import('@/pages/Cart').then(m => ({ default: m.Cart })));
const Login = lazyLoad(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Register = lazyLoad(() => import('@/pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazyLoad(() => import('@/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazyLoad(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const SellerDashboard = lazyLoad(() => import('@/pages/SellerDashboard').then(m => ({ default: m.SellerDashboard })));
const Orders = lazyLoad(() => import('@/pages/Orders').then(m => ({ default: m.Orders })));
const Profile = lazyLoad(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Help = lazyLoad(() => import('@/pages/Help').then(m => ({ default: m.Help })));
const Contact = lazyLoad(() => import('@/pages/Contact').then(m => ({ default: m.Contact })));
const Terms = lazyLoad(() => import('@/pages/Terms').then(m => ({ default: m.Terms })));
const AdminDashboard = lazyLoad(() => import('@/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

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
              
              {/* Placeholder routes */}
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
