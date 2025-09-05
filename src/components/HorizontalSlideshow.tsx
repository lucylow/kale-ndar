import React, { useState, useEffect, useRef } from 'react';

interface SlideshowProps {
  images: string[];
  width?: number;  // width of slideshow container in px
  height?: number; // height of slideshow container in px
  interval?: number; // milliseconds between slides
  autoPlay?: boolean; // whether to auto-advance slides
  showControls?: boolean; // whether to show navigation controls
  className?: string; // additional CSS classes
}

const HorizontalSlideshow: React.FC<SlideshowProps> = ({
  images,
  width = 1200,
  height = 675,
  interval = 5000,
  autoPlay = true,
  showControls = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance slides
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length, interval, autoPlay]);

  // Calculate the translateX offset for horizontal scrolling
  const translateX = -currentIndex * width;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Reset auto-play timer when manually navigating
    if (autoPlay && images.length > 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, interval);
    }
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    goToSlide(newIndex);
  };

  if (images.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-gray-500">No images to display</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main slideshow container */}
      <div
        style={{
          overflow: 'hidden',
          width,
          height,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          margin: '0 auto',
          backgroundColor: '#f8fafc',
        }}
        aria-label="Horizontal slideshow for pitch deck"
      >
        <div
          ref={slideRef}
          style={{
            display: 'flex',
            width: images.length * width,
            height,
            transform: `translateX(${translateX}px)`,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                width,
                height,
                flexShrink: 0,
                padding: '20px',
              }}
            >
              <img
                src={src}
                alt={`Architecture Slide ${i + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
                loading="lazy"
                onError={(e) => {
                  console.error(`Failed to load image: ${src}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === currentIndex 
                    ? 'bg-blue-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Slide Counter */}
      {images.length > 1 && (
        <div className="text-center mt-2 text-sm text-gray-500">
          {currentIndex + 1} of {images.length}
        </div>
      )}
    </div>
  );
};

export default HorizontalSlideshow;
