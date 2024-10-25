// Import third-party libraries
import React, { useCallback, useState } from "react";
import { Button } from "@mui/material";
import {
  type EdgeTypes,
  type Edge,
  type Node,
  Controls,
  MiniMap,
  ReactFlow,
  Panel,
  Background,
  useNodesState,
  useEdgesState,
  OnConnect,
  addEdge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Import custom functions and components
import { parseDbml } from "./dbmlParser";
import CustomEdgeStartEnd from "./CustomEdgeStartEnd";
import getGridLayoutedElements from "./getLayoutGrid";
import getDagreLayoutedElements from "./getLayoutDagre";
import getElkLayoutedElements from "./getLayoutElk";
import TableNode from "./TableNode";
import {
  GenerateTableNodesEdges,
  GenerateColumnNodesEdges,
} from "./GenerateNodesEdges";

function App() {
  // State for the DBML text input, nodes, and edges
  const [dbml, setDbml] = useState("");
  let [parsedResponse, setParsedResponsed] = useState("");
  let [parsedDbml, setParsedDbml] = useState("");
  let [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  let [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  let sources: string[] = [];
  let targets: string[] = [];
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Define custom node types for tables
  const nodeTypes = {
    tableNode: TableNode,
  };
  // Define custom edge types that support labels and markers at the start and end
  const edgeTypes: EdgeTypes = {
    "start-end": CustomEdgeStartEnd,
  };

  // Function to generate the diagram from the DBML input when the button is clicked
  const handleGenerateDiagram = async () => {
    // Handle empty inputs
    if (dbml.trim() === "") {
      alert("Please enter valid DBML code!");
      return;
    }

    // Parse the DBML text into a DBML object
    try {
      parsedResponse = await parseDbml(dbml); // Parse the DBML text into schema
      setParsedResponsed(parsedResponse);
      parsedDbml = parsedResponse["parsed_source"];
      setParsedDbml(parsedDbml);
      console.log("DBML parsed successfully!");
    } catch (error) {
      alert("Error parsing DBML. Please check the input format.");
      return;
    }
    console.log("Parsed response", parsedDbml);

    // Generate nodes and edges from the parsed DBML
    ({ nodes, edges, sources, targets } = GenerateTableNodesEdges(parsedDbml));

    console.log("Table nodes:", nodes);
    console.log("Table edges:", edges);

    // Get the proper layout for the nodes
    // nodes = getGridLayoutedElements(nodes);
    // ({ nodes, edges } = getDagreLayoutedElements(nodes, edges));
    const layoutedNodes = await getElkLayoutedElements(nodes, edges);
    nodes = layoutedNodes;
    console.log("Layouted nodes:", nodes);
    console.log("Layouted edges:", edges);

    // Generate nodes and edges for each column
    let columnNodes: Node[] = [];
    let columnEdges: Edge[] = [];
    ({ nodes: columnNodes, edges: columnEdges } = GenerateColumnNodesEdges(
      parsedDbml,
      sources,
      targets
    ));

    // Combine the table and column nodes
    nodes = [...nodes, ...columnNodes];

    // Set the nodes and edges in the diagram
    // Set the edges to only the column edges
    setNodes(nodes);
    setEdges(columnEdges);
  };

  return (
    <div style={{ padding: "20px", width: "80vw", height: "80vh" }}>
      <h1>DBML to ERD Diagram</h1>

      {/* Text area for DBML input */}
      <textarea
        rows={10}
        style={{
          width: "100%",
          height: "auto",
          overflowY: "scroll",
          resize: "none",
          marginBottom: "20px",
        }}
        value={dbml}
        onChange={(e) => setDbml(e.target.value)}
        placeholder="Paste your DBML here"
      />

      {/* Button to generate the diagram */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateDiagram}
        style={{ marginBottom: "20px" }}
      >
        Generate Diagram
      </Button>

      {/* Render the diagram */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        {/* Make the controls all black with white text */}
        <Controls
          style={{
            color: "black",
          }}
        />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      <svg style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <marker
            id="one-marker"
            markerWidth="20"
            markerHeight="20"
            refX="8"
            refY="10"
            orient="auto"
          >
            {/* <!-- Horizontal line leading to the single bar --> */}
            <line
              x1="0"
              y1="10"
              x2="15"
              y2="10"
              stroke="white"
              strokeWidth="1"
            />
            {/* <!-- Single vertical bar to represent "one" --> */}
            <line
              x1="15"
              y1="3"
              x2="15"
              y2="17"
              stroke="white"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="many-marker"
            markerWidth="50"
            markerHeight="50"
            refX="35"
            refY="25"
            orient="auto"
          >
            {/* <!-- Horizontal line leading to the crow's foot --> */}
            <line
              x1="0"
              y1="25"
              x2="20"
              y2="25"
              stroke="white"
              strokeWidth="1"
            />
            {/* <!-- First prong of the crow's foot --> */}
            <line
              x1="20"
              y1="25"
              x2="40"
              y2="10"
              stroke="white"
              strokeWidth="1"
            />
            {/* <!-- Second prong of the crow's foot (center) --> */}
            <line
              x1="20"
              y1="25"
              x2="40"
              y2="25"
              stroke="white"
              strokeWidth="1"
            />
            {/* <!-- Third prong of the crow's foot --> */}
            <line
              x1="20"
              y1="25"
              x2="40"
              y2="40"
              stroke="white"
              strokeWidth="1"
            />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default App;
