import { Dashboard } from "./components/Dashboard/Dashboard";
import { FleetManager } from "./components/FleetManager/FleetManager";
import { ContractBoard } from "./components/ContractBoard/ContractBoard";

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
        <FleetManager />
        <ContractBoard />
      </main>
    </div>
  );
}

export default App;
