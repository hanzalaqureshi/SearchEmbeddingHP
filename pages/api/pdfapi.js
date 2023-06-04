const { extractTextFromPDF } = require('./utils/pdfUtils');

const pdfFilePath = '/Users/hq/Downloads/english_quraan_mufti_taqi.pdf';

extractTextFromPDF(pdfFilePath)
  .then((textContent) => {
    console.log(textContent);
  })
  .catch((err) => {
    console.error(err);
  });