import { useState } from "react";
import {
  BookOpen,
  ChartBar,
  FileText,
  FolderSimple,
  Moon,
  SunDim,
  Translate,
} from "@phosphor-icons/react";
import "./InkModPreview.css";

type View = "home" | "library" | "reader" | "sleep";

export function InkModPreview() {
  const [view, setView] = useState<View>("home");
  const [readerMenu, setReaderMenu] = useState(false);
  const [clipped, setClipped] = useState(false);
  const [night, setNight] = useState(false);

  return (
    <section className="inkmod-preview">
      <div className="inkmod-device" data-night={night || undefined}>
        <div className="inkmod-screen">
          <div className="inkmod-status"><span>10:42</span><span>Wi-Fi  92%</span></div>
          {view === "home" && (
            <>
              <header className="inkmod-title"><strong>inkMOD</strong><small>X4 / X3 preview</small></header>
              <button className="inkmod-continue" onClick={() => setView("reader")}>
                <span><small>CONTINUE READING</small><strong>North of the Quiet River</strong><em>EPUB · 42% · 2h 18m left</em></span>
                <b>Read</b>
              </button>
              <div className="inkmod-home-grid">
                <button onClick={() => setView("library")}><BookOpen size={25} />Library<small>EPUB · FB2 · TXT</small></button>
                <button onClick={() => setView("library")}><FolderSimple size={25} />Files<small>SD card manager</small></button>
                <button><ChartBar size={25} />Stats<small>Sessions & progress</small></button>
                <button onClick={() => setView("sleep")}><Moon size={25} />Sleep screen<small>Cover & overlay</small></button>
              </div>
              <footer className="inkmod-home-footer">Minimal theme · English keyboard · 6.2 GB free</footer>
            </>
          )}
          {view === "library" && (
            <>
              <header className="inkmod-title"><button onClick={() => setView("home")}>Back</button><strong>Library</strong><small>4 books</small></header>
              <div className="inkmod-list">
                <button onClick={() => setView("reader")}><FileText size={22} /><span><strong>North of the Quiet River</strong><small>EPUB · 42% complete</small></span></button>
                <button><FileText size={22} /><span><strong>The Long Way Home</strong><small>FB2.ZIP · New</small></span></button>
                <button><FileText size={22} /><span><strong>Notes from Stillness</strong><small>FB2 · 76% complete</small></span></button>
                <button><FileText size={22} /><span><strong>Field Guide to Thinking</strong><small>TXT · New</small></span></button>
              </div>
              <footer className="inkmod-home-footer">File manager · browser upload · book information</footer>
            </>
          )}
          {view === "reader" && (
            <>
              <header className="inkmod-reader-head"><button onClick={() => setView("home")}>Back</button><strong>North of the Quiet River</strong><button onClick={() => setNight((value) => !value)} aria-label="Toggle reader night mode"><SunDim size={19} /></button></header>
              <article className="inkmod-reader-copy">
                <small>CHAPTER THREE</small>
                <h1>A slower kind of attention</h1>
                <p>Reading asks for a quiet place in the day. The page becomes a small room where ideas can remain long enough to be noticed.</p>
                <p>Hold a word for a dictionary, or select a passage to save it as a clipping. The preview keeps those actions local and safe.</p>
                <button onClick={() => setClipped(true)}>Save selection as clipping</button>
              </article>
              {readerMenu && <section className="inkmod-reader-menu"><div><button>Contents</button><button>Bookmarks</button><button className={clipped ? "active" : ""}>Clippings {clipped ? "1" : ""}</button></div><p>{clipped ? "“The page becomes a small room...”" : "No clippings yet."}</p><button className="inkmod-dictionary"><Translate size={18} />Dictionary: attention</button></section>}
              <footer className="inkmod-reader-footer"><span>42%</span><button onClick={() => setReaderMenu((value) => !value)}>{readerMenu ? "Close menu" : "Reader menu"}</button><span>86 / 204</span></footer>
            </>
          )}
          {view === "sleep" && (
            <div className="inkmod-sleep">
              <Moon size={39} /><h1>North of the Quiet River</h1><p>Custom sleep cover preview</p><div className="inkmod-sleep-overlay">Transparent overlay</div><button onClick={() => setView("home")}>Wake device</button>
            </div>
          )}
        </div>
      </div>
      <aside className="inkmod-notes">
        <p className="eyebrow">Safe desktop reference</p>
        <h1>inkMOD Feature Preview</h1>
        <p>This is a local visual prototype inspired by documented inkMOD capabilities. It does not build, flash, connect to, or modify an e-reader.</p>
        <h2>Try these flows</h2>
        <ul>
          <li>Open Library to compare EPUB, FB2 and FB2.ZIP handling.</li>
          <li>Open a book, save a clipping, then open Reader menu.</li>
          <li>Toggle the sun icon for reader-only night mode.</li>
          <li>Open Sleep screen to inspect transparent-overlay behavior.</li>
        </ul>
        <p className="inkmod-callout"><strong>Upstream simulator status:</strong> inkMOD includes SDL simulator code, but its required local PlatformIO configuration is absent from the published clone. This preview remains the runnable, zero-risk comparison while that upstream setup is resolved.</p>
      </aside>
    </section>
  );
}
