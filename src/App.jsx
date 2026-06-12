import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/* ─────────────────────────────────────────────────────────────
   ✏️  EDIT YOUR MESSAGES HERE
   ───────────────────────────────────────────────────────────── */
const DEFAULT_NAME = "প্রিয়"; // shown when no ?to= in URL
const SIGNATURE = "— তোমার প্রিয় মানুষ";

const TOUCH_LINES = [
  "ভালোবাসি 🤍",
  "এই ফুলটা তোমার",
  "yours, always",
  "মনে পড়ে তোমাকে…",
  "তুমি আমার বর্ষা",
  "স্বপ্নটা আর স্বপ্ন থাকবে না, কথা দিলাম",
];

/* Put your song file in /public/ — e.g. song.mp3
   Leave empty string "" to disable the song button entirely. */
const SONG_FILE = "/song.mp3";
/* ───────────────────────────────────────────────────────────── */

/* Read ?to=Name or ?to=তৃণা from the URL */
function getNameFromURL() {
  try {
    const raw = new URLSearchParams(window.location.search).get("to");
    return raw ? decodeURIComponent(raw) : DEFAULT_NAME;
  } catch {
    return DEFAULT_NAME;
  }
}

/* deterministic PRNG so every plant keeps its own personality */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* shared gradients used by every plant SVG */
function Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="petalFill" cx="50%" cy="80%" r="85%">
          <stop offset="0%" stopColor="#fff8e1" />
          <stop offset="45%" stopColor="#fdfcf5" />
          <stop offset="100%" stopColor="#dcd9c6" />
        </radialGradient>
        <radialGradient id="throatFill">
          <stop offset="0%" stopColor="#f3dd96" />
          <stop offset="100%" stopColor="#fdfcf5" />
        </radialGradient>
        <linearGradient id="leafFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3f7d4e" />
          <stop offset="100%" stopColor="#1e4628" />
        </linearGradient>
        <linearGradient id="stemFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c7449" />
          <stop offset="100%" stopColor="#234a2e" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Blossom({ size = 1, delay = 0, breathe = true }) {
  const petal = "M0 6 C -15 -4 -19 -36 0 -56 C 19 -36 15 -4 0 6 Z";
  const angles = [-144, -72, 0, 72, 144];
  return (
    <g className="blossom" transform={`scale(${size})`}>
      {angles.map((a, i) => (
        <g
          key={a}
          className={breathe ? "petal" : "petal petal-still"}
          style={{ "--pd": `${delay + 0.16 * i}s` }}
        >
          <path d={petal} transform={`rotate(${a})`} fill="url(#petalFill)" />
        </g>
      ))}
      <g className="stamens" style={{ "--pd": `${delay + 0.95}s` }}>
        <path d="M0 0 C 5 -14 13 -24 24 -32" className="filament" />
        <path d="M0 0 C -4 -15 -10 -26 -20 -35" className="filament" />
        <path d="M0 0 C 2 -16 4 -28 3 -40" className="filament" />
        <circle cx="24" cy="-32" r="3.4" className="anther" />
        <circle cx="-20" cy="-35" r="3" className="anther" />
        <circle cx="3" cy="-40" r="3" className="anther" />
        <circle r="7" fill="url(#throatFill)" />
      </g>
    </g>
  );
}

function Bud({ x, y, angle, delay }) {
  return (
    <g
      className="bud"
      transform={`translate(${x} ${y}) rotate(${angle})`}
      style={{ "--pd": `${delay}s` }}
    >
      <path d="M0 0 C -8 -10 -7 -30 0 -42 C 7 -30 8 -10 0 0 Z" fill="url(#petalFill)" />
      <path d="M-3 2 C -7 -6 -6 -16 -2 -24 L 2 -24 C 6 -16 7 -6 3 2 Z" fill="#35633f" opacity="0.9" />
    </g>
  );
}

