import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/profile' } });
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // TODO: Implement profile update API call
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

          {/* Profile Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user?.avatar && (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-grow">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="mt-2 bg-gray-50"
                        />
                        <p className="text-sm text-gray-600 mt-2">Email cannot be changed</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                          Save Changes
                        </Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                      <p className="text-gray-600 mt-2 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </p>
                      <p className="text-gray-600 mt-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDate(new Date(user?.createdAt || '').toISOString())}
                      </p>
                      <Button 
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="mt-4"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-teal-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900">
                  {user?.role === 'seller' ? user?.totalSales || 0 : user?.totalPurchases || 0}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {user?.role === 'seller' ? 'Documents Sold' : 'Documents Purchased'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-8 w-8 text-pink-600 mb-2">💜</div>
                <div className="text-3xl font-bold text-gray-900">
                  ${(user?.balance || 0).toFixed(2)}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {user?.role === 'seller' ? 'Earnings' : 'Account Balance'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-teal-600">
                    {user?.role === 'seller' ? 'S' : 'B'}
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 capitalize">
                  {user?.role?.toLowerCase() || 'buyer'}
                </div>
                <p className="text-gray-600 text-sm mt-1">Account Type</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user?.role === 'buyer' && (
                <Button variant="outline" className="w-full text-left justify-start">
                  Upgrade to Seller
                </Button>
              )}
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="w-full text-left justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
