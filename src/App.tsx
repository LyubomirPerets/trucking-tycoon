import { Dashboard } from "./components/Dashboard/Dashboard";
import { FleetManager } from "./components/FleetManager/FleetManager";
import { ContractBoard } from "./components/ContractBoard/ContractBoard";
import { LicenseOffice } from "./components/LicenseOffice/LicenseOffice";
import { TerminalMap } from "./components/TerminalMap/TerminalMap";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Trucking Empire</h1>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <Dashboard />
        </div>
        <div className="lg:col-span-2">
          <TerminalMap />
        </div>
        <FleetManager />
        <LicenseOffice />
        <div className="lg:col-span-2">
          <ContractBoard />
        </div>
      </main>
    </div>
  );
}

export default App;
