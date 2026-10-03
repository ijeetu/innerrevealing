import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFoundContent() {
  return <section className="not-found-section container"><span className="eyebrow">A MOMENT TO REDIRECT</span><h1>Find your way<br /><em>back within.</em></h1><p>This page is no longer here. Explore our programs<br />or return home to begin again.</p><Link href="/services" className="button button-primary">Explore our programs<ArrowUpRight size={17} /></Link></section>;
}
