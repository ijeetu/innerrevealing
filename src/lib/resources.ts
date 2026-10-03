export type MeditationCategory = "Calm & clarity" | "Self love" | "Sleep" | "Energy" | "Children & parents" | "Inner work";

export type RecordedMeditation = {
  title: string;
  duration?: string;
  description: string;
  tag: string;
  category: MeditationCategory;
  price?: number;
  language?: string;
};

export const meditationCategories: MeditationCategory[] = ["Calm & clarity", "Self love", "Sleep", "Energy", "Children & parents", "Inner work"];

export const recordedMeditations: RecordedMeditation[] = [
  { title: "A 10 Minute Powerful Morning Meditation", duration: "10 mins", description: "Begin your day with Anapanasati, the breath-awareness meditation taught by Gautam Buddha. Watch your breath and make space for stillness.", tag: "Get energized", category: "Energy", price: 49 },
  { title: "Self Love Meditation", description: "A practice in becoming your own friend. Explore love, acceptance and compassion for yourself, and carry that gentleness into your relationships and daily life.", tag: "Uplift yourself", category: "Self love", price: 199 },
  { title: "Meditation for Children", duration: "16:20 mins", description: "Fun processes for children aged 7–14 to explore focus, concentration, awareness and mindfulness.", tag: "Enjoy and give your 100%", category: "Children & parents", price: 149 },
  { title: "Night Meditation for Parents to Do for Their Children", duration: "14:43 mins", description: "An evening practice for parents to connect with their care, intentions and hopes for their children.", tag: "For parents", category: "Children & parents", price: 199 },
  { title: "Death Meditation", duration: "43:15 mins", description: "An Osho-inspired inner journey in three stages: floating in a river, visualising a funeral pyre, and accepting what is happening within and around you. Ends with a bhajan and blessings.", tag: "A new you", category: "Inner work" },
  { title: "Short Ho’oponopono Healing Meditation", duration: "7:51 mins", description: "A short Ho’oponopono practice to pause when you feel stuck or uncertain, and return to reflection, forgiveness and clarity.", tag: "Clean and positive", category: "Inner work" },
  { title: "Ho’oponopono Meditation", duration: "15:44 mins", description: "A guided Ho’oponopono healing practice with space for forgiveness and inner reflection.", tag: "Heal yourself", category: "Inner work" },
  { title: "Beautiful Meditation for Sleep", duration: "10:40 mins", description: "A gentle night meditation to unwind and settle into a feeling of peace before sleep.", tag: "Sleep like a baby", category: "Sleep" },
  { title: "Being Filled With Love Meditation", duration: "8:33 mins", description: "A guided practice of filling yourself with love, warmth and a sense of connection.", tag: "Heal through love", category: "Self love", language: "Hindi" },
  { title: "Self Acceptance, Self Forgiveness & Self Love", duration: "11:23 mins", description: "Make space for acceptance, forgiveness and love. A short practice to bring a kinder attitude to yourself and the world around you.", tag: "Positive vibes", category: "Self love" },
  { title: "Instantly Calm Your Mind. Think Better. Relieve Your Stress", duration: "40:01 mins", description: "A guided meditation you can practise at any time of day to pause, relax and reconnect with yourself.", tag: "Calm yourself", category: "Calm & clarity" },
  { title: "Awareness Activation of Seven Chakras", duration: "12:08 mins", description: "Bring your attention to the seven chakras through a guided awareness practice.", tag: "Refresh yourself", category: "Energy" },
  { title: "Feel Yourself as Divine", duration: "7:03 mins", description: "A short meditation to explore inner connection and a renewed sense of presence.", tag: "Get revitalized", category: "Energy" },
  { title: "Healing Meditation With the Spirit Within", duration: "58:07 mins", description: "A deep guided meditation exploring the spirit within through stillness and reflection.", tag: "Heal with the spirit within", category: "Inner work" },
  { title: "Deep Healing Meditation — OCARL Method", duration: "48:43 mins", description: "A deep relaxation practice that brings gentle attention to each part of your body.", tag: "Body healing", category: "Inner work" },
  { title: "Divine Light Healing Night Meditation", duration: "51:22 mins", description: "An extended night meditation with divine-light visualisation and space for your intentions.", tag: "Deep night meditation", category: "Sleep" },
  { title: "Night Healing and Manifesting Meditation", duration: "26:33 mins", description: "Close your day with a guided night practice for reflection, inner connection and intention setting.", tag: "Heal and manifest", category: "Sleep" },
  { title: "Start Your Day With Laughter", description: "Explore Osho’s morning laughter technique and bring a playful beginning to your day.", tag: "Just laugh", category: "Energy" },
];

