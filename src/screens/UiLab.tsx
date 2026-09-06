import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowsClockwise,
  ArrowFatUp,
  Backspace,
  BatteryHigh,
  Bluetooth,
  BookOpen,
  BookmarkSimple,
  ChartBar,
  FileArrowUp,
  FolderSimple,
  GearSix,
  GridFour,
  HardDrive,
  Lightbulb,
  ListBullets,
  MagnifyingGlass,
  Moon,
  SlidersHorizontal,
  Sliders,
  SunDim,
  Thermometer,
  Usb,
  WifiHigh,
} from "@phosphor-icons/react";
import "./UiLab.css";

type Screen = "home" | "library" | "files" | "reader" | "quick" | "settings";
type SettingsSection = "display" | "reading" | "controls" | "system" | null;
type SettingsPage =
  | SettingsSection
  | "frontlight"
  | "sleep"
  | "sleep-cover"
  | "sleep-image"
  | "sleep-text"
  | "status-bar"
  | "status-icons"
  | "refresh"
  | "font-setup"
  | "font-family"
  | "font-size"
  | "line-spacing"
  | "word-spacing"
  | "page-layout"
  | "screen-margins"
  | "home-button"
  | "power-button"
  | "side-buttons"
  | "quick-actions"
  | "taps-gestures"
  | "connectivity"
  | "wifi"
  | "bluetooth"
  | "companion-link"
  | "catalogs"
  | "reading-sync"
  | "storage"
  | "device-time"
  | "device-name"
  | "settings-backup"
  | "updates-about"
  | "file-settings";
type KeyboardRequest = {
  title: string;
  value: string;
  kind: "text" | "time";
  onChange?: (value: string) => void;
  onCursorChange?: (cursor: number) => void;
  onDismiss?: () => void;
  onSubmit: (value: string) => void;
  submitLabel?: string;
};
type StatusSettings = {
  battery: boolean;
  clock: boolean;
  date: boolean;
  wifi: boolean;
  bluetooth: boolean;
  sync: boolean;
  usb: boolean;
  charging: boolean;
  light: boolean;
  sleep: boolean;
  storage: boolean;
};
type ReaderPreferences = {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  wordSpacing: number;
  smoothText: boolean;
};
type LayoutPreferences = {
  verticalMargin: number;
  horizontalMargin: number;
  alignment: "Justify" | "Left" | "Center" | "Right" | "Book's style";
  dictionary: string;
  hyphenation: boolean;
  extraParagraphSpacing: boolean;
  forceIndents: boolean;
  pageNumbers: boolean;
  touchControls:
    "On" | "Off completely" | "Taps off" | "Swipes off" | "Dictionary only";
  embeddedStyle: boolean;
  images: boolean;
};
type ControlPreferences = {
  homeTap: string;
  homeDoubleTap: string;
  homeLongPress: string;
  powerShort: string;
  powerLong: string;
  powerCombo: string;
  sideLayout: string;
  sideLongPress: string;
  sideCombo: string;
  quickAction: string;
  pageTurn: string;
  pinch: "On" | "Off";
  twoFinger: string;
  readerTouch: string;
};

const BOOKS = [
  ["The Art of Reading", "M. Ito", "42%"],
  ["The Long Way Home", "S. Baker", "New"],
  ["Deep Work", "C. Newport", "18%"],
  ["Notes on Stillness", "R. Amin", "76%"],
  ["The Practice", "S. Adams", "New"],
  ["Sketches of Time", "L. Park", "9%"],
] as const;
const APPS = [
  ["Library", BookOpen],
  ["Bookmarks", BookmarkSimple],
  ["Stats", ChartBar],
  ["Files", FolderSimple],
  ["Companion", FileArrowUp],
  ["Settings", GearSix],
] as const;

