"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { siteLinks } from "@/lib/site";

const mainLinks = siteLinks.filter((link) =>
  ["/", "/about", "/services", "/gallery", "/testimonials"].includes(link.href),
);
const moreLinks = siteLinks.filter((link) => !mainLinks.includes(link));

export default function SiteHeader({ onBook }: { onBook?: () => void }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const moreMenu = useRef<HTMLDivElement>(null);
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 35);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const outside = (event: PointerEvent) => {
      if (!moreMenu.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        moreMenu.current?.querySelector("button")?.focus();
      }
    };
    window.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", keyboard);
    return () => {
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", keyboard);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("a")?.focus();
    const close = () => {
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    const resize = () => {
      if (window.innerWidth > 1023) close();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;
      const elements = [
        menuButton.current,
        ...Array.from(
          panel.current?.querySelectorAll<HTMLElement>("a,button") ?? [],
        ),
      ].filter(Boolean) as HTMLElement[];
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", keyboard);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", resize);
    };
  }, [menuOpen]);

  const book = () => {
    setMenuOpen(false);
    onBook?.();
  };
  return (
    <div className={pathname === "/" ? "header-home" : "header-interior"}>
      <div
        className="contact-topbar"
        role="region"
        aria-label="Contact information"
      >
        <div className="container">
          <span>
            <MapPin size={12} />
            Kalighat, Kolkata · Online
          </span>
          <div>
            <a href="tel:+919836147999">
              <Phone size={12} />
              +91 98361 47999
            </a>
            <a href="mailto:innerrevealing@gmail.com">
              <Mail size={12} />
              innerrevealing@gmail.com
            </a>
          </div>
        </div>
      </div>
      <header className={`ir-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container ir-nav">
          <Link
            className="brand-logo"
            href="/"
            aria-label="Inner Revealing home"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo.png"
              width={1774}
              height={887}
              sizes="(max-width: 760px) 230px, 294px"
              alt="Inner Revealing Meditation Centre"
              fetchPriority="high"
            />
          </Link>
          <nav className="main-navigation" aria-label="Main navigation">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
              >
                {link.href === "/services" ? "Programs" : link.label}
              </Link>
            ))}
            <div className="more-navigation" ref={moreMenu}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                aria-expanded={moreOpen}
                aria-controls="more-links"
                className={
                  moreLinks.some((link) => active(link.href)) ? "is-active" : ""
                }
              >
                More
                <ChevronDown size={13} />
              </button>
              {moreOpen && (
                <div className="more-links" id="more-links">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active(link.href) ? "page" : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      {link.label}
                      <ArrowUpRight size={14} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
          {onBook ? (
            <button
              className="button button-primary nav-cta"
              data-magnetic
              onClick={book}
            >
              Book Free Demo
              <ArrowUpRight size={16} />
            </button>
          ) : (
            <Link className="button button-primary nav-cta" href="/contact">
              Book Free Demo
              <ArrowUpRight size={16} />
            </Link>
          )}
          <button
            className="menu-toggle"
            ref={menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-navigation" id="mobile-navigation" ref={panel}>
            <nav aria-label="Mobile navigation">
              {siteLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active(link.href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {link.label}
                  <ArrowUpRight size={22} />
                </Link>
              ))}
            </nav>
            {onBook ? (
              <button className="button button-primary" onClick={book}>
                Book a Free Demo
                <ArrowUpRight size={18} />
              </button>
            ) : (
              <Link
                className="button button-primary"
                href="/contact"
                onClick={() => setMenuOpen(false)}
              >
                Book a Free Demo
                <ArrowUpRight size={18} />
              </Link>
            )}
            <a className="mobile-call" href="tel:+919836147999">
              <Phone size={15} />
              +91 98361 47999
            </a>
          </div>
        )}
      </header>
    </div>
  );
}
