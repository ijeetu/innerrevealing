"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, Clock3, Headphones, Heart, Infinity as InfinityIcon, Play, Search, Sparkles, Wind } from "lucide-react";
import { breathingPractices, freeCourseTopics, hirenBookUrl, meditationCategories, recordedMeditations, recommendedBooks, resourceEnquiry, resourceVideos, videoCategories, type MeditationCategory, type ResourceVideo, type VideoCategory } from "@/lib/resources";
import "./resources.css";

const art = (name: string) => `/images/Yoga Continuous Line/SVG/${name}.svg`;
const meditationArt: Record<MeditationCategory, string> = {
  "Calm & clarity": art("Gomukhasana, Yoga, Meditation, Woman, Yoga pose, Continuous Line, Asana"),
  "Self love": art("Lotus, Padmasana, Yoga, Yoga Pose, Woman, Continuous Line"),
  Sleep: art("Child Pose, Balasana, Yoga, Yoga Pose, Meditation, Wellness, Continuous Line"),
  Energy: art("Tree Pose, Balance, Yoga, Wellness, Yoga Pose, Woman, Continuous Line"),
  "Children & parents": art("Triangle Pose, Yoga, Yoga Pose, Woman, Stretch, Exercise, Trikonasana"),
  "Inner work": art("Dancer, Yoga, Yoga Pose, Wellness, Stretch, Balance, Fitness"),
};

