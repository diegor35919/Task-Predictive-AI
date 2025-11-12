
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


const API_URL = 'http://localhost:3000/api/v1'; 
const token = localStorage.getItem('token'); 

const taskForm = document.getElementById('form-create-task');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskListContainer = document.getElementById('task-list-container');



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
    

    renderTasks(tasksArray);
    


  } catch (error) {
    console.error(error.message);
    alert(`No se pudieron cargar las tareas: ${error.message}`);
  }
};


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
      fetchTasks(); 

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
     
        const currentStatus = taskElement.dataset.status;
        let newStatus;
        if (currentStatus === 'pending') {
          newStatus = 'completed';
        } else if (currentStatus === 'completed') {
          newStatus = 'pending'; 
        } else {
  
          newStatus = 'completed';
        }

        
        const taskTitle = taskElement.querySelector('.task-info h3').textContent;
        
        await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            title: taskTitle, 
            status: newStatus  
          }) 
        });
        alert('Tarea actualizada.');
      }
      
      
      fetchTasks(); 
      fetchHistoryStats(); 

    } catch (error) {
      console.error(error);
      alert('No se pudo ejecutar la acción.');
    }
  });
}

const fetchHistoryStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json(); 

    if (!data.ok) {
      throw new Error(data.msg || 'Error al cargar historial.');
    }

    
    renderHistoryChart(data.history); 

  } catch (error) {
    console.error(error.message);
    alert('No se pudo cargar la gráfica de historial.');
  }
};


let historyChart = null; 

const renderHistoryChart = (historyData) => {
  
  
  const labels = historyData.map(item => {
    
    const date = new Date(item.date);
    
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' });
  });
  
  const dataPoints = historyData.map(item => item.completedCount);


  const ctx = document.getElementById('history-chart').getContext('2d');


  if (historyChart) {
    historyChart.destroy();
  }


  historyChart = new Chart(ctx, {
    type: 'line', 
    data: {
      labels: labels, 
      datasets: [{
        label: 'Tareas Completadas por Día',
        data: dataPoints, 
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 2,
        tension: 0.1 
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



fetchTasks(); 
fetchHistoryStats(); 