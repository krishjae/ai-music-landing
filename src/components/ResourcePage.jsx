import React, { useState, useEffect, useRef } from "react";

// Use your uploaded image URLs directly from the attachments
const topImage = "/images/generated-image 1.png";
const pianoKeys = "/images/image1.png";
const circleFifths = "/images/image2.png";

// Animated, prominent section card
function SectionCard({ id, title, children }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [ref]);
  return (
    <section
      id={id}
      ref={ref}
      className={`bg-[#181a2f] rounded-3xl border-2 border-[#7b4eff] px-16 py-16 shadow-2xl mb-20 transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-14"}`}
      style={{
        scrollMarginTop: 100,
        minWidth: 'min(1150px, 100%)',
        fontSize: "1.21rem",
        letterSpacing: ".01em"
      }}
    >
      <h2 className="text-4xl font-extrabold mb-8 text-purple-200 tracking-tight">{title}</h2>
      <div className="prose prose-invert max-w-none text-lg" style={{ fontSize: "1.17em" }}>{children}</div>
    </section>
  );
}

const sections = [
  {
    id: "intro",
    title: "Introduction to Music Theory",
    content: (
      <>
        <p>
          Music theory is the toolkit for understanding, analyzing, and creating music. It covers everything from reading notation to building advanced harmonies and progressions for all genres and instruments.
        </p>
        <ul className="list-disc ml-6 my-5">
          <li>Explains how notes, scales, and chords work together for all instruments.</li>
          <li>Unlocks the ability to play by ear, compose, and improvise confidently.</li>
          <li>Helps you analyze, transcribe, and write music with clarity and intention.</li>
        </ul>
        <p>
          This guide covers staff notation, rhythm, intervals, key signatures, chords, progressions, harmony, form, and ear training. Whether you’re a pianist, guitarist, singer, producer, or composer—you’ll find every core concept here.
        </p>
      </>
    ),
  },
  {
    id: "notation",
    title: "Music Notation & Basics",
    content: (
      <>
        <ul className="list-disc ml-6 mb-6 text-lg">
          <li>
            <b>Treble Clef:</b> Circles the 2nd line ("G"). <br/>
            Right hand for piano; E-G-B-D-F (lines), F-A-C-E (spaces).
          </li>
          <li>
            <b>Bass Clef:</b> Dots around 4th line ("F"). <br/>
            Left hand; G-B-D-F-A (lines), A-C-E-G (spaces).
          </li>
          <li>
            <b>Staff:</b> 5 lines, 4 spaces; ledger lines for notes outside the range.
          </li>
        </ul>
        <div className="flex flex-col items-center mb-6">
          <img src={pianoKeys} alt="Piano Keyboard" className="rounded-2xl border-4 border-[#7b4eff] my-3 w-full max-w-2xl" />
          <span className="text-base text-[#b7acf8] text-center mt-2">
            Piano keyboard C3–C5: note names and one highlighted "middle C".
          </span>
        </div>
        <h4 className="text-2xl mt-5 mb-3 text-purple-200 font-bold">Note Durations Table</h4>
        <table className="border-2 w-full max-w-xl text-lg mb-4">
          <thead>
            <tr className="bg-[#7b4eff] text-white">
              <th>American</th>
              <th>British</th>
              <th>Symbol</th>
              <th>Beats in 4/4</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border px-3">Whole note</td><td className="border px-3">Semibreve</td><td className="border px-3">𝅝</td><td>4</td></tr>
            <tr><td className="border px-3">Half note</td><td className="border px-3">Minim</td><td className="border px-3">𝅗𝅥</td><td>2</td></tr>
            <tr><td className="border px-3">Quarter note</td><td className="border px-3">Crotchet</td><td className="border px-3">𝅘𝅥</td><td>1</td></tr>
            <tr><td className="border px-3">Eighth note</td><td className="border px-3">Quaver</td><td className="border px-3">𝅘𝅥𝅮</td><td>1/2</td></tr>
            <tr><td className="border px-3">Sixteenth note</td><td className="border px-3">Semiquaver</td><td className="border px-3">𝅘𝅥𝅯</td><td>1/4</td></tr>
          </tbody>
        </table>
        <ul className="list-disc ml-6 mt-6 text-lg">
          <li><b>Accidentals:</b> Sharps (#), flats (♭), naturals (♮) alter a note by a semitone.</li>
          <li><b>Bar Lines:</b> Divide music into repeating measures.</li>
          <li><b>Repeat Signs:</b> Indicate passages to repeat.</li>
        </ul>
      </>
    ),
  },
  {
    id: "circle",
    title: "Circle of Fifths & Key Signatures",
    content: (
      <>
        <div className="flex flex-col items-center mb-5">
          <img src={circleFifths} alt="Circle of Fifths" className="rounded-2xl border-4 border-[#7b4eff] my-3 w-full max-w-lg" />
          <span className="text-base text-[#b7acf8] text-center mt-2">
            Circle of Fifths: Major (blue), minor (red), enharmonic (gold).
          </span>
        </div>
        <ul className="list-disc ml-7 mb-4 text-lg">
          <li>
            <b>Sharps:</b> One added per clockwise step. Key = half-step above last sharp in the key signature (e.g. F#: G major).
          </li>
          <li>
            <b>Flats:</b> One added per counterclockwise step. Key = second-to-last flat (one flat = F major).
          </li>
          <li>
            <b>Relative minors:</b> Three semitones below each major (e.g. C → A minor, G → E minor).
          </li>
          <li>
            <b>Enharmonic keys:</b> F#/Gb, C#/Db appear in both forms.
          </li>
        </ul>
        <ol className="ml-7 mb-4 list-decimal text-lg">
          <li><b>Sharp keys:</b> C, G, D, A, E, B, F#, C#</li>
          <li><b>Flat keys:</b> C, F, Bb, Eb, Ab, Db, Gb, Cb</li>
          <li><b>All minor keys:</b> follow the inner circle of the diagram.</li>
        </ol>
        <div className="text-base text-[#b7acf8] mt-2">
          Use the circle to find key signatures, build progressions, and modulate smoothly.
        </div>
      </>
    ),
  },
  {
    id: "rhythm",
    title: "Rhythm, Meter & Time",
    content: (
      <>
        <h4 className="text-2xl mb-2 text-purple-200 font-bold">Time Signatures & Rhythm Reading</h4>
        <ul className="list-disc ml-7 mb-4 text-lg">
          <li><b>Time signature:</b> Top: beats/bar, bottom: value for one beat (e.g., 4=quarter). 4/4 ("common time"), 3/4 (waltz), 2/4 (march), 6/8 (compound: two strong beats, each divided into three).</li>
          <li><b>Measures:</b> Bar lines ("|") mark groups of beats.</li>
          <li><b>Dotted note:</b> Adds half the original note's value (dotted quarter = 1.5 beats in 4/4).</li>
        </ul>
        <table className="border-2 w-full max-w-lg text-xl mb-5">
          <thead>
            <tr className="bg-[#7b4eff] text-white">
              <th>Note</th>
              <th>Symbol</th>
              <th>Beats in 4/4</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Whole</td><td>𝅝</td><td>4</td></tr>
            <tr><td>Half</td><td>𝅗𝅥</td><td>2</td></tr>
            <tr><td>Quarter</td><td>𝅘𝅥</td><td>1</td></tr>
            <tr><td>Eighth</td><td>𝅘𝅥𝅮</td><td>0.5</td></tr>
            <tr><td>Sixteenth</td><td>𝅘𝅥𝅯</td><td>0.25</td></tr>
          </tbody>
        </table>
        <h4 className="text-2xl mt-5 mb-2 text-purple-200 font-bold">Syncopation, Groove, & Advanced Rhythm</h4>
        <ul className="list-disc ml-6 text-lg mb-6">
          <li><b>Groove:</b> The "feel" of the rhythm, how accents fall between beats (vital for funk, jazz, pop, rock).</li>
          <li><b>Syncopation:</b> Accenting normally weak beats/offbeats 🌟, creating surprise and drive.</li>
          <li><b>Swing:</b> Pairs of 8th notes played long-short, the heart of jazz rhythm.</li>
          <li><b>Polyrhythm:</b> Layers of different rhythmic groupings (e.g. 3 against 2, or 4 against 3).</li>
          <li><b>Tuplets:</b> Dividing beats into three (triplet), five (quintuplet), or more equals.</li>
        </ul>
        <div className="text-base text-[#b7acf8]">
          Mastering rhythm lets you play tightly, groove naturally, and improvise creatively.
        </div>
      </>
    ),
  },
  {
    id: "dynamics",
    title: "Tempo, Articulation & Dynamics",
    content: (
      <>
        <h4 className="text-2xl mb-2 text-purple-200 font-bold">Tempo, Dynamics, and Expression</h4>
        <ul className="list-disc ml-6 text-lg mb-4">
          <li><b>Tempo:</b> Measured in beats per minute (BPM). Markings: Grave (very slow), Largo, Andante, Moderato, Allegro (fast), Presto (very fast).</li>
          <li><b>Dynamics:</b> Show loudness/quietness—marked Italian: <b>pp</b> (very soft), <b>ff</b> (very loud), with steps between.</li>
          <li><b>Articulation:</b> Staccato (short/detached), legato (smooth), accent (^), slurs/ties for phrase connection.</li>
        </ul>
        <table className="mb-3 border-2 w-full max-w-lg text-lg">
          <thead>
            <tr className="bg-[#7b4eff] text-white">
              <th>Symbol</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>pp</td><td>Very soft (pianissimo)</td></tr>
            <tr><td>p</td><td>Soft (piano)</td></tr>
            <tr><td>mp</td><td>Moderately soft</td></tr>
            <tr><td>mf</td><td>Moderately loud</td></tr>
            <tr><td>f</td><td>Loud (forte)</td></tr>
            <tr><td>ff</td><td>Very loud (fortissimo)</td></tr>
          </tbody>
        </table>
        <ul className="list-disc ml-6 text-lg">
          <li><b>Crescendo ( &lt; ):</b> Get louder gradually.</li>
          <li><b>Decrescendo ( &gt; ):</b> Get softer smoothly.</li>
        </ul>
        <div className="text-base text-[#b7acf8] mt-2">
          Combining tempo, dynamic, and articulation markings brings your music to life.
        </div>
      </>
    ),
  },
  {
    id: "intervals",
    title: "Intervals",
    content: (
      <>
        <b>Definition:</b> An interval is the pitch distance between two notes (counted in semitones).
        <table className="my-3 border-2 w-full max-w-xl text-lg">
          <thead>
            <tr className="bg-[#7b4eff] text-white">
              <th>Name</th><th>Semitones</th><th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Minor 2nd</td><td>1</td><td>C–D♭</td></tr>
            <tr><td>Major 2nd</td><td>2</td><td>C–D</td></tr>
            <tr><td>Minor 3rd</td><td>3</td><td>C–E♭</td></tr>
            <tr><td>Major 3rd</td><td>4</td><td>C–E</td></tr>
            <tr><td>Perfect 4th</td><td>5</td><td>C–F</td></tr>
            <tr><td>Tritone</td><td>6</td><td>C–F♯/G♭</td></tr>
            <tr><td>Perfect 5th</td><td>7</td><td>C–G</td></tr>
            <tr><td>Minor 6th</td><td>8</td><td>C–A♭</td></tr>
            <tr><td>Major 6th</td><td>9</td><td>C–A</td></tr>
            <tr><td>Minor 7th</td><td>10</td><td>C–B♭</td></tr>
            <tr><td>Major 7th</td><td>11</td><td>C–B</td></tr>
            <tr><td>Octave</td><td>12</td><td>C–C</td></tr>
          </tbody>
        </table>
        <ul className="list-disc ml-7 mb-3 text-lg">
          <li><b>Perfect:</b> 1/unison, 4, 5, 8/octave (stable, conclusive)</li>
          <li><b>Major/minor:</b> 2nd, 3rd, 6th, 7th</li>
          <li><b>Inversion:</b> Intervals "flip", numbers add to 9 (e.g. 3rd ⇄ 6th).</li>
        </ul>
        <div className="text-base text-[#b7acf8]">
          Intervals form the backbone of scales and chords; their sound is essential for ear training and harmony.
        </div>
      </>
    ),
  },
  {
    id: "ear",
    title: "Ear Training",
    content: (
      <>
        <h4 className="text-2xl mb-2 text-purple-200 font-bold">Develop Your Musical Ear</h4>
        <ul className="list-disc ml-7 mb-5 text-lg">
          <li><b>Interval recognition:</b> Practice singing and identifying intervals (e.g., "Here Comes the Bride" = Perfect 4th).</li>
          <li><b>Chord quality:</b> Learn to distinguish major, minor, diminished, augmented, and 7th chords by ear.</li>
          <li><b>Rhythmic dictation:</b> Listen, tap, and notate simple then complex rhythms in various time signatures.</li>
        </ul>
        <h4 className="text-xl mt-6 mb-2 text-purple-200 font-bold">Ear Training Tips</h4>
        <ul className="list-disc ml-7 mb-5 text-lg">
          <li>Use piano or guitar to play and sing all intervals and chords as reference.</li>
          <li>Sight-sing simple melodies with solfege (Do, Re, Mi...).</li>
          <li>Transcribe melodies and chord progressions from your favorite songs.</li>
          <li>Practice with apps or online exercises (Musictheory.net, Teoria, ToneSavvy).</li>
        </ul>
        <div className="text-base text-[#b7acf8]">
          The stronger your ear, the faster you'll play by ear, improvise, or write out your own music!
        </div>
      </>
    ),
  }
];

export default function MusicTheoryGuide() {
  const [active, setActive] = useState(sections[0].id);
  return (
    <div className="min-h-screen bg-[#121324] text-gray-100 font-sans">
      {/* Header */}
      <header className="h-20 flex items-center px-12 bg-gradient-to-r from-[#131527] via-[#1a1d36] to-[#182044] shadow fixed top-0 left-0 right-0 z-30">
        <div className="text-3xl font-extrabold text-white tracking-tight">Looplytic Music Theory Guide</div>
      </header>
      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 h-[calc(100vh-80px)] bg-[#0e1020] px-8 py-12 border-r-2 border-[#23244b] sticky top-20">
          <nav>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                className={`block px-4 py-3 rounded-xl mb-3 text-lg font-semibold transition
                  ${
                    active === s.id
                      ? "bg-[#7b4eff] text-white"
                      : "text-gray-300 hover:bg-[#1c1c33]"
                  }`}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 min-h-screen px-9 md:px-20 py-10">
          <div className="flex flex-col items-center mb-12">
            <img
              src={topImage}
              alt="Music Theory Hero"
              width={640}
              className="rounded-xl shadow-2xl border-4 border-[#181a2f] bg-black mb-3 object-cover object-top"
              style={{ maxWidth: 660, width: "90vw" }}
            />
            <span className="text-lg text-gray-400 mt-1">Reference: Perplexity AI music theory diagrams</span>
          </div>
          <div className="max-w-6xl mx-auto">
            {sections.map((section) => (
              <SectionCard key={section.id} id={section.id} title={section.title}>
                {section.content}
              </SectionCard>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
