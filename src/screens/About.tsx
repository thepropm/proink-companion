import { GithubLogo } from "@phosphor-icons/react";
import { Card } from "../components/ui";
import "./About.css";

export function About() {
  return (
    <div>
      <h1 className="page-title">About</h1>
      <Card className="about-card">
        <p className="about-name">TheProPM</p>
        <p className="about-bio">Founder of The Pro Society. Tech enthusiast, always innovating.</p>
        <a className="about-link" href="https://github.com/thepropm" target="_blank" rel="noreferrer">
          <GithubLogo size={18} weight="bold" />
          github.com/thepropm
        </a>
      </Card>
      <p className="about-footer">Proink Companion is the browser-side counterpart to Proink OS, developed by thepropm.</p>
    </div>
  );
}
