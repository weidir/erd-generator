import React from "react";
import { Position, NodeProps, BuiltInNode, Handle } from "@xyflow/react";

export default function TableNode({ data }: NodeProps<BuiltInNode>) {
  return (
    <>
      <div style={{ textAlign: "center" }}>{data?.label}</div>
    </>
  );
}
