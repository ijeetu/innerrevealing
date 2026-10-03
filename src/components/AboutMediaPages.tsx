"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Expand, Play, X } from "lucide-react";
import { activityVideos, certificates, feedbackVideos, sessionPhotos, type Video } from "@/lib/media";
import "./about-media.css";

type MediaItem = { type: "image"; src: string; title: string; caption: string } | { type: "video"; id: string; title: string; caption: string };
type OpenMedia = (items: MediaItem[], index: number) => void;
type MediaSelection = { items: MediaItem[]; index: number } | null;

function useMediaDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selection, setSelection] = useState<MediaSelection>(null);
  useEffect(() => {
    if (!selection) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selection]);
  const open: OpenMedia = (items, index) => {
    setSelection({ items, index });
    dialog.current?.showModal();
  };
  const close = () => { dialog.current?.close(); setSelection(null); };
  const move = (direction: number) => setSelection((current) => current ? { ...current, index: (current.index + direction + current.items.length) % current.items.length } : null);
  const item = selection?.items[selection.index];
  const modal = (
    <dialog
      className="am-media-dialog"
      ref={dialog}
      aria-label={item?.title ?? "Media viewer"}
      onClose={() => setSelection(null)}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}
    >
      {item && <div className="am-dialog-content">
        <div className="am-dialog-top">
          <span>{item.type === "video" ? "WATCH THE EXPERIENCE" : "A CLOSER LOOK"}</span>
          <button className="am-icon-button" onClick={close} autoFocus aria-label="Close media viewer"><X size={22} /></button>
        </div>
        <div className={`am-dialog-stage ${item.type === "video" ? "am-dialog-video" : ""}`}>
          {item.type === "image" ? <Image src={item.src} alt={item.title} fill sizes="(max-width: 800px) 92vw, 1100px" /> : <iframe key={item.id} src={`https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&rel=0`} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
        </div>
        <div className="am-dialog-bottom">
          <div><h3>{item.title}</h3><p>{item.caption}</p>{item.type === "video" && <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <ArrowUpRight size={15} /></a>}</div>
          {selection && selection.items.length > 1 && <div className="am-media-controls">
            <button className="am-icon-button" onClick={() => move(-1)} aria-label="Previous item"><ArrowLeft size={18} /></button>
            <span>{selection.index + 1} / {selection.items.length}</span>
            <button className="am-icon-button" onClick={() => move(1)} aria-label="Next item"><ArrowRight size={18} /></button>
          </div>}
        </div>
      </div>}
    </dialog>
  );
  return { open, modal };
}

function VideoGrid({ videos, open }: { videos: Video[]; open: OpenMedia }) {
  const items: MediaItem[] = videos.map((video) => ({ ...video, type: "video" }));
  return <div className="am-video-grid" data-page-stagger>
    {videos.map((video, index) => <article className="am-video-card" key={video.id}>
      <button className="am-video-cover" onClick={() => open(items, index)} aria-label={`Play ${video.title}`}>
        <Image src={video.image ?? `/images/inner-revealing/video-${video.id}.jpg`} alt="" fill sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw" />
        <span className="am-play"><Play size={21} fill="currentColor" /></span>
        <span className="am-video-tag">WATCH VIDEO</span>
      </button>
      <div className="am-card-copy"><span className="am-card-number">{String(index + 1).padStart(2, "0")} / INNER REVEALING</span><h3>{video.title}</h3><p>{video.caption}</p></div>
    </article>)}
  </div>;
}

export function AboutContent() {
  const { open, modal } = useMediaDialog();
  const certificateItems: MediaItem[] = certificates.map((certificate) => ({ type: "image", src: certificate.src, title: certificate.title, caption: `${certificate.caption} · ${certificate.detail}` }));
  return <div className="am-pages">
    <section className="am-centre container" aria-labelledby="am-centre-title">
      <div className="am-section-heading" data-page-reveal><span className="am-eyebrow">THE HEART OF INNER REVEALING</span><h2 id="am-centre-title">A journey inward.<br /><em>A life more fully lived.</em></h2></div>
      <div className="am-centre-copy" data-page-reveal><p className="am-lead">Inner Revealing is a meditation, psychological counselling and healing centre in Kolkata.</p><p>Through deep meditations, counselling and healing practices, we help people explore their inner world and discover a more accepting, joyful way of living.</p><p>Our mission is to spread meditation, encourage people to break free from old conditioning, and help them realise their true selves and inherent inner power.</p></div>
    </section>
    <section className="am-timeline container" aria-label="Our journey" data-page-stagger>
      {[{ year: "2000", title: "The personal practice", text: "Hiren begins his meditation journey and explores different spiritual schools." }, { year: "2018", title: "Sharing the practice", text: "Rupa begins teaching in November; Hiren begins facilitating in December." }, { year: "2019", title: "A centre in Kolkata", text: "Inner Revealing Meditation Centre opens in November." }, { year: "2020", title: "Connecting across India", text: "Live online sessions begin in April with Hiren and Rupa." }].map((milestone) => <div className="am-milestone" key={milestone.year}><span>{milestone.year}</span><h3>{milestone.title}</h3><p>{milestone.text}</p></div>)}
    </section>
    <section className="am-facilitators container" aria-labelledby="am-facilitators-title">
      <div className="am-section-heading am-heading-wide" data-page-reveal><span className="am-eyebrow">THE PEOPLE BEHIND THE PRACTICE</span><h2 id="am-facilitators-title">Meet your<br /><em>facilitators.</em></h2><p>Two personal journeys. One shared wish: to help you experience the joy and peace within.</p></div>
      <article className="am-profile" data-page-reveal>
        <div className="am-portrait"><Image src="/images/inner-revealing/hiren-kapadia.jpg" alt="Hiren Kapadia, meditation facilitator" fill sizes="(max-width: 760px) 90vw, 40vw" /><span>MEDITATION FACILITATOR</span></div>
        <div className="am-profile-copy"><span className="am-eyebrow">PRACTISING MEDITATION SINCE 2000</span><h3>Hiren Kapadia</h3><p className="am-lead">“Why life? What is the purpose of life?”</p><p>That childhood question became a lifelong exploration. Hiren has studied at various spiritual schools, attended courses and classes, and facilitated thousands of meditation sessions in Kolkata and online.</p><p>His practice brings together breathwork and meditation techniques, with an emphasis on self-acceptance and living life more fully.</p>
          <details className="am-story"><summary>Read Hiren’s story <span aria-hidden="true">+</span></summary><div>
            <p>Hiren was brought up with love and care. His aunt took him to ashrams and gurus, which intrigued him from childhood. In Class 8, he asked his father to buy him the Bhagwat Geeta. He enjoyed visiting temples and singing and dancing to bhajans.</p>
            <p>While in college, he joined his family business and began visiting spiritual schools. He started meditating in 2000 and followed their teachings with great discipline. In 2015, a difficult period that included an esophageal ulcer led him to reflect on his beliefs and his relationship with himself.</p>
            <p>After 15 years of meditation, he felt that anger, ego and other feelings were still there. Frustrated with his approach to spirituality, he stepped away from meditation for around two years and focused on business and everyday life.</p>
            <p>His friend Anand then invited him to meditate at his home. A few friends practised together for two and a half months, rekindling his interest. He discovered Osho’s videos, attended Osho meditation sessions and was introduced to Anapanasati meditation.</p>
            <p>Hiren describes this as a turning point towards accepting all of himself. He returned to spiritual books by Osho, Paramhansa Yogananda, Ramana Maharshi, Eckhart Tolle, J. Krishnamurti, Swami Ramacharaka and others, and continued meditation in a new way.</p>
            <p>After further courses, he started facilitating meditation in December 2018: in housing societies, people’s homes, schools, parks, lakes, temples and pyramids. The joy of sharing the practice led him to open his own meditation centre in November 2019.</p>
            <p>In April 2020, he teamed up with Rupa Jhunjhunwala to start live online sessions, with people joining from across India. His mission today is to spread meditation and help people realise their true selves, their inherent inner power, and the bliss and joy within.</p>
          </div></details>
        </div>
      </article>
      <article className="am-profile am-profile-reverse" data-page-reveal>
        <div className="am-portrait"><Image src="/images/inner-revealing/rupa-jhunjhunwala.jpg" alt="Rupa Jhunjhunwala, meditation facilitator and life coach" fill sizes="(max-width: 760px) 90vw, 40vw" /><span>MEDITATION FACILITATOR & LIFE COACH</span></div>
        <div className="am-profile-copy"><span className="am-eyebrow">A JOURNEY OF SELF-ACCEPTANCE</span><h3>Rupa Jhunjhunwala</h3><p className="am-lead">“Now each moment of life is a celebration.”</p><p>Rupa’s search for truth began with devotion and the Bhagwat Geeta. Introduced to meditation in 2005, she continued exploring yoga, spiritual wisdom and self-awareness while running her boutique and caring for her family.</p><p>A yoga master, life coach and Internationally Certified Access Bars Facilitator, she has been teaching meditation since November 2018, with sessions for adults and spiritual camps for children.</p>
          <details className="am-story"><summary>Read Rupa’s story <span aria-hidden="true">+</span></summary><div>
            <p>From a young age, Rupa was deeply involved in Bhakti and Pooja, observing fasts and rituals diligently. She became a Krishna devotee, read all 18 chapters of the Bhagwat Geeta and learned about moksha. This started a deep thirst for truth.</p>
            <p>In 2005, she was introduced to meditation and spirituality for the first time. In her personal account, she describes recognising suppressed emotions during a period of thyroid-related health challenges. Spiritual wisdom and meditation became part of her journey towards loving herself, accepting herself completely and expressing herself.</p>
            <p>Her search deepened. She read books, listened to spiritual teachings, did soul searching and attended courses. She learned yoga, became a yoga master, and later an Internationally Certified Access Bars Facilitator. She did all this while running her boutique and managing her family.</p>
            <p>Rupa describes this as learning the art of living. As her outlook transformed, she became a life coach. Wanting others to experience this joy and bliss, she began teaching meditation in November 2018.</p>
            <p>She has conducted sessions for adults and spiritual camps for children, finding it deeply pleasing and gratifying to see people’s experiences. Her realisation is that heaven and hell are both within us, and her wish is to share the celebration she finds in each moment of life.</p>
          </div></details>
        </div>
      </article>
    </section>
    <section className="am-certificates container" aria-labelledby="am-certificates-title">
      <div className="am-section-heading" data-page-reveal><span className="am-eyebrow">LEARNING & RECOGNITION</span><h2 id="am-certificates-title">Certificates<br /><em>& appreciation.</em></h2><p>Training and recognition from our journey of facilitating meditation and counselling.</p></div>
      <div className="am-certificate-grid" data-page-stagger>{certificates.map((certificate, index) => <article className="am-certificate-card" key={certificate.src}><button className="am-certificate-image" onClick={() => open(certificateItems, index)} aria-label={`View ${certificate.title} from ${certificate.caption}`}><Image src={certificate.src} alt={`${certificate.title} from ${certificate.caption}`} fill sizes="(max-width: 700px) 90vw, 42vw" /><span className="am-expand"><Expand size={19} /></span></button><div className="am-card-copy"><span className="am-card-number"><Check size={13} /> {certificate.caption}</span><h3>{certificate.title}</h3><p>{certificate.detail}</p></div></article>)}</div>
    </section>
    {modal}
  </div>;
}

