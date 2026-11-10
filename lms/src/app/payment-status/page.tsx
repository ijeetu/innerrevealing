import Link from "next/link";
import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "Payment information · Inner Revealing",
  robots: { index: false, follow: false },
};

export default function PaymentStatusPage() {
  return (
    <Layout>
      <main className="container py-20 min-h-[60vh] flex items-center justify-center">
        <section className="max-w-xl rounded-3xl border borderColor bg-white p-8 md:p-12 text-center space-y-5">
          <h1 className="text-3xl font-semibold">Payment status unavailable</h1>
          <p className="sectionPara">Online payments are not available on this learning website yet. If you have already made a payment, please contact Inner Revealing with your receipt so our team can confirm its status.</p>
          <Link href="/contact-us" className="commonBtn inline-flex">Contact Inner Revealing</Link>
        </section>
      </main>
    </Layout>
  );
}
