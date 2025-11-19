import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Zap, Plus } from 'lucide-react';

const LeaveBalance: React.FC = () => {
  const { employees, balances, generateAutoBalances, addManualBalance } = useData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    amount: 12,
    startDate: `${selectedYear}-01-01`,
    endDate: `${selectedYear}-12-31`
  });

  const handleGenerate = () => {
    if (window.confirm(`Apakah Anda yakin ingin generate saldo otomatis untuk tahun ${selectedYear}? Ini hanya akan berlaku untuk karyawan dengan masa kerja >= 1 tahun.`)) {
      generateAutoBalances(selectedYear);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) return;
    addManualBalance({
      employeeId: parseInt(formData.employeeId),
      amount: formData.amount,
      startDate: formData.startDate,
      endDate: formData.endDate,
      year: selectedYear
    });
    setIsModalOpen(false);
  };

  const filteredBalances = balances.filter(b => b.year === selectedYear);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Saldo Cuti</h1>
          <p className="text-gray-500 mt-1">Kelola jatah cuti tahunan karyawan.</p>
        </div>
        <div className="flex items-center gap-4">
            <select 
                className="border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                    <option key={y} value={y}>Tahun {y}</option>
                ))}
            </select>
            <button
                onClick={handleGenerate}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center gap-2 shadow-sm"
            >
                <Zap size={18} />
                Generate Otomatis
            </button>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
                <Plus size={18} />
                Manual
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
                    <th className="p-4">Karyawan</th>
                    <th className="p-4">Jatah Cuti</th>
                    <th className="p-4">Periode Berlaku</th>
                    <th className="p-4">Tahun</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredBalances.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data saldo untuk tahun {selectedYear}.</td></tr>
                ) : (
                    filteredBalances.map(bal => {
                        const emp = employees.find(e => e.id === bal.employeeId);
                        return (
                            <tr key={bal.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{emp?.name || 'Unknown ID'}</td>
                                <td className="p-4 font-bold text-blue-600">{bal.amount} Hari</td>
                                <td className="p-4 text-sm text-gray-600">{bal.startDate} s/d {bal.endDate}</td>
                                <td className="p-4 text-gray-500">{bal.year}</td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
      </div>

       {/* Manual Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Tambah Saldo Manual</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                >
                    <option value="">Pilih Karyawan</option>
                    {employees.filter(e => e.isActive).map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hari</label>
                <input 
                  type="number" 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                    <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Berakhir</label>
                    <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalance;