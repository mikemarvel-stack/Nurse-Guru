import { SEO, seoConfigs } from '@/components/seo/SEO';

export function Terms() {
  return (
    <>
      <SEO data={seoConfigs.home()} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 text-sm mb-8">Last updated: February 22, 2026</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. License</h2>
              <p>
                Nurse Guru grants you a limited, non-exclusive, revocable license to make personal use of this Website. You may not otherwise reproduce, transmit, distribute, or commercially exploit the content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to circumvent security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Content Guidelines</h2>
              <p>
                Sellers agree that all content uploaded to Nurse Guru must be:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Original work or properly licensed</li>
                <li>Free from copyrighted material (unless properly licensed)</li>
                <li>Accurate and not misleading</li>
                <li>Appropriate for educational use</li>
                <li>Not violating any laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p>
                All content on Nurse Guru, including but not limited to logos, designs, and text, are the property of Nurse Guru or our content suppliers. You may not reproduce, distribute, or transmit content without our express written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
              <p>
                Buyers agree to pay the listed price for documents. Sellers agree that Nurse Guru takes a 15% commission on each sale. Payments are processed securely through Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Refund Policy</h2>
              <p>
                Refunds are available within 14 days of purchase if:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The document does not match the description provided</li>
                <li>The document is corrupted or cannot be opened</li>
                <li>The content is significantly different from the preview</li>
              </ul>
              <p className="mt-4">
                Refunds are not available for change of mind or if you've downloaded the full document.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p>
                Nurse Guru is provided "as is" without warranties of any kind. We are not liable for any damages, losses, or claims arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              <p>
                Nurse Guru reserves the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You violate these terms</li>
                <li>You engage in fraudulent activity</li>
                <li>You upload prohibited content</li>
                <li>You violate intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacy</h2>
              <p>
                Your use of Nurse Guru is also governed by our Privacy Policy. Please review it to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p>
                Nurse Guru reserves the right to modify these terms at any time. Your continued use of the service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
              <p>
                For questions about these terms, please contact us at support@nurseguru.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
