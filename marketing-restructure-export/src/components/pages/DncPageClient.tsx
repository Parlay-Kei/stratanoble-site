'use client';

"use client";

import { useEffect, useState } from 'react';

type DncState = { numbers: string[] };

export function DncPageClient() {
  const [data, setData] = useState<DncState>({ numbers: [] });
  const [num, setNum] = useState('');
  const refresh = async () => {
    const r = await fetch('/api/dnc/list');
    setData(await r.json());
  };
  useEffect(() => { refresh(); }, []);

  const add = async (e: any) => {
    e.preventDefault();
    if (!num) return;
    await fetch('/api/dnc/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: num }) });
    setNum('');
    refresh();
  };
  const remove = async (n: string) => {
    await fetch('/api/dnc/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: n }) });
    refresh();
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">DNC Management</h1>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="+1xxxxxxxxxx" className="border rounded px-3 py-2 w-64" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <div className="space-y-2">
        {data.numbers.length === 0 && <p className="text-gray-600">No numbers on DNC.</p>}
        {data.numbers.map((n) => (
          <div key={n} className="flex items-center justify-between border rounded p-2 bg-white">
            <span>{n}</span>
            <button onClick={() => remove(n)} className="text-red-600 hover:underline text-sm">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
