'use client';

import Image from 'next/image';

// Assuming images are in: public/images/hero/men1.jpg, etc.
const HERO_IMAGES = {
  men: [
    { id: 1, src: '/images/hero/men1.jpg', alt: 'Men Fashion 1' },
    { id: 2, src: '/images/hero/men2.jpg', alt: 'Men Fashion 2' },
    { id: 3, src: '/images/hero/men3.jpg', alt: 'Men Fashion 3' },
    { id: 4, src: '/images/hero/men4.jpg', alt: 'Men Fashion 4' },
  ],
  women: [
    { id: 1, src: '/images/hero/women1.jpg', alt: 'Women Fashion 1' },
    { id: 2, src: '/images/hero/women2.jpg', alt: 'Women Fashion 2' },
    { id: 3, src: '/images/hero/women3.jpg', alt: 'Women Fashion 3' },
    { id: 4, src: '/images/hero/women4.jpg', alt: 'Women Fashion 4' },
  ]
};

interface HeroSliderProps {
  activeGender: 'men' | 'women';
}

export default function HeroSlider({ activeGender }: HeroSliderProps) {
  const slides = HERO_IMAGES[activeGender];

  return (
    <section className="relative w-full overflow-hidden bg-white py-10">
      {/* Advertisement Label */}

      {/* The Marquee Container */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex gap-4">
          {/* Render images twice for an infinite loop */}
          {[...slides, ...slides].map((slide, index) => (
            <div 
              key={`${activeGender}-${index}`} 
              className="relative w-[300px] md:w-[450px] h-[500px] md:h-[600px] shrink-0 overflow-hidden rounded-2xl group"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index < 2}
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Advertisement Text on Photo */}
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Trending Now</p>
                <h4 className="text-2xl font-black uppercase tracking-tighter">Season Essentials</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}