export function resourceEnquiry(subject: string) {
  return `https://wa.me/919836147999?text=${encodeURIComponent(`Hello Inner Revealing, I would like to know about ${subject}. Please share the details and access instructions.`)}`;
}

export type VideoCategory = "Meditation" | "Short videos" | "Motivation" | "Yoga" | "Live sessions";
export type ResourceVideo = { title: string; category: VideoCategory; videoId?: string; href?: string; duration?: string; description: string };
export const videoCategories: VideoCategory[] = ["Meditation", "Short videos", "Motivation", "Yoga", "Live sessions"];

// Video IDs are the published links on Inner Revealing's existing resource pages.
export const resourceVideos: ResourceVideo[] = [
  { title: "Right Way of Breathing", category: "Meditation", videoId: "-fl6EfKg0pE", description: "Return to the basics of a comfortable, conscious breath." },
  { title: "Short Meditation for Peace — Go Within", category: "Meditation", videoId: "1srHxQDxesI", duration: "13:08 mins", description: "Make a little space in your day to turn your attention inward." },
  { title: "Anapanasati with Heart Chakra Activation", category: "Meditation", videoId: "kMl2BKYzqO8", duration: "31:29 mins", description: "Explore breath awareness alongside heart chakra activation." },
  { title: "Quick Effective Techniques for Peace of Mind", category: "Meditation", videoId: "AkOjOAeNJ64", description: "Simple techniques for taking a mindful pause in a busy day." },
  { title: "Be Still. Calm Your Mind", category: "Meditation", videoId: "uXhdOlFWKTQ", duration: "11:24 mins", description: "A short guided meditation for settling the mind’s chatter." },
  { title: "Relax Your Mind. Think Better. Relieve Your Stress", category: "Meditation", videoId: "7LldUVRGLyI", duration: "40:01 mins", description: "A live session from LIVENLIFE 2021, Ibis Hotel Rajarhat, Kolkata." },
  { title: "Walking Meditation by Lao Tzu", category: "Meditation", videoId: "dTmjrjMIqSQ", description: "Bring awareness to movement with this walking practice." },
  { title: "Anapanasati Meditation in English", category: "Meditation", videoId: "M7l51Uwbzr0", description: "Simply watch your breath going in and coming out." },
  { title: "Relax Your Muscles", category: "Meditation", videoId: "5XI-93UtyJ8", duration: "5:31 mins", description: "A brief guided practice to release tension and reconnect with your body." },
  { title: "Being Filled With Love", category: "Meditation", videoId: "3-l0GRQMUbg", duration: "8:33 mins", description: "A guided visualisation centred on love and connection." },
  { title: "Self Acceptance, Self Forgiveness & Self Love", category: "Meditation", videoId: "HqkphVLzEE0", duration: "11:33 mins", description: "A short meditation in Hindi to explore kindness towards yourself." },
  { title: "Anapanasati Meditation with Processes", category: "Meditation", videoId: "xHUQowcR1LI", duration: "57:22 mins", description: "A longer guided journey in breath awareness." },
  { title: "Simple Exercises to Calm Body, Mind & Breath", category: "Meditation", videoId: "qZwI9QwvLqw", description: "Explore simple breathing exercises and mindful body awareness." },
  { title: "Humming Meditation Technique", category: "Meditation", videoId: "snD1saYWmmI", description: "Explore sound, vibration and awareness through gentle humming." },
  { title: "Walking Meditation by Lao Tzu", category: "Short videos", videoId: "dTmjrjMIqSQ", description: "A mindful movement practice for your day." },
  { title: "Want More Money in Your Life?", category: "Short videos", videoId: "R4YQBVxWfdA", description: "Reflect on the attitude you bring to handling money." },
  { title: "A Breathwork Pause for a Rough Day", category: "Short videos", href: "https://vimeo.com/728520853", description: "Take a pause and explore a simple breathwork practice." },
  { title: "Four Things to Be Mindful of While Eating", category: "Short videos", href: "https://vimeo.com/725931827", description: "Bring a little more awareness to your next meal." },
  { title: "Start Your Day With Laughter", category: "Short videos", videoId: "ucOCO0GKv5s", description: "Osho’s playful morning laughter technique." },
  { title: "10 Practices for Well-being", category: "Short videos", videoId: "pJVqAnaATqs", description: "Reflections on everyday habits, awareness and well-being." },
  { title: "How to Be Joyful, Loving & With the Divine", category: "Motivation", videoId: "xjQre9WXMoM", description: "Reflections on Osho’s teachings about joy, love and divine connection." },
  { title: "Compassion, Understanding Anger & How to Love", category: "Motivation", videoId: "hwBF4oXzK1Q", description: "Explore compassion and a spiritual perspective on our emotions." },
  { title: "Osho Keys — What Is Compassion?", category: "Motivation", videoId: "pAxZ9AXaq6s", description: "Reflections on friendship, compassion and relationships." },
  { title: "Being Friendly, Loving & Open", category: "Motivation", videoId: "mCMp49OLc1A", description: "Spiritual reflections on how we connect with the people around us." },
  { title: "International Yoga Day Celebration 2023", category: "Yoga", videoId: "ligEtpFk4Yg", description: "A glimpse of our community coming together through yoga." },
  { title: "Power Yoga for Kids", category: "Yoga", videoId: "nKW3rFJGpCY", description: "Movement, energy and yoga for young learners." },
  { title: "Our Youngest Student of Kids Yoga Class", category: "Yoga", videoId: "P112ssv2Mtg", description: "A small moment of practice from our children’s yoga class." },
  { title: "Fun Yoga, Games & Meditation for Kids", category: "Yoga", videoId: "k5nWtUbXL0o", description: "Play, movement and meditation with the children at Inner Revealing." },
  { title: "Self Acceptance & Oneness With Existence", category: "Live sessions", videoId: "zdXTah5wcUg", description: "A live Anapanasati dhyan session with Hiren Kapadia." },
  { title: "Surrender Meditation", category: "Live sessions", videoId: "i5NUufaQbWo", description: "Recorded on 16 July 2020. Explore letting go through a guided meditation." },
  { title: "Experience Godliness Meditation", category: "Live sessions", videoId: "X6weEhQX6XU", description: "Recorded on 16 August 2020. A practice in expansion and connection." },
  { title: "Atisha Heart Meditation", category: "Live sessions", videoId: "ns_Ik8zTRJg", description: "Recorded on 26 June 2020. A heart-centred meditation." },
  { title: "Rise Energy Up Your Spine Meditation", category: "Live sessions", videoId: "vtn7pHb6DIE", description: "A guided journey of awareness from root to crown chakra." },
  { title: "Oneness Meditation", category: "Live sessions", videoId: "sP0PvBkBSFE", description: "Explore a sense of shared connection with everyone and everything around you." },
];

