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
import getLayoutedElements from "./getLayout";
import TableNode from "./TableNode";
import GenerateNodesEdges from "./GenerateNodesEdges";

function App() {
  // State for the DBML text input, nodes, and edges
  const [dbml, setDbml] = useState("");
  let [parsedResponse, setParsedResponsed] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
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
      console.log("DBML parsed successfully!");
    } catch (error) {
      alert("Error parsing DBML. Please check the input format.");
      return;
    }
    console.log("Parsed response", parsedResponse);

    // Generate nodes and edges from the parsed DBML
    let { nodes, edges } = GenerateNodesEdges(parsedResponse);

    console.log("Nodes:", nodes);
    console.log("Edges:", edges);

    // NEED TO IMPLEMENT THIS //
    // @Isabel
    // Get the proper layout for the nodes
    // nodes = getLayoutedElements(nodes);
    // console.log("Layouted nodes:", nodes);
    // NEED TO IMPLEMENT THIS //

    setNodes(nodes);
    setEdges(edges);
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

      <svg style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <marker id="one-marker">
            <line
              x1="10"
              y1="25"
              x2="80"
              y2="25"
              stroke="black"
              strokeWidth="2"
            />
            <line
              x1="80"
              y1="15"
              x2="80"
              y2="35"
              stroke="black"
              strokeWidth="2"
            />
          </marker>
          <marker id="many-marker">
            <line
              x1="10"
              y1="25"
              x2="70"
              y2="25"
              stroke="black"
              strokeWidth="2"
            />
            <line
              x1="70"
              y1="25"
              x2="90"
              y2="10"
              stroke="black"
              strokeWidth="2"
            />
            <line
              x1="70"
              y1="25"
              x2="90"
              y2="25"
              stroke="black"
              strokeWidth="2"
            />
            <line
              x1="70"
              y1="25"
              x2="90"
              y2="40"
              stroke="black"
              strokeWidth="2"
            />
          </marker>
        </defs>
      </svg>

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
    </div>
  );
}

export default App;
