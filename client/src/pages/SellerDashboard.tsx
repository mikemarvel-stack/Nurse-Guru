import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart3,
  Download,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useAuthStore, useDocumentStore, useOrderStore } from '@/store';
import { documentCategories, documentLevels, subjects } from '@/store';
import { formatPrice, formatFileSize, formatDate, formatNumber } from '@/lib/utils';
import type { DocumentCategory, DocumentLevel } from '@/types';

export function SellerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { documents, uploadDocument } = useDocumentStore();
  const { orders } = useOrderStore();
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '' as DocumentCategory,
    level: '' as DocumentLevel,
    subject: '',
    price: '',
    tags: [] as string[],
    file: null as File | null
  });
  const [tagInput, setTagInput] = useState('');

  // Redirect if not authenticated or not a seller
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/seller' } });
    return null;
  }

  if (user?.role !== 'SELLER' && user?.role !== 'seller') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Seller Access Required</h1>
          <p className="mt-2 text-gray-600">
            You need a seller account to access this page. Upgrade your account to start selling.
          </p>
          <Button className="mt-6" onClick={() => navigate('/profile')}>
            Upgrade Account
          </Button>
        </div>
      </div>
    );
  }

  // Get seller's documents
  const myDocuments = documents.filter(d => d.sellerId === user.id);
  const myOrders = orders.filter(o => o.document.sellerId === user.id);
  
  // Calculate stats
  const totalSales = myOrders.filter(o => o.status === 'completed').length;
  const totalRevenue = myOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);
  const totalDownloads = myOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.downloadCount, 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !uploadData.tags.includes(tagInput.trim())) {
      setUploadData({ ...uploadData, tags: [...uploadData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setUploadData({ ...uploadData, tags: uploadData.tags.filter(t => t !== tag) });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await uploadDocument({
        title: uploadData.title,
        description: uploadData.description,
        category: uploadData.category,
        level: uploadData.level,
        subject: uploadData.subject,
        price: parseFloat(uploadData.price),
        fileUrl: '/documents/' + uploadData.file?.name || 'sample.pdf',
        fileType: uploadData.file?.name.split('.').pop()?.toUpperCase() || 'PDF',
        fileSize: uploadData.file?.size || 0,
        pageCount: Math.floor(Math.random() * 100) + 10,
        wordCount: Math.floor(Math.random() * 50000) + 5000,
        previewPages: 5,
        thumbnailUrl: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop`,
        sellerId: user.id,
        tags: uploadData.tags
      });
      setUploadSuccess(true);
      setTimeout(() => {
        setShowUploadDialog(false);
        setUploadSuccess(false);
        setUploadStep(1);
        setUploadData({
          title: '',
          description: '',
          category: '' as DocumentCategory,
          level: '' as DocumentLevel,
          subject: '',
          price: '',
          tags: [],
          file: null
        });
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const canProceed = () => {
    if (uploadStep === 1) {
      return uploadData.title && uploadData.description && uploadData.category && uploadData.level && uploadData.subject;
    }
    if (uploadStep === 2) {
      return uploadData.price && parseFloat(uploadData.price) > 0;
    }
    if (uploadStep === 3) {
      return uploadData.file !== null;
    }
    return true;
  };

  return (
    <>
      <SEO data={seoConfigs.seller()} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage your documents and track your earnings</p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => setShowUploadDialog(true)}
          >
            <Plus className="h-5 w-5" />
            Upload Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold">{formatNumber(totalSales)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold">{formatNumber(totalDownloads)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Download className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="text-2xl font-bold">{myDocuments.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            {myDocuments.length === 0 ? (
              <div className="rounded-lg border border-dashed py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No documents yet</h3>
                <p className="mt-2 text-gray-600">Upload your first document to start selling</p>
                <Button 
                  className="mt-4 gap-2"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myDocuments.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={doc.thumbnailUrl}
                          alt={doc.title}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                                  {doc.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {formatDate(doc.createdAt)}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline">{doc.subject}</Badge>
                                <Badge variant="outline">{doc.category}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{formatPrice(doc.price)}</p>
                              <p className="text-sm text-gray-600">{doc.salesCount} sales</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {doc.salesCount * 12} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {doc.rating} ({doc.reviewCount})
                              </span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/document/${doc.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            {myOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed py-16 text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No sales yet</h3>
                <p className="mt-2 text-gray-600">Your sales will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={order.document.thumbnailUrl}
                            alt={order.document.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold">{order.document.title}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(order.createdAt)}
                            </p>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(order.amount)}</p>
                          <p className="text-sm text-gray-600">
                            {order.downloadCount} downloads
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-64 items-center justify-center text-gray-400">
                    <BarChart3 className="h-12 w-12" />
                    <span className="ml-2">Analytics coming soon</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {myDocuments
                    .sort((a, b) => b.salesCount - a.salesCount)
                    .slice(0, 5)
                    .map((doc, i) => (
                      <div key={doc.id} className="flex items-center gap-4 py-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-semibold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-600">{doc.salesCount} sales</p>
                        </div>
                        <span className="font-semibold">{formatPrice(doc.price * doc.salesCount)}</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {uploadSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">Upload Successful!</DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="mt-4 text-gray-600">
                  Your document has been uploaded and is pending review.
                </p>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Step {uploadStep} of 3: {
                    uploadStep === 1 ? 'Document Information' :
                    uploadStep === 2 ? 'Pricing' :
                    'Upload File'
                  }
                </DialogDescription>
              </DialogHeader>

              {/* Progress */}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full ${
                      s <= uploadStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-4">
                {/* Step 1: Document Info */}
                {uploadStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Advanced Machine Learning Research Paper"
                        value={uploadData.title}
                        onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your document..."
                        rows={4}
                        value={uploadData.description}
                        onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={uploadData.category}
                          onValueChange={(v) => setUploadData({ ...uploadData, category: v as DocumentCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Level *</Label>
                        <Select
                          value={uploadData.level}
                          onValueChange={(v) => setUploadData({ ...uploadData, level: v as DocumentLevel })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Select
                        value={uploadData.subject}
                        onValueChange={(v) => setUploadData({ ...uploadData, subject: v })}
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
                  </>
                )}

                {/* Step 2: Pricing */}
                {uploadStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          min="0.99"
                          step="0.01"
                          placeholder="29.99"
                          className="pl-10"
                          value={uploadData.price}
                          onChange={(e) => setUploadData({ ...uploadData, price: e.target.value })}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        You will receive 80% of each sale ({uploadData.price ? formatPrice(parseFloat(uploadData.price) * 0.8) : '$0.00'})
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tags (press Enter)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={addTag}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {uploadData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button onClick={() => removeTag(tag)}>×</button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: File Upload */}
                {uploadStep === 3 && (
                  <>
                    <div 
                      className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 font-medium">
                        {uploadData.file ? uploadData.file.name : 'Click to upload your document'}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Supported formats: PDF, DOCX, PPTX (max 50MB)
                      </p>
                      {uploadData.file && (
                        <p className="mt-2 text-sm text-green-600">
                          {formatFileSize(uploadData.file.size)}
                        </p>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.pptx"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        By uploading, you confirm that you own the rights to this document 
                        and agree to our Terms of Service.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {/* Navigation */}
                <div className="flex gap-2">
                  {uploadStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setUploadStep(uploadStep - 1)}
                    >
                      Back
                    </Button>
                  )}
                  {uploadStep < 3 ? (
                    <Button 
                      type="button" 
                      className="flex-1"
                      onClick={() => setUploadStep(uploadStep + 1)}
                      disabled={!canProceed()}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      className="flex-1"
                      onClick={handleUpload}
                      disabled={!canProceed() || isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
