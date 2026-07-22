import LegalPage from '@/components/layout/LegalPage';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Premium Products Zone collects, uses and protects your personal information.',
};

const SECTIONS = [
  {
    heading: 'Information We Collect',
    body: [
      'We collect information you provide directly, such as your name, email address, phone number, shipping and billing addresses, and order history when you create an account or place an order.',
      'We also automatically collect certain technical data, including your IP address, browser type, and browsing behavior, to improve our services and personalize your experience.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    body: [
      'Your information is used to process orders, deliver products, provide customer support, send transactional emails (such as order confirmations and shipping updates), and — with your consent — marketing communications.',
      'We may also use aggregated, anonymized data for analytics and to enhance our product offerings.',
    ],
  },
  {
    heading: 'Data Security',
    body: [
      'We implement industry-standard security measures including encryption, secure httpOnly cookies for authentication, and password hashing. Payment details are never stored on our servers.',
      'While we take reasonable steps to protect your data, no method of transmission over the internet is completely secure.',
    ],
  },
  {
    heading: 'Cookies',
    body: [
      'We use cookies to keep you signed in, remember your preferences, and understand how you use our site. You can control cookies through your browser settings, though disabling them may affect functionality.',
    ],
  },
  {
    heading: 'Third-Party Services',
    body: [
      'We work with trusted third parties for payment processing, image hosting (Cloudinary), email delivery, and analytics. These providers only receive the information necessary to perform their services.',
    ],
  },
  {
    heading: 'Your Rights',
    body: [
      'You may access, update or delete your personal information at any time through your account settings, or by contacting our support team. You may also opt out of marketing communications at any time.',
    ],
  },
  {
    heading: 'Contact Us',
    body: [
      'If you have any questions about this Privacy Policy or how we handle your data, please reach out to us at privacy@premiumproductszone.com.',
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="January 2026" sections={SECTIONS} />;
}
