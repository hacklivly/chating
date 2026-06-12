import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import { signToken } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'All fields required' }), { status: 400 });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = signToken(user._id.toString());

    cookies.set('token', token, { httpOnly: true, secure: false, path: '/', maxAge: 60 * 60 * 24 * 7 });

    return new Response(JSON.stringify({ user: { id: user._id, name: user.name, email: user.email } }), { status: 201 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
