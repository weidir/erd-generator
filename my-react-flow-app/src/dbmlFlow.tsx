import React from "react";
import { ReactFlow, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function DbmlFlow({ nodes, edges }) {
  return (
    <div style={{ height: 600 }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Controls />
      </ReactFlow>
    </div>
  );
}
