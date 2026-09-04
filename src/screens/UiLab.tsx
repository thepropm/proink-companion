import { useEffect, useState } from "react";
import { BookOpen, BookmarkSimple, ChartBar, FileArrowUp, FolderSimple, GearSix, GridFour, Lightbulb, ListBullets, MagnifyingGlass, SlidersHorizontal, Sliders, SunDim, WifiHigh } from "@phosphor-icons/react";
import "./UiLab.css";

type Screen = "home" | "library" | "reader" | "quick" | "settings";
type SettingsSection = "display" | "reading" | "controls" | "system" | null;

const BOOKS = [
  ["The Art of Reading", "M. Ito", "42%"], ["The Long Way Home", "S. Baker", "New"], ["Deep Work", "C. Newport", "18%"],
  ["Notes on Stillness", "R. Amin", "76%"], ["The Practice", "S. Adams", "New"], ["Sketches of Time", "L. Park", "9%"],
] as const;
const APPS = [["Library", BookOpen], ["Bookmarks", BookmarkSimple], ["Stats", ChartBar], ["Files", FolderSimple], ["Companion", FileArrowUp], ["Settings", GearSix]] as const;

export function UiLab() {
  const [screen, setScreen] = useState<Screen>("home");
  const [focusedApp, setFocusedApp] = useState(0);
  const [grid, setGrid] = useState(true);
  const [speed, setSpeed] = useState<"fast" | "clean">("fast");
  const [light, setLight] = useState(32);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>(null);
  const goHome = () => setScreen("home");
  const goBack = () => {
    if (settingsSection) { setSettingsSection(null); return; }
    setScreen((current) => current === "quick" ? "reader" : current === "reader" || current === "library" || current === "settings" ? "home" : "home");
  };
  const openHomeApp = (index: number) => {
    setFocusedApp(index);
    const label = APPS[index][0];
    setScreen(label === "Library" ? "library" : label === "Settings" ? "settings" : "home");
  };
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (screen !== "home") return;
      const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "ArrowDown" ? 3 : event.key === "ArrowUp" ? -3 : 0;
      if (direction) {
        event.preventDefault();
        setFocusedApp((current) => Math.max(0, Math.min(APPS.length - 1, current + direction)));
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openHomeApp(focusedApp);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusedApp, screen]);
  return <section className="ui-lab">
    <div className="ui-lab-intro"><div><p className="eyebrow">Offline design prototype</p><h1>Proink UI Lab</h1><p>Test the real X4 Pro portrait canvas before we change firmware. Nothing here connects to a device or needs the internet.</p></div><div className="ui-lab-controls"><div className="segmented" role="group" aria-label="Refresh preview"><button className={speed === "fast" ? "selected" : ""} onClick={() => setSpeed("fast")}>Fast refresh</button><button className={speed === "clean" ? "selected" : ""} onClick={() => setSpeed("clean")}>Full clean</button></div><p><strong>{speed === "fast" ? "Fast" : "Full"}</strong> preview: {speed === "fast" ? "no animation, partial e-ink update" : "white-flash cleaning pass"}</p></div></div>
    <div className="ui-lab-workbench"><div className={`eink-device ${speed === "clean" ? "eink-clean" : ""}`}><button className="hardware-key hardware-key-left" onClick={goBack} aria-label="Physical Back button" /><button className="hardware-key hardware-key-right-top" onClick={() => setScreen("quick")} aria-label="Physical light button" /><button className="hardware-key hardware-key-right-bottom" onClick={() => openHomeApp(0)} aria-label="Physical Library button" /><div className="eink-screen"><StatusBar />{screen === "home" && <Home focusedApp={focusedApp} onFocus={setFocusedApp} onOpen={openHomeApp} onRead={() => setScreen("reader")} />}{screen === "library" && <Library grid={grid} onGrid={() => setGrid((value) => !value)} onBack={goHome} />}{screen === "reader" && <Reader onQuick={() => setScreen("quick")} />}{screen === "quick" && <QuickSettings light={light} onLight={setLight} onBack={() => setScreen("reader")} />}{screen === "settings" && <Settings section={settingsSection} onOpen={setSettingsSection} onBack={goBack} />}</div><button className="hardware-home" onClick={goHome} aria-label="Physical Home button" /></div><aside className="ui-lab-notes"><p className="eyebrow">Hardware rules</p><h2>Design within the panel</h2><ul><li>Logical display: <strong>480 x 800</strong> portrait.</li><li>Black, white, and light dither only.</li><li>No scrolling carousels, transparency, or live animation.</li><li>Touch targets: minimum <strong>44 px</strong>.</li><li>Fast refresh for navigation; full refresh after a short cadence.</li></ul><p className="ui-lab-note"><strong>Render contract:</strong> one static redraw per confirmed action, persistent focus instead of press animation, cached metadata before the Home screen opens, and bounded background indexing. Use the arrow keys here to test the launcher focus.</p></aside></div>
  </section>;
}

