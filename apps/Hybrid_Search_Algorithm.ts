import React, { useState, useEffect } from 'react';
import { Search, Zap, FileText, ArrowRight, Filter, BarChart, SlidersHorizontal, Sigma, Tag, AlertCircle, BookOpen, Info } from 'lucide-react';

const HybridSearchVisualization = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vectorWeight, setVectorWeight] = useState(0.7);
  const [keywordWeight, setKeywordWeight] = useState(0.3);
  const [threshold, setThreshold] = useState(0.5);
  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [vectorResults, setVectorResults] = useState([]);
  const [keywordResults, setKeywordResults] = useState([]);
  const [hybridResults, setHybridResults] = useState([]);
  const [currentStep, setCurrentStep] = useState('query');
  const [showExplanation, setShowExplanation] = useState(true);
  
  // Sample documents for demonstration
  const documents = [
    {
      id: 1,
      title: "Retrieval Augmented Generation",
      content: "RAG combines language models with external knowledge retrieval for more accurate responses.",
      tags: ["ai", "llm", "retrieval"],
      vectorScore: 0,
      keywordScore: 0
    },
    {
      id: 2,
      title: "Vector Embeddings",
      content: "Vector embeddings represent semantic meaning in high-dimensional space allowing for similarity comparisons.",
      tags: ["ai", "embeddings", "similarity"],
      vectorScore: 0,
      keywordScore: 0
    },
    {
      id: 3,
      title: "Graph-Based RAG",
      content: "GraphRAG enhances retrieval by incorporating knowledge graph structure into the RAG pipeline.",
      tags: ["rag", "graph", "knowledge-graph"],
      vectorScore: 0,
      keywordScore: 0
    },
    {
      id: 4,
      title: "Neo4j Database",
      content: "Neo4j is a graph database that enables modeling, storing, and querying of connected data.",
      tags: ["database", "graph", "cypher"],
      vectorScore: 0,
      keywordScore: 0
    },
    {
      id: 5,
      title: "Semantic Search",
      content: "Unlike keyword search, semantic search understands the intent and contextual meaning of search queries.",
      tags: ["search", "embeddings", "similarity"],
      vectorScore: 0,
      keywordScore: 0
    },
    {
      id: 6,
      title: "BM25 Algorithm",
      content: "BM25 is a keyword-based ranking function used to rank documents by relevance to a search query.",
      tags: ["search", "algorithm", "keyword"],
      vectorScore: 0,
      keywordScore: 0
    },
    {
      id: 7,
      title: "Hybrid Search Systems",
      content: "Hybrid search combines multiple search techniques like keyword and vector search for better results.",
      tags: ["search", "algorithm", "vector", "keyword"],
      vectorScore: 0,
      keywordScore: 0
    },
    {
      id: 8,
      title: "Knowledge Graphs",
      content: "Knowledge graphs represent information as entities and relationships, enabling structured data insights.",
      tags: ["graph", "knowledge-representation", "semantic-web"],
      vectorScore: 0,
      keywordScore: 0
    }
  ];
  
  // Reset scores when query changes
  useEffect(() => {
    resetScores();
  }, [searchQuery]);
  
  const resetScores = () => {
    setVectorResults([]);
    setKeywordResults([]);
    setHybridResults([]);
    setSearchComplete(false);
    setCurrentStep('query');
  };
  
  // Perform search
  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setCurrentStep('query');
    
    // Reset results
    resetScores();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentStep('vector');
    
    // Simulate vector search
    const vectorScores = simulateVectorSearch(searchQuery);
    setVectorResults(vectorScores);
    
    // Simulate keyword search with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentStep('keyword');
    
    const keywordScores = simulateKeywordSearch(searchQuery);
    setKeywordResults(keywordScores);
    
    // Simulate hybrid combination with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentStep('combine');
    
    const hybrid = combineResults(vectorScores, keywordScores);
    setHybridResults(hybrid);
    
    // Complete
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentStep('complete');
    setIsSearching(false);
    setSearchComplete(true);
  };
  
  // Simulate vector search (simplified)
  const simulateVectorSearch = (query) => {
    // In a real system, this would:
    // 1. Convert query to embedding using the same model used for documents
    // 2. Calculate vector similarity between query embedding and document embeddings
    // 3. Return documents sorted by similarity
    
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return documents.map(doc => {
      // Simulate semantic matching with some randomness
      let score = 0;
      
      // Simulate "semantic understanding" - partial word matches and synonyms
      const content = doc.content.toLowerCase();
      const title = doc.title.toLowerCase();
      
      // Check for keyword match in title (with higher weight)
      const titleMatches = queryWords.filter(word => title.includes(word)).length;
      score += titleMatches * 0.3;
      
      // Check for keyword match in content
      const contentMatches = queryWords.filter(word => content.includes(word)).length;
      score += contentMatches * 0.2;
      
      // Check tag matches
      const tagMatches = queryWords.filter(word => 
        doc.tags.some(tag => tag.includes(word))
      ).length;
      score += tagMatches * 0.15;
      
      // Add semantic "understanding" (simulated)
      if (query.includes("search") && 
          (content.includes("retrieval") || content.includes("similarity"))) {
        score += 0.2;
      }
      
      if (query.includes("graph") && 
          (content.includes("neo4j") || content.includes("relationship") || content.includes("knowledge"))) {
        score += 0.3;
      }
      
      if (query.includes("vector") && 
          (content.includes("embedding") || content.includes("semantic") || content.includes("similarity"))) {
        score += 0.35;
      }
      
      if (query.includes("rag") && 
          (content.includes("retrieval") || content.includes("augmented") || content.includes("language model"))) {
        score += 0.4;
      }
      
      // Add a small random factor for variations
      score += Math.random() * 0.2;
      
      // Ensure score is between 0 and 1
      score = Math.min(Math.max(score, 0), 1);
      
      return {
        ...doc,
        vectorScore: score
      };
    }).sort((a, b) => b.vectorScore - a.vectorScore);
  };
  
  // Simulate keyword search (simplified)
  const simulateKeywordSearch = (query) => {
    // In a real system, this would use BM25 or a similar algorithm
    
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return documents.map(doc => {
      let score = 0;
      const content = doc.content.toLowerCase();
      const title = doc.title.toLowerCase();
      
      // Simple TF scoring (term frequency)
      for (const word of queryWords) {
        // Count exact matches (keyword search is more exact)
        const titleCount = (title.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        const contentCount = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        
        // Higher weight for title matches
        score += titleCount * 0.6;
        score += contentCount * 0.2;
      }
      
      // Check tag exact matches
      const tagMatches = queryWords.filter(word => 
        doc.tags.some(tag => tag === word)
      ).length;
      score += tagMatches * 0.3;
      
      // Normalize score to 0-1 range
      score = Math.min(score / (queryWords.length * 1.5), 1);
      
      return {
        ...doc,
        keywordScore: score
      };
    }).sort((a, b) => b.keywordScore - a.keywordScore);
  };
  
  // Combine vector and keyword results
  const combineResults = (vectorResults, keywordResults) => {
    // Create a map for easier lookup
    const docMap = {};
    
    // Initialize with vector results
    vectorResults.forEach(doc => {
      docMap[doc.id] = {
        ...doc,
        keywordScore: 0,
      };
    });
    
    // Add/update with keyword results
    keywordResults.forEach(doc => {
      if (docMap[doc.id]) {
        docMap[doc.id].keywordScore = doc.keywordScore;
      } else {
        docMap[doc.id] = {
          ...doc,
          vectorScore: 0,
        };
      }
    });
    
    // Calculate hybrid score
    const hybridResults = Object.values(docMap).map(doc => {
      const hybridScore = (doc.vectorScore * vectorWeight) + (doc.keywordScore * keywordWeight);
      return {
        ...doc,
        hybridScore
      };
    });
    
    // Sort by hybrid score and filter by threshold
    return hybridResults
      .filter(doc => doc.hybridScore >= threshold)
      .sort((a, b) => b.hybridScore - a.hybridScore);
  };
  
  // Generate score bar
  const ScoreBar = ({ value, color }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full" 
          style={{ 
            width: `${Math.round(value * 100)}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    );
  };
  
  // Step indicator
  const Step = ({ number, title, isActive, isComplete }) => {
    return (
      <div className="flex flex-col items-center">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isActive 
              ? 'bg-blue-500 text-white' 
              : isComplete 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
          }`}
        >
          {number}
        </div>
        <div className="text-xs mt-1 text-center">{title}</div>
      </div>
    );
  };
  
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="text-xl font-bold mb-4">Hybrid Search Algorithm</h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
              showExplanation 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Info size={14} />
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>
        </div>
        
        {showExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-sm">
            <h3 className="font-semibold mb-1 flex items-center gap-1">
              <AlertCircle size={16} className="text-blue-500" />
              How Hybrid Search Works
            </h3>
            <p className="mb-2">
              Hybrid search combines vector similarity (semantic understanding) with traditional keyword matching for more robust retrieval. This is a key component of GraphRAG systems.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1 text-blue-800">Vector Search Strengths:</h4>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Understands semantic meaning and context</li>
                  <li>Finds related content without exact keyword matches</li>
                  <li>Better for conceptual or abstract queries</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-blue-800">Keyword Search Strengths:</h4>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Precise matching for specific terms</li>
                  <li>Handles specialized terminology well</li>
                  <li>Works reliably for exact phrase matching</li>
                </ul>
              </div>
            </div>
            <p className="mt-2">
              In the Jarvis GraphRAG system, hybrid search serves as the initial retrieval step before graph traversal, providing high-quality starting points for exploration.
            </p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a search query..."
                className="px-3 py-2 border border-gray-300 rounded-md flex-1"
              />
              <button
                onClick={performSearch}
                disabled={isSearching || !searchQuery.trim()}
                className={`px-3 py-2 rounded-md flex items-center gap-1 ${
                  isSearching || !searchQuery.trim()
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Search size={16} />
                Search
              </button>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-1 text-sm font-medium">
                <SlidersHorizontal size={14} />
                Weights:
              </div>
              <div className="text-xs text-gray-500">
                (Adjust to favor semantic understanding or exact matching)
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Sigma size={14} className="text-purple-500" />
                    Vector:
                  </span>
                  <span className="font-mono">{vectorWeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={vectorWeight}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    setVectorWeight(newValue);
                    setKeywordWeight(1 - newValue);
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Tag size={14} className="text-orange-500" />
                    Keyword:
                  </span>
                  <span className="font-mono">{keywordWeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={keywordWeight}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    setKeywordWeight(newValue);
                    setVectorWeight(1 - newValue);
                  }}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Filter size={14} className="text-green-500" />
                  Threshold:
                </span>
                <span className="font-mono">{threshold.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex md:flex-col justify-center items-center gap-2 md:gap-4">
            <div className="h-0.5 md:h-auto md:w-0.5 bg-gray-200 flex-1"></div>
            <Step number={1} title="Query" isActive={currentStep === 'query'} isComplete={currentStep !== 'query'} />
            <div className="h-0.5 md:h-auto md:w-0.5 bg-gray-200 flex-1"></div>
            <Step number={2} title="Vector Search" isActive={currentStep === 'vector'} isComplete={currentStep !== 'query' && currentStep !== 'vector'} />
            <div className="h-0.5 md:h-auto md:w-0.5 bg-gray-200 flex-1"></div>
            <Step number={3} title="Keyword Search" isActive={currentStep === 'keyword'} isComplete={currentStep === 'combine' || currentStep === 'complete'} />
            <div className="h-0.5 md:h-auto md:w-0.5 bg-gray-200 flex-1"></div>
            <Step number={4} title="Combine Results" isActive={currentStep === 'combine'} isComplete={currentStep === 'complete'} />
            <div className="h-0.5 md:h-auto md:w-0.5 bg-gray-200 flex-1"></div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vector Search Results */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-purple-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-1">
                <Sigma size={16} className="text-purple-500" />
                Vector Search Results
              </h3>
              {vectorResults.length > 0 && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  {vectorResults.length} results
                </span>
              )}
            </div>
            
            <div className="p-2 h-80 overflow-auto">
              {isSearching && currentStep === 'vector' && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-2 text-sm">Performing vector search...</p>
                  </div>
                </div>
              )}
              
              {vectorResults.length === 0 && currentStep !== 'vector' && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">No vector results yet</p>
                </div>
              )}
              
              {vectorResults.length > 0 && (
                <div className="space-y-2">
                  {vectorResults.map((doc) => (
                    <div key={`vector-${doc.id}`} className="p-2 border border-gray-200 rounded">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{doc.title}</h4>
                        <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">
                          {doc.vectorScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <ScoreBar value={doc.vectorScore} color="#A78BFA" />
                      </div>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {doc.content}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doc.tags.map(tag => (
                          <span key={`vector-${doc.id}-${tag}`} className="text-xs bg-gray-100 px-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Keyword Search Results */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-orange-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-1">
                <Tag size={16} className="text-orange-500" />
                Keyword Search Results
              </h3>
              {keywordResults.length > 0 && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  {keywordResults.length} results
                </span>
              )}
            </div>
            
            <div className="p-2 h-80 overflow-auto">
              {isSearching && currentStep === 'keyword' && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-sm">Performing keyword search...</p>
                  </div>
                </div>
              )}
              
              {keywordResults.length === 0 && currentStep !== 'keyword' && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">No keyword results yet</p>
                </div>
              )}
              
              {keywordResults.length > 0 && (
                <div className="space-y-2">
                  {keywordResults.map((doc) => (
                    <div key={`keyword-${doc.id}`} className="p-2 border border-gray-200 rounded">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{doc.title}</h4>
                        <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
                          {doc.keywordScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <ScoreBar value={doc.keywordScore} color="#FDBA74" />
                      </div>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {doc.content}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doc.tags.map(tag => (
                          <span key={`keyword-${doc.id}-${tag}`} className="text-xs bg-gray-100 px-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Hybrid Results */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-green-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-1">
                <Zap size={16} className="text-green-500" />
                Hybrid Search Results
              </h3>
              {hybridResults.length > 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  {hybridResults.length} results
                </span>
              )}
            </div>
            
            <div className="p-2 h-80 overflow-auto">
              {isSearching && currentStep === 'combine' && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-2 text-sm">Combining results...</p>
                  </div>
                </div>
              )}
              
              {hybridResults.length === 0 && !isSearching && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm flex items-center gap-1">
                    {searchComplete ? (
                      <>
                        <AlertCircle size={14} />
                        No results met the threshold
                      </>
                    ) : (
                      "Hybrid results will appear here"
                    )}
                  </p>
                </div>
              )}
              
              {hybridResults.length > 0 && (
                <div className="space-y-2">
                  {hybridResults.map((doc) => (
                    <div key={`hybrid-${doc.id}`} className="p-2 border border-gray-200 rounded">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{doc.title}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                          {doc.hybridScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <ScoreBar value={doc.hybridScore} color="#34D399" />
                      </div>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {doc.content}
                      </p>
                      
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        <div className="text-xs flex items-center">
                          <span className="w-3 h-3 mr-1 rounded-full bg-purple-200"></span>
                          <span className="text-purple-700">V: {doc.vectorScore.toFixed(2)}</span>
                        </div>
                        <div className="text-xs flex items-center">
                          <span className="w-3 h-3 mr-1 rounded-full bg-orange-200"></span>
                          <span className="text-orange-700">K: {doc.keywordScore.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doc.tags.map(tag => (
                          <span key={`hybrid-${doc.id}-${tag}`} className="text-xs bg-gray-100 px-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Code Section */}
        {searchComplete && (
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-1">
                <BookOpen size={16} />
                Implementation Details
              </h3>
            </div>
            
            <div className="p-4 bg-gray-800 text-gray-100 overflow-auto text-sm">
              <pre className="font-mono"><code>{`// Hybrid search implementation from Jarvis Assistant
async def hybrid_search(
    self,
    query: str,
    query_embedding: List[float],
    search_content: bool = True,
    vector_weight: float = ${vectorWeight}, // Configurable weight
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Perform hybrid search combining keyword and vector similarity
    """
    // Get keyword search results
    keyword_results = await self.search_notes(query, search_content, limit * 2)
    keyword_dict = {}
    
    if "results" in keyword_results:
        for item in keyword_results["results"]:
            path = item["path"]
            // Normalize score to 0-1 range (keyword scores are 1-3)
            normalized_score = (item["score"] - 1) / 2
            keyword_dict[path] = {
                "path": path,
                "title": item["title"],
                "tags": item["tags"],
                "keyword_score": normalized_score,
                "content_snippet": item.get("content_snippet")
            }
    
    // Get vector search results
    vector_results = await self.vector_search(query_embedding, limit * 2)
    vector_dict = {}
    
    for item in vector_results:
        path = item["path"]
        vector_dict[path] = {
            "path": path,
            "title": item["title"],
            "tags": item["tags"],
            "vector_score": item["similarity"]
        }
    
    // Combine results
    combined = {}
    
    // Process keyword results
    for path, data in keyword_dict.items():
        combined[path] = data.copy()
        // If also in vector results, add vector score
        if path in vector_dict:
            combined[path]["vector_score"] = vector_dict[path]["vector_score"]
        else:
            combined[path]["vector_score"] = 0
    
    // Process vector results not in keyword results
    for path, data in vector_dict.items():
        if path not in combined:
            combined[path] = data.copy()
            combined[path]["keyword_score"] = 0
            combined[path]["content_snippet"] = None
    
    // Calculate combined score with weighting
    for path, data in combined.items():
        keyword_score = data.get("keyword_score", 0)
        vector_score = data.get("vector_score", 0)
        
        // Weight the scores
        combined_score = (vector_score * ${vectorWeight}) + (keyword_score * ${keywordWeight})
        data["score"] = combined_score
    
    // Convert to list and sort by score
    results = list(combined.values())
    results.sort(key=lambda x: x["score"], reverse=True)
    
    // Return top results
    return results[:limit]`}</code></pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridSearchVisualization;