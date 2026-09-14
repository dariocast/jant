import { pipeline } from '@xenova/transformers';

let extractor: any = null;
let isInitializing = false;

export async function getEmbeddingPipeline() {
  if (extractor) return extractor;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return extractor;
  }

  try {
    isInitializing = true;
    console.log('[Embeddings] Loading Transformers.js model (all-MiniLM-L6-v2)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
    console.log('[Embeddings] Model loaded successfully');
  } catch (err) {
    console.warn('[Embeddings] Failed to load Hugging Face model online, will use resilient fallback embeddings:', err);
  } finally {
    isInitializing = false;
  }

  return extractor;
}

/**
 * Generates an embedding vector for a given text.
 * Returns a Float32Array (384 dimensions).
 */
export async function generateEmbedding(text: string): Promise<Float32Array> {
  const cleanText = (text || '').trim();
  if (!cleanText) {
    return new Float32Array(384);
  }

  try {
    const pipe = await getEmbeddingPipeline();
    if (pipe) {
      const output = await pipe(cleanText, { pooling: 'mean', normalize: true });
      return new Float32Array(output.data);
    }
  } catch (error) {
    console.error('[Embeddings] Pipeline extraction error:', error);
  }

  // Resilient fallback embedding if model is loading or network is unavailable
  return fallbackEmbedding(cleanText);
}

function fallbackEmbedding(text: string): Float32Array {
  const dim = 384;
  const vector = new Float32Array(dim);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
    const index = Math.abs((hash + i * 31) % dim);
    vector[index] += 1.0;
  }
  // Normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] /= norm;
    }
  }
  return vector;
}

/**
 * Converts Float32Array to Buffer/Uint8Array for SQLite BLOB storage in Prisma.
 */
export function float32ArrayToBuffer(arr: Float32Array): any {
  return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
}

/**
 * Converts Uint8Array/Buffer from SQLite BLOB to Float32Array.
 */
export function bufferToFloat32Array(buf: Uint8Array | Buffer): Float32Array {
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Float32Array(arrayBuffer);
}

/**
 * Calculates Cosine Similarity between two Float32Arrays.
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
