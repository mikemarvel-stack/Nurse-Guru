import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  Calendar, 
  CheckCircle2,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore, useOrderStore } from '@/store';
import { formatPrice, formatDate, formatFileSize, truncateText } from '@/lib/utils';
import type { Order } from '@/types';

export function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { orders, canDownload, incrementDownload } = useOrderStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/orders' } });
    return null;
  }

  // Get user's orders
  const userOrders = orders.filter(o => o.buyerId === user?.id);

  // Filter orders
  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = 
      order.document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.document.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');

  const handleDownload = (orderId: string, documentTitle: string) => {
    if (canDownload(orderId)) {
      // Simulate file download
      const blob = new Blob(['This is a sample document content. In a real application, this would be the actual document file.'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      incrementDownload(orderId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">
          Manage your purchases and downloads
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{userOrders.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {userOrders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">
                  {formatPrice(userOrders
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + o.amount, 0)
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All Orders ({filteredOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <OrdersList 
            orders={filteredOrders} 
            onDownload={handleDownload}
            canDownload={canDownload}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <OrdersList 
            orders={completedOrders}
            onDownload={handleDownload}
            canDownload={canDownload}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <OrdersList 
            orders={pendingOrders}
            onDownload={handleDownload}
            canDownload={canDownload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OrdersListProps {
  orders: Order[];
  onDownload: (orderId: string, documentTitle: string) => void;
  canDownload: (orderId: string) => boolean;
}

function OrdersList({ orders, onDownload, canDownload }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No orders found</h3>
        <p className="mt-2 text-gray-600">
          {orders.length === 0 ? 'You haven\'t made any purchases yet.' : 'No orders match your filters.'}
        </p>
        <Link to="/browse">
          <Button className="mt-4">Browse Documents</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={order.document.thumbnailUrl}
                alt={order.document.title}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/document/${order.document.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {truncateText(order.document.title, 60)}
                      </Link>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.document.subject} • {order.document.level}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </span>
                      <span>{formatPrice(order.amount)}</span>
                      <span>{formatFileSize(order.document.fileSize)}</span>
                      <span>{order.document.fileType}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {order.status === 'completed' ? (
                  <>
                    <Button
                      className="gap-2"
                      onClick={() => onDownload(order.id, order.document.title)}
                      disabled={!canDownload(order.id)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <p className="text-xs text-gray-600">
                      {order.downloadCount} / {order.maxDownloads} downloads
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">Processing</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
