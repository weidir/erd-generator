import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

const elkOptions = {
  "elk.algorithm": "layered",

  "elk.spacing.nodeNode": "80",
};

const getElkLayoutedElements = async (nodes, edges, options = elkOptions) => {
  const isHorizontal = options?.["elk.direction"] === "RIGHT";
  for (const node of nodes) {
    // Get the width as an integer
    const width = parseInt(node.style.width);
  }
  const graph = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",

      // // Hardcode a width and height for elk to use when layouting.
      width: parseInt(node.style.width) ?? 400,
      height: parseInt(node.style.height) ?? 400,
    })),
    edges: edges,
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find(
      (lgNode) => lgNode.id === node.id
    );
    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
    };
  });

  return layoutedNodes;
};

export default getElkLayoutedElements;
