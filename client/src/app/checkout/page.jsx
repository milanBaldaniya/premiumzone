'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaMoneyBillWave, FaWhatsapp, FaShieldAlt } from 'react-icons/fa';
import { SiPhonepe, SiGooglepay } from 'react-icons/si';
import { selectIsAuth, selectInitialized, selectUser } from '@/store/slices/authSlice';
import {
  useGetCartQuery,
  useGetAddressesQuery,
  useCreateAddressMutation,
  usePlaceOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from '@/store/api/commerceApi';
import { useGetPublicSettingsQuery } from '@/store/api/catalogApi';
import Button from '@/components/ui/Button';
import { Field } from '@/components/auth/Field';
import { formatPrice } from '@/lib/utils';
import { buildAuthHref } from '@/lib/authRedirect';
import { buildWhatsappLink } from '@/lib/whatsapp';
import { loadRazorpayScript } from '@/lib/razorpay';

export default function CheckoutPage() {
  const router = useRouter();
  const isAuth = useSelector(selectIsAuth);
  const initialized = useSelector(selectInitialized);
  const user = useSelector(selectUser);
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuth });
  const { data: addressData } = useGetAddressesQuery(undefined, { skip: !isAuth });
  const { data: settingsData } = useGetPublicSettingsQuery();
  const [createAddress] = useCreateAddressMutation();
  const [placeOrder, { isLoading: placingCod }] = usePlaceOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [payingOnline, setPayingOnline] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const placing = placingCod || payingOnline;

  const lineItems = cartData?.data?.lineItems || [];
  const summary = cartData?.data?.summary || {};
  const addresses = addressData?.data || [];
  const whatsappNumber = settingsData?.data?.store?.whatsapp;

  // Products flagged "Advance Payment" by the admin skip Razorpay entirely — the whole
  // order is routed through WhatsApp instead, since that's the only path they support.
  const advanceItems = lineItems.filter((i) => i.paymentMethod === 'advance');
  const requiresWhatsapp = advanceItems.length > 0;
  const effectiveMethod = requiresWhatsapp ? 'whatsapp' : paymentMethod;

  useEffect(() => {
    if (initialized && !isAuth) router.replace(buildAuthHref('/login', { redirect: '/checkout' }));
  }, [initialized, isAuth, router]);

  if (!initialized || !isAuth) return null;

  const saveAddress = async (values) => {
    try {
      const res = await createAddress(values).unwrap();
      setSelectedAddress(res.data._id);
      setShowForm(false);
      toast.success('Address saved');
    } catch {
      toast.error('Could not save address');
    }
  };

  const buildOrderMessage = (address) => {
    const lines = lineItems.map(
      (item) => `• ${item.name} x${item.quantity} — ${formatPrice(item.subtotal)}`
    );
    const parts = [
      "Hi! I'd like to place an order:",
      '',
      ...lines,
      '',
      `Subtotal: ${formatPrice(summary.itemsTotal)}`,
    ];
    if (summary.discountAmount > 0) parts.push(`Discount: − ${formatPrice(summary.discountAmount)}`);
    parts.push(`Shipping: ${summary.shippingFee ? formatPrice(summary.shippingFee) : 'Free'}`);
    if (summary.taxAmount > 0) parts.push(`Tax: ${formatPrice(summary.taxAmount)}`);
    parts.push(`Total: ${formatPrice(summary.grandTotal)}`);
    parts.push('');
    parts.push('Shipping to:');
    parts.push(`${address.fullName}, ${address.phone}`);
    parts.push(`${address.line1}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`);
    return parts.join('\n');
  };

  const handlePlaceOrder = async () => {
    const addressId = selectedAddress || addresses.find((a) => a.isDefault)?._id || addresses[0]?._id;
    if (!addressId) {
      toast.error('Please add a shipping address');
      return;
    }

    if (effectiveMethod === 'whatsapp') {
      const address = addresses.find((a) => a._id === addressId);
      const href = buildWhatsappLink(whatsappNumber, buildOrderMessage(address));
      if (!href) {
        toast.error('WhatsApp ordering is not configured yet — please contact support');
        return;
      }
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (effectiveMethod === 'cod') {
      try {
        const res = await placeOrder({ addressId, paymentMethod: 'cod' }).unwrap();
        toast.success('Order placed successfully!');
        router.push(`/account/orders/${res.data.orderNumber}`);
      } catch (err) {
        toast.error(err?.data?.message || 'Could not place order');
      }
      return;
    }

    // Razorpay — pay online (cards, netbanking, wallets, and UPI apps like GPay/PhonePe)
    setPayingOnline(true);
    try {
      const [ready, { data: rpOrder }] = await Promise.all([
        loadRazorpayScript(),
        createRazorpayOrder({ addressId }).unwrap(),
      ]);
      if (!ready) throw new Error('Could not load Razorpay checkout');

      const rzp = new window.Razorpay({
        key: rpOrder.keyId,
        order_id: rpOrder.razorpayOrderId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Premium Zone',
        description: 'Order payment',
        image: '/favicon.ico',
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#D4AF37' },
        // Which methods appear (UPI, cards, netbanking, ...) is controlled by the Razorpay
        // Dashboard's Payment Methods settings for this account, not by a client-side flag.
        handler: async (response) => {
          try {
            const res = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            toast.success('Payment successful — order placed!');
            router.push(`/account/orders/${res.data.orderNumber}`);
          } catch (err) {
            toast.error(err?.data?.message || 'Payment succeeded but order verification failed — contact support');
          } finally {
            setPayingOnline(false);
          }
        },
        modal: {
          ondismiss: () => setPayingOnline(false),
        },
      });
      rzp.on('payment.failed', (resp) => {
        toast.error(resp.error?.description || 'Payment failed');
        setPayingOnline(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Could not start payment');
      setPayingOnline(false);
    }
  };

  return (
    <div className="container-luxe py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-primary">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Address selection */}
          <section className="card-luxe p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-primary">Shipping Address</h2>
              <button onClick={() => setShowForm((s) => !s)} className="text-sm font-medium text-accent-dark hover:underline">
                {showForm ? 'Cancel' : '+ Add New'}
              </button>
            </div>

            {!showForm && addresses.length > 0 && (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                      (selectedAddress || addresses.find((a) => a.isDefault)?._id) === addr._id
                        ? 'border-accent bg-accent/5'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="mt-1 accent-[#D4AF37]"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-primary">{addr.fullName} · {addr.phone}</p>
                      <p className="text-slate-500">
                        {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {(showForm || addresses.length === 0) && (
              <form onSubmit={handleSubmit(saveAddress)} className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" error={errors.fullName?.message}>
                  <input className="input-luxe" {...register('fullName', { required: 'Required' })} />
                </Field>
                <Field label="Phone" error={errors.phone?.message}>
                  <input className="input-luxe" {...register('phone', { required: 'Required' })} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Address Line 1" error={errors.line1?.message}>
                    <input className="input-luxe" {...register('line1', { required: 'Required' })} />
                  </Field>
                </div>
                <Field label="City" error={errors.city?.message}>
                  <input className="input-luxe" {...register('city', { required: 'Required' })} />
                </Field>
                <Field label="State" error={errors.state?.message}>
                  <input className="input-luxe" {...register('state', { required: 'Required' })} />
                </Field>
                <Field label="Postal Code" error={errors.postalCode?.message}>
                  <input className="input-luxe" {...register('postalCode', { required: 'Required' })} />
                </Field>
                <Field label="Country" error={errors.country?.message}>
                  <input className="input-luxe" defaultValue="India" {...register('country', { required: 'Required' })} />
                </Field>
                <div className="sm:col-span-2">
                  <Button variant="primary" type="submit" className="w-full">
                    Save Address
                  </Button>
                </div>
              </form>
            )}
          </section>

          {/* Payment method */}
          <section className="card-luxe p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Payment Method</h2>

            {requiresWhatsapp ? (
              <div className="flex items-start gap-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-4">
                <FaWhatsapp className="mt-0.5 shrink-0 text-[#25D366]" size={20} />
                <div>
                  <p className="font-semibold text-primary">Order via WhatsApp</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {advanceItems.map((i) => i.name).join(', ')} require{advanceItems.length === 1 ? 's' : ''} advance
                    payment — we&apos;ll open WhatsApp with your order details so we can confirm payment directly in chat.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    paymentMethod === 'razorpay' ? 'border-accent bg-accent/5' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1 accent-[#D4AF37]"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-primary">Pay Online</p>
                    <p className="text-sm text-slate-500">UPI, Cards, Netbanking &amp; Wallets — powered by Razorpay</p>
                    <div className="mt-2 flex items-center gap-3 text-slate-400">
                      <SiGooglepay size={26} className="text-slate-600" title="Google Pay" />
                      <SiPhonepe size={20} className="text-[#5F259F]" title="PhonePe" />
                      <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500">
                        UPI
                      </span>
                      <FaShieldAlt size={13} className="ml-auto text-accent-dark" title="Secured by Razorpay" />
                    </div>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#D4AF37]"
                  />
                  <FaMoneyBillWave className="text-slate-400" size={18} />
                  <div>
                    <p className="font-semibold text-primary">Cash on Delivery</p>
                    <p className="text-sm text-slate-500">Pay when your order arrives</p>
                  </div>
                </label>
              </div>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold text-primary">Order Summary</h2>
          <dl className="space-y-3 text-sm">
            <SummaryRow label="Subtotal" value={formatPrice(summary.itemsTotal)} />
            {summary.discountAmount > 0 && (
              <SummaryRow label="Discount" value={`− ${formatPrice(summary.discountAmount)}`} />
            )}
            <SummaryRow label="Shipping" value={summary.shippingFee ? formatPrice(summary.shippingFee) : 'Free'} />
            {summary.taxAmount > 0 && <SummaryRow label="Tax" value={formatPrice(summary.taxAmount)} />}
          </dl>
          <div className="flex justify-between border-t border-slate-200 pt-4">
            <span className="font-display text-lg font-bold text-primary">Total</span>
            <span className="font-display text-lg font-bold text-primary">{formatPrice(summary.grandTotal)}</span>
          </div>
          <Button
            variant={effectiveMethod === 'whatsapp' ? undefined : 'gold'}
            onClick={handlePlaceOrder}
            loading={placing}
            className={effectiveMethod === 'whatsapp' ? 'w-full !bg-[#25D366] !text-white hover:!bg-[#1ebe5b]' : 'w-full'}
          >
            {effectiveMethod === 'whatsapp' ? (
              <>
                <FaWhatsapp size={18} /> Continue on WhatsApp
              </>
            ) : effectiveMethod === 'razorpay' ? (
              `Pay ${formatPrice(summary.grandTotal)}`
            ) : (
              'Place Order'
            )}
          </Button>
        </aside>
      </div>
    </div>
  );
}

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between">
    <dt className="text-slate-500">{label}</dt>
    <dd className="font-medium text-primary">{value}</dd>
  </div>
);
