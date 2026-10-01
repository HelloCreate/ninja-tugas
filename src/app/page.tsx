'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  ArrowUpDown, 
  Bell, 
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  UploadCloud,
  FileCheck
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  course: string;
  description: string;
  difficulty: number;
  estimated_hours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  due_date: string;
  attachment_url?: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?sortBy=${sortBy}&order=${order}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [sortBy, order]);

  const requestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('Ninja Tugas Aktif', {
          body: 'Notifikasi pengingat deadline kuliah telah aktif.',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let attachmentUrl = '';

      if (file) {
        setUploading(true);
        const presignedRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const presignedData = await presignedRes.json();

        if (presignedData.uploadUrl) {
          await fetch(presignedData.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          attachmentUrl = presignedData.fileUrl;
        }
        setUploading(false);
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          course,
          description,
          difficulty,
          estimatedHours,
          priority,
          dueDate,
          attachmentUrl,
        }),
      });

      if (res.ok) {
        setTitle('');
        setCourse('');
        setDescription('');
        setDueDate('');
        setFile(null);
        setIsModalOpen(false);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks berdasarkan pencarian
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'medium': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 antialiased font-sans pb-16">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#0c1222]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-lg shadow-indigo-600/30">
              N
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Ninja Tugas</span>
              <span className="text-[10px] text-slate-400 font-medium block">Cloudflare D1 & R2 Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={requestNotification}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition"
              title="Aktifkan Notifikasi"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tugas Baru
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Metric Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f172a]/60 border border-slate-800/70 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Beban Tugas</p>
              <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a]/60 border border-slate-800/70 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Prioritas Mendesak</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a]/60 border border-slate-800/70 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimasi Waktu Belajar</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {tasks.reduce((acc, curr) => acc + (Number(curr.estimated_hours) || 0), 0)} Jam
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/40 p-3 rounded-2xl border border-slate-800/60">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tugas atau mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1222] border border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#0c1222] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="due_date" className="bg-[#0c1222]">Deadline</option>
                <option value="difficulty" className="bg-[#0c1222]">Kesulitan</option>
                <option value="estimated_hours" className="bg-[#0c1222]">Durasi Jam</option>
                <option value="title" className="bg-[#0c1222]">Judul</option>
              </select>
            </div>

            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="px-3.5 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              {order === 'asc' ? 'A - Z' : 'Z - A'}
            </button>
          </div>
        </section>

        {/* Task Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-800/80 rounded-2xl bg-[#0f172a]/20">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">Tidak ada tugas ditemukan</p>
              <p className="text-xs text-slate-600 mt-1">Klik tombol 'Tugas Baru' di kanan atas untuk menambahkan catatan tugas.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#0f172a]/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg hover:shadow-indigo-500/5 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[180px]">
                      {task.course}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/70 space-y-2.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {new Date(task.due_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{task.estimated_hours} jam</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Tingkat Kesulitan:</span>
                    <span className="text-amber-400 tracking-widest text-xs">
                      {'★'.repeat(task.difficulty)}
                      <span className="text-slate-700">{'★'.repeat(5 - task.difficulty)}</span>
                    </span>
                  </div>

                  {task.attachment_url && (
                    <a
                      href={task.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      Lihat Berkas Lampiran
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Modern Modal Pop-up: Tambah Tugas Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0c1222]">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                Tambah Tugas Kuliah
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Judul Tugas</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Tugas Akhir Algoritma"
                  className="w-full bg-[#0c1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Mata Kuliah</label>
                  <input
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Misal: Basis Data"
                    className="w-full bg-[#0c1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Batas Waktu (Deadline)</label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#0c1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Kesulitan (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    className="w-full bg-[#0c1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Estimasi (Jam)</label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full bg-[#0c1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#0c1222] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan pengerjaan atau instruksi dosen..."
                  className="w-full bg-[#0c1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Lampiran Soal (Opsional ke R2)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-2 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-md transition"
                >
                  {loading ? (uploading ? 'Mengunggah...' : 'Menyimpan...') : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}