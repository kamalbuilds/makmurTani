'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link 
            href="https://twitter.com/makmurtani" 
            className="hover:text-green-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" aria-hidden="true" />
          </Link>
          <Link
            href="https://facebook.com/makmurtani"
            className="hover:text-green-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Facebook</span>
            <Facebook className="h-6 w-6" aria-hidden="true" />
          </Link>
          <Link
            href="https://instagram.com/makmurtani"
            className="hover:text-green-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Instagram</span>
            <Instagram className="h-6 w-6" aria-hidden="true" />
          </Link>
          <Link
            href="https://github.com/makmurtani"
            className="hover:text-green-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">GitHub</span>
            <Github className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>
        
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="MakmurTani Logo"
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="font-bold text-xl">MakmurTani</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold leading-6">Platform</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/marketplace" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/invest" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    Investment
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    Supply Chain
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold leading-6">Support</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/support" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold leading-6">Company</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/about" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm leading-6 hover:text-green-300 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-green-950 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MakmurTani. All rights reserved.</p>
          <p className="mt-1 text-xs">Empowering Indonesian farmers through blockchain technology.</p>
        </div>
      </div>
    </footer>
  );
} 