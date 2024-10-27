import React from "react";
import { NodeProps, BuiltInNode } from "@xyflow/react";
import ReactTooltip from "react-tooltip";

export default function TableNode({ data }: NodeProps<BuiltInNode>) {
  return (
    <>
      <div style={{ textAlign: "center" }}>{data?.label}</div>
    </>
  );
}
