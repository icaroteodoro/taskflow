import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "localhost",
    port: Number(process.env.MAIL_PORT) || 1025,
    auth: {
        user: process.env.MAIL_USERNAME || "",
        pass: process.env.MAIL_PASSWORD || "",
    },
    secure: false, // true for 465, false for other ports
});

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    return transporter.sendMail({
        from: process.env.MAIL_USERNAME || '"Taskflow" <no-reply@taskflow.com>',
        to,
        subject,
        html,
    });
}
