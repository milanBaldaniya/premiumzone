'use client';

import Link from 'next/link';
import { FaBoxOpen, FaChevronRight } from 'react-icons/fa';
import { useGetMyOrdersQuery } from '@/store/api/commerceApi';
import AccountShell from '@/components/account/AccountShell';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-cyan-100 text-cyan-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-orange-100 text-orange-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const { data, isLoading } = useGetMyOrdersQuery();
  const orders = data?.data || [];

  return (
    <AccountShell title="My Orders">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <FaBoxOpen className="mb-4 text-5xl text-slate-300" />
          <p className="text-lg font-medium text-primary">No orders yet</p>
          <Link href="/products" className="btn-gold mt-6">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order.orderNumber}`}
              className="card-luxe flex items-center justify-between p-5 hover:shadow-luxe"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''} · {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-lg font-bold text-primary">
                  {formatPrice(order.grandTotal)}
                </span>
                <FaChevronRight className="text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
