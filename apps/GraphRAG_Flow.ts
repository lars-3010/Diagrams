import React, { useState } from 'react';
import { ArrowRight, Search, Database, Brain, FileText, Network, GitBranch, Code, CircleCheck, Sigma, GitCommit } from 'lucide-react';

const GraphRAGViz = () => {
  const [activeStep, setActiveStep] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [selectedCodeSection, setSelectedCodeSection] = useState('query');
  
  const steps = [
    { id: 'query', title: 'User Query', description: 'User asks a question about their knowledge base', icon: <Search /> },
    { id: 'embedding', title: 'Query Embedding', description: 'Query is transformed into a vector embedding', icon: <Sigma /> },
    { id: 'semanticSearch', title: 'Semantic Search', description: 'Vector similarity search finds relevant notes', icon: <Database /> },
    { id: 'graphTraversal', title: 'Graph Traversal', description: 'Graph relationships are followed to find connected notes', icon: <Network /> },
    { id: 'resultMerging', title: 'Result Merging', description: 'Vector and graph results are combined and ranked', icon: <GitBranch /> },
    { id: 'contextBuilding', title: 'Context Building', description: 'Retrieved notes are assembled into a coherent context', icon: <FileText /> },
    { id: 'llmGeneration', title: 'LLM Generation', description: 'LLM generates a response using the assembled context', icon: <Brain /> },
    { id: 'response', title: 'Final Response', description: 'Answer is returned to the user with source citations', icon: <CircleCheck /> }
  ];
  
  const codeExamples = {
    query: `# User query processing in ChatService class
async def process_query(
    self,
    query: str,
    conversation_id: Optional[str] = None,
    context_note_path: Optional[str] = None,
    max_history: int = 10,
    temperature: float = 0.7
) -> Dict[str, Any]:
    # Create conversation if needed
    if not conversation_id:
        conversation = await self.create_conversation()
        conversation_id = conversation["id"]
        
    # Add user message to conversation
    await self.add_message(conversation_id, "user", query)`,
    
    embedding: `# Creating embedding for query in EmbeddingService
async def create_embedding(self, text: str) -> List[float]:
    """Create an embedding vector for text"""
    if not text or not text.strip():
        return [0.0] * self.vector_dim  # Return zero vector
    
    # Truncate text if too long
    text = self._truncate_text(text, max_length=8000)
    
    try:
        # Using SentenceTransformer model to create embedding
        embedding = self.model.encode(text)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Error creating embedding: {e}")
        return [0.0] * self.vector_dim`,
    
    semanticSearch: `# Semantic search in RAGService
async def semantic_search(
    self, 
    query: str,
    limit: int = 5,
    threshold: float = 0.7,
    search_type: str = "hybrid"  # Options: 'hybrid', 'vector', 'keyword'
) -> List[Dict[str, Any]]:
    # Create embedding for query
    query_embedding = await self.embedding_service.create_embedding(query)
    
    if search_type == "hybrid":
        # Perform hybrid search (vector + keyword)
        return await self.graph_service.hybrid_search(
            query, 
            query_embedding,
            search_content=True,
            vector_weight=0.7,
            limit=limit
        )
    elif search_type == "vector":
        # Perform pure vector search
        return await self.graph_service.vector_search(
            query_embedding,
            limit=limit,
            threshold=threshold
        )`,
    
    graphTraversal: `# Graph traversal in graph_augmented_retrieval
# First get semantic matches as starting points
semantic_results = await self.semantic_search(
    query, 
    limit=limit // 2  # Reserve space for graph results
)
semantic_paths = set(item["path"] for item in semantic_results)

# Use top semantic match as center of graph exploration
if not center_note_path and semantic_results:
    center_note_path = semantic_results[0]["path"]

# Get graph neighborhood via traversal
graph_context = await self.graph_service.get_note_graph(
    center_note_path, 
    depth=max_hops
)

# Extract neighboring nodes from graph context
node_paths = set()
for node in graph_context.get("nodes", []):
    path = node.get("path")
    if path and path not in semantic_paths and path != center_note_path:
        node_paths.add(path)`,
    
    resultMerging: `# Merging results from vector and graph searches
# Add source marker to semantic results
for item in semantic_results:
    item["source"] = "semantic"

# Get content for graph nodes and mark them
graph_results = []
for path in node_paths:
    note = await self.graph_service.get_note_with_relationships(path)
    if "error" not in note:
        graph_results.append({
            "path": path,
            "title": note.get("title", os.path.basename(path)),
            "tags": note.get("tags", []),
            "score": 0.5,  # Default graph-based score
            "source": "graph"
        })

# Combine and rank all results
combined_results = semantic_results + graph_results
combined_results.sort(key=lambda x: x["score"], reverse=True)

# Limit to requested number
final_results = combined_results[:limit]`,
    
    contextBuilding: `# Building context for LLM in RAGService
async def build_context(
    self,
    query: str,
    retrieval_results: Dict[str, Any],
    max_context_length: int = 10000
) -> Dict[str, Any]:
    # Extract results
    results = retrieval_results.get("results", [])
    
    # Get content for each result
    context_notes = []
    total_length = 0
    
    for item in results:
        path = item["path"]
        
        # Get note content
        note = await self.graph_service.get_note_with_relationships(path)
        
        # Check if adding this note would exceed max context length
        note_length = len(note.get("content", ""))
        if total_length + note_length > max_context_length:
            # If first note, include truncated version
            if not context_notes:
                truncated_content = note["content"][:max_context_length - 100] + "..."
                note["content"] = truncated_content
                note["truncated"] = True
                context_notes.append(note)
                total_length += len(truncated_content)
            break
        
        # Add note to context
        context_notes.append(note)
        total_length += note_length`,
    
    llmGeneration: `# Generating response with LLM (simplified)
# Create prompt with context
prompt = await self._create_prompt(query, context_data, system_prompt)

# Configure generation parameters
generation_config = {
    "temperature": temperature,
    "top_p": 0.95,
    "top_k": 40,
    "candidate_count": 1
}

# Generate response using Gemini model
response = self.model.generate_content(prompt, **chat_params)

# Extract sources from context for citation
sources = []
context_notes = context_data.get("context_notes", [])
for note in context_notes:
    if note.get("path") and note.get("path") not in sources:
        sources.append(note.get("path"))

return {
    "answer": response.text,
    "sources": sources,
    "model": self.model_id,
    "tokens": await self._estimate_token_count(prompt, response.text)
}`,
    
    response: `# Final response processing in ChatService
# Extract sources and metadata
context_metadata = {
    "context_note_count": len(context.get("context_notes", [])),
    "context_length": context.get("total_length", 0),
    "sources": llm_response.get("sources", []),
    "token_counts": llm_response.get("tokens", {})
}

# Update context notes in conversation metadata
used_notes = []
for note in context.get("context_notes", []):
    note_path = note.get("path")
    if note_path:
        used_notes.append(note_path)
conversation["metadata"]["context_notes"] = used_notes

# Add assistant message to conversation with metadata
answer = llm_response.get("answer", "Sorry, I couldn't generate a response.")
await self.add_message(
    conversation_id=conversation_id,
    role="assistant",
    content=answer,
    metadata=context_metadata
)

# Record feedback data for future improvement
await self._record_query_data(query, retrieval_results, llm_response)

return {
    "answer": answer,
    "conversation_id": conversation_id,
    "sources": llm_response.get("sources", []),
    "metadata": context_metadata,
    "error": llm_response.get("error")
}`
  };
  
  return (
    <div className="flex flex-col w-full bg-gray-50 p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">GraphRAG Flow in Jarvis Assistant</h2>
      
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setShowCode(!showCode)} 
          className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          <Code size={16} />
          {showCode ? 'Hide Code' : 'Show Code'}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Process Flow */}
        <div className={`${showCode ? "w-1/2" : "w-full"} flex flex-col gap-4`}>
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start">
              {/* Step visualization */}
              <div 
                className={`flex flex-col items-center mr-4 ${activeStep === step.id ? 'scale-110' : ''} transition-transform`}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md
                    ${activeStep === step.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600'}`}
                  onMouseEnter={() => setActiveStep(step.id)}
                  onClick={() => {
                    setActiveStep(step.id);
                    setSelectedCodeSection(step.id);
                  }}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                )}
              </div>
              
              {/* Step details */}
              <div 
                className={`flex-1 p-4 rounded-lg shadow-sm mb-2
                  ${activeStep === step.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-white'}`}
                onMouseEnter={() => setActiveStep(step.id)}
                onClick={() => {
                  setActiveStep(step.id);
                  setSelectedCodeSection(step.id);
                }}
              >
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                
                {/* Step-specific details */}
                {step.id === 'semanticSearch' && activeStep === step.id && (
                  <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                    <p><strong>Implementation:</strong> Uses vector similarity between query embedding and note embeddings</p>
                    <p><strong>In Jarvis:</strong> Hybrid search combines vector similarity with keyword matching</p>
                  </div>
                )}
                
                {step.id === 'graphTraversal' && activeStep === step.id && (
                  <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                    <p><strong>Implementation:</strong> Neo4j graph traversal from initial nodes</p>
                    <p><strong>Relationship types:</strong> LINKS_TO, UP, SIMILAR, LEADS_TO, CONTRADICTS, etc.</p>
                    <p><strong>Max traversal depth:</strong> Configurable (default: 2 hops)</p>
                  </div>
                )}
                
                {step.id === 'resultMerging' && activeStep === step.id && (
                  <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                    <p><strong>Vector results:</strong> Scored by cosine similarity (0-1)</p>
                    <p><strong>Graph results:</strong> Scored by relationship proximity</p>
                    <p><strong>Combined ranking:</strong> Weighted mix of both scores</p>
                  </div>
                )}
                
                {step.id === 'contextBuilding' && activeStep === step.id && (
                  <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                    <p><strong>Context assembly:</strong> Top-ranked notes assembled with metadata</p>
                    <p><strong>Length limitation:</strong> Truncation to fit LLM context window</p>
                    <p><strong>Relationship context:</strong> Graph relationships included as additional context</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Code View */}
        {showCode && (
          <div className="w-1/2 bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto max-h-screen">
            <h3 className="font-mono text-gray-300 mb-2">// {steps.find(s => s.id === selectedCodeSection)?.title}</h3>
            <pre className="text-sm overflow-auto">
              <code>{codeExamples[selectedCodeSection]}</code>
            </pre>
            <div className="mt-4 text-xs text-gray-400">
              This is a simplified version of the actual implementation in Jarvis Assistant
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphRAGViz;