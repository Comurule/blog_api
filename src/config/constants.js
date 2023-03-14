module.exports = {
    VALID_IMAGE_FORMATS: ['png', 'jpeg', 'jpg', 'pdf'],
    MAX_UPLOAD_IMAGE_SIZE: 5*1024*1024,

    EMAIL: {
        TYPE: {
            OTP_VERIFICATION: 'user.verification.otp',
            DOCUMENT_RECIPIENT: 'document.recipient',
            DOCUMENT_CONVENER: 'document.convener',
        },
        SUBJECT: {
            OTP_VERIFICATION: '[Docuplier]::Verify OTP',
            DOCUMENT_RECIPIENT: '[Docuplier]::Certificate',
            DOCUMENT_CONVENER: '[Docuplier]:: Certificate',
        },
        TITLE: {
            OTP_VERIFICATION: 'Document',
            DOCUMENT_RECIPIENT: 'document.recipient',
            DOCUMENT_CONVENER: 'document.convener',
        }
    }
}