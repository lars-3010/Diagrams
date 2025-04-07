import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, Network, GitMerge, Tag, FileText, Sigma, Target, Zap, ArrowRight, Shuffle, ArrowUp, ArrowRightCircle, Info, Link, RotateCcw, Plus, Minus } from 'lucide-react';

const InteractiveKnowledgeGraph = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [activeTraversal, setActiveTraversal] = useState(false);
  const [traversalStep, setTraversalStep] = useState(0);
  const [traversalPath, setTraversalPath] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Define sample knowledge graph
  useEffect(() => {
    const initialNodes = [
      { id: 'machine-learning', title: 'Machine Learning', type: 'note', x: 400, y: 250, tags: ['concept', 'ai'], content: 'Overview of machine learning techniques and applications' },
      { id: 'neural-networks', title: 'Neural Networks', type: 'note', x: 600, y: 200, tags: ['deep-learning', 'ai'], content: 'Fundamentals of neural networks including architecture, training algorithms, and applications' },
      { id: 'transformers', title: 'Transformer Models', type: 'note', x: 700, y: 300, tags: ['deep-learning', 'nlp'], content: 'Understanding transformer architecture and attention mechanisms' },
      { id: 'llms', title: 'Large Language Models', type: 'note', x: 600, y: 400, tags: ['ai', 'nlp'], content: 'Overview of large language models and their capabilities' },
      { id: 'embeddings', title: 'Vector Embeddings', type: 'note', x: 450, y: 400, tags: ['vector-search', 'ai'], content: 'How vector embeddings represent semantic meaning in a high-dimensional space' },
      { id: 'rag', title: 'Retrieval Augmented Generation', type: 'note', x: 300, y: 350, tags: ['ai', 'information-retrieval'], content: 'RAG combines retrieval systems with generative models to enhance accuracy' },
      { id: 'vector-search', title: 'Vector Search', type: 'note', x: 250, y: 450, tags: ['vector-search', 'information-retrieval'], content: 'Similarity search techniques in vector space' },
      { id: 'knowledge-graphs', title: 'Knowledge Graphs', type: 'note', x: 250, y: 200, tags: ['graph-theory', 'information-retrieval'], content: 'Structured representations of knowledge using entities and relationships' },
      { id: 'graph-rag', title: 'Graph-Based RAG', type: 'note', x: 400, y: 125, tags: ['rag', 'graph-theory'], content: 'Enhancing RAG with graph traversal and relationship awareness' },
      { id: 'neo4j', title: 'Neo4j Database', type: 'note', x: 550, y: 50, tags: ['database', 'graph-theory'], content: 'Popular graph database with Cypher query language' },
      { id: 'tag-ai', title: '#ai', type: 'tag', x: 150, y: 125, tags: [] },
      { id: 'tag-nlp', title: '#nlp', type: 'tag', x: 800, y: 175, tags: [] },
      { id: 'tag-vector-search', title: '#vector-search', type: 'tag', x: 350, y: 500, tags: [] },
      { id: 'tag-graph-theory', title: '#graph-theory', type: 'tag', x: 150, y: 250, tags: [] },
    ];
    
    const initialEdges = [
      { source: 'machine-learning', target: 'neural-networks', type: 'LEADS_TO', label: 'leads to' },
      { source: 'neural-networks', target: 'transformers', type: 'LEADS_TO', label: 'leads to' },
      { source: 'transformers', target: 'llms', type: 'LEADS_TO', label: 'leads to' },
      { source: 'llms', target: 'rag', type: 'LEADS_TO', label: 'leads to' },
      { source: 'embeddings', target: 'vector-search', type: 'IMPLEMENTS', label: 'implements' },
      { source: 'rag', target: 'vector-search', type: 'USES', label: 'uses' },
      { source: 'rag', target: 'llms', type: 'USES', label: 'uses' },
      { source: 'rag', target: 'embeddings', type: 'USES', label: 'uses' },
      { source: 'graph-rag', target: 'rag', type: 'EXTENDS', label: 'extends' },
      { source: 'graph-rag', target: 'knowledge-graphs', type: 'USES', label: 'uses' },
      { source: 'knowledge-graphs', target: 'neo4j', type: 'IMPLEMENTS', label: 'implements' },
      { source: 'machine-learning', target: 'knowledge-graphs', type: 'SIMILAR', label: 'similar' },
      { source: 'machine-learning', target: 'tag-ai', type: 'HAS_TAG', label: 'tagged' },
      { source: 'neural-networks', target: 'tag-ai', type: 'HAS_TAG', label: 'tagged' },
      { source: 'transformers', target: 'tag-nlp', type: 'HAS_TAG', label: 'tagged' },
      { source: 'llms', target: 'tag-ai', type: 'HAS_TAG', label: 'tagged' },
      { source: 'llms', target: 'tag-nlp', type: 'HAS_TAG', label: 'tagged' },
      { source: 'embeddings', target: 'tag-vector-search', type: 'HAS_TAG', label: 'tagged' },
      { source: 'vector-search', target: 'tag-vector-search', type: 'HAS_TAG', label: 'tagged' },
      { source: 'knowledge-graphs', target: 'tag-graph-theory', type: 'HAS_TAG', label: 'tagged' },
      { source: 'graph-rag', target: 'tag-graph-theory', type: 'HAS_TAG', label: 'tagged' },
      { source: 'neo4j', target: 'tag-graph-theory', type: 'HAS_TAG', label: 'tagged' },
    ];
    
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);
  
  // Relationship type colors and icons
  const relationshipStyles = {
    'LEADS_TO': { color: '#F59E0B', icon: <ArrowRightCircle size={14} /> },
    'USES': { color: '#3B82F6', icon: <Link size={14} /> },
    'SIMILAR': { color: '#8B5CF6', icon: <Shuffle size={14} /> },
    'EXTENDS': { color: '#10B981', icon: <ArrowUp size={14} /> },
    'IMPLEMENTS': { color: '#EC4899', icon: <ArrowRight size={14} /> },
    'HAS_TAG': { color: '#6B7280', icon: <Tag size={14} /> },
    'all': { color: '#4B5563', icon: <Zap size={14} /> }
  };
  
  // Node type styles
  const nodeStyles = {
    'note': { bgColor: '#E5EDFF', borderColor: '#3B82F6', icon: <FileText size={16} /> },
    'tag': { bgColor: '#E5E7EB', borderColor: '#6B7280', icon: <Tag size={16} /> }
  };
  
  // Search and simulate query
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Simulate semantic search + graph traversal
    const directMatches = nodes.filter(node => 
      node.type === 'note' && 
      (node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       node.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Sort by relevance (simple simulation)
    const rankedResults = directMatches.map(node => ({
      ...node,
      score: node.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.9 : 0.7
    }));
    
    // Start with highest ranked note for traversal
    if (rankedResults.length > 0) {
      setQueryResults(rankedResults);
      setSelectedNode(rankedResults[0].id);
      
      // Prepare for traversal visualization
      setTraversalPath([rankedResults[0].id]);
      setTraversalStep(0);
      setActiveTraversal(true);
      setHighlightedEdges([]);
    }
  };
  
  // Simulate graph traversal
  const advanceTraversal = () => {
    if (!activeTraversal || traversalStep >= 2) {
      setActiveTraversal(false);
      setTraversalStep(0);
      return;
    }
    
    const currentNodeId = traversalPath[traversalPath.length - 1];
    
    // Find connected nodes
    const connectedEdges = edges.filter(edge => 
      edge.source === currentNodeId && 
      edge.type !== 'HAS_TAG' &&
      (relationshipFilter === 'all' || edge.type === relationshipFilter)
    );
    
    if (connectedEdges.length > 0) {
      // Add next node to traversal path
      const nextNodeId = connectedEdges[0].target;
      setTraversalPath([...traversalPath, nextNodeId]);
      setHighlightedEdges([...highlightedEdges, connectedEdges[0]]);
      
      // Add to results if not already included
      if (!queryResults.some(r => r.id === nextNodeId)) {
        const nextNode = nodes.find(n => n.id === nextNodeId);
        if (nextNode) {
          const newResults = [...queryResults, {
            ...nextNode,
            score: 0.6 - (traversalStep * 0.1) // Decrease score with hop distance
          }];
          setQueryResults(newResults);
        }
      }
    }
    
    setTraversalStep(traversalStep + 1);
  };
  
  // Reset traversal
  const resetTraversal = () => {
    setActiveTraversal(false);
    setTraversalStep(0);
    setTraversalPath([]);
    setHighlightedEdges([]);
    setSelectedNode(null);
    setQueryResults([]);
  };
  
  // Zoom handling
  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0.5));
  };
  
  // Draw graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and center
    ctx.save();
    ctx.translate(canvas.clientWidth / 2, canvas.clientHeight / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvas.clientWidth / 2, -canvas.clientHeight / 2);
    
    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Skip if filtered
      if (relationshipFilter !== 'all' && edge.type !== relationshipFilter) {
        return;
      }
      
      const style = relationshipStyles[edge.type] || relationshipStyles.all;
      const isHighlighted = highlightedEdges.some(e => 
        e.source === edge.source && e.target === edge.target
      );
      
      // Draw edge line
      const startX = sourceNode.x;
      const startY = sourceNode.y;
      const endX = targetNode.x;
      const endY = targetNode.y;
      
      // Calculate distance and midpoint
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate start and end points (adjusted for node size)
      const nodeRadius = 25;
      const ratio = nodeRadius / distance;
      const startAdjX = startX + dx * ratio;
      const startAdjY = startY + dy * ratio;
      const endAdjX = endX - dx * ratio;
      const endAdjY = endY - dy * ratio;
      
      // Draw edge
      ctx.beginPath();
      ctx.moveTo(startAdjX, startAdjY);
      ctx.lineTo(endAdjX, endAdjY);
      ctx.strokeStyle = isHighlighted ? '#FF0000' : style.color;
      ctx.lineWidth = isHighlighted ? 3 : 1.5;
      ctx.stroke();
      
      // Draw arrow
      const arrowSize = 8;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(endAdjX, endAdjY);
      ctx.lineTo(
        endAdjX - arrowSize * Math.cos(angle - Math.PI / 6),
        endAdjY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endAdjX - arrowSize * Math.cos(angle + Math.PI / 6),
        endAdjY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.fillStyle = isHighlighted ? '#FF0000' : style.color;
      ctx.fill();
      
      // Draw edge label
      if (distance > 80) {
        const midX = (startAdjX + endAdjX) / 2;
        const midY = (startAdjY + endAdjY) / 2;
        
        // Draw label background
        ctx.fillStyle = 'white';
        const labelWidth = ctx.measureText(edge.label).width + 10;
        ctx.fillRect(midX - labelWidth/2, midY - 10, labelWidth, 20);
        
        ctx.fillStyle = isHighlighted ? '#FF0000' : style.color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.label, midX, midY);
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const style = nodeStyles[node.type] || nodeStyles.note;
      const isSelected = selectedNode === node.id;
      const isHovered = hoveredNode === node.id;
      const isInTraversal = traversalPath.includes(node.id);
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = isInTraversal ? '#FFEDD5' : style.bgColor;
      ctx.fill();
      ctx.lineWidth = isSelected || isHovered ? 3 : 1.5;
      ctx.strokeStyle = isSelected ? '#FF0000' : isHovered ? '#3B82F6' : style.borderColor;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#1F2937';
      ctx.font = isSelected ? 'bold 12px Arial' : '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text if needed
      const words = node.title.split(' ');
      let line = '';
      let y = node.y - 5;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > 40 && i > 0) {
          ctx.fillText(line, node.x, y);
          line = words[i] + ' ';
          y += 14;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, node.x, y);
    });
    
    ctx.restore();
  }, [nodes, edges, selectedNode, hoveredNode, highlightedEdges, traversalPath, relationshipFilter, zoomLevel]);
  
  // Handle canvas interactions
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    
    // Find clicked node
    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx*dx + dy*dy) <= 25;
    });
    
    if (clickedNode) {
      setSelectedNode(clickedNode.id);
    } else {
      setSelectedNode(null);
    }
  };
  
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    
    // Find hovered node
    const hoverNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx*dx + dy*dy) <= 25;
    });
    
    if (hoverNode) {
      setHoveredNode(hoverNode.id);
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredNode(null);
      canvas.style.cursor = 'default';
    }
  };
  
  // Reset hover when leaving canvas
  const handleCanvasMouseLeave = () => {
    setHoveredNode(null);
  };
  
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="text-xl font-bold mb-2">Interactive Knowledge Graph Explorer</h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the knowledge graph..."
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
            <span className="text-sm font-medium">Filter by:</span>
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Relationships</option>
              <option value="LEADS_TO">LEADS_TO</option>
              <option value="USES">USES</option>
              <option value="SIMILAR">SIMILAR</option>
              <option value="EXTENDS">EXTENDS</option>
              <option value="IMPLEMENTS">IMPLEMENTS</option>
              <option value="HAS_TAG">HAS_TAG</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleZoomOut}
              className="p-1 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="p-1 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Graph Visualization */}
        <div className="flex-1 border-r border-gray-200 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-[500px]"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
          ></canvas>
          
          {/* Legend */}
          <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow-sm text-xs">
            <div className="font-semibold mb-1">Relationships:</div>
            {Object.entries(relationshipStyles).filter(([key]) => key !== 'all').map(([type, style]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-3 h-0.5" style={{ backgroundColor: style.color }}></div>
                <span className={`flex items-center gap-0.5 ${relationshipFilter === type ? 'font-bold' : ''}`}>
                  {style.icon}
                  {type}
                </span>
              </div>
            ))}
          </div>
          
          {/* Info box */}
          {showInfo && (
            <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded shadow-sm text-xs max-w-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold flex items-center gap-1">
                  <Info size={12} />
                  How to use:
                </span>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Click nodes to view details</li>
                <li>Search for terms to simulate retrieval</li>
                <li>Use "Traverse Graph" to see a GraphRAG-style traversal</li>
                <li>Filter relationships to simplify view</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Details and Results Panel */}
        <div className="w-full md:w-80 p-4 overflow-auto h-[500px]">
          {activeTraversal && (
            <div className="mb-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
              <h3 className="font-semibold flex items-center gap-1 text-orange-700">
                <Network size={16} />
                Graph Traversal Simulation
              </h3>
              <p className="text-xs mt-1 text-orange-600">
                Step {traversalStep}: {traversalPath.length > 0 ? nodes.find(n => n.id === traversalPath[traversalPath.length - 1])?.title : 'No node'}
              </p>
              <div className="flex justify-between mt-2">
                <button
                  onClick={advanceTraversal}
                  disabled={traversalStep >= 2}
                  className={`px-2 py-1 text-xs rounded ${
                    traversalStep >= 2 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Next Hop
                </button>
                <button
                  onClick={resetTraversal}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  <RotateCcw size={12} className="inline mr-1" />
                  Reset
                </button>
              </div>
            </div>
          )}
          
          {queryResults.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-1">
                <Target size={16} />
                Search Results
              </h3>
              <div className="space-y-2">
                {queryResults.map((result, index) => (
                  <div 
                    key={result.id}
                    className={`p-2 rounded-md border text-sm cursor-pointer ${
                      selectedNode === result.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedNode(result.id)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        {result.score.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.content.length > 60 
                        ? `${result.content.substring(0, 60)}...` 
                        : result.content
                      }
                    </p>
                    <div className="flex gap-1 mt-1">
                      {result.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 px-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {index === 0 && !activeTraversal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTraversalPath([result.id]);
                          setTraversalStep(0);
                          setActiveTraversal(true);
                          setHighlightedEdges([]);
                        }}
                        className="mt-2 text-xs bg-orange-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-600"
                      >
                        <Network size={12} />
                        Traverse Graph
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedNode && (
            <div>
              <h3 className="font-semibold mb-2">Node Details</h3>
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;
                
                return (
                  <div className="p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center gap-2">
                      {nodeStyles[node.type].icon}
                      <span className="font-medium">{node.title}</span>
                    </div>
                    
                    {node.content && (
                      <p className="text-sm mt-2 text-gray-700">{node.content}</p>
                    )}
                    
                    {/* Tags */}
                    {node.tags && node.tags.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-500">Tags:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 px-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Relationships */}
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-500">Relationships:</div>
                      <div className="mt-1 space-y-1">
                        {/* Outgoing */}
                        {edges
                          .filter(edge => edge.source === node.id)
                          .map(edge => {
                            const targetNode = nodes.find(n => n.id === edge.target);
                            const style = relationshipStyles[edge.type] || relationshipStyles.all;
                            
                            return (
                              <div 
                                key={`out-${edge.target}`} 
                                className="text-xs flex items-center gap-1"
                                onClick={() => setSelectedNode(edge.target)}
                              >
                                <span style={{ color: style.color }}>
                                  {style.icon}
                                </span>
                                <span className="mr-1">{edge.label}</span>
                                <span className="font-medium cursor-pointer hover:underline">
                                  {targetNode?.title}
                                </span>
                              </div>
                            );
                          })
                        }
                        
                        {/* Incoming */}
                        {edges
                          .filter(edge => edge.target === node.id)
                          .map(edge => {
                            const sourceNode = nodes.find(n => n.id === edge.source);
                            const style = relationshipStyles[edge.type] || relationshipStyles.all;
                            
                            return (
                              <div 
                                key={`in-${edge.source}`} 
                                className="text-xs flex items-center gap-1"
                                onClick={() => setSelectedNode(edge.source)}
                              >
                                <span className="font-medium cursor-pointer hover:underline">
                                  {sourceNode?.title}
                                </span>
                                <span className="mx-1">{edge.label}</span>
                                <span style={{ color: style.color }}>
                                  {style.icon}
                                </span>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveKnowledgeGraph;