import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserX, AlertTriangle } from 'lucide-react';
import { differenceInYears } from 'date-fns';

const parseLocalISO = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const TerminationPage: React.FC = () => {
  const { employees, terminations, terminateEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const selectedEmployee = employees.find(e => e.id === parseInt(formData.employeeId));
  const yearsWorkedPreview = selectedEmployee 
    ? differenceInYears(parseLocalISO(formData.date), parseLocalISO(selectedEmployee.joinDate))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.employeeId) return;
    
    if (window.confirm("Tindakan ini akan mengubah status karyawan menjadi 'Tidak Aktif'. Lanjutkan?")) {
        terminateEmployee(parseInt(formData.employeeId), formData.date, formData.reason);
        setIsModalOpen(false);
        setFormData({ employeeId: '', date: '', reason: '' });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Terminasi Karyawan</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-sm"
        >
          <UserX size={18} />
          Terminasi Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
                    <th className="p-4">Karyawan</th>
                    <th className="p-4">Tanggal Terminasi</th>
                    <th className="p-4">Masa Kerja</th>
                    <th className="p-4">Alasan</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {terminations.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data terminasi.</td></tr>
                ) : (
                    terminations.map(term => {
                        const emp = employees.find(e => e.id === term.employeeId);
                        return (
                            <tr key={term.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">
                                    {emp?.name} <span className="text-xs text-gray-400">({emp?.position})</span>
                                </td>
                                <td className="p-4 text-gray-700">{term.terminationDate}</td>
                                <td className="p-4 text-gray-700">{term.yearsWorked} Tahun</td>
                                <td className="p-4 text-gray-600 italic max-w-xs truncate">{term.reason}</td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl border-t-4 border-red-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Proses Terminasi</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Karyawan (Aktif)</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                >
                    <option value="">Pilih...</option>
                    {employees.filter(e => e.isActive).map(e => (
                        <option key={e.id} value={e.id}>{e.name} - {e.position}</option>
                    ))}
                </select>
              </div>

              {selectedEmployee && (
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                      Tanggal Masuk: <strong>{selectedEmployee.joinDate}</strong>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Efektif Terminasi</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              {selectedEmployee && (
                  <div className="text-sm text-blue-600 font-medium">
                      Estimasi Masa Kerja: {yearsWorkedPreview} Tahun
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Terminasi</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Jelaskan alasan detail..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Proses Terminasi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminationPage;