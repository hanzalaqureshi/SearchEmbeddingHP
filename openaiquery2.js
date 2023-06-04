const { Configuration, OpenAIApi } = require('openai');
const { PineconeClient } = require('@pinecone-database/pinecone');
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

async function createEmbedding(text) {
  const response = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: [text],
  });

  console.log('Creating Embedding...',);
  try {
    const embeddings = response.data.data.map(embedding => embedding.embedding);
    return embeddings[0];
  } catch (error) {
    console.error(error);
    throw new Error('Error creating OpenAI embedding');
  }
}

async function queryPinecone(vector) {
  await initPinecone(); // initialize Pinecone first
  const index = pinecone.Index('hpembedding');
  const queryRequest = {
    topK: 1,
    vector: vector,
  };
  const queryResponse = await index.query({ queryRequest });

  // console.log('Query Response:', queryResponse);

  if (queryResponse.matches && queryResponse.matches.length > 0) {
    const topMatch = queryResponse.matches[0].id;
    // console.log('Top Match:', topMatch);
    return topMatch;
  } else {
    console.log('No matching data found');
    throw new Error('No matching data found');
  }
}

async function searchHP(text) {
    try {
    const vector = await createEmbedding(text);
    const topMatch = await queryPinecone(vector);
    const context = `You are a Harry Potter Enthusiast and you love helping people, you have read this ${topMatch} from the Harry Potter book.`;
    const prompt = `Read the \n${text}\n and provide a response strictly based on the \n${context}\n. Do not add or remove any information using your own knowledge.`;
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0.6,
      max_tokens: 300,
    });

    const answer = response.data.choices[0].text;
    console.log('Data successfully searched from OpenAI!');
    return {topMatch, answer: answer.trim() };
  } catch (error) {
    console.error(error);
    throw new Error('Error searching data from OpenAI');
  }
}
module.exports = {
  searchHP,
};