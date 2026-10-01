import { NextResponse } from 'next/server';

// Fungsi bantuan query ke Cloudflare D1 via REST API
async function queryD1(sql: string, params: any[] = []) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const dbId = process.env.CF_D1_DATABASE_ID;
  const apiToken = process.env.CF_API_TOKEN;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
      cache: 'no-store',
    }
  );

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'Gagal query ke D1');
  }
  return data.result?.[0]?.results || [];
}

// GET: Mengambil daftar tugas (mendukung sorting)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'due_date';
    const order = searchParams.get('order') === 'desc' ? 'DESC' : 'ASC';

    // Whitelist kolom pengurutan untuk keamanan
    const allowedSort = ['due_date', 'difficulty', 'estimated_hours', 'priority', 'title'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'due_date';

    const sql = `SELECT * FROM tasks ORDER BY ${sortColumn}${order}`;
    const tasks = await queryD1(sql);

    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Menyimpan tugas baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, course, description, difficulty, estimatedHours, priority, dueDate, attachmentUrl } = body;

    const id = crypto.randomUUID();
    const sql = `
      INSERT INTO tasks (id, title, course, description, difficulty, estimated_hours, priority, status, due_date, attachment_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?)
    `;
    const params = [
      id,
      title,
      course,
      description || '',
      Number(difficulty) || 1,
      Number(estimatedHours) || 1,
      priority || 'medium',
      dueDate,
      attachmentUrl || null,
    ];

    await queryD1(sql, params);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}