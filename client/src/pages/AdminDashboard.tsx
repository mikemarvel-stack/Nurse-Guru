import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useAuthStore } from '@/store';

interface Stats {
  totalUsers: number;
  totalDocuments: number;
  totalRevenue: number;
  pendingDocuments: number;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login', { state: { from: '/admin' } });
      return;
    }

    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      // TODO: Implement admin API endpoints
      // For now, using dummy data
      setStats({
        totalUsers: 1250,
        totalDocuments: 3450,
        totalRevenue: 45320,
        pendingDocuments: 23
      });
      setContacts([]);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <>
        <SEO data={seoConfigs.home()} />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You do not have permission to access the admin dashboard.
            </p>
            <Button onClick={() => navigate('/')} className="mt-6">
              Go Home
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-teal-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
              <p className="text-gray-600 text-sm mt-1">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stats?.totalDocuments || 0}</div>
              <p className="text-gray-600 text-sm mt-1">Total Documents</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">${(stats?.totalRevenue || 0).toLocaleString()}</div>
              <p className="text-gray-600 text-sm mt-1">Total Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <AlertCircle className="h-8 w-8 text-orange-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stats?.pendingDocuments || 0}</div>
              <p className="text-gray-600 text-sm mt-1">Pending Review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span>Active Users (Last 30 days)</span>
                    <span className="font-semibold">842</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Documents Uploaded (Last 30 days)</span>
                    <span className="font-semibold">234</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Total Transactions</span>
                    <span className="font-semibold">5,234</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>System Uptime</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Document Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">No pending documents for review</p>
                {/* TODO: List pending documents */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management interface coming soon</p>
                {/* TODO: User management interface */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <p className="text-gray-600">No messages</p>
                ) : (
                  <div className="space-y-3">
                    {contacts.map(contact => (
                      <div key={contact.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{contact.name}</p>
                            <p className="text-sm text-gray-600">{contact.email}</p>
                          </div>
                          <Badge>{contact.status}</Badge>
                        </div>
                        <p className="text-sm">{contact.subject}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
