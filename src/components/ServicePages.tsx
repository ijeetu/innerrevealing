import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Clock3, Heart, Moon, Sparkles, Sun, Wind } from "lucide-react";
import { PageCTA, PageHero } from "@/components/PageHero";
import { programs, serviceCategories, type Program } from "@/lib/programs";
import "./services.css";

const contactFor = (slug: string) => `/contact?interest=${encodeURIComponent(slug)}`;

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: string }) {
  return <div className="svc-section-heading" data-page-reveal>
    <span className="eyebrow"><span className="eyebrow-line" />{eyebrow}</span>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>;
}

function CheckList({ items }: { items: string[] }) {
  return <ul className="svc-check-list">{items.map((item) => <li key={item}><Check size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul>;
}

export function ServicesOverview() {
  return <>
    <PageHero
      eyebrow="SERVICES & PROGRAMS"
      title={<>A practice for<br /><em>every chapter.</em></>}
      description="From a single conversation to a deeper journey within, find guidance that meets you where you are. Explore personal sessions, meditation courses and a community to grow with."
      image={programs[1].image}
      imageAlt=""
      note="AT THE CENTRE · ONLINE"
    />
    <section className="svc-demo-section" aria-labelledby="svc-demo-heading">
      <div className="container">
        <div className="svc-demo-banner" data-page-reveal>
          <div className="svc-demo-copy">
            <span className="eyebrow">BEGIN WITH A CONVERSATION</span>
            <h2 id="svc-demo-heading">Your first step<br />is a <em>free demo.</em></h2>
            <p>At the centre or online, we take time to understand your needs and help you choose a course that suits you.</p>
            <Link className="button button-primary" href="/contact?interest=free-demo">Book your free demo</Link>
            <div className="svc-demo-formats"><span>At our Kolkata centre</span><span>Online, wherever you are</span></div>
          </div>
          <div className="svc-demo-visual">
            <Image src="/images/generated/free-demo-conversation.webp" alt="" fill sizes="(max-width: 760px) 90vw, (max-width: 1440px) 44vw, 640px" />
            <span className="svc-demo-photo-note">A little conversation.<br /><strong>A new beginning.</strong></span>
          </div>
        </div>
      </div>
    </section>
    <section className="svc-section" id="programs">
      <div className="container">
        <SectionHeading eyebrow="FIND YOUR PATH" title={<>Small beginnings.<br /><em>Meaningful possibilities.</em></>} description="Choose the support, pace and kind of practice that feels right for you." />
        <div className="svc-program-grid" data-page-stagger>
          {programs.map((program, index) => <Link className={`svc-program-card ${program.slug === "inner-reset-program" ? "svc-program-featured" : ""}`} href={`/services/${program.slug}`} key={program.slug}>
            <div className="svc-program-card-top"><span>{program.slug === "inner-reset-program" ? "SIGNATURE PROGRAM" : program.duration}</span><span className="svc-card-number">{String(index + 1).padStart(2, "0")}</span></div>
            <Image className="svc-program-art" src={program.image} alt="" width={150} height={150} />
            <span className="svc-card-eyebrow">{program.category}</span>
            <h3>{program.title}</h3><p>{program.description}</p>
            <span className="svc-card-link">Explore the program <ArrowUpRight size={18} aria-hidden="true" /></span>
          </Link>)}
        </div>
        <div className="svc-recorded-banner" data-page-reveal>
          <div><span className="eyebrow">STILLNESS, ANYTIME</span><h3>Prefer to practise at your own pace?</h3><p>Explore recorded meditations for different needs, with lifetime access.</p></div>
          <Link className="text-link" href="/recorded-meditations">Browse recorded meditations <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
    <section className="svc-section svc-soft svc-category-section">
      <div className="container">
        <SectionHeading eyebrow="A HOLISTIC APPROACH" title={<>Many ways to<br /><em>come back to yourself.</em></>} description="Our services cover meditation, counselling and holistic practices for adults, children and families." />
        <ul className="svc-service-tags" data-page-reveal>{serviceCategories.map((category) => <li key={category}>{category}</li>)}</ul>
      </div>
    </section>
    <PageCTA />
  </>;
}

function ProgramIntroduction({ program }: { program: Program }) {
  return <section className="svc-section svc-introduction">
    <div className="container svc-intro-grid">
      <div data-page-reveal><span className="eyebrow"><span className="eyebrow-line" />A LITTLE MORE ABOUT THE JOURNEY</span><h2>Meet yourself with<br /><em>fresh awareness.</em></h2><p>{program.intro}</p><Link className="text-link" href={contactFor(program.slug)}>Discuss this program <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      <aside className="svc-includes" data-page-reveal><span className="eyebrow">AT A GLANCE</span><span className="svc-includes-duration"><Clock3 size={17} strokeWidth={1.5} aria-hidden="true" />{program.duration}</span><CheckList items={program.includes} /><Link className="button button-primary" href={contactFor(program.slug)}>Book a free demo <ArrowUpRight size={17} aria-hidden="true" /></Link><p>Explore your needs at the centre or online.</p></aside>
    </div>
  </section>;
}

const counsellingAreas = [
  { title: "Emotional & mental health", items: ["Anxiety, stress or panic", "Sadness and low motivation", "Anger management", "Grief and loss", "Trauma and PTSD concerns"] },
  { title: "Self-understanding & growth", items: ["Self-esteem and confidence", "Personal and cultural identity", "Values, life purpose and direction", "Recognising unhealthy patterns"] },
  { title: "Relationships & connection", items: ["Family and parent-child concerns", "Marriage and couple issues", "Communication and trust", "Jealousy or intimacy concerns", "Workplace relationships"] },
  { title: "Habits & everyday life", items: ["Addictions and recurring habits", "Eating habits and body image", "Sleep issues", "Time management and procrastination", "Work-life balance"] },
  { title: "Change & life transitions", items: ["Career changes and job stress", "Moving or a new environment", "Breakups and divorce", "Adjusting to illness or disability", "Retirement and ageing concerns"] },
  { title: "Coping & practical skills", items: ["Stress-management techniques", "Relaxation, grounding and mindfulness", "Problem-solving and decisions", "Conflict resolution", "Building resilience"] },
];

function CounsellingContent() {
  return <section className="svc-section svc-soft"><div className="container">
    <SectionHeading eyebrow="SPACE FOR WHAT IS ON YOUR MIND" title={<>You don’t have to find<br /><em>all the words first.</em></>} description="Sessions are personal and designed around the concern you bring. These are some of the areas we can explore together." />
    <div className="svc-accordion-grid" data-page-stagger>{counsellingAreas.map((area, index) => <details className="svc-area" key={area.title} open={index === 0 || undefined}><summary><span className="svc-area-number">{String(index + 1).padStart(2, "0")}</span><h3>{area.title}</h3><ChevronDown size={19} aria-hidden="true" /></summary><CheckList items={area.items} /></details>)}</div>
  </div></section>;
}

const resetPhases = [
  {
    weeks: "01–03", title: "Awareness & the creative state", theme: "Seeing the old self clearly",
    outcomes: ["Observe thoughts, emotions and reactions without judgment", "Recognise unconscious patterns", "Enter the creative present moment"],
    practices: ["Awareness-based guided meditation", "Daily practice checklist", "Observer-role coaching", "Reflection prompts"],
  },
  {
    weeks: "04–06", title: "Stopping the old self", theme: "Interrupting emotional conditioning",
    outcomes: ["Interrupt emotional reactions in real time", "Sit with discomfort without escaping", "Explore the body’s attachment to the past"],
    practices: ["Stopping the Old Self meditation", "Interruption checklist", "Trigger awareness practices", "Coaching on resistance and discomfort"],
  },
  {
    weeks: "07–09", title: "Emotional mastery & reconditioning", theme: "Dismantling emotional memory",
    outcomes: ["Move from survival emotions towards elevated states", "Train the body emotionally", "Develop a new inner baseline"],
    practices: ["Emotional Mastery meditation", "Creating the New Self meditation", "Daily practice checklist", "Emotional reconditioning tools"],
  },
  {
    weeks: "10–12", title: "Living as the new self", theme: "Embodiment & integration",
    outcomes: ["Live from coherence", "Stabilise your new sense of self", "Integrate change into daily life"],
    practices: ["Living as the New Self meditation", "Integration practices", "Identity-based decision tools", "Completion ritual"],
  },
];

const resetModules = ["The Quantum You", "Overcoming Your Environment", "Overcoming Your Body", "Overcoming Time", "Survival vs. Creation", "The Three Brains", "The Gap", "Meditation, Demystifying the Mystical, and Waves of Your Future", "The Meditative Process", "Open the Door to Your Creative State", "Prune Away the Habit of Being Yourself", "Dismantle the Memory of the Old You", "Create a New Mind for Your New Future"];

function InnerResetContent() {
  return <>
    <section className="svc-section svc-soft"><div className="container">
      <SectionHeading eyebrow="A RHYTHM YOU CAN LIVE WITH" title={<>A little every day.<br /><em>A deeper shift over time.</em></>} />
      <div className="svc-format-grid" data-page-stagger><div><span>THE JOURNEY</span><h3>12 weeks</h3><p>A 90-day meditation-based experience.</p></div><div><span>LIVE GUIDANCE</span><h3>Once a week</h3><p>One guided session of 60–75 minutes.</p></div><div><span>DAILY PRACTICE</span><h3>15–25 minutes</h3><p>Awareness and integration in everyday life.</p></div><div><span>YOUR FORMAT</span><h3>Online or in person</h3><p>Live guidance with recordings in either format.</p></div></div>
    </div></section>
    <section className="svc-section"><div className="container">
      <SectionHeading eyebrow="YOUR 12-WEEK PATH" title={<>From awareness<br /><em>to embodiment.</em></>} description="Four connected phases, each with guided meditations, coaching and practices to bring the work into your life." />
      <div className="svc-reset-timeline" data-page-stagger>{resetPhases.map((phase) => <article className="svc-phase" key={phase.weeks}><div className="svc-phase-label"><span>WEEKS</span><strong>{phase.weeks}</strong></div><div className="svc-phase-content"><span className="svc-card-eyebrow">{phase.theme}</span><h3>{phase.title}</h3><div className="svc-phase-columns"><div><h4>What you explore</h4><CheckList items={phase.outcomes} /></div><div><h4>Your practices</h4><CheckList items={phase.practices} /></div></div></div></article>)}</div>
    </div></section>
    <section className="svc-section svc-soft"><div className="container svc-dual-grid">
      <div data-page-reveal><span className="eyebrow">BEYOND THE PROGRAM</span><h2>Let the practice<br /><em>become your life.</em></h2><p>The journey continues with a 30-day post-program integration plan.</p><CheckList items={["A 30-day continuation roadmap", "A protocol for returning to your practice", "A weekly self-check system", "Identity stabilisation practices"]} /></div>
      <div className="svc-berry-card" data-page-reveal><span className="eyebrow">THE APPROACH</span><h3>Gentle.<br />Aware.<br /><em>Sustainable.</em></h3><CheckList items={["Neuroscience-informed meditation", "Body-based emotional reconditioning", "Deep inner safety and awareness", "Gentle, sustainable change"]} /></div>
    </div></section>
    <section className="svc-section"><div className="container">
      <SectionHeading eyebrow="IDEAS YOU WILL EXPLORE" title={<>Understand the patterns.<br /><em>Open new possibilities.</em></>} />
      <ol className="svc-module-list" data-page-stagger>{resetModules.map((module) => <li key={module}>{module}</li>)}</ol>
      <div className="svc-reflection" data-page-reveal><Heart size={26} strokeWidth={1.3} aria-hidden="true" /><p>For professionals experiencing emotional exhaustion, teachers and caregivers, students and seekers, and anyone ready to explore inner mastery.</p><blockquote>“It’s about unlearning what you are not.”</blockquote></div>
    </div></section>
  </>;
}

function HomePractice({ coaching = false }: { coaching?: boolean }) {
  const items = [{ Icon: Wind, title: "Breathwork", text: "Return to your breath as part of your home practice." }, { Icon: Sun, title: "Affirmations", text: "Bring intention into the thoughts you practise each day." }, { Icon: Heart, title: "Healing work", text: "Make space for emotional awareness and inner care." }, { Icon: Moon, title: "Recorded meditations", text: "Continue your practice between live sessions." }];
  return <section className="svc-section svc-soft"><div className="container">
    <SectionHeading eyebrow="BETWEEN YOUR LIVE SESSIONS" title={<>Your practice continues<br /><em>at home.</em></>} description={coaching ? "Relevant journals, recorded sessions and home practices support the live guidance. Follow-up and support are included in every plan." : "Live guidance is complemented by recordings and simple practices you can return to in your own time."} />
    <div className="svc-practice-grid" data-page-stagger>{items.map(({ Icon, title, text }) => <article key={title}><span className="svc-practice-icon"><Icon size={24} strokeWidth={1.4} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>;
}

function LifeCoachingContent() {
  const assessments = ["Wheel of Life", "Personality test", "Sleep quality", "Exercise", "Diet", "Water intake", "Screen time", "A journal to assess your past"];
  return <>
    <section className="svc-section svc-soft"><div className="container">
      <SectionHeading eyebrow="BEGIN WITH YOUR WHOLE LIFE" title={<>Eight assessments.<br /><em>One personal path.</em></>} description="Upon enrolment, these assessments help shape your meditation structure and journal." />
      <ol className="svc-assessment-grid" data-page-stagger>{assessments.map((assessment) => <li key={assessment}>{assessment}</li>)}</ol>
      <p className="svc-section-note" data-page-reveal>Based on your inputs, a meditation structure is designed and a journal is provided.</p>
    </div></section>
    <HomePractice coaching />
  </>;
}

function RelationshipContent() {
  return <>
    <section className="svc-section"><div className="container"><div className="svc-relationship-note" data-page-reveal><Heart size={40} strokeWidth={1.1} aria-hidden="true" /><div><span className="eyebrow">A PERSONAL SPACE</span><h2>Come together.<br /><em>Or begin with yourself.</em></h2><p>Both partners or an individual can attend. During your free demo, we understand your situation and discuss the support that suits your needs.</p></div></div></div></section>
    <HomePractice coaching />
  </>;
}

const shadowBenefits = [
  { number: "01", title: "Emotional awareness", items: [{ title: "Healing past wounds", text: "Explore unresolved pain and recurring emotional patterns." }, { title: "Emotional regulation", text: "Recognise reactivity, anger and fear with more awareness." }, { title: "Self-compassion", text: "Learn to accept all parts of yourself." }] },
  { number: "02", title: "Psychological growth", items: [{ title: "Self-awareness", text: "Understand unconscious motivations, fears and desires." }, { title: "Breaking patterns", text: "Notice repeating cycles in relationships, habits and work." }, { title: "Confidence & empowerment", text: "Make room for the parts of yourself you have held back." }] },
  { number: "03", title: "Wholeness & freedom", items: [{ title: "Authenticity", text: "Accept both the light and the shadow within yourself." }, { title: "Inner freedom", text: "Explore shame, guilt and hidden fears." }, { title: "Deeper relationships", text: "Meet your triggers with more awareness and compassion." }, { title: "Integration", text: "Discover creativity, power and intuition within the shadow." }] },
];

function ShadowWorkContent() {
  return <>
    <section className="svc-section svc-soft"><div className="container">
      <SectionHeading eyebrow="ROOM FOR ALL OF YOU" title={<>Awareness opens the door<br /><em>to integration.</em></>} description="The course explores emotional, psychological and personal growth through guided inner work and home assignments." />
      <div className="svc-shadow-grid" data-page-stagger>{shadowBenefits.map((benefit) => <article key={benefit.title}><span className="svc-card-number">{benefit.number}</span><h3>{benefit.title}</h3>{benefit.items.map((item) => <div className="svc-shadow-item" key={item.title}><h4>{item.title}</h4><p>{item.text}</p></div>)}</article>)}</div>
    </div></section>
    <section className="svc-section"><div className="container"><div className="svc-course-strip" data-page-reveal><div><span className="eyebrow">THE COURSE</span><h2>Six weeks.<br /><em>A fuller understanding.</em></h2></div><div><CheckList items={["12 live sessions", "Home assignments and journals", "Healing and breathwork", "Guided meditations"]} /></div></div></div></section>
  </>;
}

function KidsContent() {
  const topics = [{ title: "Self-esteem", note: "Discovering your own worth" }, { title: "Love yourself", note: "A little kindness from within" }, { title: "Habits", note: "Understanding everyday choices" }, { title: "Fail and learn", note: "Room to try, learn and grow" }, { title: "Emotions", note: "Getting to know your feelings" }, { title: "Gratitude", note: "Noticing the good around you" }];
  return <>
    <section className="svc-section svc-soft"><div className="container">
      <SectionHeading eyebrow="SELF-AWARENESS, WITH A LITTLE PLAY" title={<>Big feelings.<br /><em>Little discoveries.</em></>} description="Six themes explored in the self-awareness course for children aged 7–14." />
      <div className="svc-kids-topics" data-page-stagger>{topics.map((topic, index) => <article key={topic.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{topic.title}</h3><p>{topic.note}</p></article>)}</div>
    </div></section>
    <section className="svc-section"><div className="container">
      <SectionHeading eyebrow="A PRACTICE TO TAKE HOME" title={<>For children.<br /><em>And the parents beside them.</em></>} description="Special recorded meditations for children and their parents, to practise in your own time." />
      <div className="svc-kids-recordings" data-page-stagger>
        <article><span className="svc-recording-meta">AGES 7–14 · 16:20 MINUTES</span><h3>Meditation for children</h3><p>A meditation with fun processes to explore focus, concentration, awareness and mindfulness. Enjoy, and give your 100%.</p><div><strong>₹149</strong><Link href="/contact?interest=kids-recorded-meditation" className="text-link">Enquire about this recording <ArrowUpRight size={16} aria-hidden="true" /></Link></div></article>
        <article><span className="svc-recording-meta">FOR PARENTS · 14:43 MINUTES</span><h3>Night meditation for parents</h3><p>A meditation for parents to practise for their children, bringing loving attention to their child’s growth and well-being.</p><div><strong>₹199</strong><Link href="/contact?interest=parents-night-meditation" className="text-link">Enquire about this recording <ArrowUpRight size={16} aria-hidden="true" /></Link></div></article>
      </div>
      <p className="svc-section-note" data-page-reveal>Contact the centre to arrange payment. Share your payment screenshot on <a href="https://wa.me/919836147999" target="_blank" rel="noopener noreferrer">WhatsApp at 9836147999</a> to receive your meditation link.</p>
    </div></section>
    <section className="svc-section svc-soft"><div className="container">
      <SectionHeading eyebrow="KIDS IN ACTION" title={<>Learning, laughing,<br /><em>finding a little stillness.</em></>} description="Yoga, games, fun activities and meditation are part of the experiences we share with children." />
      <div className="svc-kids-gallery" data-page-stagger>
        <figure><div><Image src="/images/inner-revealing/kids-meditation-session.jpg" alt="A collection of children’s meditation and fun activity sessions" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><figcaption><h3>Meditation with fun</h3><p>Activities, games and learning for young minds.</p></figcaption></figure>
        <figure><div><Image src="/images/inner-revealing/south-city-school.jpg" alt="An Inner Revealing yoga and meditation session at South City International School" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><figcaption><h3>Stillness at school</h3><p>Yoga and meditation sessions with school children.</p></figcaption></figure>
      </div>
      <Link className="text-link svc-gallery-link" href="/gallery">See more moments <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </div></section>
  </>;
}

function GroupContent() {
  return <section className="svc-section svc-soft"><div className="container">
    <SectionHeading eyebrow="YOUR WEEKLY MOMENT OF PAUSE" title={<>A familiar place.<br /><em>A shared practice.</em></>} description="Group sessions take place at the centre, with two opportunities to meditate together each week." />
    <div className="svc-schedule-grid" data-page-stagger><article><Moon size={27} strokeWidth={1.3} aria-hidden="true" /><span className="eyebrow">THURSDAY EVENING</span><h3>7–8 pm</h3><p>Close the day with a guided group meditation.</p></article><article><Sun size={27} strokeWidth={1.3} aria-hidden="true" /><span className="eyebrow">SUNDAY MORNING</span><h3>8–9 am</h3><p>Begin your Sunday with calm, focus and community.</p></article></div>
    <p className="svc-section-note" data-page-reveal>Choose 4 or 8 sessions per month. Contact the centre to confirm your place.</p>
  </div></section>;
}

const coachMonths = [
  { month: "01", title: "The foundations", modules: ["What is Meditation?", "Different Types of Meditation", "Benefits of Meditation", "Practising Meditation"], ending: "MONTH-END QUIZ", start: 1 },
  { month: "02", title: "Learning to guide", modules: ["Pranayama Breathing Exercises", "Leading a Meditation Session", "Working as a Meditation Teacher", "Levelling Up"], ending: "MONTH-END QUIZ", start: 5 },
  { month: "03", title: "Facilitation & healing", modules: ["OSHO Meditations", "Deep Healing Meditations — Emotional and Inner Child", "Heal Your Body Meditations", "Facilitating Meditations"], ending: "QUIZ & FINAL EXAM", start: 9 },
];

function CoachContent() {
  return <>
    <section className="svc-section svc-soft"><div className="container">
      <SectionHeading eyebrow="YOUR THREE-MONTH CURRICULUM" title={<>Practise deeply.<br /><em>Learn to guide.</em></>} description="Twelve modules move from understanding meditation to leading sessions and facilitating a range of practices." />
      <div className="svc-coach-grid" data-page-stagger>{coachMonths.map((month) => <article key={month.month}><div className="svc-coach-month"><span>MONTH</span><strong>{month.month}</strong></div><h3>{month.title}</h3><ol start={month.start}>{month.modules.map((module) => <li key={module}>{module}</li>)}</ol><span className="svc-coach-quiz">{month.ending}</span></article>)}</div>
      <div className="svc-coach-note" data-page-reveal><span className="eyebrow">INSIDE MODULE 9</span><p>OSHO meditations include Kundalini, Chakra Breathing, Chakra Sound, Dynamic, Om Mantra, No Dimension, Whirling, Natraj and others.</p></div>
    </div></section>
    <section className="svc-section"><div className="container svc-dual-grid">
      <div data-page-reveal><span className="eyebrow">READY TO SHARE YOUR PRACTICE</span><h2>Guidance beyond<br /><em>the classroom.</em></h2><CheckList items={["Detailed scripts and a meditation workshop", "All materials, music and theory", "Certificate of Completion", "Your name and centre details listed on our website", "One month of initial support for doubts and queries"]} /></div>
      <aside className="svc-support-card" data-page-reveal><Sparkles size={30} strokeWidth={1.3} aria-hidden="true" /><h3>Grow with<br /><em>Inner Revealing.</em></h3><p>To run a centre under the Inner Revealing Meditation Centre banner, or for continued support, charges are discussed according to the services you need.</p><Link className="text-link" href={contactFor("meditation-coach-program")}>Discuss your plans <ArrowUpRight size={17} aria-hidden="true" /></Link></aside>
    </div></section>
  </>;
}

function ProgramFees({ program }: { program: Program }) {
  const prices = program.slug === "kids-meditation" ? program.prices.slice(0, 1) : program.prices;
  return <section className="svc-section svc-fees-section" id="fees"><div className="container">
    <SectionHeading eyebrow="FEES & YOUR NEXT STEP" title={<>Make space<br /><em>for your practice.</em></>} description="Begin with a free demo session at the centre or online. We will understand your needs and help you choose the right course." />
    <div className={`svc-price-grid ${prices.length === 1 ? "svc-price-single" : ""}`} data-page-stagger>{prices.map((price) => <article className="svc-price-card" key={price.label}><div><span className="svc-price-label">{price.label}</span><h3>{price.price}</h3><p>{price.detail}</p></div><Link className="button button-primary" href={contactFor(program.slug)}>Enquire & book <ArrowUpRight size={17} aria-hidden="true" /></Link></article>)}</div>
    <div className="svc-booking-footnote" data-page-reveal><p>{program.slug === "monthly-meditation" ? "Confirm your plan with the centre." : "Have a question about the program?"} Call or WhatsApp <a href="tel:+919836147999">9836147999</a>.</p><Link className="text-link" href="/fees">View all fees <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
  </div></section>;
}

export function ServiceDetail({ program }: { program: Program }) {
  const heroTitles: Record<string, ReactNode> = {
    "counselling-and-meditation": <>Counselling &amp;<br /><em>Meditation.</em></>,
    "inner-reset-program": <>Signature<br /><em>Inner Reset.</em></>,
    "monthly-meditation": <>Live &amp; Recorded<br /><em>Meditations.</em></>,
    "life-coaching": <>Life Coaching &amp;<br /><em>Meditations.</em></>,
    "relationship-counselling": <>Relationship<br /><em>Counselling.</em></>,
    "shadow-work": <>Shadow<br /><em>Work.</em></>,
    "kids-meditation": <>Kids<br /><em>Meditation.</em></>,
    "group-meditation": <>Group<br /><em>Meditation.</em></>,
    "meditation-coach-program": <>Meditation Coach<br /><em>Program.</em></>,
  };
  const content: Record<string, ReactNode> = {
    "counselling-and-meditation": <CounsellingContent />,
    "inner-reset-program": <InnerResetContent />,
    "monthly-meditation": <HomePractice />,
    "life-coaching": <LifeCoachingContent />,
    "relationship-counselling": <RelationshipContent />,
    "shadow-work": <ShadowWorkContent />,
    "kids-meditation": <KidsContent />,
    "group-meditation": <GroupContent />,
    "meditation-coach-program": <CoachContent />,
  };
  return <>
    <div className="container svc-breadcrumb"><Link href="/services"><ArrowLeft size={14} aria-hidden="true" />All services & programs</Link></div>
    <PageHero eyebrow={program.category.toUpperCase()} title={heroTitles[program.slug] ?? program.title} description={program.description} image={program.heroImage ?? program.image} imageAlt={program.heroImageAlt ?? ""} note={program.duration.toUpperCase()} />
    <ProgramIntroduction program={program} />
    {content[program.slug]}
    <ProgramFees program={program} />
    <PageCTA />
  </>;
}
