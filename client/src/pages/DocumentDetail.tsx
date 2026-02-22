import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  Download, 
  FileText, 
  Calendar, 
  CheckCircle2,
  ShoppingCart,
  Heart,
  Share2,
  Shield,
  Clock,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useDocumentStore, useCartStore, useAuthStore, useOrderStore } from '@/store';
import { formatPrice, formatFileSize, formatDate, generateStarRating, truncateText } from '@/lib/utils';

export function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDocumentById, documents } = useDocumentStore();
  const { addToCart, isInCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { orders, createOrder, completeOrder } = useOrderStore();
  
  const [docItem, setDocItem] = useState<Document | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocumentById(id).then(doc => setDocItem(doc));
    }
  }, [id, fetchDocumentById]);

  if (!docItem) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-gray-300" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Document Not Found</h1>
          <p className="mt-2 text-gray-600">The document you're looking for doesn't exist.</p>
          <Button className="mt-6" onClick={() => navigate('/browse')}>
            Browse Documents
          </Button>
        </div>
      </div>
    );
  }

  const stars = generateStarRating(docItem.rating);
  const inCart = isInCart(docItem.id);
  
  // Check if user already purchased this document
  const existingOrder = orders.find(o => o.documentId === docItem.id && o.buyerId === user?.id);
  const hasPurchased = existingOrder?.status === 'completed';

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/document/${id}` } });
      return;
    }
    setShowPurchaseDialog(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    try {
      const order = await createOrder(docItem.id, docItem.price);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      await completeOrder(order.id);
      setPurchaseSuccess(true);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (existingOrder && hasPurchased) {
      // Create a blob for the file download simulation
      const blob = new Blob(['This is a sample document content. In a real application, this would be the actual document file.'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${docItem.title.replace(/\s+/g, '_')}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const relatedDocuments = useDocumentStore((state) => 
    state.documents
      .filter(d => d.id !== docItem.id && d.category === docItem.category)
      .slice(0, 3)
  );

  return (
    <>
      <SEO data={seoConfigs.document(docItem)} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-blue-600">Browse</Link>
          <span>/</span>
          <Link to={`/browse?category=${docItem.category}`} className="hover:text-blue-600 capitalize">
            {docItem.category.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{truncateText(docItem.title, 40)}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Document Preview */}
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={docItem.thumbnailUrl}
                alt={docItem.title}
                className="h-64 w-full object-cover sm:h-96"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-600">{docItem.subject}</Badge>
                  <Badge variant="secondary">{docItem.level}</Badge>
                  <Badge variant="outline" className="bg-white/20 text-white">
                    {docItem.fileType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{docItem.title}</h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  {stars.map((star, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        star.filled
                          ? 'fill-amber-400 text-amber-400'
                          : star.half
                          ? 'fill-amber-400/50 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">
                    {docItem.rating} ({docItem.reviewCount} reviews)
                  </span>
                </div>
                <Separator orientation="vertical" className="h-5 hidden sm:block" />
                <span className="text-gray-600">{docItem.salesCount} sales</span>
                <Separator orientation="vertical" className="h-5 hidden sm:block" />
                <span className="text-gray-600">Added {formatDate(docItem.createdAt)}</span>
              </div>

              {/* Seller Info */}
              <div className="mt-6 flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                <img
                  src={docItem.seller.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${docItem.seller.name}`}
                  alt={docItem.seller.name}
                  className="h-14 w-14 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{docItem.seller.name}</p>
                  <p className="text-sm text-gray-600">
                    {docItem.seller.totalSales} documents sold
                  </p>
                </div>
                <Button variant="outline">View Profile</Button>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="mt-8">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{docItem.description}</p>
                    
                    <h4 className="mt-6 font-semibold text-gray-900">What's Included:</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Full document in {docItem.fileType} format
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {docItem.previewPages} preview pages available
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Instant download after purchase
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        7-day money-back guarantee
                      </li>
                    </ul>

                    <h4 className="mt-6 font-semibold text-gray-900">Tags:</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {docItem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">File Type</p>
                        <p className="font-medium">{docItem.fileType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <Download className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">File Size</p>
                        <p className="font-medium">{formatFileSize(docItem.fileSize)}</p>
                      </div>
                    </div>
                    {docItem.pageCount && (
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <Eye className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Pages</p>
                          <p className="font-medium">{docItem.pageCount}</p>
                        </div>
                      </div>
                    )}
                    {docItem.wordCount && (
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Word Count</p>
                          <p className="font-medium">{docItem.wordCount.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Published</p>
                        <p className="font-medium">{formatDate(docItem.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">License</p>
                        <p className="font-medium">Personal Use</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  <div className="space-y-4">
                    {docItem.reviewCount > 0 ? (
                      <>
                        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">
                              {docItem.rating}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {stars.map((star, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    star.filled
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {docItem.reviewCount} reviews
                            </p>
                          </div>
                          <Separator orientation="vertical" className="h-20" />
                          <div className="flex-1">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} className="flex items-center gap-2">
                                <span className="w-4 text-sm">{star}</span>
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <div className="flex-1 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-amber-400"
                                    style={{ width: `${Math.random() * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-center text-gray-600">
                          Reviews feature coming soon...
                        </p>
                      </>
                    ) : (
                      <p className="text-center text-gray-600">No reviews yet</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Purchase Card */}
              <Card>
                <CardContent className="p-6">
                  {hasPurchased ? (
                    <>
                      <div className="mb-4 flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                        <span className="font-semibold">You own this document</span>
                      </div>
                      <Button 
                        className="w-full gap-2" 
                        size="lg"
                        onClick={handleDownload}
                      >
                        <Download className="h-5 w-5" />
                        Download Now
                      </Button>
                      <p className="mt-2 text-center text-sm text-gray-600">
                        {existingOrder?.downloadCount || 0} / {existingOrder?.maxDownloads || 5} downloads used
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(docItem.price)}
                        </span>
                        {docItem.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(docItem.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      {docItem.originalPrice && (
                        <Badge className="mt-2 bg-red-500">
                          Save {formatPrice(docItem.originalPrice - docItem.price)}
                        </Badge>
                      )}

                      <div className="mt-6 space-y-3">
                        <Button 
                          className="w-full gap-2" 
                          size="lg"
                          onClick={handlePurchase}
                        >
                          <ShoppingCart className="h-5 w-5" />
                          Buy Now
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={() => addToCart(docItem)}
                          disabled={inCart}
                        >
                          {inCart ? 'Added to Cart' : 'Add to Cart'}
                        </Button>
                      </div>

                      <div className="mt-6 space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Shield className="h-4 w-4" />
                          Secure payment
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Download className="h-4 w-4" />
                          Instant download
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          7-day money-back guarantee
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Heart className="h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Notice */}
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  {docItem.previewPages} preview pages available. 
                  Purchase to access the full document.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Related Documents */}
        {relatedDocuments.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Related Documents</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedDocuments.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                  onClick={() => navigate(`/document/${doc.id}`)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={doc.thumbnailUrl}
                      alt={doc.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900">{truncateText(doc.title, 50)}</h3>
                    <p className="mt-1 text-sm text-gray-600">{truncateText(doc.description, 80)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-blue-600">{formatPrice(doc.price)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm">{doc.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          {!purchaseSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Complete Your Purchase</DialogTitle>
                <DialogDescription>
                  You're about to purchase "{truncateText(docItem.title, 50)}"
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span>Document Price</span>
                    <span>{formatPrice(docItem.price)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span>Processing Fee</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(docItem.price)}</span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="mt-1 text-sm text-gray-600">Credit Card ending in 4242</p>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={processPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatPrice(docItem.price)}`}
                </Button>
                
                <p className="text-center text-xs text-gray-600">
                  By completing this purchase, you agree to our Terms of Service
                </p>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">Purchase Successful!</DialogTitle>
              </DialogHeader>
              
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                
                <p className="mt-4 text-gray-600">
                  Your document is ready for download!
                </p>
                
                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full gap-2"
                    onClick={() => {
                      handleDownload();
                      setShowPurchaseDialog(false);
                    }}
                  >
                    <Download className="h-5 w-5" />
                    Download Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setShowPurchaseDialog(false);
                      navigate('/orders');
                    }}
                  >
                    View My Orders
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
