import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import Email from '@/components/Email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

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
    return NextResponse.json({ error });
  }
}
