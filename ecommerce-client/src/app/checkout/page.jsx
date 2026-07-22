'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { selectIsAuth, selectInitialized } from '@/store/slices/authSlice';
import {
  useGetCartQuery,
  useGetAddressesQuery,
  useCreateAddressMutation,
  usePlaceOrderMutation,
} from '@/store/api/commerceApi';
import Button from '@/components/ui/Button';
import { Field } from '../login/page';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const isAuth = useSelector(selectIsAuth);
  const initialized = useSelector(selectInitialized);
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuth });
  const { data: addressData } = useGetAddressesQuery(undefined, { skip: !isAuth });
  const [createAddress] = useCreateAddressMutation();
  const [placeOrder, { isLoading: placing }] = usePlaceOrderMutation();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const summary = cartData?.data?.summary || {};
  const addresses = addressData?.data || [];

  useEffect(() => {
    if (initialized && !isAuth) router.replace('/login');
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

  const handlePlaceOrder = async () => {
    const addressId = selectedAddress || addresses.find((a) => a.isDefault)?._id || addresses[0]?._id;
    if (!addressId) {
      toast.error('Please add a shipping address');
      return;
    }
    try {
      const res = await placeOrder({ addressId, paymentMethod: 'cod' }).unwrap();
      toast.success('Order placed successfully!');
      router.push(`/account/orders/${res.data.orderNumber}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not place order');
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
            <label className="flex items-center gap-3 rounded-xl border border-accent bg-accent/5 p-4">
              <input type="radio" checked readOnly className="accent-[#D4AF37]" />
              <div>
                <p className="font-semibold text-primary">Cash on Delivery</p>
                <p className="text-sm text-slate-500">Pay when your order arrives</p>
              </div>
            </label>
            <p className="mt-3 text-xs text-slate-400">
              Stripe, Razorpay &amp; PayPal will be available soon.
            </p>
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
          <Button variant="gold" onClick={handlePlaceOrder} loading={placing} className="w-full">
            Place Order
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