export const breathingPractices = [
  {
    name: "Sheetali Pranayama", subtitle: "A cooling evening practice", time: "2–3 minutes",
    introduction: "A slow breathing practice traditionally used to invite a sense of coolness and quiet before sitting in meditation.",
    steps: ["Sit comfortably with your spine upright and let your body relax.", "Roll your tongue into a tube, if comfortable, and inhale slowly through it. If you cannot roll your tongue, try Sheetkari instead.", "Close your mouth and exhale slowly through your nose. This is one round.", "Practise 7–10 gentle rounds, then sit quietly for a few moments."],
    caution: "Avoid if you have asthma, a cough or cold, sinus congestion or low blood pressure. Skip the practice if the weather is cold or your body already feels chilled.",
  },
  {
    name: "Sheetkari Pranayama", subtitle: "Coolness through a gentle breath", time: "2–3 minutes",
    introduction: "An alternative to Sheetali for those who cannot roll their tongue, followed by a quiet pause.",
    steps: ["Sit comfortably with your spine upright.", "Gently bring your upper and lower teeth together and part your lips slightly.", "Inhale slowly through the gaps in your teeth with a soft ‘ssss’ sound.", "Close your mouth and exhale slowly through your nose. Repeat for 7–10 easy rounds."],
    caution: "Avoid in cold weather, or with a cold, cough, sinus congestion, asthma or low blood pressure. Wait 1–2 hours after meals.",
  },
  {
    name: "Left Nostril Breathing", subtitle: "A simple pause before stillness", time: "3–5 minutes",
    introduction: "Also called left–left breathing or Ida activation. A gentle practice to prepare for an evening meditation.",
    steps: ["Sit comfortably and relax your shoulders.", "Close your right nostril gently with your thumb.", "Inhale softly through your left nostril.", "Exhale through the same nostril. Continue at a comfortable pace for 3–5 minutes."],
    caution: "Keep the breath natural and unforced. Stop and return to ordinary breathing if you feel uncomfortable or dizzy.",
  },
  {
    name: "Anulom Vilom Pranayama", subtitle: "Alternate nostril breathing", time: "At a comfortable pace",
    introduction: "Use a smooth, gentle rhythm to bring your attention back to the breath, one cycle at a time.",
    steps: ["Close your right nostril with your thumb and gently inhale through the left nostril.", "Close the left nostril with your ring finger and slowly exhale through the right.", "Keep the left nostril closed and gently inhale through the right.", "Open the left nostril and slowly exhale through it. This completes one cycle."],
    caution: "Do not force the breath. Keep it gentle and smooth; avoid fast or forcefully deep breathing.",
  },
  {
    name: "Gentle Humming", subtitle: "A Bhramari-like practice", time: "A few gentle rounds",
    introduction: "Let a soft humming sound become the focus of your attention, noticing its vibration and the stillness that follows.",
    steps: ["Sit comfortably and let your breathing settle.", "Take an easy breath in through your nose.", "As you breathe out, make a soft, comfortable humming sound without pushing the breath.", "Pause and breathe normally between rounds. Keep the sound gentle."],
    caution: "Avoid with an active ear infection. Practise very lightly or skip with a severe sinus infection. If you feel dizzy, stop and return to ordinary breathing.",
  },
];

