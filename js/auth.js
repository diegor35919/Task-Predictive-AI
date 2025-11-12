const API_URL = 'http://localhost:3000/api/v1';

const registerForm = document.getElementById('register-form');


if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {

    e.preventDefault();


    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {

        alert('¡Usuario registrado con éxito! Ahora puedes iniciar sesión.');

        window.location.href = 'index.html';
      } else {

        alert(`Error al registrar: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error en la conexión:', error);
      alert('Error de conexión con el servidor. Intenta más tarde.');
    }
  });
}

const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {

    e.preventDefault();


    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();


      if (response.ok) {

        alert('Login exitoso. Redirigiendo al dashboard...');
        
  
        localStorage.setItem('token', data.msg); //guarda el token en el navegador
        window.location.href = 'dashboard.html'; //redirige al dashboard
      } else {

        alert(`Error al iniciar sesión: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error en la conexión:', error);
      alert('Error de conexión con el servidor.');
    }
  });
}