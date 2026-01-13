import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resendApiKey);

export const emailService = {
  async sendOTP(email: string, code: string, type: 'SIGNUP' | 'LOGIN' | 'RESET_PASSWORD') {
    const subjects = {
      SIGNUP: 'Verifikasi Email - CashFlow',
      LOGIN: 'Kode Login - CashFlow',
      RESET_PASSWORD: 'Reset Password - CashFlow',
    };

    const messages = {
      SIGNUP: 'Gunakan kode berikut untuk verifikasi email Anda:',
      LOGIN: 'Gunakan kode berikut untuk login ke akun Anda:',
      RESET_PASSWORD: 'Gunakan kode berikut untuk reset password Anda:',
    };

    try {
      const { data, error } = await resend.emails.send({
        from: config.emailFrom || 'CashFlow <noreply@resend.dev>',
        to: email,
        subject: subjects[type],
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0;">💰 CashFlow</h1>
              <p style="color: #64748b; margin-top: 5px;">Keuangan Bisnis & POS</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
              <p style="color: #475569; margin-bottom: 20px;">${messages[type]}</p>
              
              <div style="background: #7c3aed; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 30px; border-radius: 8px; display: inline-block;">
                ${code}
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
                Kode berlaku selama 10 menit.
              </p>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
              Jika Anda tidak melakukan permintaan ini, abaikan email ini.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send email:', error);
        throw new Error('Gagal mengirim email');
      }

      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw new Error('Gagal mengirim email');
    }
  },
};
