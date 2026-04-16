import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    const from = process.env.MAIL_FROM || 'Taskflow <noreply@taskflow.com.br>';

    try {
        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        return data;
    } catch (error) {
        console.error('Failed to send email via Resend:', error);
        throw error;
    }
}
