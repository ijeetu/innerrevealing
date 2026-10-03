import type { NextConfig } from "next";

const legacyPages: Record<string, string[]> = {
  "/": ["meditation-description", "meditation-intro-and-description"],
  "/about": ["about-hiren", "about-rup-jhunjhunwala", "certificates-and-awards"],
  "/services": ["fee-structure", "sessions-options"],
  "/services/counselling-and-meditation": ["fees-single-session", "live-session-fees"],
  "/services/inner-reset-program": ["inner-reset-program", "inner-reset-meditations"],
  "/services/monthly-meditation": ["fee-monthly-meditation", "package-fees", "30-mins-fees"],
  "/services/life-coaching": ["fees-life-coaching"],
  "/services/relationship-counselling": ["fee-relationship-counselling", "edit-relationship-counselling"],
  "/services/shadow-work": ["fee-shadow-work"],
  "/services/kids-meditation": ["children-self-awareness-course", "fees-children-meditation", "shaurya-meditation", "children-meditations", "meditation-for-parents"],
  "/services/group-meditation": ["group-meditation-page", "southern-avenue", "southern-avenue-group-meditation"],
  "/services/meditation-coach-program": ["meditation-coach-program"],
  "/recorded-meditations": ["all-recorded-sessions", "self-love-meditation-intro", "death-meditation", "short-hooponopono-healing-meditation", "beautiful-meditation-for-sleep", "being-filled-with-love-hindi-833-mins", "self-accpetance-self-forgiveness-self", "anapanasati-meditation-in-english-10-min", "evening-meditation", "5am-meditations", "intro-three-sleep-meditations", "osho-morning-laughter-technique", "bb-meditations"],
  "/resources": ["free-meditation-videos", "short-videos", "expect-miracles-video", "motivational-videos", "yoga-videos", "live-zoom-meditations", "night-pranayam-details", "remove-blockages-thrive-in-life", "book-by-hiren-kapadia", "books", "topic-1", "topic-2", "topic-3", "topic-4", "topic-5", "topic-6", "topic-7", "topic-8", "topic-9"],
  "/gallery": ["photos-of-sessions", "videos-of-our-activities", "some-more-pics"],
  "/testimonials": ["feedback-videos", "feedback-testimonials"],
  "/contact": ["demo-session-page", "book-your-free-session", "register-for-meditation", "one-on-one-live-session-registration"],
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return Object.entries(legacyPages).flatMap(([destination, paths]) =>
      paths.map((path) => ({ source: `/${path}/:legacy*`, destination, permanent: true })),
    );
  },
};

export default nextConfig;
