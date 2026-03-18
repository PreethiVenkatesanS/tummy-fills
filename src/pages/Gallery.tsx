import React, { useState } from 'react';
import { galleryImages } from '../data/image';

const Gallery: React.FC = () => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="gallery" className="bg-white px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-brand-orange/10 text-brand-orange font-semibold px-4 py-1.5 rounded-full text-sm mb-3 font-poppins">
            Our Gallery
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-brand-brown font-outfit">
            Made with Love 🍰
          </h2>
          <p className="text-brand-dark/60 mt-3 font-poppins">
            A peek into our freshly baked world — every item made in-house daily.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {galleryImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActive(img.id)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group shadow-md ${
                idx === 0 || idx === 4 ? 'sm:col-span-1 sm:row-span-2' : ''
              }`}
              style={{ minHeight: idx === 0 || idx === 4 ? '320px' : '200px' }}
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                style={{ height: idx === 0 || idx === 4 ? '320px' : '200px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-semibold font-outfit text-sm">{img.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {active && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setActive(null)}
          >
            <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <img
                src={galleryImages.find(g => g.id === active)?.url}
                alt="Gallery"
                className="w-full rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setActive(null)}
                className="absolute -top-3 -right-3 bg-white text-brand-dark w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-brand-orange hover:text-white transition-colors"
              >
                ✕
              </button>
              <p className="text-center text-white/70 mt-3 font-poppins text-sm">
                {galleryImages.find(g => g.id === active)?.title}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
