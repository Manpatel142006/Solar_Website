// // auth.js - Handles Authentication and Data Storage natively

// // Simulated .env Credentials
// const ENV_ADMIN_EMAIL = "admin@company.com";
// const ENV_ADMIN_PASS = "Admin@123";

// const ENV_TECH_EMAIL = "tech@company.com";
// const ENV_TECH_PASS = "Tech@123";

// // Initialize local storage arrays if they don't exist
// if (!localStorage.getItem('solar_users')) {
//     localStorage.setItem('solar_users', JSON.stringify([]));
// }
// if (!localStorage.getItem('solar_complaints')) {
//     localStorage.setItem('solar_complaints', JSON.stringify([]));
// }

// function registerUser(event) {
//     event.preventDefault();
//     const name = document.getElementById('reg-name').value;
//     const email = document.getElementById('reg-email').value;
//     const password = document.getElementById('reg-password').value;
    
//     // Force all new registrations from the frontend to be customers
//     const role = 'customer'; 

//     const users = JSON.parse(localStorage.getItem('solar_users'));
    
//     // Check if customer already exists
//     if (users.find(u => u.email === email)) {
//         alert('This email is already registered!');
//         return;
//     }

//     users.push({ name, email, password, role });
//     localStorage.setItem('solar_users', JSON.stringify(users));
    
//     alert('Customer account created successfully! Please log in.');
//     window.location.href = 'login.html';
// }

// function loginUser(event) {
//     event.preventDefault();
//     const email = document.getElementById('login-email').value;
//     const password = document.getElementById('login-password').value;
    
//     // 1. Check Admin Credentials
//     if (email === ENV_ADMIN_EMAIL && password === ENV_ADMIN_PASS) {
//         localStorage.setItem('active_user', JSON.stringify({ 
//             name: 'System Admin', 
//             email: email, 
//             role: 'admin' 
//         }));
//         window.location.href = 'admin.html';
//         return;
//     }

//     // 2. Check Technician Credentials
//     if (email === ENV_TECH_EMAIL && password === ENV_TECH_PASS) {
//         localStorage.setItem('active_user', JSON.stringify({ 
//             name: 'Field Technician', 
//             email: email, 
//             role: 'technician' 
//         }));
//         window.location.href = 'technician.html';
//         return;
//     }

//     // 3. Check Local Storage for Registered Customers
//     const users = JSON.parse(localStorage.getItem('solar_users'));
//     const user = users.find(u => u.email === email && u.password === password);

//     if (user) {
//         localStorage.setItem('active_user', JSON.stringify(user));
//         // Customers are redirected to the homepage to lodge complaints
//         window.location.href = 'index.html';
//     } else {
//         alert("Invalid email or password. If you are a new customer, please register.");
//     }
// }

// function logoutUser() {
//     localStorage.removeItem('active_user');
//     window.location.href = 'index.html';
// }

// function checkAuth(requiredRole) {
//     const activeUser = JSON.parse(localStorage.getItem('active_user'));
    
//     if (!activeUser) {
//         window.location.href = 'login.html';
//     } else if (requiredRole && activeUser.role !== requiredRole) {
//         alert('Access Denied. You do not have permission for this dashboard.');
//         window.location.href = 'index.html';
//     }

//     // Show user name if element exists on the dashboard
//     const nameDisplay = document.getElementById('user-display-name');
//     if (nameDisplay) {
//         nameDisplay.textContent = activeUser.name;
//     }
// }


const API_URL = 'http://localhost:5000/api';

async function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Account created successfully! Please log in.');
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Server error. Ensure backend is running.");
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginType = document.getElementById('login-type').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, loginType })
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('active_user', JSON.stringify(data.user));
            
            if (data.user.role === 'admin') window.location.href = 'admin.html';
            else if (data.user.role === 'technician') window.location.href = 'technician.html';
            else window.location.href = 'index.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Server error. Ensure backend is running.");
    }
}

// Keep the rest of your UI functions (logoutUser, checkAuth, setLoginType) exactly the same:
function setLoginType(type) {
    document.getElementById('login-type').value = type;
    const btnCustomer = document.getElementById('tab-customer');
    const btnStaff = document.getElementById('tab-staff');
    if (type === 'customer') {
        btnCustomer.className = "btn bg-amber fw-bold text-uppercase px-4 py-2 w-100 rounded-3";
        btnStaff.className = "btn text-secondary fw-bold text-uppercase px-4 py-2 w-100 rounded-3";
    } else {
        btnStaff.className = "btn bg-amber fw-bold text-uppercase px-4 py-2 w-100 rounded-3";
        btnCustomer.className = "btn text-secondary fw-bold text-uppercase px-4 py-2 w-100 rounded-3";
    }
}

function logoutUser() {
    localStorage.removeItem('active_user');
    window.location.href = 'login.html';
}

function checkAuth(requiredRole) {
    const activeUser = JSON.parse(localStorage.getItem('active_user'));
    if (!activeUser) { window.location.href = 'login.html'; return; } 
    if (requiredRole && activeUser.role !== requiredRole) {
        if (activeUser.role === 'admin') window.location.href = 'admin.html';
        else if (activeUser.role === 'technician') window.location.href = 'technician.html';
        else window.location.href = 'index.html';
        return;
    }
    const nameDisplay = document.getElementById('user-display-name');
    if (nameDisplay) nameDisplay.textContent = activeUser.name;
}