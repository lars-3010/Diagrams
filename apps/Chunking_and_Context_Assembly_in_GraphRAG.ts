import React, { useState } from 'react';
import { Scissors, FileText, Book, ArrowRight, ChevronDown, ChevronUp, Settings, AlertCircle, Zap, CheckSquare, Copy, BookOpen, Code } from 'lucide-react';

const ChunkingStrategiesVisualization = () => {
  const [activeTab, setActiveTab] = useState('chunking');
  const [expandedSection, setExpandedSection] = useState('whyChunk');
  const [chunkSize, setChunkSize] = useState(500);
  const [overlap, setOverlap] = useState(100);
  const [boundaryType, setBoundaryType] = useState('sentence');
  
  const [showPreview, setShowPreview] = useState(true);
  
  const sampleDocument = `# Retrieval Augmented Generation

RAG (Retrieval Augmented Generation) is a technique that enhances large language models by retrieving external knowledge before generating responses.

## How RAG Works

The core components of RAG are:

1. **Indexing Pipeline**: Documents are processed, chunked, and converted to vector embeddings for efficient retrieval.

2. **Retrieval System**: When a query is received, the system finds relevant information from the indexed documents.

3. **Augmentation**: Retrieved information is formatted and included in the prompt to the LLM.

4. **Generation**: The LLM uses both the query and retrieved context to generate a response.

## Benefits of RAG

RAG offers several advantages over traditional LLM approaches:

- **Accuracy**: Reduces hallucinations by grounding responses in retrieved facts
- **Up-to-date Information**: Can access information beyond the LLM's training cutoff
- **Customization**: Tailors responses based on specific knowledge sources
- **Transparency**: Citations can link back to source documents

## Advanced RAG Techniques

### GraphRAG

Graph-based RAG enhances retrieval by incorporating knowledge graph structures. Instead of treating documents as independent, GraphRAG models relationships between them.

Key features include:
- Traversing connections between related documents
- Following semantic relationship types
- Multi-hop reasoning across connected information

### Reranking

After initial retrieval, documents can be reranked using:
- More complex relevance models
- Cross-document information analysis
- Query-specific criteria`;

  const chunkDocument = () => {
    if (!sampleDocument) return [];
    
    // Simple chunking implementation
    const chunks = [];
    const lines = sampleDocument.split('\n');
    
    let currentChunk = '';
    let currentSize = 0;
    
    // Process line by line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineSize = line.length + 1; // +1 for newline
      
      // Check if adding this line would exceed chunk size
      if (currentSize + lineSize > chunkSize && currentChunk.trim().length > 0) {
        // Respect boundaries
        if (boundaryType === 'paragraph' && !line.trim() === '') {
          // End chunk at paragraph boundary
          chunks.push(currentChunk);
          currentChunk = line + '\n';
          currentSize = lineSize;
        } else if (boundaryType === 'heading' && line.startsWith('#')) {
          // End chunk at heading
          chunks.push(currentChunk);
          currentChunk = line + '\n';
          currentSize = lineSize;
        } else if (boundaryType === 'sentence' && 
                  (line.endsWith('.') || line.endsWith('!') || line.endsWith('?'))) {
          // End chunk at sentence boundary
          chunks.push(currentChunk);
          currentChunk = line + '\n';
          currentSize = lineSize;
        } else {
          // Just split at size
          chunks.push(currentChunk);
          currentChunk = line + '\n';
          currentSize = lineSize;
        }
      } else {
        // Add to current chunk
        currentChunk += line + '\n';
        currentSize += lineSize;
      }
    }
    
    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk);
    }
    
    // Apply overlap
    if (overlap > 0 && chunks.length > 1) {
      const overlapChunks = [];
      
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          // First chunk stays as is
          overlapChunks.push(chunks[i]);
        } else {
          // For subsequent chunks, include overlap from previous chunk
          const prevChunk = chunks[i-1];
          // Extract overlap from end of previous chunk
          const overlapText = prevChunk.length > overlap 
            ? prevChunk.slice(prevChunk.length - overlap) 
            : prevChunk;
          
          // Create new chunk with overlap
          overlapChunks.push(overlapText + chunks[i]);
        }
      }
      
      return overlapChunks;
    }
    
    return chunks;
  };
  
  const chunks = chunkDocument();
  
  // Context assembly example
  const queryExample = "How does GraphRAG improve retrieval?";
  
  const assembledContext = `SYSTEM: You are Jarvis, an intelligent assistant with knowledge about artificial intelligence and retrieval systems. Answer the user's question based on the provided context. If the context doesn't contain relevant information, acknowledge this and provide a general response. Cite sources using [Document] notation.

CONTEXT:
[Document 1: RAG Techniques]
${chunks[chunks.length > 2 ? 2 : 0]}

[Document 2: RAG Overview]
${chunks[0]}

RELATED INFORMATION:
- Document 1 contains information about GraphRAG implementation
- Document 2 is connected to Document 1 through "implements" relationship
- Both documents share the "retrieval" tag

USER QUERY: ${queryExample}

INSTRUCTIONS:
1. Answer based on the provided context
2. Cite sources using [Document X] format when referencing information
3. Be concise and clear in your response
4. If the context doesn't fully answer the question, acknowledge this`;

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="text-xl font-bold mb-2">Chunking and Context Assembly in GraphRAG</h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('chunking')}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
              activeTab === 'chunking' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Scissors size={16} />
            Chunking Strategies
          </button>
          <button
            onClick={() => setActiveTab('context')}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
              activeTab === 'context' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Book size={16} />
            Context Assembly
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
              activeTab === 'code' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Code size={16} />
            Implementation
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'chunking' && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {/* Chunking concepts section */}
              <div className="mb-4">
                <div 
                  className="flex justify-between items-center cursor-pointer bg-gray-100 p-2 rounded"
                  onClick={() => toggleSection('whyChunk')}
                >
                  <h3 className="font-semibold flex items-center gap-1">
                    <FileText size={16} className="text-blue-500" />
                    Why Chunk Documents?
                  </h3>
                  {expandedSection === 'whyChunk' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSection === 'whyChunk' && (
                  <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                    <p className="mb-2">
                      Chunking is a critical preprocessing step in RAG systems where documents are broken into smaller pieces for more precise retrieval.
                    </p>
                    
                    <div className="mt-3 bg-white p-2 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-800">Key benefits of chunking:</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>More <strong>granular retrieval</strong> - finds specific relevant passages rather than entire documents</li>
                        <li>More <strong>efficient vector storage</strong> - shorter text produces better embeddings</li>
                        <li>Better <strong>context utilization</strong> - fits more relevant content within LLM context window</li>
                        <li>Improved <strong>relevance ranking</strong> - reduces noise from irrelevant portions of documents</li>
                      </ul>
                    </div>
                    
                    <div className="mt-3">
                      <div className="font-medium mb-1">Challenges:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Chunks may <strong>break coherent thoughts</strong> if not aligned with semantic boundaries</li>
                        <li><strong>Information loss</strong> at chunk boundaries</li>
                        <li>Need for <strong>metadata preservation</strong> (source doc, position, relationships)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div 
                  className="flex justify-between items-center cursor-pointer bg-gray-100 p-2 rounded"
                  onClick={() => toggleSection('strategies')}
                >
                  <h3 className="font-semibold flex items-center gap-1">
                    <Settings size={16} className="text-purple-500" />
                    Chunking Strategies
                  </h3>
                  {expandedSection === 'strategies' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSection === 'strategies' && (
                  <div className="mt-2 p-3 bg-purple-50 rounded text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-2 rounded border border-purple-200">
                        <h4 className="font-medium text-purple-800">Size-Based Chunking:</h4>
                        <p className="mt-1">Splitting documents into fixed-size chunks (characters or tokens).</p>
                        <div className="mt-1 text-xs font-medium text-purple-700">Pros:</div>
                        <ul className="list-disc pl-4 text-xs">
                          <li>Simple to implement</li>
                          <li>Consistent chunk sizes</li>
                        </ul>
                        <div className="mt-1 text-xs font-medium text-purple-700">Cons:</div>
                        <ul className="list-disc pl-4 text-xs">
                          <li>May split coherent ideas</li>
                          <li>No respect for document structure</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-purple-200">
                        <h4 className="font-medium text-purple-800">Semantic Chunking:</h4>
                        <p className="mt-1">Respecting semantic boundaries like paragraphs, sections, or headings.</p>
                        <div className="mt-1 text-xs font-medium text-purple-700">Pros:</div>
                        <ul className="list-disc pl-4 text-xs">
                          <li>Preserves coherent ideas</li>
                          <li>Respects document structure</li>
                        </ul>
                        <div className="mt-1 text-xs font-medium text-purple-700">Cons:</div>
                        <ul className="list-disc pl-4 text-xs">
                          <li>Variable chunk sizes</li>
                          <li>More complex implementation</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-white p-2 rounded border border-purple-200">
                      <h4 className="font-medium text-purple-800">Hybrid Approaches in Jarvis:</h4>
                      <p className="mt-1">
                        Jarvis combines both approaches with a "maximum size with smart boundaries" strategy:
                      </p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Set maximum chunk size (e.g., 1000 characters)</li>
                        <li>Try to break at semantic boundaries (paragraph, heading, sentence)</li>
                        <li>Add overlap between chunks to preserve context</li>
                        <li>Store relationship between chunks and source document</li>
                      </ul>
                    </div>
                    
                    <div className="mt-3 text-xs italic text-purple-600">
                      This approach balances precise retrieval with semantic coherence.
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div 
                  className="flex justify-between items-center cursor-pointer bg-gray-100 p-2 rounded"
                  onClick={() => toggleSection('overlap')}
                >
                  <h3 className="font-semibold flex items-center gap-1">
                    <AlertCircle size={16} className="text-orange-500" />
                    Chunk Overlap and Boundaries
                  </h3>
                  {expandedSection === 'overlap' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSection === 'overlap' && (
                  <div className="mt-2 p-3 bg-orange-50 rounded text-sm">
                    <div className="mb-3">
                      <h4 className="font-medium text-orange-800 mb-2">Chunk Overlap:</h4>
                      <div className="bg-white p-2 rounded border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-blue-100 border border-blue-300 rounded p-1 text-xs">
                            Chunk A: ...end of chunk A
                          </div>
                          <ArrowRight size={12} className="text-orange-500" />
                          <div className="bg-green-100 border border-green-300 rounded p-1 text-xs">
                            Chunk B: end of chunk A...start of chunk B
                          </div>
                        </div>
                        <p className="text-xs">
                          Overlap ensures information that spans chunk boundaries isn't lost. It's especially important for preserving context between chunks.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-orange-800 mb-2">Smart Boundaries:</h4>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-orange-100">
                            <th className="border border-orange-200 p-1">Boundary Type</th>
                            <th className="border border-orange-200 p-1">Description</th>
                            <th className="border border-orange-200 p-1">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-orange-200 p-1 font-medium">Heading</td>
                            <td className="border border-orange-200 p-1">Break at heading markers</td>
                            <td className="border border-orange-200 p-1">
                              <code># Heading</code> or <code>## Subheading</code>
                            </td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-orange-200 p-1 font-medium">Paragraph</td>
                            <td className="border border-orange-200 p-1">Break at empty lines</td>
                            <td className="border border-orange-200 p-1">
                              <code>Paragraph 1\n\nParagraph 2</code>
                            </td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-orange-200 p-1 font-medium">Sentence</td>
                            <td className="border border-orange-200 p-1">Break at sentence-ending punctuation</td>
                            <td className="border border-orange-200 p-1">
                              <code>Sentence one. Sentence two.</code>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-white p-2 rounded border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-1">Special Consideration for GraphRAG:</h4>
                      <p className="text-xs">
                        In GraphRAG systems like Jarvis, chunks preserve metadata about:
                      </p>
                      <ul className="list-disc pl-4 text-xs mt-1">
                        <li>Source document identification</li>
                        <li>Position within source document</li>
                        <li>Hierarchical structure (e.g., section within chapter)</li>
                        <li>Relationships to other chunks and documents</li>
                      </ul>
                      <p className="text-xs mt-1 font-medium">
                        This relationship preservation is what elevates GraphRAG above basic RAG systems.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div 
                  className="flex justify-between items-center cursor-pointer bg-gray-100 p-2 rounded"
                  onClick={() => toggleSection('jarvis')}
                >
                  <h3 className="font-semibold flex items-center gap-1">
                    <Zap size={16} className="text-green-500" />
                    Jarvis Implementation
                  </h3>
                  {expandedSection === 'jarvis' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSection === 'jarvis' && (
                  <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                    <div className="mb-3 font-medium text-green-800">
                      Jarvis implements a sophisticated chunking system in the EmbeddingService:
                    </div>
                    
                    <div className="bg-white p-2 rounded border border-green-200 mb-3">
                      <div className="font-medium text-green-800 mb-1">Core Features:</div>
                      <ul className="list-disc pl-5 text-xs space-y-1">
                        <li>Dynamic chunk sizes based on content complexity</li>
                        <li>Default overlap of 200 characters between chunks</li>
                        <li>Smart boundary detection prioritizing:
                          <ol className="list-decimal pl-4 mt-1">
                            <li>Heading boundaries (# heading)</li>
                            <li>Paragraph boundaries (blank lines)</li>
                            <li>Sentence boundaries (., !, ?)</li>
                          </ol>
                        </li>
                        <li>Minimum chunk size enforcement to avoid tiny chunks</li>
                        <li>Special handling for structured data (YAML frontmatter, code blocks)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-2 rounded border border-green-200">
                      <div className="font-medium text-green-800 mb-1">Neo4j Storage Model:</div>
                      <div className="text-xs">
                        <p>Each chunk is stored as a <code>Chunk</code> node with:</p>
                        <ul className="list-disc pl-4 mt-1">
                          <li>Unique ID and text content</li>
                          <li>Vector embedding (384 dimensions)</li>
                          <li>Start and end positions in source</li>
                          <li><code>HAS_CHUNK</code> relationship to its parent <code>Note</code> node</li>
                          <li>References to previous/next chunks via <code>NEXT_CHUNK</code> relationships</li>
                        </ul>
                        
                        <div className="mt-2">
                          <p>This enables both:</p>
                          <ol className="list-decimal pl-4 mt-1">
                            <li>Direct semantic search on chunks for granular retrieval</li>
                            <li>Graph traversal to related chunks and documents</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-1/2">
              {/* Chunking visualization/configuration section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Chunking Configuration</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <label>Chunk Size (characters)</label>
                    <span className="font-mono">{chunkSize}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="100"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <label>Overlap (characters)</label>
                    <span className="font-mono">{overlap}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="20"
                    value={overlap}
                    onChange={(e) => setOverlap(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="text-sm mb-1">Boundary Type</div>
                  <div className="flex gap-2">
                    <button
                      className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                        boundaryType === 'sentence' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      onClick={() => setBoundaryType('sentence')}
                    >
                      <CheckSquare size={12} />
                      Sentence
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                        boundaryType === 'paragraph' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      onClick={() => setBoundaryType('paragraph')}
                    >
                      <CheckSquare size={12} />
                      Paragraph
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                        boundaryType === 'heading' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      onClick={() => setBoundaryType('heading')}
                    >
                      <CheckSquare size={12} />
                      Heading
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Document Preview</h4>
                    <button
                      className="text-xs flex items-center gap-1 text-blue-600"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Hide' : 'Show'} Document
                      {showPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                  
                  {showPreview && (
                    <div className="mb-3 text-xs border border-gray-200 rounded bg-gray-50 p-2 max-h-40 overflow-auto">
                      <pre className="whitespace-pre-wrap">{sampleDocument}</pre>
                    </div>
                  )}
                  
                  <h4 className="font-medium mb-2">Resulting Chunks ({chunks.length})</h4>
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {chunks.map((chunk, index) => (
                      <div key={index} className="border border-gray-200 rounded p-2 text-xs bg-white">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Chunk {index + 1}</span>
                          <span className="text-gray-500">{chunk.length} chars</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-1 rounded max-h-32 overflow-auto">
                          {chunk}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'context' && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Context Assembly Process</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ol className="space-y-6">
                  <li className="relative pl-8">
                    <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full">1</div>
                    <div>
                      <h4 className="font-medium">Document Retrieval</h4>
                      <p className="text-sm mt-1">
                        Retrieve relevant documents using hybrid search and graph traversal. GraphRAG enhances this step by following semantic relationships between documents.
                      </p>
                    </div>
                  </li>
                  
                  <li className="relative pl-8">
                    <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full">2</div>
                    <div>
                      <h4 className="font-medium">Relevance Ranking</h4>
                      <p className="text-sm mt-1">
                        Rank retrieved documents by combined relevance score from vector similarity, keyword matching, and graph proximity.
                      </p>
                      <div className="mt-2 bg-white rounded p-2 text-xs border border-blue-200">
                        <div className="font-medium">GraphRAG ranking factors:</div>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Vector similarity score (semantic relevance)</li>
                          <li>Graph proximity to query focus</li>
                          <li>Relationship types (weighted by importance)</li>
                          <li>Document recency and metadata attributes</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  
                  <li className="relative pl-8">
                    <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full">3</div>
                    <div>
                      <h4 className="font-medium">Context Assembly</h4>
                      <p className="text-sm mt-1">
                        Select and format top-ranked documents into a context that fits within the LLM's context window.
                      </p>
                      <div className="mt-2 bg-white rounded p-2 text-xs border border-blue-200">
                        <div className="font-medium">Assembly strategies:</div>
                        <ul className="list-disc pl-5 mt-1">
                          <li><strong>Truncation:</strong> Include full documents until context limit</li>
                          <li><strong>Equal allocation:</strong> Include partial content from each document</li>
                          <li><strong>Relevance-weighted:</strong> More space for higher relevance documents</li>
                          <li><strong>Structural awareness:</strong> Preserve document hierarchy and relationships</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  
                  <li className="relative pl-8">
                    <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full">4</div>
                    <div>
                      <h4 className="font-medium">Prompt Construction</h4>
                      <p className="text-sm mt-1">
                        Format the assembled context into a structured prompt for the LLM, including:
                      </p>
                      <div className="mt-2 bg-white rounded p-2 text-xs border border-blue-200">
                        <ul className="list-disc pl-5">
                          <li><strong>System instructions:</strong> Persona, response format, citation guidelines</li>
                          <li><strong>Context insertion:</strong> Formatted retrieved documents</li>
                          <li><strong>Structural information:</strong> Relationships between documents, document metadata</li>
                          <li><strong>Query reformulation:</strong> Original query plus any additional instructions</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Context Enrichment in GraphRAG</h3>
                <div className="bg-purple-50 p-4 rounded-lg text-sm">
                  <p>
                    GraphRAG enhances context assembly by including graph structure information that traditional RAG systems lack:
                  </p>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded p-3 border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-1">Relationship Context</h4>
                      <p className="text-xs">
                        Includes explicit relationships between documents in the context to help the LLM understand connections:
                      </p>
                      <div className="mt-2 bg-purple-50 p-2 rounded text-xs">
                        <code>Document A "extends" Document B</code><br />
                        <code>Document C "contradicts" Document A</code><br />
                        <code>Document B "is part of" Collection X</code>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded p-3 border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-1">Path Information</h4>
                      <p className="text-xs">
                        Adds traversal paths used to find indirectly related documents:
                      </p>
                      <div className="mt-2 bg-purple-50 p-2 rounded text-xs">
                        <code>Query → Document A → Document D</code><br />
                        <code>Document A contains concept X</code><br />
                        <code>Document D implements concept X</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white rounded p-3 border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-1">Hierarchical Structure</h4>
                    <p className="text-xs mb-2">
                      Preserves document hierarchy when including partial content:
                    </p>
                    <div className="bg-purple-50 p-2 rounded text-xs">
                      <pre>{`Document: "Neural Networks Guide"
- Section: "Architecture Types"
  - Subsection: "Transformers"
    > The included content discusses attention mechanisms...`}</pre>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white rounded p-3 border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-1">Benefits of Graph-Enhanced Context</h4>
                    <ul className="list-disc pl-5 text-xs mt-1">
                      <li><strong>Improved reasoning:</strong> LLM can follow logical connections across documents</li>
                      <li><strong>Better synthesis:</strong> Understanding of how concepts relate to each other</li>
                      <li><strong>Reduced contradiction:</strong> Awareness of conflicting information and sources</li>
                      <li><strong>More precise citations:</strong> Clear attributions to sources and content provenance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/5">
              <h3 className="font-semibold mb-3">Example Prompt Construction</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <div className="font-medium text-sm">Assembled Context</div>
                  <button className="text-xs flex items-center gap-1 text-blue-600">
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                
                <div className="bg-gray-800 text-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-[600px]">
                  {assembledContext}
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Context Structure in Jarvis</h4>
                  <div className="bg-white rounded p-3 border border-gray-200 text-xs">
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>
                        <strong>System Instruction:</strong> Sets the assistant's persona and response guidelines
                      </li>
                      <li>
                        <strong>Context Section:</strong> Contains retrieved documents with clear source markers
                      </li>
                      <li>
                        <strong>Relationship Information:</strong> Explains how documents are connected
                      </li>
                      <li>
                        <strong>User Query:</strong> The original user question
                      </li>
                      <li>
                        <strong>Response Instructions:</strong> Guidelines for formatting the answer
                      </li>
                    </ol>
                    
                    <div className="mt-3 bg-yellow-50 p-2 rounded border border-yellow-200">
                      <div className="font-medium">Key GraphRAG enhancements:</div>
                      <ul className="list-disc pl-4 mt-1">
                        <li>Relationship metadata between documents</li>
                        <li>Hierarchical context structure</li>
                        <li>Path information for multi-hop retrievals</li>
                        <li>Explicit citation instructions</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Context Window Management</h4>
                  <div className="bg-white rounded p-3 border border-gray-200 text-xs">
                    <p>
                      The Jarvis RAGService dynamically manages context assembly to fit within LLM token limits:
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>Default max context length: 10,000 characters (~2,500 tokens)</li>
                      <li>Progressive truncation strategy when context exceeds limits</li>
                      <li>Preserves complete documents when possible</li>
                      <li>Maintains document metadata even when content is truncated</li>
                      <li>Prioritizes by combined relevance score (vector + graph)</li>
                    </ul>
                    
                    <div className="mt-3 bg-red-50 p-2 rounded border border-red-200">
                      <div className="font-medium text-red-800">Advanced feature:</div>
                      <p className="mt-1">
                        When context is too large, Jarvis can generate document summaries on-the-fly to include more sources while using fewer tokens.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'code' && (
          <div>
            <h3 className="font-semibold mb-3">Implementation Code from Jarvis Assistant</h3>
            
            <div className="mb-6">
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-blue-300">Chunking Implementation</h4>
                  <div className="text-xs text-gray-400">embeddings.py</div>
                </div>
                <pre className="text-xs overflow-auto mt-2">
                  <code>{`async def chunk_text(
    self, 
    text: str, 
    chunk_size: int = 1000, 
    overlap: int = 200
) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks for embedding
    
    Args:
        text: Text to split into chunks
        chunk_size: Maximum characters per chunk
        overlap: Overlap between chunks
        
    Returns:
        List of dictionaries with chunk text and metadata
    """
    if not text:
        return []
    
    chunks = []
    start = 0
    
    while start < len(text):
        # Determine chunk end
        end = min(start + chunk_size, len(text))
        
        # Try to find a natural breakpoint (sentence end) if not at the end of text
        if end < len(text):
            # Search for sentence endings in the latter half of the chunk
            search_start = max(start + chunk_size // 2, start)
            search_text = text[search_start:end]
            
            # Look for sentence endings
            for pattern in ['. ', '.\n', '? ', '! ', '\n\n']:
                pos = search_text.rfind(pattern)
                if pos >= 0:  # Found a breakpoint
                    end = search_start + pos + len(pattern)
                    break
        
        # Extract the chunk
        chunk_text = text[start:end].strip()
        
        # Only create chunks with meaningful content
        if chunk_text and len(chunk_text) > 50:  # Minimum length threshold
            chunk_id = str(uuid.uuid4())
            chunks.append({
                "id": chunk_id,
                "text": chunk_text,
                "start_pos": start,
                "end_pos": end,
                "length": len(chunk_text)
            })
        
        # Move to next chunk position, with overlap
        start = end - overlap
    
    return chunks`}</code>
                </pre>
              </div>
              
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-green-300">Context Assembly Code</h4>
                  <div className="text-xs text-gray-400">rag.py</div>
                </div>
                <pre className="text-xs overflow-auto mt-2">
                  <code>{`async def build_context(
    self,
    query: str,
    retrieval_results: Dict[str, Any],
    max_context_length: int = 10000
) -> Dict[str, Any]:
    """
    Build a structured context from relevant notes for an LLM
    
    Args:
        query: User query
        retrieval_results: Results from retrieval
        max_context_length: Maximum total context length in characters
        
    Returns:
        Dictionary with structured context for the LLM
    """
    # Extract results
    results = retrieval_results.get("results", [])
    if not results:
        return {
            "query": query,
            "context_notes": [],
            "graph_context": None,
            "total_length": 0
        }
    
    # Get content for each result
    context_notes = []
    total_length = 0
    
    for item in results:
        path = item["path"]
        
        try:
            # Get note content
            note = await self.graph_service.get_note_with_relationships(path)
            
            if "error" in note:
                # Try to read from file if not in database
                try:
                    content, metadata = self.vault_service.read_file(path)
                    note = {
                        "path": path,
                        "title": item.get("title", os.path.basename(path)),
                        "content": content,
                        "tags": item.get("tags", []),
                        "relationships": {}
                    }
                except Exception:
                    continue
            
            # Check if adding this note would exceed the max context length
            note_length = len(note.get("content", ""))
            if total_length + note_length > max_context_length:
                # If this is the first note, include a truncated version
                if not context_notes:
                    truncated_content = note["content"][:max_context_length - 100] + "..."
                    note["content"] = truncated_content
                    note["truncated"] = True
                    context_notes.append(note)
                    total_length += len(truncated_content)
                break
            
            # Add note to context
            context_notes.append(note)
            total_length += note_length
            
        except Exception as e:
            logger.warning(f"Error retrieving note content for {path}: {e}")
    
    # Include graph context if available
    graph_context = retrieval_results.get("graph_context")
    
    return {
        "query": query,
        "context_notes": context_notes,
        "graph_context": graph_context,
        "total_length": total_length
    }`}</code>
                </pre>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-purple-300">Prompt Creation Code</h4>
                  <div className="text-xs text-gray-400">llm.py</div>
                </div>
                <pre className="text-xs overflow-auto mt-2">
                  <code>{`async def _create_prompt(
    self,
    query: str,
    context_data: Dict[str, Any],
    system_prompt: Optional[str] = None
) -> str:
    """
    Create a prompt with context for the LLM
    
    Args:
        query: User query
        context_data: Structured context from RAG service
        system_prompt: Optional system prompt
        
    Returns:
        Formatted prompt string
    """
    prompt_parts = []
    
    # Add system prompt if provided, otherwise use default
    if system_prompt:
        system_text = system_prompt
    else:
        system_text = (
            "You are Jarvis, an intelligent assistant integrated with an Obsidian vault. "
            "You help answer questions using the provided context from the vault. "
            "When using information from the context, cite the source using the format [filename.md]. "
            "If the provided context doesn't contain relevant information, acknowledge this and "
            "provide a general answer based on your knowledge. "
            "Be helpful, clear, and concise."
        )
    
    # Add the system prompt
    prompt_parts.append(f"SYSTEM: {system_text}\\n")
    
    # Add context notes
    context_notes = context_data.get("context_notes", [])
    if context_notes:
        prompt_parts.append("CONTEXT INFORMATION:")
        
        for i, note in enumerate(context_notes):
            prompt_parts.append(f"\\n--- NOTE {i+1}: [{note.get('path', 'unknown')}] ---")
            prompt_parts.append(f"Title: {note.get('title', 'Untitled')}")
            
            # Add tags if available
            if note.get("tags") and len(note.get("tags")) > 0:
                prompt_parts.append(f"Tags: {', '.join(note.get('tags'))}")
            
            # Add content
            content = note.get("content", "").strip()
            if len(content) > 0:
                if len(content) > 1500 and not note.get("truncated"):
                    content = content[:1500] + "..."
                prompt_parts.append(f"Content:\\n{content}")
            
            prompt_parts.append(f"--- END NOTE [{note.get('path', 'unknown')}] ---")
    else:
        prompt_parts.append("CONTEXT INFORMATION: No specific notes found in the vault for this query.")
    
    # Add graph context if available
    graph_context = context_data.get("graph_context")
    if graph_context and graph_context.get("relationships") and len(graph_context.get("relationships")) > 0:
        prompt_parts.append("\\nRELATIONSHIPS BETWEEN NOTES:")
        
        # Create a mapping of node IDs to paths
        nodes = graph_context.get("nodes", [])
        id_to_path = {}
        for node in nodes:
            id_to_path[node.get("id")] = node.get("path")
        
        # Add relationship information
        relationships = graph_context.get("relationships", [])
        rel_count = 0
        for rel in relationships[:10]:  # Limit to avoid overloading context
            source_id = rel.get("source")
            target_id = rel.get("target")
            rel_type = rel.get("original_type") or rel.get("type", "RELATED")
            
            if source_id in id_to_path and target_id in id_to_path:
                source_path = id_to_path[source_id]
                target_path = id_to_path[target_id]
                prompt_parts.append(f"- [{source_path}] {rel_type} [{target_path}]")
                rel_count += 1
        
        if rel_count == 0:
            prompt_parts.pop()  # Remove the relationships heading if none were added
    
    # Add the user query
    prompt_parts.append(f"\\nUSER QUERY: {query}")
    
    # Add instructions for response
    prompt_parts.append(
        "\\nINSTRUCTIONS:"
        "\\n1. Answer based on the provided context when possible"
        "\\n2. Cite sources using [filename.md] format when referencing specific notes"
        "\\n3. If the context doesn't contain the answer, acknowledge this and provide a general response"
        "\\n4. Be concise and directly address the query"
    )
    
    return "\\n".join(prompt_parts)`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChunkingStrategiesVisualization;