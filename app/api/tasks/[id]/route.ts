import {NextResponse} from 'next/server';
import {getSupabaseRouteClient} from '@/server/supabase/routeClient';

function getBearerToken(req: Request): string | null {
  const h = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!h) return null;
  const match = h.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

type PatchBody = {
  entryDate?: number;
  startTime?: number | null;
  endTime?: number | null;
  durationMinutes?: number | null;
  taskCategory?: string | null;
  taskTitle?: string;
  notes?: string | null;
  status?: string;
};

export async function PATCH(req: Request, ctx: {params: Promise<{id: string}>}) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({message: 'Unauthorized'}, {status: 401});

  const {id} = await ctx.params;
  const supabase = getSupabaseRouteClient(token);

  const body = (await req.json()) as PatchBody;

  const {data: userData, error: userErr} = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.entryDate === 'number') patch.entry_date = body.entryDate;
  if ('startTime' in body) patch.start_time = body.startTime ?? null;
  if ('endTime' in body) patch.end_time = body.endTime ?? null;
  if ('durationMinutes' in body) patch.duration_minutes = body.durationMinutes ?? null;
  if ('taskCategory' in body) patch.task_category = body.taskCategory ?? null;
  if (typeof body.taskTitle === 'string') patch.task_title = body.taskTitle;
  if ('notes' in body) patch.notes = body.notes ?? null;
  if (typeof body.status === 'string') patch.status = body.status;

  const {data, error} = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userData.user.id)
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

  return NextResponse.json({task});
}

export async function DELETE(req: Request, ctx: {params: Promise<{id: string}>}) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({message: 'Unauthorized'}, {status: 401});

  const {id} = await ctx.params;
  const supabase = getSupabaseRouteClient(token);

  const {data: userData, error: userErr} = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  }

  const {error} = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id);

  if (error) {
    return NextResponse.json({message: error.message}, {status: 400});
  }

  return NextResponse.json({ok: true});
}
