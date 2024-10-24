import React from "react";
import { Position, NodeProps, BuiltInNode } from "@xyflow/react";

export default function TableNode({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps<BuiltInNode>) {
  return <>{data?.label}</>;
}
