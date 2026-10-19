import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Command,
  FileText,
  Link2,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Tag,
  Users,
  X,
} from 'lucide-react';

type ObjectType = 'note' | 'project' | 'source' | 'person' | 'task';
type View = 'today' | 'inbox' | 'library' | 'connections';

type AtlasObject = {
  id: string;
  type: ObjectType;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  createdAt: string;
};

const STORAGE_KEY = 'jant-atlas-objects-v1';
const typeLabels: Record<ObjectType, string> = {
  note: 'Note', project: 'Project', source: 'Source', person: 'Person', task: 'Task',
};
const seedObjects: AtlasObject[] = [
  { id: 'atlas-1', type: 'note', title: 'The shape of a personal knowledge space', content: 'The best tools disappear while you think. Structure should emerge from the things you care about — not ask you to maintain another filing system.', tags: ['product', 'attention'], links: ['atlas-2', 'atlas-3'], createdAt: new Date().toISOString() },
  { id: 'atlas-2', type: 'project', title: 'Atlas — first principles', content: 'A calm, connected workspace for turning fragments into durable ideas.', tags: ['in progress'], links: ['atlas-1'], createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'atlas-3', type: 'source', title: 'The extended mind', content: 'Notes on how tools become part of the thinking process.', tags: ['research'], links: ['atlas-1'], createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'atlas-4', type: 'person', title: 'Andy Matuschak', content: 'Evergreen notes, associative memory and interfaces for thought.', tags: ['people'], links: ['atlas-3'], createdAt: new Date(Date.now() - 172800000).toISOString() },
];

