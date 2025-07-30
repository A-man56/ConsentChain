import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardContent className="prose max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using ConsentChain, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                ConsentChain is a decentralized data marketplace that allows users to securely share, trade, and
                monetize their data while maintaining full control and consent over their information through blockchain
                technology.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to provide accurate and complete information when creating your account</li>
                <li>You will not use the service for any illegal or unauthorized purpose</li>
                <li>You will not violate any laws in your jurisdiction when using our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Ownership and Rights</h2>
              <p className="text-gray-700 mb-4">
                You retain full ownership of your data. By using ConsentChain, you grant us permission to facilitate the
                secure sharing and trading of your data according to your explicit consent preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Privacy and Security</h2>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy and securing your data. All data transactions are recorded
                on the blockchain to ensure transparency and immutability while maintaining user privacy through
                advanced cryptographic techniques.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                ConsentChain shall not be liable for any indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modifications to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via
                email or through our platform. Continued use of the service after such modifications constitutes
                acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">Email: legal@consentchain.com</p>
                <p className="text-gray-700">Address: [Your Company Address]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
