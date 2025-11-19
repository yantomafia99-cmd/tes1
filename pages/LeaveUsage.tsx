import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Calendar } from 'lucide-react';

const LeaveUsagePage: React.FC = () => {
  const { employees, usage, addLeaveUsage } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.employeeId || !formData.startDate || !formData.endDate) return;

    addLeaveUsage({
        employeeId: parseInt(formData.employeeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note
    });
    setIsModalOpen(false);
    setFormData({ employeeId: '', startDate: '', endDate: '', note: '' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Riwayat Cuti</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Input Cuti
        </button>
      </div>

      <div className="space-y-4">
        {usage.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                Belum ada riwayat pemakaian cuti.
            </div>
        ) : (
            usage.slice().reverse().map(use => {
                const emp = employees.find(e => e.id === use.employeeId);
                return (
                    <div key={use.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{emp?.name}</h3>
                                <p className="text-sm text-gray-500">{use.startDate} s/d {use.endDate}</p>
                                <p className="text-gray-600 mt-1 text-sm italic">"{use.note}"</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl font-bold text-gray-800">{use.totalDays}</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">Hari Diambil</span>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Input Cuti Karyawan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Cuti</label>
                    <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selesai Cuti</label>
                    <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Alasan</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                />
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

export default LeaveUsagePage;