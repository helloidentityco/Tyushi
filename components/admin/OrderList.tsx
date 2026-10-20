'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Filter, CheckCircle2, Clock, Truck, XCircle, ShoppingBag } from 'lucide-react';
import { formatPKR } from '@/lib/pricing';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  totalAmount: string;
  status: string;
  paymentMethod: string;
  createdAt: any;
}

export default function OrderList({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-[#6FC69B]/20 text-[#6FC69B] border-[#6FC69B]/40';
      case 'SHIPPED':
        return 'bg-[#C6A15B]/20 text-[#E0BF78] border-[#C6A15B]/40';
      case 'PROCESSING':
        return 'bg-[#E2B765]/20 text-[#E2B765] border-[#E2B765]/40';
      case 'CANCELLED':
        return 'bg-[#E58A82]/20 text-[#E58A82] border-[#E58A82]/40';
      default:
        return 'bg-[#251B14] text-[#BDAE9D] border-[#3A2B20]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D6C]" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#8E7D6C]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="all">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-[#18120E] border border-[#3A2B20] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#211811] text-[#8E7D6C] uppercase tracking-wider border-b border-[#3A2B20]">
              <tr>
                <th className="p-4">Order Reference</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact &amp; City</th>
                <th className="p-4">Date Registered</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2B20]/60 text-[#BDAE9D]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#8E7D6C]">
                    No orders match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#211811]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#E0BF78]">
                      {order.orderNumber}
                    </td>
                    <td className="p-4 font-semibold text-[#F7F0E6]">
                      {order.customerName}
                    </td>
                    <td className="p-4">
                      <span className="block text-[#BDAE9D]">{order.city}</span>
                      <span className="block text-[11px] text-[#8E7D6C]">{order.phone}</span>
                    </td>
                    <td className="p-4 text-[#8E7D6C]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] text-[#BDAE9D]">
                        {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#F7F0E6] text-sm">
                      {formatPKR(order.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#251B14] hover:bg-[#302217] text-[#C6A15B] border border-[#3A2B20]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
