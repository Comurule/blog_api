const formData = require('form-data');
const Mailgun = require('mailgun.js');
const config = require('../../config');

/**
 * 
 * @param {string} template - html body
 * @param {{email: string, subject: string}} data - email and subject of the email to be sent
 * @returns 
 */
module.exports = async (templateData, data) => {
    const fsPromises = require('fs').promises;
    const path = require('path');

    const mailgun = new Mailgun(formData);
    const filepath = path.resolve(__dirname, './templates.mail.service/image.png');
    const client = mailgun.client({ username: 'api', key: config.MAILGUN_API_KEY });

    const messageData = {
        from: `${config.MAILER_SENDER_NAME} <${config.MAILER_SENDER_EMAIL}>`,
        to: data.email,
        subject: data.subject,
        html: templateData.template,
        'o:testmode': true,
    };

    // For batching sending in mailgun. see https://documentation.mailgun.com/en/latest/user_manual.html#batch-sending-1
    if (templateData.bulkEmailData) {
        messageData['recipient-variables'] = JSON.stringify(templateData.bulkEmailData)
    }

    const fileData = await fsPromises.readFile(filepath);
    const file = { filename: 'docuplier.png', fileData };

    messageData.inline = file;
    return client.messages.create(config.MAILGUN_DOMAIN, messageData);
}
