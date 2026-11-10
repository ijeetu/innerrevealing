import { Suspense } from 'react';
import { OrdersPanel } from '@/components/learning/CommercePanel';
export default function PurchasesPage() { return <Suspense fallback={<p className="container py-16">Loading your purchases…</p>}><OrdersPanel /></Suspense>; }
