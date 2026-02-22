import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, HeartPulse, CheckCircle2, ArrowRight, BookOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SEO, seoConfigs } from '@/components/seo/SEO';
import { useAuthStore } from '@/store';
import { getPasswordStrength } from '@/lib/utils';

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await register(email, password, name, role);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!name || !email)) {
      setError('Please fill in all fields');
      return;
    }
    if (step === 2 && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  return (
    <>
      <SEO data={seoConfigs.register()} />
      
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200">
                <HeartPulse className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-gray-900 block">Nurse Guru</span>
                <span className="text-sm text-teal-600 font-medium">Study Smarter</span>
              </div>
            </Link>
            <p className="mt-4 text-gray-600">Create your free account today</p>
          </div>

          {/* Progress */}
          <div className="mb-6 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-10 rounded-full transition-colors ${
                  s <= step ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center">
                {step === 1 && 'Create Your Account'}
                {step === 2 && 'Set Your Password'}
                {step === 3 && 'Choose Your Role'}
              </CardTitle>
              <CardDescription className="text-center">
                {step === 1 && 'Enter your basic information'}
                {step === 2 && 'Create a secure password'}
                {step === 3 && 'How will you use Nurse Guru?'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jane Smith, RN"
                          className="pl-10 rounded-lg"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 rounded-lg"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      className="w-full gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                      onClick={nextStep}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 rounded-lg"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength */}
                    {password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full bg-gray-200 h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{passwordStrength.label}</span>
                        </div>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li className={password.length >= 8 ? 'text-emerald-600' : ''}>
                            <CheckCircle2 className={`inline h-3 w-3 mr-1 ${password.length >= 8 ? 'text-emerald-600' : 'text-gray-400'}`} />
                            At least 8 characters
                          </li>
                          <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-emerald-600' : ''}>
                            <CheckCircle2 className={`inline h-3 w-3 mr-1 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`} />
                            Upper and lowercase letters
                          </li>
                          <li className={/\d/.test(password) ? 'text-emerald-600' : ''}>
                            <CheckCircle2 className={`inline h-3 w-3 mr-1 ${/\d/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`} />
                            At least one number
                          </li>
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-lg">
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        className="flex-1 gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                        onClick={nextStep}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Role Selection */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <button
                        type="button"
                        className={`rounded-xl border-2 p-5 text-left transition-all ${
                          role === 'buyer'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setRole('buyer')}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-xl p-3 ${
                            role === 'buyer' ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white' : 'bg-gray-100'
                          }`}>
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">I'm a Nursing Student</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              I want to purchase study materials and prepare for exams
                            </p>
                            {role === 'buyer' && (
                              <Badge className="mt-3 bg-teal-500">Selected</Badge>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`rounded-xl border-2 p-5 text-left transition-all ${
                          role === 'seller'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setRole('seller')}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-xl p-3 ${
                            role === 'seller' ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white' : 'bg-gray-100'
                          }`}>
                            <Upload className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">I'm an Educator/Seller</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              I want to sell my nursing study materials and help others
                            </p>
                            {role === 'seller' && (
                              <Badge className="mt-3 bg-teal-500">Selected</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-lg">
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </div>
                  </div>
                )}
              </form>

              <Separator className="my-6" />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    state={{ from }}
                    className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-teal-600 hover:text-teal-700 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-teal-600 hover:text-teal-700 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
