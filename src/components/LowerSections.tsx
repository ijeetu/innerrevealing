"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Mail,
  MessageCircle,
  Phone,
  Play,
  X,
} from "lucide-react";
import "./lower-sections.css";

const PHONE_LINK = "tel:+919836147999";
const EMAIL = "innerrevealing@gmail.com";
const WHATSAPP = "https://wa.me/919836147999";
const gallery = [
  {
    image: "south-city-school.jpg",
    title: "South City International School",
    caption: "Yoga and Meditation Session · 13 September 2025",
    video: "y3FTy0xlMdM",
    contain: false,
    width: 1280,
    height: 720,
  },
  {
    image: "community-session.jpg",
    title: "Group Session for Community",
    caption: "In a Housing Complex",
    video: null,
    contain: false,
    width: 1200,
    height: 1200,
  },
  {
    image: "meditation-in-nature.jpg",
    title: "Meditation and Fun amidst nature",
    caption: "Fun activities with meditation",
    video: null,
    contain: true,
    width: 1366,
    height: 1366,
  },
  {
    image: "kids-meditation-session.jpg",
    title: "Meditation Sessions for Kids",
    caption: "Meditation with fun activities for kids",
    video: null,
    contain: true,
    width: 1366,
    height: 1366,
  },
];
const testimonials = [
  {
    id: "rhEKjj4r6Jg",
    image: "testimonial-pain.jpg",
    title: "Leg and Back Pain Completely Gone in One Session",
    caption: "Super Experience of Meditation",
  },
  {
    id: "XxUZ7zgmSs0",
    image: "testimonial-heart-chakra.jpg",
    title: "Wonderful Experience of Heart Chakra Meditation",
    caption: "Online Group Session",
  },
  {
    id: "kUaNMJtlH80",
    image: "testimonial-kids.jpg",
    title: "Meditation Experience of Kids",
    caption: "By Rupa Jhunjhunwala",
  },
];
const image = (name: string) => `/images/inner-revealing/${name}`;
type Media =
  | {
      type: "image";
      src: string;
      title: string;
      caption: string;
      width: number;
      height: number;
    }
  | { type: "video"; id: string; title: string };

