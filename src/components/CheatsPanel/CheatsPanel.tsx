import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { formatCents } from "../../utils/format";
import { STATES } from "../../data/stateData";
import { ROAD_CONNECTED_STATES } from "../../data/roadNetwork";
import { CollapsiblePanel } from "../common/CollapsiblePanel";

const CASH_INCREMENTS = [10_000_00, 100_000_00, 1_000_000_00];

export function CheatsPanel() {
  const freeMode = useGameStore((s) => s.freeMode);
  const reputation = useGameStore((s) => s.state.company.reputation);
  const currentDay = useGameStore((s) => s.state.company.currentDay);
  const homeStateCode = useGameStore((s) => s.state.company.homeStateCode);
  const licenseCount = useGameStore((s) => s.state.licenses.length);

  const toggleFreeMode = useGameStore((s) => s.toggleFreeMode);
  const injectCash = useGameStore((s) => s.cheatInjectCash);
  const grantAllLicenses = useGameStore((s) => s.cheatGrantAllLicenses);
  const setReputation = useGameStore((s) => s.cheatSetReputation);
  const setDay = useGameStore((s) => s.cheatSetDay);
  const setHomeState = useGameStore((s) => s.setHomeState);

  const [customCash, setCustomCash] = useState("");

  return (
    <CollapsiblePanel title="🛠 Cheats / Debug" storageKey="cheats" accent="amber" defaultOpen={false}>
      <div className="flex flex-col gap-4">
        <p className="text-xs text-slate-500">
          For testing only. Free Mode is not saved and resets on reload; other changes persist
          like normal game state.
        </p>

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

        <div>
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Licenses</h3>
          <button
            onClick={grantAllLicenses}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded transition-colors"
          >
            Grant all licenses (held: {licenseCount})
          </button>
        </div>

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
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Home state
            <select
              value={homeStateCode}
              onChange={(e) => setHomeState(e.target.value)}
              className="bg-slate-700 text-white text-sm rounded px-2 py-1.5 normal-case"
            >
              {ROAD_CONNECTED_STATES.map((c) => (
                <option key={c} value={c}>
                  {c} — {STATES.find((s) => s.code === c)?.majorCity ?? c}
                </option>
              ))}
            </select>
          </label>
        </div>

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
            Vehicles, terminals, upgrades, and licenses are free and ignore fleet-capacity limits.
          </p>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
