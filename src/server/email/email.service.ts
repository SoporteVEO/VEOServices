import { Resend } from "resend";

class EmailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "soporte.dev@arhedes.com.sv";
  private readonly testToEmail =
    process.env.RESEND_TEST_TO_EMAIL ?? "soporte.dev@arhedes.com.sv";

  async sendEmail(to: string, subject: string, content: React.ReactNode) {
    const isProd = process.env.NODE_ENV === "production";

    const { data, error } = await this.resend.emails.send({
      from: `VEO <${this.fromEmail}>`,
      to: [isProd ? this.testToEmail : this.testToEmail],
      subject: subject,
      react: content,
    });

    return { data, error };
  }
}

export const emailService = new EmailService();
