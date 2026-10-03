"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import "./interior-pages.css";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  ArrowDown,
  MapPin,
  Heart,
  Moon,
  Sparkles,
  Sun,
  Wind,
  MessageCircle,
} from "lucide-react";
import LowerSections from "./LowerSections";
import DemoBooking from "./DemoBooking";

gsap.registerPlugin(ScrollTrigger, useGSAP);
const yoga = (name: string) => `/images/Yoga Continuous Line/SVG/${name}.svg`;
const poses = {
  lotus: yoga("Lotus, Padmasana, Yoga, Yoga Pose, Woman, Continuous Line"),
  tree: yoga(
    "Tree Pose, Balance, Yoga, Wellness, Yoga Pose, Woman, Continuous Line",
  ),
  child: yoga(
    "Child Pose, Balasana, Yoga, Yoga Pose, Meditation, Wellness, Continuous Line",
  ),
  dancer: yoga("Dancer, Yoga, Yoga Pose, Wellness, Stretch, Balance, Fitness"),
  seated: yoga(
    "Gomukhasana, Yoga, Meditation, Woman, Yoga pose, Continuous Line, Asana",
  ),
  warrior: yoga(
    "Warrior Pose, Reverse Warrior, Yoga, Continuous Line, Woman, Yoga Pose, Wellness",
  ),
  triangle: yoga(
    "Triangle Pose, Yoga, Yoga Pose, Woman, Stretch, Exercise, Trikonasana",
  ),
  bow: yoga(
    "Bow Pose, Yoga, Backbend, Stretch, Exercise, Fitness, Continuous Line",
  ),
  bridge: yoga(
    "Bridge Pose, Yoga, Yoga Pose, Exercise, Workout, Fitness, Woman",
  ),
};
const programs = [
  {
    href: "/services/counselling-and-meditation",
    title: "Counselling & Meditation",
    category: "A SPACE TO BE HEARD",
    duration: "Single session",
    image: poses.seated,
    description:
      "For a specific purpose — health, relationship counselling, child counselling, parent-child counselling or any other issue.",
    details:
      "A one-to-one session to understand your needs and explore counselling, meditation and healing practices. Begin with a free demo to discuss what you are looking for.",
  },
  {
    href: "/services/inner-reset-program",
    title: "Signature Inner Reset",
    category: "OUR SIGNATURE JOURNEY",
    duration: "12 weeks",
    image: poses.lotus,
    description: "A 12 Week Journey from Conditioning to Conscious Creation.",
    details:
      "A meditation-based journey from conditioning to conscious creation. Explore your inner patterns and create space for a more conscious, fulfilled life.",
  },
  {
    href: "/services/monthly-meditation",
    title: "Live & Recorded Meditations",
    category: "YOUR PRACTICE, YOUR PACE",
    duration: "Monthly",
    image: poses.tree,
    description:
      "A mix of live sessions that include Breathwork, Affirmations, Healing and Meditations.",
    details:
      "Live guidance meets the flexibility of recorded meditations. Make space for breathwork, affirmations, healing and meditation in your daily routine.",
  },
  {
    href: "/services/life-coaching",
    title: "Life Coaching & Meditations",
    category: "MOVE TOWARDS YOUR GOALS",
    duration: "Monthly",
    image: poses.warrior,
    description: "Complete guidance and support to achieve your desired goal.",
    details:
      "A monthly course with guidance, support, various steps and methods, and meditations to help you work towards your desired goal.",
  },
  {
    href: "/services/relationship-counselling",
    title: "Relationship Counselling",
    category: "CONNECTION & UNDERSTANDING",
    duration: "Monthly",
    image: poses.dancer,
    description:
      "Marriage and break-up counselling, with healing and meditations.",
    details:
      "A monthly course specially for marriage and break-up counselling. Includes healing practices and meditations. Discuss your needs privately in a free demo session.",
  },
  {
    href: "/services/shadow-work",
    title: "Shadow Work",
    category: "MEET YOUR WHOLE SELF",
    duration: "6 weeks · 12 sessions",
    image: poses.child,
    description: "Live with more authenticity, balance, and freedom.",
    details:
      "A six week course with twelve sessions. Explore shadow work to live with more authenticity, balance, and freedom.",
  },
  {
    href: "/services/kids-meditation",
    title: "Kids Meditation",
    category: "LITTLE MINDS, BIG POSSIBILITIES",
    duration: "Ages 7–14",
    image: poses.triangle,
    description: "Meditate with fun! A self awareness course for children.",
    details:
      "A self awareness course for children aged seven to fourteen. Meditation with fun activities, games and learning. Contact the centre to discuss a suitable session for your child.",
  },
  {
    href: "/recorded-meditations",
    title: "Recorded Meditations",
    category: "STILLNESS, ANYTIME",
    duration: "Lifetime access",
    image: poses.bow,
    description:
      "Meditations for various purposes to practice at your convenience.",
    details:
      "A set of meditations for various purposes, all with lifetime access. Find a meditation that fits your needs and practice at your convenience.",
  },
  {
    href: "/services/meditation-coach-program",
    title: "Meditation Coach Program",
    category: "SHARE THE GIFT OF MEDITATION",
    duration: "Certification",
    image: poses.bridge,
    description:
      "Become a meditation coach or add meditation to your existing practice.",
    details:
      "Become a meditation coach and start your own centre, or add meditation to your yoga studio, therapy or counselling sessions. Contact us to learn about the program.",
  },
];
const benefits = [
  {
    icon: Wind,
    title: "A calmer mind",
    text: "Create space to pause, breathe, and ease everyday stress.",
  },
  {
    icon: Moon,
    title: "More restful moments",
    text: "Let go of the day and cultivate a gentle evening practice.",
  },
  {
    icon: Heart,
    title: "Emotional balance",
    text: "Meet your feelings with awareness, compassion, and acceptance.",
  },
  {
    icon: Sun,
    title: "A deeper connection",
    text: "Reconnect with your own inner vitality, clarity, and love.",
  },
];

