import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { formatCents } from "../../utils/format";

const CASH_INCREMENTS = [10_000_00, 100_000_00, 1_000_000_00];

export function CheatsPanel() {
  const [open, setOpen] = useState(false);

  const freeMode = useGameStore((s) => s.freeMode);
  const reputation = useGameStore((s) => s.state.company.reputation);
  const currentDay = useGameStore((s) => s.state.company.currentDay);
  const licenseCount = useGameStore((s) => s.state.licenses.length);

  const toggleFreeMode = useGameStore((s) => s.toggleFreeMode);
  const injectCash = useGameStore((s) => s.cheatInjectCash);
  const grantAllLicenses = useGameStore((s) => s.cheatGrantAllLicenses);
  const setReputation = useGameStore((s) => s.cheatSetReputation);
  const setDay = useGameStore((s) => s.cheatSetDay);

  const [customCash, setCustomCash] = useState("");

  return (
    <div className="bg-slate-800 rounded-lg border border-amber-700/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-400">
          🛠 Cheats / Debug
        </span>
        <span className="text-xs text-slate-400">{open ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4">
          <p className="text-xs text-slate-500">
            For testing only. Free Mode is not saved and resets on reload; other changes persist
            like normal game state.
          </p>

          {/* Cash */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Inject Cash</h3>
            <div className="flex flex-wrap items-center gap-2">
              {CASH_INCREMENTS.map((cents) => (
                <button
                  key={cents}
                  onClick={() => injectCash(cents)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded transition-colors"
                >
                  +{formatCents(cents)}
                </button>
              ))}
              <input
                type="number"
                value={customCash}
                onChange={(e) => setCustomCash(e.target.value)}
                placeholder="dollars"
                className="bg-slate-700 text-white text-sm rounded px-2 py-1.5 w-28"
              />
              <button
                onClick={() => {
                  const dollars = Number(customCash);
                  if (Number.isFinite(dollars) && dollars !== 0) injectCash(Math.round(dollars * 100));
                  setCustomCash("");
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Licenses */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Licenses</h3>
            <button
              onClick={grantAllLicenses}
              className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded transition-colors"
            >
              Grant all licenses (held: {licenseCount})
            </button>
          </div>

          {/* Reputation / Day */}
          <div className="flex flex-wrap gap-6">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Reputation
              <input
                type="number"
                min={0}
                max={100}
                value={reputation}
                onChange={(e) => setReputation(Number(e.target.value))}
                className="bg-slate-700 text-white text-sm rounded px-2 py-1.5 w-24 normal-case"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Day
              <input
                type="number"
                min={1}
                value={currentDay}
                onChange={(e) => setDay(Number(e.target.value))}
                className="bg-slate-700 text-white text-sm rounded px-2 py-1.5 w-24 normal-case"
              />
            </label>
          </div>

          {/* Free mode */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Free Mode</h3>
            <button
              onClick={toggleFreeMode}
              className={`text-sm font-semibold px-3 py-1.5 rounded transition-colors ${
                freeMode
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
            >
              {freeMode ? "Free Mode: ON" : "Free Mode: OFF"}
            </button>
            <p className="text-xs text-slate-500 mt-1">
              Vehicles, terminals, and upgrades are free and ignore fleet-capacity limits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
