import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO, seoConfigs } from '@/components/seo/SEO';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Implement contact form submission
    setTimeout(() => {
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Contact Us</h1>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Mail className="h-8 w-8 text-teal-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <a href="mailto:support@nurseguru.com" className="text-teal-600 hover:underline">
                  support@nurseguru.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Phone className="h-8 w-8 text-teal-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <a href="tel:+18005551234" className="text-teal-600 hover:underline">
                  1-800-555-1234
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <MapPin className="h-8 w-8 text-teal-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">
                  123 Nursing Ave<br />
                  Medical City, MC 12345<br />
                  United States
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-teal-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
                <div className="text-gray-600 space-y-1 text-sm">
                  <p>Mon - Fri: 9 AM - 6 PM EST</p>
                  <p>Sat: 10 AM - 4 PM EST</p>
                  <p>Sun: Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-4">
                      Thank you for contacting us. We'll get back to you soon.
                    </p>
                    <Button 
                      onClick={() => setSubmitSuccess(false)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="mt-2"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
