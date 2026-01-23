'use client';

import { useEffect, useState } from 'react';

const slides = [
  '/hero/slide1.jpg',
  '/hero/slide2.jpg',
  '/hero/slide3.jpg',
  '/hero/slide4.jpg',
  '/hero/slide5.jpg',
  '/hero/slide6.jpg',
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[70vh] overflow-hidden">
      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {slides.map((src, index) => (
          <div
            key={index}
            className="min-w-full h-full bg-center bg-cover"
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>

      {/* Overlay (optional but recommended for hero) */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Hero Text */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Shop Smarter, Live Better
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Discover top products across all categories
          </p>
        </div>
      </div>
    </section>
  );
}
