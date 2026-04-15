import {NextResponse} from 'next/server';
import {getSupabaseRouteClient} from '@/server/supabase/routeClient';

function getBearerToken(req: Request): string | null {
  const h = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!h) return null;
  const match = h.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json(
      {message: 'Unauthorized'},
      {status: 401}
    );
  }

  const supabase = getSupabaseRouteClient(token);

  const url = new URL(req.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');
  const keyword = url.searchParams.get('keyword');

  let q = supabase.from('tasks').select('*').order('entry_date', {ascending: false});

  if (startDate) q = q.gte('entry_date', Number(startDate));
  if (endDate) q = q.lte('entry_date', Number(endDate));
  if (category) q = q.eq('task_category', category);
  if (status) q = q.eq('status', status);
  if (keyword) {
    q = q.or(`task_title.ilike.%${keyword}%,notes.ilike.%${keyword}%`);
  }

  const {data, error} = await q;
  if (error) {
    return NextResponse.json({message: error.message}, {status: 400});
  }

  const tasks = (data ?? []).map(r => ({
    id: r.id as string,
    userId: r.user_id as string,
    entryDate: r.entry_date as number,
    startTime: r.start_time as number | null,
    endTime: r.end_time as number | null,
    durationMinutes: r.duration_minutes as number | null,
    taskCategory: r.task_category as string | null,
    taskTitle: r.task_title as string | null,
    notes: r.notes as string | null,
    status: r.status as string,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string
  }));

  return NextResponse.json({tasks});
}

export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json(
      {message: 'Unauthorized'},
      {status: 401}
    );
  }

  const supabase = getSupabaseRouteClient(token);

  const body = (await req.json()) as {
    entryDate: number;
    startTime?: number | null;
    endTime?: number | null;
    durationMinutes?: number | null;
    taskCategory?: string | null;
    taskTitle: string;
    notes?: string | null;
    status: string;
  };

  const {data: userData, error: userErr} = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  }

  const {data, error} = await supabase
    .from('tasks')
    .insert({
      user_id: userData.user.id,
      entry_date: body.entryDate,
      start_time: body.startTime ?? null,
      end_time: body.endTime ?? null,
      duration_minutes: body.durationMinutes ?? null,
      task_category: body.taskCategory ?? null,
      task_title: body.taskTitle,
      notes: body.notes ?? null,
      status: body.status
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({message: error.message}, {status: 400});
  }

  const task = {
    id: data.id as string,
    userId: data.user_id as string,
    entryDate: data.entry_date as number,
    startTime: data.start_time as number | null,
    endTime: data.end_time as number | null,
    durationMinutes: data.duration_minutes as number | null,
    taskCategory: data.task_category as string | null,
    taskTitle: data.task_title as string | null,
    notes: data.notes as string | null,
    status: data.status as string,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string
  };

  return NextResponse.json({task}, {status: 201});
}
