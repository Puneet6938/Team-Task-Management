export function formatDate(date) {
  if (!date) return 'No date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function toInputDateTime(date) {
  if (!date) return '';
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 16);
}

export function fromInputDateTime(value) {
  return value ? new Date(value).toISOString() : '';
}

export function isOverdue(task) {
  return task.status !== 'done' && new Date(task.dueDate) < new Date();
}