export default function LowerSections({
  onBook,
}: {
  onBook: (program?: string) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const mediaDialog = useRef<HTMLDialogElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [media, setMedia] = useState<Media | null>(null);

  useEffect(() => {
    if (!media) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [media]);

  function goToSlide(index: number) {
    const next = Math.max(0, Math.min(gallery.length - 1, index));
    const container = rail.current;
    const slide = container?.children[next] as HTMLElement | undefined;
    if (container && slide) {
      const left =
        slide.getBoundingClientRect().left -
        container.getBoundingClientRect().left +
        container.scrollLeft;
      container.scrollTo({
        left,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      setActiveSlide(next);
    }
  }
  function updateActiveSlide() {
    if (!rail.current) return;
    const container = rail.current;
    let closest = 0;
    let distance = Infinity;
    Array.from(container.children).forEach((child, index) => {
      const current = Math.abs(
        child.getBoundingClientRect().left -
          container.getBoundingClientRect().left,
      );
      if (current < distance) {
        closest = index;
        distance = current;
      }
    });
    setActiveSlide(closest);
  }
  function openMedia(next: Media) {
    setMedia(next);
    mediaDialog.current?.showModal();
  }
  function closeMedia() {
    mediaDialog.current?.close();
    setMedia(null);
  }

  return (
    <>
      <section
        className="lower-glimpses container"
        id="glimpses"
        aria-labelledby="lower-glimpses-heading"
      >
        <div className="lower-section-heading" data-reveal>
          <div>
            <span className="lower-eyebrow">
              Let your inner flower forever bloom
            </span>
            <h2 id="lower-glimpses-heading">
              Glimpses of
              <br />
              <em>our sessions.</em>
            </h2>
          </div>
          <p>
            Session at South City International School on 13th September 2025.
            Yoga and Meditation Session for the school’s teachers and staff
            members.
          </p>
        </div>
        <div
          className="lower-gallery-rail"
          role="region"
          ref={rail}
          onScroll={updateActiveSlide}
          aria-label="Session photo and video gallery"
          tabIndex={0}
          data-reveal
        >
          {gallery.map((photo) => (
            <article className="lower-gallery-slide" key={photo.image}>
              <button
                className={`lower-gallery-photo ${photo.contain ? "lower-photo-contain" : ""}`}
                onClick={() =>
                  openMedia(
                    photo.video
                      ? { type: "video", id: photo.video, title: photo.title }
                      : {
                          type: "image",
                          src: image(photo.image),
                          title: photo.title,
                          caption: photo.caption,
                          width: photo.width,
                          height: photo.height,
                        },
                  )
                }
                aria-label={`${photo.video ? "Play video" : "Enlarge photo"}: ${photo.title}`}
              >
                <Image
                  src={image(photo.image)}
                  alt={
                    photo.video
                      ? "Video of yoga and meditation at South City International School"
                      : photo.title
                  }
                  fill
                  sizes="(max-width: 600px) 85vw, (max-width: 900px) 70vw, (max-width: 1440px) 60vw, 832px"
                />
                {photo.video && (
                  <span className="lower-gallery-video-label">
                    <Play size={12} fill="currentColor" />
                    Watch the session
                  </span>
                )}
                <span className="lower-photo-expand">
                  {photo.video ? (
                    <Play size={20} strokeWidth={1.5} fill="currentColor" />
                  ) : (
                    <ArrowUpRight size={22} strokeWidth={1.5} />
                  )}
                </span>
              </button>
              <div className="lower-gallery-caption">
                <h3>{photo.title}</h3>
                <span>{photo.caption}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="lower-gallery-bottom">
          <Link className="lower-text-link" href="/gallery">
            View Gallery
            <ArrowUpRight size={19} strokeWidth={1.5} />
          </Link>
          <div className="lower-gallery-controls">
            <span aria-live="polite">
              0{activeSlide + 1} <i /> 0{gallery.length}
            </span>
            <button
              aria-label="Previous session photo"
              disabled={activeSlide === 0}
              onClick={() => goToSlide(activeSlide - 1)}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Next session photo"
              disabled={activeSlide === gallery.length - 1}
              onClick={() => goToSlide(activeSlide + 1)}
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      <section
        className="lower-kids"
        id="kids"
        aria-labelledby="lower-kids-heading"
      >
        <div className="lower-kids-grid container">
          <div className="lower-kids-visual" data-reveal>
            <div className="lower-kids-art">
              <Image
                className="lower-kids-generated"
                src="/images/generated/kids-mindfulness.webp"
                alt="Children enjoying a guided mindfulness moment with a facilitator"
                width={1254}
                height={1254}
                sizes="(max-width: 600px) 88vw, (max-width: 900px) 62vw, 42vw"
              />
            </div>
            <button
              className="lower-kids-photo"
              onClick={() =>
                openMedia({
                  type: "video",
                  id: "saRL3coeghA",
                  title: "Kids Meditation",
                })
              }
              aria-label="Watch Kids Meditation"
            >
              <Image
                src={image("kids-meditation.jpg")}
                alt="Children and a facilitator practising yoga together"
                fill
                sizes="(max-width: 600px) 40vw, (max-width: 900px) 20vw, 240px"
              />
              <span>
                <Play size={16} fill="currentColor" />
              </span>
            </button>
            <span className="lower-age-badge">
              <strong>7–14</strong>
              <span>years of age</span>
            </span>
          </div>
          <div className="lower-kids-copy" data-reveal>
            <span className="lower-eyebrow">
              Self awareness course for children
            </span>
            <h2 id="lower-kids-heading">
              Meditate
              <br />
              <em>with fun.</em>
            </h2>
            <h3>Kids Meditation</h3>
            <p>
              Fun processes to increase their focus, concentration, awareness
              and mindfulness. A self awareness course for children aged 7–14
              years.
            </p>
            <div
              className="lower-kids-topics"
              role="group"
              aria-label="Course topics"
            >
              <span>Self esteem</span>
              <span>Emotions</span>
              <span>Gratitude</span>
              <span>Love yourself</span>
            </div>
            <Link
              className="lower-button lower-button-dark"
              href="/services/kids-meditation"
              data-magnetic
            >
              Know More
              <ArrowUpRight size={20} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="lower-testimonials container"
        id="testimonials"
        aria-labelledby="lower-testimonials-heading"
      >
        <div
          className="lower-section-heading lower-testimonial-heading"
          data-reveal
        >
          <div>
            <span className="lower-eyebrow">
              Holistically transform yourself
            </span>
            <h2 id="lower-testimonials-heading">
              Such gratifying
              <br />
              <em>feedback.</em>
            </h2>
          </div>
          <div className="lower-testimonial-intro">
            <p>
              Participants feedback videos — just so delighting and gratifying.
            </p>
            <Link className="lower-text-link" href="/testimonials">
              See All Testimonials
              <ArrowUpRight size={19} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
        <div className="lower-video-grid" data-stagger>
          {testimonials.map((video, index) => (
            <article className="lower-video-card" key={video.id}>
              <button
                className="lower-video-preview"
                onClick={() =>
                  openMedia({ type: "video", id: video.id, title: video.title })
                }
                aria-label={`Play: ${video.title}`}
              >
                <Image
                  src={image(video.image)}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 90vw, (max-width: 1440px) 28vw, 410px"
                />
                <span className="lower-video-play">
                  <Play size={24} strokeWidth={1.4} fill="currentColor" />
                </span>
                <span className="lower-video-number">0{index + 1}</span>
              </button>
              <span className="lower-video-caption">{video.caption}</span>
              <h3>{video.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section
        className="lower-contact"
        id="contact"
        aria-labelledby="lower-contact-heading"
      >
        <div className="lower-contact-background" aria-hidden="true">
          <Image
            src="/images/generated/shared-stillness.webp"
            alt=""
            fill
            sizes="100vw"
          />
        </div>
        <div className="lower-contact-inner container">
          <div className="lower-contact-heading" data-reveal>
            <span className="lower-eyebrow">At our center or online</span>
            <h2 id="lower-contact-heading">
              Book a free
              <br />
              <em>demo session.</em>
            </h2>
            <p>
              Take the demo session and experience the peace, joy and bliss
              within. You can either choose to do it at our center or online,
              whatever suits you.
            </p>
          </div>
          <div className="lower-contact-actions" data-reveal>
            <button
              className="lower-button lower-button-light"
              onClick={() => onBook("Free Demo Session")}
              data-magnetic
            >
              Book Now
              <ArrowUpRight size={21} strokeWidth={1.5} />
            </button>
            <a className="lower-contact-call" href={PHONE_LINK}>
              <Phone size={18} strokeWidth={1.4} />
              <span>
                Call on <strong>9836147999</strong> to book
              </span>
            </a>
            <div className="lower-contact-direct">
              <a
                href={`${WHATSAPP}?text=${encodeURIComponent("Hello, I would like to book a free demo session at Inner Revealing Meditation Centre.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={17} strokeWidth={1.5} />
                WhatsApp
              </a>
              <a href={`mailto:${EMAIL}`}>
                <Mail size={17} strokeWidth={1.5} />
                Email us
              </a>
            </div>
          </div>
        </div>
      </section>

      <dialog
        className="lower-media-dialog"
        ref={mediaDialog}
        aria-label={media?.title || "Session media"}
        onClose={() => setMedia(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMedia();
        }}
      >
        <button
          className="lower-media-close"
          onClick={closeMedia}
          aria-label="Close media"
        >
          <X size={23} strokeWidth={1.5} />
        </button>
        {media?.type === "video" && (
          <div className="lower-media-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&rel=0`}
              title={media.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <h2>{media.title}</h2>
            <a
              href={`https://www.youtube.com/watch?v=${media.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch on YouTube
              <ArrowUpRight size={17} strokeWidth={1.5} />
            </a>
          </div>
        )}
        {media?.type === "image" && (
          <div className="lower-media-image">
            <Image
              src={media.src}
              alt={media.title}
              width={media.width}
              height={media.height}
              sizes="(max-width: 1068px) 95vw, 1020px"
            />
            <div>
              <h2>{media.title}</h2>
              <p>{media.caption}</p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
