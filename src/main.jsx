import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, Sparkles, RotateCcw, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import './styles.css';
import './memories.css';

const confetti = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  delay: `${(i % 11) * 0.13}s`,
  duration: `${2.5 + (i % 7) * 0.32}s`,
  hue: [8, 28, 345, 48, 330][i % 5],
}));

const memories = [
  { image: 'early-days.jpg', alt: 'A close selfie from the early days together', title: 'The beginning of everything', note: 'I had no idea then how much my favorite person was standing right beside me.' },
  { image: 'close-together.jpg', alt: 'A sunny close-up together outdoors', title: 'My favorite view', note: 'It still makes me smile that the best part of every place is being there with you.' },
  { image: 'snow-trip.jpg', alt: 'Together on a snowy mountain trip', title: 'A little mountain magic', note: 'Cold hands, warm hugs, and another story I want to tell forever.' },
  { image: 'snow-day.jpg', alt: 'A playful snowy day together', title: 'Partners in every adventure', note: 'You make even the chilly, chaotic, windblown days feel like the best days.' },
  { image: 'sunset.jpg', alt: 'Together on a boat at sunset', title: 'Chasing golden hours', note: 'The sky put on a show, but I was looking at you.' },
  { image: 'celebration.jpg', alt: 'Dressed up together for a celebration', title: 'All dressed up, still us', note: 'Every celebration is better when I get to celebrate with you.' },
  { image: 'wedding-day.jpg', alt: 'A portrait from our wedding day', title: 'The day we said forever', note: 'One of my favorite days, and still my favorite person.' },
  { image: 'wedding-moment.jpg', alt: 'A tender wedding ceremony moment', title: 'A promise, held close', note: 'I would choose you in every lifetime, in every version of our story.' },
  { image: 'just-married.jpg', alt: 'A joyful portrait just after the wedding', title: 'And then there was us', note: 'The start of a thousand little moments I get to love you through.' },
];

const wishSparkles = [[0,-98],[52,-78],[86,-34],[96,20],[57,68],[13,95],[-44,80],[-85,42],[-95,-18],[-62,-70],[30,-40],[-30,25]];

