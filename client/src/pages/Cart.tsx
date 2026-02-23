import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  CheckCircle2,
  Shield,
  Download,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useCartStore, useAuthStore, useOrderStore } from '@/store';
import { formatPrice, truncateText } from '@/lib/utils';

export function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, getCartTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { createOrder, completeOrder } = useOrderStore();
  
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const cartTotal = getCartTotal();
  const processingFee = 0;
  const total = cartTotal + processingFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setShowCheckoutDialog(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    try {
      // Process each item in cart
      for (const item of items) {
        const order = await createOrder(item.document.id, item.document.price.toString());
        if (order) {
          await completeOrder(order.id);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPurchaseSuccess(true);
      await clearCart();
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !purchaseSuccess) {
    return (
      <>
        <SEO data={seoConfigs.cart()} />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Your cart is empty</h1>
            <p className="mt-2 text-gray-600">
              Looks like you haven't added any documents to your cart yet.
            </p>
            <Link to="/browse">
              <Button className="mt-6" size="lg">
                Browse Documents
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO data={seoConfigs.cart()} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mt-2 text-gray-600">{items.length} item(s) in your cart</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.document.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.document.thumbnailUrl}
                        alt={item.document.title}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link 
                              to={`/document/${item.document.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {truncateText(item.document.title, 60)}
                            </Link>
                            <p className="mt-1 text-sm text-gray-600">
                              {truncateText(item.document.description, 80)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">{item.document.subject}</Badge>
                              <Badge variant="outline">{item.document.level}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(item.document.price)}
                            </p>
                            {item.document.originalPrice && (
                              <p className="text-sm text-gray-400 line-through">
                                {formatPrice(item.document.originalPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>By {item.document.seller.name}</span>
                            <span>•</span>
                            <span>{item.document.salesCount} sold</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeFromCart(item.document.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Link to="/browse">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              <Button variant="ghost" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({items.length} items)</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Fee</span>
                      <span>{formatPrice(processingFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button 
                    className="mt-6 w-full gap-2" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5" />
                  </Button>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Shield className="h-4 w-4" />
                      Secure SSL encryption
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Download className="h-4 w-4" />
                      Instant download after purchase
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      7-day money-back guarantee
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-900">Have a promo code?</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 rounded-md border px-3 py-2 text-sm"
                    />
                    <Button variant="outline" size="sm">Apply</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-lg">
          {!purchaseSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Complete Your Purchase</DialogTitle>
                <DialogDescription>
                  Review your order and complete the payment
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Order Items */}
                <div className="max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-4">
                  {items.map((item) => (
                    <div key={item.document.id} className="flex justify-between py-2">
                      <span className="text-sm">{truncateText(item.document.title, 40)}</span>
                      <span className="text-sm font-medium">
                        {formatPrice(item.document.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span>Processing Fee</span>
                    <span>{formatPrice(processingFee)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Payment Method */}
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
                  {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
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
                  Your documents are ready for download!
                </p>
                
                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full gap-2"
                    onClick={() => {
                      setShowCheckoutDialog(false);
                      navigate('/orders');
                    }}
                  >
                    <Download className="h-5 w-5" />
                    Go to My Downloads
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setShowCheckoutDialog(false);
                      navigate('/browse');
                    }}
                  >
                    Continue Shopping
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
