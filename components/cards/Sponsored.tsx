import React, { useRef, useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'

interface SponsoredSection {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'VIDEO' | 'IMAGE';
  ctaText: string;
  ctaUrl: string;
  order: number;
}

const Sponsored = () => {
  const scroll = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sponsoredSections, setSponsoredSections] = useState<SponsoredSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  // Mark ready after mount to avoid SSR/hydration mismatch
  useEffect(() => {
    setReady(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Function to truncate text by word count
  const truncateText = (text: string, maxWords: number): string => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Function to truncate text by character count
  const truncateChars = (text: string, maxChars: number): string => {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars) + '...';
  };

  // Fetch sponsored sections from API
  useEffect(() => {
    const fetchSponsoredSections = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://134.199.161.119:5000/api/public/sponsored-sections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sponsored sections');
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Sort by order field
          const sortedData = data.data.sort((a: SponsoredSection, b: SponsoredSection) => a.order - b.order);
          setSponsoredSections(sortedData);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching sponsored sections:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsoredSections();
  }, []);

  const SLIDE_COUNT = sponsoredSections.length;

  const scrollToSlide = useCallback((index: number) => {
    if (scroll.current) {
      const container = scroll.current;
      const slideWidth = container.clientWidth; // Use clientWidth for accurate calculation
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  }, []);

  // Auto-scroll effect - continuous loop
  useEffect(() => {
    if (isPaused || SLIDE_COUNT === 0) return;

    const interval = setInterval(() => {
      setActiveSlide(prev => {
        const nextIndex = (prev + 1) % SLIDE_COUNT;
        
        // Use setTimeout to ensure state is updated before scrolling
        setTimeout(() => {
          if (scroll.current) {
            const container = scroll.current;
            const slideWidth = container.clientWidth;
            container.scrollTo({
              left: slideWidth * nextIndex,
              behavior: 'smooth'
            });
          }
        }, 0);
        
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, SLIDE_COUNT]);

  // Handle scroll event to update active slide indicator
  const handleScroll = useCallback(() => {
    if (scroll.current) {
      const container = scroll.current;
      const slideWidth = container.clientWidth;
      const currentSlide = Math.round(container.scrollLeft / slideWidth);
      setActiveSlide(currentSlide);
    }
  }, []);


    
  if (!ready || dismissed) return null;

  return (
    <div className="mx-4 sm:mx-4 lg:mx-10 mt-14 sm:-mt-12 lg:-mt-20 rounded-2xl lg:rounded-4xl overflow-hidden">
      <section className="relative bg-[#632013] p-4 sm:p-6 lg:p-8 lg:pt-12 rounded-2xl lg:rounded-4xl">
        {/* Close button — top right */}
        <button
          onClick={handleDismiss}
          aria-label="Hide sponsored section"
          className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 lg:px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/80 text-[10px] font-medium transition-all duration-200"
        >
          <X className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
          <span className="hidden lg:inline">Hide</span>
        </button>
        <div className="flex flex-col w-full">
          {/* CAROUSEL WRAPPER */}
          <div 
            className="relative group w-full px-0 sm:px-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Scrolling Container */}
            <div
              ref={scroll}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth px-4 sm:px-4 lg:px-0"
              style={{ 
                scrollbarWidth: "none", 
                msOverflowStyle: "none",
                willChange: "scroll-position",
                perspective: "1000px",
                isolation: "isolate"
              }}
            >
              {loading ? (
                // Loading state
                <div className="w-full shrink-0 snap-center mr-4 sm:mr-4 lg:mr-0">
                  <div 
                    className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512] animate-pulse h-110 md:h-80"
                    style={{
                      transform: "translate3d(0, 0, 0)",
                      backfaceVisibility: "hidden",
                      isolation: "isolate",
                      contain: "layout style paint"
                    }}
                  >
                    <div className="w-full md:w-1/2 h-52 md:h-full bg-[#5A1E12]/30"></div>
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center h-52 md:h-full">
                      <div className="h-4 bg-[#5A1E12]/30 rounded mb-4"></div>
                      <div className="h-8 bg-[#5A1E12]/30 rounded mb-3"></div>
                      <div className="h-16 bg-[#5A1E12]/30 rounded mb-8"></div>
                      <div className="h-10 bg-[#5A1E12]/30 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                // Error state
                <div className="w-full shrink-0 snap-center mr-4 sm:mr-4 lg:mr-0">
                  <div 
                    className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512] h-110 md:h-80"
                    style={{
                      transform: "translate3d(0, 0, 0)",
                      backfaceVisibility: "hidden",
                      isolation: "isolate",
                      contain: "layout style paint"
                    }}
                  >
                    <div className="w-full p-8 md:p-12 flex flex-col justify-center text-white text-center h-full">
                      <h2 className="text-2xl font-bold mb-3">Unable to load content</h2>
                      <p className="text-white/70">{error}</p>
                    </div>
                  </div>
                </div>
              ) : sponsoredSections.length > 0 ? (
                // Dynamic slides from API
                sponsoredSections.map((section, index) => (
                  <div key={section.id} className="w-full shrink-0 snap-center mr-4 sm:mr-4 lg:mr-0">
                    <div 
                      className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512] h-110 md:h-80"
                      style={{
                        transform: "translate3d(0, 0, 0)",
                        backfaceVisibility: "hidden",
                        isolation: "isolate",
                        contain: "layout style paint"
                      }}
                    >
                      <div className="relative w-full md:w-1/2 shrink-0 h-52 md:h-full flex items-stretch">
                        {section.mediaType === 'VIDEO' ? (
                          <video
                            src={section.mediaUrl}
                            className="w-full h-full object-cover block"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <div
                            className="w-full h-full bg-cover bg-center block"
                            style={{ backgroundImage: `url(${section.mediaUrl})` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/5"></div>
                      </div>
                      <div className="relative w-full md:w-1/2 p-5 sm:p-7 md:p-10 flex flex-col justify-between md:justify-center text-white h-52 md:h-full">
                        <div className="absolute top-0 bottom-0 -left-10 lg:-left-16 w-12 lg:w-20 hidden md:block text-[#803512]">
                          <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="h-full w-full fill-[#803512]"
                          >
                            <path d="M 100 0 L 100 100 L 0 100 Q 50 50 0 0 Z" />
                          </svg>
                        </div>
                        <div className="relative z-10 w-full flex flex-col h-full">
                          <div className="flex justify-end w-full mb-3 md:mb-4">
                            <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-black/40 shadow-sm border border-white/10 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
                              <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-orange-400 mr-1 md:mr-2 animate-pulse"></span>
                              Sponsored
                            </span>
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 leading-tight">
                              {truncateChars(section.title, 25)}
                            </h2>
                            <p className="text-orange-50/80 text-xs sm:text-sm lg:text-base leading-relaxed mb-4 md:mb-8 max-w-md line-clamp-2 md:line-clamp-3">
                              {section.description}
                            </p>
                            <a
                              href={section.ctaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-[#5A1E12] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs font-bold uppercase shadow-lg hover:bg-[#7a2a1a] transition-colors mt-auto w-max"
                            >
                              {section.ctaText}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback when no data
                <div className="w-full shrink-0 snap-center mr-4 sm:mr-4 lg:mr-0">
                  <div className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512] h-110 md:h-80">
                    <div className="w-full p-8 md:p-12 flex flex-col justify-center text-white text-center h-full">
                      <h2 className="text-2xl font-bold mb-3">No sponsored content available</h2>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dot navigation row */}
            {!loading && !error && SLIDE_COUNT > 1 && (
              <div className="flex items-center justify-center mt-4 gap-2">
                {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveSlide(i);
                      scrollToSlide(i);
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 3000);
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      activeSlide === i
                        ? "w-6 h-2.5 bg-white"
                        : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATIC CARDS GRID */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-white">
            <div className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/woodenfluet.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500">
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  Artisan Crafts
                </h1>
                <p className="text-xs opacity-90">
                  Traditional techniques meets modern design.
                </p>
              </div>
            </div>

            <div className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/color-rock.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h3 className="text-lg font-bold mb-2">Ancient Lore</h3>
                <p className="text-xs opacity-90">
                  Stories passed down through generations.
                </p>
              </div>
            </div>

            <div className="relative col-span-1 md:col-span-2 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/mid3.jpg')] bg-cover bg-center hover:scale-[1.01] transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 p-6 lg:p-10 h-full flex flex-col justify-end">
                <h3 className="text-xl lg:text-3xl font-bold mb-2">
                  Cultural Heritage
                </h3>
                <p className="text-sm opacity-90">
                  Explore the oldest living culture on Earth.
                </p>
              </div>
            </div>
          </div> */}
      </section>
    </div>
  )
}

export default Sponsored