function StatusBar() { return <header className="eink-status"><span>10:23</span><strong className="proink-wordmark">PRO<span>i</span>NK</strong><span><WifiHigh size={13} weight="bold" /> 82%</span></header>; }
function Home({ focusedApp, onFocus, onOpen, onRead }: { focusedApp: number; onFocus: (index: number) => void; onOpen: (index: number) => void; onRead: () => void }) { return <main className="eink-main"><button className="continue-card" onClick={onRead}><span className="continue-kicker">NOW READING</span><div className="continue-body"><span className="home-book-cover"><small>PROINK<br />READS</small><b>The<br />Art of<br />Reading</b><em>M. Ito</em></span><span className="continue-details"><strong>The Art of Reading</strong><span className="book-meta">M. Ito <i /> 42% complete</span><span className="book-progress"><b style={{ width: "42%" }} /></span><span className="book-stats"><span><b>6</b>Sessions</span><span><b>2h 18m</b>Read time</span><span><b>5.4</b>Pages/min</span><span><b>23m</b>Avg session</span><span><b>Sep 02</b>Started</span><span><b>42%</b>Progress</span></span></span></div><span className="reading-rhythm"><span><b>4 days</b>Streak</span><span><b>12</b>Books read</span><span><b>Evening</b>Best time</span><span><b>Sunday</b>Most read</span></span><em>Continue reading</em></button><div className="app-grid">{APPS.map(([label, Icon], index) => <button key={label} className={`app-tile ${focusedApp === index ? "selected" : ""}`} aria-current={focusedApp === index ? "true" : undefined} onFocus={() => onFocus(index)} onClick={() => onOpen(index)}><Icon size={28} weight="regular" /><span>{label}</span></button>)}</div></main>; }
function Library({ grid, onGrid, onBack }: { grid: boolean; onGrid: () => void; onBack: () => void }) { return <main className="eink-main eink-library"><div className="screen-title"><button onClick={onBack}>‹</button><strong>Library</strong><span>24 books</span></div><div className="library-tools"><button><MagnifyingGlass size={16} /> Search</button><button onClick={onGrid}>{grid ? <ListBullets size={17} /> : <GridFour size={17} />}</button><button><SlidersHorizontal size={17} /></button></div>{grid ? <div className="book-grid">{BOOKS.map(([title, author, progress]) => <button className="book-card" key={title}><span className="book-cover"><b>{title.slice(0, 1)}</b></span><strong>{title}</strong><small>{author} <i /> {progress}</small></button>)}</div> : <div className="book-list">{BOOKS.map(([title, author, progress]) => <button key={title}><BookOpen size={18} /><span><strong>{title}</strong><small>{author}</small></span><em>{progress}</em></button>)}</div>}</main>; }
function Reader({ onQuick }: { onQuick: () => void }) { return <main className="eink-reader"><div className="reader-top"><button>‹</button><span>The Art of Reading</span><button onClick={onQuick}><SunDim size={18} /></button></div><p className="reader-chapter">CHAPTER THREE</p><h2>Reading as a practice</h2><p>Attention is not a thing to be captured. It is a place we learn to return to, one page at a time.</p><p>When the page is quiet, the reader has room to notice what matters. A good device should disappear and leave the words behind.</p><footer><span>42%</span><span>Page 86 of 204</span></footer></main>; }
function QuickSettings({ light, onLight, onBack }: { light: number; onLight: (value: number) => void; onBack: () => void }) { return <main className="eink-main eink-quick"><div className="screen-title"><button onClick={onBack}>‹</button><strong>Quick settings</strong></div><section><h2>Front light</h2><div className="setting-options"><button className="active"><SunDim size={20} />Bright</button><button>Soft</button><button>Auto</button><button>Off</button></div><label>Brightness <output>{light}</output><input type="range" min="0" max="100" value={light} onChange={(event) => onLight(Number(event.target.value))} /></label></section><section><h2>Refresh</h2><div className="setting-options"><button className="active">Fast</button><button>Balanced</button><button>Clean</button></div></section><section><h2>Layout</h2><div className="setting-options"><button className="active">Comfort</button><button>Compact</button><button>Large text</button></div></section></main>; }

