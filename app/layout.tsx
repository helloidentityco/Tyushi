import type { Metadata } from 'next';
import { Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart/cart-context';
import CartDrawer from '@/components/storefront/CartDrawer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kawish & Mooi | Luxury Genuine Leather Goods',
  description: 'Artisan luxury genuine leather collections featuring Kawish (Premium) and Mooi (General) handcrafted leather bags, totes, and purses.',
  openGraph: {
    title: 'Kawish & Mooi | Luxury Genuine Leather Goods',
    description: 'Artisan luxury genuine leather collections featuring Kawish (Premium) and Mooi (General) handcrafted leather bags, totes, and purses.',
    type: 'website',
    locale: 'en_PK',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kawish & Mooi | Luxury Genuine Leather Goods',
    description: 'Artisan luxury genuine leather collections featuring Kawish (Premium) and Mooi (General) handcrafted leather bags, totes, and purses.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="bg-[#100C09] text-[#F7F0E6] antialiased selection:bg-[#C6A15B]/30 selection:text-[#E0BF78]" suppressHydrationWarning>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
