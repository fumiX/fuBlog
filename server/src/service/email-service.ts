import console from "console";
import { createTransport } from "nodemailer";
import { AppDataSource } from "../data-source.js";
import { UserEntity } from "../entity/User.entity.js";
import logger from "../logger.js";
import { ClientSettings, EmailSettings } from "../settings.js";

export async function sendNotificationEmailAboutNewRegistration(newUsername: string) {
  const admin_emails = await AppDataSource.manager
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
    });

  if (admin_emails.length <= 0) {
    logger.warn(`There are no admins yet. No notification email is sent about new user '${newUsername}'.`);
  } else {
    logger.debug(`Sending notification email about registration of new user '${newUsername}' to ${admin_emails.join(", ")}`);

    await sendEmail(
      admin_emails,
      "New user registered",
      `Hi admins,
a new user '${encodeURIComponent(newUsername)}' registered at ${ClientSettings.BASE_URL} .
Visit ${ClientSettings.BASE_URL}/administration in order to give them some permissions.

Kind regards,
Your fuBlog`,
    );
  }
}

function sendEmail(to: string[], subject: string, text: string) {
  if (!(EmailSettings.SMTP_HOST ?? EmailSettings.SMTP_PORT)) {
    throw new Error("No SMTP email server set! Cannot send email.");
  }

  createTransport(EmailSettings.SMTP_OPTIONS)
    .sendMail({
      from: "fublog@fumix.de",
      to,
      subject,
      text,
    })
    .catch(() => {
      logger.error("Failed to send email notification!");
    });
}
