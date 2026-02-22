import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { validators } from '@/lib/validators';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate
    const emailError = validators.email(email);
    if (emailError) {
      setErrors([emailError]);
      return;
    }

    setIsLoading(true);
    try {
      await fetch('http://localhost:3001/api/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setSubmitted(true);
    } catch (error) {
      setErrors([{ field: 'email', message: 'Failed to send reset email' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Reset Password</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Check your email</h3>
                  <p className="text-sm text-gray-600">
                    If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
                  </p>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {errors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-600">{errors[0].message}</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {isLoading ? 'Sending...' : (
                      <>
                        Send Reset Link
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Remember your password?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-teal-600 hover:underline font-medium"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
