import React, { useCallback, useState } from "react";
import DbmlFlow from "./dbmlFlow";
import { parseDbml } from "./dbmlParser";
import { Button, TextareaAutosize } from "@mui/material";
import {
  Controls,
  MiniMap,
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

function App() {
  const [dbml, setDbml] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleGenerateDiagram = () => {
    // Handle empty inputs
    if (dbml.trim() === "") {
      alert("Please enter valid DBML code!");
      return;
    }

    // Parse the DBML text into a DBML object
    try {
      var parsedDbml = parseDbml(dbml); // Parse the DBML text into schema
      console.log("DBML parsed successfully!");
      // console.log(parsedDbml); // Log the schema for debugging
    } catch (error) {
      alert("Error parsing DBML. Please check the input format.");
    }
    console.log("Parsed DBML", parsedDbml);

    // Generate nodes from tables
    try {
      var nodes = [];
      const longestFieldLength = parsedDbml.schemas.reduce(
        (max, schema) =>
          Math.max(
            max,
            ...schema.tables.map((table) =>
              Math.max(
                table.name.length,
                ...table.fields.map((field) => field.name.length)
              )
            )
          ),
        0
      );
      const charWidth = 10; // Approximate width of a character in pixels
      const padding = 40; // Padding for the node
      const nodeWidth = Math.max(150, longestFieldLength * charWidth + padding); // Set dynamic width based on content

      for (let schema of parsedDbml.schemas) {
        nodes.push(
          ...schema.tables.map((table, index) => ({
            id: table.name,
            data: {
              label: (
                <div>
                  <strong>{table.name}</strong>
                  <br />
                  <pre>
                    {table.fields
                      .map((field) => `${field.name}: ${field.type}`)
                      .join("\n")}
                  </pre>
                </div>
              ),
            },
            position: { x: 100 * index, y: 100 * index }, // Example positioning
            style: {
              backgroundColor: "white",
              color: "black",
              width: `${nodeWidth}px`,
              padding: "10px",
            }, // Set background to blue and text to white
          }))
        );
      }
    } catch (error) {
      alert("Error generating nodes. Please check the input format.", error);
      console.log(
        "Error generating nodes. Please check the input format.",
        error
      );
    }

    // Generate edges from references (relationships)
    try {
      var edges = [];
      for (let schema of parsedDbml.schemas) {
        edges.push(
          ...schema.refs.map((ref) => ({
            id: `${ref.endpoints[0].tableName}-${ref.endpoints[1].tableName}`,
            source: ref.endpoints[0].tableName,
            target: ref.endpoints[1].tableName,
          }))
        );
      }
    } catch (error) {
      alert("Error generating edges. Please check the input format.", error);
      console.log(
        "Error generating edges. Please check the input format.",
        error
      );
    }
    console.log("Nodes:", nodes);
    console.log("Edges:", edges);

    setNodes(nodes); // Set the nodes state for rendering
    setEdges(edges); // Set the edges state for rendering
  };

  return (
    <div style={{ padding: "20px", width: "80vw", height: "80vh" }}>
      <h1>DBML to React Flow Diagram</h1>

      {/* Text area for DBML input */}
      <TextareaAutosize
        minRows={10}
        style={{ width: "100%", marginBottom: "20px" }}
        value={dbml} // Bound to the dbml state
        onChange={(e) => setDbml(e.target.value)} // Updates state on change
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
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default App;