export function RecordedMeditationCatalog() {
  const [category, setCategory] = useState<MeditationCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const meditations = recordedMeditations.filter((meditation) => (category === "All" || meditation.category === category) && `${meditation.title} ${meditation.description} ${meditation.tag} ${meditation.language ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()));
  const browsingAll = category === "All" && !query.trim();
  const visibleMeditations = browsingAll && !showAll ? meditations.slice(0, 6) : meditations;

  return (
    <div className="resource-page">
      <div className="rp-benefits container" data-page-stagger>
        <span><Headphones size={19} /> Guided at every step</span>
        <span><InfinityIcon size={21} /> Lifetime access</span>
        <span><Clock3 size={19} /> Practise at your own pace</span>
      </div>
      <section className="rp-section container" id="meditations" aria-labelledby="recorded-catalog-title">
        <div className="rp-section-heading" data-page-reveal>
          <div><span className="eyebrow">YOUR PRACTICE, YOUR PACE</span><h2 id="recorded-catalog-title">Find a moment <em>for yourself.</em></h2></div>
          <p>From a mindful morning to a peaceful night. Choose a practice that speaks to what you need today.</p>
        </div>
        <div className="rp-catalog-controls" data-page-reveal>
          <div className="rp-filter-list" aria-label="Filter meditations by purpose">
            {(["All", ...meditationCategories] as const).map((item) => <button key={item} type="button" className={category === item ? "is-active" : ""} aria-pressed={category === item} onClick={() => { setCategory(item); setShowAll(false); }}>{item}</button>)}
          </div>
          <label className="rp-search"><Search size={17} /><span className="rp-sr-only">Search recorded meditations</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a meditation…" type="search" /></label>
        </div>
        <p className="rp-result-count" aria-live="polite">{visibleMeditations.length < meditations.length ? `Showing ${visibleMeditations.length} of ${meditations.length} meditations` : `${meditations.length} ${meditations.length === 1 ? "meditation" : "meditations"} to explore`}</p>
        <div className="rp-record-grid" id="recorded-catalog" data-page-stagger>
          {visibleMeditations.map((meditation) => <article className="rp-record-card" key={meditation.title}>
            <div className={`rp-record-art rp-tone-${meditation.category === "Sleep" ? "sleep" : meditation.category === "Self love" ? "love" : "calm"}`}>
              <span className="rp-record-category">{meditation.category}</span>
              <Image src={meditationArt[meditation.category]} alt="" width={240} height={190} />
              <span className="rp-art-index"><Headphones size={16} /></span>
            </div>
            <div className="rp-record-copy">
              <div className="rp-record-meta"><span>{meditation.duration ? <><Clock3 size={13} /> {meditation.duration}</> : <><Headphones size={13} /> Guided meditation</>}</span>{meditation.language && <span>{meditation.language}</span>}</div>
              <h3>{meditation.title}</h3><p>{meditation.description}</p><span className="rp-record-tag">{meditation.tag}</span>
              <div className="rp-record-footer"><span className="rp-price">{meditation.price ? <>₹{meditation.price}<small>Lifetime access</small></> : <span className="rp-price-enquiry">Enquire for price</span>}</span><a href={resourceEnquiry(`the ${meditation.title} recording`)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about ${meditation.title}`}>{meditation.price ? "Get meditation" : "Ask about access"}<ArrowUpRight size={16} /></a></div>
            </div>
          </article>)}
        </div>
        {browsingAll && meditations.length > 6 && <div className="rp-more-videos"><button type="button" className="button button-outline" aria-expanded={showAll} aria-controls="recorded-catalog" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer meditations" : `Explore all ${meditations.length} meditations`}<ArrowDown size={16} className={showAll ? "is-flipped" : ""} /></button></div>}
        {meditations.length === 0 && <div className="rp-empty"><Search size={26} /><h3>A little more exploring?</h3><p>Try another word or browse all our meditations.</p><button className="button button-outline" type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters <ArrowRight size={15} /></button></div>}
      </section>

      <section className="rp-sleep-section" aria-labelledby="sleep-bundle-title">
        <div className="container rp-sleep-grid">
          <div className="rp-sleep-art" data-page-reveal><Image src="/images/generated/sleep-meditation.webp" alt="A woman practising a peaceful evening meditation before sleep" fill sizes="(max-width: 380px) calc(100vw - 40px), (max-width: 600px) calc(100vw - 48px), (max-width: 900px) 480px, (max-width: 1100px) 45vw, 480px" /></div>
          <div className="rp-sleep-copy" data-page-reveal><span className="eyebrow">THREE POWERFUL SLEEP MEDITATIONS</span><h2 id="sleep-bundle-title">Let the day go.<br /><em>Welcome the night.</em></h2><p>If thoughts keep you awake or your sleep feels disturbed, explore these three guided practices for your evening.</p><ul><li>Special Night Meditation for Sleep</li><li>Gratitude Meditation for Sleep</li><li>Hindi / English Three Night Meditation</li></ul><a className="button button-primary" href={resourceEnquiry("the three sleep meditations bundle and its 7-day money-back guarantee")} target="_blank" rel="noopener noreferrer">Enquire about the bundle <ArrowUpRight size={16} /></a><span className="rp-guarantee">7-day money-back guarantee</span></div>
        </div>
      </section>

      <section className="rp-section container rp-access-section" aria-labelledby="recorded-access-title">
        <div className="rp-access-card" data-page-reveal>
          <div className="rp-access-art"><Image src="/images/generated/return-to-practice-panel.webp" alt="" fill sizes="(max-width: 600px) calc(100vw - 48px), (max-width: 1100px) 220px, 280px" /></div>
          <div className="rp-access-copy">
            <span className="eyebrow">ALREADY ATTENDED A SESSION?</span><h2 id="recorded-access-title">Return to your practice.</h2><p>Access your session recording for ₹450. For any recording purchase, contact us for payment details, then send your payment screenshot to <a href="https://wa.me/919836147999" target="_blank" rel="noopener noreferrer">+91 98361 47999</a> to receive your access link.</p>
            <a className="button button-outline" href={resourceEnquiry("access to my session recording for ₹450")} target="_blank" rel="noopener noreferrer">Request recording <ArrowUpRight size={16} /></a>
          </div>
        </div>
        <div className="rp-free-callout"><p>Still discovering meditation? Begin with a free guided practice.</p><Link className="text-link" href="/resources">Explore free resources <ArrowRight size={16} /></Link></div>
      </section>
    </div>
  );
}