function loadObjects(): AtlasObject[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(saved) ? saved : seedObjects;
  } catch { return seedObjects; }
}
function id() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; }
function isToday(value: string) { return new Date(value).toDateString() === new Date().toDateString(); }
function dateLabel(value: string) { return isToday(value) ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' }); }
function searchObjects(objects: AtlasObject[], query: string) {
  const normalized = query.trim().toLowerCase();
  return normalized ? objects.filter((object) => [object.title, object.content, ...object.tags].join(' ').toLowerCase().includes(normalized)) : objects;
}

export function App() {
  const [objects, setObjects] = useState<AtlasObject[]>(loadObjects);
  const [view, setView] = useState<View>('today');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AtlasObject | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ObjectType | 'all'>('all');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(objects)); }, [objects]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === 'Escape') { setPaletteOpen(false); setEditorOpen(false); setSelected(null); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredObjects = useMemo(() => {
    return searchObjects(objects, query)
      .filter((object) => view !== 'today' || isToday(object.createdAt))
      .filter((object) => view !== 'inbox' || object.tags.includes('inbox'))
      .filter((object) => typeFilter === 'all' || object.type === typeFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [objects, query, typeFilter, view]);

  const createObject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    if (!title) return;
    const next: AtlasObject = {
      id: id(), type: String(form.get('type') || 'note') as ObjectType, title,
      content: String(form.get('content') || '').trim(),
      tags: String(form.get('tags') || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      links: [], createdAt: new Date().toISOString(),
    };
    setObjects((current) => [next, ...current]);
    setEditorOpen(false);
    event.currentTarget.reset();
  };

  const connected = selected ? objects.filter((object) => selected.links.includes(object.id) || object.links.includes(selected.id)) : [];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 font-sans">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_290px]">
        <aside className="border-b border-stone-200/80 bg-[#FAF9F6] p-5 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center gap-3 px-2"><div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">J</div><span className="font-serif text-xl font-bold tracking-tight">Jant / Atlas</span></div>
          <button onClick={() => setEditorOpen(true)} className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-amber-950 shadow-soft hover:bg-amber-500"><Plus size={17} /> New object</button>
          <nav className="space-y-1" aria-label="Workspace views">
            <NavButton active={view === 'today'} onClick={() => setView('today')} icon={<CalendarDays size={17} />} label="Today" count={objects.filter((object) => isToday(object.createdAt)).length} />
            <NavButton active={view === 'inbox'} onClick={() => setView('inbox')} icon={<Archive size={17} />} label="Inbox" count={objects.filter((object) => object.tags.includes('inbox')).length} />
            <NavButton active={view === 'library'} onClick={() => setView('library')} icon={<BookOpen size={17} />} label="Library" count={objects.length} />
            <NavButton active={view === 'connections'} onClick={() => setView('connections')} icon={<Link2 size={17} />} label="Connections" />
          </nav>
          <div className="mt-8 px-2 text-[11px] font-bold uppercase tracking-[.16em] text-stone-500">Object types</div>
          <div className="mt-2 space-y-1">
            {(['note', 'project', 'source', 'person', 'task'] as ObjectType[]).map((type) => <button key={type} onClick={() => { setTypeFilter(type); setView('library'); }} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-stone-600 hover:bg-stone-100"><span className={`h-2 w-2 rounded-full ${type === 'note' ? 'bg-amber-400' : type === 'project' ? 'bg-emerald-400' : type === 'source' ? 'bg-sky-400' : type === 'person' ? 'bg-purple-400' : 'bg-rose-400'}`} />{typeLabels[type]}</button>)}
          </div>
          <div className="mt-10 flex items-center gap-2 border-t border-stone-200/80 px-2 pt-4 text-xs text-stone-500"><Settings2 size={15} /> Local workspace</div>
        </aside>

        <main className="min-w-0 px-5 py-6 sm:px-10 lg:px-16 lg:py-8">
          <header className="mb-10 flex items-center justify-between gap-4"><span className="text-sm text-stone-500">Workspace / <strong className="text-slate-800">{view[0].toUpperCase() + view.slice(1)}</strong></span><button onClick={() => setPaletteOpen(true)} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500 shadow-2xs"><Search size={14} /> <span className="hidden sm:inline">Search</span><kbd className="rounded border border-stone-200 px-1.5 py-0.5">⌘K</kbd></button></header>
          <section className="mb-8 flex items-end justify-between gap-5"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-amber-700">{new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">A home for your thinking.</h1><p className="mt-3 text-sm text-stone-500">Capture things. Connect ideas. Keep the context.</p></div><span className="hidden text-xs text-stone-500 sm:block">{objects.length} objects</span></section>
          <form onSubmit={(event) => { event.preventDefault(); const input = event.currentTarget.elements.namedItem('capture') as HTMLInputElement; if (input.value.trim()) { setEditorOpen(true); } }} className="mb-8 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-soft"><Plus className="text-amber-700" size={20} /><input name="capture" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-stone-400" placeholder="Capture a thought…" /><kbd className="hidden rounded border border-stone-200 px-2 py-1 text-[10px] text-stone-400 sm:block">⌘ ↵</kbd></form>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-xl font-bold text-slate-900">{view === 'connections' ? 'Connected objects' : view[0].toUpperCase() + view.slice(1)}</h2><button onClick={() => setTypeFilter(typeFilter === 'all' ? 'note' : 'all')} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500">{typeFilter === 'all' ? 'All types' : typeLabels[typeFilter]} ▾</button></div>
          {view === 'connections' ? <ConnectionMap objects={objects} onSelect={setSelected} /> : filteredObjects.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{filteredObjects.map((object, index) => <ObjectCard key={object.id} object={object} featured={index === 0 && view === 'today'} onSelect={setSelected} />)}</div> : <EmptyState onCreate={() => setEditorOpen(true)} />}
        </main>

        <aside className="hidden border-l border-stone-200/80 bg-[#FAF9F6] p-6 lg:block lg:pt-24"><div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-stone-500"><Sparkles size={14} /> In this context</div>{selected ? <><p className="mb-4 font-serif text-xl font-bold text-slate-900">{selected.title}</p><div className="space-y-1">{connected.length ? connected.map((object) => <button key={object.id} onClick={() => setSelected(object)} className="flex w-full items-start gap-3 border-b border-stone-200/80 py-3 text-left"><span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500" /><span><strong className="block text-sm">{object.title}</strong><small className="text-xs text-stone-500">{typeLabels[object.type]}</small></span><ChevronRight className="ml-auto mt-1 text-stone-400" size={14} /></button>) : <p className="text-sm text-stone-500">No linked objects yet.</p>}</div></> : <p className="text-sm leading-6 text-stone-500">Select an object to see its backlinks and surrounding context.</p>}<div className="mt-10 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">Objects are local to this browser for now. Export and sync will be added after the core model stabilizes.</div></aside>
      </div>

      {isEditorOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-4" onMouseDown={(event) => event.target === event.currentTarget && setEditorOpen(false)}><form onSubmit={createObject} className="w-full max-w-xl rounded-3xl border border-stone-200 bg-[#FAF9F6] p-6 shadow-modal"><div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">New object</h2><button type="button" onClick={() => setEditorOpen(false)} aria-label="Close"><X /></button></div><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-stone-500">Type<select name="type" className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-3 text-sm"><option value="note">Note</option><option value="project">Project</option><option value="source">Source</option><option value="person">Person</option><option value="task">Task</option></select></label><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-stone-500">Title<input autoFocus required name="title" className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-3 font-serif text-xl outline-none focus:border-amber-500" placeholder="Give it a name" /></label><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-stone-500">Content<textarea name="content" className="mt-2 min-h-32 w-full resize-y rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-amber-500" placeholder="Start writing…" /></label><label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Tags<input name="tags" className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-3 text-sm" placeholder="product, research" /></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl px-4 py-2 text-sm text-stone-500">Cancel</button><button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950">Save object</button></div></form></div>}
      {isPaletteOpen && <div className="fixed inset-0 z-50 grid place-items-start justify-center bg-slate-900/20 p-4 pt-[15vh]" onMouseDown={(event) => event.target === event.currentTarget && setPaletteOpen(false)}><div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-[#FAF9F6] p-3 shadow-modal"><div className="flex items-center gap-2 border-b border-stone-200 px-2 pb-2"><Command size={17} className="text-stone-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="flex-1 bg-transparent p-2 text-sm outline-none" placeholder="Search titles, content and tags…" /></div><div className="mt-2 space-y-1">{objects.filter((object) => !query || `${object.title} ${object.content} ${object.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6).map((object) => <button key={object.id} onClick={() => { setSelected(object); setPaletteOpen(false); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-amber-50"><FileText size={15} className="text-amber-700" /><span><strong className="block text-sm">{object.title}</strong><small className="text-xs text-stone-500">{typeLabels[object.type]}</small></span></button>)}<button onClick={() => { setPaletteOpen(false); setEditorOpen(true); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-semibold hover:bg-amber-50"><Plus size={16} /> Create a new object</button></div></div></div>}
    </div>
  );
}

function NavButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-all ${active ? 'border-l-2 border-amber-700 bg-amber-100/70 font-bold text-amber-950' : 'text-stone-700 hover:bg-stone-100'}`}>{icon}<span>{label}</span>{count !== undefined && <span className="ml-auto text-[11px] font-mono text-stone-500">{count}</span>}</button>; }
function ObjectCard({ object, featured, onSelect }: { object: AtlasObject; featured: boolean; onSelect: (object: AtlasObject) => void }) { return <article className={`group rounded-2xl border border-stone-200/80 p-5 shadow-2xs transition hover:-translate-y-0.5 hover:shadow-card ${featured ? 'md:col-span-2 bg-gradient-to-br from-white to-amber-50/30' : 'bg-white'}`}><div className="mb-5 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">{typeLabels[object.type]}</span><time className="text-xs text-stone-400">{dateLabel(object.createdAt)}</time></div><button className="block w-full text-left" onClick={() => onSelect(object)}><h3 className="font-serif text-xl font-bold tracking-tight text-slate-900">{object.title}</h3><p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-stone-600">{object.content || 'No content yet.'}</p></button><div className="mt-5 flex flex-wrap items-center gap-2">{object.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-[11px] text-stone-600"><Tag size={11} />{tag}</span>)}{object.links.length > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[11px] text-amber-900"><Link2 size={11} />{object.links.length} links</span>}</div></article>; }
function ConnectionMap({ objects, onSelect }: { objects: AtlasObject[]; onSelect: (object: AtlasObject) => void }) { return <div className="grid grid-cols-1 gap-3">{objects.filter((object) => object.links.length > 0).map((object) => <button key={object.id} onClick={() => onSelect(object)} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-2xs hover:shadow-card"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-800"><Link2 size={18} /></span><span className="flex-1"><strong className="block font-serif text-lg">{object.title}</strong><small className="text-stone-500">{typeLabels[object.type]} · {object.links.length} connected objects</small></span><ChevronRight className="text-stone-400" /></button>)}<p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">Connections are explicit and reversible. Select an object to inspect its context.</p></div>; }
function EmptyState({ onCreate }: { onCreate: () => void }) { return <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center"><Users className="mx-auto mb-3 text-stone-400" /><strong className="block font-serif text-xl">Nothing here yet.</strong><span className="mt-2 block text-sm text-stone-500">Start with an object; structure can emerge later.</span><button onClick={onCreate} className="mt-5 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950">Create object</button></div>; }
