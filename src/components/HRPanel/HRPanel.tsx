import { useGameStore } from "../../state/gameStore";
import { formatCents } from "../../utils/format";

export function HRPanel() {
  const candidates = useGameStore((s) => s.state.driverCandidates);
  const drivers = useGameStore((s) => s.state.drivers);
  const hireDriver = useGameStore((s) => s.hireDriver);

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">HR / Drivers</h2>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Hiring Pool ({candidates.length})
        </h3>
        {candidates.length === 0 ? (
          <p className="text-slate-500 text-sm">No candidates right now. Check back after the week rolls over.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {candidates.map((c) => (
              <div key={c.id} className="bg-slate-900 rounded p-3 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{c.name}</div>
                  <div className="text-xs text-slate-400">
                    CDL-{c.cdlClass} · Exp {c.experienceLevel}/5 · {formatCents(c.wagePerMileCents)}/mi
                  </div>
                </div>
                <button
                  onClick={() => hireDriver(c.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors"
                >
                  Hire
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Roster ({drivers.length})
        </h3>
        {drivers.length === 0 ? (
          <p className="text-slate-500 text-sm">No drivers hired yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {drivers.map((d) => (
              <div key={d.id} className="bg-slate-900 rounded p-3 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{d.name}</div>
                  <div className="text-xs text-slate-400">
                    CDL-{d.cdlClass} · Exp {d.experienceLevel}/5 · {formatCents(d.wagePerMileCents)}/mi
                  </div>
                </div>
                <DriverStatusBadge status={d.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DriverStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    available: "bg-slate-700 text-slate-200",
    onRoute: "bg-blue-900 text-blue-200",
    offDuty: "bg-amber-900 text-amber-200",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] ?? colors.available}`}>{status}</span>
  );
}
