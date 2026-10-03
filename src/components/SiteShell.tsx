"use client";

import { useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageCircle } from "lucide-react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import DemoBooking from "./DemoBooking";
import { whatsapp } from "@/lib/site";
import "./interior-pages.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function SiteShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const [booking, setBooking] = useState(false);
  const pathname = usePathname();
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(
            ".page-hero-copy > *",
            { y: 26, opacity: 0, duration: 1, stagger: 0.1 },
            0.08,
          )
          .from(
            ".page-hero-visual",
            { y: 28, opacity: 0, scale: 0.97, duration: 1.3 },
            0.18,
          );
        gsap.utils
          .toArray<HTMLElement>("[data-page-reveal]")
          .forEach((element) => {
            gsap.from(element, {
              y: 30,
              opacity: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: { trigger: element, start: "top 94%", once: true },
            });
          });
        gsap.utils
          .toArray<HTMLElement>("[data-page-stagger]")
          .forEach((element) => {
            gsap.from(Array.from(element.children), {
              y: 24,
              opacity: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: { trigger: element, start: "top 94%", once: true },
            });
          });
        gsap.to(".reading-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });
      });
      media.add(
        "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const cleanups: (() => void)[] = [];
          gsap.utils.toArray<HTMLElement>(".button").forEach((element) => {
            const x = gsap.quickTo(element, "x", {
              duration: 0.4,
              ease: "power3.out",
            });
            const y = gsap.quickTo(element, "y", {
              duration: 0.4,
              ease: "power3.out",
            });
            const move = (event: PointerEvent) => {
              if (event.pointerType !== "mouse") return;
              const rect = element.getBoundingClientRect();
              x((event.clientX - rect.left - rect.width / 2) * 0.09);
              y((event.clientY - rect.top - rect.height / 2) * 0.09);
            };
            const leave = () => {
              x(0);
              y(0);
            };
            element.addEventListener("pointermove", move);
            element.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              element.removeEventListener("pointermove", move);
              element.removeEventListener("pointerleave", leave);
            });
          });
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );
      const refresh = () => ScrollTrigger.refresh();
      const observer = new ResizeObserver(refresh);
      if (root.current) observer.observe(root.current);
      let live = true;
      document.fonts.ready.then(() => {
        if (live) refresh();
      });
      return () => {
        live = false;
        observer.disconnect();
        media.revert();
      };
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div className="inner-revealing interior-site" ref={root} id="page-top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="reading-progress" aria-hidden="true" />
      <SiteHeader
        onBook={() => {
          origin.current = document.activeElement as HTMLElement;
          setBooking(true);
        }}
      />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <nav aria-label="Quick contact">
        <a
          href={whatsapp(
            "Hello Inner Revealing, I'd like to know about a free demo session.",
          )}
          className="floating-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Inner Revealing on WhatsApp"
        >
          <MessageCircle size={24} strokeWidth={1.6} />
          <span>Let’s talk</span>
        </a>
      </nav>
      {booking && (
        <DemoBooking
          interest="Free demo session"
          onClose={() => {
            setBooking(false);
            requestAnimationFrame(() => {
              if (origin.current?.isConnected) origin.current.focus();
              else {
                const toggle =
                  root.current?.querySelector<HTMLButtonElement>(
                    ".menu-toggle",
                  );
                if (toggle?.getClientRects().length) toggle.focus();
                else
                  root.current
                    ?.querySelector<HTMLButtonElement>(".nav-cta")
                    ?.focus();
              }
            });
          }}
        />
      )}
    </div>
  );
}
