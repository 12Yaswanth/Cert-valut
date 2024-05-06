// to handle the login process

async function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:9393/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid username or password. Please try again.');
            } else {
                throw new Error(data.error || 'Failed to login');
            }
            return;
        }

        localStorage.setItem('token', data.token);
        window.location.href = 'home.html'; 
    } catch (error) {
        console.error('Error during login:', error.message);
        alert('An error occurred during login. Please try again later.'); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', login);
});
