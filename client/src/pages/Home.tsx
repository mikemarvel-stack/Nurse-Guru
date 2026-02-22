import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Shield, 
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Upload,
  Stethoscope,
  ClipboardList,
  Pill,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useDocumentStore, useAuthStore } from '@/store';
import { formatPrice, truncateText, generateStarRating } from '@/lib/utils';
import type { Document } from '@/types';

function DocumentCard({ document }: { document: Document }) {
  const navigate = useNavigate();
  const stars = generateStarRating(document.rating);

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-md"
      onClick={() => navigate(`/document/${document.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={document.thumbnailUrl}
          alt={document.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {document.originalPrice && (
          <Badge className="absolute left-3 top-3 bg-red-500 hover:bg-red-600">
            Sale
          </Badge>
        )}
        {document.isBestseller && (
          <Badge className="absolute right-3 top-3 bg-amber-500 hover:bg-amber-600">
            <Award className="mr-1 h-3 w-3" />
            Bestseller
          </Badge>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl font-bold">{formatPrice(document.price)}</span>
            {document.originalPrice && (
              <span className="text-sm line-through opacity-70">
                {formatPrice(document.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="secondary" className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100">
            {document.subject}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {document.level}
          </Badge>
        </div>
        <h3 className="line-clamp-2 font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
          {document.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {truncateText(document.description, 80)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <img
            src={document.seller.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${document.seller.name}`}
            alt={document.seller.name}
            className="h-6 w-6 rounded-full border border-gray-200"
          />
          <span className="text-xs text-gray-600">{document.seller.name}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {stars.map((star, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  star.filled
                    ? 'fill-amber-400 text-amber-400'
                    : star.half
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-gray-600">({document.reviewCount})</span>
          </div>
          <span className="text-xs text-gray-500">{document.salesCount} sold</span>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ 
  icon: Icon, 
  title, 
  description, 
  count,
  href,
  color
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  count: number;
  href: string;
  color: string;
}) {
  return (
    <Link to={href}>
      <Card className="group h-full cursor-pointer border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardContent className="flex h-full flex-col items-start p-6">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{title}</h3>
          <p className="mt-2 flex-1 text-sm text-gray-600">{description}</p>
          <span className="mt-4 text-sm font-medium text-teal-600">
            {count} resources
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-600">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { featuredDocuments, bestsellerDocuments, documents, setFilters } = useDocumentStore();
  const { isAuthenticated, user } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters({ search: searchQuery.trim() });
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const recentDocuments = documents.slice(0, 4);

  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 py-20 lg:py-28">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-teal-500/10" />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-white/20 text-white backdrop-blur border-0">
              <Stethoscope className="mr-2 h-4 w-4" />
              Trusted by 25,000+ nursing students
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Path to
              <span className="block text-teal-200">Nursing Excellence</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-teal-100">
              Buy and sell high-quality nursing study materials. From NCLEX prep to care plans, 
              find everything you need to succeed in nursing school and beyond.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-xl">
              <div className="flex gap-2 rounded-full bg-white p-2 shadow-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search NCLEX prep, care plans, drug cards..."
                    className="border-0 pl-12 pr-4 rounded-full focus-visible:ring-0 text-gray-900 placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="rounded-full px-8 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">5K+</div>
                <div className="text-sm text-teal-200">Study Materials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">1.5K+</div>
                <div className="text-sm text-teal-200">Verified Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-sm text-teal-200">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.9/5</div>
                <div className="text-sm text-teal-200">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 text-teal-600 border-teal-200">
              Browse by Category
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">Find Your Study Resources</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive collection of nursing materials organized by category
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <CategoryCard
              icon={BookOpen}
              title="NCLEX Prep"
              description="Comprehensive NCLEX-RN and NCLEX-PN study guides and practice materials"
              count={1240}
              href="/browse?category=nclex-prep"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <CategoryCard
              icon={ClipboardList}
              title="Care Plans"
              description="Nursing care plans and assessments for clinical rotations"
              count={890}
              href="/browse?category=care-plans"
              color="bg-gradient-to-br from-teal-500 to-teal-600"
            />
            <CategoryCard
              icon={Pill}
              title="Drug Cards"
              description="Pharmacology flashcards and medication reference guides"
              count={650}
              href="/browse?category=drug-cards"
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <CategoryCard
              icon={GraduationCap}
              title="Study Guides"
              description="Comprehensive study materials for all nursing subjects"
              count={2100}
              href="/browse?category=study-guides"
              color="bg-gradient-to-br from-violet-500 to-violet-600"
            />
          </div>
        </div>
      </section>

      {/* Featured Documents */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <Badge variant="outline" className="mb-4 text-teal-600 border-teal-200">
                Featured
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">Editor's Picks</h2>
              <p className="mt-2 text-gray-600">Handpicked by our nursing education experts</p>
            </div>
            <Link to="/browse">
              <Button variant="outline" className="gap-2 rounded-full border-teal-200 hover:bg-teal-50 hover:text-teal-600">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDocuments.slice(0, 4).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <Badge variant="outline" className="mb-4 text-amber-600 border-amber-200">
                <Award className="mr-1 h-3 w-3" />
                Bestsellers
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">Most Popular This Month</h2>
              <p className="mt-2 text-gray-600">Top-rated materials loved by nursing students</p>
            </div>
            <Link to="/browse?sort=popular">
              <Button variant="outline" className="gap-2 rounded-full border-teal-200 hover:bg-teal-50 hover:text-teal-600">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellerDocuments.slice(0, 4).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-200">
                New Arrivals
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">Fresh Content</h2>
              <p className="mt-2 text-gray-600">New study materials added this week</p>
            </div>
            <Link to="/browse?sort=newest">
              <Button variant="outline" className="gap-2 rounded-full border-teal-200 hover:bg-teal-50 hover:text-teal-600">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 text-teal-600 border-teal-200">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">The Nurse Guru Advantage</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Join thousands of nursing students who trust Nurse Guru for their study needs
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Shield}
              title="Verified Quality"
              description="All materials are reviewed by experienced nurses and educators"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Download"
              description="Get immediate access to your purchased study materials"
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Secure Payments"
              description="Your transactions are protected with bank-level security"
            />
            <FeatureCard
              icon={Star}
              title="Money Back Guarantee"
              description="Not satisfied? Get a full refund within 7 days"
            />
          </div>
        </div>
      </section>

      {/* Become a Seller CTA */}
      {!isAuthenticated || user?.role === 'buyer' ? (
        <section className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-600 py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5" />
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/5" />
          </div>
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <Badge className="mb-4 bg-white/20 text-white border-0">
                  <Upload className="mr-2 h-4 w-4" />
                  Become a Seller
                </Badge>
                <h2 className="text-3xl font-bold text-white lg:text-4xl">
                  Share Your Nursing Knowledge
                </h2>
                <p className="mt-4 max-w-xl text-lg text-teal-100">
                  Join thousands of nursing students and professionals earning money from their study materials. 
                  Easy upload process, competitive fees, and instant payments.
                </p>
                <ul className="mt-6 space-y-3 text-left">
                  {[
                    'Keep up to 80% of each sale',
                    'Reach 25,000+ nursing students',
                    'Easy document management dashboard',
                    'Fast and secure payments'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-teal-100">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="gap-2 px-8 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                    <Upload className="h-5 w-5" />
                    Start Selling Today
                  </Button>
                </Link>
                <p className="text-center text-sm text-teal-200">
                  Free to join • No monthly fees
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Trust Badges */}
      <section className="border-t py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-teal-600" />
              <span className="font-semibold text-gray-700">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <span className="font-semibold text-gray-700">Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-amber-500" />
              <span className="font-semibold text-gray-700">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="font-semibold text-gray-700">25K+ Users</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
