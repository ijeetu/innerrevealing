"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Clock3, Heart, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "./PageHero";
import { mapUrl, whatsapp } from "@/lib/site";

const interests = [
  ["free-demo", "Free demo session"],
  ["counselling-and-meditation", "Counselling & Meditation"],
  ["inner-reset-program", "Inner Reset Program"],
  ["monthly-meditation", "Monthly Meditation"],
  ["life-coaching", "Life Coaching"],
  ["relationship-counselling", "Relationship Counselling"],
  ["shadow-work", "Shadow Work"],
  ["kids-meditation", "Kids Meditation"],
  ["group-meditation", "Group Meditation"],
  ["meditation-coach-program", "Meditation Coach Program"],
  ["recorded-meditations", "Recorded Meditations"],
  ["other", "Something else"],
];

export default function ContactPage({ initialInterest = "free-demo" }: { initialInterest?: string }) {
  const [interest, setInterest] = useState(interests.some(([slug]) => slug === initialInterest) ? initialInterest : "free-demo");
  const [message, setMessage] = useState<string | null>(null);
  const ready = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (message) ready.current?.focus(); }, [message]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const body = String(data.get("message") ?? "").trim();
    if (!name || !phone || !email || !body) return;
    setMessage(`Hello Inner Revealing,\n\nMy name is ${name}. I'd like to enquire about ${interests.find(([slug]) => slug === interest)?.[1] ?? "a session"}.\nPreferred format: ${data.get("mode")}\nPhone: ${phone}\nEmail: ${email}\n\n${body}`);
  };
  return <>
    <PageHero eyebrow="CONTACT & FREE DEMO" title={<>A conversation.<br /><em>A new beginning.</em></>} description="Take a free demo and experience the peace, joy and stillness within. Join us at our Kolkata centre or online, whatever suits you." note="Mon – Sun · 7:30 AM – 8:00 PM IST" />
    <section className="contact-main container" id="enquiry">
      <div className="contact-main-grid">
        <div className="contact-details" data-page-reveal>
          <span className="eyebrow">WE’RE HERE FOR YOU</span><h2>Let’s find your<br /><em>way within.</em></h2>
          <div className="contact-details-list">
            <div><MapPin size={21} strokeWidth={1.4} /><div><h3>Visit our centre</h3><p>Satish Mukherjee Road, Kalighat,<br />Kolkata, West Bengal 700026</p><a className="text-link" href={mapUrl} target="_blank" rel="noopener noreferrer">Get directions<ArrowUpRight size={14} /></a></div></div>
            <div><Phone size={20} strokeWidth={1.4} /><div><h3>Call / WhatsApp</h3><a href="tel:+919836147999">+91 9836147999</a></div></div>
            <div><Mail size={20} strokeWidth={1.4} /><div><h3>Email us</h3><a href="mailto:innerrevealing@gmail.com">innerrevealing@gmail.com</a></div></div>
            <div><Clock3 size={20} strokeWidth={1.4} /><div><h3>Our timing</h3><p>Monday – Sunday<br />07:30 AM – 08:00 PM IST</p></div></div>
          </div>
          <div className="contact-demo-buttons"><a className="button button-primary" href={whatsapp("Hello Inner Revealing, I'd like to book a free demo session.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />Book on WhatsApp<ArrowUpRight size={16} /></a><a className="button button-outline" href="tel:+919836147999">Call us<Phone size={15} /></a></div>
        </div>
        <div className="contact-form-panel" data-page-reveal>
          <div className="contact-form-heading"><span className="eyebrow">GET IN TOUCH</span><h2>Tell us what<br /><em>brings you here.</em></h2><p>Need more information or have a question? Share a little about yourself and the practice you’re interested in.</p></div>
          <form ref={form} className="enquiry-form" onSubmit={submit} hidden={Boolean(message)}>
            <label>Your name<input name="name" autoComplete="name" required maxLength={80} pattern={".*\\S.*"} placeholder="Full name" /></label>
            <label>Phone number<input name="phone" type="tel" autoComplete="tel" required pattern="[+0-9() -]{7,20}" maxLength={20} placeholder="Your contact number" /></label>
            <label className="form-full">Email address<input name="email" type="email" autoComplete="email" required maxLength={160} placeholder="you@example.com" /></label>
            <label className="form-full">I’m interested in<select name="interest" value={interest} onChange={(event) => setInterest(event.target.value)}>{interests.map(([slug, title]) => <option key={slug} value={slug}>{title}</option>)}</select></label>
            <fieldset className="form-full"><legend>How would you like to join?</legend><div className="enquiry-modes"><label><input type="radio" name="mode" value="At the Kolkata centre" defaultChecked />At the centre</label><label><input type="radio" name="mode" value="Online" />Online</label></div></fieldset>
            <label className="form-full">Your message<textarea name="message" rows={4} required maxLength={1500} onChange={(event) => event.currentTarget.setCustomValidity(event.currentTarget.value.trim() ? "" : "Please enter a message.")} placeholder="How can we help you?" /></label>
            <button className="button button-primary form-full" type="submit">Prepare my enquiry<ArrowUpRight size={17} /></button>
            <p className="form-disclosure form-full">You’ll review your message before sending it on WhatsApp or email.</p>
          </form>
          {message && <div className="enquiry-ready" ref={ready} tabIndex={-1} role="status"><Check size={28} /><h3>Your enquiry is ready.</h3><p>Send your message directly to our team to arrange a session. Your booking will be confirmed by the centre.</p><div className="enquiry-ready-actions"><a className="button button-primary" href={whatsapp(message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />Send on WhatsApp<ArrowUpRight size={16} /></a><a className="button button-outline" href={`mailto:innerrevealing@gmail.com?subject=${encodeURIComponent("Session enquiry — Inner Revealing")}&body=${encodeURIComponent(message)}`}><Mail size={16} />Email enquiry</a></div><button className="text-link" onClick={() => { setMessage(null); requestAnimationFrame(() => form.current?.querySelector("input")?.focus()); }}>Edit my enquiry<ArrowUpRight size={14} /></button><p className="enquiry-preview">{message}</p></div>}
        </div>
      </div>
      <div className="contact-map" data-page-reveal><iframe title="Map of Satish Mukherjee Road, Kalighat, Kolkata" src="https://maps.google.com/maps?q=Satish%20Mukherjee%20Road%2C%20Kalighat%2C%20Kolkata%20700026&t=&z=15&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="contact-map-caption"><p>Satish Mukherjee Road, Kalighat, Kolkata 700026.<br />Call ahead to arrange your visit and confirm the exact location.</p><a className="text-link" href={mapUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps<ArrowUpRight size={15} /></a></div></div>
    </section>
    <section className="donation-section" id="donate"><div className="container donation-grid" data-page-reveal><div className="donation-copy"><span className="eyebrow">SUPPORT OUR WORK</span><h2>Help the practice<br /><em>reach a little further.</em></h2><p>Our work takes time, effort and research. If it resonates with you and has helped in your daily life, you can support Inner Revealing with a donation.</p></div><a className="button button-outline" href="https://www.innerrevealing.com/donate/page-36492031" target="_blank" rel="noopener noreferrer"><Heart size={17} />Donate<ArrowUpRight size={17} /></a></div></section>
  </>;
}
