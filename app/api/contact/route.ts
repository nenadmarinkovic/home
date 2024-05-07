import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import Email from '@/components/Email';

const { RESEND_API_KEY } = process.env;

const resend = new Resend(RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Invalid input' });
  }

  try {
    const data = await resend.emails.send({
      from: 'Hello <hello@nenadmarinkovic.com>',
      to: `nenadmarinkovic@protonmail.com`,
      subject: `${name} has a message!`,
      react: Email({ name, email, message }),
      text: `Hi Nenad, ${name} has sent you a message.
      You can reply to them at ${email}.
      Here is the message: ${message}`,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to send email' });
  }
}
