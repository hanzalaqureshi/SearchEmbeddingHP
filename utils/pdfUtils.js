const pdfParse = require('pdf-parse');
const fs = require('fs');
const { promisify } = require('util');

const extractTextFromPDF = async (pdfFilePath, maxChunkSize) => {
  const PUNCTUATION_REGEX = /[\.\?\!]/;

  try {
    const data = await fs.promises.readFile(pdfFilePath);
    const pdfData = await pdfParse(data);
    const text = pdfData.text.replace(/\s+/g, ' ').replace(/'/g, '').trim();
    const pages = pdfData.numpages;
    const chunks = [];

    for (let pageNum = 1; pageNum <= pages; pageNum++) {
      const pageStart = text.indexOf(`Page ${pageNum} of`);
      let pageEnd = text.indexOf(`Page ${pageNum + 1} of`);
      if (pageEnd === -1) {
        pageEnd = text.length;
      }
      const pageText = text.slice(pageStart, pageEnd);

      let startIndex = 0;

      while (startIndex < pageText.length) {
        let endIndex = startIndex + maxChunkSize;

        // If the endIndex is within the middle of a word, move it to the end of the word
        if (pageText[endIndex] !== ' ' && endIndex < pageText.length - 1) {
          endIndex = pageText.lastIndexOf(' ', endIndex);
        }

        // If we couldn't find a space, just use the maxChunkSize
        if (endIndex < startIndex) {
          endIndex = startIndex + maxChunkSize;
        }

        // Find the last punctuation mark in the chunk
        let lastPunctuationIndex = pageText.slice(startIndex, endIndex).search(PUNCTUATION_REGEX);
        if (lastPunctuationIndex === -1) {
          // If we didn't find any punctuation in the chunk, try to find the next punctuation mark
          // starting from the endIndex and working backwards
          lastPunctuationIndex = pageText.slice(endIndex).search(PUNCTUATION_REGEX);
          if (lastPunctuationIndex !== -1) {
            endIndex = endIndex + lastPunctuationIndex + 1;
          }
        } else {
          endIndex = startIndex + lastPunctuationIndex + 1;
        }

        let chunk = pageText.slice(startIndex, endIndex).trim();

        // If the chunk length is greater than maxChunkSize, split it into smaller chunks
        while (chunk.length > maxChunkSize) {
          const splitIndex = chunk.lastIndexOf(' ', maxChunkSize);
          const smallerChunk = chunk.slice(0, splitIndex);
          chunks.push(smallerChunk);
          chunk = chunk.slice(splitIndex + 1);
        }

        chunks.push(chunk);

        startIndex = endIndex;
      }
    }

     // Combine consecutive chunks that are less than maxChunkSize
     const combinedChunks = [];
     let currentChunk = "";
     for (let chunk of chunks) {
       if ((currentChunk + chunk).length > maxChunkSize) {
         combinedChunks.push(currentChunk.trim());
         currentChunk = chunk;
       } else {
         currentChunk += chunk + " ";
       }
     }
     if (currentChunk) {
       combinedChunks.push(currentChunk.trim());
     }

     return combinedChunks;
    } catch (err) {
      console.error(err);
    }
  };

module.exports = {
  extractTextFromPDF,
};