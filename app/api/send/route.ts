import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import EmailTemplate from '@/components/EmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  try {
    const data = await resend.emails.send({
      from: 'Hello <hello@nenadmarinkovic.com>',
      to: `nenadmarinkovic@protonmail.com`,
      subject: `${name} has a message!`,
      react: EmailTemplate({ name, email, message }),
      text: 'This is the text version of the email.',
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
