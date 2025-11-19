import React from 'react';
import { useData } from '../context/DataContext';
import { EmployeeSummary } from '../types';
import { Download } from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';

const Dashboard: React.FC = () => {
  const { employees, balances, usage } = useData();

  const currentYear = new Date().getFullYear();

  // Calculate Summary Data
  const summaryData: EmployeeSummary[] = employees
    .filter(emp => emp.isActive)
    .map(emp => {
      // Get balances for current year
      const empBalances = balances.filter(b => b.employeeId === emp.id && b.year === currentYear);
      const totalBalance = empBalances.reduce((sum, b) => sum + b.amount, 0);

      // Get usage for current year
      // Simplified: assumes usage dates fall strictly within the year for this demo
      const empUsage = usage.filter(u => 
        u.employeeId === emp.id && 
        u.startDate.startsWith(currentYear.toString())
      );
      const totalUsed = empUsage.reduce((sum, u) => sum + u.totalDays, 0);

      return {
        employeeId: emp.id,
        name: emp.name,
        position: emp.position,
        joinDate: emp.joinDate,
        totalBalance: totalBalance,
        usedLeave: totalUsed,
        remainingLeave: totalBalance - totalUsed,
      };
    });

  const handleExport = () => {
    downloadCSV(summaryData, `Leave_Summary_${currentYear}`);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Cuti Karyawan Aktif Tahun {currentYear}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Download size={18} />
          Export to CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 uppercase font-semibold">Karyawan Aktif</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{summaryData.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 uppercase font-semibold">Total Cuti Tersedia</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {summaryData.reduce((acc, curr) => acc + curr.remainingLeave, 0)} Hari
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 uppercase font-semibold">Cuti Terpakai (YTD)</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {summaryData.reduce((acc, curr) => acc + curr.usedLeave, 0)} Hari
          </p>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Nama Karyawan</th>
                <th className="p-4 font-semibold">Posisi</th>
                <th className="p-4 font-semibold text-center">Saldo ({currentYear})</th>
                <th className="p-4 font-semibold text-center">Terpakai</th>
                <th className="p-4 font-semibold text-center">Sisa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaryData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Tidak ada data karyawan aktif.</td>
                </tr>
              ) : (
                summaryData.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{row.name}</td>
                    <td className="p-4 text-gray-600">{row.position}</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold">
                        {row.totalBalance}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-600 font-medium">{row.usedLeave}</td>
                    <td className="p-4 text-center">
                      <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                        row.remainingLeave > 5 ? 'bg-green-100 text-green-800' : 
                        row.remainingLeave > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.remainingLeave}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;