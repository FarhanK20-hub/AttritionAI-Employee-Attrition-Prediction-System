const API_BASE = '/api';

export async function predictBulk(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail?.message || err.detail || JSON.stringify(err));
  }
  return res.json();
}

export async function predictSingle(data) {
  const res = await fetch(`${API_BASE}/predict-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail?.message || err.detail || JSON.stringify(err));
  }
  return res.json();
}

export async function downloadTemplate() {
  const res = await fetch(`${API_BASE}/template`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
