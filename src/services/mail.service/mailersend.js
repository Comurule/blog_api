const config = require('../../config');
const { MailerSend, EmailParams, Sender, Recipient, Attachment } = require("mailersend");

/**
 * 
 * @param {{
 *  subject: string,
 *  recipients: {email:string, data: object}[],
 *  templateId:string,
 * }} template - html body
 * @returns 
 */
module.exports = async (template) => {
  const mailerSend = new MailerSend({
    apiKey: config.MAILERSEND.API_KEY,
  });

  const sentFrom = new Sender(config.MAILER_SENDER_EMAIL, config.MAILER_SENDER_NAME);
  const recipients = template.recipients.map(x => new Recipient(x.email));

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setPersonalization(template.recipients)
    .setSubject(template.subject)
    .setTemplateId(template.templateId);

  await mailerSend.email.send(emailParams);
}
