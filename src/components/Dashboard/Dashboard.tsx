import { useGameStore } from "../../state/gameStore";
import { formatCents } from "../../utils/format";
import { CollapsiblePanel } from "../common/CollapsiblePanel";

export function Dashboard() {
  const company = useGameStore((s) => s.state.company);
  const eventLog = useGameStore((s) => s.state.eventLog);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const saveGame = useGameStore((s) => s.saveGame);
  const resetGame = useGameStore((s) => s.resetGame);

  const recentEvents = [...eventLog].slice(-8).reverse();

  return (
    <CollapsiblePanel
      title="Overview"
      storageKey="dashboard"
      headerRight={
        <button
          onClick={advanceDay}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded transition-colors text-sm"
        >
          Advance Day
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Cash" value={formatCents(company.cashCents)} />
          <Stat label="Reputation" value={`${company.reputation}/100`} />
          <Stat label="Day" value={String(company.currentDay)} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveGame}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              if (confirm("Reset your company? This cannot be undone.")) resetGame();
            }}
            className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded transition-colors"
          >
            Reset
          </button>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">Recent Activity</h3>
          <ul className="flex flex-col gap-1 max-h-48 overflow-y-auto text-sm">
            {recentEvents.map((event) => (
              <li key={event.id} className="text-slate-300">
                <span className="text-slate-500">Day {event.day}:</span> {event.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CollapsiblePanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900 rounded p-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}