export const freeCourseTopics = [
  { title: "Increase Your Mind Power", tag: "Mind power · Love and joy", videoId: "I2ZaKW676Pw", format: "Theory, methods & breathing technique" },
  { title: "Understanding Fear", tag: "Overcome fear · Be fearless", videoId: "SZWU4Bfkjck", format: "Theory, methods & meditation" },
  { title: "Honouring and Appreciating", tag: "Honour · Appreciate · Thank", videoId: "gP-Aez_W_Rw", format: "Theory, methods & meditation" },
  { title: "Unlearn Your Way to Wisdom", tag: "Unlearn", videoId: "sjh4EXFi--g", format: "Theory, methods & meditation" },
  { title: "Taking Responsibility", tag: "We create our own reality", videoId: "4MWjA20L0II", format: "Theory, methods & meditation" },
  { title: "Play Your Part", tag: "Love · Accept · Appreciate", videoId: "och5F-Zi-CM", format: "Theory, methods & meditation" },
  { title: "Shine No Matter What", tag: "Keep shining", videoId: "tGBaKH51Un8", format: "Theory, methods & meditation" },
  { title: "Healthy Relationships", tag: "Love · Accept · Appreciate", videoId: "m3LsRGE1LUI", format: "Theory, methods & meditation" },
  { title: "Power of Detachment, Moving On & Let Go", tag: "Be watchful", videoId: "6CuJFxpkBnc", format: "Theory, methods & meditation" },
];

export const hirenBookUrl = "/resources/remove-blockages-thrive-in-life-hiren-kapadia.pdf";

export const recommendedBooks = [
  { title: "Effortless Living", subtitle: "Wu-Wei and the Spontaneous State of Natural Harmony", author: "Jason Gregory" },
  { title: "The Words at the Threshold", subtitle: "What We Say When We Are Nearing Death", author: "Lisa Smartt" },
  { title: "Living in the Flow", subtitle: "The Science of Synchronicity and How Your Choices Shape Your World", author: "Sky Nelson-Isaacs" },
  { title: "The Art of Dying", subtitle: "Vipassana Research Publications", author: "S. N. Goenka" },
  { title: "Awakened Imagination", subtitle: "", author: "Neville Goddard" },
  { title: "At Your Command", subtitle: "", author: "Neville Goddard" },
  { title: "The Surrender Experiment", subtitle: "", author: "Michael A. Singer" },
  { title: "The Power of Awareness", subtitle: "", author: "Neville Goddard" },
  { title: "Prayer: The Art of Believing", subtitle: "", author: "Neville Goddard" },
  { title: "I’ve Decided to Live 120 Years", subtitle: "The Ancient Secret to Longevity, Vitality and Life Transformation", author: "Ilchi Lee" },
  { title: "The Untold Story of Sita", subtitle: "An Empowering Tale for Our Time", author: "Dena Merriam" },
  { title: "The Code of the Extraordinary Mind", subtitle: "10 Unconventional Laws to Redefine Your Life & Succeed on Your Own Terms", author: "Vishen Lakhiani" },
  { title: "How to Stop Worrying and Start Living", subtitle: "", author: "Dale Carnegie" },
  { title: "What Would Buddha Say", subtitle: "1501 Right-Speech Teachings for Communicating Mindfully", author: "Barbara Ann Kipfer" },
  { title: "Die Empty", subtitle: "Unleash Your Best Work Every Day", author: "Todd Henry" },
  { title: "The Biology of Belief", subtitle: "Unleashing the Power of Consciousness, Matter and Miracles", author: "Bruce H. Lipton, Ph.D." },
  { title: "Ikigai", subtitle: "The Japanese Secret to a Long and Happy Life", author: "Héctor García and Francesc Miralles" },
  { title: "The Hindu-Yogi Science of Breath", subtitle: "A Manual of the Oriental Breathing", author: "Yogi Ramacharaka" },
  { title: "Pranayama", subtitle: "The Vedic Science of Breath", author: "Advait" },
  { title: "Kundalini", subtitle: "An Untold Story", author: "Om Swami" },
  { title: "Kundalini", subtitle: "The Evolutionary Energy in Man", author: "Gopi Krishna" },
];
