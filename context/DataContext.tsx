import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, LeaveBalance, LeaveUsage, Termination } from '../types';
import { differenceInYears, differenceInDays, format } from 'date-fns';

// KONFIGURASI URL API
// Jika Frontend dan Backend ada di domain sama (via proxy), gunakan '/api'
// Jika beda domain/port saat dev, gunakan 'http://localhost:3001/api'
const API_URL = '/api'; 

interface DataContextType {
  employees: Employee[];
  balances: LeaveBalance[];
  usage: LeaveUsage[];
  terminations: Termination[];
  isLoading: boolean;
  
  addEmployee: (emp: Omit<Employee, 'id' | 'isActive'>) => Promise<void>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<void>;
  
  generateAutoBalances: (year: number) => Promise<void>;
  addManualBalance: (bal: Omit<LeaveBalance, 'id'>) => Promise<void>;
  
  addLeaveUsage: (use: Omit<LeaveUsage, 'id' | 'totalDays'>) => Promise<void>;
  
  terminateEmployee: (employeeId: number, date: string, reason: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const parseLocalISO = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [usage, setUsage] = useState<LeaveUsage[]>([]);
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Fetch Data dari Database ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, balRes, useRes, termRes] = await Promise.all([
        fetch(`${API_URL}/employees`),
        fetch(`${API_URL}/balances`),
        fetch(`${API_URL}/usage`),
        fetch(`${API_URL}/terminations`)
      ]);

      if(empRes.ok) setEmployees(await empRes.json());
      if(balRes.ok) setBalances(await balRes.json());
      if(useRes.ok) setUsage(await useRes.json());
      if(termRes.ok) setTerminations(await termRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Jangan alert di awal load agar tidak mengganggu UX jika koneksi lambat
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Actions ---

  const addEmployee = async (emp: Omit<Employee, 'id' | 'isActive'>) => {
    try {
      const res = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
      });
      if (!res.ok) throw new Error('Failed to add employee');
      await fetchData(); // Refresh data
    } catch (error) {
      console.error(error);
      alert("Gagal menambah karyawan.");
    }
  };

  const updateEmployee = async (id: number, data: Partial<Employee>) => {
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update employee');
      await fetchData();
    } catch (error) {
        console.error(error);
    }
  };

  // Logika Generate Saldo (Client-Side Orchestration)
  const generateAutoBalances = async (year: number) => {
    const cutoffDate = new Date(year, 0, 1); // 1 Jan tahun tersebut
    let count = 0;

    // Loop karyawan aktif untuk cek masa kerja
    for (const emp of employees) {
      if (!emp.isActive) continue;

      const joinDate = parseLocalISO(emp.joinDate);
      const yearsWorked = differenceInYears(cutoffDate, joinDate);

      if (yearsWorked >= 1) {
        // Cek apakah saldo sudah ada di state lokal (untuk mencegah request ganda)
        const exists = balances.some(b => b.employeeId === emp.id && b.year === year);
        if (!exists) {
           const newBal = {
            employeeId: emp.id,
            amount: 12,
            year: year,
            startDate: format(cutoffDate, 'yyyy-MM-dd'),
            endDate: format(new Date(year, 11, 31), 'yyyy-MM-dd'),
          };
          
          try {
            const res = await fetch(`${API_URL}/balances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBal)
            });
            if(res.ok) count++;
          } catch (e) {
            console.error("Failed to generate balance for " + emp.name, e);
          }
        }
      }
    }

    if (count > 0) {
      await fetchData();
      alert(`Berhasil generate saldo untuk ${count} karyawan.`);
    } else {
      alert("Tidak ada karyawan yang memenuhi syarat atau saldo sudah ada.");
    }
  };

  const addManualBalance = async (bal: Omit<LeaveBalance, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/balances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bal)
      });
      if (!res.ok) throw new Error('Failed to add balance');
      await fetchData();
    } catch (error) {
        console.error(error);
        alert("Gagal menambah saldo.");
    }
  };

  const addLeaveUsage = async (use: Omit<LeaveUsage, 'id' | 'totalDays'>) => {
    const start = parseLocalISO(use.startDate);
    const end = parseLocalISO(use.endDate);
    const days = differenceInDays(end, start) + 1;
    
    if (days <= 0) {
      alert("Tanggal berakhir harus setelah tanggal mulai.");
      return;
    }

    try {
        const res = await fetch(`${API_URL}/usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...use, totalDays: days })
        });
        if (!res.ok) throw new Error('Failed to add usage');
        await fetchData();
    } catch (error) {
        console.error(error);
        alert("Gagal input cuti.");
    }
  };

  const terminateEmployee = async (employeeId: number, date: string, reason: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const joinDate = parseLocalISO(emp.joinDate);
    const termDate = parseLocalISO(date);
    // Hitung masa kerja desimal (cth: 1.5 tahun)
    const yearsWorked = parseFloat((differenceInDays(termDate, joinDate) / 365.25).toFixed(2));

    try {
        const res = await fetch(`${API_URL}/terminations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, terminationDate: date, reason, yearsWorked })
        });
        if (!res.ok) throw new Error('Failed to terminate');
        await fetchData(); // Ini akan merefresh data karyawan (menjadi tidak aktif) dan list terminasi
    } catch (error) {
        console.error(error);
        alert("Gagal melakukan terminasi.");
    }
  };

  return (
    <DataContext.Provider value={{
      employees, balances, usage, terminations, isLoading,
      addEmployee, updateEmployee, generateAutoBalances, addManualBalance,
      addLeaveUsage, terminateEmployee
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
