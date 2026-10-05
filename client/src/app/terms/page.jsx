import LegalPage from '@/components/layout/LegalPage';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'The terms governing your use of Premium Product Zone and purchases made through our store.',
};

const SECTIONS = [
  {
    heading: 'Use of the Site',
    body: [
      'By accessing and using this website, you agree to be bound by the following terms and conditions. If you do not agree with any part of these terms, please do not use our website.',
      'You must be at least 18 years old to use this site. The content provided is for general information only and may be subject to change without notice.',
    ],
  },
  {
    heading: 'Intellectual Property',
    body: [
      'All content, including images, logos, and text, are the property of Premium Product Zone unless otherwise stated. Unauthorized use may lead to legal action.',
    ],
  },
  {
    heading: 'User Accounts',
    body: [
      'If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.',
    ],
  },
  {
    heading: 'Orders & Payments',
    body: [
      'All purchases made through the site are subject to availability and confirmation of the order. We reserve the right to refuse or cancel any order at our discretion.',
    ],
  },
  {
    heading: 'Limitation of Liability',
    body: [
      'We shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our website or services.',
    ],
  },
  {
    heading: 'Modifications',
    body: [
      'We reserve the right to update or change these terms at any time without prior notice. Continued use of the site constitutes acceptance of those changes.',
    ],
  },
  {
    heading: 'Contact Us',
    body: [
      'If you have any questions about these Terms and Conditions, feel free to contact our support team at premiumproductszone353@gmail.com or call +91 82388 00920.',
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms & Conditions" updated="January 2026" sections={SECTIONS} />;
}
