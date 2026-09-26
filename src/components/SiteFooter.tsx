import Link from 'next/link'
import { Check } from 'lucide-react'

export default function SiteFooter() {
  return <footer className="footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">m</span>morrow<span className="brand-period">.</span></Link><span>We compare money transfer providers. Transfers are completed with the provider.</span><Link className="footer-right" href="/how-we-rank">How we rank <Check size={14} /></Link></footer>
}