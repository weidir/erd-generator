import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

const elkDefaultOptions = {
  "elk.algorithm": "mrtree",
  "elk.direction": "RIGHT",
  "elk.algorthm.mrtree.options": "AVOID_OVERLAP",
  "elk.radial.spacing.nodeNode": "100",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.edgeRouting": "SPLINE",
  "elk.spacing.nodeNode": "80",
  "elk.force.temperature": "0.000001",
  // "org.eclipse.elk.portConstraints": "FIXED_ORDER",
  // "elk.layered.crossingMinimization.forceNodeModelOrder": "true",
  // "elk.layered.crossingMinimization.semiInteractive": "true",
  "elk.layered.mergeEdges": "true",
  "elk.spacing.edgeEdge": "100",
};

const getElkLayoutedElements = async (
  nodes,
  edges,
  options = elkDefaultOptions
) => {
  console.log("Given options", options);
  // Combine the default options with the given options
  options = { ...elkDefaultOptions, ...options };
  console.log("Combined options", options);
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
  console.log("Given graph: ", graph);

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
