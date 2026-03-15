import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin, Youtube, Instagram, Twitter, Facebook } from 'lucide-react';

const footerLinks = {
  courses: [
    { label: 'Class 9 Science', href: '/courses?grade=CLASS_9&subject=Science' },
    { label: 'Class 10 Maths', href: '/courses?grade=CLASS_10&subject=Maths' },
    { label: 'Class 11 Physics', href: '/courses?grade=CLASS_11&subject=Physics' },
    { label: 'Class 12 Chemistry', href: '/courses?grade=CLASS_12&subject=Chemistry' },
    { label: 'JEE Preparation', href: '/courses?exam=JEE' },
    { label: 'NEET Preparation', href: '/courses?exam=NEET' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Become a Teacher', href: '/teach' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Sitemap', href: '/sitemap.xml' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-white">EduGeeks</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm mb-6 max-w-xs">
              India's most affordable EdTech platform for Class 9–12 students. Expert-led courses for CBSE, JEE, NEET & CUET preparation.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@edugeeks.co.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>New Delhi, India</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Youtube, href: '#', color: 'hover:text-red-400' },
                { icon: Instagram, href: '#', color: 'hover:text-pink-400' },
                { icon: Twitter, href: '#', color: 'hover:text-sky-400' },
                { icon: Facebook, href: '#', color: 'hover:text-blue-400' },
              ].map(({ icon: Icon, href, color }) => (
                <a key={href} href={href}
                  className={`w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 ${color} hover:bg-slate-700 transition-all`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Popular Courses', links: footerLinks.courses },
            { title: 'Company', links: footerLinks.company },
            { title: 'Support', links: footerLinks.support },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-sm text-slate-400 hover:text-brand-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EduGeeks. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Payments secured by</span>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">Razorpay</span>
          </div>
          <p className="text-sm text-slate-500">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
