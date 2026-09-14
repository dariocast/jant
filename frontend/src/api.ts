import { Item, SemanticSearchResult, StatsData, FilterType } from './types';

const API_BASE = '/api';

export async function fetchItems(filter: FilterType = 'all', tag?: string, search?: string): Promise<Item[]> {
  const params = new URLSearchParams();
  if (filter !== 'all') params.append('filter', filter);
  if (tag) params.append('tag', tag);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/items?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch items');
  const data = await res.json();
  return data.items || [];
}

export async function fetchItem(id: string): Promise<Item> {
  const res = await fetch(`${API_BASE}/items/${id}`);
  if (!res.ok) throw new Error('Failed to fetch item');
  const data = await res.json();
  return data.item;
}

export async function createItem(payload: Partial<Item>): Promise<Item> {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create item');
  const data = await res.json();
  return data.item;
}

export async function updateItem(id: string, payload: Partial<Item>): Promise<Item> {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update item');
  const data = await res.json();
  return data.item;
}

export async function deleteItem(id: string, permanent = false): Promise<void> {
  const res = await fetch(`${API_BASE}/items/${id}?permanent=${permanent}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete item');
}

export async function restoreItem(id: string): Promise<Item> {
  const res = await fetch(`${API_BASE}/items/${id}/restore`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to restore item');
  const data = await res.json();
  return data.item;
}

export async function toggleTimer(id: string): Promise<{ isTimerRunning: boolean; item: Item }> {
  const res = await fetch(`${API_BASE}/items/${id}/timer/toggle`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle timer');
  return res.json();
}

export async function searchSemantic(query: string, limit = 8): Promise<SemanticSearchResult[]> {
  const res = await fetch(`${API_BASE}/search/semantic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) throw new Error('Failed to perform semantic search');
  const data = await res.json();
  return data.results || [];
}

export async function fetchStats(): Promise<StatsData> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return data.stats;
}

export async function fetchAppInfo(): Promise<any> {
  const res = await fetch(`${API_BASE}/info`);
  if (!res.ok) throw new Error('Failed to fetch info');
  return res.json();
}