export default function InnerRevealingHomepage() {
  const root = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<string | null>(null);
  const bookingOrigin = useRef<HTMLElement | null>(null);
  const openBooking = (program = "Free demo session") => {
    bookingOrigin.current = document.activeElement as HTMLElement | null;
    setBooking(program);
  };
  const closeBooking = () => {
    const origin = bookingOrigin.current;
    setBooking(null);
    requestAnimationFrame(() => {
      if (origin?.isConnected && origin !== document.body) origin.focus();
      else {
        const menuToggle =
          root.current?.querySelector<HTMLButtonElement>(".menu-toggle");
        if (menuToggle?.getClientRects().length) menuToggle.focus();
        else
          root.current?.querySelector<HTMLButtonElement>(".nav-cta")?.focus();
      }
    });
  };

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 900px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(
              ".headline-inner",
              { yPercent: 105, rotation: 2, duration: 1.25, stagger: 0.12 },
              0.2,
            )
            .from(
              ".hero-lead,.hero-actions",
              { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 },
              0.55,
            )
            .from(
              ".hero-photo-mask",
              {
                clipPath: "inset(15% 8% 10% 8% round 250px 250px 180px 180px)",
                opacity: 0,
                duration: 1.5,
              },
              0.15,
            )
            .from(".hero-photo", { scale: 1.13, duration: 1.7 }, 0.15)
            .from(
              ".hero-floating-note",
              { y: 35, rotation: -4, opacity: 0, duration: 1 },
              0.9,
            )
            .from(
              ".hero-yoga-art",
              { opacity: 0, duration: 1.3 },
              0.8,
            );
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) =>
            gsap.from(element, {
              y: 36,
              opacity: 0,
              duration: 1.05,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 92%",
                once: true,
              },
            }),
          );
          gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((element) =>
            gsap.from(Array.from(element.children), {
              y: 36,
              opacity: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 90%",
                once: true,
              },
            }),
          );
          gsap.to(".reading-progress", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
          });
          gsap.fromTo(
            ".philosophy-emphasis",
            { color: "#818793" },
            {
              color: "#0e121b",
              stagger: 0.1,
              ease: "none",
              scrollTrigger: {
                trigger: ".philosophy",
                start: "top 75%",
                end: "center 50%",
                scrub: 1,
              },
            },
          );
          if (context.conditions?.desktop) {
            gsap.to(".hero-photo", {
              y: 38,
              ease: "none",
              scrollTrigger: {
                trigger: ".ir-hero",
                start: "top top",
                end: "bottom top",
                scrub: 1.2,
              },
            });
            gsap.utils
              .toArray<HTMLElement>("[data-parallax]")
              .forEach((element) =>
                gsap.fromTo(
                  element,
                  { yPercent: -3 },
                  {
                    yPercent: 3,
                    ease: "none",
                    scrollTrigger: {
                      trigger: element.parentElement,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 1.3,
                    },
                  },
                ),
              );
            const cleanups: (() => void)[] = [];
            gsap.utils
              .toArray<HTMLElement>("[data-magnetic]")
              .forEach((element) => {
                const x = gsap.quickTo(element, "x", {
                  duration: 0.45,
                  ease: "power3.out",
                });
                const y = gsap.quickTo(element, "y", {
                  duration: 0.45,
                  ease: "power3.out",
                });
                const move = (event: PointerEvent) => {
                  if (event.pointerType !== "mouse") return;
                  const rect = element.getBoundingClientRect();
                  x((event.clientX - rect.left - rect.width / 2) * 0.13);
                  y((event.clientY - rect.top - rect.height / 2) * 0.13);
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
            return () => cleanups.forEach((fn) => fn());
          }
        },
      );
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      window.addEventListener("load", refresh);
      return () => {
        media.revert();
        window.removeEventListener("load", refresh);
      };
    },
    { scope: root },
  );

  return (
    <div className="inner-revealing" ref={root} id="page-top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="reading-progress" aria-hidden="true" />
      <SiteHeader onBook={() => openBooking()} />
      <main id="main-content">
        <section className="ir-hero" id="home" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">
                <span className="headline-line">
                  <span className="headline-inner">Transform your life.</span>
                </span>
                <span className="headline-line">
                  <span className="headline-inner">Reveal your</span>
                </span>
                <span className="headline-line">
                  <span className="headline-inner">
                    <em>inner peace.</em>
                  </span>
                </span>
              </h1>
              <div className="hero-lead">
                <p className="hero-subtitle">
                  Through deep meditations, counselling
                  <br className="desktop-break" /> and healing practices.
                </p>
                <p>
                  Achieve your dreams and goals with ease, joy and peace. Relax
                  your body, mind and soul, one mindful moment at a time.
                </p>
              </div>
              <div className="hero-actions">
                <button
                  className="button button-primary"
                  data-magnetic
                  onClick={() => openBooking()}
                >
                  Book a Free Demo Session
                  <ArrowUpRight size={18} />
                </button>
                <a className="button button-text" href="#services">
                  Explore Programs
                  <ArrowUpRight size={18} />
                </a>
              </div>
              <div className="hero-location">
                <span className="location-icon">
                  <MapPin size={17} />
                </span>
                <p>
                  From our centre in Kolkata,
                  <br />
                  <strong>to wherever you feel at home.</strong>
                </p>
                <span className="hero-location-divider" />
                <span className="online-indicator">
                  <span />
                  In person & online
                </span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-oval" />
              <Image
                width={1000}
                height={1000}
                className="hero-yoga-art"
                src={poses.tree}
                alt=""
                aria-hidden="true"
              />
              <div className="hero-photo-mask">
                <Image
                  width={1024}
                  height={1536}
                  sizes="(max-width: 760px) 85vw, 44vw"
                  className="hero-photo"
                  src="/images/generated/meditation-hero.webp"
                  alt="A woman meditating peacefully on a cushion in soft natural light"
                  fetchPriority="high"
                />
              </div>
              <div className="hero-floating-note">
                <span className="note-illustration">
                  <Image width={1000} height={1000} src={poses.lotus} alt="" />
                </span>
                <div>
                  <span>BEGIN WITH A BREATH</span>
                  <p>
                    A little stillness.
                    <br />
                    <em>A whole new you.</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-bottom-rule container">
            <span>MEDITATION</span>
            <span className="hero-rule-dot" />
            <span>COUNSELLING</span>
            <span className="hero-rule-dot" />
            <span>HEALING</span>
            <a href="#about" aria-label="Discover our philosophy">
              <ArrowDown size={16} />
            </a>
          </div>
        </section>
        <section
          className="philosophy container"
          id="about"
          aria-labelledby="philosophy-title"
        >
          <div className="philosophy-images" data-reveal>
            <Image
              src="/images/generated/compassionate-counselling.webp"
              alt=""
              width={1536}
              height={1024}
              sizes="85px"
            />
            <Image
              src="/images/generated/self-reflection.webp"
              alt=""
              width={1536}
              height={1024}
              sizes="85px"
            />
          </div>
          <div className="philosophy-label" data-reveal>
            <span className="section-index">Our philosophy</span>
            <span className="philosophy-small-line" />
          </div>
          <div className="philosophy-main">
            <h2 id="philosophy-title" data-reveal>
              You don’t need to be{" "}
              <span className="philosophy-emphasis">fixed.</span>
              <br />
              You need to be <em className="philosophy-emphasis">revealed.</em>
            </h2>
            <div className="philosophy-body" data-reveal>
              <p>
                Realize the eternal bliss within. Gain higher levels of
                consciousness. Achieve everlasting peace, joy, happiness,
                abundance, and love.
              </p>
              <a className="text-link" href="/about">
                Get to know our centre
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <Image
            width={1000}
            height={1000}
            src={poses.seated}
            className="philosophy-art"
            alt=""
            aria-hidden="true"
          />
        </section>
        <section className="why-meditation" aria-labelledby="why-title">
          <div className="container why-grid">
            <div className="why-image" data-reveal>
              <Image
                width={1024}
                height={1536}
                sizes="(max-width: 760px) 90vw, 45vw"
                src="/images/generated/mindful-breathing.webp"
                alt="A man practising mindful breathing with his hands resting on his chest and abdomen"
                loading="lazy"
                data-parallax
              />
              <span className="image-caption">
                <span />
                SLOW DOWN. COME HOME TO YOURSELF.
              </span>
              <div className="why-image-note">
                <Sparkles size={19} />
                <span>
                  Within you,
                  <br />
                  <em>so much is possible.</em>
                </span>
              </div>
            </div>
            <div className="why-copy">
              <span className="section-index" data-reveal>
                Why meditation
              </span>
              <h2 id="why-title" data-reveal>
                A small pause.
                <br />
                <em>A profound shift.</em>
              </h2>
              <p className="why-intro" data-reveal>
                Meditation is one of the most natural and yet most profoundly
                rewarding of all human activities. It connects you with your own
                inner powers of vitality, clarity, and love.
              </p>
              <div className="wellbeing-grid" data-stagger>
                {benefits.map((benefit) => (
                  <article className="wellbeing-item" key={benefit.title}>
                    <span>
                      <benefit.icon size={20} strokeWidth={1.3} />
                    </span>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.text}</p>
                    </div>
                  </article>
                ))}
              </div>
              <a className="text-link" href="/resources" data-reveal>
                Discover a meditation practice
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </section>
        <section
          className="programs-section container"
          id="services"
          aria-labelledby="programs-title"
        >
          <div className="programs-heading">
            <div data-reveal>
              <span className="section-index">Our programs</span>
              <h2 id="programs-title">
                Different paths.
                <br />
                <em>One journey within.</em>
              </h2>
            </div>
            <div className="programs-heading-aside" data-reveal>
              <p>
                Whether you’re taking your first breath of stillness or going
                deeper, find a practice that meets you where you are.
              </p>
              <button className="text-link" onClick={() => openBooking()}>
                Not sure where to begin?
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>
          <div className="program-grid" data-stagger>
            {programs.map((program, index) => (
              <Link
                className={`program-card ${index === 1 ? "program-card-featured" : ""}`}
                key={program.title}
                href={program.href}
                aria-label={`Learn about ${program.title}`}
              >
                <div className="program-card-top">
                  <span>{program.duration}</span>
                  <span className="program-number">0{index + 1}</span>
                </div>
                <Image
                  width={1000}
                  height={1000}
                  className="program-art"
                  src={program.image}
                  alt=""
                  loading="lazy"
                />
                <div className="program-card-content">
                  <span className="program-category">{program.category}</span>
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                  <span className="program-card-link">
                    Explore program
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="program-bottom" data-reveal>
            <p>Every journey begins with understanding your needs.</p>
            <button
              className="button button-outline"
              data-magnetic
              onClick={() => openBooking()}
            >
              Let’s find your practice
              <ArrowUpRight size={17} />
            </button>
          </div>
        </section>
        <LowerSections onBook={openBooking} />
      </main>
      <SiteFooter />
      <nav aria-label="Quick contact">
        <a
          href="https://wa.me/919836147999?text=Hello%20Inner%20Revealing%2C%20I%27d%20like%20to%20know%20about%20a%20free%20demo%20session."
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
        <DemoBooking key={booking} interest={booking} onClose={closeBooking} />
      )}
    </div>
  );
}
