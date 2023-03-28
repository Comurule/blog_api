const config = require('../../config');
const { MailerSend, EmailParams, Sender, Recipient, Attachment } = require("mailersend");

/**
 * 
 * @param {{
 *  subject: string,
 *  sender: {name:string, email:string},
 *  recipients: {email:string, data: object}[],
 *  templateId:string,
 * }} template - html body
 * @returns 
 */
module.exports = async (template) => {
  const mailerSend = new MailerSend({
    apiKey: config.MAILERSEND.API_KEY,
  });

  const sentFrom = new Sender(template.sender.email, template.sender.name);

  const recipients = template.recipients.map(x => new Recipient(x.email));
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(new Recipient('umebuike@gmail.com'))
    .setBcc(recipients)
    .setReplyTo(sentFrom)
    .setPersonalization(template.recipients)
    .setSubject(template.subject)
    .setTemplateId(template.templateId);

  await mailerSend.email.send(emailParams);


  // const recipients = template.recipients.map(x => new EmailParams()
  //   .setFrom(sentFrom)
  //   .setTo([new Recipient(x.email)])
  //   .setReplyTo(sentFrom)
  //   .setPersonalization(x)
  //   .setSubject(template.subject)
  //   .setTemplateId(template.templateId)
  //   .setPrecedenceBulk(true)
  // );

  // await mailerSend.email.sendBulk(recipients);
}
