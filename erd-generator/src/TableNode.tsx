import React from "react";
import { NodeProps, BuiltInNode } from "@xyflow/react";

export default function TableNode({ data }: NodeProps<BuiltInNode>) {
  return <div className="table-node">{data?.label}</div>;
}
