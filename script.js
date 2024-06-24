document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const taskInput = document.getElementById('task-input');
    const taskDetails = document.getElementById('task-details');
    const taskTime = document.getElementById('task-time');
    const taskDaily = document.getElementById('task-daily').checked;
    const taskWeekly = document.getElementById('task-weekly').checked;
    const taskMonthly = document.getElementById('task-monthly').checked;
    const selectedDate = document.getElementById('selected-date').value;
    const taskList = document.getElementById('task-list');

    const taskText = taskInput.value;
    const detailsText = taskDetails.value;
    const timeText = taskTime.value;

    if (!selectedDate) {
        alert('Por favor, selecione uma data!');
        return;
    }

    const task = {
        text: taskText,
        details: detailsText,
        time: timeText,
        daily: taskDaily,
        weekly: taskWeekly,
        monthly: taskMonthly,
        completed: false, // Nova propriedade para marcar se a tarefa foi concluída
        date: selectedDate
    };

    saveTaskToLocalStorage(task);
    displayTask(task);

    taskInput.value = '';
    taskDetails.value = '';
    taskTime.value = '';
    document.getElementById('task-daily').checked = false;
    document.getElementById('task-weekly').checked = false;
    document.getElementById('task-monthly').checked = false;
});

function saveTaskToLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Verifica se a tarefa já existe no array de tarefas
    const existingTaskIndex = tasks.findIndex(t => 
        t.text === task.text &&
        t.details === task.details &&
        t.time === task.time &&
        t.date === task.date &&
        t.daily === task.daily &&
        t.weekly === task.weekly &&
        t.monthly === task.monthly
    );

    if (existingTaskIndex !== -1) {
        // Se existir, atualiza a tarefa existente com as novas informações
        tasks[existingTaskIndex] = task;
    } else {
        // Se não existir, adiciona a nova tarefa ao array
        tasks.push(task);
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const selectedDate = document.getElementById('selected-date').value;
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.date === selectedDate ||
                                  task.daily ||
                                  (task.weekly && isSameWeek(new Date(task.date), new Date(selectedDate))) ||
                                  (task.monthly && isSameMonth(new Date(task.date), new Date(selectedDate))));
    tasks.forEach(displayTask);
}

function displayTask(task) {
    const taskList = document.getElementById('task-list');

    const taskItem = document.createElement('li');
    const taskContent = document.createElement('div');

    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;

    const detailsSpan = document.createElement('span');
    detailsSpan.textContent = task.details;

    const timeSpan = document.createElement('span');
    timeSpan.textContent = task.time;

    const frequencySpan = document.createElement('span');
    frequencySpan.classList.add('task-frequency');
    if (task.daily) {
        frequencySpan.textContent = ' (Diária)';
    } else if (task.weekly) {
        frequencySpan.textContent = ' (Semanal)';
    } else if (task.monthly) {
        frequencySpan.textContent = ' (Mensal)';
    }

    const completedCheckbox = document.createElement('input');
    completedCheckbox.type = 'checkbox';
    completedCheckbox.checked = task.completed; // Define o estado inicial do checkbox
    completedCheckbox.addEventListener('change', function() {
        task.completed = this.checked; // Atualiza o estado da tarefa ao marcar/desmarcar
        saveTaskToLocalStorage(task); // Salva a mudança no localStorage
    });

    const completedLabel = document.createElement('label');
    completedLabel.textContent = ' Concluída';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.classList.add('delete');

    deleteButton.addEventListener('click', function() {
        deleteTask(task);
        taskList.removeChild(taskItem);
    });

    taskContent.appendChild(taskSpan);
    taskContent.appendChild(document.createTextNode(' '));
    taskContent.appendChild(detailsSpan);
    taskContent.appendChild(document.createTextNode(' '));
    taskContent.appendChild(timeSpan);
    taskContent.appendChild(frequencySpan);
    taskContent.appendChild(document.createTextNode(' '));
    taskContent.appendChild(completedCheckbox);
    taskContent.appendChild(completedLabel);

    taskItem.appendChild(taskContent);
    taskItem.appendChild(deleteButton);

    taskList.appendChild(taskItem);
}

function deleteTask(taskToDelete) {
    if (taskToDelete.daily || taskToDelete.weekly || taskToDelete.monthly) {
        const confirmDelete = confirm('Esta tarefa é recorrente. Ao excluí-la, você também removerá todas as ocorrências futuras. Deseja continuar?');
        
        if (!confirmDelete) {
            return;
        }
    }

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task =>
        task.text !== taskToDelete.text ||
        task.details !== taskToDelete.details ||
        task.time !== taskToDelete.time ||
        task.date !== taskToDelete.date ||
        task.daily !== taskToDelete.daily ||
        task.weekly !== taskToDelete.weekly ||
        task.monthly !== taskToDelete.monthly ||
        task.completed !== taskToDelete.completed
    );
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    loadTasks();
}

document.getElementById('selected-date').addEventListener('change', loadTasks);
window.addEventListener('load', function() {
    setDefaultDate();
    loadTasks();
});

document.getElementById('next-day').addEventListener('click', function() {
    changeDate(1);
});

document.getElementById('prev-day').addEventListener('click', function() {
    changeDate(-1);
});

document.getElementById('next-week').addEventListener('click', function() {
    changeDate(7);
});

document.getElementById('prev-week').addEventListener('click', function() {
    changeDate(-7);
});

document.getElementById('next-month').addEventListener('click', function() {
    changeMonth(1);
});

document.getElementById('prev-month').addEventListener('click', function() {
    changeMonth(-1);
});

function changeDate(days) {
    const selectedDate = document.getElementById('selected-date');
    const currentDate = new Date(selectedDate.value);
    currentDate.setDate(currentDate.getDate() + days);
    selectedDate.value = currentDate.toISOString().split('T')[0];
    loadTasks();
}

function changeMonth(months) {
    const selectedDate = document.getElementById('selected-date');
    const currentDate = new Date(selectedDate.value);
    currentDate.setMonth(currentDate.getMonth() + months);
    selectedDate.value = currentDate.toISOString().split('T')[0];
    loadTasks();
}

function isSameWeek(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d1.getTime() - d2.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.abs(Math.round(diff / oneWeek)) === 0;
}

function isSameMonth(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

// Define a data padrão ao carregar a página
function setDefaultDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const yyyy = today.getFullYear();
    const defaultDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('selected-date').value = defaultDate;
    loadTasks();
}

// Chama a função para definir a data padrão ao carregar a página
window.addEventListener('load', setDefaultDate);
