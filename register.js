// to handle the register process

async function register(event) {
    event.preventDefault(); 
    
    const employeeId = document.getElementById('employeeId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    
    if (!employeeId || !username || !password) {
        alert('Employee ID, username, and password are required');
        return;
    }

    try {
        const response = await fetch('http://localhost:9393/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ employeeId, username, password })
        });

        if (!response.ok) {
            if (response.status === 409) {
                alert('Username already exists. Please choose a different username.');
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to register');
            }
            return;
        }

        alert('Registration successful! You can now login.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during registration:', error.message);
        alert('Failed to register: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', register);
});
