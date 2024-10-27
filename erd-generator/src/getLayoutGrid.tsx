import { Node } from "@xyflow/react";

// Get the maximum width and height of the nodes
const getMaxWidthHeight = (nodes) => {
  let maxWidth = 0;
  let maxHeight = 0;
  for (const node of nodes) {
    let width = parseInt(node.style.width);
    let height = parseInt(node.style.height);
    if (width > maxWidth) {
      maxWidth = width;
    }
    if (height > maxHeight) {
      maxHeight = height;
    }
  }
  return { maxWidth, maxHeight };
};

const getGridLayoutedElements = (nodes: Node[]) => {
  const size = nodes.length;

  // Get the maximum width and height of the nodes
  const { maxWidth, maxHeight } = getMaxWidthHeight(nodes);
  console.log("Max Width:", maxWidth, "Max Height:", maxHeight);

  // Calculate the number of rows and columns
  const rows = Math.ceil(Math.sqrt(size));
  const cols = Math.ceil(size / rows);
  console.log("Rows:", rows, "Cols:", cols);

  // Calculate the positions of each node
  // Spread the nodes out in a grid with spacing between them
  const newNodes = nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = col * maxWidth + 50 * col;
    const y = row * maxHeight + 50 * row;

    return {
      ...node,
      position: { x, y },
    };
  });
  return newNodes;
};

export default getGridLayoutedElements;
