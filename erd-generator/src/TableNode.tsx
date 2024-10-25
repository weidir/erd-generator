import React from "react";
import { Position, NodeProps, BuiltInNode, Handle } from "@xyflow/react";

export default function TableNode({
  data,
  isConnectable,
  targetPosition = Position.Left,
  sourcePosition = Position.Right,
}: NodeProps<BuiltInNode>) {
  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      {data?.label}
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
      />
    </>
  );
}
