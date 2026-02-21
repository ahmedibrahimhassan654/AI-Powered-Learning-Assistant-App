/**
 * Splits text into chunks for better AI processing.
 *
 * @param {string} text - Full text to chunk
 * @param {number} targetWordsPerChunk - Target size per chunk in words
 * @param {number} overlapWords - Number of words to overlap between chunks
 * @returns {Array} - Array of chunk objects
 */
export const chunkText = (
  text,
  targetWordsPerChunk = 500,
  overlapWords = 50,
) => {
  if (!text || typeof text !== "string") return [];

  // 1. Clean text while preserving paragraph structure
  const cleanText = text.replace(/ +/g, " ").trim();

  // 2. Try to split by paragraphs (single or double new lines)
  const paragraphs = cleanText.split(/\n+/);
  const chunks = [];
  let currentChunkWords = [];

  const addChunk = (words) => {
    if (words.length === 0) return;
    chunks.push({
      content: words.join(" "),
      chunkIndex: chunks.length,
      pageNumber: 0,
      wordCount: words.length,
    });
  };

  const splitLargeParagraph = (paragraphWords) => {
    let i = 0;
    while (i < paragraphWords.length) {
      const subWords = paragraphWords.slice(i, i + targetWordsPerChunk);
      addChunk(subWords);
      i += targetWordsPerChunk - overlapWords;
      if (targetWordsPerChunk <= overlapWords) break; // Defensive
    }
  };

  paragraphs.forEach((paragraph) => {
    const pWords = paragraph
      .trim()
      .split(" ")
      .filter((w) => w !== "");
    if (pWords.length === 0) return;

    // 3. If single paragraph exceeds chunk size, split it by words
    if (pWords.length > targetWordsPerChunk) {
      // If we have words in currentChunk, save them first
      if (currentChunkWords.length > 0) {
        addChunk(currentChunkWords);
        currentChunkWords = [];
      }
      splitLargeParagraph(pWords);

      // Setup overlap for next paragraph from the last sub-chunk
      const lastChunk = chunks[chunks.length - 1];
      if (lastChunk) {
        const lastWords = lastChunk.content.split(" ");
        currentChunkWords = lastWords.slice(-overlapWords);
      }
      return;
    }

    // 4. If adding this paragraph exceeds chunk size, save current chunk
    if (currentChunkWords.length + pWords.length > targetWordsPerChunk) {
      addChunk(currentChunkWords);

      // 5. Create overlap from previous chunk
      currentChunkWords = currentChunkWords.slice(-overlapWords);
    }

    // 6. Add paragraph to current chunk
    currentChunkWords = currentChunkWords.concat(pWords);
  });

  // 7. Add the last chunk
  if (currentChunkWords.length > 0) {
    addChunk(currentChunkWords);
  }

  // 8. Fallback: if no chunks created (e.g. text only had whitespace), split by words
  if (chunks.length === 0 && cleanText.length > 0) {
    const allWords = cleanText.split(" ").filter((w) => w !== "");
    splitLargeParagraph(allWords);
  }

  return chunks;
};

/**
 * Finds the most relevant chunks based on a query using simple keyword matching.
 *
 * @param {Array} chunks - Array of chunk objects
 * @param {string} query - The search query
 * @param {number} maxChunk - Maximum number of relevant chunks to return
 * @returns {Array} - Top matching chunk objects
 */
export const findRelevantChunks = (chunks, query, maxChunk = 3) => {
  if (!query || !chunks || chunks.length === 0) return [];

  const queryTerms = query.toLowerCase().trim().split(/\s+/);

  const scoredChunks = chunks.map((chunk) => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();

    queryTerms.forEach((term) => {
      if (term.length < 2) return; // Ignore single characters

      // Basic frequency counting
      const regex = new RegExp(
        term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g",
      );
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    return { ...chunk, relevanceScore: score };
  });

  // Sort by score descending and take the top N
  return scoredChunks
    .filter((chunk) => chunk.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxChunk);
};
