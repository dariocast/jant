import { initDb, prisma } from './dist/db.js';
import { generateEmbedding, float32ArrayToBuffer, bufferToFloat32Array, cosineSimilarity } from './dist/embeddings.js';
import { handleMCPCall } from './dist/mcp.js';

async function runTests() {
  console.log('--- Testing JANT Backend Core ---');
  await initDb();

  // Test 1: Generate Embedding
  console.log('1. Testing Transformers.js embedding...');
  const text1 = 'Buy groceries and milk tonight';
  const emb1 = await generateEmbedding(text1);
  console.log('Embedding 1 dimension:', emb1.length);

  const text2 = 'Supermarket shopping list with dairy products';
  const emb2 = await generateEmbedding(text2);
  const sim = cosineSimilarity(emb1, emb2);
  console.log(`Cosine similarity between "${text1}" and "${text2}":`, sim.toFixed(4));

  // Test 2: MCP Tool Calls
  console.log('2. Testing MCP Tools: create_item...');
  const createRes = await handleMCPCall({
    method: 'tools/call',
    params: {
      name: 'create_item',
      arguments: {
        title: 'Learn Flutter & Bloc',
        content: 'Build state management architecture with offline SQLite synchronization',
        color: '#E0F2FE',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        tags: ['coding', 'mobile'],
      },
    },
  });
  console.log('MCP create_item result:', createRes.result ? 'SUCCESS' : 'ERROR', createRes);

  const createdItem = JSON.parse(createRes.result.content[0].text).item;

  console.log('3. Testing MCP Tools: toggle_timer...');
  const timerRes = await handleMCPCall({
    method: 'tools/call',
    params: {
      name: 'toggle_timer',
      arguments: { id: createdItem.id },
    },
  });
  console.log('MCP toggle_timer result:', JSON.parse(timerRes.result.content[0].text));

  console.log('4. Testing MCP Tools: semantic_search...');
  const searchRes = await handleMCPCall({
    method: 'tools/call',
    params: {
      name: 'semantic_search',
      arguments: { query: 'mobile app development state cache' },
    },
  });
  console.log('MCP semantic_search result:', JSON.parse(searchRes.result.content[0].text));

  console.log('5. Testing MCP Tools: get_productivity_stats...');
  const statsRes = await handleMCPCall({
    method: 'tools/call',
    params: {
      name: 'get_productivity_stats',
      arguments: {},
    },
  });
  console.log('MCP stats result:', JSON.parse(statsRes.result.content[0].text));

  // Clean up test item
  await prisma.item.delete({ where: { id: createdItem.id } });
  await prisma.$disconnect();
  console.log('--- All Backend Tests Passed Successfully! ---');
}

runTests().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
