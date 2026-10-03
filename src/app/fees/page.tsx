import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Info, MessageCircle } from "lucide-react";
import SiteShell from "@/components/SiteShell";
import { PageHero, PageCTA } from "@/components/PageHero";
import { programs } from "@/lib/programs";
import { whatsapp } from "@/lib/site";

const title = "Meditation & Counselling Fees | Inner Revealing";
const description = "Explore session fees for meditation, counselling, Inner Reset, coaching, children’s courses and group sessions. Start with a free demo in Kolkata or online.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/fees" }, openGraph: { title, description, url: "/fees" } };

export default function Fees() {
  return <SiteShell>
    <PageHero eyebrow="FEES & PLANS" title={<>An investment<br />in <em>yourself.</em></>} description="Begin with a free demo, at our centre or online. We’ll understand your needs, discuss your goals and help you choose a course that suits you." note="A free first step. A practice that fits your life." />
    <section className="container fees-intro" data-page-reveal><div><span className="eyebrow">FIND YOUR PRACTICE</span><h2>Every journey has<br /><em>its own rhythm.</em></h2></div><p>From a single conversation to a deeper course, explore the formats and fees below. Call or WhatsApp us to confirm your plan and reserve a suitable slot.</p></section>
    <section className="container fee-table-section" aria-label="Service fees">
      <table className="fee-table"><thead><tr><th scope="col">SERVICE & PROGRAM</th><th scope="col">YOUR PRACTICE</th><th scope="col">FEES</th></tr></thead><tbody>
        <tr className="fee-free"><td><strong>Free Demo Session</strong></td><td>At our Kolkata centre or online</td><td>Free</td></tr>
        {programs.flatMap((program) => program.prices.map((price, index) => <tr key={`${program.slug}-${index}`}><td><Link href={`/services/${program.slug}`}>{program.title}<ArrowUpRight size={14} /></Link></td><td>{price.label}{price.detail && <><br /><span>{price.detail}</span></>}</td><td>{price.price}</td></tr>))}
        <tr><td><Link href="/recorded-meditations">Recorded Meditations<ArrowUpRight size={14} /></Link></td><td>Lifetime access · practice at your own pace</td><td>From ₹49</td></tr>
      </tbody></table>
      <p className="fees-footnote"><Info size={15} />Confirm the current fee, session availability and inclusions with the centre before making payment. For monthly meditation, the centre will help you select the right mix of live and recorded practice.</p>
    </section>
    <section className="container fees-payment" id="payment" data-page-reveal><div><span className="eyebrow">ALREADY CHOSEN YOUR COURSE?</span><h2>Take your next step.</h2><p>Arrange your slot with the centre, then use the existing session payment page. Our team can help with payment details.</p></div><div><a className="button button-primary" href="https://www.innerrevealing.com/payment-for-session/page-49262404" target="_blank" rel="noopener noreferrer">Pay for your session<ArrowUpRight size={17} /></a><a className="button button-outline" href={whatsapp("Hello Inner Revealing, I'd like to confirm my session and payment details.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />Ask about payment</a></div></section>
    <PageCTA />
  </SiteShell>;
}
