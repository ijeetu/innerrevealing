import { Suspense } from 'react';
import { OrdersPanel } from '@/components/learning/CommercePanel';
export default function PaymentStatusPage() { return <Suspense fallback={<p className="container py-16">Loading verified order information…</p>}><OrdersPanel /></Suspense>; }
