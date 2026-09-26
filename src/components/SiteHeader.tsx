'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, ShieldCheck } from 'lucide-react'

export default function SiteHeader({ active = '' }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)
  return <header className="topbar">
    <Link className="brand" href="/" aria-label="Morrow home"><span className="brand-mark">m</span>morrow<span className="brand-period">.</span></Link>
    <nav className={`main-nav ${menuOpen ? 'main-nav-open' : ''}`} id="main-navigation" aria-label="Main navigation">
      <a className={active === 'compare' ? 'nav-active' : ''} href="/#compare" onClick={close}>Compare</a>
      <a className={active === 'how' ? 'nav-active' : ''} href="/#how-it-works" onClick={close}>How it works</a>
      <a href="/#popular-routes" onClick={close}>Popular routes</a>
      <Link className={active === 'methodology' ? 'nav-active' : ''} href="/how-we-rank" onClick={close}>How we rank</Link>
    </nav>
    <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
    <div className="header-note"><ShieldCheck size={16} /> Independent comparison</div>
  </header>
}