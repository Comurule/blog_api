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
    if (absentFields.length > 0) throw new Error(`Some fields are missing for this mail type. Missing "${absentFields.join(', ')}"`)
}

const getEmailTemplate = (mailType, data) => {
    const mailTemplatesByType = {
        [constants.EMAIL.TYPE.OTP_VERIFICATION]: {
            id: config.MAILERSEND.TEMPLATE_ID.OTP,
            subject: constants.EMAIL.SUBJECT.OTP_VERIFICATION,
            recipients: [{
                email: data?.user?.email,
                data: {
                    token: data?.otp.split('').join('  ')
                }
            }]
        },

        [constants.EMAIL.TYPE.DOCUMENT_RECIPIENT]: {
            id: config.MAILERSEND.TEMPLATE_ID.PARTICIPANT,
            subject: constants.EMAIL.SUBJECT.DOCUMENT_RECIPIENT,
            recipients: data?.recipients?.map(x => ({
                email: x.email,
                data: {
                    recipient_name: x.name,
                    convener_name: data.convener.organization_name,
                    convener_email: data.convener.email,
                    document_url: `https://docuplier.com/document?doc=${data.document_id}&client=${x._id}`,
                }
            })) 
        },

        [constants.EMAIL.TYPE.DOCUMENT_CONVENER]: {
            id: config.MAILERSEND.TEMPLATE_ID.CONVENER,
            subject: constants.EMAIL.SUBJECT.DOCUMENT_CONVENER,
            recipients: [{
                email: data?.convener?.email,
                data: {
                    document_url: `https://docuplier.com/document?doc=${data?.document_id}`,
                }
            }]
        },
    }

    return mailTemplatesByType[mailType];
}

module.exports = (mailType, data) => {
    validate(mailType, data);
    const template = getEmailTemplate(mailType, data);

    return sendMail(template);
}