import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X,
  Star,
  Grid3X3,
  List,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useDocumentStore, useCartStore } from '@/store';
import { documentCategories, documentLevels, subjects } from '@/store';
import { formatPrice, truncateText, generateStarRating } from '@/lib/utils';
import type { Document, DocumentCategory, DocumentLevel } from '@/types';

function DocumentCard({ document, viewMode }: { document: Document; viewMode: 'grid' | 'list' }) {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCartStore();
  const stars = generateStarRating(document.rating);
  const inCart = isInCart(document.id);

  if (viewMode === 'list') {
    return (
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
        <div className="flex flex-col sm:flex-row">
          <div 
            className="relative aspect-video w-full cursor-pointer overflow-hidden sm:aspect-square sm:w-48"
            onClick={() => navigate(`/document/${document.id}`)}
          >
            <img
              src={document.thumbnailUrl}
              alt={document.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {document.originalPrice && (
              <Badge className="absolute left-2 top-2 bg-red-500">Sale</Badge>
            )}
          </div>
          <CardContent className="flex flex-1 flex-col p-4">
            <div onClick={() => navigate(`/document/${document.id}`)}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {document.title}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(document.price)}
                  </span>
                  {document.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(document.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {truncateText(document.description, 150)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{document.subject}</Badge>
                <Badge variant="outline">{document.level}</Badge>
                <Badge variant="outline">{document.fileType}</Badge>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-3">
                <img
                  src={document.seller.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${document.seller.name}`}
                  alt={document.seller.name}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{document.seller.name}</p>
                  <div className="flex items-center gap-1">
                    {stars.map((star, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          star.filled
                            ? 'fill-amber-400 text-amber-400'
                            : star.half
                            ? 'fill-amber-400/50 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-gray-500">
                      ({document.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{document.salesCount} sold</span>
                <Button
                  size="sm"
                  disabled={inCart}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(document.id);
                  }}
                >
                  {inCart ? 'In Cart' : <ShoppingCart className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={() => navigate(`/document/${document.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={document.thumbnailUrl}
          alt={document.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {document.originalPrice && (
          <Badge className="absolute left-2 top-2 bg-red-500">Sale</Badge>
        )}
        {document.isBestseller && (
          <Badge className="absolute right-2 top-2 bg-amber-500">Bestseller</Badge>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center gap-1 text-white">
            <span className="text-lg font-bold">{formatPrice(document.price)}</span>
            {document.originalPrice && (
              <span className="text-sm line-through opacity-70">
                {formatPrice(document.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-2 font-semibold text-gray-900 group-hover:text-blue-600">
          {document.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {truncateText(document.description, 80)}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">{document.subject}</Badge>
          <Badge variant="outline" className="text-xs">{document.level}</Badge>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <img
            src={document.seller.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${document.seller.name}`}
            alt={document.seller.name}
            className="h-6 w-6 rounded-full"
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
        <Button
          className="mt-3 w-full"
          size="sm"
          disabled={inCart}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(document.id);
          }}
        >
          {inCart ? 'Added to Cart' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}

function FilterSidebar({ 
  filters, 
  onFilterChange,
  priceRange,
  onPriceChange
}: { 
  filters: {
    category?: DocumentCategory;
    level?: DocumentLevel;
    subject?: string;
    minRating?: number;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
  priceRange: [number, number];
  onPriceChange: (value: [number, number]) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="mb-3 font-semibold">Price Range</h4>
        <Slider
          value={priceRange}
          max={100}
          step={5}
          onValueChange={(value) => onPriceChange(value as [number, number])}
        />
        <div className="mt-2 flex justify-between text-sm text-gray-600">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="mb-3 font-semibold">Categories</h4>
        <div className="space-y-2">
          {documentCategories.map((cat) => (
            <div key={cat.value} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.value}`}
                checked={filters.category === cat.value}
                onCheckedChange={(checked) => 
                  onFilterChange('category', checked ? cat.value : undefined)
                }
              />
              <Label htmlFor={`cat-${cat.value}`} className="text-sm">
                {cat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Level */}
      <div>
        <h4 className="mb-3 font-semibold">Academic Level</h4>
        <div className="space-y-2">
          {documentLevels.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={`level-${level.value}`}
                checked={filters.level === level.value}
                onCheckedChange={(checked) => 
                  onFilterChange('level', checked ? level.value : undefined)
                }
              />
              <Label htmlFor={`level-${level.value}`} className="text-sm">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="mb-3 font-semibold">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.minRating === rating}
                onCheckedChange={(checked) => 
                  onFilterChange('minRating', checked ? String(rating) : undefined)
                }
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-1">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <h4 className="mb-3 font-semibold">Subject</h4>
        <Select
          value={filters.subject}
          onValueChange={(value) => onFilterChange('subject', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterDocuments, setFilters, filters: storeFilters } = useDocumentStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') as DocumentCategory | undefined,
    level: searchParams.get('level') as DocumentLevel | undefined,
    subject: searchParams.get('subject') || undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
  });

  // Update filters from URL on mount
  useEffect(() => {
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') as DocumentCategory | undefined;
    const level = searchParams.get('level') as DocumentLevel | undefined;
    const subject = searchParams.get('subject') || undefined;
    const sortBy = (searchParams.get('sort') as typeof storeFilters.sortBy) || 'newest';
    
    setLocalFilters({ category, level, subject, minRating: undefined });
    setFilters({ search, category, level, subject, sortBy });
  }, [searchParams, setFilters]);

  const filteredDocuments = filterDocuments();

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
    
    setFilters({ [key]: value });
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    setSearchParams(params);
    setFilters({ sortBy: value as typeof storeFilters.sortBy });
  };

  const clearFilters = () => {
    setLocalFilters({
      category: undefined,
      level: undefined,
      subject: undefined,
      minRating: undefined
    });
    setPriceRange([0, 100]);
    setSearchParams({});
    setFilters({ 
      search: undefined, 
      category: undefined, 
      level: undefined, 
      subject: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = Object.values(localFilters).some(Boolean) || 
    priceRange[0] > 0 || 
    priceRange[1] < 100;

  return (
    <>
      <SEO data={seoConfigs.browse(localFilters)} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Documents</h1>
          <p className="mt-2 text-gray-600">
            {filteredDocuments.length} documents available
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('search') as HTMLInputElement;
              const params = new URLSearchParams(searchParams);
              if (input.value) {
                params.set('search', input.value);
              } else {
                params.delete('search');
              }
              setSearchParams(params);
              setFilters({ search: input.value || undefined });
            }}
            className="relative max-w-md flex-1"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              name="search"
              type="search"
              placeholder="Search documents..."
              className="pl-10"
              defaultValue={searchParams.get('search') || ''}
            />
          </form>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 lg:hidden">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar
                    filters={localFilters}
                    onFilterChange={handleFilterChange}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select
              value={storeFilters.sortBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-40">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="hidden border rounded-md sm:flex">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {localFilters.category && (
              <Badge variant="secondary" className="gap-1">
                {documentCategories.find(c => c.value === localFilters.category)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', undefined)}
                />
              </Badge>
            )}
            {localFilters.level && (
              <Badge variant="secondary" className="gap-1">
                {documentLevels.find(l => l.value === localFilters.level)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('level', undefined)}
                />
              </Badge>
            )}
            {localFilters.subject && (
              <Badge variant="secondary" className="gap-1">
                {localFilters.subject}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('subject', undefined)}
                />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 100) && (
              <Badge variant="secondary" className="gap-1">
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>
              <FilterSidebar
                filters={localFilters}
                onFilterChange={handleFilterChange}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                <Search className="h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No documents found</h3>
                <p className="mt-2 text-gray-600">Try adjusting your filters or search query</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' 
                : 'space-y-4'
              }>
                {filteredDocuments.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
