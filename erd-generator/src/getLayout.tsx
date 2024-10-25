import { Node, Edge, Position } from "@xyflow/react";

const nodeWidth = 300;
const nodeHeight = 400;

const getLayoutedElements = (nodes: Node[]) => {
  const size = nodes.length;

  // Calculate the number of rows and columns
  const rows = Math.ceil(Math.sqrt(size));
  const cols = Math.ceil(size / rows);
  console.log("Rows:", rows, "Cols:", cols);

  // Calculate the positions of each node
  // Spread the nodes out in a grid with spacing between them
  const newNodes = nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = col * nodeWidth + 50 * col;
    const y = row * nodeHeight + 50 * row;

    return {
      ...node,
      position: { x, y },
    };
  });
  return newNodes;
};

export default getLayoutedElements;
