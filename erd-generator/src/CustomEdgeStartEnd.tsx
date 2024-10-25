import React, { type FC } from "react";
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";

// this is a little helper component to render the actual edge label
function EdgeLabel({ transform, label }: { transform: string; label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        background: "transparent",
        padding: 10,
        color: "white",
        fontSize: 20,
        fontWeight: 700,
        transform,
      }}
      className="nodrag nopan"
    >
      {label}
    </div>
  );
}

const CustomEdgeStartEnd: FC<
  EdgeProps<
    Edge<{
      startLabel: string;
      endLabel: string;
      markerStart: { type: string };
      markerEnd: { type: string };
    }>
  >
> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const markerStart = data?.markerStart?.type;
  const markerEnd = data?.markerEnd?.type;
  console.log("markerStart", markerStart);
  console.log("markerEnd", markerEnd);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={`url(#${markerStart})`}
        markerEnd={`url(#${markerEnd})`}
      />
      <EdgeLabelRenderer>
        {data?.startLabel && (
          <EdgeLabel
            transform={`translate(${sourceX}px,${sourceY - 40}px)`}
            label={data.startLabel}
          />
        )}
        {data?.endLabel && (
          <EdgeLabel
            transform={`translate(${targetX - 30}px,${targetY - 40}px)`}
            label={data.endLabel}
          />
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdgeStartEnd;
