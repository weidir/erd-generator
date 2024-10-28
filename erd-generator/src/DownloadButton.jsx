import React from "react";
import {
  Panel,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";

function downloadImage(dataUrl) {
  const a = document.createElement("a");

  a.setAttribute("download", "reactflow.svg");
  a.setAttribute("href", dataUrl);
  a.click();
}

function DownloadButton() {
  const { getNodes } = useReactFlow();

  // Calculate image dimensions based on window size
  const calculateImageDimensions = () => {
    const imageWidth = window.innerWidth;
    const imageHeight = window.innerHeight;
    return { imageWidth, imageHeight };
  };
  const onClick = () => {
    // Dynamically calculate the image dimensions
    const { imageWidth, imageHeight } = calculateImageDimensions();
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    // Change to SVG
    toSvg(document.querySelector(".react-flow__renderer"), {
      backgroundColor: "#242424",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  };

  return (
    <Panel position="top-left">
      <button className="download-btn" onClick={onClick}>
        <svg
          fill="#000000"
          width="14px"
          height="12px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke="white"
            fill="white"
            d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Z"
          />
        </svg>
        {"         "}
        Download SVG
      </button>
    </Panel>
  );
}

export default DownloadButton;
