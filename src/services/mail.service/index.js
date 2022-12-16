const constants = require('../../config/constants');
const sendMail = require('./sendMail');

const validate = (mailType, data) => {
    const typeDataFields = {
        'user.verification.otp': ['otp', 'user'],
    }
    if (!typeDataFields[mailType]) throw new Error(`Invalid mailType: got ${mailType}.`)
    const absentFields = typeDataFields[mailType].filter(x => !data[x]);
    if (absentFields.length > 0) throw new Error(`Some fields are missing for this mail type. Missing "${absentFields.join(', ')}"`)
}

const getEmailTemplate = (mailType, data) => {
    const mailTemplatesByType = {
        'user.verification.otp': {
            subject: constants.OTP_VERIFICATION_SUBJECT,
            templateData: {
                template: require('./templates.mail.service/otp-email')('cid:docuplier.js',constants.OTP_VERIFICATION_TITLE, data.otp),
                bulkEmailData: null,
            }
        },
    }

    return mailTemplatesByType[mailType];
}

module.exports = (mailType, data) => {
    validate(mailType, data);
    const { subject, templateData } = getEmailTemplate(mailType, data);
    const email = data.user.email;

    return sendMail(templateData, { email, subject });
}