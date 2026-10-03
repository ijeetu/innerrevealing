export type Photo = {
  src: string;
  title: string;
  caption: string;
  category: "Schools & kids" | "Community" | "In nature";
};
export type Video = { id: string; title: string; caption: string; image?: string };

const image = (name: string) => `/images/inner-revealing/${name}`;

export const sessionPhotos: Photo[] = [
  { src: image("south-city-school-frame-1.jpg"), title: "South City International School", caption: "Yoga and meditation for teachers and staff · 13 September 2025", category: "Schools & kids" },
  { src: image("community-session.jpg"), title: "Group session for community", caption: "Meditation together in a housing complex.", category: "Community" },
  { src: image("meditation-in-nature.jpg"), title: "Meditation and fun amidst nature", caption: "Awareness activities and meditation in the park.", category: "In nature" },
  { src: image("pyramid-meditation.jpg"), title: "Meditation session in a pyramid", caption: "Group meditation and awareness activities.", category: "In nature" },
  { src: image("nature-movement.jpg"), title: "Dance like a tree!", caption: "Movement, beautiful surroundings and wonderful group energy.", category: "In nature" },
  { src: image("kids-meditation-session.jpg"), title: "Meditation sessions for kids", caption: "Meditation with fun activities for children.", category: "Schools & kids" },
  { src: image("school-children-session.jpg"), title: "Meditation session in school", caption: "Motivational talks, meditation, games and dance.", category: "Schools & kids" },
  { src: image("buddha-temple-session.jpg"), title: "Group meditation in Buddha Temple", caption: "Meditation at the Japanese Buddha Temple, by the lake and in the pyramid.", category: "In nature" },
  { src: image("more-session-1.jpg"), title: "Our meditation community", caption: "Shared moments with the Inner Revealing family.", category: "Community" },
  { src: image("more-session-2.jpg"), title: "Together after a group session", caption: "Connection and celebration through a shared practice.", category: "Community" },
  { src: image("more-session-3.jpg"), title: "Celebrating amidst nature", caption: "Let your inner flower forever bloom!", category: "In nature" },
];

export const activityVideos: Video[] = [
  { id: "y3FTy0xlMdM", title: "South City International School", caption: "Yoga and meditation for teachers and staff · 13 September 2025", image: image("south-city-school.jpg") },
  { id: "bzcNFSBD93U", title: "Group session in a community", caption: "Practising together, growing together." },
  { id: "zJBsf00NSho", title: "Session at Rotary Club, Kolkata", caption: "A glimpse of our group session." },
  { id: "k5nWtUbXL0o", title: "Fun yoga, games and meditation for kids", caption: "Learning through play and movement." },
  { id: "fQJZCGoVAe0", title: "Yoga and meditation in a housing complex", caption: "Bringing the community together." },
  { id: "m82busxRWXU", title: "What should we believe in?", caption: "Group session in a housing society." },
  { id: "jJrAkSmxObU", title: "Trance dance", caption: "Be the dance… forget the dancer." },
  { id: "nFtDBSEOpsY", title: "Celebration!", caption: "A feeling of oneness." },
  { id: "u0fMG90gco0", title: "All is well — with school children!", caption: "Inner joy after meditation." },
  { id: "t3flyTaY_3Y", title: "Spiritual camp for kids", caption: "Fun activities, games and lots of learning." },
  { id: "ligEtpFk4Yg", title: "International Yoga Day celebration 2023", caption: "Celebrating yoga and meditation together." },
  { id: "sSBv0lO7ndw", title: "Sessions amidst nature", caption: "Awareness activities and meditations in the outdoors." },
];

// Video IDs and titles are taken from the centre's existing feedback pages.
// The participants' experiences are their personal accounts.
export const feedbackVideos: Video[] = [
  { id: "rhEKjj4r6Jg", title: "Leg and Back Pain Completely Gone in One Session", caption: "A participant shares her personal experience.", image: image("testimonial-pain.jpg") },
  { id: "XxUZ7zgmSs0", title: "Wonderful experience of Heart Chakra Meditation", caption: "Online group session", image: image("testimonial-heart-chakra.jpg") },
  { id: "C9sgFfTAv2w", title: "Wonderful feedback", caption: "Morning 5 am group session" },
  { id: "gcPzHku3TL0", title: "Super experience of meditation", caption: "Oneness Meditation" },
  { id: "glm5dz7Z4Ck", title: "Feedback of a participant", caption: "Om Meditation" },
  { id: "RpHUBt3Czqg", title: "Feedback of One with Krishna Meditation", caption: "Oneness with the divine" },
  { id: "UG3QmAZCI2Y", title: "Krishna Consciousness Meditation", caption: "Feedback from the live session · 8 July 2022" },
  { id: "H3ML_jUi3Dk", title: "Deep Anapanasati and Healing Meditation", caption: "A participant's experience of a group online session" },
  { id: "JDhSMUBBL60", title: "Women's Day special session", caption: "Processes, dance and Om Mantra Meditation · 8 March 2021" },
  { id: "3deIX8kvr8Y", title: "Feedback of live online meditations", caption: "Online Zoom group meditation session" },
  { id: "hi-O7P_CN9M", title: "Gratifying feedback from a participant", caption: "Here and Now Meditation" },
  { id: "XBQFtl1micM", title: "Conscious Creation — first batch", caption: "The 15-day course by Rupa Jhunjhunwala" },
  { id: "5R3bqxR2i_Y", title: "Deep energizing experience of meditation", caption: "Bring back joy and happiness in your life." },
  { id: "R6DN-zDVkwU", title: "Her first group meditation session", caption: "A participant shares her first experience." },
  { id: "kUaNMJtlH80", title: "Meditation experience of kids", caption: "By Rupa Jhunjhunwala", image: image("testimonial-kids.jpg") },
  { id: "2uuV0Hc6l0w", title: "Meditation experience of children", caption: "Feeling light · By Rupa Jhunjhunwala" },
  { id: "Looj4uYWlLc", title: "Thank you for joining our sessions", caption: "Feedback from the participants" },
  { id: "i1qTkx6gpgI", title: "Deep intense experience", caption: "A participant shares her experience." },
];

export const certificates = [
  { src: image("certificate-belief-clearing.jpg"), title: "Certified Belief Clearing Practitioner", caption: "Global Sciences Foundation", detail: "Psychological counselling" },
  { src: image("certificate-school-appreciation.jpg"), title: "Certificate of Appreciation", caption: "Haradhan Addhya Memorial School", detail: "Conducting counselling and meditation sessions for parents and children at the school." },
  { src: image("certificate-ye-mera-india.jpg"), title: "Certificate of Appreciation", caption: "Ye Mera India", detail: "Leadership and mentoring in meditations" },
  { src: image("certificate-osho.jpg"), title: "OSHO Meditation: In-Depth & Facilitating Certification", caption: "OSHO Meditation Resort, Trichy, India", detail: "To facilitate Osho Meditations" },
];
