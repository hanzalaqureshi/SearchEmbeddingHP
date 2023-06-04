const { extractTextFromPDF } = require('./utils/pdfUtils');

const pdfFilePath = './SampleHarryPotter1.pdf';
const maxChunkSize = 500;

extractTextFromPDF(pdfFilePath, maxChunkSize)
  .then(chunks => {
    console.log(`PDF file parsed successfully. Extracted ${chunks.length} chunks.`);
    
    // Access the first two chunks
const firstTwoChunks = chunks.slice(94, 101);
console.log(firstTwoChunks);

    
    // TODO: Pass each chunk to the OpenAI Text Embedding API.
  })
  .catch(err => {
    console.error(err);
  });