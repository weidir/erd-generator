// Import third-party libraries
import React, { useCallback, useState, useEffect } from "react";
import AceEditor from "react-ace";
import "brace/mode/javascript";
import "brace/theme/monokai";
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
import html2canvas from "html2canvas";

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
  let [dbml, setDbml] = useState("");
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

  const handleExport = useCallback(() => {
    const reactFlowWrapper = document.querySelector(".react-flow");
    if (!reactFlowWrapper) {
      alert("Error: Unable to find the React Flow diagram.");
      return;
    }

    // Use html2canvas to capture the diagram
    html2canvas(reactFlowWrapper as HTMLElement, { useCORS: true }).then(
      (canvas) => {
        // Convert the canvas to a data URL
        const image = canvas.toDataURL("image/png");

        // Create a link element to trigger download
        const downloadLink = document.createElement("a");
        downloadLink.href = image;
        downloadLink.download = "react-flow-diagram.png";
        downloadLink.click();
      }
    );
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

  // Default viewport for the diagram
  const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

  // Function to generate the diagram from the DBML input when the button is clicked
  const handleGenerateDiagram = async () => {
    // If there is no DBML input, return
    if (!dbml) {
      return;
    }

    // Parse the DBML text into a DBML object
    try {
      parsedResponse = await parseDbml(dbml); // Parse the DBML text into schema
      setParsedResponsed(parsedResponse);
      parsedDbml = parsedResponse["parsed_source"];

      // Check if "error" key exists in the response
      if (parsedDbml["error"]) {
        console.log("Error parsing DBML:", parsedDbml["error"]);
        throw new Error(parsedResponse["error"]);
      }
      setParsedDbml(parsedDbml);
      console.log("DBML parsed successfully!");
    } catch (error) {
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

  useEffect(() => {
    handleGenerateDiagram();
  }, [dbml]);

  return (
    // Center the div
    <div
      style={{
        padding: 0,
        margin: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#222222",
          color: "white",
          outline: "1px solid #333333",
        }}
      >
        <div style={{ fontSize: 30, font: "arial" }}>
          DBLM to ERD Diagram Generator
        </div>
        <button
          style={{
            backgroundColor: "#555555",
            color: "white",
            border: "none",
            // padding: "10px 20px",
            cursor: "pointer",
            fontSize: 20,
          }}
          onClick={handleExport}
        >
          <svg
            fill="#000000"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke="white"
              fill="white"
              d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Z"
            />
          </svg>
          {"         "}
          Export
        </button>
      </div>

      {/* Container for AceEditor and ReactFlow */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        {/* AceEditor on the left */}
        <div style={{ flex: 1, marginRight: "10px" }}>
          <AceEditor
            mode="javascript"
            theme="monokai"
            value={dbml}
            onChange={(value) => setDbml(value)}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* ReactFlow on the right */}
        <div style={{ flex: 2 }}>
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
            defaultViewport={defaultViewport}
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
      </div>

      <Tooltip id="table-tool-tip" />
      <Tooltip id="column-tool-tip" />

      <Markers />
    </div>
  );
}

export default App;
