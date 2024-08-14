import nodemailer from 'nodemailer';
import { getNewAccessToken } from './oauth2Service.js';
import UnknownError from '../../infrastructure/errors/UnknownError.js';

class EmailService {
  constructor() {
    this.accessToken = null;
    this.accessTokenExpiresAt = null;

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: this.accessToken,
      },
    });
  }

  async refreshTokenIfNeeded() {
    try {
      if (!this.accessTokenExpiresAt || this.accessTokenExpiresAt < new Date()) {
        const newToken = await getNewAccessToken();
        console.log("gmail get newToken!");
        this.accessTokenExpiresAt = new Date(Date.now() + 3500000); // 1 hour
        this.transporter.options.auth.accessToken = newToken;
      }
    } catch (error) {
      throw error;
    }
  }

  async sendMail(email, title, text) {
    try {
      // console.log("real sendimgEmail");
      await this.refreshTokenIfNeeded();
      this.transporter.sendMail({
        from: {
          name: process.env.GMAIL_DISPLAY,
          address: process.env.GMAIL
        },
        to: email,
        subject: title,
        html: text,
      });
    } catch (error) {
      throw new UnknownError({ message: { title: { key: 'emailSendFail', params: { email } } } }, error);
    }
  }
}

const emailService = new EmailService();
export default emailService;
