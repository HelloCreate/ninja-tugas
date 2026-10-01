'use client';

import { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  ArrowUpDown, 
  Bell, 
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle,
  FileText
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  course: string;
  description: string;
  difficulty: number;
  estimated_hours: number;
  priority: string;
  status: string;
  due_date: string;
  attachment_url?: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('due_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Form State
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [priority, setPriority] = useState('medium');
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
      console.error('Gagal mengambil tugas:', err);
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
          body: 'Notifikasi pengingat deadline berhasil diaktifkan.',
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
        fetchTasks();
      }
    } catch (err) {
      console.error('Gagal menyimpan tugas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'medium':
        return 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Navbar / Top Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Ninja Tugas
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  D1 & R2
                </span>
              </h1>
              <p className="text-xs text-slate-400">Portal manajemen & pelacak beban tugas kuliah</p>
            </div>
          </div>

          <button
            onClick={requestNotification}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            Nyalakan Notifikasi
          </button>
        </header>

        {/* Form Tambah Tugas */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Buat Tugas Baru</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Judul Tugas</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Proyek Desain Basis Data"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Mata Kuliah</label>
              <input
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Contoh: Rekayasa Perangkat Lunak"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Batas Pengumpulan (Deadline)</label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Kesulitan (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Durasi (Jam)</label>
                <input
                  type="number"
                  min="1"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Deskripsi / Catatan Soal</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rincian petunjuk tugas atau tautan materi kuliah..."
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Lampiran Foto Soal (R2 Storage)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer transition"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                {loading ? (uploading ? 'Mengunggah Berkas ke R2...' : 'Menyimpan Tugas...') : 'Simpan Tugas'}
              </button>
            </div>
          </form>
        </div>

        {/* Kontrol Filter & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Daftar Beban Tugas</h2>
            <span className="px-2 py-0.5 text-xs bg-slate-800 rounded-full text-slate-400 font-medium">
              {tasks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="due_date">Tenggat Waktu</option>
                <option value="difficulty">Tingkat Kesulitan</option>
                <option value="estimated_hours">Estimasi Jam</option>
                <option value="title">Judul Tugas</option>
              </select>
            </div>

            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              {order === 'asc' ? 'Terdekat / A-Z' : 'Terjauh / Z-A'}
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">Belum ada tugas yang tercatat</p>
              <p className="text-xs text-slate-600 mt-1">Gunakan formulir di atas untuk mencatat tugas baru.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="group bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 truncate">
                      {task.course}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
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

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{task.estimated_hours} jam</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Kesulitan:</span>
                    <span className="text-amber-400 font-mono tracking-widest text-xs">
                      {'★'.repeat(task.difficulty)}
                      <span className="text-slate-700">{'★'.repeat(5 - task.difficulty)}</span>
                    </span>
                  </div>

                  {task.attachment_url && (
                    <a
                      href={task.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      Lihat Foto Soal
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}