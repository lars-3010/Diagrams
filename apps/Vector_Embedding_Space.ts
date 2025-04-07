import React, { useState, useEffect, useRef } from 'react';
import { Search, Sigma, Target, ArrowRight, AlertCircle, Zap, RotateCcw, Tag, Maximize2 } from 'lucide-react';

const VectorSpaceVisualization = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryPoint, setQueryPoint] = useState(null);
  const [nearestPoints, setNearestPoints] = useState([]);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions] = useState(3); // For visualization, we're using 3D
  const [activeTab, setActiveTab] = useState('space');
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Define sample vector space data points (simplified for visualization)
  useEffect(() => {
    const sampleDocuments = [
      {
        id: 1,
        text: "Retrieval Augmented Generation combines LLMs with external knowledge",
        embedding: normalizeVector([0.8, 0.7, 0.3]), // Simplified 3D vector
        category: "rag"
      },
      {
        id: 2,
        text: "Graph-based RAG enhances retrieval with structural knowledge",
        embedding: normalizeVector([0.85, 0.75, 0.35]), // Close to RAG
        category: "rag"
      },
      {
        id: 3,
        text: "Knowledge graphs represent entities and their relationships",
        embedding: normalizeVector([0.6, 0.8, 0.5]), // Between RAG and Graph
        category: "graph"
      },
      {
        id: 4,
        text: "Neo4j is a graph database that uses the Cypher query language",
        embedding: normalizeVector([0.4, 0.9, 0.6]), // More graph-oriented
        category: "graph"
      },
      {
        id: 5,
        text: "Vector embeddings map semantic meaning to high-dimensional space",
        embedding: normalizeVector([0.7, 0.2, 0.8]), // Vector space concepts
        category: "vector"
      },
      {
        id: 6,
        text: "Cosine similarity measures the angle between two vectors",
        embedding: normalizeVector([0.75, 0.15, 0.85]), // Close to vector embeddings
        category: "vector"
      },
      {
        id: 7,
        text: "Large language models generate text based on patterns in training data",
        embedding: normalizeVector([0.3, 0.4, 0.2]), // LLM concepts
        category: "llm"
      },
      {
        id: 8,
        text: "Transformer architecture uses attention mechanisms for sequence processing",
        embedding: normalizeVector([0.25, 0.45, 0.15]), // Close to LLM
        category: "llm"
      },
      {
        id: 9,
        text: "Machine learning algorithms learn patterns from data",
        embedding: normalizeVector([0.5, 0.5, 0.3]), // General ML
        category: "ml"
      },
      {
        id: 10, 
        text: "Neural networks are composed of layers of connected nodes",
        embedding: normalizeVector([0.45, 0.55, 0.25]), // Close to ML
        category: "ml"
      },
      {
        id: 11,
        text: "Hybrid search combines vector similarity with keyword matching",
        embedding: normalizeVector([0.75, 0.45, 0.6]), // Between RAG and vector
        category: "search"
      },
      {
        id: 12,
        text: "Semantic search understands the meaning behind queries",
        embedding: normalizeVector([0.7, 0.4, 0.65]), // Close to hybrid search
        category: "search"
      }
    ];
    
    setDataPoints(sampleDocuments);
  }, []);
  
  // Function to normalize a vector to unit length
  function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }
  
  // Function to calculate cosine similarity
  function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Simulate searching in vector space
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Simulate embedding generation for the query
    // This is a simplification - in reality, this would use the same embedding model
    const queryWords = searchQuery.toLowerCase().split(/\s+/);
    
    // Create a mock embedding based on category keywords in the query
    let embedding = [0, 0, 0];
    
    // Check if query contains keywords and adjust embedding
    if (queryWords.some(w => ["rag", "retrieval", "augmented", "generation"].includes(w))) {
      embedding[0] += 0.8;
      embedding[1] += 0.7;
      embedding[2] += 0.3;
    }
    
    if (queryWords.some(w => ["graph", "relationship", "neo4j", "cypher"].includes(w))) {
      embedding[0] += 0.5;
      embedding[1] += 0.9;
      embedding[2] += 0.6;
    }
    
    if (queryWords.some(w => ["vector", "embedding", "similarity", "cosine"].includes(w))) {
      embedding[0] += 0.7;
      embedding[1] += 0.2;
      embedding[2] += 0.8;
    }
    
    if (queryWords.some(w => ["llm", "language", "model", "transformer"].includes(w))) {
      embedding[0] += 0.3;
      embedding[1] += 0.4;
      embedding[2] += 0.2;
    }
    
    if (queryWords.some(w => ["neural", "network", "machine", "learning"].includes(w))) {
      embedding[0] += 0.5;
      embedding[1] += 0.5;
      embedding[2] += 0.3;
    }
    
    if (queryWords.some(w => ["search", "hybrid", "semantic"].includes(w))) {
      embedding[0] += 0.75;
      embedding[1] += 0.45;
      embedding[2] += 0.6;
    }
    
    // If no category matched, create a random-ish embedding
    if (embedding.every(v => v === 0)) {
      embedding = [
        0.4 + Math.random() * 0.4,
        0.4 + Math.random() * 0.4,
        0.3 + Math.random() * 0.4
      ];
    }
    
    // Normalize the query embedding
    const normalizedEmbedding = normalizeVector(embedding);
    setQueryPoint({
      id: 'query',
      text: searchQuery,
      embedding: normalizedEmbedding,
      category: 'query'
    });
    
    // Find nearest points by cosine similarity
    const pointsWithSimilarity = dataPoints.map(point => ({
      ...point,
      similarity: cosineSimilarity(normalizedEmbedding, point.embedding)
    }));
    
    // Sort by similarity
    const nearest = [...pointsWithSimilarity]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    
    setNearestPoints(nearest);
    setSelectedPoint(null);
  };
  
  // Reset visualization
  const resetVisualization = () => {
    setQueryPoint(null);
    setNearestPoints([]);
    setSelectedPoint(null);
    setSearchQuery('');
    setRotation({ x: 0, y: 0 });
  };
  
  // Category colors
  const categoryColors = {
    'rag': '#3B82F6', // Blue
    'graph': '#10B981', // Green
    'vector': '#8B5CF6', // Purple
    'llm': '#F59E0B', // Amber
    'ml': '#EC4899', // Pink
    'search': '#6366F1', // Indigo
    'query': '#EF4444' // Red
  };
  
  // Draw 3D vector space
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'space') return;
    
    const ctx = canvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Center of canvas
    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    
    // Scale factor
    const scale = 200;
    
    // Function to project 3D to 2D with rotation
    const project = (point) => {
      // Apply rotation
      const sinX = Math.sin(rotation.x);
      const cosX = Math.cos(rotation.x);
      const sinY = Math.sin(rotation.y);
      const cosY = Math.cos(rotation.y);
      
      const rotX = point[0];
      const rotY = point[1] * cosX - point[2] * sinX;
      const rotZ = point[1] * sinX + point[2] * cosX;
      
      const finalX = rotX * cosY - rotZ * sinY;
      const finalY = rotY;
      const finalZ = rotX * sinY + rotZ * cosY;
      
      // Project to 2D
      const x = centerX + finalX * scale;
      const y = centerY - finalY * scale;
      const z = finalZ; // Used for size/opacity
      
      return { x, y, z };
    };
    
    // Draw axes
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#CBD5E1';
    
    // X axis
    const xAxisStart = project([0, 0, 0]);
    const xAxisEnd = project([1, 0, 0]);
    ctx.beginPath();
    ctx.moveTo(xAxisStart.x, xAxisStart.y);
    ctx.lineTo(xAxisEnd.x, xAxisEnd.y);
    ctx.stroke();
    
    // Y axis
    const yAxisStart = project([0, 0, 0]);
    const yAxisEnd = project([0, 1, 0]);
    ctx.beginPath();
    ctx.moveTo(yAxisStart.x, yAxisStart.y);
    ctx.lineTo(yAxisEnd.x, yAxisEnd.y);
    ctx.stroke();
    
    // Z axis
    const zAxisStart = project([0, 0, 0]);
    const zAxisEnd = project([0, 0, 1]);
    ctx.beginPath();
    ctx.moveTo(zAxisStart.x, zAxisStart.y);
    ctx.lineTo(zAxisEnd.x, zAxisEnd.y);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Arial';
    ctx.fillText('X', xAxisEnd.x + 5, xAxisEnd.y);
    ctx.fillText('Y', yAxisEnd.x, yAxisEnd.y - 5);
    ctx.fillText('Z', zAxisEnd.x, zAxisEnd.y);
    
    // Collect all points for depth sorting
    const allPoints = [...dataPoints];
    if (queryPoint) {
      allPoints.push(queryPoint);
    }
    
    // Sort points by Z for proper depth rendering
    const sortedPoints = allPoints.map(point => ({
      point,
      proj: project(point.embedding)
    })).sort((a, b) => a.proj.z - b.proj.z);
    
    // Draw points
    sortedPoints.forEach(({ point, proj }) => {
      const isQuery = point.id === 'query';
      const isNearest = nearestPoints.some(p => p.id === point.id);
      const isSelected = selectedPoint === point.id;
      
      // Point size based on importance and depth
      const baseSize = isQuery ? 10 : 6;
      const size = baseSize * (0.75 + 0.25 * (proj.z + 1)); // Scale based on Z
      
      // Draw connection lines to nearest points from query
      if (isQuery && nearestPoints.length > 0) {
        nearestPoints.forEach(nearPoint => {
          const nearProj = project(nearPoint.embedding);
          
          // Gradient line based on similarity
          const gradient = ctx.createLinearGradient(proj.x, proj.y, nearProj.x, nearProj.y);
          gradient.addColorStop(0, categoryColors.query);
          gradient.addColorStop(1, categoryColors[nearPoint.category]);
          
          ctx.beginPath();
          ctx.moveTo(proj.x, proj.y);
          ctx.lineTo(nearProj.x, nearProj.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2 * nearPoint.similarity; // Width based on similarity
          ctx.stroke();
          
          // Show similarity score
          const midX = (proj.x + nearProj.x) / 2;
          const midY = (proj.y + nearProj.y) / 2;
          
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(nearPoint.similarity.toFixed(2), midX, midY);
        });
      }
      
      // Draw point
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size, 0, 2 * Math.PI);
      
      // Fill color based on category
      ctx.fillStyle = categoryColors[point.category] || '#94A3B8';
      
      // Modify opacity based on depth and importance
      const baseAlpha = isQuery || isNearest || isSelected ? 1.0 : 0.7;
      const depthAlpha = 0.5 + 0.5 * (proj.z + 1); // Z normalized to [0,1]
      ctx.globalAlpha = baseAlpha * depthAlpha;
      
      ctx.fill();
      
      // Stroke for selection or hover emphasis
      if (isQuery || isNearest || isSelected) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = isQuery ? '#EF4444' : isSelected ? '#000000' : '#3B82F6';
        ctx.stroke();
      }
      
      // Reset alpha
      ctx.globalAlpha = 1.0;
      
      // Draw labels if enabled
      if (showLabels || isQuery || isSelected || isNearest) {
        let label = '';
        
        if (isQuery) {
          label = 'QUERY';
        } else if (point.text.length > 25) {
          label = point.text.substring(0, 25) + '...';
        } else {
          label = point.text;
        }
        
        ctx.fillStyle = '#1F2937';
        ctx.font = isQuery || isSelected ? 'bold 11px Arial' : '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Background for label
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 12;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(
          proj.x - textWidth / 2 - 2,
          proj.y + size + 2,
          textWidth + 4,
          textHeight + 4
        );
        
        // Draw text
        ctx.fillStyle = isQuery ? '#EF4444' : isSelected ? '#000000' : '#1F2937';
        ctx.fillText(label, proj.x, proj.y + size + textHeight / 2 + 4);
      }
    });
    
  }, [dataPoints, queryPoint, nearestPoints, selectedPoint, rotation, showLabels, activeTab]);
  
  // Handle canvas mouse interactions
  const handleCanvasMouseDown = (e) => {
    if (activeTab !== 'space') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };
  
  const handleCanvasMouseMove = (e) => {
    if (activeTab !== 'space') return;
    
    if (isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation delta
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      // Update rotation (with damping)
      setRotation({
        x: rotation.x + deltaY * 0.01,
        y: rotation.y + deltaX * 0.01
      });
      
      // Update drag start
      setDragStart({ x, y });
    }
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
  };
  
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="text-xl font-bold mb-2">Vector Embedding Space</h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              activeTab === 'space' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setActiveTab('space')}
          >
            <Sigma size={14} className="inline mr-1" />
            Vector Space
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              activeTab === 'similarity' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setActiveTab('similarity')}
          >
            <Target size={14} className="inline mr-1" />
            Similarity Metrics
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              activeTab === 'explanation' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setActiveTab('explanation')}
          >
            <AlertCircle size={14} className="inline mr-1" />
            How It Works
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter a search query..."
              className="px-3 py-2 border border-gray-300 rounded-md flex-1"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-blue-500 text-white rounded-md flex items-center gap-1 hover:bg-blue-600"
            >
              <Search size={16} />
              Search
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-3 py-1 rounded-md text-sm ${
                showLabels 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {showLabels ? 'Hide Labels' : 'Show Labels'}
            </button>
            
            <button
              onClick={resetVisualization}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-1"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Main visualization area */}
        <div className="flex-1 relative">
          {activeTab === 'space' && (
            <canvas
              ref={canvasRef}
              className="w-full h-[500px]"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseLeave}
            ></canvas>
          )}
          
          {activeTab === 'similarity' && (
            <div className="p-4 h-[500px] overflow-auto">
              <h3 className="font-bold text-lg mb-4">Similarity Metrics in Vector Space</h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Cosine Similarity</h4>
                <div className="flex gap-4 items-center">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <path d="M0,0 L0,6 L9,3 z" fill="#000" />
                        </marker>
                      </defs>
                      
                      {/* Coordinate system */}
                      <line x1="10" y1="110" x2="110" y2="110" stroke="#666" strokeWidth="1" />
                      <line x1="10" y1="110" x2="10" y2="10" stroke="#666" strokeWidth="1" />
                      
                      {/* Vectors */}
                      <line x1="10" y1="110" x2="80" y2="40" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow)" />
                      <line x1="10" y1="110" x2="90" y2="70" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow)" />
                      
                      {/* Angle arc */}
                      <path d="M30 110 A 20 20 0 0 0 28 90" fill="none" stroke="#10B981" strokeWidth="1.5" />
                      <text x="32" y="100" fontSize="12" fill="#10B981">θ</text>
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm mb-2">Cosine similarity measures the cosine of the angle between two vectors:</p>
                    <div className="bg-gray-50 p-2 text-center font-mono mb-2">
                      similarity = cos(θ) = (A·B)/(||A||·||B||)
                    </div>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      <li>Ranges from -1 (opposite) to 1 (identical)</li>
                      <li>Not affected by vector magnitude, only direction</li>
                      <li>Most common metric for semantic similarity</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Euclidean Distance</h4>
                <div className="flex gap-4 items-center">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <defs>
                        <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <path d="M0,0 L0,6 L9,3 z" fill="#000" />
                        </marker>
                      </defs>
                      
                      {/* Coordinate system */}
                      <line x1="10" y1="110" x2="110" y2="110" stroke="#666" strokeWidth="1" />
                      <line x1="10" y1="110" x2="10" y2="10" stroke="#666" strokeWidth="1" />
                      
                      {/* Points */}
                      <circle cx="80" cy="40" r="3" fill="#3B82F6" />
                      <circle cx="30" cy="60" r="3" fill="#EF4444" />
                      
                      {/* Distance */}
                      <line x1="80" y1="40" x2="30" y2="60" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="50" y="40" fontSize="12" fill="#10B981">distance</text>
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm mb-2">Euclidean distance measures the straight-line distance between two points:</p>
                    <div className="bg-gray-50 p-2 text-center font-mono mb-2">
                      distance = √(Σ(a<sub>i</sub> - b<sub>i</sub>)²)
                    </div>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      <li>Affected by both direction and magnitude</li>
                      <li>Ranges from 0 (identical) to ∞</li>
                      <li>Used less often for high-dimensional embeddings</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Dot Product</h4>
                <div className="flex gap-4 items-center">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <defs>
                        <marker id="arrow3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <path d="M0,0 L0,6 L9,3 z" fill="#000" />
                        </marker>
                      </defs>
                      
                      {/* Coordinate system */}
                      <line x1="10" y1="110" x2="110" y2="110" stroke="#666" strokeWidth="1" />
                      <line x1="10" y1="110" x2="10" y2="10" stroke="#666" strokeWidth="1" />
                      
                      {/* Vectors */}
                      <line x1="10" y1="110" x2="80" y2="40" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow3)" />
                      <line x1="10" y1="110" x2="90" y2="70" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow3)" />
                      
                      {/* Projection */}
                      <line x1="80" y1="40" x2="65" y2="60" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 2" />
                      <line x1="10" y1="110" x2="65" y2="60" stroke="#10B981" strokeWidth="1.5" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm mb-2">Dot product combines direction and magnitude:</p>
                    <div className="bg-gray-50 p-2 text-center font-mono mb-2">
                      A·B = |A|·|B|·cos(θ) = Σ(a<sub>i</sub>·b<sub>i</sub>)
                    </div>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      <li>Affected by both angle and magnitude</li>
                      <li>Used in softmax-normalized similarity scores</li>
                      <li>Basis for cosine similarity when vectors are normalized</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {queryPoint && nearestPoints.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="font-semibold mb-2">Current Search Similarities</h4>
                  <div className="space-y-2">
                    {nearestPoints.map(point => (
                      <div key={point.id} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColors[point.category] }}
                        ></div>
                        <div className="flex-1 text-sm">{point.text}</div>
                        <div 
                          className="font-mono text-sm px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: `rgba(59, 130, 246, ${point.similarity})`,
                            color: point.similarity > 0.7 ? 'white' : 'black'
                          }}
                        >
                          {point.similarity.toFixed(3)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'explanation' && (
            <div className="p-4 h-[500px] overflow-auto">
              <h3 className="font-bold text-lg mb-4">How Vector Embeddings Work</h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">1. Encoding Text to Vectors</h4>
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 p-2 border border-gray-300 rounded">
                        "Retrieval Augmented Generation combines LLMs with external knowledge"
                      </div>
                      <ArrowRight size={20} className="text-blue-500" />
                      <div className="p-2 border border-gray-300 rounded bg-blue-50 font-mono text-xs">
                        [0.82, 0.71, 0.24, ..., -0.31]
                      </div>
                    </div>
                    <p className="text-sm">
                      Text is transformed into high-dimensional vectors (typically 384-1536 dimensions) using neural network models like SentenceTransformers or embeddings from LLMs like Gemini or Claude.
                    </p>
                  </div>
                  
                  <div className="text-sm mt-2">
                    <p className="font-medium">In the Jarvis Project:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Uses SentenceTransformers library with the "all-MiniLM-L6-v2" model (384 dimensions)</li>
                      <li>Both notes and chunks are embedded separately for multi-granularity retrieval</li>
                      <li>Embeddings are stored directly in Neo4j with vector indices for efficient search</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">2. Semantic Properties of Vector Space</h4>
                <div className="bg-gray-50 p-3 rounded-md mb-2">
                  <div className="flex gap-2 items-center mb-2">
                    <div className="p-2 border border-gray-300 rounded bg-blue-50 font-mono text-xs flex-1">
                      Vector("king") - Vector("man") + Vector("woman")
                    </div>
                    <span>≈</span>
                    <div className="p-2 border border-gray-300 rounded font-mono text-xs">
                      Vector("queen")
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <div className="p-2 border border-gray-300 rounded bg-green-50 font-mono text-xs flex-1">
                      Vector("Paris") - Vector("France") + Vector("Italy")
                    </div>
                    <span>≈</span>
                    <div className="p-2 border border-gray-300 rounded font-mono text-xs">
                      Vector("Rome")
                    </div>
                  </div>
                </div>
                
                <p className="text-sm">
                  Vector spaces have semantic properties where similar concepts are close together, and relationships between concepts are preserved as vector operations. This enables finding semantically related content even when keywords don't match.
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">3. Vector Search Process</h4>
                <ol className="list-decimal pl-5 space-y-3 text-sm">
                  <li>
                    <strong>Query Embedding:</strong> Convert user query to vector using the same embedding model
                  </li>
                  <li>
                    <strong>Similarity Computation:</strong> Calculate cosine similarity between query vector and all document vectors
                  </li>
                  <li>
                    <strong>Ranking:</strong> Sort results by similarity score (higher is better)
                  </li>
                  <li>
                    <strong>Filtering:</strong> Return top-K results above similarity threshold
                  </li>
                </ol>
                
                <div className="bg-blue-50 p-3 rounded-md mt-3">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Zap size={16} className="text-blue-500" />
                    In Jarvis Assistant (GraphRAG):
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm mt-1">
                    <li>
                      Initial vector search identifies semantically similar starting points
                    </li>
                    <li>
                      Graph traversal finds connected nodes through explicit relationships
                    </li>
                    <li>
                      Results are combined, with scores adjusted based on relationship distance
                    </li>
                    <li>
                      Final context includes both vector-similar and graph-connected content
                    </li>
                  </ol>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">4. Chunking Strategies</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1 p-2 border border-gray-300 rounded text-xs">
                      Long document with multiple paragraphs covering different topics and concepts...
                    </div>
                    <ArrowRight size={20} className="text-blue-500" />
                    <div className="flex flex-col gap-1">
                      <div className="p-1 border border-blue-300 rounded bg-blue-50 text-xs">Chunk 1</div>
                      <div className="p-1 border border-blue-300 rounded bg-blue-50 text-xs">Chunk 2</div>
                      <div className="p-1 border border-blue-300 rounded bg-blue-50 text-xs">Chunk 3</div>
                    </div>
                  </div>
                  
                  <p className="text-sm">
                    Documents are split into smaller chunks (typically 200-1000 tokens) to enable more precise retrieval. Jarvis uses overlapping chunks with semantic boundaries (paragraphs, headings) for better context preservation.
                  </p>
                </div>
                
                <div className="text-sm mt-2">
                  <p className="font-medium">Chunking implementation in Jarvis:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li><strong>Default size:</strong> 1000 characters per chunk</li>
                    <li><strong>Overlap:</strong> 200 characters between chunks</li>
                    <li><strong>Smart boundaries:</strong> Tries to break at sentence endings when possible</li>
                    <li><strong>Metadata preserved:</strong> Each chunk knows its source note and position</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Legend for vector space */}
          {activeTab === 'space' && (
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow-sm text-xs">
              <div className="font-semibold mb-1">Categories:</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(categoryColors).filter(([key]) => key !== 'query').map(([category, color]) => (
                  <div key={category} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span>{category}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-[10px] text-gray-500">
                <p>Drag to rotate view</p>
                <p>Points closer together have similar meaning</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Results panel */}
        <div className="w-full md:w-72 p-4 border-t md:border-t-0 md:border-l border-gray-200 overflow-auto h-[500px]">
          <h3 className="font-semibold mb-3">Vector Space Points</h3>
          
          <div className="mb-3 text-xs text-gray-500">
            <p>This visualization shows a simplified 3D projection of high-dimensional embeddings (normally 384+ dimensions).</p>
          </div>
          
          <div className="space-y-2">
            {dataPoints.map(point => (
              <div 
                key={point.id}
                className={`p-2 rounded-md border text-sm cursor-pointer ${
                  selectedPoint === point.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPoint(point.id === selectedPoint ? null : point.id)}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[point.category] }}
                  ></div>
                  <span className="text-xs text-gray-500">{point.category}</span>
                </div>
                <p className="mt-1">{point.text.length > 40 ? point.text.substring(0, 40) + '...' : point.text}</p>
                
                {nearestPoints.some(p => p.id === point.id) && (
                  <div className="mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded inline-block">
                    Similarity: {nearestPoints.find(p => p.id === point.id).similarity.toFixed(3)}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {queryPoint && (
            <div className="mt-4 p-2 rounded-md border border-red-300 bg-red-50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-800">Query Point</span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors.query }}
                ></div>
              </div>
              <p className="mt-1 text-sm">{queryPoint.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VectorSpaceVisualization;