const text = `Is Harry Wealthy?`;

/* Hide all code below this line */
const { searchHP } = require('./openaiquery2');
async function test() {
      
  try {
    const result = await searchHP(text);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
test();