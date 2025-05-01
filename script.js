let projects = [];
let employees = [];

function loadData() {
    projects = JSON.parse(localStorage.getItem('projects') || '[]');
    employees = JSON.parse(localStorage.getItem('employees') || '[]');
}
function saveData() {
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('employees', JSON.stringify(employees));
}
function getEmployeeNames(ids) {
    return employees.filter(e => ids.includes(e.id)).map(e => e.name).join(', ');
}
function renderSummary() {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    document.getElementById('dashboard-summary').innerHTML = `
        <strong>Total Projects:</strong> ${total} | <strong>Completed:</strong> ${completed}
    `;
}
function renderProjects() {
    const tbody = document.querySelector('#projects-table tbody');
    tbody.innerHTML = '';
    const priority = document.getElementById('filter-priority').value;
    const status = document.getElementById('filter-status').value;
    let filtered = projects;
    if (priority) filtered = filtered.filter(p => p.priority === priority);
    if (status) filtered = filtered.filter(p => p.status === status);
    filtered.forEach(project => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${project.name}</td>
            <td>${project.deadline}</td>
            <td>${project.priority}</td>
            <td>${getEmployeeNames(project.employeeIds)}</td>
            <td>${project.status === 'completed' ? 'Completed' : 'Active'}</td>
            <td>
                <button onclick="markCompleted('${project.id}')">Mark Completed</button>
                <button onclick="deleteProject('${project.id}')">Delete</button>
                <select multiple onchange="assignEmployees('${project.id}', this)">
                    ${employees.map(e => `<option value="${e.id}" ${project.employeeIds.includes(e.id) ? 'selected' : ''}>${e.name}</option>`).join('')}
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderSummary();
}
function renderEmployees() {
    const tbody = document.querySelector('#employees-table tbody');
    tbody.innerHTML = '';
    employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.role}</td>
            <td><button onclick="deleteEmployee('${emp.id}')">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}
const projectForm = document.getElementById('project-form');
projectForm.onsubmit = function(e) {
    e.preventDefault();
    const name =document.getElementById('project-name').value.trim();
    const deadline = document.getElementById('project-deadline').value;
    const priority= document.getElementById('project-priority').value;
    if (!name || !deadline || !priority) return;
    projects.push({
        id: Date.now().toString(),
        name, deadline, priority,
        employeeIds: [],
        status: 'active'
    });
    saveData();
    renderProjects();
    projectForm.reset();
};
const employeeForm = document.getElementById('employee-form');
employeeForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('employee-name').value.trim();
    const role = document.getElementById('employee-role').value.trim();
    if (!name || !role) return;
    employees.push({
        id: Date.now().toString(),
        name, role
    });
        saveData();
        renderEmployees();
        renderProjects();
    employeeForm.reset();
};
function deleteProject(id) {
    projects = projects.filter(p => p.id !== id);
        saveData();
    renderProjects();
}
function deleteEmployee(id) {
    employees = employees.filter(e => e.id !== id);
    projects.forEach(p => {
        p.employeeIds = p.employeeIds.filter(eid => eid !== id);
    });
        saveData();
        renderEmployees();
        renderProjects();
}
function markCompleted(id) 
{
    const p = projects.find(p => p.id === id);
    if (p) p.status = 'completed';
    saveData();
    renderProjects();
}
function assignEmployees(projectId, selectElem) {
    const p = projects.find(p => p.id === projectId);
    if (p) 
    {
        p.employeeIds = Array.from(selectElem.selectedOptions).map(opt => opt.value);
        saveData();
        renderProjects();
    }
}
['filter-priority', 'filter-status'].forEach(id => {
document.getElementById(id).onchange = renderProjects;
});


loadData();
renderEmployees();
renderProjects();