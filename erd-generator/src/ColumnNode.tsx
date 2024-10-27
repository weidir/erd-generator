import React from "react";
// import { NodeProps, BuiltInNode } from "@xyflow/react";

// Define the BuiltInNode type with an index signature
type BuiltInNode = {
  label: string;
  parent: string;
  [key: string]: any; // Index signature to allow additional properties
};

// Define the NodeProps type
type NodeProps<T> = {
  data: T;
};

export default function ColumnNode({ data }: NodeProps<BuiltInNode>) {
  return (
    <div className="column-node" data-parentid={data?.parent}>
      {data?.label}
    </div>
  );
}
