const fs = require('fs').promises;
const PdfLib = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')
const fetch = require('node-fetch')

const docSizeAdjustment = 0;

const getMediaFormat = url => {
  const urlArray = url.split('/');
  const lastItem = urlArray[urlArray.length - 1]

  return lastItem.split('.')[1];
}

const getValueOf = (field) => typeof field == 'object' && field.hasOwnProperty('$numberDecimal') ? +field.$numberDecimal : +field;

const getDocumentImage = async (document, url) => {
  const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
  const mediaFormat = getMediaFormat(url);

  switch (mediaFormat) {
    case 'png':
      image = document.embedPng(arrayBuffer)
      break;

    case 'pdf': {
      imageOption = (await document.embedPdf(arrayBuffer, [0]))[0]

      image = await PdfLib.PDFDocument.load(arrayBuffer)
      image.width = imageOption.width;
      image.height = imageOption.height;
      break;
    }

    case 'jpg':
    case 'jpeg':
      image = document.embedJpg(arrayBuffer)
      break;

    default:
      throw new Error(`file type: ${mediaFormat} not supported`)
  }

  return image;
}

const centreImageInPDF = (page, image, dimensions) => {
  page.drawImage(image, {
    x: (page.getWidth() / 2) - (dimensions.width / 2),
    y: (page.getHeight() / 2) - (dimensions.height / 2),
    width: dimensions.width,
    height: dimensions.height,
  });
}

const TextBoxConfigBuilder = (multiplyingFactor) => {
  const getEquivalenceOf = field => (getValueOf(field) + docSizeAdjustment) * multiplyingFactor;
  const getFontObject = async (document, font) => {
    const fontSamples = {
      "Nunito": '/fonts/Nunito_Sans/NunitoSans-Bold.ttf',
      "PT Serif": '/fonts/PT_Serif/PTSerif-Bold.ttf',
      "Open Sans": '/fonts/Open_Sans/static/OpenSans/OpenSans-Bold.ttf',
      "Montserrat": '/fonts/Montserrat/static/Montserrat-Bold.ttf',
      "Merriweather": '/fonts/Merriweather_Sans/static/MerriweatherSans-Bold.ttf',
      "Martian Mono": '/fonts/Martian_Mono/static/MartianMono/MartianMono-Bold.ttf',
      "Libre Caslon Text": '/fonts/Libre_Caslon_Text/LibreCaslonText-Bold.ttf',
      "Libre Baskerville": '/fonts/Libre_Baskerville/LibreBaskerville-Bold.ttf',
      "Lato": '/fonts/Lato/Lato-Bold.ttf',
      "Fira Sans": '/fonts/Fira_Sans/FiraSans-Bold.ttf',
      "EB Garamond": '/fonts/EB_Garamond/static/EBGaramond-Bold.ttf',
      "Dosis": '/fonts/Dosis/static/Dosis-Bold.ttf',
    };

    const fontUrl = fontSamples[font] || '/fonts/Nunito_Sans/NunitoSans-Bold.ttf';
    const url = __dirname + fontUrl;

    const fontBytes = await fs.readFile(url);
    document.registerFontkit(fontkit);

    return document.embedFont(fontBytes);
  }
  const getOneBuild = async (fieldObject) => {
    const params = {
      fontSize: getEquivalenceOf(fieldObject.fontSize),
      fieldName: fieldObject.fieldName,
      fontFamily: fieldObject.fontFamily,
      width: getEquivalenceOf(fieldObject.width),
      height: getEquivalenceOf(fieldObject.height),
      x: getEquivalenceOf(fieldObject.x),
      //  Since pdf-lib starts from the bottom while frontend starts from the top
      y: getEquivalenceOf(fieldObject.bottom),
    }

    return {
      fieldName: params.fieldName,

      getOptions: async (document, client) => {
        const customFont = await getFontObject(document, params.fontFamily);
        let textWidth = customFont.widthOfTextAtSize(client[params.fieldName], params.fontSize);
        let fontSize = params.fontSize;

        while (params.width < textWidth) {
          fontSize--;
          textWidth = customFont.widthOfTextAtSize(client[params.fieldName], fontSize);
        }

        const textHeight = customFont.heightAtSize(fontSize);
        return {
          x: params.x + (params.width / 2) - (textWidth / 2),
          y: params.y + (params.height / 2) - (textHeight / 2),
          font: customFont,
          size: fontSize,
          color: PdfLib.rgb(0, 0, 0),
          lineHeight: fontSize,
          opacity: 1,
        }
      },
    }
  }

  return {
    build: fields => Promise.all(fields.map(getOneBuild)),
  }
}

const GeneratePDFDocument = async (docOptions) => {
  const document = await PdfLib.PDFDocument.create();
  let image = null;
  let options = docOptions.image;
  if (!image) {
    image = await getDocumentImage(document, options.src);
    if (!options.width) options.width = image.width;
    if (!options.height) options.height = image.height;
  }

  return {
    document,
    getOptions: () => options,
    addNewPage: async () => {
      let PDFPage;
      if (image instanceof PdfLib.PDFImage) {
        PDFPage = document.addPage([
          options.width + docSizeAdjustment,
          options.height + docSizeAdjustment
        ]);

        centreImageInPDF(PDFPage, image, options);
      } else {
        const page = (await document.copyPages(image, [0]))[0]
        PDFPage = document.addPage(page)
      }

      return PDFPage;
    },

    addMetaData: () => {
      // document.setTitle('Certificate')
      document.setAuthor(docOptions.orgName)
      document.setSubject('Certificate')
      // document.setKeywords(['eggs', 'wall', 'fall', 'king', 'horses', 'men'])
      document.setProducer('Docuplier')
      document.setCreator('Docuplier (https://docuplier.com)')
      document.setCreationDate(new Date(docOptions.createdAt))
      document.setModificationDate(new Date())
    },

    build: () => document.save(),
  }

}

/**
 * 
 * @param {object} documentConfiguration - document record
 * 
 * @returns {Promise<Uint8Array>} pdf in Uint8Array
 */
module.exports = async (documentConfiguration) => {
  const pdfDoc = await GeneratePDFDocument(documentConfiguration);
  pdfDoc.addMetaData();

  documentConfiguration.image = pdfDoc.getOptions();
  const multiplyingFactor = documentConfiguration.image.width / documentConfiguration.image.renderedWidth;

  const textBoxConfigBuilder = TextBoxConfigBuilder(multiplyingFactor);
  const fieldParams = await textBoxConfigBuilder.build(documentConfiguration.fields);

  for (let i = 0; i < documentConfiguration.clients.length; i++) {
    const client = documentConfiguration.clients[i];
    const page = await pdfDoc.addNewPage();

    for (let j = 0; j < fieldParams.length; j++) {
      const textBoxConfig = fieldParams[j];

      page.drawText(
        client[textBoxConfig.fieldName],
        await textBoxConfig.getOptions(pdfDoc.document, client)
      )
    }
  }

  return pdfDoc.build();
}