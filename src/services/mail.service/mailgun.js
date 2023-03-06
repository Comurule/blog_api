const formData = require('form-data');
const Mailgun = require('mailgun.js');
const config = require('../../config');

/**
 * 
 * @param {{
*  subject: string,
*  sender: {name:string, email:string},
*  recipients: {email:string, data: object}[],
*  templateId: string,
* }} template - html body
* @returns 
 */
module.exports = async (template) => {
  const fsPromises = require('fs').promises;
  const path = require('path');

  const mailgun = new Mailgun(formData);
  const filepath = path.resolve(__dirname, './templates.mail.service/image.png');
  const client = mailgun.client({ username: 'api', key: config.MAILGUN_API_KEY });
  const variables = template.recipients.reduce((res, recipient) => (res[recipient.email] = recipient.data), {});

  const messageData = {
    from: `${template.sender.name} <${template.sender.email}>`,
    to: template.recipients.map(x => x.email),
    subject: template.subject,
    html: template.html,
    'o:testmode': true,
    'recipient-variables': JSON.stringify(variables)
  };

  const fileData = await fsPromises.readFile(filepath);
  const file = { filename: 'docuplier.png', data: fileData };

  messageData.inline = file;
  return client.messages.create(config.MAILGUN_DOMAIN, messageData);
}
