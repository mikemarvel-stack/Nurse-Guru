import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { validators, type ValidationError } from '@/lib/validators';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors(errors.filter(e => e.field !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationError[] = [];

    // Validate password
    const passwordError = validators.password(formData.password);
    if (passwordError) newErrors.push(passwordError);

    // Validate match
    const matchError = validators.matchPasswords(formData.password, formData.confirmPassword);
    if (matchError) newErrors.push(matchError);

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors([{ field: 'token', message: data.error || 'Failed to reset password' }]);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setErrors([{ field: 'form', message: 'Failed to reset password. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <SEO data={seoConfigs.home()} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <h2 className="text-lg font-bold text-gray-900">Invalid Reset Link</h2>
              <p className="text-gray-600">
                The password reset link is missing or invalid. Please request a new one.
              </p>
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                Request New Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-3 text-teal-600" />
              <CardTitle className="text-2xl">Create New Password</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                  <h3 className="font-semibold text-gray-900">Password Reset Successful</h3>
                  <p className="text-sm text-gray-600">
                    Your password has been reset. You can now log in with your new password.
                  </p>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Go to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.map(error => error.field === 'form' && (
                    <div key={error.field} className="p-3 bg-red-50 border border-red-200 rounded flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error.message}</p>
                    </div>
                  ))}

                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className="mt-2"
                    />
                    {errors.find(e => e.field === 'password') && (
                      <p className="text-sm text-red-600 mt-1">{errors.find(e => e.field === 'password')?.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className="mt-2"
                    />
                    {errors.find(e => e.field === 'confirmPassword') && (
                      <p className="text-sm text-red-600 mt-1">{errors.find(e => e.field === 'confirmPassword')?.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
