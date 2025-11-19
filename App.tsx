import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import LeaveBalance from './pages/LeaveBalance';
import LeaveUsagePage from './pages/LeaveUsage';
import TerminationPage from './pages/Termination';

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/balances" element={<LeaveBalance />} />
              <Route path="/leave-usage" element={<LeaveUsagePage />} />
              <Route path="/termination" element={<TerminationPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;