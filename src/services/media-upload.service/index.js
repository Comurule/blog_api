const formidable = require("formidable");
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const CustomError = require('../../utils/customError');
const config = require('../../config');

cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});
/**
 * Uploads image file to cloudinary
 * @param {Request} req - Express Request object
 * @returns  the req body data + media file
 */
exports.parseReqBody = (req) => {
    var form = new formidable.IncomingForm({
        multiples: false,
        allowEmptyFiles: false,
        maxFields: 0, // unlimited fields 
        maxFieldsSize: 25 * 1024 * 1024,
        // maxFiles: 5,
        // maxFileSize: 25 * 1024 * 1024,
        // uploadDir: path.resolve(__dirname, '../../images')
    });

    return new Promise((resolve, reject) => {
        form.parse(req, async function (err, fields, file) {
            try {
                if (err) throw err;

                // pass the other contents to the req.body since we're receiving it via formData
                return resolve({
                    ...parseToObj(fields),
                    file
                });

            } catch (error) {
                return reject(error);
            }
        })
    });
};

exports.uploadImage = async (file) => {
    if (!file.docImage) throw new CustomError('No Image provided!.', 400);

    const image = file.docImage;
    if (image.name == '') throw new CustomError('Image is required!', 400);

    const validationError = validateImage(image);
    if (validationError) throw new CustomError(validationError, 400);

    const uploadOptions = {
        folder: 'document_images',
        // format: 'pdf',
        resource_type: "auto",
        // stream: true,
        // upload_preset: 'ml_default',
    };
    const result = await cloudinary.uploader.upload(image.filepath, uploadOptions)

    return result.secure_url;
};

exports.uploadPdf = async pdfBuffer => new Promise((resolve, reject) => {
    const uploadOptions = {
        folder: 'certificates',
        format: 'pdf',
        resource_type: "auto",
        stream: true,
    };
    const returnValue = (err, image) => {
        if (err) return reject(err);

        resolve(image.secure_url);
    }

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, returnValue);
    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
})

const parseToObj = (flatBody) => {
    const keys = Object.keys(flatBody);
    return keys.reduce((body, key) => {
        try {
            body[key] = JSON.parse(flatBody[key]);
        } catch (error) {
            body[key] = flatBody[key];
        }
        return body;
    }, {})
}

const validateImage = image => {
    const validImageFormats = config.constants.VALID_IMAGE_FORMATS;
    const maxUploadImageSize = config.constants.MAX_UPLOAD_IMAGE_SIZE;

    // Check if they are all images
    const isValidFormat = validImageFormats.includes(image.originalFilename.split('.')[1]);
    if (!isValidFormat) return `Unsupported image format detected. Images must be in ${validImageFormats.join(', ')}`;

    // Check if they dont exceed the file size
    const isValidSize = image.size <= maxUploadImageSize;
    if (!isValidSize) return `Image max file size exceeded. Expected max file size is ${maxUploadImageSize / 1024} KB.`;

    return null;
}