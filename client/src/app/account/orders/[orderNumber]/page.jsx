'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useGetMyOrderQuery, useCancelOrderMutation } from '@/store/api/commerceApi';
import AccountShell from '@/components/account/AccountShell';
import Button from '@/components/ui/Button';
import { StatusBadge } from '../page';
import { formatPrice, formatDate } from '@/lib/utils';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

const FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function OrderTrackingPage({ params }) {
  const { orderNumber } = use(params);
  const { data, isLoading } = useGetMyOrderQuery(orderNumber);
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const order = data?.data;

  if (isLoading) {
    return (
      <AccountShell title="Order">
        <div className="skeleton h-96 rounded-2xl" />
      </AccountShell>
    );
  }
  if (!order) {
    return (
      <AccountShell title="Order">
        <p className="text-slate-500">Order not found.</p>
      </AccountShell>
    );
  }

  const cancellable = ['pending', 'confirmed'].includes(order.status);
  const activeStep = FLOW.indexOf(order.status);
  const isCancelled = ['cancelled', 'returned', 'refunded'].includes(order.status);

  const handleCancel = async () => {
    try {
      await cancelOrder(order._id).unwrap();
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not cancel');
    }
  };

  return (
    <AccountShell title={`Order ${order.orderNumber}`}>
      <Link href="/account/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-accent">
        <FaArrowLeft size={12} /> Back to orders
      </Link>

      {/* Tracking stepper */}
      {!isCancelled && (
        <div className="card-luxe mb-6 p-6">
          <div className="flex items-center justify-between">
            {FLOW.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {i > 0 && <div className={`h-0.5 flex-1 ${i <= activeStep ? 'bg-accent' : 'bg-slate-200'}`} />}
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs ${
                      i <= activeStep ? 'bg-accent text-primary' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {i <= activeStep ? <FaCheck size={11} /> : i + 1}
                  </div>
                  {i < FLOW.length - 1 && (
                    <div className={`h-0.5 flex-1 ${i < activeStep ? 'bg-accent' : 'bg-slate-200'}`} />
                  )}
                </div>
                <span className="mt-2 text-[11px] font-medium capitalize text-slate-500">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="card-luxe p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-primary">Items</h2>
            <StatusBadge status={order.status} />
          </div>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  <Image src={item.image || PLACEHOLDER} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 justify-between">
                  <div>
                    <p className="font-medium text-primary">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity} · {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-semibold text-primary">{formatPrice(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(order.itemsTotal)} />
            {order.discountAmount > 0 && <Row label="Discount" value={`− ${formatPrice(order.discountAmount)}`} />}
            <Row label="Shipping" value={order.shippingFee ? formatPrice(order.shippingFee) : 'Free'} />
            {order.taxAmount > 0 && <Row label="Tax" value={formatPrice(order.taxAmount)} />}
            <div className="flex justify-between border-t border-slate-200 pt-2 font-display text-base font-bold text-primary">
              <dt>Total</dt>
              <dd>{formatPrice(order.grandTotal)}</dd>
            </div>
          </dl>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card-luxe p-6">
            <h3 className="mb-3 font-display text-base font-bold text-primary">Shipping Address</h3>
            <p className="text-sm text-slate-600">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-slate-500">{order.shippingAddress?.phone}</p>
            <p className="mt-1 text-sm text-slate-500">
              {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
            </p>
          </div>

          <div className="card-luxe p-6 text-sm">
            <h3 className="mb-3 font-display text-base font-bold text-primary">Details</h3>
            <Row label="Placed" value={formatDate(order.createdAt)} />
            <Row label="Payment" value={order.paymentMethod?.toUpperCase()} />
            <Row label="Payment Status" value={order.paymentStatus} />
            {order.trackingNumber && <Row label="Tracking" value={order.trackingNumber} />}
          </div>

          {cancellable && (
            <Button variant="outline" onClick={handleCancel} loading={cancelling} className="w-full !border-red-200 !text-red-600 hover:!border-red-400">
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </AccountShell>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <dt className="text-slate-500">{label}</dt>
    <dd className="font-medium capitalize text-primary">{value}</dd>
  </div>
);
