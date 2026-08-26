import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { STATES } from "../../data/stateData";
import { ROAD_CONNECTED_STATES } from "../../data/roadNetwork";

const HOME_OPTIONS = ROAD_CONNECTED_STATES.map((code) => STATES.find((s) => s.code === code)!)
  .filter(Boolean)
  .sort((a, b) => b.demandMultiplier - a.demandMultiplier);

export function NewGameScreen() {
  const setHomeState = useGameStore((s) => s.setHomeState);
  const [code, setCode] = useState("");

  return (
    <div className="max-w-lg mx-auto mt-16 bg-slate-800 rounded-lg p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-white">Start your company</h2>
      <p className="text-sm text-slate-400">
        Pick the state to headquarter in. Trucks without their own terminal will run their
        hauls out of this state, so a high-demand hub means shorter deadhead to good freight.
      </p>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
        Home state
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="bg-slate-700 text-white text-sm rounded px-2 py-2 normal-case"
        >
          <option value="" disabled>
            Choose a state…
          </option>
          {HOME_OPTIONS.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} — {s.majorCity} (demand {s.demandMultiplier.toFixed(2)}×)
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={() => code && setHomeState(code)}
        disabled={!code}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-4 py-2 rounded transition-colors self-start"
      >
        Start Company
      </button>
    </div>
  );
}
