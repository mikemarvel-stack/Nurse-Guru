import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  HeartPulse, 
  Upload,
  LogOut,
  ChevronDown,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore, useCartStore, useDocumentStore } from '@/store';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getCartCount } = useCartStore();
  const { setFilters } = useDocumentStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters({ search: searchQuery.trim() });
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-center text-sm text-white">
        <span className="font-medium">🩺 Trusted by 25,000+ nursing students & professionals</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-xl font-bold leading-tight text-gray-900">
                Nurse Guru
              </span>
              <span className="text-xs text-teal-600 font-medium">Study Smarter</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden max-w-lg flex-1 px-6 lg:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <Input
                type="search"
                placeholder="Search nursing notes, care plans, NCLEX prep..."
                className="pl-10 pr-4 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link to="/browse">
              <Button variant="ghost" className="text-gray-700 hover:text-teal-600 hover:bg-teal-50">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="ghost" className="text-gray-700 hover:text-teal-600 hover:bg-teal-50">
                <GraduationCap className="mr-2 h-4 w-4" />
                Categories
              </Button>
            </Link>
            
            {isAuthenticated && user?.role === 'seller' && (
              <Link to="/seller">
                <Button variant="ghost" className="text-gray-700 hover:text-teal-600 hover:bg-teal-50">
                  <Upload className="mr-2 h-4 w-4" />
                  Sell
                </Button>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-teal-50">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-medium text-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hover:bg-teal-50">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full border-2 border-teal-100"
                    />
                    <span className="hidden sm:inline font-medium">{user?.name.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    My Downloads
                  </DropdownMenuItem>
                  {user?.role === 'seller' && (
                    <DropdownMenuItem onClick={() => navigate('/seller')}>
                      <Upload className="mr-2 h-4 w-4" />
                      Seller Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden gap-2 sm:flex">
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-teal-50 hover:text-teal-600">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-teal-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t py-4 lg:hidden">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search nursing resources..."
                  className="pl-10 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2">
              <Link to="/browse" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start hover:bg-teal-50">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse
                </Button>
              </Link>
              <Link to="/categories" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start hover:bg-teal-50">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Categories
                </Button>
              </Link>
              {isAuthenticated && user?.role === 'seller' && (
                <Link to="/seller" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-teal-50">
                    <Upload className="mr-2 h-4 w-4" />
                    Sell
                  </Button>
                </Link>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start hover:bg-teal-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
