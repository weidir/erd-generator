// Import third-party libraries
import React, { useCallback, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
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
import "./App.css";
import "./index.css";
import { parseDbml } from "./dbmlParser";
import CustomEdgeStartEnd from "./CustomEdgeStartEnd";
import getGridLayoutedElements from "./getLayoutGrid";
import getDagreLayoutedElements from "./getLayoutDagre";
import getElkLayoutedElements from "./getLayoutElk";
import TableNode from "./TableNode";
import ColumnNode from "./ColumnNode";
import {
  GenerateTableNodesEdges,
  GenerateColumnNodesEdges,
} from "./GenerateNodesEdges";
import { Markers, KeyImg } from "./SVG";

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
  // Add event listeners to highlight nodes on mouseover
  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      let target = event.target as HTMLElement;
      while (
        target &&
        !target.classList.contains("react-flow__node-columnNode") &&
        !target.classList.contains("react-flow__node-tableNode")
      ) {
        target = target.parentElement as HTMLElement;
      }
      if (target) {
        if (target.classList.contains("react-flow__node-columnNode")) {
          target.style.backgroundColor = "#4B4C52";
        } else if (target.classList.contains("react-flow__node-tableNode")) {
          target.style.outline = "2px solid #6E9AC8";
        }
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
      let target = event.target as HTMLElement;
      while (
        target &&
        !target.classList.contains("react-flow__node-columnNode") &&
        !target.classList.contains("react-flow__node-tableNode")
      ) {
        target = target.parentElement as HTMLElement;
      }
      if (target) {
        if (target.classList.contains("react-flow__node-columnNode")) {
          target.style.backgroundColor = "rgba(55, 56, 63, 0.8)";
        } else if (target.classList.contains("react-flow__node-tableNode")) {
          target.style.outline = "none";
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  // Define custom node types for tables
  const nodeTypes = {
    tableNode: TableNode,
    columnNode: ColumnNode,
  };
  // Define custom edge types that support labels and markers at the start and end
  const edgeTypes: EdgeTypes = {
    "custom-start-end": CustomEdgeStartEnd,
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
    // Center the div
    <div
      style={{
        padding: "20px",
        width: "90vw",
        height: "90vh",
        // margin: "auto",
        // display: "flex",
        // flexDirection: "column",
        // justifyContent: "center",
        // alignItems: "center",
      }}
    >
      <h1>DBML to ERD Diagram</h1>

      {/* Text area for DBML input */}
      <textarea
        id="dbml-input"
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
        snapToGrid={true}
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
      <Tooltip id="table-tool-tip" />
      <Tooltip id="column-tool-tip" />

      <Markers />
    </div>
  );
}

export default App;
