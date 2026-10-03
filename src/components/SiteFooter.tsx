import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, Clock3, Mail, MapPin, Phone, Play } from "lucide-react";
import { mapUrl, programLinks, siteLinks } from "@/lib/site";
import "./lower-sections.css";

export default function SiteFooter() {
  return <footer className="lower-footer">
    <div className="lower-footer-grid container">
      <div className="lower-footer-about">
        <Link className="brand-logo footer-brand" href="/" aria-label="Inner Revealing home"><Image src="/logo.png" alt="Inner Revealing Meditation Centre" width={1774} height={887} sizes="250px" /></Link>
        <p>Meditation Centre, Psychological Counselling and Healing Centre in Kolkata.</p>
        <span>You don’t need to be fixed —<br />you need to be revealed.</span>
        <div className="lower-social-links">
          <a href="https://www.facebook.com/infinitelovemed" target="_blank" rel="noopener noreferrer" aria-label="Inner Revealing on Facebook"><span className="lower-social-initial" aria-hidden="true">f</span></a>
          <a href="https://www.instagram.com/infinitelovemeditation" target="_blank" rel="noopener noreferrer" aria-label="Inner Revealing on Instagram"><Camera size={18} strokeWidth={1.5} /></a>
          <a href="https://www.youtube.com/@innerrevealing" target="_blank" rel="noopener noreferrer" aria-label="Inner Revealing on YouTube"><Play size={17} strokeWidth={1.5} /></a>
        </div>
        <a className="lower-footer-reviews" href="https://www.justdial.com/dt-37BV81ETQ81" target="_blank" rel="noopener noreferrer">Read reviews on Justdial<ArrowUpRight size={13} /></a>
      </div>
      <div className="lower-footer-column"><h2>Quick links</h2><nav aria-label="Footer navigation">{siteLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
      <div className="lower-footer-column"><h2>Programs</h2><nav aria-label="Our programs">{programLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
      <div className="lower-footer-column lower-footer-contact"><h2>Contact</h2>
        <a href="tel:+919836147999"><Phone size={17} strokeWidth={1.5} /><span>+91 9836147999</span></a>
        <a href="mailto:innerrevealing@gmail.com"><Mail size={17} strokeWidth={1.5} /><span>innerrevealing@gmail.com</span></a>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={18} strokeWidth={1.5} /><span>Satish Mukherjee Road,<br />Kalighat, Kolkata 700026</span></a>
        <div><Clock3 size={17} strokeWidth={1.5} /><span>Mon – Sun<br />07:30 AM – 08:00 PM</span></div>
      </div>
    </div>
    <div className="lower-footer-bottom container"><p>© 2020 – 2026 Inner Revealing Meditation Centre. All Rights Reserved.</p><a href="#page-top">Back to top<ArrowUpRight size={17} /></a></div>
  </footer>;
}
