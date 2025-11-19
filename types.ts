export interface Employee {
  id: number;
  name: string;
  position: string; // ART, Driver, Baby Sitter
  joinDate: string; // YYYY-MM-DD
  isActive: boolean;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  amount: number; // Standard 12
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  year: number;
}

export interface LeaveUsage {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  note: string;
}

export interface Termination {
  id: number;
  employeeId: number;
  terminationDate: string;
  reason: string;
  yearsWorked: number;
}

// Dashboard Summary DTO
export interface EmployeeSummary {
  employeeId: number;
  name: string;
  position: string;
  joinDate: string;
  totalBalance: number;
  usedLeave: number;
  remainingLeave: number;
}