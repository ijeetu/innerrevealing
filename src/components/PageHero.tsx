import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import "./interior-pages.css";

export function PageHero({ eyebrow, title, description, image, imageAlt = "", note }: {
  eyebrow: string; title: ReactNode; description: ReactNode; image?: string; imageAlt?: string; note?: string;
}) {
  const art = image?.endsWith(".svg");
  return <section className={`page-hero ${image ? "has-image" : ""}`}>
    <div className="container page-hero-grid">
      <div className="page-hero-copy">
        <span className="eyebrow"><span className="eyebrow-line" />{eyebrow}</span>
        <h1>{title}</h1>
        <div className="page-hero-description">{description}</div>
        {note && <p className="page-hero-note"><span />{note}</p>}
      </div>
      {image && <div className={`page-hero-visual ${art ? "is-art" : ""}`}>
        <div className="page-hero-image"><Image src={image} alt={imageAlt} fill sizes="(max-width: 760px) 90vw, 42vw" priority /></div>
        <span className="page-hero-image-note"><Sparkles size={16} strokeWidth={1.4} />A little space. A deeper connection.</span>
      </div>}
    </div>
    <div className="page-hero-rule container"><span>INNER REVEALING MEDITATION CENTRE</span><span>KOLKATA · ONLINE</span></div>
  </section>;
}

export default PageHero;

export function PageCTA({ title, description }: { title?: ReactNode; description?: ReactNode } = {}) {
  return <section className="page-cta"><div className="container page-cta-grid" data-page-reveal>
    <div><span className="eyebrow">YOUR FIRST STEP WITHIN</span><h2>{title ?? <>Begin your journey.<br /><em>Come as you are.</em></>}</h2><p>{description ?? "Experience the peace, joy and stillness within. Join a free demo at our Kolkata centre or online, wherever you feel most comfortable."}</p></div>
    <div className="page-cta-actions"><Link className="button button-primary" href="/contact">Book a Free Demo<ArrowUpRight size={18} /></Link><a href="tel:+919836147999">Or call +91 98361 47999</a></div>
  </div></section>;
}
