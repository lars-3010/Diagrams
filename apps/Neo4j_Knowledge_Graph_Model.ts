import React, { useState } from 'react';
import { Database, Tag, Link, GitMerge, ArrowRight, ArrowUp, Shuffle, ArrowRightCircle, Sigma, FileText, ChevronDown, ChevronRight, Code } from 'lucide-react';

const Neo4jGraphExplorer = () => {
  const [openSection, setOpenSection] = useState('schema');
  const [selectedRelationship, setSelectedRelationship] = useState('LINKS_TO');
  const [showCypher, setShowCypher] = useState(false);
  
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };
  
  const relationships = [
    { 
      type: 'LINKS_TO', 
      icon: <Link size={16} />, 
      description: 'Basic Markdown link between notes',
      example: 'A note references another with [[link]]',
      cypher: 'MATCH (source:Note {path: $source_path})\nMERGE (target:Note {path: $target_path})\nON CREATE SET target.title = $target_title\nMERGE (source)-[r:LINKS_TO]->(target)',
      color: 'text-blue-500'
    },
    { 
      type: 'UP', 
      icon: <ArrowUp size={16} />, 
      description: 'Hierarchical parent relationship',
      example: 'Parent concept or category',
      cypher: 'MATCH (child:Note {path: $source_path})\nMERGE (parent:Note {path: $target_path})\nMERGE (child)-[:UP {type: "up::"}]->(parent)',
      color: 'text-green-500'
    },
    { 
      type: 'SIMILAR', 
      icon: <Shuffle size={16} />, 
      description: 'Notes with related concepts',
      example: 'Alternative approaches or viewpoints',
      cypher: 'MATCH (n:Note {path: $source_path})\nMERGE (similar:Note {path: $target_path})\nMERGE (n)-[:SIMILAR {type: "similar"}]->(similar)',
      color: 'text-purple-500'
    },
    { 
      type: 'LEADS_TO', 
      icon: <ArrowRightCircle size={16} />, 
      description: 'Sequential or consequential relationship',
      example: 'This concept leads to that outcome',
      cypher: 'MATCH (source:Note {path: $source_path})\nMERGE (target:Note {path: $target_path})\nMERGE (source)-[:LEADS_TO {type: "leads_to"}]->(target)',
      color: 'text-amber-500'
    },
    { 
      type: 'CONTRADICTS', 
      icon: <GitMerge size={16} />, 
      description: 'Opposing viewpoint or contradiction',
      example: 'Conflicting theories or approaches',
      cypher: 'MATCH (n:Note {path: $source_path})\nMERGE (opposing:Note {path: $target_path})\nMERGE (n)-[:CONTRADICTS {type: "contradicts"}]->(opposing)',
      color: 'text-red-500'
    },
    { 
      type: 'HAS_TAG', 
      icon: <Tag size={16} />, 
      description: 'Note is tagged with a specific tag',
      example: 'Tagging notes for categorization',
      cypher: 'MATCH (n:Note {path: $note_path})\nUNWIND $tags AS tagName\nMERGE (t:Tag {name: tagName})\nMERGE (n)-[:HAS_TAG]->(t)',
      color: 'text-teal-500'
    },
    { 
      type: 'HAS_CHUNK', 
      icon: <FileText size={16} />, 
      description: 'Note contains a text chunk with embedding',
      example: 'Breaking notes into smaller retrievable chunks',
      cypher: 'MATCH (n:Note) WHERE id(n) = $note_id\nMERGE (c:Chunk {id: $chunk_id})\nON CREATE SET c.text = $text, c.embedding = $embedding\nMERGE (n)-[:HAS_CHUNK]->(c)',
      color: 'text-indigo-500'
    }
  ];
  
  // Sample schema definition (simplified from the project)
  const schemaDefinition = `// Basic schema constraints and indices
CREATE CONSTRAINT note_path_unique IF NOT EXISTS 
  FOR (n:Note) REQUIRE n.path IS UNIQUE;
CREATE CONSTRAINT tag_name_unique IF NOT EXISTS 
  FOR (n:Tag) REQUIRE n.name IS UNIQUE;
CREATE CONSTRAINT chunk_id_unique IF NOT EXISTS 
  FOR (c:Chunk) REQUIRE c.id IS UNIQUE;

// Create indices for frequently queried properties
CREATE INDEX note_title_index IF NOT EXISTS FOR (n:Note) ON (n.title);
CREATE INDEX note_updated_index IF NOT EXISTS FOR (n:Note) ON (n.updated);
CREATE INDEX tag_name_index IF NOT EXISTS FOR (t:Tag) ON (t.name);

// Create vector index for note embeddings
CREATE VECTOR INDEX note_embedding_index IF NOT EXISTS 
FOR (n:Note) ON (n.embedding)
OPTIONS {
  indexConfig: {
    \`vector.dimensions\`: 384,  // For 'all-MiniLM-L6-v2' model
    \`vector.similarity_function\`: 'cosine'
  }
};`;

  const vectorSearchCypher = `// Vector search for similar notes
MATCH (n:Note)
WHERE n.embedding IS NOT NULL
WITH n, vector.similarity(n.embedding, $query_embedding) AS similarity
WHERE similarity >= 0.7
RETURN n.path as path, n.title as title, similarity
ORDER BY similarity DESC
LIMIT 5;

// Vector search for similar chunks
MATCH (c:Chunk)
WITH c, vector.similarity(c.embedding, $query_embedding) AS similarity
WHERE similarity >= 0.7
MATCH (n:Note)-[:HAS_CHUNK]->(c)
RETURN c.id as id, c.text as text, similarity,
       n.path as note_path, n.title as note_title
ORDER BY similarity DESC
LIMIT 10;`;

  const graphSearchCypher = `// Graph-based similarity search
MATCH (source:Note {path: $source_path})

// Similarity through tags
OPTIONAL MATCH (source)-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(similar1:Note)
WHERE similar1 <> source

// Similarity through shared relationships
OPTIONAL MATCH (source)-[r1]->(shared)<-[r2]-(similar2:Note)
WHERE similar2 <> source AND type(r1) = type(r2)

// Similarity through direct semantic relationships
OPTIONAL MATCH (source)-[r3]-(similar3:Note)
WHERE similar3 <> source AND type(r3) <> 'LINKS_TO' AND type(r3) <> 'HAS_TAG'

// Combine results and calculate similarity score
WITH source, 
     collect(distinct similar1) as similar_by_tags, 
     collect(distinct similar2) as similar_by_shared,
     collect(distinct similar3) as similar_by_direct

UNWIND similar_by_tags + similar_by_shared + similar_by_direct as similar
WITH similar, count(similar) as frequency
ORDER BY frequency DESC
LIMIT 10

RETURN similar.path as path, similar.title as title, 
       frequency as similarity_score`;

  const hybridSearchCypher = `// Graph-augmented vector search
MATCH (n:Note)
WHERE n.embedding IS NOT NULL
WITH n, vector.similarity(n.embedding, $query_embedding) AS similarity
WHERE similarity >= 0.7
WITH n, similarity
ORDER BY similarity DESC
LIMIT 3

// Traverse the graph from initial seed notes
MATCH (n)-[r]-(connected:Note)
WHERE type(r) <> 'HAS_TAG'
RETURN n.path as source_path, n.title as source_title, 
       similarity as source_similarity,
       connected.path as connected_path, connected.title as connected_title,
       type(r) as relationship_type
LIMIT 15;`;
  
  const selectedRelData = relationships.find(r => r.type === selectedRelationship);
  
  return (
    <div className="flex flex-col w-full bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-6">Neo4j Knowledge Graph Model in Jarvis Assistant</h2>
      
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setShowCypher(!showCypher)} 
          className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          <Code size={16} />
          {showCypher ? 'Hide Cypher' : 'Show Cypher'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graph Model */}
        <div className="bg-white rounded-lg shadow p-4">
          <div 
            className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded"
            onClick={() => toggleSection('schema')}
          >
            <div className="flex items-center gap-2">
              <Database size={20} />
              <h3 className="font-semibold">Schema Definition</h3>
            </div>
            {openSection === 'schema' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {openSection === 'schema' && (
            <div className="mt-2 pl-6 border-l-2 border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-semibold">Note</span>
                </div>
                <div className="pl-5 text-sm text-gray-600">
                  <p><strong>Properties:</strong> path, title, content, created, updated, tags, embedding</p>
                  <p><strong>Constraints:</strong> Unique path</p>
                  <p><strong>Indices:</strong> title, updated, embedding (vector)</p>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-semibold">Tag</span>
                </div>
                <div className="pl-5 text-sm text-gray-600">
                  <p><strong>Properties:</strong> name</p>
                  <p><strong>Constraints:</strong> Unique name</p>
                  <p><strong>Indices:</strong> name</p>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-semibold">Chunk</span>
                </div>
                <div className="pl-5 text-sm text-gray-600">
                  <p><strong>Properties:</strong> id, text, embedding, start_pos, end_pos, note_id</p>
                  <p><strong>Constraints:</strong> Unique id</p>
                  <p><strong>Indices:</strong> note_id, embedding (vector)</p>
                </div>
                
                {showCypher && (
                  <div className="mt-2 bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-auto">
                    <pre>{schemaDefinition}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div 
            className="flex items-center justify-between cursor-pointer p-2 mt-4 hover:bg-gray-100 rounded"
            onClick={() => toggleSection('relationships')}
          >
            <div className="flex items-center gap-2">
              <ArrowRight size={20} />
              <h3 className="font-semibold">Semantic Relationships</h3>
            </div>
            {openSection === 'relationships' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {openSection === 'relationships' && (
            <div className="mt-2 pl-6 border-l-2 border-gray-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {relationships.map(rel => (
                  <button
                    key={rel.type}
                    className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                      selectedRelationship === rel.type 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => setSelectedRelationship(rel.type)}
                  >
                    <span className={`mr-1 ${rel.color}`}>{rel.icon}</span>
                    {rel.type}
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={`${selectedRelData.color}`}>{selectedRelData.icon}</span>
                  <h4 className="font-semibold">{selectedRelData.type}</h4>
                </div>
                <p className="mt-1 text-gray-700">{selectedRelData.description}</p>
                <p className="mt-1 text-sm text-gray-600"><strong>Example:</strong> {selectedRelData.example}</p>
                
                {showCypher && (
                  <div className="mt-2 bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-auto">
                    <pre>{selectedRelData.cypher}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div 
            className="flex items-center justify-between cursor-pointer p-2 mt-4 hover:bg-gray-100 rounded"
            onClick={() => toggleSection('vectorsearch')}
          >
            <div className="flex items-center gap-2">
              <Sigma size={20} />
              <h3 className="font-semibold">Vector Search Capabilities</h3>
            </div>
            {openSection === 'vectorsearch' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {openSection === 'vectorsearch' && (
            <div className="mt-2 pl-6 border-l-2 border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                Neo4j 5.11+ supports native vector search with cosine similarity calculations.
                This project uses sentence-transformers to generate embeddings for notes and chunks.
              </p>
              
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-sm">Note-level embeddings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-sm">Chunk-level embeddings for finer granularity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="font-medium text-sm">Hybrid search combining vectors and keywords</span>
                </div>
              </div>
              
              {showCypher && (
                <div className="mt-3 bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-auto">
                  <pre>{vectorSearchCypher}</pre>
                </div>
              )}
            </div>
          )}
          
          <div 
            className="flex items-center justify-between cursor-pointer p-2 mt-4 hover:bg-gray-100 rounded"
            onClick={() => toggleSection('graphsearch')}
          >
            <div className="flex items-center gap-2">
              <GitMerge size={20} />
              <h3 className="font-semibold">Graph-Augmented Search</h3>
            </div>
            {openSection === 'graphsearch' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {openSection === 'graphsearch' && (
            <div className="mt-2 pl-6 border-l-2 border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                GraphRAG combines semantic vector search with graph traversal to enhance retrieval.
              </p>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-sm">Relationship-based similarity</span>
                </div>
                <p className="text-xs text-gray-600 pl-4">
                  Finding notes related through explicit relationships rather than content similarity
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-sm">Hybrid search strategy</span>
                </div>
                <p className="text-xs text-gray-600 pl-4">
                  Vector search identifies entry points, then graph traversal expands the context
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="font-medium text-sm">Multi-hop reasoning</span>
                </div>
                <p className="text-xs text-gray-600 pl-4">
                  Following connections to discover indirectly related information
                </p>
              </div>
              
              {showCypher && (
                <div className="mt-3 mb-2 bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-auto">
                  <h5 className="text-gray-400 mb-1">// Graph-based similarity</h5>
                  <pre>{graphSearchCypher}</pre>
                  
                  <h5 className="text-gray-400 mt-4 mb-1">// Hybrid graph-vector search</h5>
                  <pre>{hybridSearchCypher}</pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Graph Visualization */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Knowledge Graph Visualization</h3>
          
          <div className="w-full h-96 bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden">
            {/* Sample interactive graph visualization */}
            <div className="absolute inset-0 p-4">
              {/* Center note */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-center shadow-lg z-10">
                <div>
                  <div className="text-xs text-blue-800 font-semibold">Main-Note.md</div>
                </div>
              </div>
              
              {/* LINKS_TO relationship */}
              <div className="absolute top-[42%] right-[20%] w-20 h-20 rounded-full bg-gray-100 border-2 border-blue-400 flex items-center justify-center text-center shadow z-10">
                <div>
                  <div className="text-xs text-gray-800">Linked-Note.md</div>
                </div>
              </div>
              <svg className="absolute inset-0" style={{zIndex: 5}}>
                <defs>
                  <marker id="arrowhead-blue" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                    <polygon points="0 0, 5 2.5, 0 5" fill="#3B82F6" />
                  </marker>
                </defs>
                <path 
                  d="M 250,200 L 320,170" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
                  fill="none"
                  markerEnd="url(#arrowhead-blue)"
                />
                <text x="285" y="165" fill="#3B82F6" className="text-xs">LINKS_TO</text>
              </svg>
              
              {/* UP relationship */}
              <div className="absolute top-[20%] left-[45%] w-20 h-20 rounded-full bg-gray-100 border-2 border-green-400 flex items-center justify-center text-center shadow z-10">
                <div>
                  <div className="text-xs text-gray-800">Parent-Note.md</div>
                </div>
              </div>
              <svg className="absolute inset-0" style={{zIndex: 5}}>
                <defs>
                  <marker id="arrowhead-green" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                    <polygon points="0 0, 5 2.5, 0 5" fill="#10B981" />
                  </marker>
                </defs>
                <path 
                  d="M 250,180 L 230,120" 
                  stroke="#10B981" 
                  strokeWidth="2" 
                  fill="none"
                  markerEnd="url(#arrowhead-green)"
                />
                <text x="220" y="150" fill="#10B981" className="text-xs">UP</text>
              </svg>
              
              {/* SIMILAR relationship */}
              <div className="absolute bottom-[20%] left-[30%] w-20 h-20 rounded-full bg-gray-100 border-2 border-purple-400 flex items-center justify-center text-center shadow z-10">
                <div>
                  <div className="text-xs text-gray-800">Similar-Note.md</div>
                </div>
              </div>
              <svg className="absolute inset-0" style={{zIndex: 5}}>
                <defs>
                  <marker id="arrowhead-purple" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                    <polygon points="0 0, 5 2.5, 0 5" fill="#8B5CF6" />
                  </marker>
                </defs>
                <path 
                  d="M 220,220 L 180,280" 
                  stroke="#8B5CF6" 
                  strokeWidth="2" 
                  fill="none"
                  markerEnd="url(#arrowhead-purple)"
                />
                <text x="180" y="250" fill="#8B5CF6" className="text-xs">SIMILAR</text>
              </svg>
              
              {/* LEADS_TO relationship */}
              <div className="absolute top-[60%] right-[35%] w-20 h-20 rounded-full bg-gray-100 border-2 border-amber-400 flex items-center justify-center text-center shadow z-10">
                <div>
                  <div className="text-xs text-gray-800">Next-Note.md</div>
                </div>
              </div>
              <svg className="absolute inset-0" style={{zIndex: 5}}>
                <defs>
                  <marker id="arrowhead-amber" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                    <polygon points="0 0, 5 2.5, 0 5" fill="#F59E0B" />
                  </marker>
                </defs>
                <path 
                  d="M 260,220 L 290,260" 
                  stroke="#F59E0B" 
                  strokeWidth="2" 
                  fill="none"
                  markerEnd="url(#arrowhead-amber)"
                />
                <text x="285" y="240" fill="#F59E0B" className="text-xs">LEADS_TO</text>
              </svg>
              
              {/* HAS_TAG relationship */}
              <div className="absolute top-[30%] left-[20%] w-16 h-16 rounded-full bg-teal-100 border-2 border-teal-400 flex items-center justify-center text-center shadow z-10">
                <div>
                  <div className="text-xs text-teal-800">#concept</div>
                </div>
              </div>
              <svg className="absolute inset-0" style={{zIndex: 5}}>
                <path 
                  d="M 220,180 L 160,130" 
                  stroke="#14B8A6" 
                  strokeWidth="2" 
                  strokeDasharray="4"
                  fill="none"
                />
                <text x="170" y="160" fill="#14B8A6" className="text-xs">HAS_TAG</text>
              </svg>
              
              {/* Explanation */}
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 p-2 rounded shadow-sm text-xs">
                <div className="font-semibold mb-1">Legend:</div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-blue-500 bg-blue-100"></div>
                  <span>Notes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-teal-500 bg-teal-100"></div>
                  <span>Tags</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Colored lines represent different relationship types
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Key Graph Model Features:</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Notes are represented as nodes with properties (content, tags, embeddings)</li>
              <li>Semantic relationships capture meaning beyond simple links</li>
              <li>Tags provide categorization across knowledge base</li>
              <li>Text chunks enable fine-grained retrieval</li>
              <li>Vector embeddings support semantic search</li>
              <li>Graph traversal finds related content beyond vector similarity</li>
            </ul>
            
            <p className="text-sm mt-3 italic text-gray-600">
              In Jarvis Assistant, the Neo4j graph model enables GraphRAG by combining semantic embeddings with explicit knowledge relationships, providing richer context for the LLM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Neo4jGraphExplorer;