import { Link } from "react-router-dom";
import { Image, Stack, BookOpen, ArrowRight } from "@phosphor-icons/react";
import "./Dashboard.css";

const TOOLS = [
  {
    to: "/cover-maker",
    icon: Image,
    tone: "info" as const,
    title: "Cover Maker",
    description: "Resize or crop an image to an exact size, for an EPUB cover.",
  },
  {
    to: "/image-maker",
    icon: Stack,
    tone: "accent" as const,
    title: "Image Maker",
    description: "Dither a picture into a device-native .xtg/.xth page, or a .bmp sleep screen.",
  },
  {
    to: "/book-maker",
    icon: BookOpen,
    tone: "success" as const,
    title: "Book Maker",
    description: "Pack several images into one multi-page .xtc/.xtch comic/scan-style book.",
  },
];

export function Tools() {
  return (
    <div>
      <h1 className="page-title">Tools</h1>
      <p className="tools-subtitle">Prepare device-native images and books, right in the browser.</p>

      <div className="shortcuts-grid">
        {TOOLS.map(({ to, icon: Icon, tone, title, description }) => (
          <Link key={to} to={to} className="shortcut-card">
            <div className={`shortcut-icon shortcut-icon-${tone}`}>
              <Icon size={18} weight="bold" />
            </div>
            <h3 className="shortcut-title">{title}</h3>
            <p className="shortcut-description">{description}</p>
            <span className="shortcut-open">
              Open <ArrowRight size={13} weight="bold" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
