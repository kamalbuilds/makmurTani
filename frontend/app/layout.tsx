import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Providers } from './providers';
import { darkTheme } from '@xellar/kit';
import { XellarKitProvider } from '@xellar/kit';
import { Web3Provider } from '@/config/Web3Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MakmurTani - Empowering Indonesian Farmers',
  description: 'Tokenize real-world agricultural assets, access fair markets, and unlock finance for Indonesian farmers.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1B5E20" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <Providers>
          <Web3Provider>
            <Navbar />
            <main className="flex-grow">
              {children}
          </main>
          <Footer />
          </Web3Provider>
        </Providers>
      </body>
    </html>
  );
}
