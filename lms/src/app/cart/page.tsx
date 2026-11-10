import Link from "next/link";
import Layout from "@/components/layout/Layout";

export default function CartPage() {
  return (
    <Layout>
      <main className="container py-20 min-h-[60vh] flex items-center justify-center">
        <section className="max-w-xl rounded-3xl border borderColor bg-white p-8 md:p-12 text-center space-y-5">
          <h1 className="text-3xl font-semibold">Online checkout is not available yet</h1>
          <p className="sectionPara">Please contact Inner Revealing to learn about current sessions and how to join.</p>
          <Link href="/contact-us" className="commonBtn inline-flex">Contact Inner Revealing</Link>
        </section>
      </main>
    </Layout>
  );
}
