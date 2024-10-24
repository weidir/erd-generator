import React, { useCallback, useState, useEffect } from "react";
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
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Remove this
// import data from "../dbml_json.json";
// Remove this

function App() {
  // State for the DBML text input, nodes, and edges
  const [dbml, setDbml] = useState("");
  let [parsedResponse, setParsedResponsed] = useState("");
  let [parsedDbml, setParsedDbml] = useState({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Function to generate the diagram from the DBML input
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

    // Generate an array of nodes
    // Expected node structure:
    // {
    //   id: "table_name",  // Unique identifier for the node
    //   data: {
    //     label: <JSX element>,  // JSX element to render in the node
    //   },
    //   position: { x: 100 * index, y: 100 * index },  // Position of the node
    //   style: {
    //     backgroundColor: "white",  // Background color of the node
    //     color: "black",  // Text color of the node
    //     width: "200px",  // Width of the node
    //     padding: "10px",  // Padding of the node
    //   }
    // }
    let nodes = [];
    try {
      parsedDbml = parsedResponse["parsed_source"];
      setParsedDbml(parsedDbml);
      let index = 0;

      for (const table in parsedDbml) {
        const columns = parsedDbml[table].columns;

        // Map over columns to create JSX elements
        const columnElements = Object.keys(columns).map((columnKey, index) => {
          const column = columns[columnKey];

          return (
            <div
              key={index}
              style={{
                position: "relative",
                outline: "2px black solid",
              }}
            >
              {/* Field details */}
              {column.name}: {column.type.toLowerCase()}{" "}
              {column.primary_key ? "(PK)" : ""}
            </div>
          );
        });

        const node = {
          id: table,
          data: {
            label: (
              <div style={{ position: "relative" }}>
                <strong>{table}</strong>
                <br />
                <pre>{columnElements}</pre>
              </div>
            ),
          },
          position: { x: 100 * index, y: 100 * index }, // Example positioning
          style: {
            backgroundColor: "white",
            color: "black",
            width: "200px",
            padding: "10px",
          },
        };
        nodes.push(node);
        index++;
      }
    } catch (error) {
      alert("Error generating nodes");
      console.error("Error generating nodes.", error);
    }

    // Generate an array of edges
    // Expected edge structure:
    // {
    //   id: 'edge-self',
    //   source: 'self-1',
    //   target: 'self-1',
    //   type: 'selfconnecting',
    //   markerEnd: { type: MarkerType.Arrow },
    // },
    let edges = [];
    let columnEdges = [];
    try {
      for (const table in parsedDbml) {
        const refs = parsedDbml[table].refs;

        // Map over references to create edges
        for (const ref of refs) {
          const edge = {
            id: `${table}-${ref}`,
            source: table,
            target: ref,
            type: "smoothstep",
            animated: false,
            arrowHeadType: "arrowclosed",
          };
          edges.push(edge);
        }
      }
    } catch (error) {
      alert("Error generating edges");
      console.error("Error generating edges.", error);
    }

    console.log("Nodes:", nodes);
    console.log("Edges:", edges);

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

      {/* Render the diagram */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        {/* <Controls />
        <MiniMap /> */}
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default App;
