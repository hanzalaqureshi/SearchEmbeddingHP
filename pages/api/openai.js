// // Import required modules
// import { Configuration, OpenAIApi } from 'openai';
// import { extractTextFromPDF } from '../../utils/pdfUtils';

// // Create an OpenAI API configuration object with the provided API key
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Initialize an OpenAI API object with the above configuration
// const openai = new OpenAIApi(configuration);

// // Define an asynchronous function that handles incoming HTTP requests
// export default async function handler(req, res) {
//   try {
//     // Get the PDF file path and maximum chunk size from the request body
//     const { pdfFilePath, maxChunkSize } = req.body;

//     // Use the pdfUtils function to extract text from the PDF file and split it into chunks
//     const chunks = await extractTextFromPDF(pdfFilePath, maxChunkSize);

//     // Use the OpenAI API to get vector embeddings for each chunk
//     const vectors = await Promise.all(chunks.map(async (chunk) => {
//       // Call the OpenAI API to get an embedding for the current chunk
//       const embeddingResponse = await openai.createEmbedding({
//         model: 'text-embedding-ada-002',
//         input: chunk, // Use the current chunk as input
//       });

//       // Get the embedding vector from the API response
//       const embedding = response.data.choices[0].text.trim();
//       return embedding;
//     }));

//     // Send the resulting vector embeddings as JSON in the HTTP response
//     res.status(200).json({ data: vectors });
//   } catch (error) {
//     // If an error occurs, log it to the console and send an HTTP 500 response with an error message
//     console.error(error);
//     const message = error.response?.data?.error?.message || 'Failed to generate text with OpenAI';
//     res.status(500).json({ error: message });
//   }
// }

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: 'Hakeemul Ummat Kay Siasi Afkar (Political Thoughts of Maulana Ashraf Ali Thanvi) 24.Durse Tirmidhi (Explanation of famous hadith collection Sunan e Tirmizi) 25. Deeny Madaris ka Nisab wa Nitham 26.',
    });

    const embeddings = response.data.data.map(embedding => embedding.embedding);

    res.status(200).json({ data: JSON.stringify(embeddings) });
  } catch (error) {
    console.error(error);
    const message = error.response?.data?.error?.message || 'Failed to generate text with OpenAI';
    res.status(500).json({ error: message });
  }
}
