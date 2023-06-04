const { Configuration, OpenAIApi } = require('openai');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { extractTextFromPDF } = require('./utils/pdfUtils');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let pinecone;

async function initPinecone() {
  pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENV,
    apiKey: process.env.PINECONE_API,
  });
}

async function createEmbeddingsAndIndexInPinecone() {
  try {

    await initPinecone(); // call initPinecone function to initialize Pinecone client

    // Get chunks of text from PDF file
    const pdfFilePath = './SampleHarryPotter1.pdf';
    const maxChunkSize = 300;
    const chunks = await extractTextFromPDF(pdfFilePath, maxChunkSize);
    const index = await pinecone.Index('hpembedding')


    // Create and index embedding for each chunk
    let counter = 0;
    let vectors =[];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].toString().replace(/[^\w\s.]/gi, '');
      const embeddingId = `embedding${i}`;
      const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: [chunk],
      });

      const embedding = response.data.data.map(embedding => embedding.embedding);
    
      vectors.push({
        id: chunk,
        values: embedding,
      });
      counter++;

      if (counter % 50 === 0 || i === chunks.length - 1) {
        console.log(`Upserting ${counter - 49}-${counter}...`);
        const upsertRequest = {
          vectors,
        };
        const res = await index.upsert({ upsertRequest });
        console.log(`Upserted ${counter - 49}-${counter}`);
        vectors = [];
        console.log('Pausing for 5 seconds before continuing...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    return chunks

  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = {
  createEmbeddingsAndIndexInPinecone,
  initPinecone,
};