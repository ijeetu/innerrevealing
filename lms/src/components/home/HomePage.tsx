'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Leaf, Sparkles, Wind } from 'lucide-react'
import Layout from '../layout/Layout'
import CourseCard from '../cards/CourseCard'
import { getCourses } from '@/utils/api/user/getCourses'
import { Course } from '@/types'
import './wellness-home.css'

const practices = [
  { title: 'Meditation', tag: 'COME BACK TO STILLNESS', description: 'Guided practices to pause, turn inward and make space for yourself.', image: '/images/wellness/meditation.webp', href: '/courses/search/meditation', icon: Sparkles },
  { title: 'Yoga & Breathwork', tag: 'MOVE. BREATHE. BE.', description: 'Explore mindful movement and a gentler connection with your breath.', image: '/images/wellness/yoga-breathing.webp', href: '/courses/search/yoga', icon: Wind },
  { title: 'Personal Growth', tag: 'GET TO KNOW YOURSELF', description: 'Explore mindfulness, self-awareness and a more compassionate way of living.', image: '/images/wellness/personal-growth.webp', href: '/courses/search/mindfulness', icon: Leaf },
]

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    let active = true
    getCourses({ search: 'meditation', per_page: 4, page: 1 }).then(response => {
      if (active && response && !response.error) setCourses(response.data?.data ?? [])
    })
    return () => { active = false }
  }, [])

  const handleWishlistToggle = (id: number, isWishlisted: boolean) => {
    setCourses(previous => previous.map(course => course.id === id ? { ...course, is_wishlisted: isWishlisted } : course))
  }

  return (
    <Layout>
      <main className="ir-home">
        <section className="ir-hero" aria-labelledby="ir-hero-title">
          <div className="container ir-hero-grid">
            <div className="ir-hero-copy">
              <span className="ir-eyebrow"><span /> INNER REVEALING · MEDITATION & YOGA</span>
              <h1 id="ir-hero-title">A little stillness.<br />A deeper <em>you.</em></h1>
              <p>Make space for your inner world. Explore meditation, mindful movement and practices that help you return to yourself, one gentle step at a time.</p>
              <div className="ir-actions">
                <a className="ir-button ir-button-primary" href="#practices">Find your practice <ArrowRight size={18} /></a>
                <Link className="ir-button ir-button-outline" href="/contact-us">Talk to us</Link>
              </div>
              <div className="ir-hero-note"><Leaf size={18} /><span>For your practice. At your pace.</span></div>
            </div>
            <div className="ir-hero-visual">
              <Image src="/images/wellness/meditation.webp" alt="A quiet moment of seated meditation in a sunlit room" width={1024} height={1536} priority className="ir-hero-image" />
              <div className="ir-visual-note"><span>PAUSE & COME HOME</span><p>There is space<br />to simply be.</p></div>
            </div>
          </div>
        </section>

        <section id="practices" className="container ir-practices" aria-labelledby="ir-practices-title">
          <div className="ir-section-heading">
            <div><span className="ir-eyebrow">THREE WAYS TO BEGIN</span><h2 id="ir-practices-title">Find what feels<br /><em>right for you.</em></h2></div>
            <p>A focused space for meditation, yoga and personal growth. Begin with what you need today.</p>
          </div>
          <div className="ir-practice-grid">
            {practices.map(({ title, tag, description, image, href, icon: Icon }) => (
              <Link className="ir-practice-card" href={href} key={title}>
                <div className="ir-practice-image"><Image src={image} alt={title === 'Yoga & Breathwork' ? 'A peaceful mindful breathing practice' : title === 'Personal Growth' ? 'A moment of quiet self-reflection' : 'A guided meditation practice'} width={1024} height={1536} sizes="(max-width: 700px) 100vw, 33vw" /><span><Icon size={22} /></span></div>
                <div className="ir-practice-copy"><span className="ir-eyebrow">{tag}</span><h3>{title}<ArrowRight size={21} /></h3><p>{description}</p></div>
              </Link>
            ))}
          </div>
        </section>

        {courses.length > 0 && <section className="container ir-course-section" aria-labelledby="ir-course-title">
          <div className="ir-section-heading"><div><span className="ir-eyebrow">YOUR PRACTICE, AT HOME</span><h2 id="ir-course-title">Explore guided <em>meditations.</em></h2></div><Link className="ir-text-link" href="/courses">View practices <ArrowRight size={18} /></Link></div>
          <div className="ir-course-grid">{courses.map(course => <CourseCard key={course.id} courseData={course} onWishlistToggle={handleWishlistToggle} />)}</div>
        </section>}

        <section className="ir-begin-section" aria-labelledby="ir-begin-title">
          <div className="container ir-begin-grid">
            <div><span className="ir-eyebrow">A GENTLER WAY TO GROW</span><h2 id="ir-begin-title">You don’t have to<br /><em>have it all figured out.</em></h2><p>Inner Revealing is a meditation, psychological counselling and healing centre in Kolkata. Wherever you are in your journey, there is room to begin.</p><a className="ir-text-link" href="https://www.innerrevealing.com" target="_blank" rel="noopener noreferrer">Get to know our centre <ArrowRight size={18} /></a></div>
            <ol className="ir-steps">
              <li><span>01</span><div><h3>Listen to yourself</h3><p>Choose meditation, yoga or a practice for personal growth.</p></div></li>
              <li><span>02</span><div><h3>Make a little space</h3><p>Set aside a quiet moment and explore at a pace that suits you.</p></div></li>
              <li><span>03</span><div><h3>Keep coming back</h3><p>Let your practice become a gentle part of everyday life.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="container ir-contact-section"><div><span className="ir-eyebrow">LET’S BEGIN WITH A CONVERSATION</span><h2>Not sure where<br /><em>to start?</em></h2><p>We’re here to help you find a practice that feels right.</p></div><Link className="ir-button ir-button-primary" href="/contact-us">Connect with Inner Revealing <ArrowRight size={18} /></Link></section>
      </main>
    </Layout>
  )
}
