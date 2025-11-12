// --- 1. LÓGICA DE AUTENTICACIÓN (Sin cambios) ---
(function () {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Acceso denegado. Debes iniciar sesión.');
    window.location.href = 'index.html';
  }
})(); 

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('Has cerrado sesión.');
    window.location.href = 'index.html';
  });
}

// --- 2. CONSTANTES Y SELECTORES (Sin cambios) ---
const API_URL = 'http://localhost:3000/api/v1'; 
const token = localStorage.getItem('token'); 

const taskForm = document.getElementById('form-create-task');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskListContainer = document.getElementById('task-list-container');


// --- 3. CRUD DE TAREAS (Función fetchTasks MODIFICADA) ---
const fetchTasks = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json(); 

    if (!data.ok || !response.ok) { 
      throw new Error(data.msg || 'Error del servidor al obtener las tareas.');
    }

    const tasksArray = data.tasks;

    if (!Array.isArray(tasksArray)) {
      throw new Error('La respuesta del servidor no es un array de tareas.');
    }
    
    // "Pintamos" las tareas
    renderTasks(tasksArray);
    
    // ¡YA NO LLAMAMOS A LA GRÁFICA DESDE AQUÍ!
    // updateChart(tasksArray); // <-- LÍNEA ELIMINADA

  } catch (error) {
    console.error(error.message);
    alert(`No se pudieron cargar las tareas: ${error.message}`);
  }
};

// --- renderTasks (Sin cambios) ---
const renderTasks = (tasks) => {
  taskListContainer.innerHTML = ''; 

  if (tasks.length === 0) {
    taskListContainer.innerHTML = '<p>No tienes tareas pendientes.</p>';
    return;
  }

  tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.dataset.status = task.status; 
    taskElement.dataset.id = task.id; 
    
    taskElement.innerHTML = `
      <div class="task-info">
        <h3>${task.title}</h3>
        <p>${task.description || ''}</p>
      </div>
      <div class="task-actions">
        <button class="btn-complete">✓</button>
        <button class="btn-delete">X</button>
      </div>
    `;
    
    taskListContainer.appendChild(taskElement);
  });
};

// --- create, update, delete (Sin cambios) ---
if (taskForm) {
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const title = taskTitleInput.value;
    const description = taskDescriptionInput.value;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        throw new Error('Error al crear la tarea.');
      }

      alert('¡Tarea creada!');
      taskTitleInput.value = ''; 
      taskDescriptionInput.value = ''; 
      fetchTasks(); // Refresca la lista de tareas

    } catch (error) {
      console.error(error.message);
      alert('No se pudo crear la tarea.');
    }
  });
}

if (taskListContainer) {
  taskListContainer.addEventListener('click', async (e) => {
    const isDeleteButton = e.target.classList.contains('btn-delete');
    const isCompleteButton = e.target.classList.contains('btn-complete');

    if (!isDeleteButton && !isCompleteButton) {
      return; 
    }

    const taskElement = e.target.closest('.task');
    const taskId = taskElement.dataset.id;
    
    try {
      if (isDeleteButton) {
        await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Tarea eliminada.');

      } else if (isCompleteButton) {
        // --- LÓGICA DE ACTUALIZACIÓN DE TAREA ---
        // 1. Averiguamos el estado actual y el *opuesto*
        const currentStatus = taskElement.dataset.status;
        let newStatus;
        if (currentStatus === 'pending') {
          newStatus = 'completed';
        } else if (currentStatus === 'completed') {
          newStatus = 'pending'; 
        } else {
          // Si estuviera "in_progress", la marcamos como "completed"
          newStatus = 'completed';
        }

        // 2. Hacemos el fetch (¡AQUÍ TUVE QUE CORREGIR ALGO!)
        // Tu controlador PUT espera 'title' y 'status'. 
        // Debemos enviar ambos para que no falle la validación.
        const taskTitle = taskElement.querySelector('.task-info h3').textContent;
        
        await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            title: taskTitle, // Enviamos el título actual
            status: newStatus  // Enviamos el nuevo estado
          }) 
        });
        alert('Tarea actualizada.');
      }
      
      // Refrescamos ambas cosas
      fetchTasks(); 
      fetchHistoryStats(); // <-- ¡NUEVO! Refrescamos la gráfica también

    } catch (error) {
      console.error(error);
      alert('No se pudo ejecutar la acción.');
    }
  });
}

// --- 4. LÓGICA DE LA NUEVA GRÁFICA DE LÍNEAS ---
// (Esto reemplaza tu antigua función 'updateChart')

/**
 * Busca los datos del historial de productividad
 * llamando al nuevo endpoint GET /api/v1/stats
 */
const fetchHistoryStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json(); // data = { ok: true, history: [...] }

    if (!data.ok) {
      throw new Error(data.msg || 'Error al cargar historial.');
    }

    // Enviamos los datos del historial a la nueva función de render
    renderHistoryChart(data.history); 

  } catch (error) {
    console.error(error.message);
    alert('No se pudo cargar la gráfica de historial.');
  }
};

/**
 * "Pinta" la gráfica de líneas en el canvas
 */
let historyChart = null; // Variable para guardar la instancia

const renderHistoryChart = (historyData) => {
  
  // 1. Preparamos los datos para Chart.js
  const labels = historyData.map(item => {
    // Formateamos la fecha (ej. '2025-11-10T00:00:00.000Z' -> '10/11')
    const date = new Date(item.date);
    // Usamos toLocaleDateString para un formato local (ej. 10/11)
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' });
  });
  
  const dataPoints = historyData.map(item => item.completedCount);

  // 2. Obtenemos el canvas
  // ¡Asegúrate de que este ID exista en tu dashboard.html!
  const ctx = document.getElementById('history-chart').getContext('2d');

  // 3. Destruimos la gráfica anterior si existe
  if (historyChart) {
    historyChart.destroy();
  }

  // 4. Creamos la nueva gráfica de LÍNEAS
  historyChart = new Chart(ctx, {
    type: 'line', // <-- ¡EL GRAN CAMBIO!
    data: {
      labels: labels, // Eje X (Fechas)
      datasets: [{
        label: 'Tareas Completadas por Día',
        data: dataPoints, // Eje Y (Cantidad)
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 2,
        tension: 0.1 // Le da una curva suave
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true, 
          ticks: {
             color: '#f8f9fa' 
          }
        },
        x: {
           ticks: {
             color: '#f8f9fa'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#f8f9fa'
          }
        }
      }
    }
  });
};

// --- 5. LLAMADA INICIAL (MODIFICADA) ---
// (Se ejecuta cuando el script carga)

fetchTasks(); // Carga la lista de tareas
fetchHistoryStats(); // Carga la gráfica de historial