function Plant({ seed, breathe }) {
  const p = useMemo(() => {
    const r = mulberry32(seed);
    return {
      swayDur: 5.5 + r() * 4,
      swayDelay: -r() * 9,
      lean: (r() - 0.5) * 9,
      bloom: r() * 2.4,
      jitter: Array.from({ length: 6 }, () => (r() - 0.5) * 10),
      leaves: r() > 0.45,
    };
  }, [seed]);

  return (
    <svg
      className="plant"
      viewBox="-160 -210 320 432"
      style={{
        "--swayDur": `${p.swayDur}s`,
        "--swayDelay": `${p.swayDelay}s`,
      }}
      aria-hidden="true"
    >
      <g className="plant-bend">
        <g className="plant-sway" transform={`rotate(${p.lean})`}>
          <path
            d="M0 220 C -6 150 4 90 0 30"
            stroke="url(#stemFill)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <g className="leaf leaf-l">
            <path d="M-2 170 C -60 160 -105 120 -118 70 C -70 78 -25 110 -2 158 Z" fill="url(#leafFill)" />
          </g>
          <g className="leaf leaf-r">
            <path d="M2 130 C 58 122 100 86 116 38 C 66 44 22 74 2 118 Z" fill="url(#leafFill)" />
          </g>
          {p.leaves && (
            <g className="leaf leaf-l2">
              <path d="M-1 210 C 48 204 88 176 104 134 C 60 138 20 164 -1 200 Z" fill="url(#leafFill)" opacity="0.85" />
            </g>
          )}
          <path d="M-16 60 C -16 24 16 24 16 60 C 16 78 -16 78 -16 60 Z" fill="#2b5736" />
          <Bud x={-26} y={44} angle={-32 + p.jitter[0]} delay={p.bloom + 1.4} />
          <Bud x={28} y={42} angle={30 + p.jitter[1]} delay={p.bloom + 1.6} />
          <g transform={`translate(-62 -26) rotate(${-22 + p.jitter[2]})`}>
            <Blossom size={0.62} delay={p.bloom + 0.8} breathe={breathe} />
          </g>
          <g transform={`translate(64 -32) rotate(${24 + p.jitter[3]})`}>
            <Blossom size={0.62} delay={p.bloom + 1.0} breathe={breathe} />
          </g>
          <g transform={`translate(-38 -98) rotate(${-12 + p.jitter[4]})`}>
            <Blossom size={0.72} delay={p.bloom + 0.55} breathe={breathe} />
          </g>
          <g transform={`translate(44 -104) rotate(${14 + p.jitter[5]})`}>
            <Blossom size={0.72} delay={p.bloom + 0.3} breathe={breathe} />
          </g>
          <g transform="translate(0 -52)">
            <Blossom size={1} delay={p.bloom} breathe={breathe} />
          </g>
        </g>
      </g>
    </svg>
  );
}

const ROWS = [
  { name: "back", count: 9, par: 5, seed: 11 },
  { name: "mid", count: 7, par: 13, seed: 47 },
  { name: "front", count: 5, par: 26, seed: 83 },
];

function Row({ row }) {
  const plants = useMemo(() => {
    const r = mulberry32(row.seed);
    return Array.from({ length: row.count }, (_, i) => ({
      key: i,
      seed: Math.floor(r() * 1e9),
      left: ((i + 0.1 + r() * 0.8) / row.count) * 108 - 4,
      bottom: r() * 3.5,
      scale: 0.78 + r() * 0.45,
    }));
  }, [row]);

  return (
    <div className={`row row-${row.name}`} style={{ "--par": row.par }}>
      {plants.map((pl) => (
        <div
          key={pl.key}
          className="plant-slot"
          style={{ left: `${pl.left}%`, bottom: `${pl.bottom}vh`, transform: `scale(${pl.scale})` }}
        >
          <Plant seed={pl.seed} breathe={row.name !== "back"} />
        </div>
      ))}
    </div>
  );
}

