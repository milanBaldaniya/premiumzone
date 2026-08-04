import LegalPage from '@/components/layout/LegalPage';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'The terms governing your use of Premium Zone and purchases made through our store.',
};

const SECTIONS = [
  {
    heading: 'Acceptance of Terms',
    body: [
      'By accessing or using Premium Zone, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use our services.',
    ],
  },
  {
    heading: 'Accounts',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate and complete information when registering.',
      'We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.',
    ],
  },
  {
    heading: 'Products & Pricing',
    body: [
      'We strive to display accurate product descriptions, images and prices. However, we do not warrant that all content is error-free. In the event of a pricing error, we reserve the right to cancel any affected orders.',
      'All prices are listed in the store currency and are subject to change without notice.',
    ],
  },
  {
    heading: 'Orders & Payment',
    body: [
      'Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. Cash on Delivery is currently available; additional payment methods will be added over time.',
      'Order confirmation does not guarantee product availability. If an item becomes unavailable, we will notify you and issue a refund where applicable.',
    ],
  },
  {
    heading: 'Shipping & Returns',
    body: [
      'Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery. Eligible items may be returned within 30 days in their original condition, subject to our return policy.',
    ],
  },
  {
    heading: 'Intellectual Property',
    body: [
      'All content on this site — including logos, text, images and design — is the property of Premium Zone or its licensors and is protected by intellectual property laws. You may not reproduce it without permission.',
    ],
  },
  {
    heading: 'Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, Premium Zone shall not be liable for any indirect, incidental or consequential damages arising from your use of our services or products.',
    ],
  },
  {
    heading: 'Changes to These Terms',
    body: [
      'We may update these Terms from time to time. Continued use of our services after changes are posted constitutes acceptance of the revised terms.',
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms & Conditions" updated="January 2026" sections={SECTIONS} />;
}