export function GalleryContent() {
  const [filter, setFilter] = useState("All photos");
  const { open, modal } = useMediaDialog();
  const filtered = filter === "All photos" ? sessionPhotos : sessionPhotos.filter((photo) => photo.category === filter);
  const photoItems: MediaItem[] = filtered.map((photo) => ({ ...photo, type: "image" }));
  return <div className="am-pages">
    <section className="am-gallery container" aria-labelledby="am-gallery-title">
      <div className="am-section-heading am-heading-wide" data-page-reveal><span className="am-eyebrow">PHOTOS OF OUR SESSIONS</span><h2 id="am-gallery-title">Together, we<br /><em>come alive.</em></h2><p>A glimpse into our sessions, camps and activities — in schools, communities, parks and peaceful spaces.</p></div>
      <div className="am-gallery-tools" data-page-reveal><div className="am-filters" role="group" aria-label="Filter session photos">{["All photos", "Schools & kids", "Community", "In nature"].map((category) => <button key={category} aria-pressed={category === filter} onClick={() => setFilter(category)}>{category}</button>)}</div><span className="am-photo-count" aria-live="polite">{filtered.length} moments</span></div>
      <div className="am-photo-grid" data-page-stagger>{filtered.map((photo, index) => <article className="am-photo-card" key={photo.src}><button className="am-photo-cover" onClick={() => open(photoItems, index)} aria-label={`Enlarge ${photo.title}`}><Image src={photo.src} alt={photo.title} fill sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw" /><span className="am-photo-category">{photo.category}</span><span className="am-expand"><Expand size={19} /></span></button><div className="am-card-copy"><h3>{photo.title}</h3><p>{photo.caption}</p></div></article>)}</div>
    </section>
    <section className="am-activities container" aria-labelledby="am-activities-title"><div className="am-section-heading am-heading-wide" data-page-reveal><span className="am-eyebrow">VIDEOS OF OUR ACTIVITIES</span><h2 id="am-activities-title">Stillness, movement,<br /><em>and a little joy.</em></h2><p>Meditation is about living life with laughter, joyously, playfully, totally. Every individual can enter meditation.</p></div><VideoGrid videos={activityVideos} open={open} /><a className="am-channel-link" href="https://www.youtube.com/@innerrevealing" target="_blank" rel="noopener noreferrer">More moments on our YouTube channel <ArrowUpRight size={18} /></a></section>
    {modal}
  </div>;
}

export function TestimonialsContent() {
  const { open, modal } = useMediaDialog();
  const comments: MediaItem[] = [1, 2, 3].map((number) => ({ type: "image", src: `/images/inner-revealing/participant-comment-${number}.jpg`, title: `Participant feedback ${number}`, caption: "Messages shared with Inner Revealing after meditation sessions." }));
  return <div className="am-pages">
    <section className="am-feedback container" aria-labelledby="am-feedback-title"><div className="am-section-heading am-heading-wide" data-page-reveal><span className="am-eyebrow">SUCH GRATIFYING FEEDBACK</span><h2 id="am-feedback-title">Experiences,<br /><em>in their own words.</em></h2><div><p>Participants share what they felt in our group and online meditation sessions. Just so delighting and gratifying.</p><span className="am-experience-note">These are personal experiences; each person’s journey is different.</span></div></div><VideoGrid videos={feedbackVideos} open={open} /></section>
    <section className="am-comments container" aria-labelledby="am-comments-title"><div className="am-section-heading" data-page-reveal><span className="am-eyebrow">MESSAGES FROM OUR COMMUNITY</span><h2 id="am-comments-title">Small notes.<br /><em>Meaningful moments.</em></h2><p>Just so heartening seeing the results.</p></div><div className="am-comments-grid" data-page-stagger>{comments.map((comment, index) => comment.type === "image" && <button className="am-comment-image" key={comment.src} onClick={() => open(comments, index)} aria-label={`Enlarge participant feedback ${index + 1}`}><Image src={comment.src} alt={`Written participant feedback shared with the centre, message ${index + 1}`} fill sizes="(max-width: 700px) 90vw, 30vw" /><span className="am-expand"><Expand size={18} /></span></button>)}</div></section>
    <section className="am-reviews container" aria-labelledby="am-reviews-title" data-page-reveal><div><span className="am-eyebrow">MORE FROM OUR COMMUNITY</span><h2 id="am-reviews-title">Read participant<br /><em>reviews on Justdial.</em></h2></div><div><p>Explore more feedback from people who have visited our centre and joined our sessions.</p><a className="am-review-link" href="https://www.justdial.com/dt-37BV81ETQ81" target="_blank" rel="noopener noreferrer">Read reviews on Justdial <ArrowUpRight size={18} /></a></div></section>
    {modal}
  </div>;
}