function Rain({ windRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w, h, raf;

    const fit = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    fit();
    window.addEventListener("resize", fit);

    const newDrop = (init) => ({
      x: Math.random() * 1.3 * w - 0.15 * w,
      y: init ? Math.random() * h : -40 - Math.random() * 60,
      len: 11 + Math.random() * 16,
      sp: 10 + Math.random() * 9,
      ground: h * 0.74 + Math.random() * h * 0.24,
      depth: 0.45 + Math.random() * 0.55,
    });

    const drops = Array.from({ length: 190 }, () => newDrop(true));
    const splashes = [];

    const tick = () => {
      const wind = windRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const d of drops) {
        const slant = 1.4 * wind * d.depth;
        d.x += slant * d.sp * 0.16;
        d.y += d.sp * d.depth * (0.85 + wind * 0.25);
        if (d.y > d.ground) {
          if (splashes.length < 70) {
            splashes.push({ x: d.x, y: d.ground, r: 1, a: 0.4 * d.depth });
          }
          Object.assign(d, newDrop(false));
          continue;
        }
        ctx.strokeStyle = `rgba(205, 215, 245, ${0.1 + d.depth * 0.2})`;
        ctx.lineWidth = d.depth * 1.5;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - slant * 2.2, d.y - d.len * d.depth);
        ctx.stroke();
      }
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.r += 0.9;
        s.a -= 0.025;
        if (s.a <= 0) { splashes.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(210, 220, 245, ${s.a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r, s.r * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [windRef]);

  return <canvas className="rain" ref={ref} aria-hidden="true" />;
}

function Fireflies({ count = 12 }) {
  const flies = useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 2 + r() * 96,
      y: 45 + r() * 50,
      delay: r() * 12,
      drift: 10 + r() * 9,
      blink: 2.2 + r() * 2.5,
      scale: 0.6 + r() * 0.7,
    }));
  }, [count]);
  return (
    <div className="fireflies" aria-hidden="true">
      {flies.map((f) => (
        <span
          key={f.id}
          className="firefly"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            transform: `scale(${f.scale})`,
            animationDuration: `${f.drift}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <i style={{ animationDuration: `${f.blink}s`, animationDelay: `${f.delay}s` }} />
        </span>
      ))}
    </div>
  );
}

/* Generated rain ambience — no file needed */
function useRainSound() {
  const ctxRef = useRef(null);
  const [on, setOn] = useState(false);

  const toggle = async () => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.025 * white) / 1.025;
        data[i] = last * 3.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 850;
      const gain = ctx.createGain();
      gain.gain.value = 0.6;
      src.connect(lp).connect(gain).connect(ctx.destination);
      src.start();
      ctxRef.current = ctx;
      setOn(true);
      return;
    }
    if (ctxRef.current.state === "running") {
      await ctxRef.current.suspend();
      setOn(false);
    } else {
      await ctxRef.current.resume();
      setOn(true);
    }
  };

  return [on, toggle];
}

/* Background song from /public/song.mp3 (or whatever SONG_FILE is set to) */
function useSong() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    if (!SONG_FILE) return;

    if (!audioRef.current) {
      const audio = new Audio(SONG_FILE);
      audio.loop = true;
      audio.volume = 0.55;
      audioRef.current = audio;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        /* autoplay blocked — user must interact first, which they did */
      }
    }
  };

  /* cleanup on unmount */
  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  return [playing, toggle];
}

function App() {
  const name = useMemo(() => getNameFromURL(), []);
  const pageRef = useRef(null);
  const gardenRef = useRef(null);
  const windRef = useRef(1);
  const [flash, setFlash] = useState(0);
  const [bursts, setBursts] = useState([]);
  const touchCount = useRef(0);
  const [rainOn, toggleRain] = useRainSound();
  const [songPlaying, toggleSong] = useSong();

  /* occasional lightning */
  useEffect(() => {
    let t;
    const next = () => {
      t = setTimeout(() => {
        setFlash((f) => f + 1);
        next();
      }, 9000 + Math.random() * 15000);
    };
    next();
    return () => clearTimeout(t);
  }, []);

  /* wind gusts */
  useEffect(() => {
    let t1, t2;
    const cycle = () => {
      t1 = setTimeout(() => {
        windRef.current = 2.3;
        gardenRef.current?.classList.add("gust");
        t2 = setTimeout(() => {
          windRef.current = 1;
          gardenRef.current?.classList.remove("gust");
          cycle();
        }, 2700);
      }, 7000 + Math.random() * 9000);
    };
    cycle();
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* mouse parallax */
  useEffect(() => {
    const el = pageRef.current;
    const move = (e) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      el.style.setProperty("--mx", mx.toFixed(3));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* tap → petal burst + hidden word */
  const onTap = (e) => {
    const id = Date.now() + Math.random();
    const line = TOUCH_LINES[touchCount.current++ % TOUCH_LINES.length];
    setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY, line }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 3400);
  };

  return (
    <main className="scene" ref={pageRef} onClick={onTap}>
      <Defs />

      <div className="sky" aria-hidden="true">
        <div className="moon-glow" />
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="cloud c3" />
        <div className="cloud c4" />
      </div>

      <div className="ground" aria-hidden="true" />
      <div className="mist m1" aria-hidden="true" />
      <div className="mist m2" aria-hidden="true" />

      <div className="garden" ref={gardenRef} aria-label="A garden of swaying white ginger lilies in the rain">
        {ROWS.map((row) => (
          <Row key={row.name} row={row} />
        ))}
      </div>

      <Fireflies />
      <Rain windRef={windRef} />

      {flash > 0 && <div className="lightning" key={flash} aria-hidden="true" />}
      <div className="vignette" aria-hidden="true" />

      {/* name — the only text on screen */}
      <header className="overlay-top">
        <h1 className="title">{name}</h1>
        <p className="subtitle">দোলনচাঁপার বাগান</p>
      </header>

      <p className="signature">{SIGNATURE}</p>

      {/* controls — bottom left */}
      <div className="controls">
        <button
          type="button"
          className={`ctrl-btn ${rainOn ? "on" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleRain(); }}
          title="বৃষ্টির শব্দ"
        >
          {rainOn ? "🔊" : "🌧️"}
        </button>

        {SONG_FILE && (
          <button
            type="button"
            className={`ctrl-btn ${songPlaying ? "on" : ""}`}
            onClick={(e) => { e.stopPropagation(); toggleSong(); }}
            title="গান"
          >
            {songPlaying ? "🎵" : "🎶"}
          </button>
        )}
      </div>

      {/* tap bursts */}
      {bursts.map((b) => (
        <div key={b.id} className="burst" style={{ left: b.x, top: b.y }} aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="burst-petal" style={{ "--a": `${i * 51 + 10}deg` }} />
          ))}
          <em className="burst-line">{b.line}</em>
        </div>
      ))}
    </main>
  );
}

export default App;