export function UiLab() {
  const [screen, setScreen] = useState<Screen>("home");
  const [focusedApp, setFocusedApp] = useState(0);
  const [grid, setGrid] = useState(true);
  const [speed, setSpeed] = useState<"fast" | "clean">("fast");
  const [light, setLight] = useState(32);
  const [darkMode, setDarkMode] = useState(false);
  const [uiScale, setUiScale] = useState<"small" | "normal">("small");
  const [statusSettings, setStatusSettings] = useState<StatusSettings>({
    battery: true,
    clock: true,
    date: false,
    wifi: true,
    bluetooth: false,
    sync: true,
    usb: false,
    charging: false,
    light: false,
    sleep: false,
    storage: false,
  });
  const [settingsPage, setSettingsPage] = useState<SettingsPage>(null);
  const [keyboard, setKeyboard] = useState<KeyboardRequest | null>(null);
  const [deviceScale, setDeviceScale] = useState(1);
  const workbenchRef = useRef<HTMLDivElement>(null);
  const goHome = () => {
    setKeyboard(null);
    setScreen("home");
  };
  const goBack = () => {
    if (keyboard) {
      setKeyboard(null);
      return;
    }
    if (
      settingsPage === "frontlight" ||
      settingsPage === "sleep" ||
      settingsPage === "status-bar" ||
      settingsPage === "refresh"
    ) {
      setSettingsPage("display");
      return;
    }
    if (settingsPage === "font-setup" || settingsPage === "page-layout") {
      setSettingsPage("reading");
      return;
    }
    if (
      settingsPage === "font-family" ||
      settingsPage === "font-size" ||
      settingsPage === "line-spacing" ||
      settingsPage === "word-spacing"
    ) {
      setSettingsPage("font-setup");
      return;
    }
    if (settingsPage === "screen-margins") {
      setSettingsPage("page-layout");
      return;
    }
    if (
      settingsPage === "home-button" ||
      settingsPage === "power-button" ||
      settingsPage === "side-buttons" ||
      settingsPage === "quick-actions" ||
      settingsPage === "taps-gestures"
    ) {
      setSettingsPage("controls");
      return;
    }
    if (
      settingsPage === "connectivity" ||
      settingsPage === "storage" ||
      settingsPage === "device-time" ||
      settingsPage === "settings-backup" ||
      settingsPage === "updates-about"
    ) {
      setSettingsPage("system");
      return;
    }
    if (settingsPage === "device-name") {
      setSettingsPage("device-time");
      return;
    }
    if (
      settingsPage === "wifi" ||
      settingsPage === "bluetooth" ||
      settingsPage === "companion-link" ||
      settingsPage === "catalogs" ||
      settingsPage === "reading-sync"
    ) {
      setSettingsPage("connectivity");
      return;
    }
    if (settingsPage === "file-settings") {
      setSettingsPage(null);
      setScreen("files");
      return;
    }
    if (settingsPage === "status-icons") {
      setSettingsPage("status-bar");
      return;
    }
    if (
      settingsPage === "sleep-cover" ||
      settingsPage === "sleep-image" ||
      settingsPage === "sleep-text"
    ) {
      setSettingsPage("sleep");
      return;
    }
    if (settingsPage) {
      setSettingsPage(null);
      return;
    }
    setScreen((current) =>
      current === "quick"
        ? "reader"
        : current === "reader" ||
            current === "library" ||
            current === "files" ||
            current === "settings"
          ? "home"
          : "home",
    );
  };
  const openHomeApp = (index: number) => {
    setFocusedApp(index);
    const label = APPS[index][0];
    setScreen(
      label === "Library"
        ? "library"
        : label === "Files"
          ? "files"
          : label === "Settings"
            ? "settings"
            : "home",
    );
  };
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (screen !== "home") return;
      const direction =
        event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowLeft"
            ? -1
            : event.key === "ArrowDown"
              ? 3
              : event.key === "ArrowUp"
                ? -3
                : 0;
      if (direction) {
        event.preventDefault();
        setFocusedApp((current) =>
          Math.max(0, Math.min(APPS.length - 1, current + direction)),
        );
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openHomeApp(focusedApp);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusedApp, screen]);
  useEffect(() => {
    const updateDeviceScale = () => {
      // The 558px footprint includes the shell and the side hardware keys.
      const availableWidth =
        workbenchRef.current?.clientWidth ?? window.innerWidth;
      const availableHeight = window.innerHeight - 48;
      setDeviceScale(
        Math.min(
          1,
          Math.max(0.58, Math.min(availableWidth / 558, availableHeight / 926)),
        ),
      );
    };
    updateDeviceScale();
    const observer = new ResizeObserver(updateDeviceScale);
    if (workbenchRef.current) observer.observe(workbenchRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="ui-lab">
      <div className="ui-lab-workbench">
        <div className="eink-simulator-column" ref={workbenchRef}>
        <div
          className="eink-device-frame"
          style={{
            width: `${558 * deviceScale}px`,
            height: `${926 * deviceScale}px`,
          }}
        >
          <div
            className={`eink-device ${speed === "clean" ? "eink-clean" : ""}`}
            style={{
              left: `${13 * deviceScale}px`,
              transform: `scale(${deviceScale})`,
            }}
          >
            <button
              className="hardware-key hardware-key-left"
              onClick={goBack}
              aria-label="Physical Back button"
            />
            <button
              className="hardware-key hardware-key-right-top"
              onClick={() => setScreen("quick")}
              aria-label="Physical light button"
            />
            <button
              className="hardware-key hardware-key-right-bottom"
              onClick={() => openHomeApp(0)}
              aria-label="Physical Library button"
            />
            <div
              className={`eink-screen ${darkMode ? "eink-dark" : ""} ui-scale-${uiScale}`}
            >
              <StatusBar settings={statusSettings} />
              {screen === "home" && (
                <Home
                  focusedApp={focusedApp}
                  onFocus={setFocusedApp}
                  onOpen={openHomeApp}
                  onRead={() => setScreen("reader")}
                />
              )}
              {screen === "library" && (
                <Library
                  grid={grid}
                  onGrid={() => setGrid((value) => !value)}
                  onBack={goHome}
                  onKeyboard={setKeyboard}
                />
              )}
              {screen === "files" && (
                <Files
                  onBack={goHome}
                  onKeyboard={setKeyboard}
                  onSettings={() => {
                    setSettingsPage("file-settings");
                    setScreen("settings");
                  }}
                />
              )}
              {screen === "reader" && (
                <Reader light={light} onLight={setLight} />
              )}
              {screen === "quick" && (
                <QuickSettings
                  light={light}
                  onLight={setLight}
                  onBack={() => setScreen("reader")}
                />
              )}
              {screen === "settings" && (
                <Settings
                  page={settingsPage}
                  onOpen={setSettingsPage}
                  onBack={goBack}
                  onKeyboard={setKeyboard}
                  darkMode={darkMode}
                  onDarkMode={setDarkMode}
                  uiScale={uiScale}
                  onUiScale={setUiScale}
                  statusSettings={statusSettings}
                  onStatusSettings={setStatusSettings}
                />
              )}
              {keyboard && (
                <EinkKeyboard
                  request={keyboard}
                  onClose={() => setKeyboard(null)}
                />
              )}
            </div>
            <button
              className="hardware-home"
              onClick={goHome}
              aria-label="Physical Home button"
            />
          </div>
        </div>
        </div>
        <aside className="ui-lab-sidebar">
          <div className="ui-lab-intro">
            <p className="eyebrow">Offline design prototype</p>
            <h1>Proink UI Lab</h1>
            <p>
              Test the real X4 Pro portrait canvas before we change firmware.
              Nothing here connects to a device or needs the internet.
            </p>
          </div>
          <div className="ui-lab-controls">
            <div className="segmented" role="group" aria-label="Refresh preview">
              <button
                className={speed === "fast" ? "selected" : ""}
                onClick={() => setSpeed("fast")}
              >
                Fast refresh
              </button>
              <button
                className={speed === "clean" ? "selected" : ""}
                onClick={() => setSpeed("clean")}
              >
                Full clean
              </button>
            </div>
            <p>
              <strong>{speed === "fast" ? "Fast" : "Full"}</strong> preview:{" "}
              {speed === "fast"
                ? "no animation, partial e-ink update"
                : "white-flash cleaning pass"}
            </p>
          </div>
          <div className="ui-lab-notes">
          <p className="eyebrow">Hardware rules</p>
          <h2>Design within the panel</h2>
          <ul>
            <li>
              Logical display: <strong>480 x 800</strong> portrait.
            </li>
            <li>Black, white, and light dither only.</li>
            <li>
              Touch targets: minimum <strong>44 px</strong>.
            </li>
          </ul>
          <p className="ui-lab-note">
            <strong>Reader prototype:</strong> tap the top-right light icon for
            the quick panel; tap the page or use the bottom menu to test reading
            actions.
          </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatusBar({ settings }: { settings: StatusSettings }) {
  const rightIcons = [
    ["wifi", WifiHigh],
    ["bluetooth", Bluetooth],
    ["sync", ArrowsClockwise],
    ["usb", Usb],
    ["charging", BatteryHigh],
    ["light", SunDim],
    ["sleep", Moon],
    ["storage", HardDrive],
  ] as const;
  return (
    <header className="eink-status">
      <span className="status-left">
        {settings.clock && "10:23"}
        {settings.date && <em>Sep 05</em>}
      </span>
      <strong className="proink-wordmark">
        PRO<span>i</span>NK
      </strong>
      <span className="status-right">
        {rightIcons.map(
          ([key, Icon]) =>
            settings[key] && <Icon key={key} size={12} weight="bold" />,
        )}
        {settings.battery && "82%"}
      </span>
    </header>
  );
}
function Home({
  focusedApp,
  onFocus,
  onOpen,
  onRead,
}: {
  focusedApp: number;
  onFocus: (index: number) => void;
  onOpen: (index: number) => void;
  onRead: () => void;
}) {
  return (
    <main className="eink-main">
      <button className="continue-card" onClick={onRead}>
        <span className="continue-kicker">NOW READING</span>
        <div className="continue-body">
          <span className="home-book-cover">
            <small>
              PROINK
              <br />
              READS
            </small>
            <b>
              The
              <br />
              Art of
              <br />
              Reading
            </b>
            <em>M. Ito</em>
          </span>
          <span className="continue-details">
            <strong>The Art of Reading</strong>
            <span className="book-meta">
              M. Ito <i /> 42% complete
            </span>
            <span className="book-progress">
              <b style={{ width: "42%" }} />
            </span>
            <span className="book-stats">
              <span>
                <b>6</b>Sessions
              </span>
              <span>
                <b>2h 18m</b>Read time
              </span>
              <span>
                <b>5.4</b>Pages/min
              </span>
              <span>
                <b>23m</b>Avg session
              </span>
              <span>
                <b>Sep 02</b>Started
              </span>
              <span>
                <b>42%</b>Progress
              </span>
            </span>
          </span>
        </div>
        <span className="reading-rhythm">
          <span>
            <b>4 days</b>Streak
          </span>
          <span>
            <b>12</b>Books read
          </span>
          <span>
            <b>Evening</b>Best time
          </span>
          <span>
            <b>Sunday</b>Most read
          </span>
        </span>
        <em>Continue reading</em>
      </button>
      <div className="app-grid">
        {APPS.map(([label, Icon], index) => (
          <button
            key={label}
            className={`app-tile ${focusedApp === index ? "selected" : ""}`}
            aria-current={focusedApp === index ? "true" : undefined}
            onFocus={() => onFocus(index)}
            onClick={() => onOpen(index)}
          >
            <Icon size={28} weight="regular" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
function Library({
  grid,
  onGrid,
  onBack,
  onKeyboard,
}: {
  grid: boolean;
  onGrid: () => void;
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
}) {
  const [query, setQuery] = useState("");
  const books = BOOKS.filter(([title, author]) =>
    `${title} ${author}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="eink-main eink-library">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Library</strong>
        <span>{query ? `${books.length} found` : "24 books"}</span>
      </div>
      <div className="library-tools">
        <button
          onClick={() =>
            onKeyboard({
              title: "Search library",
              value: query,
              kind: "text",
              onChange: setQuery,
              onSubmit: setQuery,
            })
          }
        >
          <MagnifyingGlass size={16} /> {query || "Search"}
        </button>
        <button onClick={onGrid}>
          {grid ? <ListBullets size={17} /> : <GridFour size={17} />}
        </button>
        <button>
          <SlidersHorizontal size={17} />
        </button>
      </div>
      {grid ? (
        <div className="book-grid">
          {books.map(([title, author, progress]) => (
            <button className="book-card" key={title}>
              <span className="book-cover">
                <b>{title.slice(0, 1)}</b>
              </span>
              <strong>{title}</strong>
              <small>
                {author} <i /> {progress}
              </small>
            </button>
          ))}
        </div>
      ) : (
        <div className="book-list">
          {books.map(([title, author, progress]) => (
            <button key={title}>
              <BookOpen size={18} />
              <span>
                <strong>{title}</strong>
                <small>{author}</small>
              </span>
              <em>{progress}</em>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
function Files({
  onBack,
  onKeyboard,
  onSettings,
}: {
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
  onSettings: () => void;
}) {
  const [query, setQuery] = useState("");
  const items = [
    ["Books", "Folder · 24 books"],
    ["Images", "Folder · 8 images"],
    ["Fonts", "Folder · 5 fonts"],
    ["Dictionaries", "Folder · 3 dictionaries"],
    ["Downloads", "Folder · 12 files"],
    ["settings-backup.proink", "Backup · 2 KB"],
  ] as const;
  const visible = items.filter(([name, note]) =>
    `${name} ${note}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="eink-main eink-library eink-files">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Files</strong>
        <span>{query ? `${visible.length} found` : "SD card"}</span>
      </div>
      <div className="library-tools">
        <button
          className={query ? "active-search" : ""}
          onClick={() =>
            onKeyboard({
              title: "Find files",
              value: query,
              kind: "text",
              onChange: setQuery,
              onSubmit: setQuery,
            })
          }
        >
          <MagnifyingGlass size={16} /> {query || "Find files"}
        </button>
        <button onClick={onSettings} aria-label="File settings">
          <SlidersHorizontal size={17} />
        </button>
      </div>
      <div className="file-list">
        {visible.map(([name, note]) => (
          <button key={name}>
            <FolderSimple size={19} />
            <span>
              <strong>{name}</strong>
              <small>{note}</small>
            </span>
            <b>›</b>
          </button>
        ))}
      </div>
    </main>
  );
}
function Reader({
  light,
  onLight,
}: {
  light: number;
  onLight: (value: number) => void;
}) {
  const [page, setPage] = useState(86);
  const [fontSize, setFontSize] = useState(19);
  const [menu, setMenu] = useState<
    "contents" | "progress" | "layout" | "more" | null
  >(null);
  const [selection, setSelection] = useState(false);
  const [lookup, setLookup] = useState<"dictionary" | "clip" | null>(null);
  const [clipCount, setClipCount] = useState(0);
  const [screenshot, setScreenshot] = useState(false);
  const [readerMenuOpen, setReaderMenuOpen] = useState(false);
  const [quickPanel, setQuickPanel] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const advance = (amount: number) =>
    setPage((current) => Math.max(1, Math.min(204, current + amount)));
  const selectText = () => {
    setSelection(true);
    setLookup(null);
  };
  const gestureEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const touch = event.changedTouches[0];
    const distance = touch.clientY - touchStart.current.y;
    const horizontal = Math.abs(touch.clientX - touchStart.current.x);
    touchStart.current = null;
    if (horizontal > 42 || Math.abs(distance) < 52) return;
    event.preventDefault();
    swiped.current = true;
    if (distance < 0) {
      setQuickPanel(false);
      setReaderMenuOpen(true);
      setMenu("contents");
    } else {
      setReaderMenuOpen(false);
      setMenu(null);
      setQuickPanel(true);
    }
  };
  return (
    <main
      className="eink-reader"
      onTouchStart={(event) => {
        touchStart.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }}
      onTouchEnd={gestureEnd}
    >
      <div className="reader-top">
        <button onClick={() => advance(-1)}>‹</button>
        <span>The Art of Reading</span>
        <button onClick={() => setQuickPanel(true)}>
          <SunDim size={18} />
        </button>
      </div>
      <div
        className="reader-page"
        style={{ fontSize }}
        onClick={() => {
          if (swiped.current) {
            swiped.current = false;
            return;
          }
          advance(1);
        }}
      >
        <p className="reader-chapter">CHAPTER THREE</p>
        <h2>Reading as a practice</h2>
        <p>
          Attention is not a thing to be captured. It is a place we learn to
          return to, one page at a time.
        </p>
        <p onDoubleClick={selectText}>
          When the page is quiet, the reader has room to notice what matters. A
          good device should disappear and leave the words behind.
        </p>
        <button
          className="reader-select-trigger"
          onClick={(event) => {
            event.stopPropagation();
            selectText();
          }}
        >
          Select text
        </button>
      </div>
      <footer>
        <span>42%</span>
        <span>Page {page} of 204</span>
      </footer>
      {selection && (
        <div className="reader-selection">
          <i className="selection-handle left" />
          <mark>
            When the page is quiet, the reader has room to notice what matters.
          </mark>
          <i className="selection-handle right" />
          <div>
            <button onClick={() => setLookup("dictionary")}>Dictionary</button>
            <button
              onClick={() => {
                setClipCount((current) => current + 1);
                setLookup("clip");
                setSelection(false);
              }}
            >
              Clip
            </button>
            <button onClick={() => setSelection(false)}>Cancel</button>
          </div>
        </div>
      )}
      {lookup === "dictionary" && (
        <ReaderSheet title="Dictionary" onClose={() => setLookup(null)}>
          <strong>quiet</strong>
          <p>Free from disturbance; still and calm.</p>
          <small>English - English dictionary</small>
        </ReaderSheet>
      )}
      {lookup === "clip" && (
        <ReaderSheet title="Clipping saved" onClose={() => setLookup(null)}>
          <p>
            Saved to <strong>Clippings</strong> with page {page} and the current
            time.
          </p>
        </ReaderSheet>
      )}
      {screenshot && (
        <ReaderSheet
          title="Screenshot saved"
          onClose={() => setScreenshot(false)}
        >
          <p>
            Saved to <strong>Files / Images / Screenshots</strong>.
          </p>
        </ReaderSheet>
      )}
      {quickPanel && (
        <ReaderQuickPanel
          light={light}
          onLight={onLight}
          onClose={() => setQuickPanel(false)}
        />
      )}
      {readerMenuOpen && menu && (
        <ReaderMenu
          active={menu}
          fontSize={fontSize}
          clips={clipCount}
          onClose={() => {
            setMenu(null);
            setReaderMenuOpen(false);
          }}
          onSelect={setMenu}
          onFontSize={setFontSize}
          onScreenshot={() => {
            setScreenshot(true);
            setMenu(null);
          }}
        />
      )}
      {readerMenuOpen && <nav className="reader-bottom-menu">
        <button onClick={() => setMenu("contents")}>
          ☰<span>Contents</span>
        </button>
        <button onClick={() => setMenu("progress")}>
          ◉<span>Progress</span>
        </button>
        <button onClick={() => setMenu("layout")}>
          A<span>Layout</span>
        </button>
        <button onClick={() => setMenu("more")}>
          •••<span>More</span>
        </button>
      </nav>}
    </main>
  );
}
function ReaderSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <section className="reader-sheet">
      <header>
        <strong>{title}</strong>
        <button onClick={onClose}>×</button>
      </header>
      <div>{children}</div>
    </section>
  );
}
function ReaderQuickPanel({
  light,
  onLight,
  onClose,
}: {
  light: number;
  onLight: (value: number) => void;
  onClose: () => void;
}) {
  const [warmth, setWarmth] = useState(50);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const step = (setter: (value: number) => void, value: number, amount: number) =>
    setter(Math.max(0, Math.min(100, value + amount)));
  return (
    <section
      className="reader-quick-panel"
      onTouchStart={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
    >
      <header>
        <strong>Quick controls</strong>
        <button onClick={onClose} aria-label="Close quick controls">×</button>
      </header>
      <div className="reader-quick-levels">
        <label>
          Brightness <output>{light}%</output>
          <span>
            <button onClick={() => step(onLight, light, -10)}>−</button>
            <input type="range" min="0" max="100" value={light} onChange={(event) => onLight(Number(event.target.value))} />
            <button onClick={() => step(onLight, light, 10)}>+</button>
          </span>
        </label>
        <label>
          Warmth <output>{warmth < 45 ? "Cool" : warmth > 55 ? "Warm" : "Neutral"}</output>
          <span>
            <button onClick={() => step(setWarmth, warmth, -10)}>−</button>
            <input type="range" min="0" max="100" value={warmth} onChange={(event) => setWarmth(Number(event.target.value))} />
            <button onClick={() => step(setWarmth, warmth, 10)}>+</button>
          </span>
        </label>
      </div>
      <div className="reader-quick-actions">
        <button className={wifi ? "active" : ""} onClick={() => setWifi((value) => !value)}><WifiHigh size={19} />Wi-Fi</button>
        <button className={bluetooth ? "active" : ""} onClick={() => setBluetooth((value) => !value)}><Bluetooth size={19} />Bluetooth</button>
        <button className={refreshed ? "active" : ""} onClick={() => setRefreshed(true)}><ArrowsClockwise size={19} />Refresh</button>
        <button onClick={() => step(onLight, light, 10)}><SunDim size={19} />Light</button>
      </div>
    </section>
  );
}
function ReaderMenu({
  active,
  fontSize,
  clips,
  onClose,
  onSelect,
  onFontSize,
  onScreenshot,
}: {
  active: "contents" | "progress" | "layout" | "more";
  fontSize: number;
  clips: number;
  onClose: () => void;
  onSelect: (value: "contents" | "progress" | "layout" | "more") => void;
  onFontSize: (value: number) => void;
  onScreenshot: () => void;
}) {
  const [tab, setTab] = useState<"Contents" | "Bookmarks" | "Clippings">(
    "Contents",
  );
  return (
    <section className="reader-menu">
      <button className="reader-menu-close" onClick={onClose}>
        ×
      </button>
      {active === "contents" && (
        <>
          <div className="reader-tabs">
            {(["Contents", "Bookmarks", "Clippings"] as const).map((item) => (
              <button
                className={tab === item ? "selected" : ""}
                onClick={() => setTab(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          {tab === "Contents" && (
            <div className="reader-menu-list">
              <button>
                Chapter One <small>Page 1</small>
              </button>
              <button>
                Chapter Two <small>Page 43</small>
              </button>
              <button className="selected">
                Chapter Three <small>Page 81</small>
              </button>
            </div>
          )}
          {tab === "Bookmarks" && (
            <p className="reader-empty">
              No bookmarks yet. Use the top bookmark action to add one.
            </p>
          )}
          {tab === "Clippings" && (
            <div className="reader-menu-list">
              {clips ? (
                <button>
                  “When the page is quiet...” <small>{clips} saved</small>
                </button>
              ) : (
                <p className="reader-empty">
                  No clippings yet. Select text in the reader to save one.
                </p>
              )}
            </div>
          )}
        </>
      )}
      {active === "progress" && (
        <div className="reader-panel-content">
          <p>
            <strong>Book</strong>
            <b>42%</b>
          </p>
          <p>
            <strong>Chapter</strong>
            <b>9% · 3 / 12</b>
          </p>
          <p>
            <strong>Reading time</strong>
            <b>2h 18m</b>
          </p>
          <button>Jump to page...</button>
        </div>
      )}
      {active === "layout" && (
        <div className="reader-layout-panel">
          <strong>Text size</strong>
          <div>
            <button onClick={() => onFontSize(Math.max(14, fontSize - 1))}>
              −
            </button>
            <b>{fontSize}px</b>
            <button onClick={() => onFontSize(Math.min(28, fontSize + 1))}>
              +
            </button>
          </div>
          <small>Pinch in or out on the page also changes text size.</small>
        </div>
      )}
      {active === "more" && (
        <div className="reader-menu-list">
          <button onClick={onScreenshot}>
            Take screenshot <small>Save in Screenshots</small>
          </button>
          <button>
            Toggle bookmark <small>Mark this page</small>
          </button>
          <button onClick={() => onSelect("layout")}>
            Reader settings <small>Font and page layout</small>
          </button>
        </div>
      )}
    </section>
  );
}
function QuickSettings({
  light,
  onLight,
  onBack,
}: {
  light: number;
  onLight: (value: number) => void;
  onBack: () => void;
}) {
  const [warmth, setWarmth] = useState(50);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const step = (
    setter: (value: number) => void,
    value: number,
    amount: number,
  ) => setter(Math.max(0, Math.min(100, value + amount)));
  return (
    <main className="eink-main eink-quick">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Quick controls</strong>
      </div>
      <section className="quick-sliders">
        <label>
          Brightness <output>{light}%</output>
          <span>
            <button onClick={() => step(onLight, light, -10)}>−</button>
            <input
              type="range"
              min="0"
              max="100"
              value={light}
              onChange={(event) => onLight(Number(event.target.value))}
            />
            <button onClick={() => step(onLight, light, 10)}>+</button>
          </span>
        </label>
        <label>
          Warmth{" "}
          <output>
            {warmth < 45 ? "Cool" : warmth > 55 ? "Warm" : "Neutral"}
          </output>
          <span>
            <button onClick={() => step(setWarmth, warmth, -10)}>−</button>
            <input
              type="range"
              min="0"
              max="100"
              value={warmth}
              onChange={(event) => setWarmth(Number(event.target.value))}
            />
            <button onClick={() => step(setWarmth, warmth, 10)}>+</button>
          </span>
        </label>
      </section>
      <div className="quick-actions">
        <button
          className={wifi ? "active" : ""}
          onClick={() => setWifi((value) => !value)}
        >
          <WifiHigh size={22} />
          Wi-Fi
        </button>
        <button
          className={bluetooth ? "active" : ""}
          onClick={() => setBluetooth((value) => !value)}
        >
          <Bluetooth size={22} />
          Bluetooth
        </button>
        <button
          className={refreshed ? "active" : ""}
          onClick={() => setRefreshed(true)}
        >
          <ArrowsClockwise size={22} />
          Refresh
        </button>
        <button>
          <SunDim size={22} />
          Light
        </button>
      </div>
      <p className="quick-hint">
        Swipe up from the bottom while reading to return to the reader menu.
      </p>
    </main>
  );
}

const SETTINGS = [
  ["display", "Display & Power", "Light, refresh, sleep", Lightbulb],
  ["reading", "Reading", "Type, layout, reading aids", BookOpen],
  ["controls", "Buttons & gestures", "Buttons, touch, shortcuts", Sliders],
  ["system", "Companion & Device", "Wi-Fi, files, updates", WifiHigh],
] as const;
type SettingRow = readonly [
  label: string,
  value: string,
  choices?: readonly string[],
];
const DETAIL: Record<Exclude<SettingsSection, null>, readonly SettingRow[]> = {
  display: [
    ["Front light", "On"],
    ["Sleep screen", "Book cover"],
    ["Status bar", "Clock, battery & icons"],
    ["UI scale", "Small", ["Small", "Normal"]],
    ["Dark mode", "Off", ["Off", "On"]],
    ["Refresh clean-up", "Every 10 pages"],
  ],
  reading: [
    ["Font family", "Literata"],
    ["Font size", "20 px"],
    ["Line spacing", "110%"],
    ["Word spacing", "0 px"],
    ["Text smoothness", "On"],
  ],
  controls: [
    ["Home button", "Home", ["Home", "Library", "Reading stats"]],
    ["Side buttons", "Page turn", ["Page turn", "Volume", "Disabled"]],
    ["Power button", "Sleep", ["Sleep", "Bookmark", "Front light"]],
    ["Long press", "Quick settings", ["Quick settings", "Home", "Disabled"]],
    ["Tap left side", "Previous page", ["Previous page", "Menu", "Disabled"]],
    ["Tap right side", "Next page", ["Next page", "Menu", "Disabled"]],
    ["Tap centre", "Reader menu", ["Reader menu", "Bookmark", "Disabled"]],
    ["Touch reader controls", "On", ["Off", "On"]],
    ["Swipe navigation", "On", ["Off", "On"]],
  ],
  system: [
    ["Wi-Fi", "Proink Home", ["Off", "Proink Home"]],
    ["Companion portal", "proink.local"],
    ["Wireless book transfer", "Ready", ["Off", "Ready"]],
    ["Calibre wireless", "Off", ["Off", "Ready"]],
    ["Reading sync", "Off", ["Off", "On"]],
    ["Device name", "Proink X4 Pro"],
    ["Storage", "6.2 GB free"],
    ["Files & cache", "Manage"],
    ["Software update", "Up to date"],
    ["About Proink", "v0.2.0"],
  ],
};
function Settings({
  page,
  onOpen,
  onBack,
  onKeyboard,
  darkMode,
  onDarkMode,
  uiScale,
  onUiScale,
  statusSettings,
  onStatusSettings,
}: {
  page: SettingsPage;
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
  darkMode: boolean;
  onDarkMode: (value: boolean) => void;
  uiScale: "small" | "normal";
  onUiScale: (value: "small" | "normal") => void;
  statusSettings: StatusSettings;
  onStatusSettings: (settings: StatusSettings) => void;
}) {
  const [refreshChoice, setRefreshChoice] = useState("10 pages");
  const [readerPreferences, setReaderPreferences] = useState<ReaderPreferences>(
    {
      fontFamily: "Literata",
      fontSize: 20,
      lineSpacing: 110,
      wordSpacing: 0,
      smoothText: true,
    },
  );
  const [layoutPreferences, setLayoutPreferences] = useState<LayoutPreferences>(
    {
      verticalMargin: 18,
      horizontalMargin: 18,
      alignment: "Justify",
      dictionary: "None",
      hyphenation: true,
      extraParagraphSpacing: false,
      forceIndents: false,
      pageNumbers: true,
      touchControls: "On",
      embeddedStyle: true,
      images: true,
    },
  );
  const [controlPreferences, setControlPreferences] =
    useState<ControlPreferences>({
      homeTap: "Back / Home",
      homeDoubleTap: "Front light",
      homeLongPress: "Reader menu",
      powerShort: "Screen off",
      powerLong: "Sleep",
      powerCombo: "Quick actions",
      sideLayout: "Previous / next",
      sideLongPress: "Chapter skip",
      sideCombo: "Ignore",
      quickAction: "Front light",
      pageTurn: "Tap + swipe",
      pinch: "On",
      twoFinger: "Quick actions",
      readerTouch: "On",
    });
  const [deviceName, setDeviceName] = useState("Proink X4 Pro");
  if (page === "frontlight")
    return <FrontLight onBack={onBack} onKeyboard={onKeyboard} />;
  if (page === "sleep") return <SleepScreen onOpen={onOpen} onBack={onBack} />;
  if (page === "sleep-cover") return <SleepCoverPicker onBack={onBack} />;
  if (page === "sleep-image") return <SleepImagePicker onBack={onBack} />;
  if (page === "sleep-text")
    return <SleepTextEditor onBack={onBack} onKeyboard={onKeyboard} />;
  if (page === "status-bar")
    return (
      <StatusBarSettings
        onOpen={onOpen}
        onBack={onBack}
        settings={statusSettings}
        onSettings={onStatusSettings}
      />
    );
  if (page === "status-icons")
    return (
      <StatusIcons
        onBack={onBack}
        settings={statusSettings}
        onSettings={onStatusSettings}
      />
    );
  if (page === "font-setup")
    return (
      <FontSetup
        onOpen={onOpen}
        onBack={onBack}
        preferences={readerPreferences}
        onPreferences={setReaderPreferences}
      />
    );
  if (page === "font-family")
    return (
      <FontFamily
        onBack={onBack}
        preferences={readerPreferences}
        onPreferences={setReaderPreferences}
      />
    );
  if (page === "font-size")
    return (
      <ReaderAdjustment
        title="Font size"
        label="Size"
        value={readerPreferences.fontSize}
        min={12}
        max={28}
        step={1}
        unit="px"
        onBack={onBack}
        onCommit={(fontSize) =>
          setReaderPreferences((current) => ({ ...current, fontSize }))
        }
      />
    );
  if (page === "line-spacing")
    return (
      <ReaderAdjustment
        title="Line spacing"
        label="Space between lines"
        value={readerPreferences.lineSpacing}
        min={70}
        max={200}
        step={5}
        unit="%"
        onBack={onBack}
        onCommit={(lineSpacing) =>
          setReaderPreferences((current) => ({ ...current, lineSpacing }))
        }
      />
    );
  if (page === "word-spacing")
    return (
      <ReaderAdjustment
        title="Word spacing"
        label="Space between words"
        value={readerPreferences.wordSpacing}
        min={-2}
        max={8}
        step={1}
        unit="px"
        onBack={onBack}
        onCommit={(wordSpacing) =>
          setReaderPreferences((current) => ({ ...current, wordSpacing }))
        }
      />
    );
  if (page === "page-layout")
    return (
      <PageLayout
        onOpen={onOpen}
        onBack={onBack}
        preferences={layoutPreferences}
        onPreferences={setLayoutPreferences}
      />
    );
  if (page === "screen-margins")
    return (
      <ScreenMargins
        onBack={onBack}
        preferences={layoutPreferences}
        onPreferences={setLayoutPreferences}
      />
    );
  if (page === "controls")
    return (
      <ControlHub
        onOpen={onOpen}
        onBack={onBack}
        preferences={controlPreferences}
      />
    );
  if (page === "home-button")
    return (
      <ControlDetail
        kind="home-button"
        onBack={onBack}
        preferences={controlPreferences}
        onPreferences={setControlPreferences}
      />
    );
  if (page === "power-button")
    return (
      <ControlDetail
        kind="power-button"
        onBack={onBack}
        preferences={controlPreferences}
        onPreferences={setControlPreferences}
      />
    );
  if (page === "side-buttons")
    return (
      <ControlDetail
        kind="side-buttons"
        onBack={onBack}
        preferences={controlPreferences}
        onPreferences={setControlPreferences}
      />
    );
  if (page === "quick-actions")
    return (
      <ControlDetail
        kind="quick-actions"
        onBack={onBack}
        preferences={controlPreferences}
        onPreferences={setControlPreferences}
      />
    );
  if (page === "taps-gestures")
    return (
      <ControlDetail
        kind="taps-gestures"
        onBack={onBack}
        preferences={controlPreferences}
        onPreferences={setControlPreferences}
      />
    );
  if (page === "system") return <SystemHub onOpen={onOpen} onBack={onBack} />;
  if (
    page === "connectivity" ||
    page === "storage" ||
    page === "device-time" ||
    page === "settings-backup" ||
    page === "updates-about" ||
    page === "file-settings"
  )
    return (
      <SystemPanel
        kind={page}
        onOpen={onOpen}
        onBack={onBack}
        onKeyboard={onKeyboard}
        deviceName={deviceName}
      />
    );
  if (page === "device-name")
    return (
      <DeviceNameEditor
        value={deviceName}
        onChange={setDeviceName}
        onBack={onBack}
        onKeyboard={onKeyboard}
      />
    );
  if (page === "wifi")
    return <WifiSettings onBack={onBack} onKeyboard={onKeyboard} />;
  if (page === "bluetooth") return <BluetoothSettings onBack={onBack} />;
  if (page === "companion-link")
    return <CompanionLinkSettings onBack={onBack} />;
  if (page === "catalogs")
    return <CatalogSettings onBack={onBack} onKeyboard={onKeyboard} />;
  if (page === "reading-sync") return <ReadingSyncSettings onBack={onBack} />;
  if (page === "refresh")
    return (
      <>
        <SettingsDetail
          section="display"
          onOpen={onOpen}
          onBack={onBack}
          refreshChoice={refreshChoice}
          darkMode={darkMode}
          onDarkMode={onDarkMode}
          uiScale={uiScale}
          onUiScale={onUiScale}
        />
        <RefreshDialog
          choice={refreshChoice}
          onApply={(choice) => {
            setRefreshChoice(choice);
            onOpen("display");
          }}
        />
      </>
    );
  if (page === "reading")
    return (
      <ReaderSettings
        onOpen={onOpen}
        onBack={onBack}
        preferences={readerPreferences}
        layoutPreferences={layoutPreferences}
      />
    );
  if (page)
    return (
      <SettingsDetail
        section={page}
        onOpen={onOpen}
        onBack={onBack}
        refreshChoice={refreshChoice}
        darkMode={darkMode}
        onDarkMode={onDarkMode}
        uiScale={uiScale}
        onUiScale={onUiScale}
      />
    );
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Settings</strong>
      </div>
      <p className="settings-intro">Make the reader feel like yours.</p>
      <div className="settings-menu">
        {SETTINGS.map(([id, title, note, Icon]) => (
          <button key={id} onClick={() => onOpen(id)}>
            <Icon size={23} />
            <span>
              <strong>{title}</strong>
              <small>{note}</small>
            </span>
            <b>›</b>
          </button>
        ))}
      </div>
    </main>
  );
}
function ReaderSettings({
  onOpen,
  onBack,
  preferences,
  layoutPreferences,
}: {
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  preferences: ReaderPreferences;
  layoutPreferences: LayoutPreferences;
}) {
  const rows: readonly [SettingsPage, string, string][] = [
    [
      "font-setup",
      "Font setup",
      `${preferences.fontFamily} · ${preferences.fontSize} px`,
    ],
    [
      "page-layout",
      "Page layout",
      `${layoutPreferences.alignment} · margins & page options`,
    ],
  ];
  return (
    <main className="eink-main eink-settings reader-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Reading</strong>
      </div>
      <p className="settings-intro">Type and page rhythm.</p>
      <div className="settings-menu">
        {rows.map(([page, label, value]) => (
          <button key={page} onClick={() => onOpen(page)}>
            <span>
              <strong>{label}</strong>
              <small>{value}</small>
            </span>
            <b>›</b>
          </button>
        ))}
      </div>
    </main>
  );
}
function FontSetup({
  onOpen,
  onBack,
  preferences,
  onPreferences,
}: {
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  preferences: ReaderPreferences;
  onPreferences: (preferences: ReaderPreferences) => void;
}) {
  const rows: readonly [SettingsPage, string, string][] = [
    ["font-family", "Font family", preferences.fontFamily],
    ["font-size", "Font size", `${preferences.fontSize} px`],
    ["line-spacing", "Line spacing", `${preferences.lineSpacing}%`],
    ["word-spacing", "Word spacing", `${preferences.wordSpacing} px`],
  ];
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Font setup</strong>
      </div>
      <p className="settings-intro">Choose how book text feels on the page.</p>
      <div className="settings-detail">
        {rows.map(([page, label, value]) => (
          <button key={page} onClick={() => onOpen(page)}>
            <span>
              <strong>{label}</strong>
              <small>{value}</small>
            </span>
            <b>›</b>
          </button>
        ))}
      </div>
      <button
        className="setting-toggle font-smoothness-toggle"
        onClick={() =>
          onPreferences({ ...preferences, smoothText: !preferences.smoothText })
        }
      >
        <span>
          <strong>Text smoothness</strong>
          <small>
            {preferences.smoothText
              ? "Softer letter edges"
              : "Sharper letter edges"}
          </small>
        </span>
        <i className={preferences.smoothText ? "switch on" : "switch"} />
      </button>
    </main>
  );
}
function FontFamily({
  onBack,
  preferences,
  onPreferences,
}: {
  onBack: () => void;
  preferences: ReaderPreferences;
  onPreferences: (preferences: ReaderPreferences) => void;
}) {
  const fonts = [
    "Literata",
    "Bitter",
    "Atkinson Hyperlegible",
    "OpenDyslexic",
    "SD: Ember Mono",
  ] as const;
  const fontClass = preferences.fontFamily
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(":", "");
  return (
    <main className="eink-main eink-settings font-family-page">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Font family</strong>
      </div>
      <p className={`font-family-sample ${fontClass}`}>
        The quick brown fox jumps over the lazy dog.
      </p>
      <p className="settings-intro">
        Preview {'"'}
        {preferences.fontFamily}
        {'"'}
      </p>
      <div className="font-family-list">
        {fonts.map((font) => (
          <button
            key={font}
            className={preferences.fontFamily === font ? "selected" : ""}
            onClick={() => onPreferences({ ...preferences, fontFamily: font })}
          >
            <span
              className={font
                .toLowerCase()
                .replaceAll(" ", "-")
                .replaceAll(":", "")}
            >
              {font}
            </span>
            <b>{preferences.fontFamily === font ? "Selected" : "Preview"}</b>
          </button>
        ))}
      </div>
      <small className="font-source-note">
        Built-in fonts and compatible fonts in Fonts/ on the SD card appear
        here.
      </small>
    </main>
  );
}
function ReaderAdjustment({
  title,
  label,
  value,
  min,
  max,
  step,
  unit,
  onBack,
  onCommit,
}: {
  title: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onBack: () => void;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value);
  const change = (amount: number) =>
    setDraft((current) => Math.max(min, Math.min(max, current + amount)));
  return (
    <main className="eink-main eink-settings reader-adjustment">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>{title}</strong>
      </div>
      <p
        className="reader-adjustment-preview"
        style={{
          fontSize: title === "Font size" ? `${draft}px` : undefined,
          lineHeight: title === "Line spacing" ? draft / 100 : undefined,
          wordSpacing: title === "Word spacing" ? `${draft}px` : undefined,
        }}
      >
        A quiet page makes room for the words that matter.
      </p>
      <section>
        <output>
          {draft}
          {unit}
        </output>
        <div className="reader-adjustment-control">
          <button
            onClick={() => change(-step)}
            aria-label={`Decrease ${label}`}
          >
            −
          </button>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={(event) => setDraft(Number(event.target.value))}
            aria-label={label}
          />
          <button onClick={() => change(step)} aria-label={`Increase ${label}`}>
            +
          </button>
        </div>
        <div className="reader-adjustment-range">
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      </section>
      <div className="reader-adjustment-actions">
        <button
          className="primary"
          onClick={() => {
            onCommit(draft);
            onBack();
          }}
        >
          Confirm
        </button>
        <button onClick={onBack}>Cancel</button>
      </div>
    </main>
  );
}
function PageLayout({
  onOpen,
  onBack,
  preferences,
  onPreferences,
}: {
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  preferences: LayoutPreferences;
  onPreferences: (preferences: LayoutPreferences) => void;
}) {
  const [alignmentOpen, setAlignmentOpen] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const toggle = (
    key:
      | "hyphenation"
      | "extraParagraphSpacing"
      | "forceIndents"
      | "pageNumbers"
      | "embeddedStyle"
      | "images",
  ) => onPreferences({ ...preferences, [key]: !preferences[key] });
  const toggleRow = (
    key:
      | "hyphenation"
      | "extraParagraphSpacing"
      | "forceIndents"
      | "pageNumbers"
      | "embeddedStyle"
      | "images",
    label: string,
    note: string,
  ) => (
    <button className="setting-toggle" onClick={() => toggle(key)}>
      <span>
        <strong>{label}</strong>
        <small>{note}</small>
      </span>
      <i className={preferences[key] ? "switch on" : "switch"} />
    </button>
  );
  return (
    <main className="eink-main eink-settings page-layout">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Page layout</strong>
      </div>
      <p className="settings-intro">
        Shape every page without changing the book itself.
      </p>
      <div className="layout-controls">
        <button
          className="settings-link-row"
          onClick={() => onOpen("screen-margins")}
        >
          <span>
            <strong>Screen margins</strong>
            <small>
              Top/bottom {preferences.verticalMargin} px · left/right{" "}
              {preferences.horizontalMargin} px
            </small>
          </span>
          <b>›</b>
        </button>
        <button
          className="settings-link-row"
          onClick={() => setAlignmentOpen(true)}
        >
          <span>
            <strong>Paragraph alignment</strong>
            <small>{preferences.alignment}</small>
          </span>
          <b>›</b>
        </button>
        <button
          className="settings-link-row"
          onClick={() => setDictionaryOpen(true)}
        >
          <span>
            <strong>Dictionary</strong>
            <small>
              {preferences.dictionary === "None"
                ? "No dictionary selected"
                : `Dictionaries/ · ${preferences.dictionary}`}
            </small>
          </span>
          <b>›</b>
        </button>
        {toggleRow(
          "hyphenation",
          "Break long words",
          "Hyphenation at line ends",
        )}
        {toggleRow(
          "extraParagraphSpacing",
          "Extra paragraph spacing",
          "Add a little space between paragraphs",
        )}
        {toggleRow(
          "forceIndents",
          "Force paragraph indents",
          "Indent each new paragraph",
        )}
        {toggleRow(
          "pageNumbers",
          "Page numbers",
          "Show progress in the reader footer",
        )}
        {toggleRow(
          "embeddedStyle",
          "Embedded style",
          "Let the book use its own formatting",
        )}
        {toggleRow("images", "Images", "Show illustrations and inline images")}
      </div>
      {alignmentOpen && (
        <ParagraphAlignmentDialog
          current={preferences.alignment}
          onChoose={(alignment) => {
            onPreferences({ ...preferences, alignment });
            setAlignmentOpen(false);
          }}
        />
      )}
      {dictionaryOpen && (
        <DictionaryDialog
          current={preferences.dictionary}
          onChoose={(dictionary) => {
            onPreferences({ ...preferences, dictionary });
            setDictionaryOpen(false);
          }}
        />
      )}
    </main>
  );
}
function ParagraphAlignmentDialog({
  current,
  onChoose,
}: {
  current: LayoutPreferences["alignment"];
  onChoose: (alignment: LayoutPreferences["alignment"]) => void;
}) {
  const options: LayoutPreferences["alignment"][] = [
    "Justify",
    "Left",
    "Center",
    "Right",
    "Book's style",
  ];
  return (
    <section
      className="eink-dialog alignment-dialog"
      role="dialog"
      aria-label="Paragraph alignment"
    >
      <div>
        <h2>Paragraph alignment</h2>
        <div className="dialog-options">
          {options.map((option) => (
            <button
              className={current === option ? "selected" : ""}
              onClick={() => onChoose(option)}
              key={option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
function DictionaryDialog({
  current,
  onChoose,
}: {
  current: string;
  onChoose: (dictionary: string) => void;
}) {
  const options = [
    "None",
    "English - English",
    "English - Hindi",
    "Oxford English",
  ] as const;
  return (
    <section className="eink-dialog" role="dialog" aria-label="Dictionary">
      <div>
        <h2>Dictionary</h2>
        <p className="dialog-note">Dictionaries/ on SD card</p>
        <div className="dialog-options">
          {options.map((option) => (
            <button
              className={current === option ? "selected" : ""}
              onClick={() => onChoose(option)}
              key={option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
function ScreenMargins({
  onBack,
  preferences,
  onPreferences,
}: {
  onBack: () => void;
  preferences: LayoutPreferences;
  onPreferences: (preferences: LayoutPreferences) => void;
}) {
  const [vertical, setVertical] = useState(preferences.verticalMargin);
  const [horizontal, setHorizontal] = useState(preferences.horizontalMargin);
  const control = (
    label: string,
    value: number,
    setValue: (value: number) => void,
  ) => (
    <section className="margin-control">
      <strong>{label}</strong>
      <output>{value} px</output>
      <div>
        <button onClick={() => setValue(Math.max(0, value - 2))}>−</button>
        <input
          type="range"
          min="0"
          max="40"
          step="2"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-label={label}
        />
        <button onClick={() => setValue(Math.min(40, value + 2))}>+</button>
      </div>
    </section>
  );
  return (
    <main className="eink-main eink-settings reader-adjustment screen-margins">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Screen margins</strong>
      </div>
      <p className="reader-adjustment-preview margin-preview">
        Words need room to breathe.
      </p>
      {control("Top & bottom", vertical, setVertical)}
      {control("Left & right", horizontal, setHorizontal)}
      <div className="reader-adjustment-actions">
        <button
          className="primary"
          onClick={() => {
            onPreferences({
              ...preferences,
              verticalMargin: vertical,
              horizontalMargin: horizontal,
            });
            onBack();
          }}
        >
          Confirm
        </button>
        <button onClick={onBack}>Cancel</button>
      </div>
    </main>
  );
}
function ControlHub({
  onOpen,
  onBack,
  preferences,
}: {
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  preferences: ControlPreferences;
}) {
  const rows: readonly [SettingsPage, string, string][] = [
    [
      "home-button",
      "Home button",
      `${preferences.homeTap} · double tap & hold`,
    ],
    ["power-button", "Power button", `${preferences.powerShort} · power combo`],
    [
      "side-buttons",
      "Side buttons",
      `${preferences.sideLayout} · ${preferences.sideLongPress}`,
    ],
    [
      "quick-actions",
      "Quick actions",
      `Power + up · ${preferences.quickAction}`,
    ],
    [
      "taps-gestures",
      "Taps & gestures",
      `${preferences.pageTurn} · reader touch ${preferences.readerTouch}`,
    ],
  ];
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Buttons & gestures</strong>
      </div>
      <p className="settings-intro">
        Set up every physical button and reader gesture in one place.
      </p>
      <div className="layout-controls">
        {rows.map(([page, label, note]) => (
          <button
            className="settings-link-row"
            key={page}
            onClick={() => onOpen(page)}
          >
            <span>
              <strong>{label}</strong>
              <small>{note}</small>
            </span>
            <b>›</b>
          </button>
        ))}
      </div>
    </main>
  );
}
function ControlDetail({
  kind,
  onBack,
  preferences,
  onPreferences,
}: {
  kind:
    | "home-button"
    | "power-button"
    | "side-buttons"
    | "quick-actions"
    | "taps-gestures";
  onBack: () => void;
  preferences: ControlPreferences;
  onPreferences: (preferences: ControlPreferences) => void;
}) {
  const [picker, setPicker] = useState<{
    key: keyof ControlPreferences;
    label: string;
    options: readonly string[];
  } | null>(null);
  const commonActions = [
    "Back / Home",
    "Reader menu",
    "Front light",
    "Toggle bookmark",
    "Reading stats",
    "Refresh screen",
    "Ignore",
  ] as const;
  const definitions = {
    "home-button": {
      title: "Home button",
      intro: "Choose what the physical Home button does while reading.",
      rows: [
        ["homeTap", "Tap", "Back / Home", commonActions],
        ["homeDoubleTap", "Double tap", "Front light", commonActions],
        ["homeLongPress", "Long press", "Reader menu", commonActions],
      ],
    },
    "power-button": {
      title: "Power button",
      intro: "Keep screen-off and sleep actions predictable.",
      rows: [
        [
          "powerShort",
          "Short press",
          "Screen off",
          ["Screen off", "Sleep", "Ignore"],
        ],
        ["powerLong", "Long press", "Sleep", ["Sleep", "Power menu", "Ignore"]],
        [
          "powerCombo",
          "Power + up",
          "Quick actions",
          ["Quick actions", "Front light", "Refresh screen", "Ignore"],
        ],
      ],
    },
    "side-buttons": {
      title: "Side buttons",
      intro: "Set page-turn behavior for the hardware keys.",
      rows: [
        [
          "sideLayout",
          "Layout",
          "Previous / next",
          ["Previous / next", "Next / previous", "Volume", "Disabled"],
        ],
        [
          "sideLongPress",
          "Long press",
          "Chapter skip",
          ["Chapter skip", "Front light", "Quick actions", "Ignore"],
        ],
        [
          "sideCombo",
          "Up + down",
          "Ignore",
          ["Ignore", "Quick actions", "Refresh screen"],
        ],
      ],
    },
    "quick-actions": {
      title: "Quick actions",
      intro: "Choose the action opened by the Power + up shortcut.",
      rows: [
        [
          "quickAction",
          "Shortcut",
          "Front light",
          [
            "Front light",
            "Refresh screen",
            "Reading stats",
            "File transfer",
            "Guide dots",
          ],
        ],
      ],
    },
    "taps-gestures": {
      title: "Taps & gestures",
      intro: "Touch behavior belongs here, not inside page layout.",
      rows: [
        [
          "pageTurn",
          "Page turn",
          "Tap + swipe",
          ["Tap + swipe", "Swipe only", "Tap only", "Buttons only"],
        ],
        ["pinch", "Pinch to resize text", "On", ["On", "Off"]],
        [
          "twoFinger",
          "Two-finger swipe",
          "Quick actions",
          ["Quick actions", "Front light", "Refresh screen", "Ignore"],
        ],
        [
          "readerTouch",
          "Reader touch",
          "On",
          ["On", "Off completely", "Taps off", "Swipes off", "Dictionary only"],
        ],
      ],
    },
  } as const;
  const definition = definitions[kind];
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>{definition.title}</strong>
      </div>
      <p className="settings-intro">{definition.intro}</p>
      <div className="layout-controls">
        {definition.rows.map(([key, label, fallback, options]) => (
          <button
            className="settings-link-row"
            key={key}
            onClick={() => setPicker({ key, label, options })}
          >
            <span>
              <strong>{label}</strong>
              <small>{preferences[key] || fallback}</small>
            </span>
            <b>›</b>
          </button>
        ))}
      </div>
      {picker && (
        <ActionDialog
          title={picker.label}
          current={preferences[picker.key]}
          options={picker.options}
          onChoose={(value) => {
            onPreferences({
              ...preferences,
              [picker.key]: value,
            } as ControlPreferences);
            setPicker(null);
          }}
        />
      )}
    </main>
  );
}
function ActionDialog({
  title,
  current,
  options,
  onChoose,
}: {
  title: string;
  current: string;
  options: readonly string[];
  onChoose: (value: string) => void;
}) {
  return (
    <section className="eink-dialog" role="dialog" aria-label={title}>
      <div>
        <h2>{title}</h2>
        <div className="dialog-options">
          {options.map((option) => (
            <button
              className={current === option ? "selected" : ""}
              onClick={() => onChoose(option)}
              key={option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
type SystemPanelKind =
  | "connectivity"
  | "storage"
  | "device-time"
  | "settings-backup"
  | "updates-about"
  | "file-settings";
type SystemRow = {
  key: string;
  label: string;
  note: string;
  options?: readonly string[];
  input?: "text" | "time";
  action?: string;
};
const SYSTEM_PANELS: Record<
  SystemPanelKind,
  { title: string; intro: string; rows: readonly SystemRow[] }
> = {
  connectivity: {
    title: "Connectivity",
    intro: "Manage each connection where its setup and status are visible.",
    rows: [
      { key: "wifi", label: "Wi-Fi", note: "Proink Home" },
      { key: "bluetooth", label: "Bluetooth", note: "Off" },
      { key: "companion", label: "Companion link", note: "Not paired" },
      { key: "catalog", label: "Book catalogs", note: "OPDS & Calibre" },
      { key: "sync", label: "Reading sync", note: "Off" },
    ],
  },
  storage: {
    title: "Storage & SD card",
    intro: "Keep your books and backups on removable storage.",
    rows: [
      { key: "storage", label: "SD card", note: "14.8 GB free of 32 GB" },
      {
        key: "usb",
        label: "USB mode",
        note: "File transfer",
        options: ["File transfer", "Charge only"],
      },
      {
        key: "eject",
        label: "Safely eject SD card",
        note: "Unmount before removal",
        action: "The simulator would unmount the SD card here.",
      },
      {
        key: "format",
        label: "Format SD card",
        note: "Erases all files",
        action: "Simulator only: no SD card was formatted.",
      },
    ],
  },
  "device-time": {
    title: "Device & time",
    intro: "Identity, language, sleep and clock settings.",
    rows: [
      {
        key: "name",
        label: "Device name",
        note: "Proink X4 Pro",
        input: "text",
      },
      {
        key: "sleep",
        label: "Sleep after",
        note: "10 min",
        options: ["5 min", "10 min", "20 min", "Never"],
      },
      {
        key: "language",
        label: "Language",
        note: "English",
        options: ["English", "Hindi", "German", "Spanish"],
      },
      {
        key: "clock",
        label: "Clock format",
        note: "24-hour",
        options: ["24-hour", "12-hour"],
      },
      {
        key: "date",
        label: "Set date & time",
        note: "Sep 06 · 10:23",
        input: "time",
      },
      {
        key: "timezone",
        label: "Time zone",
        note: "Asia/Kolkata",
        options: ["Asia/Kolkata", "UTC", "America/New York", "Europe/London"],
      },
    ],
  },
  "settings-backup": {
    title: "Settings backup",
    intro: "Save every reader preference to the SD card.",
    rows: [
      {
        key: "backup",
        label: "Save backup to SD card",
        note: "Backups/ · all settings",
        action: "Settings backup saved to SD card in the simulator.",
      },
      {
        key: "restore",
        label: "Restore from SD card",
        note: "Choose a settings backup",
        action: "Settings restored from the selected simulator backup.",
      },
      {
        key: "auto",
        label: "Automatic backup",
        note: "Weekly",
        options: ["Off", "Weekly", "Before updates"],
      },
      { key: "last", label: "Last backup", note: "No backup yet" },
    ],
  },
  "updates-about": {
    title: "Updates & about",
    intro: "Software information without cluttering daily settings.",
    rows: [
      {
        key: "updates",
        label: "Check for updates",
        note: "Proink OS 0.2.0",
        action: "The simulator is already up to date.",
      },
      {
        key: "channel",
        label: "Update channel",
        note: "Stable",
        options: ["Stable", "Preview"],
      },
      { key: "model", label: "Device model", note: "X4 Pro" },
      { key: "serial", label: "Serial number", note: "PX4-2026-0001" },
      {
        key: "licenses",
        label: "Open-source licenses",
        note: "View notices",
        action: "License notices would open here.",
      },
    ],
  },
  "file-settings": {
    title: "File settings",
    intro: "Browsing preferences live with Files, not system settings.",
    rows: [
      {
        key: "hidden",
        label: "Show hidden files",
        note: "Off",
        options: ["Off", "On"],
      },
      {
        key: "extensions",
        label: "Show file extensions",
        note: "On",
        options: ["On", "Off"],
      },
      {
        key: "view",
        label: "File browser layout",
        note: "List",
        options: ["List", "Compact list"],
      },
      {
        key: "recent",
        label: "Finished books",
        note: "Keep in Recents",
        options: ["Keep in Recents", "Move to Read folder"],
      },
      {
        key: "cache",
        label: "Clear reading cache",
        note: "Remove temporary files",
        action: "The simulator cache was cleared.",
      },
    ],
  },
};
function SystemHub({
  onOpen,
  onBack,
}: {
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
}) {
  const rows: readonly [SystemPanelKind, string, string][] = [
    ["connectivity", "Connectivity", "Wi-Fi, Bluetooth, Companion & sync"],
    ["storage", "Storage & SD card", "Usage, USB mode, safe eject & format"],
    ["device-time", "Device & time", "Name, language, sleep, date & time"],
    ["settings-backup", "Settings backup", "Save or restore all preferences"],
    ["updates-about", "Updates & about", "Software, hardware & licenses"],
  ];
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Companion & Device</strong>
      </div>
      <p className="settings-intro">
        Connections, storage, device setup and recovery.
      </p>
      <div className="layout-controls">
        {rows.map(([page, label, note]) => (
          <button
            className="settings-link-row"
            key={page}
            onClick={() => onOpen(page)}
          >
            <span>
              <strong>{label}</strong>
              <small>{note}</small>
            </span>
            <b>›</b>
          </button>
        ))}
      </div>
    </main>
  );
}
function SystemPanel({
  kind,
  onOpen,
  onBack,
  onKeyboard,
  deviceName,
}: {
  kind: SystemPanelKind;
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
  deviceName: string;
}) {
  const panel = SYSTEM_PANELS[kind];
  const [values, setValues] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState<SystemRow | null>(null);
  const [message, setMessage] = useState("");
  const value = (row: SystemRow) =>
    row.key === "name" ? deviceName : (values[row.key] ?? row.note);
  const update = (key: string, next: string) =>
    setValues((current) => ({ ...current, [key]: next }));
  const connectionPage = (key: string): SettingsPage | undefined =>
    kind === "connectivity"
      ? (
          {
            wifi: "wifi",
            bluetooth: "bluetooth",
            companion: "companion-link",
            catalog: "catalogs",
            sync: "reading-sync",
          } as Record<string, SettingsPage>
        )[key]
      : undefined;
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>{panel.title}</strong>
      </div>
      <p className="settings-intro">{panel.intro}</p>
      <div className="layout-controls">
        {panel.rows.map((row) => {
          const page =
            connectionPage(row.key) ??
            (kind === "device-time" && row.key === "name"
              ? "device-name"
              : undefined);
          return (
            <button
              className="settings-link-row"
              key={row.key}
              onClick={() =>
                page
                  ? onOpen(page)
                  : row.input
                    ? onKeyboard({
                        title: row.label,
                        value: value(row),
                        kind: row.input,
                        onChange: (next) => update(row.key, next),
                        onSubmit: (next) => update(row.key, next),
                      })
                    : row.options
                      ? setPicker(row)
                      : row.action
                        ? setMessage(row.action)
                        : undefined
              }
            >
              <span>
                <strong>{row.label}</strong>
                <small>{value(row)}</small>
              </span>
              {page || row.options || row.input || row.action ? (
                <b>›</b>
              ) : (
                <em>Info</em>
              )}
            </button>
          );
        })}
      </div>
      {message && <p className="system-message">{message}</p>}
      {picker && (
        <ActionDialog
          title={picker.label}
          current={value(picker)}
          options={picker.options ?? []}
          onChoose={(next) => {
            update(picker.key, next);
            setPicker(null);
          }}
        />
      )}
    </main>
  );
}
function DeviceNameEditor({
  value,
  onChange,
  onBack,
  onKeyboard,
}: {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [cursor, setCursor] = useState(value.length);
  const edit = () =>
    onKeyboard({
      title: "Device name",
      value,
      kind: "text",
      submitLabel: "Save",
      onChange: (next) => {
        onChange(next);
        setEditing(true);
      },
      onCursorChange: setCursor,
      onDismiss: () => setEditing(false),
      onSubmit: (next) => {
        onChange(next);
        setEditing(false);
      },
    });
  return (
    <main className="eink-main eink-settings device-name-editor">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Device name</strong>
      </div>
      <p className="settings-intro">
        This name appears in Wi-Fi, Bluetooth and Companion pairing.
      </p>
      <label>Device name</label>
      <button className="device-name-field" onClick={edit}>
        <span>
          {editing ? (
            <>
              {value.slice(0, cursor)}
              <i className="text-caret" aria-hidden="true" />
              {value.slice(cursor)}
            </>
          ) : (
            value || "Proink X4 Pro"
          )}
        </span>
        <b>›</b>
      </button>
      <p className="system-message">
        Tap the name to edit it. The keyboard opens below this page and updates
        this field as you type.
      </p>
      <button className="system-action" onClick={onBack}>
        Done
      </button>
    </main>
  );
}
function WifiSettings({
  onBack,
  onKeyboard,
}: {
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [connected, setConnected] = useState("Proink Home");
  const [scanning, setScanning] = useState(false);
  const [passwordFor, setPasswordFor] = useState("");
  const [password, setPassword] = useState("");
  const networks = [
    ["Proink Home", "Strong signal · secured"],
    ["ReaderNet", "Strong signal · secured"],
    ["Studio guest", "Medium signal · secured"],
    ["Library public", "Weak signal · open"],
  ] as const;
  const join = (name: string, secured: boolean) => {
    if (!secured) {
      setConnected(name);
      return;
    }
    setPasswordFor(name);
    setPassword("");
    onKeyboard({
      title: `Password for ${name}`,
      value: "",
      kind: "text",
      submitLabel: "Connect",
      onChange: setPassword,
      onSubmit: () => {
        setConnected(name);
        setPasswordFor("");
      },
    });
  };
  return (
    <main className="eink-main eink-settings connection-page">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Wi-Fi</strong>
      </div>
      <button
        className="setting-toggle"
        onClick={() => setEnabled((value) => !value)}
      >
        <span>
          <strong>Wi-Fi</strong>
          <small>{enabled ? `Connected to ${connected}` : "Off"}</small>
        </span>
        <i className={enabled ? "switch on" : "switch"} />
      </button>
      {enabled && (
        <>
          <p className="connection-meta">MAC address · 7C-0C-5F-41-A2-58</p>
          {passwordFor && (
            <button
              className="password-field"
              onClick={() =>
                onKeyboard({
                  title: `Password for ${passwordFor}`,
                  value: password,
                  kind: "text",
                  submitLabel: "Connect",
                  onChange: setPassword,
                  onSubmit: () => {
                    setConnected(passwordFor);
                    setPasswordFor("");
                  },
                })
              }
            >
              <span>
                <strong>Password for {passwordFor}</strong>
                <small>
                  {password ? "•".repeat(password.length) : "Type password"}
                </small>
              </span>
              <b>›</b>
            </button>
          )}
          <p className="connection-heading">Available networks</p>
          <div className="network-list">
            {networks.map(([name, note]) => (
              <button
                key={name}
                className={connected === name ? "selected" : ""}
                onClick={() => join(name, !note.includes("open"))}
              >
                <WifiHigh size={20} />
                <span>
                  <strong>{name}</strong>
                  <small>{connected === name ? "Connected" : note}</small>
                </span>
                <b>
                  {connected === name
                    ? "✓"
                    : note.includes("open")
                      ? "Open"
                      : "*"}
                </b>
              </button>
            ))}
            <button
              onClick={() =>
                onKeyboard({
                  title: "Hidden network name",
                  value: "",
                  kind: "text",
                  submitLabel: "Connect",
                  onSubmit: setConnected,
                })
              }
            >
              <WifiHigh size={20} />
              <span>
                <strong>Add hidden network</strong>
                <small>Enter a network name manually</small>
              </span>
              <b>›</b>
            </button>
          </div>
          <button
            className="system-action"
            onClick={() => {
              setScanning(true);
              window.setTimeout(() => setScanning(false), 900);
            }}
          >
            {scanning ? "Scanning..." : "Scan again"}
          </button>
        </>
      )}
    </main>
  );
}
function BluetoothSettings({ onBack }: { onBack: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [pairing, setPairing] = useState(false);
  return (
    <main className="eink-main eink-settings connection-page">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Bluetooth</strong>
      </div>
      <button
        className="setting-toggle"
        onClick={() => setEnabled((value) => !value)}
      >
        <span>
          <strong>Bluetooth</strong>
          <small>{enabled ? "Ready to pair" : "Off"}</small>
        </span>
        <i className={enabled ? "switch on" : "switch"} />
      </button>
      {enabled && (
        <>
          <p className="connection-meta">
            Use a page-turn remote or audio accessory.
          </p>
          <button className="system-action" onClick={() => setPairing(true)}>
            {pairing ? "Searching for nearby devices..." : "Pair new device"}
          </button>
          <div className="connection-empty">
            <Bluetooth size={24} />
            <strong>
              {pairing
                ? "Keep your accessory in pairing mode"
                : "No paired devices"}
            </strong>
            <small>
              {pairing
                ? "Nearby devices will appear here."
                : "Paired devices reconnect automatically."}
            </small>
          </div>
        </>
      )}
    </main>
  );
}
function CompanionLinkSettings({ onBack }: { onBack: () => void }) {
  const [pairing, setPairing] = useState(false);
  return (
    <main className="eink-main eink-settings connection-page">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Companion link</strong>
      </div>
      <p className="settings-intro">
        Send books and keep reading progress with the Proink Companion app.
      </p>
      <div className="pair-code">
        <small>{pairing ? "PAIRING CODE" : "STATUS"}</small>
        <strong>{pairing ? "PX4-4827" : "Not paired"}</strong>
        <span>
          {pairing
            ? "Enter this code in the app within 5 minutes."
            : "No phone is linked to this reader."}
        </span>
      </div>
      <button
        className="system-action"
        onClick={() => setPairing((value) => !value)}
      >
        {pairing ? "Cancel pairing" : "Pair with phone"}
      </button>
    </main>
  );
}
function CatalogSettings({
  onBack,
  onKeyboard,
}: {
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
}) {
  const [catalog, setCatalog] = useState("");
  return (
    <main className="eink-main eink-settings connection-page">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Book catalogs</strong>
      </div>
      <p className="settings-intro">
        Connect an OPDS or Calibre server to browse and download books.
      </p>
      {catalog ? (
        <div className="network-list">
          <button className="selected">
            <BookOpen size={20} />
            <span>
              <strong>{catalog}</strong>
              <small>Catalog ready to browse</small>
            </span>
            <b>✓</b>
          </button>
        </div>
      ) : (
        <div className="connection-empty">
          <BookOpen size={24} />
          <strong>No catalogs added</strong>
          <small>
            Add an OPDS address or a Calibre server on your network.
          </small>
        </div>
      )}
      <button
        className="system-action"
        onClick={() =>
          onKeyboard({
            title: "Catalog address",
            value: catalog,
            kind: "text",
            onChange: setCatalog,
            onSubmit: setCatalog,
          })
        }
      >
        {catalog ? "Edit catalog address" : "Add catalog"}
      </button>
    </main>
  );
}
function ReadingSyncSettings({ onBack }: { onBack: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [picker, setPicker] = useState<"when" | "match" | null>(null);
  const [when, setWhen] = useState("Wi-Fi only");
  const [match, setMatch] = useState("Title & author");
  const [message, setMessage] = useState("");
  return (
    <main className="eink-main eink-settings connection-page">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Reading sync</strong>
      </div>
      <button
        className="setting-toggle"
        onClick={() => setEnabled((value) => !value)}
      >
        <span>
          <strong>Sync reading progress</strong>
          <small>{enabled ? "Ready when connected" : "Off"}</small>
        </span>
        <i className={enabled ? "switch on" : "switch"} />
      </button>
      {enabled && (
        <div className="layout-controls">
          <button
            className="settings-link-row"
            onClick={() => setPicker("when")}
          >
            <span>
              <strong>Sync when</strong>
              <small>{when}</small>
            </span>
            <b>›</b>
          </button>
          <button
            className="settings-link-row"
            onClick={() => setPicker("match")}
          >
            <span>
              <strong>Match books by</strong>
              <small>{match}</small>
            </span>
            <b>›</b>
          </button>
          <button
            className="system-action"
            onClick={() => setMessage("Progress is up to date on this reader.")}
          >
            Sync now
          </button>
        </div>
      )}
      {message && <p className="system-message">{message}</p>}
      {picker && (
        <ActionDialog
          title={picker === "when" ? "Sync when" : "Match books by"}
          current={picker === "when" ? when : match}
          options={
            picker === "when"
              ? ["Wi-Fi only", "Manual"]
              : ["Title & author", "File name"]
          }
          onChoose={(value) => {
            if (picker === "when") setWhen(value);
            else setMatch(value);
            setPicker(null);
          }}
        />
      )}
    </main>
  );
}
function SettingsDetail({
  section,
  onOpen,
  onBack,
  refreshChoice,
  darkMode,
  onDarkMode,
  uiScale,
  onUiScale,
}: {
  section: Exclude<SettingsSection, null>;
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  refreshChoice?: string;
  darkMode: boolean;
  onDarkMode: (value: boolean) => void;
  uiScale: "small" | "normal";
  onUiScale: (value: "small" | "normal") => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const title = SETTINGS.find(([id]) => id === section)?.[1] ?? "Settings";
  const openDedicatedPage = (label: string): SettingsPage =>
    label === "Front light"
      ? "frontlight"
      : label === "Sleep screen"
        ? "sleep"
        : label === "Status bar"
          ? "status-bar"
          : label === "Refresh clean-up"
            ? "refresh"
            : null;
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>{title}</strong>
      </div>
      <p className="settings-intro">
        Tap a setting to preview its next choice.
      </p>
      <div className="settings-detail">
        {DETAIL[section].map(([label, initial, choices]) => {
          const initialValue =
            label === "Refresh clean-up" && refreshChoice
              ? refreshChoice
              : label === "Dark mode"
                ? darkMode
                  ? "On"
                  : "Off"
                : label === "UI scale"
                  ? `${uiScale.charAt(0).toUpperCase()}${uiScale.slice(1)}`
                  : initial;
          const value = values[label] ?? initialValue;
          const dedicatedPage = openDedicatedPage(label);
          const isToggle =
            choices?.length === 2 &&
            choices.includes("Off") &&
            choices.includes("On");
          return (
            <button
              key={label}
              onClick={() =>
                dedicatedPage
                  ? onOpen(dedicatedPage)
                  : label === "Dark mode"
                    ? onDarkMode(!darkMode)
                    : label === "UI scale"
                      ? onUiScale(value === "Small" ? "normal" : "small")
                      : choices &&
                        setValues((current) => ({
                          ...current,
                          [label]:
                            choices[
                              (choices.indexOf(value) + 1) % choices.length
                            ],
                        }))
              }
            >
              <span>
                <strong>{label}</strong>
                <small>{value}</small>
              </span>
              {isToggle ? (
                <i className={value === "On" ? "switch on" : "switch"} />
              ) : choices || dedicatedPage ? (
                <b>›</b>
              ) : (
                <em>Info</em>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
function FrontLight({
  onBack,
  onKeyboard,
}: {
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [brightness, setBrightness] = useState(32);
  const [warmth, setWarmth] = useState(0);
  const [scheduled, setScheduled] = useState(true);
  const [start, setStart] = useState("8:00 PM");
  const [end, setEnd] = useState("7:00 AM");
  const change = (
    value: number,
    setValue: (value: number) => void,
    amount: number,
  ) => setValue(Math.max(0, Math.min(100, value + amount)));
  return (
    <main className="eink-main eink-settings eink-frontlight">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Front light</strong>
      </div>
      <p className="settings-intro">Display & Power / Front light</p>
      <button
        className="setting-toggle"
        onClick={() => setEnabled((value) => !value)}
      >
        <span>
          <strong>Front light</strong>
          <small>{enabled ? "On" : "Off"}</small>
        </span>
        <i className={enabled ? "switch on" : "switch"} />
      </button>
      <fieldset disabled={!enabled} className="light-controls">
        <LightControl
          symbol={<SunDim size={23} weight="regular" />}
          label="Brightness"
          value={brightness}
          onChange={setBrightness}
          onStep={(amount) => change(brightness, setBrightness, amount)}
        />
        <LightControl
          symbol={<Thermometer size={23} weight="regular" />}
          label="Warmth"
          value={warmth}
          onChange={setWarmth}
          onStep={(amount) => change(warmth, setWarmth, amount)}
        />
      </fieldset>
      <section className="schedule-card">
        <button
          className="setting-toggle"
          onClick={() => setScheduled((value) => !value)}
        >
          <span>
            <strong>Schedule</strong>
            <small>
              {scheduled ? "Front light follows this schedule" : "Off"}
            </small>
          </span>
          <i className={scheduled ? "switch on" : "switch"} />
        </button>
        <button
          disabled={!scheduled}
          onClick={() =>
            onKeyboard({
              title: "Start light",
              value: start,
              kind: "time",
              onChange: setStart,
              onSubmit: setStart,
            })
          }
        >
          <span>Start light</span>
          <b>{start}</b>
        </button>
        <button
          disabled={!scheduled}
          onClick={() =>
            onKeyboard({
              title: "End light",
              value: end,
              kind: "time",
              onChange: setEnd,
              onSubmit: setEnd,
            })
          }
        >
          <span>End light</span>
          <b>{end}</b>
        </button>
      </section>
    </main>
  );
}
function LightControl({
  symbol,
  label,
  value,
  onChange,
  onStep,
}: {
  symbol: ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  onStep: (amount: number) => void;
}) {
  return (
    <div className="light-control">
      <strong className="light-label">{label}</strong>
      <b className="light-symbol" aria-hidden="true">
        {symbol}
      </b>
      <button
        type="button"
        onClick={() => onStep(-5)}
        aria-label={`Lower ${label}`}
      >
        −
      </button>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        style={{
          background: `linear-gradient(to right, #181817 0 ${value}%, transparent ${value}% 100%)`,
        }}
      />
      <button
        type="button"
        onClick={() => onStep(5)}
        aria-label={`Raise ${label}`}
      >
        +
      </button>
      <output>{value}</output>
    </div>
  );
}
function SleepScreen({
  onOpen,
  onBack,
}: {
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
}) {
  const [sleepAfter, setSleepAfter] = useState("2 min");
  const afterChoices = ["30 sec", "1 min", "2 min", "5 min", "Never"];
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Sleep screen</strong>
      </div>
      <p className="settings-intro">
        Choose what the reader shows while it rests.
      </p>
      <button
        className="sleep-after"
        onClick={() =>
          setSleepAfter(
            (value) =>
              afterChoices[
                (afterChoices.indexOf(value) + 1) % afterChoices.length
              ],
          )
        }
      >
        <span>
          <strong>Sleep after</strong>
          <small>Tap to choose timeout</small>
        </span>
        <b>{sleepAfter}</b>
      </button>
      <div className="sleep-choices">
        <button className="selected" onClick={() => onOpen("sleep-cover")}>
          <b>
            Book
            <br />
            cover
          </b>
          <span>
            <strong>Book cover</strong>
            <small>Select any title from Books/</small>
          </span>
        </button>
        <button onClick={() => onOpen("sleep-image")}>
          <b className="image-mark">▧</b>
          <span>
            <strong>Image from files</strong>
            <small>Choose from Images/</small>
          </span>
        </button>
        <button onClick={() => onOpen("sleep-text")}>
          <b className="text-mark">Aa</b>
          <span>
            <strong>Styled text</strong>
            <small>Message, template, and font</small>
          </span>
        </button>
      </div>
    </main>
  );
}
function StatusBarSettings({
  onOpen,
  onBack,
  settings,
  onSettings,
}: {
  onOpen: (page: SettingsPage) => void;
  onBack: () => void;
  settings: StatusSettings;
  onSettings: (settings: StatusSettings) => void;
}) {
  const toggle = (key: "battery" | "clock" | "date") =>
    onSettings({ ...settings, [key]: !settings[key] });
  const row = (
    key: "battery" | "clock" | "date",
    label: string,
    note: string,
  ) => (
    <button className="status-toggle" onClick={() => toggle(key)}>
      <span>
        <strong>{label}</strong>
        <small>{note}</small>
      </span>
      <i className={settings[key] ? "switch on" : "switch"} />
    </button>
  );
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Status bar</strong>
      </div>
      <p className="settings-intro">
        Changes appear in the header immediately.
      </p>
      <div className="status-controls">
        {row("battery", "Show battery %", "82%")}
        {row("clock", "Show clock", "10:23")}
        {row("date", "Show date", "Sep 05")}
      </div>
      <button
        className="status-icons-link"
        onClick={() => onOpen("status-icons")}
      >
        <span>
          <strong>Status icons</strong>
          <small>Connection, power, activity & alerts</small>
        </span>
        <b>›</b>
      </button>
    </main>
  );
}
function StatusIcons({
  onBack,
  settings,
  onSettings,
}: {
  onBack: () => void;
  settings: StatusSettings;
  onSettings: (settings: StatusSettings) => void;
}) {
  const icons = [
    ["wifi", "Wi-Fi", "Signal and connection", WifiHigh],
    ["bluetooth", "Bluetooth", "Connected accessory", Bluetooth],
    ["sync", "Sync", "Companion activity", ArrowsClockwise],
    ["usb", "USB", "Wired connection", Usb],
    ["charging", "Charging", "Power connected", BatteryHigh],
    ["light", "Front light", "Light is active", SunDim],
    ["sleep", "Sleep timer", "Scheduled sleep", Moon],
    ["storage", "Storage alert", "Low-space warning", HardDrive],
  ] as const;
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Status icons</strong>
      </div>
      <p className="settings-intro">
        Only enabled icons appear on the right of the header.
      </p>
      <div className="status-controls icon-controls">
        {icons.map(([key, label, note, Icon]) => (
          <button
            className="status-toggle"
            key={key}
            onClick={() => onSettings({ ...settings, [key]: !settings[key] })}
          >
            <Icon size={20} weight="regular" />
            <span>
              <strong>{label}</strong>
              <small>{note}</small>
            </span>
            <i className={settings[key] ? "switch on" : "switch"} />
          </button>
        ))}
      </div>
    </main>
  );
}
function RefreshDialog({
  choice,
  onApply,
}: {
  choice: string;
  onApply: (choice: string) => void;
}) {
  const options = [
    "1 page",
    "5 pages",
    "10 pages",
    "15 pages",
    "30 pages",
    "Never",
  ];
  return (
    <section
      className="eink-dialog"
      role="dialog"
      aria-label="Refresh clean-up"
    >
      <div>
        <h2>Refresh clean-up</h2>
        <div className="dialog-options">
          {options.map((option) => (
            <button
              className={choice === option ? "selected" : ""}
              onClick={() => onApply(option)}
              key={option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
function SleepCoverPicker({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState("The Art of Reading");
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Book cover</strong>
      </div>
      <p className="settings-intro">Books/ · use a cover from your library.</p>
      <div className="sleep-picker">
        {BOOKS.slice(0, 4).map(([title, author]) => (
          <button
            key={title}
            className={selected === title ? "selected" : ""}
            onClick={() => setSelected(title)}
          >
            <span className="mini-cover">{title.slice(0, 1)}</span>
            <span>
              <strong>{title}</strong>
              <small>{author}</small>
            </span>
            <i className={selected === title ? "switch on" : "switch"} />
          </button>
        ))}
      </div>
    </main>
  );
}
function SleepImagePicker({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState("quiet-forest.webp");
  const images = [
    ["quiet-forest.webp", "WEBP · 800 × 1200"],
    ["reading-room.jpg", "JPEG · 1200 × 1600"],
    ["paper-texture.png", "PNG · 800 × 1200"],
    ["night-sky.bmp", "BMP · 800 × 1200"],
  ] as const;
  return (
    <main className="eink-main eink-settings">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Image from files</strong>
      </div>
      <p className="settings-intro">
        Images/ · supported: JPG, PNG, WEBP, BMP.
      </p>
      <div className="sleep-picker">
        {images.map(([name, detail]) => (
          <button
            key={name}
            className={selected === name ? "selected" : ""}
            onClick={() => setSelected(name)}
          >
            <span className="mini-image">▧</span>
            <span>
              <strong>{name}</strong>
              <small>{detail}</small>
            </span>
            <i className={selected === name ? "switch on" : "switch"} />
          </button>
        ))}
      </div>
    </main>
  );
}
function SleepTextEditor({
  onBack,
  onKeyboard,
}: {
  onBack: () => void;
  onKeyboard: (request: KeyboardRequest) => void;
}) {
  const [text, setText] = useState("Rest well.\nA new chapter waits.");
  const [template, setTemplate] = useState("Quiet");
  const [font, setFont] = useState("Press Start 2P");
  const templates = ["Quiet", "Quote", "Minimal"] as const;
  const fonts = [
    "Press Start 2P",
    "Literata",
    "Atkinson",
    "SD: Ember Mono",
  ] as const;
  return (
    <main className="eink-main eink-settings eink-sleep-text">
      <div className="screen-title">
        <button onClick={onBack}>‹</button>
        <strong>Styled text</strong>
      </div>
      <p className="settings-intro">
        Fonts/ · SD fonts appear alongside built-ins.
      </p>
      <button
        className="text-entry"
        onClick={() =>
          onKeyboard({
            title: "Sleep screen text",
            value: text,
            kind: "text",
            onChange: setText,
            onSubmit: setText,
          })
        }
      >
        {text}
      </button>
      <div className="choice-row">
        {templates.map((item) => (
          <button
            className={template === item ? "selected" : ""}
            onClick={() => setTemplate(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="choice-row font-row">
        {fonts.map((item) => (
          <button
            className={font === item ? "selected" : ""}
            onClick={() => setFont(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <output className={`sleep-preview ${template.toLowerCase()}`}>
        {text}
      </output>
    </main>
  );
}
function EinkKeyboard({
  request,
  onClose,
}: {
  request: KeyboardRequest;
  onClose: () => void;
}) {
  const [value, setValue] = useState(request.value);
  const [cursor, setCursor] = useState(request.value.length);
  const [shift, setShift] = useState<"off" | "once" | "lock">("off");
  const [symbols, setSymbols] = useState(request.kind === "time");
  const [symbolPage, setSymbolPage] = useState<"common" | "more">("common");
  const letters = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  const update = (next: string, nextCursor = cursor) => {
    setValue(next);
    setCursor(nextCursor);
    request.onChange?.(next);
    request.onCursorChange?.(nextCursor);
  };
  const insert = (key: string) => {
    const next = `${value.slice(0, cursor)}${key}${value.slice(cursor)}`;
    update(next, cursor + key.length);
    if (shift === "once" && !symbols) setShift("off");
  };
  const remove = () => {
    if (cursor > 0)
      update(`${value.slice(0, cursor - 1)}${value.slice(cursor)}`, cursor - 1);
  };
  const apply = () => {
    request.onSubmit(value.trim());
    onClose();
  };
  const dismiss = () => {
    request.onDismiss?.();
    onClose();
  };
  const toggleShift = () =>
    setShift((current) =>
      current === "off" ? "once" : current === "once" ? "lock" : "off",
    );
  const row = (keys: string, className = "") => (
    <div className={`keyboard-row ${className}`}>
      {keys.split("").map((key, index) => {
        const label =
          shift !== "off" && !symbols && /[a-z]/.test(key)
            ? key.toUpperCase()
            : key;
        return (
          <button key={`${key}-${index}`} onClick={() => insert(label)}>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
  return (
    <section className="eink-keyboard" aria-label={`${request.title} keyboard`}>
      <div className="keyboard-heading">
        <strong>{request.title}</strong>
        <button onClick={dismiss}>Cancel</button>
      </div>
      <p className="keyboard-tip">
        <b>
          {shift === "lock"
            ? "Caps lock:"
            : shift === "once"
              ? "Shift:"
              : "Typing in:"}
        </b>{" "}
        {shift === "lock"
          ? "uppercase stays on"
          : shift === "once"
            ? "next letter uppercase"
            : request.title}
      </p>
      {row(
        symbols
          ? symbolPage === "common"
            ? "[]{}=<>|/"
            : "~`^%$#@&*"
          : "@#$%&*-_!",
        "symbol-strip",
      )}
      {row("1234567890", "number-row")}
      {row(symbols ? (symbolPage === "common" ? "!?:;\"'+-()" : "_\\|/.,;:?!") : letters[0])}
      {row(symbols ? (symbolPage === "common" ? "_\\|/<>[]{}" : "=+*#&%@~`") : letters[1])}
      <div className="keyboard-row shift-row">
        <button
          className={`keyboard-action-key key-shift${symbols ? " key-symbol-page" : ""}${shift === "off" ? "" : " active"}`}
          onClick={() => symbols ? setSymbolPage((current) => current === "common" ? "more" : "common") : toggleShift()}
        >
          {symbols ? "#+=" : <ArrowFatUp weight="bold" aria-hidden="true" />}
        </button>
        {(symbols ? (symbolPage === "common" ? "@#$%&*-_" : "()[]{}<>|") : letters[2]).split("").map((key, index) => (
          <button
            key={`${key}-${index}`}
            onClick={() => insert(shift === "off" || symbols ? key : key.toUpperCase())}
          >
            {shift === "off" || symbols ? key : key.toUpperCase()}
          </button>
        ))}
        <button className="keyboard-action-key key-backspace" onClick={remove} aria-label="Backspace">
          <Backspace weight="bold" aria-hidden="true" />
        </button>
      </div>
      <div className="keyboard-row keyboard-bottom">
        <button className="keyboard-action-key key-mode" onClick={() => setSymbols((current) => !current)}>
          {symbols ? "abc" : "?123"}
        </button>
        <button
          className="keyboard-action-key key-cursor"
          onClick={() => setCursor((current) => {
            const next = Math.max(0, current - 1);
            request.onCursorChange?.(next);
            return next;
          })}
        >
          ‹
        </button>
        <button className="keyboard-action-key key-space" onClick={() => insert(" ")}>
          −
        </button>
        <button
          className="keyboard-action-key key-cursor"
          onClick={() => setCursor((current) => {
            const next = Math.min(value.length, current + 1);
            request.onCursorChange?.(next);
            return next;
          })}
        >
          ›
        </button>
        <button className="keyboard-action-key key-apply" onClick={apply}>
          ✓
        </button>
      </div>
    </section>
  );
}
