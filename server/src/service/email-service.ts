import console from "console";
import { createTransport } from "nodemailer";
import { AppDataSource } from "../data-source.js";
import { UserEntity } from "../entity/User.entity.js";
import logger from "../logger.js";
import { ClientSettings, EmailSettings } from "../settings.js";

export function sendNotificationEmailAboutNewRegistration(newUsername: string) {
  if (!canSendEmail()) {
    console.info("Could not send email notification about new user registration to admins. No SMTP server is configured in `.env` file.");
    return;
  }

  AppDataSource.manager
    .getRepository(UserEntity)
    .createQueryBuilder("find all admins")
    .where("roles @> :role", { role: ["ADMIN"] }) // https://www.postgresql.org/docs/16/functions-array.html#ARRAY-OPERATORS-TABLE
    .getMany()
    .then((users) => {
      console.log("Found users", users);
      return users.map((user) => user.email);
    })
    .catch((e) => {
      console.error("Failed to get admins", e);
      return [];
    })
    .then((adminEmails) => {
      if (adminEmails.length <= 0) {
        logger.warn(`There are no admins yet. No notification email is sent about new user '${newUsername}'.`);
      } else {
        logger.debug(`Sending notification email about registration of new user '${newUsername}' to ${adminEmails.join(", ")}`);

        sendEmail(
          adminEmails,
          "New user registered",
          `Hi admins,
a new user '${encodeURIComponent(newUsername)}' registered at ${ClientSettings.BASE_URL} .
Visit ${ClientSettings.BASE_URL}/administration in order to give them some permissions.

Kind regards,
Your fuBlog`,
        );
      }
    });
}

function canSendEmail(): boolean {
  return !!(EmailSettings.SMTP_HOST && EmailSettings.SMTP_PORT && EmailSettings.SMTP_FROM);
}

function sendEmail(to: string[], subject: string, text: string) {
  createTransport(EmailSettings.SMTP_OPTIONS)
    .sendMail({
      from: EmailSettings.SMTP_FROM,
      to,
      subject,
      text,
    })
    .catch(() => {
      logger.error("Failed to send email notification!");
    });
}
