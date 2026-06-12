import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import { signToken } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    await User.updateOne({ _id: user._id }, { online: true, lastSeen: new Date() });
    const token = signToken(user._id.toString());

    cookies.set('token', token, { httpOnly: true, secure: false, path: '/', maxAge: 60 * 60 * 24 * 7 });

    return new Response(JSON.stringify({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } }));
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
