import { NextResponse } from 'next/server';
import { getSupabseClient } from '../../../../supaClient/index';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const supabase = await getSupabseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'User signed up successfully' }, { status: 200 });
}