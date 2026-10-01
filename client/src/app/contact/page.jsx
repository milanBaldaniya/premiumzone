'use client';

import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import PageHero from '@/components/layout/PageHero';
import Button from '@/components/ui/Button';
import { Field } from '@/components/auth/Field';

const INFO = [
  { icon: FaMapMarkerAlt, label: 'Visit Us', value: '5th Avenue, New York, NY 10001' },
  { icon: FaPhone, label: 'Call Us', value: '+1 (800) 555-SHOP' },
  { icon: FaEnvelope, label: 'Email Us', value: 'concierge@premiumzone.com' },
  { icon: FaClock, label: 'Hours', value: 'Mon–Sat · 9AM–8PM EST' },
];

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async () => {
    // No public contact endpoint yet — simulate a successful submission.
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Message sent — our concierge will be in touch shortly.');
    reset();
  };

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="We'd Love to Hear From You"
        subtitle="Questions about a piece, an order, or bespoke requests — our concierge is here to help."
      />

      <section className="container-luxe grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
        {/* Info */}
        <div className="space-y-4">
          {INFO.map((item) => (
            <div key={item.label} className="card-luxe flex items-center gap-4 p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-dark">
                <item.icon size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="font-medium text-primary">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card-luxe space-y-4 p-8">
          <h2 className="font-display text-2xl font-bold text-primary">Send a Message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <input className="input-luxe" {...register('name', { required: 'Name is required' })} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input type="email" className="input-luxe" {...register('email', { required: 'Email is required' })} />
            </Field>
          </div>
          <Field label="Subject" error={errors.subject?.message}>
            <input className="input-luxe" {...register('subject', { required: 'Subject is required' })} />
          </Field>
          <Field label="Message" error={errors.message?.message}>
            <textarea rows={5} className="input-luxe resize-none" {...register('message', { required: 'Message is required' })} />
          </Field>
          <Button variant="gold" type="submit" loading={isSubmitting}>
            Send Message
          </Button>
        </form>
      </section>
    </>
  );
}
