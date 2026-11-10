"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import AccountPanel from '@/components/profile/AccountPanel';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import { webRequest } from '@/utils/webApi';

interface CartItem { id: number; slug: string; title: string; image: string; price: number }
interface Cart { items: CartItem[]; total: number; currency: string }
interface PaymentConfig { methods: string[]; manual_instructions: string; upi_id: string; bank_account_name: string; bank_account_number: string; bank_ifsc: string; razorpay_key_id?: string }
interface OrderItem { course_id: number; slug: string; title: string; amount: number }
interface Order { id: number; order_number: string; amount: number; currency: string; status: string; payment_method: string; payment_reference?: string; notes?: string; created_at: string; items: OrderItem[] }
interface Checkout { key_id: string; order_id: string; amount: number; currency: string }
interface RazorpayResult { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
interface RazorpayPopup { open(): void; on(event: string, handler: (result: { error?: { description?: string } }) => void): void }
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayPopup;
const money = (amount: number, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(amount));

async function razorpayScript(): Promise<RazorpayConstructor> {
  const current = () => (window as typeof window & { Razorpay?: RazorpayConstructor }).Razorpay;
  if (current()) return current()!;
  await new Promise<void>((resolve, reject) => {
    const previous = document.getElementById('ir-razorpay-script');
    if (previous) previous.remove();
    const script = document.createElement('script'); script.id = 'ir-razorpay-script'; script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true;
    script.onload = () => resolve(); script.onerror = () => reject(new Error('The payment window could not load. Please try again.')); document.body.appendChild(script);
  });
  if (!current()) throw new Error('The payment window is unavailable.');
  return current()!;
}

export function CartPanel() {
  const loggedIn = useSelector(isLoginSelector);
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [method, setMethod] = useState('manual');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = async () => { const [items, payments] = await Promise.all([webRequest<Cart>('/api/commerce/cart'), webRequest<PaymentConfig>('/api/commerce/config')]); setCart(items); setConfig(payments); setMethod(current => payments.methods.includes(current) ? current : payments.methods[0] || 'manual'); };
  useEffect(() => { if (loggedIn) void refresh().catch(error => setError(error.message)); }, [loggedIn]);
  const remove = async (id: number) => {
    setBusy(true); setError('');
    try { setCart(await webRequest<Cart>('/api/commerce/cart', { method: 'DELETE', body: { course_id: id } })); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not update your cart.'); }
    finally { setBusy(false); }
  };
  const checkout = async () => {
    setBusy(true); setError('');
    try {
      const result = await webRequest<{ order: Order; checkout?: Checkout }>('/api/commerce/orders', { method: 'POST', body: { payment_method: cart?.total === 0 ? 'free' : method } });
      if (!result.checkout) { router.push(`/transaction-history?order=${result.order.id}`); return; }
      const Razorpay = await razorpayScript();
      let confirming = false;
      const popup = new Razorpay({
        key: result.checkout.key_id, amount: result.checkout.amount, currency: result.checkout.currency,
        order_id: result.checkout.order_id, name: 'Inner Revealing', description: result.order.order_number,
        handler: async (payment: RazorpayResult) => {
          confirming = true;
          try { await webRequest(`/api/commerce/orders/${result.order.id}/verify`, { method: 'POST', body: payment }); router.push(`/transaction-history?order=${result.order.id}`); }
          catch (error) { setError(error instanceof Error ? error.message : 'Payment could not be confirmed. Check your purchases before paying again.'); }
          finally { setBusy(false); }
        },
        modal: { ondismiss: () => { if (confirming) return; setBusy(false); router.push(`/transaction-history?order=${result.order.id}`); } },
        theme: { color: '#5700b8' },
      });
      popup.on('payment.failed', event => { setError(event.error?.description || 'Payment was not completed. Your order is available in purchases.'); setBusy(false); });
      popup.open();
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not create your order.'); setBusy(false); }
  };
  return <AccountPanel title="Your cart" description="Choose your practices and join when you are ready.">
    {error && <p role="alert" className="text-red-700 mb-5">{error}</p>}
    {!cart ? <p role="status">Loading your cart…</p> : !cart.items.length ? <div className="text-center py-12 space-y-4"><h2 className="text-xl font-semibold">Your cart is empty</h2><Link href="/courses" className="commonBtn inline-flex">Explore practices</Link></div> : <div className="space-y-7">
      <ul className="divide-y">{cart.items.map(item => <li key={item.id} className="py-5 flex items-center gap-4">{item.image && <img src={item.image} alt="" className="w-20 h-20 rounded-xl object-cover" />}<div className="flex-1 space-y-1"><Link className="font-semibold" href={`/course-details/${item.slug}`}>{item.title}</Link><p>{money(item.price, cart.currency)}</p></div><button className="text-sm underline" onClick={() => remove(item.id)} disabled={busy}>Remove</button></li>)}</ul>
      <div className="flex justify-between text-xl font-semibold"><span>Total</span><span>{money(cart.total, cart.currency)}</span></div>
      {cart.total > 0 && <fieldset className="space-y-3"><legend className="font-semibold mb-3">How would you like to pay?</legend>{config?.methods.map(value => <label key={value} className="flex items-center gap-3 border borderColor rounded-xl p-4"><input type="radio" name="payment-method" value={value} checked={method === value} onChange={() => setMethod(value)} /><span>{value === 'razorpay' ? 'Secure online payment' : 'Bank transfer / UPI · confirmed by our team'}</span></label>)}</fieldset>}
      {cart.total > 0 && config?.methods.length === 0 ? <p>Payments are being configured. Please <Link href="/contact-us" className="primaryColor underline">contact our team</Link> to join.</p> : <button className="commonBtn disabled:opacity-50" onClick={checkout} disabled={busy || !config}>{busy ? 'Please wait…' : cart.total === 0 ? 'Join these free courses' : method === 'manual' ? 'Create order & see payment details' : 'Continue to secure payment'}</button>}
      <p className="text-sm text-gray-500">Course access begins after your payment is confirmed. Free courses are available immediately.</p>
    </div>}
  </AccountPanel>;
}

export function OrdersPanel() {
  const loggedIn = useSelector(isLoginSelector);
  const params = useSearchParams();
  const router = useRouter();
  const selected = Number(params.get('order')) || 0;
  const [orders, setOrders] = useState<Order[]>([]);
  const [detail, setDetail] = useState<{ order: Order; config: PaymentConfig } | null>(null);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    const list = await webRequest<{ orders: Order[] }>('/api/commerce/orders'); setOrders(list.orders);
    if (selected) { const data = await webRequest<{ order: Order; config: PaymentConfig }>(`/api/commerce/orders/${selected}`); setDetail(data); setReference(data.order.payment_reference || ''); setNotes(data.order.notes || ''); }
    else setDetail(null);
  };
  useEffect(() => { if (!loggedIn) return; setDetail(null); setLoading(true); setError(''); void refresh().catch(error => setError(error.message)).finally(() => setLoading(false)); }, [loggedIn, selected]);
  const submitReference = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await webRequest(`/api/commerce/orders/${selected}/manual`, { method: 'POST', body: { reference, notes } }); await refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not submit your payment reference.'); }
    finally { setBusy(false); }
  };
  const order = detail?.order;
  return <AccountPanel title="Your purchases" description="Track course orders and see when your access is ready.">
    {error && <p role="alert" className="text-red-700 mb-5">{error}</p>}
    {loading ? <p role="status">Loading your orders…</p> : detail && order ? <div className="space-y-6">
      <button className="primaryColor" onClick={() => router.push('/transaction-history')}>← All orders</button>
      <div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-2xl font-semibold">{order.order_number}</h2><p className="text-sm text-gray-500 mt-2">{new Date(order.created_at).toLocaleDateString('en-IN')} · {order.payment_method}</p></div><div className="text-right"><p className="text-xl font-semibold">{money(order.amount, order.currency)}</p><p className="capitalize primaryColor text-sm mt-2">{order.status.replace(/_/g, ' ')}</p></div></div>
      <ul className="divide-y">{order.items.map(item => <li key={item.course_id} className="py-4 flex justify-between items-center gap-4"><Link href={`/course-details/${item.slug}`} className="font-medium">{item.title}</Link>{order.status === 'paid' ? <Link href={`/learn/${item.slug}`} className="primaryColor whitespace-nowrap">Start learning →</Link> : <span>{money(item.amount, order.currency)}</span>}</li>)}</ul>
      {order.status === 'paid' && <p className="rounded-2xl primaryLightBg p-5 primaryColor">Your access is ready. You can also find these courses in <Link className="underline" href="/my-learnings">My learning</Link>.</p>}
      {order.payment_method === 'manual' && !['paid', 'cancelled', 'refunded'].includes(order.status) && <section className="rounded-2xl border borderColor p-5 md:p-7 space-y-5">
        <h3 className="text-xl font-semibold">Payment instructions</h3><p className="whitespace-pre-wrap leading-7">{detail.config.manual_instructions || 'Contact Inner Revealing for payment instructions before sending a payment.'}</p>
        <dl className="space-y-2 text-sm">{[['UPI ID', detail.config.upi_id], ['Account name', detail.config.bank_account_name], ['Account number', detail.config.bank_account_number], ['IFSC', detail.config.bank_ifsc]].filter(([,value]) => value).map(([label,value]) => <div key={label} className="flex gap-4"><dt className="text-gray-500 min-w-28">{label}</dt><dd className="font-medium break-all">{value}</dd></div>)}</dl>
        {order.status === 'awaiting_review' && <p role="status" className="primaryColor">Your payment reference has been received. Our team will confirm it before granting course access.</p>}
        <form onSubmit={submitReference} className="space-y-4"><label className="block space-y-2"><span className="text-sm font-medium">Transaction / UPI reference</span><input className="w-full border borderColor rounded-xl p-3" value={reference} onChange={event => setReference(event.target.value)} required minLength={3} maxLength={120} /></label><label className="block space-y-2"><span className="text-sm font-medium">Note for our team (optional)</span><textarea className="w-full border borderColor rounded-xl p-3" value={notes} onChange={event => setNotes(event.target.value)} maxLength={1000} /></label><button className="commonBtn disabled:opacity-50" disabled={busy}>{busy ? 'Submitting…' : 'Submit payment reference'}</button></form>
      </section>}
      {order.payment_method === 'razorpay' && order.status !== 'paid' && <p className="text-sm text-gray-500">This payment has not been confirmed. If you were charged, contact our team with this order number before paying again.</p>}
    </div> : orders.length ? <ul className="divide-y">{orders.map(item => <li key={item.id} className="py-5 flex justify-between items-center gap-4"><div><button onClick={() => router.push(`/transaction-history?order=${item.id}`)} className="font-semibold primaryColor">{item.order_number}</button><p className="text-sm text-gray-500 capitalize mt-1">{item.status.replace(/_/g, ' ')} · {new Date(item.created_at).toLocaleDateString('en-IN')}</p></div><span className="font-semibold">{money(item.amount, item.currency)}</span></li>)}</ul> : <div className="text-center py-12 space-y-4"><h2 className="text-xl font-semibold">No orders yet</h2><Link href="/courses" className="commonBtn inline-flex">Explore practices</Link></div>}
  </AccountPanel>;
}
