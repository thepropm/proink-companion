import { Link } from "react-router-dom";
import {
  BookOpen,
  Cpu,
  Clock,
  HardDrive,
  FolderOpen,
  GearSix,
  ChartLineUp,
  Info,
  ArrowRight,
  CircleDashed,
  Usb,
} from "@phosphor-icons/react";
import { useDeviceStatus, useReadingProgress, useOtaCheck, useApplyOta } from "../hooks/useDeviceQueries";
import { Card, ProgressBar, Skeleton, Button, EmptyState, ErrorState, Tag } from "../components/ui";
import "./Dashboard.css";

function formatUptime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

const SHORTCUTS = [
  {
    to: "/files",
    icon: FolderOpen,
    tone: "info" as const,
    title: "Files",
    description: "Browse, upload, download, and organize what's on the SD card.",
  },
  {
    to: "/settings",
    icon: GearSix,
    tone: "accent" as const,
    title: "Settings",
    description: "WiFi, reading defaults, home theme, sleep screen, button mapping.",
  },
  {
    to: "/stats",
    icon: ChartLineUp,
    tone: "success" as const,
    title: "Stats",
    description: "Reading time, streaks, books finished, and the crash log.",
  },
  {
    to: "/flash",
    icon: Usb,
    tone: "mono" as const,
    title: "Flash",
    description: "Install the latest Proink OS release over USB.",
  },
  {
    to: "/about",
    icon: Info,
    tone: "neutral" as const,
    title: "About",
    description: "What Proink Companion is and who built it.",
  },
];

export function Dashboard() {
  const { data: status, isLoading: statusLoading, isError: statusIsError, error: statusError, refetch: refetchStatus } =
    useDeviceStatus();
  const {
    data: progress,
    isLoading: progressLoading,
    isError: progressIsError,
    error: progressError,
    refetch: refetchProgress,
  } = useReadingProgress();
  const { data: ota } = useOtaCheck();
  const applyOta = useApplyOta();

  return (
    <div className="dashboard">
      <Card className="welcome-card">
        <div className="welcome-top">
          <span className="welcome-eyebrow">
            <CircleDashed size={10} weight="fill" className={statusIsError ? "dot-danger" : "dot-live"} />
            {statusIsError ? "Unreachable" : status ? "Connected" : "Connecting…"}
          </span>
          {ota?.updateAvailable && <Tag variant="accent">Update available</Tag>}
        </div>
        <h1 className="welcome-title">{status?.deviceName ?? "Your Proink"}</h1>
        <p className="welcome-subtitle">Manage your device over the local network - files, settings, and reading stats.</p>

        {statusIsError ? (
          <ErrorState message={(statusError as Error).message} onRetry={() => refetchStatus()} />
        ) : (
          <div className="welcome-stats">
            <div className="mini-stat">
              <span className="mini-stat-label">
                <Cpu size={13} /> Network
              </span>
              {statusLoading || !status ? (
                <Skeleton height={20} />
              ) : (
                <span className="mini-stat-value mono">
                  {status.ip} · {status.mode.toUpperCase()}
                </span>
              )}
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">
                <HardDrive size={13} /> Firmware
              </span>
              {statusLoading || !status ? <Skeleton height={20} /> : <span className="mini-stat-value mono">{status.firmwareVersion}</span>}
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">
                <Clock size={13} /> Uptime
              </span>
              {statusLoading || !status ? <Skeleton height={20} /> : <span className="mini-stat-value">{formatUptime(status.uptimeMs)}</span>}
            </div>
          </div>
        )}

        {ota?.updateAvailable && (
          <div className="ota-row">
            <p>
              Firmware <strong>{ota.latestVersion}</strong> is available (running {ota.currentVersion}).
            </p>
            <Button
              variant="primary"
              disabled={applyOta.isPending}
              onClick={() => {
                applyOta.mutate();
              }}
            >
              {applyOta.isPending ? "Applying…" : "Update now"}
            </Button>
          </div>
        )}
      </Card>

      <Card className="reading-card">
        <h2 className="section-eyebrow">
          <BookOpen size={13} weight="bold" /> Now reading
        </h2>
        {progressIsError ? (
          <ErrorState message={(progressError as Error).message} onRetry={() => refetchProgress()} />
        ) : progressLoading || !progress ? (
          <Skeleton height={90} />
        ) : !progress.hasOpenBook ? (
          <EmptyState title="Nothing open right now" hint="Start reading on-device to see live progress here." />
        ) : (
          <div className="page-preview">
            <p className="page-preview-title">"{progress.title}"</p>
            <p className="page-preview-meta">
              Page {progress.referencePage} of {progress.referencePageCount}
            </p>
            <ProgressBar value={progress.progress ?? 0} />
            <div className="page-preview-footer">
              <span>{Math.round((progress.progress ?? 0) * 100)}% complete</span>
              {!!progress.timeLeftEstimateSeconds && <span>~{Math.round(progress.timeLeftEstimateSeconds / 60)} min left</span>}
            </div>
          </div>
        )}
      </Card>

      <section className="shortcuts">
        <p className="section-eyebrow">Navigate</p>
        <h2 className="shortcuts-title">Shortcuts</h2>
        <p className="shortcuts-subtitle">Jump straight to what you need.</p>

        <div className="shortcuts-grid">
          {SHORTCUTS.map(({ to, icon: Icon, tone, title, description }) => (
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
      </section>
    </div>
  );
}