function VideoCard({ video }: { video: ResourceVideo }) {
  const href = video.videoId ? `https://www.youtube.com/watch?v=${video.videoId}` : video.href;
  const isArchive = video.href?.includes("innerrevealing.com");
  return <article className="rp-video-card">
    <a className={`rp-video-thumbnail ${video.videoId ? "" : "rp-video-illustrated"}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${isArchive ? "Open session archive:" : "Watch:"} ${video.title}`}>
      {video.videoId ? <Image src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" width={480} height={270} unoptimized /> : <><Wind className="rp-video-wind" size={82} strokeWidth={0.7} /><span>{isArchive ? "SESSION ARCHIVE" : "A MINDFUL MOMENT"}</span></>}
      <span className="rp-video-play">{isArchive ? <ArrowUpRight size={20} /> : <Play size={19} fill="currentColor" />}</span>
      {video.duration && <span className="rp-video-duration">{video.duration}</span>}
    </a>
    <div className="rp-video-copy"><span className="rp-small-label">{video.category}</span><h3><a href={href} target="_blank" rel="noopener noreferrer">{video.title}<ArrowUpRight size={16} /></a></h3><p>{video.description}</p><a className="rp-video-link" href={href} target="_blank" rel="noopener noreferrer">{isArchive ? "Open session archive" : video.videoId ? "Watch on YouTube" : "Watch on Vimeo"}<ArrowUpRight size={13} /></a></div>
  </article>;
}

export function FreeResourceLibrary() {
  const [videoCategory, setVideoCategory] = useState<VideoCategory>("Meditation");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [bookQuery, setBookQuery] = useState("");
  const videos = resourceVideos.filter((video) => video.category === videoCategory);
  const books = recommendedBooks.filter((book) => `${book.title} ${book.subtitle} ${book.author}`.toLowerCase().includes(bookQuery.toLowerCase().trim()));

  return <div className="resource-page">
    <nav className="rp-resource-nav container" aria-label="Browse free resources" data-page-reveal><a href="#videos"><Play size={15} /> Watch & practise</a><a href="#pranayama"><Wind size={17} /> Breathing guide</a><a href="#free-course"><Sparkles size={16} /> Free course</a><a href="#books"><BookOpen size={16} /> Books & reading</a></nav>

    <section className="rp-section container" id="videos" aria-labelledby="resource-video-title">
      <div className="rp-section-heading" data-page-reveal><div><span className="eyebrow">PRESS PLAY. BE PRESENT.</span><h2 id="resource-video-title">A practice for <em>every day.</em></h2></div><p>Guided meditations, mindful moments and lessons from our community. Find a quiet space and begin.</p></div>
      <div className="rp-video-controls" data-page-reveal><div className="rp-filter-list" aria-label="Video categories">{videoCategories.map((category) => <button type="button" key={category} className={videoCategory === category ? "is-active" : ""} aria-pressed={videoCategory === category} onClick={() => { setVideoCategory(category); setShowAllVideos(false); }}>{category}</button>)}</div><a className="rp-channel-link" href="https://www.youtube.com/@innerrevealing" target="_blank" rel="noopener noreferrer">Our YouTube channel <ArrowUpRight size={15} /></a></div>
      <p className="rp-result-count" aria-live="polite">{videos.length} {videoCategory.toLowerCase()} videos</p>
      <div className="rp-video-grid" data-page-stagger>{(showAllVideos ? videos : videos.slice(0, 6)).map((video) => <VideoCard video={video} key={`${video.category}-${video.title}`} />)}</div>
      {videos.length > 6 && <div className="rp-more-videos"><button type="button" className="button button-outline" onClick={() => setShowAllVideos(!showAllVideos)}>{showAllVideos ? "Show fewer videos" : `Explore all ${videos.length} videos`}<ArrowDown size={16} className={showAllVideos ? "is-flipped" : ""} /></button></div>}
    </section>

    <section className="rp-breathing-section" id="pranayama" aria-labelledby="pranayama-title"><div className="container rp-guide-grid">
      <div className="rp-guide-intro" data-page-reveal><span className="eyebrow">PRANAYAMA PRACTICE GUIDE</span><h2 id="pranayama-title">Come back<br />to <em>your breath.</em></h2><p>Five gentle practices to explore in your own time. Choose one below for the steps and precautions.</p><div className="rp-guide-note"><Wind size={25} strokeWidth={1.2} /><p>Let your breath stay gentle and unforced. If a practice feels uncomfortable, pause and return to your normal breathing.</p></div></div>
      <div className="rp-guide-accordions" data-page-stagger>{breathingPractices.map((practice, index) => <details className="rp-practice" key={practice.name}><summary><span className="rp-practice-number">0{index + 1}</span><span><strong>{practice.name}</strong><small>{practice.subtitle}</small></span><ChevronDown size={20} /></summary><div className="rp-practice-content"><span className="rp-practice-time"><Clock3 size={13} />{practice.time}</span><p>{practice.introduction}</p><h3>How to practise</h3><ol>{practice.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="rp-practice-caution"><strong>A gentle precaution</strong><p>{practice.caution}</p></div></div></details>)}</div>
    </div></section>

    <section className="rp-section container" id="free-course" aria-labelledby="free-course-title"><div className="rp-course-header" data-page-reveal><div><span className="eyebrow">A FREE COURSE · NINE TOPICS</span><h2 id="free-course-title">Remove blockages.<br /><em>Set yourself free.</em></h2></div><p>Explore a series of theory, methods and meditations for inner growth. Take one lesson at a time and bring the practice into your daily life.</p></div><div className="rp-course-grid" data-page-stagger>{freeCourseTopics.map((topic, index) => <a className="rp-topic" key={topic.title} href={`https://www.youtube.com/watch?v=${topic.videoId}`} target="_blank" rel="noopener noreferrer"><span className="rp-topic-top"><span>TOPIC 0{index + 1}</span><ArrowUpRight size={20} /></span><h3>{topic.title}</h3><p>{topic.format}</p><span className="rp-topic-tag">{topic.tag}</span></a>)}</div></section>

    <section className="rp-book-feature" id="books" aria-labelledby="hiren-book-title"><div className="container rp-book-grid"><div className="rp-book-visual" data-page-reveal><Image src="/images/generated/remove-blockages-book.webp" alt="Remove Blockages & Thrive in Life by Hiren Kapadia" fill sizes="(max-width: 380px) calc(100vw - 40px), (max-width: 600px) calc(100vw - 48px), (max-width: 900px) 480px, (max-width: 1100px) 40vw, 480px" /></div><div className="rp-book-feature-copy" data-page-reveal><span className="eyebrow">A BOOK BY HIREN KAPADIA</span><h2 id="hiren-book-title">Wisdom to bring<br /><em>into your everyday.</em></h2><p>Compiled and written by Hiren Kapadia, <em>Remove Blockages & Thrive in Life</em> brings together tools and meditations for understanding yourself and exploring inner transformation.</p><p>Read at your own pace. Return to a practice whenever you need a little perspective.</p><a className="button button-primary" href={hirenBookUrl} target="_blank" rel="noopener noreferrer">Read the book <BookOpen size={16} /></a><span className="rp-book-format">Free PDF · Opens in a new tab</span></div></div></section>

    <section className="rp-section container" aria-labelledby="recommended-reading-title"><div className="rp-section-heading" data-page-reveal><div><span className="eyebrow">RECOMMENDED READING</span><h2 id="recommended-reading-title">Words that <em>stay with you.</em></h2></div><p>A reading list for the curious mind. Explore these books through your favourite bookshop or library.</p></div><div className="rp-reading-controls"><span>{recommendedBooks.length} books for your journey</span><label className="rp-search"><Search size={17} /><span className="rp-sr-only">Search books by title or author</span><input type="search" placeholder="Search title or author…" value={bookQuery} onChange={(event) => setBookQuery(event.target.value)} /></label></div><div className="rp-reading-grid" data-page-stagger>{books.map((book, index) => <article className="rp-reading-card" key={`${book.title}-${book.author}`}><span className="rp-reading-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{book.title}</h3>{book.subtitle && <p>{book.subtitle}</p>}<span>{book.author}</span></div><BookOpen size={17} strokeWidth={1.2} /></article>)}</div>{books.length === 0 && <p className="rp-book-empty" aria-live="polite">No books match “{bookQuery}”. Try another title or author.</p>}<div className="rp-reading-quote" data-page-reveal><Heart size={21} strokeWidth={1.2} /><blockquote>“The reading of all good books is like conversation with the finest people of the past centuries.”</blockquote><span>— René Descartes</span></div></section>
  </div>;
}
