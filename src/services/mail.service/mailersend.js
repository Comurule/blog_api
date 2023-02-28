const path = require('path');
const fs = require('fs');
const config = require('../../config');
const { MailerSend, EmailParams, Sender, Recipient, Attachment } = require("mailersend");

/**
 * 
 * @param {{email: string, data: object}[]} template - html body
 * @param {string} subject - subject of the email to be sent
 * @returns 
 */
module.exports = async (template, subject) => {
  const mailerSend = new MailerSend({
    apiKey: config.MAILERSEND.API_KEY,
  });

  const sentFrom = new Sender(config.MAILER_SENDER_EMAIL, config.MAILER_SENDER_NAME);

  const recipients = template.map(x => new Recipient(x.email));
  console.log(recipients)

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setPersonalization(template)
    .setSubject(subject)
    .setTemplateId(config.MAILERSEND.TEMPLATE_ID.OTP);

  await mailerSend.email.send(emailParams);
}
