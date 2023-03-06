const PdfLib = require('pdf-lib');
const fetch = require('node-fetch')

const docSizeAdjustment = 50;

const isPNGImage = url => {
  const urlArray = url.split('/');
  const lastItem = urlArray[urlArray.length - 1]

  return lastItem.split('.')[1] == 'png'
}

const getValueOf = (field) => +field.$numberDecimal;

const getDocumentImage = async (document, url) => {
  const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
  const check = isPNGImage(url);

  return check
    ? document.embedPng(arrayBuffer)
    : document.embedJpg(arrayBuffer);
}

const centreImageInPDF = (page, image, dimensions) => {
  page.drawImage(image, {
    x: (page.getWidth() / 2) - (dimensions.width / 2),
    y: (page.getHeight() / 2) - (dimensions.height / 2),
    width: dimensions.width,
    height: dimensions.height,
  });
}

const buildPageWithImage = async (document, doc) => {
  const PDFPage = document.addPage([doc.width + docSizeAdjustment, doc.height + docSizeAdjustment]);
  const img = await getDocumentImage(document, doc.src);
  centreImageInPDF(PDFPage, img, doc);

  return PDFPage;
}

/**
 * 
 * @param {{
 * width: number,
 * height: number,
 * imageUrl:string,
 * }} certificateOptions 
 * 
 * @returns Promise<void>
 */
module.exports = async (doc, fields, clients) => {
  const document = await PdfLib.PDFDocument.create();

  const timesRomanFont = await document.embedFont(PdfLib.StandardFonts.TimesRoman);
  for (let i = 0; i < clients.length; i++) {
    let client = clients[i];

    let fontSize = fields[0].fontSize;
    let fieldName = fields[0].fieldName;
    let textWidth = timesRomanFont.widthOfTextAtSize(client[fieldName], fontSize);
    while (+fields[0].width < textWidth) {
      fontSize--;
      textWidth = timesRomanFont.widthOfTextAtSize(client[fieldName], fontSize);
    }
    const page = await buildPageWithImage(document, doc);
    page.drawText(
      client[fieldName],
      {
        x: +fields[0].x + docSizeAdjustment,
        y: +fields[0].y + docSizeAdjustment,
        font: timesRomanFont,
        size: fontSize,
        color: PdfLib.rgb(0, 0, 0),
        lineHeight: fontSize,
        opacity: 1,
      },
    )
  }

  return document.saveAsBase64({ dataUri: true });
}