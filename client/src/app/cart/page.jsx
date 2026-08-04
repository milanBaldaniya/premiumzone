'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import { selectIsAuth, selectInitialized } from '@/store/slices/authSlice';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} from '@/store/api/commerceApi';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { buildAuthHref } from '@/lib/authRedirect';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

export default function CartPage() {
  const isAuth = useSelector(selectIsAuth);
  const initialized = useSelector(selectInitialized);
  const { data, isLoading } = useGetCartQuery(undefined, { skip: !isAuth });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [applyCoupon, { isLoading: applying }] = useApplyCouponMutation();
  const [removeCoupon] = useRemoveCouponMutation();
  const [code, setCode] = useState('');

  // Wait for auth hydration so logged-in users don't flash the sign-in prompt.
  if (!initialized) {
    return <div className="container-luxe py-24 text-center text-slate-400">Loading cart…</div>;
  }
  if (!isAuth) {
    return (
      <EmptyState
        title="Sign in to view your cart"
        cta={{ href: buildAuthHref('/login', { redirect: '/cart' }), label: 'Sign In' }}
      />
    );
  }
  if (isLoading) return <div className="container-luxe py-24 text-center text-slate-400">Loading cart…</div>;

  const lineItems = data?.data?.lineItems || [];
  const summary = data?.data?.summary || {};

  if (!lineItems.length) {
    return <EmptyState title="Your cart is empty" cta={{ href: '/products', label: 'Continue Shopping' }} />;
  }

  const onApplyCoupon = async () => {
    try {
      await applyCoupon({ code }).unwrap();
      toast.success('Coupon applied');
      setCode('');
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid coupon');
    }
  };

  return (
    <div className="container-luxe py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-primary">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-4">
          {lineItems.map((item) => (
            <div key={item.product + String(item.variantId)} className="card-luxe flex gap-4 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                <Image src={item.image || PLACEHOLDER} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-primary">{item.name}</h3>
                  <button
                    onClick={() => removeItem(findItemId(data, item))}
                    className="text-slate-400 hover:text-red-500"
                    aria-label="Remove"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
                <p className="text-sm text-slate-500">{formatPrice(item.price)} each</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-slate-200 text-sm">
                    <button
                      onClick={() => updateItem({ itemId: findItemId(data, item), quantity: item.quantity - 1 })}
                      className="px-3 py-1.5"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateItem({ itemId: findItemId(data, item), quantity: item.quantity + 1 })}
                      className="px-3 py-1.5"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-primary">{formatPrice(item.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold text-primary">Order Summary</h2>

          {summary.coupon ? (
            <div className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2 text-sm">
              <span className="font-medium text-accent-dark">Coupon: {summary.coupon}</span>
              <button onClick={() => removeCoupon()} className="text-xs text-red-500 hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="input-luxe py-2 text-sm"
              />
              <Button variant="outline" onClick={onApplyCoupon} loading={applying} className="px-4 py-2 text-sm">
                Apply
              </Button>
            </div>
          )}

          <dl className="space-y-3 border-t border-slate-100 pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(summary.itemsTotal)} />
            {summary.discountAmount > 0 && (
              <Row label="Discount" value={`− ${formatPrice(summary.discountAmount)}`} accent />
            )}
            <Row
              label="Shipping"
              value={summary.shippingFee ? formatPrice(summary.shippingFee) : 'Free'}
            />
            {summary.taxAmount > 0 && <Row label="Tax" value={formatPrice(summary.taxAmount)} />}
          </dl>

          <div className="flex justify-between border-t border-slate-200 pt-4">
            <span className="font-display text-lg font-bold text-primary">Total</span>
            <span className="font-display text-lg font-bold text-primary">
              {formatPrice(summary.grandTotal)}
            </span>
          </div>

          <Link href="/checkout" className="btn-gold w-full">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}

const Row = ({ label, value, accent }) => (
  <div className="flex justify-between">
    <dt className="text-slate-500">{label}</dt>
    <dd className={accent ? 'font-medium text-accent-dark' : 'font-medium text-primary'}>{value}</dd>
  </div>
);

const EmptyState = ({ title, cta }) => (
  <div className="container-luxe grid place-items-center py-24 text-center">
    <FaShoppingBag className="mb-4 text-5xl text-slate-300" />
    <h1 className="font-display text-2xl font-bold text-primary">{title}</h1>
    <Link href={cta.href} className="btn-gold mt-6">
      {cta.label}
    </Link>
  </div>
);

// The backend returns line items without the cart-item _id; match back to raw cart items.
const findItemId = (data, line) => {
  const raw = data?.data?.cart?.items || [];
  const match = raw.find(
    (i) => i.product?.toString() === line.product?.toString() &&
      String(i.variantId) === String(line.variantId)
  );
  return match?._id;
};
