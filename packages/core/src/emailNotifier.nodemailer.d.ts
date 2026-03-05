/**
 * Optional dependency: install nodemailer to enable email sending.
 * When not installed, sendReviewEmail skips sending without throwing.
 */
declare module 'nodemailer' {
    interface TransportOptions {
        host?: string;
        port?: number;
        secure?: boolean;
        auth?: { user: string; pass: string };
    }
    interface Transporter {
        sendMail(options: { from: string; to: string; subject: string; text: string }): Promise<unknown>;
    }
    function createTransport(options: TransportOptions): Transporter;
}
