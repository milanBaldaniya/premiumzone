import LegalPage from '@/components/layout/LegalPage';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Premium Product Zone collects, uses and protects your personal information.',
};

const SECTIONS = [
  {
    heading: 'Information We Collect',
    body: [
      'We collect personal details such as your name, email address, contact number, and other information which you provide when using our services or registering on our platform.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    body: [
      'We use your information to improve our services, respond to inquiries, send transactional emails, and inform you about updates and offers.',
    ],
  },
  {
    heading: 'Data Security',
    body: [
      'We implement appropriate security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.',
    ],
  },
  {
    heading: 'Cookies and Tracking',
    body: [
      'We may use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings.',
    ],
  },
  {
    heading: 'Third-Party Services',
    body: [
      'We may work with third-party vendors who assist in delivering our services. They are required to protect your data and use it only for authorized purposes.',
    ],
  },
  {
    heading: 'Your Rights',
    body: [
      'You have the right to access, correct, or delete your personal information. You can also opt out of promotional communications at any time.',
    ],
  },
  {
    heading: 'Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. The updated version will be posted on this page with the revised date.',
    ],
  },
  {
    heading: 'Contact Us',
    body: [
      'If you have any questions or concerns about our Privacy Policy, feel free to contact us at premiumproductszone353@gmail.com or call +91 82388 00920.',
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="January 2026" sections={SECTIONS} />;
}
