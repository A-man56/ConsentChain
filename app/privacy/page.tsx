import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Data Protection</h3>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Encryption</h3>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Transparency</h3>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Database className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold">Data Control</h3>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent className="prose max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                ConsentChain is built on the principle of user data sovereignty. We collect only the minimum information
                necessary to provide our services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>Account Information:</strong> Email address, username, and encrypted password
                </li>
                <li>
                  <strong>Blockchain Data:</strong> Wallet addresses and transaction hashes for data trades
                </li>
                <li>
                  <strong>Usage Analytics:</strong> Anonymous usage patterns to improve our service
                </li>
                <li>
                  <strong>User-Contributed Data:</strong> Only data you explicitly choose to share or trade
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">Your information is used exclusively for the following purposes:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Facilitating secure data transactions on the blockchain</li>
                <li>Maintaining your account and providing customer support</li>
                <li>Ensuring compliance with legal and regulatory requirements</li>
                <li>Improving our platform through anonymous analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Sharing and Consent</h2>
              <p className="text-gray-700 mb-4">ConsentChain operates on explicit consent principles:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your data is never shared without your explicit consent</li>
                <li>All data transactions are recorded on the blockchain for transparency</li>
                <li>You can revoke consent and delete your data at any time</li>
                <li>Third parties can only access data you've explicitly agreed to share</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement industry-leading security measures:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>End-to-end encryption for all data transmissions</li>
                <li>Blockchain-based immutable consent records</li>
                <li>Regular security audits and penetration testing</li>
                <li>Zero-knowledge proofs to protect sensitive information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">As a ConsentChain user, you have the following rights:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>Right to Access:</strong> View all data we have about you
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Correct any inaccurate information
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Delete your account and associated data
                </li>
                <li>
                  <strong>Right to Portability:</strong> Export your data in a machine-readable format
                </li>
                <li>
                  <strong>Right to Object:</strong> Opt-out of any data processing activities
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">We use minimal cookies and tracking technologies:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Essential cookies for authentication and security</li>
                <li>Anonymous analytics to improve user experience</li>
                <li>No third-party advertising or tracking cookies</li>
                <li>You can disable non-essential cookies in your browser settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">ConsentChain operates globally with data protection in mind:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Data is processed in secure, compliant data centers</li>
                <li>We adhere to GDPR, CCPA, and other privacy regulations</li>
                <li>Cross-border transfers are protected by appropriate safeguards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this privacy policy from time to time. We will notify you of any material changes via
                email or through our platform. Your continued use of ConsentChain after such modifications constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">Email: privacy@consentchain.com</p>
                <p className="text-gray-700">Data Protection Officer: dpo@consentchain.com</p>
                <p className="text-gray-700">Address: [Your Company Address]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