const SETTINGS = [
  ["display", "Display & Power", "Light, refresh, sleep", Lightbulb], ["reading", "Reading", "Type, layout, reading aids", BookOpen], ["controls", "Controls", "Buttons, touch, shortcuts", Sliders], ["system", "Companion & Device", "Wi-Fi, files, updates", WifiHigh],
] as const;
type SettingRow = readonly [label: string, value: string, choices?: readonly string[]];
const DETAIL: Record<Exclude<SettingsSection, null>, readonly SettingRow[]> = {
  display: [
    ["Front light", "On", ["Off", "On"]], ["Brightness", "32%", ["0%", "16%", "32%", "48%", "64%", "80%", "100%"]], ["Warmth", "0%", ["0%", "25%", "50%", "75%", "100%"]], ["Restore light on wake", "On", ["Off", "On"]],
    ["Sleep screen", "Book cover", ["Book cover", "Reading stats", "Quiet", "Custom"]], ["Sleep after", "2 min", ["1 min", "2 min", "5 min", "Never"]], ["Refresh clean-up", "Every 8 pages", ["Every 4 pages", "Every 8 pages", "Every 12 pages", "Every 16 pages", "Manual"]], ["Status bar", "Clock & battery", ["Clock & battery", "Battery only", "Clock only", "Hidden"]],
  ],
  reading: [
    ["Reader font", "Literata", ["Literata", "Serif", "Sans", "Dyslexic"]], ["Text size", "18 px", ["16 px", "18 px", "20 px", "22 px", "24 px"]], ["Line spacing", "Comfort", ["Compact", "Comfort", "Open"]], ["Margins", "Balanced", ["Narrow", "Balanced", "Wide"]],
    ["Paragraph spacing", "Standard", ["None", "Standard", "Extra"]], ["Hyphenation", "On", ["Off", "On"]], ["Images", "Show", ["Hide", "Show"]], ["Dictionary", "None", ["None", "English"]], ["Bionic reading", "Off", ["Off", "On"]], ["Guide dots", "Off", ["Off", "On"]], ["Book indexing", "Full section", ["Chapter only", "Full section"]],
  ],
  controls: [
    ["Home button", "Home", ["Home", "Library", "Reading stats"]], ["Side buttons", "Page turn", ["Page turn", "Volume", "Disabled"]], ["Power button", "Sleep", ["Sleep", "Bookmark", "Front light"]], ["Long press", "Quick settings", ["Quick settings", "Home", "Disabled"]],
    ["Tap left side", "Previous page", ["Previous page", "Menu", "Disabled"]], ["Tap right side", "Next page", ["Next page", "Menu", "Disabled"]], ["Tap centre", "Reader menu", ["Reader menu", "Bookmark", "Disabled"]], ["Touch reader controls", "On", ["Off", "On"]], ["Swipe navigation", "On", ["Off", "On"]],
  ],
  system: [
    ["Wi-Fi", "Proink Home", ["Off", "Proink Home"]], ["Companion portal", "proink.local"], ["Wireless book transfer", "Ready", ["Off", "Ready"]], ["Calibre wireless", "Off", ["Off", "Ready"]],
    ["Reading sync", "Off", ["Off", "On"]], ["Device name", "Proink X4 Pro"], ["Storage", "6.2 GB free"], ["Files & cache", "Manage"], ["Software update", "Up to date"], ["About Proink", "v0.2.0"],
  ],
};
function Settings({ section, onOpen, onBack }: { section: SettingsSection; onOpen: (section: SettingsSection) => void; onBack: () => void }) {
  if (section) return <SettingsDetail section={section} onBack={onBack} />;
  return <main className="eink-main eink-settings"><div className="screen-title"><button onClick={onBack}>‹</button><strong>Settings</strong></div><p className="settings-intro">Make the reader feel like yours.</p><div className="settings-menu">{SETTINGS.map(([id, title, note, Icon]) => <button key={id} onClick={() => onOpen(id)}><Icon size={23} /><span><strong>{title}</strong><small>{note}</small></span><b>›</b></button>)}</div></main>;
}
function SettingsDetail({ section, onBack }: { section: Exclude<SettingsSection, null>; onBack: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const title = SETTINGS.find(([id]) => id === section)?.[1] ?? "Settings";
  return <main className="eink-main eink-settings"><div className="screen-title"><button onClick={onBack}>‹</button><strong>{title}</strong></div><p className="settings-intro">Tap a setting to preview its next choice.</p><div className="settings-detail">{DETAIL[section].map(([label, initial, choices]) => { const value = values[label] ?? initial; const isToggle = choices?.length === 2 && choices.includes("Off") && choices.includes("On"); return <button key={label} onClick={() => choices && setValues((current) => ({ ...current, [label]: choices[(choices.indexOf(value) + 1) % choices.length] }))}><span><strong>{label}</strong><small>{value}</small></span>{isToggle ? <i className={value === "On" ? "switch on" : "switch"} /> : choices ? <b>›</b> : <em>Info</em>}</button>; })}</div></main>;
}
