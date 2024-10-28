// Import third-party libraries
import React, { useCallback, useState, useEffect, useRef } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import { Tooltip } from "react-tooltip";
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
  FitViewOptions,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";

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
import DownloadButton from "./DownloadButton";

function App() {
  // State for the DBML text input, nodes, and edges
  let [dbml, setDbml] = useState("");
  let [parsedResponse, setParsedResponsed] = useState("");
  let [parsedDbml, setParsedDbml] = useState("");
  let [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  let [tableNodes, setTableNodes] = useState<Node[]>([]);
  let [columnNodes, setColumnNodes] = useState<Node[]>([]);
  let [tableEdges, setTableEdges] = useState<Edge[]>([]);
  let [columnEdges, setColumnEdges] = useState<Edge[]>([]);
  let [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  let [activeAlgorithm, setActiveAlgorithm] = useState("ELK");
  let sources: string[] = [];
  let targets: string[] = [];

  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(30); // Initial width of the left pane in percentage
  const [isResizing, setIsResizing] = useState(false);

  // Start resizing when mouse is down on the resizer
  const startResizing = () => setIsResizing(true);

  // Stop resizing when mouse is up or out
  const stopResizing = () => setIsResizing(false);

  // Handle resizing the panes
  const resizePane = (event) => {
    if (!isResizing || !containerRef.current) return;

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const newWidth = (event.clientX / containerWidth) * 100;
    if (newWidth > 10 && newWidth < 90) {
      setLeftPaneWidth(newWidth); // Limit to avoid collapse
    }
  };
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

  // const handleExport = useCallback(() => {
  //   const reactFlowWrapper = document.querySelector(".react-flow");
  //   if (!reactFlowWrapper) {
  //     alert("Error: Unable to find the React Flow diagram.");
  //     return;
  //   }

  //   // Use html2canvas to capture the diagram
  //   html2canvas(reactFlowWrapper as HTMLElement, {
  //     useCORS: true,
  //     backgroundColor: "#242424",
  //   }).then((canvas) => {
  //     // Convert the canvas to a data URL
  //     const image = canvas.toDataURL("image/png");

  //     // Create a link element to trigger download
  //     const downloadLink = document.createElement("a");
  //     downloadLink.href = image;
  //     downloadLink.download = "diagram.png";
  //     downloadLink.click();
  //   });
  // }, []);

  // Define custom node types for tables
  const nodeTypes = {
    tableNode: TableNode,
    columnNode: ColumnNode,
  };
  // Define custom edge types that support labels and markers at the start and end
  const edgeTypes: EdgeTypes = {
    "custom-start-end": CustomEdgeStartEnd,
  };
  const fitViewOptions: FitViewOptions = {
    minZoom: 0.01,
    maxZoom: 1.5,
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
    ({
      nodes: tableNodes,
      edges: tableEdges,
      sources,
      targets,
    } = GenerateTableNodesEdges(parsedDbml));

    console.log("Table nodes:", tableNodes);
    console.log("Table edges:", tableNodes);

    // Get the proper layout for the nodes
    // nodes = getGridLayoutedElements(nodes);
    // ({ nodes, edges } = getDagreLayoutedElements(nodes, edges));
    const layoutedNodes = await getElkLayoutedElements(tableNodes, tableEdges);
    tableNodes = layoutedNodes;
    console.log("Layouted nodes:", tableNodes);
    console.log("Layouted edges:", tableEdges);

    // Generate nodes and edges for each column
    let columnNodes: Node[] = [];
    let columnEdges: Edge[] = [];
    ({ nodes: columnNodes, edges: columnEdges } = GenerateColumnNodesEdges(
      parsedDbml,
      sources,
      targets
    ));

    // Combine the table and column nodes
    nodes = [...tableNodes, ...columnNodes];

    // Set the nodes and edges in the diagram
    // Set the edges to only the column edges
    setNodes(nodes);
    setEdges(columnEdges);
  };

  useEffect(() => {
    handleGenerateDiagram();
  }, [dbml]);

  // const elk = new ELK();

  // const defaultELKOptions = {
  //   "elk.algorithm": "layered",
  //   "elk.layered.spacing.nodeNodeBetweenLayers": 100,
  //   "elk.spacing.nodeNode": 80,
  // };

  // const useLayoutedElements = () => {
  //   const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
  //   const defaultOptions = {
  //     "elk.algorithm": "layered",
  //     "elk.layered.spacing.nodeNodeBetweenLayers": 100,
  //     "elk.spacing.nodeNode": 80,
  //   };

  //   const getLayoutedElements = useCallback((options) => {
  //     const layoutOptions = { ...defaultOptions, ...options };
  //     const graph = {
  //       id: "root",
  //       layoutOptions: layoutOptions,
  //       children: getNodes().map((node) => ({
  //         ...node,
  //         width: node.measured ? node.measured.width : 300,
  //         height: node.measured ? node.measured.height : 300,
  //       })),
  //       edges: getEdges(),
  //     };

  //     elk
  //       .layout({
  //         ...graph,
  //         edges: graph.edges.map((edge) => ({
  //           ...edge,
  //           sources: [edge.source],
  //           targets: [edge.target],
  //         })),
  //       })
  //       .then(({ children }) => {
  //         // By mutating the children in-place we saves ourselves from creating a
  //         // needless copy of the nodes array.
  //         children?.forEach((node) => {
  //           (node as any).position = { x: node.x, y: node.y };
  //         });

  //         setNodes(children as Node[]);
  //         window.requestAnimationFrame(() => {
  //           fitView();
  //         });
  //       });
  //   }, []);

  //   return { getLayoutedElements };
  // };

  // const { getLayoutedElements } = useLayoutedElements();

  return (
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
          // backgroundColor: "#222222",
          color: "white",
          outline: "1px solid #333333",
        }}
      >
        <div style={{ fontSize: 30, font: "arial", alignContent: "center" }}>
          <img
            src="/dbml.png"
            alt="DBML Logo"
            style={{ width: 23, height: 23 }}
          />
          {"   "}
          <b>DBLM to ERD Diagram Generator</b>
        </div>
        {/* <button
          style={{
            backgroundColor: "#333333",
            color: "white",
            border: "none",
            padding: "5px 20px",
            cursor: "pointer",
            fontSize: 20,
            height: "40px",
            width: "auto",
            alignContent: "center",
          }}
          onClick={handleExport}
        >
          <svg
            fill="#000000"
            width="16px"
            height="16px"
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
        </button> */}
      </div>

      {/* Container for AceEditor and ReactFlow */}
      <div
        className="split-container"
        ref={containerRef}
        onMouseMove={resizePane}
        onMouseUp={stopResizing}
        onMouseLeave={stopResizing}
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        {/* AceEditor on the left */}
        <div className="pane pane-left" style={{ width: `${leftPaneWidth}%` }}>
          <AceEditor
            mode="javascript"
            theme="monokai"
            showPrintMargin={false}
            value={dbml}
            onChange={(value) => setDbml(value)}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Resizer */}
        <div className="resizer" onMouseDown={startResizing}></div>

        <div className="pane pane-right">
          {" "}
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
            fitViewOptions={fitViewOptions}
            style={{
              outline: "1px solid #333333",
              width: "100%",
              height: "100%",
            }}
            className="download-image"
          >
            {/* Make the controls all black with white text */}
            <Controls
              showInteractive={true}
              showZoom={true}
              showFitView={true}
              style={{
                color: "black",
              }}
            />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <DownloadButton />
            {/* Panel for layout buttons, aligned vertically */}
            {/* <Panel position="top-right">
              <button
                onClick={() =>
                  getLayoutedElements({
                    "elk.algorithm": "layered",
                    "elk.direction": "DOWN",
                  })
                }
              >
                vertical layout
              </button>
              <button
                onClick={() =>
                  getLayoutedElements({
                    "elk.algorithm": "layered",
                    "elk.direction": "RIGHT",
                  })
                }
              >
                horizontal layout
              </button>
              <button
                onClick={() =>
                  getLayoutedElements({
                    "elk.algorithm": "org.eclipse.elk.radial",
                  })
                }
              >
                radial layout
              </button>
              <button
                onClick={() =>
                  getLayoutedElements({
                    "elk.algorithm": "org.eclipse.elk.force",
                  })
                }
              >
                force layout
              </button>
            </Panel> */}
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
