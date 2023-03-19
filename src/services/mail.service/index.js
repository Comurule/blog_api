const config = require('../../config');
const constants = config.constants;
const sendMail = require('./mailersend');

const validate = (mailType, data) => {
    const typeDataFields = {
        [constants.EMAIL.TYPE.OTP_VERIFICATION]: ['otp', 'user'],
        [constants.EMAIL.TYPE.DOCUMENT_RECIPIENT]: ['recipients', 'convener', 'document_id'],
        [constants.EMAIL.TYPE.DOCUMENT_CONVENER]: ['convener', 'document_id'],
    }
    if (!typeDataFields[mailType]) throw new Error(`Invalid mailType: got ${mailType}.`)
    const absentFields = typeDataFields[mailType].filter(x => !data[x]);
    if (absentFields.length > 0) throw new Error(`Some fields are missing for this mail type: ${mailType}. Missing "${absentFields.join(', ')}"`)
}

const getEmailTemplate = (mailType, data) => {
    const mailTemplatesByType = {
        [constants.EMAIL.TYPE.OTP_VERIFICATION]: () => ({
            templateId: config.MAILERSEND.TEMPLATE_ID.OTP,
            subject: constants.EMAIL.SUBJECT.OTP_VERIFICATION,
            sender: {
                email: config.MAILER_SENDER_EMAIL_NO_REPLY,
                name: config.MAILER_SENDER_NAME,
            },
            recipients: [{
                email: data.user.email,
                data: {
                    token: data.otp.split('').join('  ')
                }
            }]
        }),

        [constants.EMAIL.TYPE.DOCUMENT_RECIPIENT]: () => ({
            templateId: config.MAILERSEND.TEMPLATE_ID.PARTICIPANT,
            subject: constants.EMAIL.SUBJECT.DOCUMENT_RECIPIENT,
            sender: {
                email: config.MAILER_SENDER_EMAIL,
                name: config.MAILER_SENDER_NAME,
            },
            recipients: data.recipients.map(x => ({
                email: x.email,
                data: {
                    recipient_name: x.name,
                    email_description: data.email_text,
                    convener_name: data.convener.organization_name,
                    convener_email: data.convener.email,
                    document_url: `${config.FRONTEND.ROUTES.HOSTNAME}${config.FRONTEND.ROUTES.RECIPIENT_CERTIFICATE}?doc=${data.document_id}&client=${x._id}`,
                }
            })) 
        }),

        [constants.EMAIL.TYPE.DOCUMENT_CONVENER]: () => ({
            templateId: config.MAILERSEND.TEMPLATE_ID.CONVENER,
            subject: constants.EMAIL.SUBJECT.DOCUMENT_CONVENER,
            sender: {
                email: config.MAILER_SENDER_EMAIL,
                name: config.MAILER_SENDER_NAME,
            },
            recipients: [{
                email: data.convener.email,
                data: {
                    convener_name: data.convener.organization_name,
                    document_organisation_url: `${config.FRONTEND.ROUTES.HOSTNAME}${config.FRONTEND.ROUTES.CONVENER_CERTIFICATE}?doc=${data?.document_id}`,
                }
            }]
        }),
    }

    return mailTemplatesByType[mailType]();
}

module.exports = (mailType, data) => {
    validate(mailType, data);
    const template = getEmailTemplate(mailType, data);

    return sendMail(template);
}
