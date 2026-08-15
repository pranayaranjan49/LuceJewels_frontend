import { useState, useEffect, useCallback, useRef } from 'react';
// import { Link } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { getBanners } from '../../api/endpoints';

// Used only if the admin hasn't added any banners yet, so the homepage never
// looks broken/empty on a fresh install.
const FALLBACK_SLIDES = [
  {
    _id: 'fallback-1',
    image: { url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1600&auto=format&fit=crop' },
    title: 'Jewellery worth passing down.',
    subtitle: 'Every piece is hand-finished in 22K gold and certified stones.',
    ctaLabel: 'Shop the Edit',
    ctaLink: '/shop',
  },
  {
    _id: 'fallback-2',
    image: { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop' },
    title: 'Rings for every story.',
    subtitle: 'Solitaires, bands, and stacking sets crafted to last generations.',
    ctaLabel: 'View Rings',
    ctaLink: '/shop?category=rings',
  },
  {
    _id: 'fallback-3',
    image: { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1600&auto=format&fit=crop' },
    title: 'Necklaces that catch the light.',
    subtitle: 'Layered chains and statement pieces, hallmarked and insured.',
    ctaLabel: 'View Necklaces',
    ctaLink: '/shop?category=necklaces',
  },
];

// CHANGED: was 4500ms - now slides every 4 seconds as requested.
const AUTOPLAY_DELAY = 4000;

const TEXT_COLOR_CLASSES = {
  dark: { title: 'text-ink-primary', subtitle: 'text-ink-secondary' },
  gold: { title: 'text-gold-500', subtitle: 'text-gold-300' },
  pink: { title: 'text-surface-strong', subtitle: 'text-surface-strong/70' },
};
// export default function HeroCarousel() {
//   const [slides, setSlides] = useState(FALLBACK_SLIDES);
export default function HeroCarousel() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    getBanners()
      .then((res) => {
        if (res.data.data?.length > 0) setSlides(res.data.data);
      })
      .catch(() => {}); // fallback slides already showing, fail silently
  }, []);

  const goTo = useCallback(
    (newIndex, dir) => {
      setDirection(dir);
      setIndex((newIndex + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // Autoplay - resets whenever the slide changes or the user hovers/pauses it
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setTimeout(next, AUTOPLAY_DELAY);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, next, slides.length]);

  const slide = slides[index];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    // CHANGED: outer <section> used to BE the full-viewport hero itself
    // (h-[88vh], no rounding, no side margin). Now it's just a max-width
    // wrapper with padding, and the actual visual card lives in the <div>
    // below - contained, rounded, with a fixed (smaller) height per
    // breakpoint instead of covering the screen.
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10">
      <div
        className="relative h-[280px] overflow-hidden rounded-lg shadow-soft sm:h-[380px] lg:h-[460px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slide._id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
          //   transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          //   className="absolute inset-0"
          //   drag={slides.length > 1 ? 'x' : false}
          //   dragConstraints={{ left: 0, right: 0 }}
          //   dragElastic={0.2}
          //   onDragEnd={(e, info) => {
          //     if (info.offset.x < -50) next();
          //     else if (info.offset.x > 50) prev();
          //   }}
          // >
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 cursor-pointer"
            drag={slides.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.x < -50) next();
              else if (info.offset.x > 50) prev();
            }}
            onTap={() => navigate(slide.ctaLink || '/shop')}
          >
            <img
              src={slide.image?.url}
              alt={slide.title}
              className="h-full w-full object-cover pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-base/60 via-surface-base/10 to-transparent" />

            <div className="relative z-10 flex h-full w-full items-end px-5 pb-5 sm:px-8 sm:pb-7 lg:px-10 lg:pb-9">
              <div className="max-w-sm sm:max-w-md">
                <p className="eyebrow text-[11px] sm:text-xs">Luxe Jewels</p>
                {/* <h1 className="mt-2 font-display text-xl leading-[1.1] text-ink-primary sm:mt-3 sm:text-3xl lg:text-4xl">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="mt-2 hidden text-sm text-ink-secondary sm:block">{slide.subtitle}</p>
                )} */}
                <h1 className={`mt-2 font-display text-xl leading-[1.1] sm:mt-3 sm:text-3xl lg:text-4xl ${(TEXT_COLOR_CLASSES[slide.textColor] || TEXT_COLOR_CLASSES.dark).title}`}>
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className={`mt-2 hidden text-sm sm:block ${(TEXT_COLOR_CLASSES[slide.textColor] || TEXT_COLOR_CLASSES.dark).subtitle}`}>{slide.subtitle}</p>
                )}
                {/* <Link to={slide.ctaLink || '/shop'} className="btn-primary mt-4 inline-flex px-6 py-2.5 text-sm sm:mt-5 sm:px-8 sm:py-3">
                  {slide.ctaLabel || 'Shop Now'}
                </Link> */}
                <Link
                  to={slide.ctaLink || '/shop'}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-primary mt-4 inline-flex px-6 py-2.5 text-sm sm:mt-5 sm:px-8 sm:py-3"
                >
                  {slide.ctaLabel || 'Shop Now'}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-surface-base/70 p-1.5 text-ink-primary backdrop-blur-sm transition-colors hover:bg-surface-base sm:flex"
            >
              <HiChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-surface-base/70 p-1.5 text-ink-primary backdrop-blur-sm transition-colors hover:bg-surface-base sm:flex"
            >
              <HiChevronRight size={18} />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
              {slides.map((s, i) => (
                <button
                  key={s._id}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-fast ${
                    i === index ? 'w-5 bg-gold-400' : 'w-1.5 bg-ink-primary/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
