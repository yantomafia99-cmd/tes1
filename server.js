const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- KONFIGURASI DATABASE ---
// Sesuaikan dengan kredensial Database CyberPanel Anda
const db = mysql.createPool({
  host: 'localhost', 
  user: 'root',       // Ganti dengan User Database Anda
  password: '',       // Ganti dengan Password Database Anda
  database: 'art_hr_db', // Ganti dengan Nama Database Anda
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper: Format Date ke YYYY-MM-DD untuk dikirim ke Frontend
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
};

// --- API ENDPOINTS ---

// 1. GET Employees
app.get('/api/employees', (req, res) => {
  db.query('SELECT * FROM employees ORDER BY name ASC', (err, results) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
    }
    const formatted = results.map(row => ({
        id: row.id,
        name: row.name,
        position: row.position,
        joinDate: formatDate(row.join_date),
        isActive: row.is_active === 1
    }));
    res.json(formatted);
  });
});

// 2. POST Employee
app.post('/api/employees', (req, res) => {
  const { name, position, joinDate } = req.body;
  db.query(
    'INSERT INTO employees (name, position, join_date, is_active) VALUES (?, ?, ?, 1)',
    [name, position, joinDate],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, message: 'Employee added' });
    }
  );
});

// 3. PUT Employee (Update Status)
app.put('/api/employees/:id', (req, res) => {
    const { isActive } = req.body;
    // Konversi boolean ke integer (1/0) jika perlu, mysql2 biasanya menghandle ini
    const isActiveVal = isActive ? 1 : 0;
    
    db.query(
        'UPDATE employees SET is_active = ? WHERE id = ?',
        [isActiveVal, req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Employee updated' });
        }
    );
});

// 4. GET Balances
app.get('/api/balances', (req, res) => {
    db.query('SELECT * FROM leave_balances', (err, results) => {
        if (err) return res.status(500).json(err);
        const formatted = results.map(row => ({
            id: row.id,
            employeeId: row.employee_id,
            amount: row.amount,
            startDate: formatDate(row.start_date),
            endDate: formatDate(row.end_date),
            year: row.year
        }));
        res.json(formatted);
    });
});

// 5. POST Balance
app.post('/api/balances', (req, res) => {
    const { employeeId, amount, startDate, endDate, year } = req.body;
    db.query(
        'INSERT INTO leave_balances (employee_id, amount, start_date, end_date, year) VALUES (?, ?, ?, ?, ?)',
        [employeeId, amount, startDate, endDate, year],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId, message: 'Balance added' });
        }
    );
});

// 6. GET Usage
app.get('/api/usage', (req, res) => {
    db.query('SELECT * FROM leave_usage', (err, results) => {
        if (err) return res.status(500).json(err);
        const formatted = results.map(row => ({
            id: row.id,
            employeeId: row.employee_id,
            startDate: formatDate(row.start_date),
            endDate: formatDate(row.end_date),
            totalDays: row.total_days,
            note: row.note
        }));
        res.json(formatted);
    });
});

// 7. POST Usage
app.post('/api/usage', (req, res) => {
    const { employeeId, startDate, endDate, totalDays, note } = req.body;
    db.query(
        'INSERT INTO leave_usage (employee_id, start_date, end_date, total_days, note) VALUES (?, ?, ?, ?, ?)',
        [employeeId, startDate, endDate, totalDays, note],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId, message: 'Usage recorded' });
        }
    );
});

// 8. GET Terminations
app.get('/api/terminations', (req, res) => {
    db.query('SELECT * FROM terminations', (err, results) => {
        if (err) return res.status(500).json(err);
        const formatted = results.map(row => ({
            id: row.id,
            employeeId: row.employee_id,
            terminationDate: formatDate(row.termination_date),
            reason: row.reason,
            yearsWorked: row.years_worked
        }));
        res.json(formatted);
    });
});

// 9. POST Termination (Transaction)
app.post('/api/terminations', (req, res) => {
    const { employeeId, terminationDate, reason, yearsWorked } = req.body;
    
    db.getConnection((err, connection) => {
        if (err) return res.status(500).json(err);
        
        connection.beginTransaction(err => {
            if (err) { connection.release(); return res.status(500).json(err); }

            // Step 1: Insert ke tabel terminations
            connection.query(
                'INSERT INTO terminations (employee_id, termination_date, reason, years_worked) VALUES (?, ?, ?, ?)',
                [employeeId, terminationDate, reason, yearsWorked],
                (err, result) => {
                    if (err) { 
                        connection.rollback(() => connection.release()); 
                        return res.status(500).json(err); 
                    }

                    // Step 2: Update status employee jadi Tidak Aktif (0)
                    connection.query(
                        'UPDATE employees SET is_active = 0 WHERE id = ?',
                        [employeeId],
                        (err) => {
                            if (err) { 
                                connection.rollback(() => connection.release()); 
                                return res.status(500).json(err); 
                            }

                            connection.commit(err => {
                                if (err) { 
                                    connection.rollback(() => connection.release()); 
                                    return res.status(500).json(err); 
                                }
                                connection.release();
                                res.json({ message: 'Termination processed successfully' });
                            });
                        }
                    );
                }
            );
        });
    });
});

// Jika ingin serve frontend build React dari server ini juga (Opsional)
// app.use(express.static(path.join(__dirname, 'build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
