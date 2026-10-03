export type ProgramPrice = {
  label: string;
  price: string;
  detail?: string;
};

export type Program = {
  slug: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  image: string;
  prices: ProgramPrice[];
  intro: string;
  includes: string[];
  heroImage?: string;
  heroImageAlt?: string;
};

const yoga = (name: string) => `/images/Yoga Continuous Line/SVG/${name}.svg`;

export const programs: Program[] = [
  {
    slug: "counselling-and-meditation",
    title: "Counselling & Meditation",
    category: "A space to be heard",
    duration: "Single session · 60–75 minutes",
    description: "A personal session for a specific concern, with counselling and meditation shaped around your needs.",
    image: yoga("Gomukhasana, Yoga, Meditation, Woman, Yoga pose, Continuous Line, Asana"),
    intro: "Sometimes, one thoughtful conversation is a place to begin. These personal live sessions bring together counselling, meditation and an understanding of your individual needs — whether you are exploring emotions, relationships, work, sleep or a parent-child concern.",
    includes: ["One-to-one live guidance", "A session designed around your concern", "Counselling, mindfulness and meditation"],
    prices: [{ label: "One personal session", price: "₹1,100", detail: "60–75 minutes per session" }],
  },
  {
    slug: "inner-reset-program",
    title: "Signature Inner Reset",
    category: "Our signature journey",
    duration: "12 weeks · 90 days",
    description: "A 12-week journey from conditioning to conscious creation. Train your mind. Recondition your body. Create a new life.",
    image: yoga("Lotus, Padmasana, Yoga, Yoga Pose, Woman, Continuous Line"),
    intro: "A guided inner journey to interrupt unconscious patterns, release emotional conditioning and embody a calmer, more empowered version of yourself. Awareness-based meditation and daily integration practices help you bring what you discover into everyday life.",
    includes: ["Weekly live sessions + recordings", "Journals and daily practice checklists", "30-day post-program integration plan"],
    prices: [{ label: "The complete 12-week journey", price: "₹12,000", detail: "3 months · live sessions, recordings, journals and 30 days of follow-up practices" }],
  },
  {
    slug: "monthly-meditation",
    title: "Live & Recorded Meditations",
    category: "Your practice, your pace",
    duration: "Monthly · 4, 8 or 12 live sessions",
    description: "Live guidance and a home practice of breathwork, affirmations, healing and meditation, with lifetime access to recordings.",
    image: yoga("Tree Pose, Balance, Yoga, Wellness, Yoga Pose, Woman, Continuous Line"),
    intro: "Build a rhythm that works for you. This monthly course combines personal live sessions with recorded meditations, breathwork, healing work and affirmations to practise at home. The recorded meditations remain available with lifetime access.",
    includes: ["Live sessions throughout the month", "Breathwork, affirmations and healing work", "Recorded meditations with lifetime access"],
    prices: [
      { label: "4 sessions + recordings", price: "₹2,500", detail: "Monthly · one live session each week" },
      { label: "8 sessions + recordings", price: "₹4,400", detail: "Monthly · two live sessions each week" },
      { label: "12 sessions + recordings", price: "₹6,000", detail: "Monthly · three live sessions each week" },
    ],
  },
  {
    slug: "life-coaching",
    title: "Life Coaching & Meditations",
    category: "Move towards your goals",
    duration: "Monthly · 4, 8 or 12 sessions",
    description: "Personal guidance, practical assessments and meditation to support you in working towards your desired goal.",
    image: yoga("Warrior Pose, Reverse Warrior, Yoga, Continuous Line, Woman, Yoga Pose, Wellness"),
    intro: "Your goals sit within the whole of your life. Begin with eight assessments that help us understand your habits, priorities and experiences. From these inputs, a meditation structure and journal are designed for you, with continued guidance and support.",
    includes: ["Eight initial assessments", "Personal meditation structure and journals", "Home practice, follow-up and support"],
    prices: [
      { label: "4 sessions a month", price: "₹3,500", detail: "Weekly once · journals, recordings, home practice and follow-up" },
      { label: "8 sessions a month", price: "₹6,000", detail: "Weekly twice · journals, recordings, home practice and follow-up" },
      { label: "12 sessions a month", price: "₹8,000", detail: "Weekly thrice · journals, recordings, home practice and follow-up" },
    ],
  },
  {
    slug: "relationship-counselling",
    title: "Relationship Counselling",
    category: "Connection & understanding",
    duration: "Monthly · 4 or 8 sessions",
    description: "A monthly course for marriage and break-up counselling, with healing practices, meditation and ongoing support.",
    image: yoga("Dancer, Yoga, Yoga Pose, Wellness, Stretch, Balance, Fitness"),
    intro: "Make space to understand what you are feeling and how you relate to one another. This monthly course is designed for marriage and break-up counselling. Both partners or one individual can attend, with healing and meditation woven into the process.",
    includes: ["Attend individually or with your partner", "Relevant journals and recorded sessions", "Breathwork, affirmations, follow-up and support"],
    prices: [
      { label: "4 sessions a month", price: "₹4,500", detail: "Weekly once · journals, recordings, home practice and follow-up" },
      { label: "8 sessions a month", price: "₹8,000", detail: "Weekly twice · journals, recordings, home practice and follow-up" },
    ],
  },
  {
    slug: "shadow-work",
    title: "Shadow Work",
    category: "Meet your whole self",
    duration: "6 weeks · 12 sessions",
    description: "Explore the hidden and unconscious parts of yourself, with space for greater self-awareness, compassion and authenticity.",
    image: yoga("Child Pose, Balasana, Yoga, Yoga Pose, Meditation, Wellness, Continuous Line"),
    intro: "Shadow work explores and integrates the hidden, suppressed or unconscious parts of yourself. With awareness and compassion, you can begin to understand old wounds, recognise recurring patterns and make room for a fuller, more authentic way of living.",
    includes: ["12 guided sessions over six weeks", "Home assignments and journals", "Healing, breathwork and meditations"],
    prices: [{ label: "The complete six-week course", price: "₹25,000", detail: "12 sessions with home assignments, journals, healing, breathwork and meditations" }],
  },
  {
    slug: "kids-meditation",
    title: "Kids Meditation",
    category: "Little minds, big possibilities",
    duration: "Ages 7–14 · 7 days",
    description: "Meditate with fun. A self-awareness course where children explore emotions, habits, gratitude and the confidence to be themselves.",
    image: yoga("Triangle Pose, Yoga, Yoga Pose, Woman, Stretch, Exercise, Trikonasana"),
    heroImage: "/images/inner-revealing/kids-meditation-session.jpg",
    heroImageAlt: "Children taking part in meditation and fun activities at Inner Revealing",
    intro: "A little self-awareness can grow into a lifelong practice. Through one-hour sessions over seven days, children aged 7–14 explore self-esteem, emotions, habits and gratitude. Days and timings are fixed by appointment.",
    includes: ["Seven one-hour sessions", "Ages 7–14 years", "Days and timings by appointment"],
    prices: [
      { label: "Children’s self-awareness course", price: "₹3,600", detail: "7 days · one-hour sessions · ages 7–14" },
      { label: "Recorded meditation for children", price: "₹149", detail: "16:20 minutes · ages 7–14" },
      { label: "Night meditation for parents", price: "₹199", detail: "14:43 minutes · parents practise for their children" },
    ],
  },
  {
    slug: "group-meditation",
    title: "Group Meditation",
    category: "Stillness, shared",
    duration: "Every Thursday & Sunday",
    description: "Join a community of meditators to share, uplift and enrich one another through a practice of peace, calm, focus and happiness.",
    image: yoga("Lotus, Padmasana, Yoga, Yoga Pose, Woman, Continuous Line"),
    heroImage: "/images/inner-revealing/community-session.jpg",
    heroImageAlt: "A guided Inner Revealing meditation session with a community group",
    intro: "Come together with a community of meditators, where we share, uplift and enrich each other. These group sessions at the centre invite general peace, calm, focus and happiness, with the encouragement of a shared practice.",
    includes: ["Group sessions at the centre", "Thursday evening · 7–8 pm", "Sunday morning · 8–9 am"],
    prices: [
      { label: "4 sessions per month", price: "₹500", detail: "Monthly group meditation at the centre" },
      { label: "8 sessions per month", price: "₹1,000", detail: "Monthly group meditation at the centre" },
    ],
  },
  {
    slug: "meditation-coach-program",
    title: "Meditation Coach Program",
    category: "Share the gift of meditation",
    duration: "3 months · 12 modules",
    description: "Learn to guide meditation sessions, start your own centre or bring meditation into your yoga, therapy or counselling practice.",
    image: yoga("Bridge Pose, Yoga, Yoga Pose, Exercise, Workout, Fitness, Woman"),
    intro: "Deepen your own practice and learn to share it with others. This three-month program is divided into twelve modules, with twelve sessions per month, three times a week. Explore the foundations of meditation, practical facilitation and a range of guided processes.",
    includes: ["12 modules over three months", "12 sessions per month · thrice a week", "Materials, music and theory", "Certificate of Completion + one month of initial support"],
    prices: [{ label: "The complete coach program", price: "₹25,000", detail: "3 months · all materials, music, theory, Certificate of Completion and one month of initial support" }],
  },
];

export const getProgram = (slug: string) => programs.find((program) => program.slug === slug);

export const serviceCategories = [
  "Meditation Classes", "Yoga & Meditation Classes", "Online Meditation Classes",
  "Meditation Classes at Home", "Meditation Classes for Children", "Advanced Meditation Classes",
  "Mantra Meditation Classes", "Online Mantra Meditation Classes", "Buddhist Meditation Classes",
  "Online Zen Meditation Classes", "Meditation Workshops", "Counselling Services",
  "Psychological Counselling Services", "Emotional Counselling Services", "Stress Counselling Services",
  "Depression Counselling", "Parent Child Counselling Services", "Holistic Healing", "Access Bar Facilitator",
];
