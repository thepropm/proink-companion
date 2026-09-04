import { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, BookOpen, Clock, Trophy, WarningCircle, Plugs } from "@phosphor-icons/react";
import { useDeviceCrashes, useDeviceStats } from "../hooks/useDeviceQueries";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { Card, ErrorState, Skeleton, EmptyState, Button } from "../components/ui";
import "./Stats.css";

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
}

export function Stats() {
  const { base } = useDeviceConnection();
  const { data: stats, isLoading, error, refetch } = useDeviceStats();
  const { data: crashes } = useDeviceCrashes();
  const [showCrashes, setShowCrashes] = useState(false);

  if (!base) {
    return (
      <div>
        <h1 className="page-title">Stats</h1>
        <EmptyState
          icon={<Plugs size={28} />}
          title="Not connected"
          hint="Connect to your Proink to see reading stats and the crash log."
        />
        <Link to="/connect">
          <Button variant="primary">Connect a device</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Stats</h1>

      {isLoading && <Skeleton height={140} />}
      {error && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <Clock size={20} weight="bold" />
            <span className="stat-value">{formatHours(stats.totalSecondsRead)}</span>
            <span className="stat-label">Total reading time</span>
          </Card>
          <Card className="stat-card">
            <BookOpen size={20} weight="bold" />
            <span className="stat-value">{stats.booksFinished}</span>
            <span className="stat-label">Books finished</span>
          </Card>
          <Card className="stat-card">
            <Flame size={20} weight="bold" />
            <span className="stat-value">{stats.currentStreakDays}</span>
            <span className="stat-label">Current streak (days)</span>
          </Card>
          <Card className="stat-card">
            <Trophy size={20} weight="bold" />
            <span className="stat-value">{stats.longestStreakDays}</span>
            <span className="stat-label">Longest streak (days)</span>
          </Card>
        </div>
      )}

      <div className="stats-crashes">
        <Button variant="ghost" onClick={() => setShowCrashes((v) => !v)}>
          <WarningCircle size={16} /> {showCrashes ? "Hide" : "Show"} crash log
        </Button>
        {showCrashes &&
          (crashes ? (
            crashes.trim() ? (
              <pre className="crash-log mono">{crashes}</pre>
            ) : (
              <EmptyState title="No crashes logged" hint="Good sign." />
            )
          ) : (
            <Skeleton height={80} />
          ))}
      </div>
    </div>
  );
}
