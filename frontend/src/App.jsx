import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, clearSession, getStoredUser, storeSession } from './api';
import { priorities, projectStatuses, projectStatusLabels, statusLabels, taskStatuses } from './constants';
import { formatDate, fromInputDateTime, isOverdue, toInputDateTime } from './utils';

const initialTaskForm = {
  title: '',
  description: '',
  project: '',
  assignee: '',
  status: 'todo',
  priority: 'medium',
  dueDate: ''
};

const initialProjectForm = {
  name: '',
  description: '',
  status: 'active',
  dueDate: '',
  members: []
};

function AuthView({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    title: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role,
              title: form.title
            };
      const data = await api(`/api/auth/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        body: payload
      });
      storeSession(data);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <div className="brand-mark">TF</div>
        <h1>TaskFlow Team Manager</h1>
        <p>Plan projects, assign ownership, and keep overdue work visible without making the team dig for updates.</p>
        <div className="auth-stats">
          <span><CheckCircle2 size={18} /> Role-based access</span>
          <span><FolderKanban size={18} /> Project workspaces</span>
          <span><BarChart3 size={18} /> Live progress view</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="mode-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Signup</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>
                Name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label>
                Title
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label>
                Role
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </label>
            </>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login to workspace' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}

function AppShell({ user, onLogout, children, activeView, setActiveView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'team', label: 'Team', icon: Users }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">TF</div>
          <div>
            <strong>TaskFlow</strong>
            <span>Team operations</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={activeView === item.id ? 'nav-active' : ''} onClick={() => setActiveView(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="user-chip">
          <div>
            <strong>{user.name}</strong>
            <span><ShieldCheck size={14} /> {user.role}</span>
          </div>
          <button className="icon-btn" onClick={onLogout} title="Logout" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <section className="workspace">{children}</section>
    </div>
  );
}

function Header({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

function Dashboard({ dashboard, tasks, projects }) {
  const counts = Object.fromEntries((dashboard?.statusCounts || []).map((item) => [item._id, item.count]));
  const recentTasks = dashboard?.upcomingTasks?.length ? dashboard.upcomingTasks : tasks.slice(0, 6);

  return (
    <>
      <Header title="Dashboard" subtitle="A quick read on active work, deadlines, and personal load." />
      <div className="metrics-grid">
        <Metric label="Projects" value={dashboard?.metrics?.projects || projects.length} tone="blue" />
        <Metric label="Total tasks" value={dashboard?.metrics?.totalTasks || tasks.length} tone="green" />
        <Metric label="Overdue" value={dashboard?.metrics?.overdue || 0} tone="red" />
        <Metric label="My open tasks" value={dashboard?.metrics?.myTasks || 0} tone="amber" />
      </div>
      <div className="two-column">
        <section className="panel">
          <div className="panel-title">
            <h3>Status breakdown</h3>
            <BarChart3 size={18} />
          </div>
          <div className="status-bars">
            {taskStatuses.map((status) => {
              const value = counts[status] || 0;
              const max = Math.max(1, tasks.length);
              return (
                <div key={status}>
                  <span>{statusLabels[status]}</span>
                  <div className="bar-track"><div style={{ width: `${(value / max) * 100}%` }} /></div>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-title">
            <h3>Upcoming work</h3>
            <ClipboardList size={18} />
          </div>
          <div className="task-list compact">
            {recentTasks.map((task) => <TaskRow key={task._id} task={task} readonly />)}
            {!recentTasks.length && <EmptyState text="No tasks yet. Create a project and assign the first task." />}
          </div>
        </section>
      </div>
    </>
  );
}

function Metric({ label, value, tone }) {
  return (
    <section className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function ProjectForm({ users, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialProjectForm);

  const toggleMember = (id) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(id) ? current.members.filter((member) => member !== id) : [...current.members, id]
    }));
  };

  return (
    <form className="editor-panel" onSubmit={(event) => {
      event.preventDefault();
      onSubmit({ ...form, dueDate: fromInputDateTime(form.dueDate) });
      setForm(initialProjectForm);
    }}>
      <label>
        Project name
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label>
        Description
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" />
      </label>
      <div className="form-row">
        <label>
          Status
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {projectStatuses.map((status) => <option key={status} value={status}>{projectStatusLabels[status]}</option>)}
          </select>
        </label>
        <label>
          Due date
          <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </label>
      </div>
      <div className="member-picker">
        <span>Members</span>
        {users.map((member) => (
          <label key={member._id} className="check-row">
            <input type="checkbox" checked={form.members.includes(member._id)} onChange={() => toggleMember(member._id)} />
            {member.name}
          </label>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="ghost-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary-btn">Create project</button>
      </div>
    </form>
  );
}

function Projects({ user, users, projects, onCreateProject, onSelectProject }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Header
        title="Projects"
        subtitle="Group work by client, sprint, or internal initiative."
        action={
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New project
          </button>
        }
      />
      {showForm && <ProjectForm users={users} onSubmit={(data) => { onCreateProject(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />}
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project._id} onClick={() => onSelectProject(project)}>
            <div className="card-topline">
              <span className={`status-pill project-${project.status}`}>{projectStatusLabels[project.status]}</span>
              <span>{formatDate(project.dueDate)}</span>
            </div>
            <h3>{project.name}</h3>
            <p>{project.description || 'No description added yet.'}</p>
            <div className="avatar-row">
              {project.members?.slice(0, 4).map((member) => (
                <span key={member._id} title={member.name}>{member.name.slice(0, 1)}</span>
              ))}
            </div>
          </article>
        ))}
        {!projects.length && <EmptyState text={user.role === 'admin' ? 'Create the first project to start assigning tasks.' : 'You have not been added to a project yet.'} />}
      </div>
    </>
  );
}

function TaskForm({ projects, users, onSubmit, onCancel, defaultProject }) {
  const firstProject = defaultProject || projects[0]?._id || '';
  const [form, setForm] = useState({ ...initialTaskForm, project: firstProject, dueDate: toInputDateTime(new Date()) });
  const selectedProject = projects.find((project) => project._id === form.project);
  const availableMembers = selectedProject?.members?.length ? selectedProject.members : users;

  useEffect(() => {
    if (!form.assignee && availableMembers[0]?._id) {
      setForm((current) => ({ ...current, assignee: availableMembers[0]._id }));
    }
  }, [availableMembers, form.assignee]);

  return (
    <form className="editor-panel" onSubmit={(event) => {
      event.preventDefault();
      onSubmit({ ...form, dueDate: fromInputDateTime(form.dueDate) });
      setForm({ ...initialTaskForm, project: firstProject });
    }}>
      <label>
        Task title
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>
        Notes
        <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <div className="form-row">
        <label>
          Project
          <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value, assignee: '' })} required>
            {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
          </select>
        </label>
        <label>
          Assignee
          <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} required>
            {availableMembers.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Status
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {taskStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </label>
        <label>
          Priority
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </label>
        <label>
          Due date
          <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="ghost-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary-btn">Create task</button>
      </div>
    </form>
  );
}

function Tasks({ user, projects, users, tasks, onCreateTask, onUpdateTask, selectedProject }) {
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const canCreate = user.role === 'admin' || projects.some((project) => project.owner?._id === user.id);
  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const term = `${task.title} ${task.description} ${task.project?.name} ${task.assignee?.name}`.toLowerCase();
      return term.includes(query.toLowerCase());
    });
  }, [tasks, query]);

  return (
    <>
      <Header
        title="Tasks"
        subtitle="Track assignments from intake through review and completion."
        action={
          canCreate && (
            <button className="primary-btn" onClick={() => setShowForm(true)}>
              <Plus size={18} /> New task
            </button>
          )
        }
      />
      <div className="toolbar">
        <Search size={18} />
        <input placeholder="Search tasks, projects, or assignees" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {showForm && (
        <TaskForm
          projects={projects}
          users={users}
          defaultProject={selectedProject?._id}
          onSubmit={(data) => { onCreateTask(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      <div className="kanban">
        {taskStatuses.map((status) => (
          <section className="kanban-column" key={status}>
            <h3>{statusLabels[status]}</h3>
            <div className="task-list">
              {visibleTasks.filter((task) => task.status === status).map((task) => (
                <TaskRow key={task._id} task={task} onStatusChange={(nextStatus) => onUpdateTask(task._id, { status: nextStatus })} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function TaskRow({ task, onStatusChange, readonly = false }) {
  return (
    <article className={`task-card ${isOverdue(task) ? 'overdue' : ''}`}>
      <div className="task-heading">
        <h4>{task.title}</h4>
        <span className={`priority priority-${task.priority}`}>{task.priority}</span>
      </div>
      <p>{task.description || 'No notes added.'}</p>
      <div className="task-meta">
        <span>{task.project?.name}</span>
        <span>{task.assignee?.name}</span>
        <span>{formatDate(task.dueDate)}</span>
      </div>
      {!readonly && (
        <select value={task.status} onChange={(event) => onStatusChange(event.target.value)}>
          {taskStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
        </select>
      )}
    </article>
  );
}

function Team({ users }) {
  return (
    <>
      <Header title="Team" subtitle="Everyone available for project membership and task assignment." />
      <div className="team-grid">
        {users.map((member) => (
          <article className="team-card" key={member._id}>
            <span>{member.name.slice(0, 1)}</span>
            <div>
              <h3>{member.name}</h3>
              <p>{member.title}</p>
              <small>{member.email}</small>
            </div>
            <strong>{member.role}</strong>
          </article>
        ))}
      </div>
    </>
  );
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}

export function App() {
  const [user, setUser] = useState(getStoredUser());
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const loadWorkspace = async () => {
    if (!user) return;
    try {
      const [dashboardData, projectData, taskData, userData] = await Promise.all([
        api('/api/dashboard'),
        api('/api/projects'),
        api('/api/tasks'),
        api('/api/users')
      ]);
      setDashboard(dashboardData);
      setProjects(projectData.projects);
      setTasks(taskData.tasks);
      setUsers(userData.users);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [user]);

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const createProject = async (data) => {
    await api('/api/projects', { method: 'POST', body: data });
    await loadWorkspace();
  };

  const createTask = async (data) => {
    await api('/api/tasks', { method: 'POST', body: data });
    await loadWorkspace();
  };

  const updateTask = async (taskId, data) => {
    await api(`/api/tasks/${taskId}`, { method: 'PATCH', body: data });
    await loadWorkspace();
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setActiveView('tasks');
  };

  if (!user) return <AuthView onAuth={setUser} />;

  return (
    <AppShell user={user} onLogout={logout} activeView={activeView} setActiveView={setActiveView}>
      {error && <div className="error-banner">{error}</div>}
      {activeView === 'dashboard' && <Dashboard dashboard={dashboard} tasks={tasks} projects={projects} />}
      {activeView === 'projects' && (
        <Projects user={user} users={users} projects={projects} onCreateProject={createProject} onSelectProject={selectProject} />
      )}
      {activeView === 'tasks' && (
        <Tasks
          user={user}
          projects={projects}
          users={users}
          tasks={tasks}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          selectedProject={selectedProject}
        />
      )}
      {activeView === 'team' && <Team users={users} />}
    </AppShell>
  );
}
