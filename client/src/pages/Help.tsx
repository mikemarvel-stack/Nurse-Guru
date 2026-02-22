import { Search, Mail, MessageSquare, Phone } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SEO, seoConfigs } from '@/components/seo/SEO';

const faqItems = [
  {
    category: 'Buying Documents',
    items: [
      {
        question: 'How do I purchase a document?',
        answer: 'Browse our catalog, add documents to your cart, and proceed to checkout. Payment is processed securely through Stripe.'
      },
      {
        question: 'Can I download documents multiple times?',
        answer: 'Yes! Once purchased, you can download your documents unlimited times for 1 year from the purchase date.'
      },
      {
        question: 'What file formats are supported?',
        answer: 'We support PDF, DOCX, PPT, XLS, and image files. Most documents are in PDF format for universal compatibility.'
      },
      {
        question: 'Is there a refund policy?',
        answer: 'Refunds are available within 14 days of purchase if the document does not meet the description. Contact support for details.'
      }
    ]
  },
  {
    category: 'Selling Documents',
    items: [
      {
        question: 'How do I become a seller?',
        answer: 'Update your profile to a seller account from your profile page. You then can begin uploading and selling documents.'
      },
      {
        question: 'What documents can I sell?',
        answer: 'You can sell nursing study materials, research papers, case studies, presentations, and other educational content. All content must be original or properly licensed.'
      },
      {
        question: 'How much commission does Nurse Guru take?',
        answer: 'We take a 15% commission on each sale. The remaining 85% goes directly to you.'
      },
      {
        question: 'When do I get paid?',
        answer: 'Payments are processed weekly to your registered bank account. Minimum payout is $50.'
      }
    ]
  },
  {
    category: 'Account & Security',
    items: [
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and follow the email instructions to reset your password.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes! We use Stripe for payment processing, which is PCI-DSS compliant. Your card information is never stored on our servers.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can request account deletion from your profile settings. This will remove all your personal data.'
      }
    ]
  },
  {
    category: 'Technical Issues',
    items: [
      {
        question: 'I cannot download a document. What should I do?',
        answer: 'Clear your browser cache, try a different browser, or contact our support team at support@nurseguru.com'
      },
      {
        question: 'The website is slow. How can I fix this?',
        answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. If issues persist, contact support.'
      }
    ]
  }
];

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = faqItems.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & FAQ</h1>
          <p className="text-gray-600 text-lg mb-8">
            Find answers to common questions about using Nurse Guru
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-16">
          {filteredItems.length > 0 ? (
            filteredItems.map((category, idx) => (
              <div key={idx} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIdx) => (
                    <AccordionItem key={itemIdx} value={`${idx}-${itemIdx}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-8">Contact our support team</p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-teal-600" />
                <p className="font-semibold text-gray-900 mb-2">Email</p>
                <a href="mailto:support@nurseguru.com" className="text-teal-600 hover:underline">
                  support@nurseguru.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-teal-600" />
                <p className="font-semibold text-gray-900 mb-2">Chat</p>
                <p className="text-gray-600">Available 9 AM - 6 PM EST</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-teal-600" />
                <p className="font-semibold text-gray-900 mb-2">Phone</p>
                <a href="tel:+18005551234" className="text-teal-600 hover:underline">
                  1-800-555-1234
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
