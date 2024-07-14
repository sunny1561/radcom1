import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}