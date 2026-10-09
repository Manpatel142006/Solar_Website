require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve your frontend HTML files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 1. Create MySQL Connection Pool (Strictly using .env variables)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Securely loads password from .env
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// 2. AUTHENTICATION & LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    const { email, password, loginType } = req.body;

    // A. Staff Login Logic
    if (loginType === 'staff') {
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
            return res.json({ success: true, user: { name: 'System Admin', email, role: 'admin' } });
        }
        if (email === process.env.TECH_EMAIL && password === process.env.TECH_PASS) {
            return res.json({ success: true, user: { name: 'Field Technician', email, role: 'technician' } });
        }
        return res.status(401).json({ success: false, message: 'Invalid Staff Credentials.' });
    }

    // B. Customer Login Logic (Query MySQL Database)
    if (loginType === 'customer') {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
            if (rows.length > 0) {
                const user = rows[0];
                return res.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid customer credentials.' });
            }
        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
    }
});

// 3. CUSTOMER REGISTRATION ROUTE
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "customer")', [name, email, password]);
        res.json({ success: true, message: 'Customer registered successfully.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// 4. TICKETS (COMPLAINTS) ROUTES
// Get all tickets
app.get('/api/tickets', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM complaints ORDER BY created_at DESC');
        res.json({ success: true, tickets: rows });
    } catch (error) {
        console.error("Fetch Tickets Error:", error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
    const { id, customerName, phone, email, problem, status } = req.body;
    try {
        await pool.query(
            'INSERT INTO complaints (id, customerName, phone, email, problem, status) VALUES (?, ?, ?, ?, ?, ?)',
            [id, customerName, phone, email || 'N/A', problem, status || 'Pending']
        );
        res.json({ success: true, message: 'Ticket created.' });
    } catch (error) {
        console.error("Create Ticket Error:", error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// Update ticket status
app.patch('/api/tickets/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE complaints SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Status updated.' });
    } catch (error) {
        console.error("Update Ticket Error:", error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// Delete ticket
app.delete('/api/tickets/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM complaints WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Ticket deleted.' });
    } catch (error) {
        console.error("Delete Ticket Error:", error);
        res.status(500).json({ success: false, message: 'Database error.' });



        
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Energy Solutions API running on http://localhost:${PORT}`));