function App() {
  const [currentPage, setCurrentPage] = useState(() => ['candle', 'gift', 'note', 'story'].includes(window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'cover');
  const [candleOut, setCandleOut] = useState(false);
  const [giftRevealed, setGiftRevealed] = useState(false);
  const [loveNoteOpen, setLoveNoteOpen] = useState(false);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [slideshowPaused, setSlideshowPaused] = useState(false);
  const touchStart = useRef(null);
  const audioRef = useRef(null);
  const modalCloseRef = useRef(null);
  const lastThingRef = useRef(null);
  const memory = memories[memoryIndex];
  const opened = currentPage !== 'cover';

  useEffect(() => {
    const syncPage = () => {
      const page = window.location.hash.slice(1);
      setCurrentPage(['candle', 'gift', 'note', 'story'].includes(page) ? page : 'cover');
    };
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const goToPage = (page) => {
    window.location.hash = page;
    setCurrentPage(page);
  };

  const openCard = async () => {
    goToPage('candle');
    try {
      await audioRef.current?.play();
    } catch {}
  };

  const playWinkSound = async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    try {
      await context.resume();
      const now = context.currentTime;
      const tone = context.createOscillator();
      const volume = context.createGain();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(920, now);
      tone.frequency.exponentialRampToValueAtTime(1580, now + 0.075);
      tone.frequency.exponentialRampToValueAtTime(870, now + 0.23);
      volume.gain.setValueAtTime(0.0001, now);
      volume.gain.linearRampToValueAtTime(0.11, now + 0.025);
      volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      tone.connect(volume);
      volume.connect(context.destination);
      tone.start(now);
      tone.stop(now + 0.27);
      window.setTimeout(() => context.close(), 450);
    } catch {
      context.close();
    }
  };

  const unwrapGift = () => {
    if (giftRevealed) return;
    setGiftRevealed(true);
    playWinkSound();
  };

  const restart = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setCurrentPage('cover');
    setCandleOut(false);
    setGiftRevealed(false);
    setMemoryIndex(0);
    setSlideshowPaused(false);
  };

  const moveMemory = (direction) => setMemoryIndex((index) => (index + direction + memories.length) % memories.length);

  useEffect(() => {
    if (currentPage !== 'story' || slideshowPaused) return undefined;
    if (memoryIndex === memories.length - 1) return undefined;
    const timer = window.setTimeout(() => setMemoryIndex((index) => (index + 1) % memories.length), 3000);
    return () => window.clearTimeout(timer);
  }, [currentPage, slideshowPaused, memoryIndex]);

  useEffect(() => {
    if (!loveNoteOpen) return undefined;
    modalCloseRef.current?.focus();
    const closeOnEscape = (event) => { if (event.key === 'Escape') setLoveNoteOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [loveNoteOpen]);

  useEffect(() => {
    if (currentPage === 'story' && memoryIndex === memories.length - 1) {
      lastThingRef.current?.focus({ preventScroll: true });
    }
  }, [currentPage, memoryIndex]);

  useEffect(() => {
    if (currentPage !== 'candle' || !candleOut) return undefined;
    const timer = window.setTimeout(() => goToPage('gift'), 1900);
    return () => window.clearTimeout(timer);
  }, [currentPage, candleOut]);

  return (
    <main className="page-shell">
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}music/kesariya.mp3`} loop preload="metadata" hidden />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {opened && <div className="confetti" aria-hidden="true">{confetti.map((piece, i) => <i key={i} style={{ '--left': piece.left, '--delay': piece.delay, '--duration': piece.duration, '--hue': piece.hue }} />)}</div>}

      <header className="topbar">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); restart(); }} aria-label="Start over">
          <span className="brand-mark"><Heart size={15} fill="currentColor" /></span>
          <span>a little something for you</span>
        </a>
      </header>

      {currentPage === 'cover' ? (
        <section className="cover-screen" id="home">
          <div className="floating-hearts" aria-hidden="true">{[7, 19, 34, 52, 68, 84, 95].map((left, index) => <span key={left} style={{ '--heart-left': `${left}%`, '--heart-delay': `${index * -1.1}s`, '--heart-duration': `${6 + (index % 3) * 1.3}s` }}>♥</span>)}</div>
          <div className="cover-art" aria-hidden="true">
            <span className="orbit orbit-a" /><span className="orbit orbit-b" />
            <span className="art-heart heart-a">♥</span><span className="art-heart heart-b">♥</span>
            <div className="envelope"><div className="envelope-flap" /><div className="envelope-note"><Heart size={24} fill="currentColor" /></div></div>
            <span className="sparkle sparkle-a">✦</span><span className="sparkle sparkle-b">✧</span><span className="sparkle sparkle-c">✦</span>
          </div>
          <p className="eyebrow">TODAY IS ALL ABOUT YOU</p>
          <h1>Happy birthday,<br /><em>my favorite person.</em></h1>
          <p className="intro">I made you a little something.<br />Tap below to open it and start the music, birthday boy.</p>
          <button className="primary-button" onClick={openCard}>
            Open your card <span className="button-heart">♥</span>
          </button>
          <p className="tiny-note"><Sparkles size={13} /> made with all my love</p>
        </section>
      ) : (
        <section className="inside-screen" key="inside">
          <div className="inside-heading"><span className="pill"><Sparkles size={13} /> {currentPage === 'story' ? 'OUR STORY' : currentPage === 'candle' ? 'MAKE A WISH' : currentPage === 'gift' ? 'A LITTLE WISH, GRANTED' : 'YOUR VERY OWN DAY'}</span><h1>{currentPage === 'story' ? <>Our <em>little world</em></> : currentPage === 'candle' ? <>Make a <em>wish</em></> : currentPage === 'gift' ? <>One little <em>wish</em>…</> : <>A note <em>for you</em></>}</h1><p>{currentPage === 'story' ? 'A few of my favorite moments with you.' : currentPage === 'candle' ? 'Tap the candle, close your eyes, and wish.' : currentPage === 'gift' ? 'May all your wishes come true, my love.' : 'Another year of you. What a lucky world.'}</p></div>

          {currentPage === 'story' ? <>
          <section className="memory-book" aria-label="Our photo story">
            <div className="memory-book-heading"><span>OUR STORY, IN LITTLE MOMENTS</span><div className="memory-tools"><span className="memory-counter">{String(memoryIndex + 1).padStart(2, '0')} <i>/</i> {String(memories.length).padStart(2, '0')}</span><button className="slideshow-toggle" onClick={() => setSlideshowPaused(!slideshowPaused)} aria-label={slideshowPaused ? 'Resume slideshow' : 'Pause slideshow'} aria-pressed={slideshowPaused}>{slideshowPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}<span>{slideshowPaused ? 'Play' : 'Pause'}</span></button></div></div>
            <div className="photo-stage" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 42) moveMemory(delta < 0 ? 1 : -1); touchStart.current = null; }}>
              <div className="photo-shadow photo-shadow-back" />
              <div className="photo-shadow photo-shadow-front" />
              <figure className="memory-photo" key={memory.image}>
                <img src={`${import.meta.env.BASE_URL}photos/${memory.image}`} alt={memory.alt} />
                <span className="photo-sticker">♡</span>
                <figcaption><span>ALWAYS, US</span><b>{memory.title}</b></figcaption>
              </figure>
              <button className="photo-arrow photo-prev" onClick={() => moveMemory(-1)} aria-label="Previous memory"><ChevronLeft size={20} /></button>
              <button className="photo-arrow photo-next" onClick={() => moveMemory(1)} aria-label="Next memory"><ChevronRight size={20} /></button>
            </div>
            <p className="memory-note" key={`${memory.image}-note`}>{memory.note}</p>
            <div className="memory-dots" aria-label="Choose a memory">{memories.map((item, index) => <button key={item.image} className={index === memoryIndex ? 'active' : ''} onClick={() => setMemoryIndex(index)} aria-label={`Show memory ${index + 1}`} />)}</div>
            <p className="swipe-hint">AUTO-ADVANCE · SWIPE OR USE THE ARROWS</p>
          </section>

          {memoryIndex === memories.length - 1 && <button ref={lastThingRef} className="love-note-trigger is-highlighted" onClick={() => setLoveNoteOpen(true)}>One last thing… <Heart size={15} fill="currentColor" /></button>}

          <a className="page-link back-page-link" href="#note" onClick={(event) => { event.preventDefault(); goToPage('note'); }}><ChevronLeft size={17} /> Back to your birthday note</a>
          <button className="restart-button" onClick={restart}><RotateCcw size={14} /> Start from the beginning</button>
          </> : currentPage === 'candle' ? <>
          <section className={`wish-page ${candleOut ? 'wished' : ''}`}>
            {candleOut && <div className="wish-magic" aria-hidden="true">{wishSparkles.map(([x, y], index) => <span key={index} style={{ '--sparkle-x': `${x}px`, '--sparkle-y': `${y}px`, '--sparkle-delay': `${index * 35}ms` }}>✦</span>)}<i>♥</i></div>}
            <button className={`single-candle ${candleOut ? 'is-out' : ''}`} onClick={() => setCandleOut(!candleOut)} aria-label={candleOut ? 'Relight your candle' : 'Tap to blow out the candle and make a wish'}>
              <span className={`flame ${candleOut ? 'flame-out' : ''}`} />
              <span className="single-wick" />
              <span className="candle-wax"><i /></span>
            </button>
            <p className="wish-hint">{candleOut ? 'Your wish is on its way ✨' : 'Tap the candle to blow it out'}</p>
          </section>
          <button className="restart-button" onClick={restart}><RotateCcw size={14} /> Start from the beginning</button>
          </> : currentPage === 'gift' ? <>
          <section className="gift-page">
            <p className="gift-intro">Right now, I can fulfill one little wish…</p>
            <button className={`gift-unbox ${giftRevealed ? 'is-open' : ''}`} onClick={unwrapGift} aria-label={giftRevealed ? 'Your iPhone gift is revealed' : 'Tap to unwrap your birthday gift'}>
              <span className="gift-box-body"><i className="gift-ribbon-vertical" /><i className="gift-ribbon-horizontal" /></span>
              <span className="gift-box-lid"><i className="gift-bow-left" /><i className="gift-bow-right" /></span>
              <span className="gift-phone"><i className="phone-island" /><i className="phone-heart">♥</i></span>
              {!giftRevealed && <span className="gift-tap-hint">TAP TO UNWRAP</span>}
            </button>
            {giftRevealed && <p className="gift-reveal">An iPhone, as your birthday gift!<br /><small>One little wish down. A lifetime of wishes to go. 💛</small><span className="wink-emoji" role="img" aria-label="wink">😉</span></p>}
          </section>
          {giftRevealed && <a className="page-link next-page-link" href="#note" onClick={(event) => { event.preventDefault(); goToPage('note'); }}>Open your letter <ChevronRight size={17} /></a>}
          <button className="restart-button" onClick={restart}><RotateCcw size={14} /> Start from the beginning</button>
          </> : <>

          <article className="letter-card">
            <div className="letter-top"><span>✦ A NOTE FOR YOU ✦</span><span className="letter-heart"><Heart size={17} fill="currentColor" /></span></div>
            <p className="letter-copy">My love,</p>
            <p className="letter-copy">You make the ordinary feel like the best part of life. Thank you for every laugh, every little kindness, and for being my home no matter where we are.</p>
            <p className="letter-copy">I hope this next trip around the sun brings you all the joy you give to everyone lucky enough to know you. You deserve the whole universe — and at least an extra slice of cake.</p>
            <p className="signature">Forever yours <span>♥</span></p>
          </article>

          <a className="page-link next-page-link" href="#story" onClick={(event) => { event.preventDefault(); goToPage('story'); }}>See our photos <ChevronRight size={17} /></a>
          <button className="restart-button" onClick={restart}><RotateCcw size={14} /> Start from the beginning</button>
          </>}
        </section>
      )}

      {loveNoteOpen && <div className="love-modal-backdrop" onClick={() => setLoveNoteOpen(false)}>
        <section className="love-modal" role="dialog" aria-modal="true" aria-labelledby="love-modal-title" onClick={(event) => event.stopPropagation()}>
          <button ref={modalCloseRef} className="love-modal-close" onClick={() => setLoveNoteOpen(false)} aria-label="Close love note">×</button>
          <span className="love-modal-heart"><Heart size={25} fill="currentColor" /></span>
          <p className="love-modal-kicker">ONE LAST THING…</p>
          <h2 id="love-modal-title">I love you<br /><em>always, forever.</em></h2>
          <span className="love-modal-sparkle">✦ &nbsp; ✦ &nbsp; ✦</span>
        </section>
      </div>}

      <footer className="footer"><span>made for you, always</span><Heart size={12} fill="currentColor" /><span>with love</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
