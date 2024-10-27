import React from "react";

export const Markers = () => (
  <svg
    style={{
      position: "absolute",
      top: 0,
      left: 0,
    }}
  >
    <defs>
      <marker
        id="one-source-marker"
        markerWidth="20"
        markerHeight="20"
        refX="8"
        refY="10"
        orient="auto"
      >
        <line
          x1="0"
          y1="10"
          x2="15"
          y2="10"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line
          x1="15"
          y1="3"
          x2="15"
          y2="17"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
      </marker>
      <marker
        id="many-target-marker"
        markerWidth="50"
        markerHeight="50"
        refX="30"
        refY="25"
        orient="auto"
      >
        <line
          x1="0"
          y1="25"
          x2="20"
          y2="25"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="25"
          x2="40"
          y2="10"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="25"
          x2="40"
          y2="25"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="25"
          x2="40"
          y2="40"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
      </marker>
      <marker
        id="one-target-marker"
        markerWidth="20"
        markerHeight="20"
        refX="12"
        refY="10"
        orient="auto"
      >
        <line
          x1="20"
          y1="10"
          x2="5"
          y2="10"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line x1="5" y1="3" x2="5" y2="17" stroke="#b1b1b7cc" strokeWidth="1" />
      </marker>
      <marker
        id="many-source-marker"
        markerWidth="50"
        markerHeight="50"
        refX="17"
        refY="25"
        orient="auto"
      >
        <line
          x1="50"
          y1="25"
          x2="30"
          y2="25"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line
          x1="30"
          y1="25"
          x2="10"
          y2="10"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line
          x1="30"
          y1="25"
          x2="10"
          y2="25"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
        <line
          x1="30"
          y1="25"
          x2="10"
          y2="40"
          stroke="#b1b1b7cc"
          strokeWidth="1"
        />
      </marker>
    </defs>
  </svg>
);

export const KeyImg = () => (
  <svg
    fill="#000000"
    height="800px"
    width="800px"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    // xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 485.017 485.017"
    // xml:space="preserve"
  >
    <g>
      <path
        d="M361.205,68.899c-14.663,0-28.447,5.71-38.816,16.078c-21.402,21.403-21.402,56.228,0,77.631
		c10.368,10.368,24.153,16.078,38.815,16.078s28.447-5.71,38.816-16.078c21.402-21.403,21.402-56.228,0-77.631
		C389.652,74.609,375.867,68.899,361.205,68.899z M378.807,141.394c-4.702,4.702-10.953,7.292-17.603,7.292
		s-12.901-2.59-17.603-7.291c-9.706-9.706-9.706-25.499,0-35.205c4.702-4.702,10.953-7.291,17.603-7.291s12.9,2.589,17.603,7.291
		C388.513,115.896,388.513,131.688,378.807,141.394z"
      />
      <path
        d="M441.961,43.036C414.21,15.284,377.311,0,338.064,0c-39.248,0-76.146,15.284-103.897,43.036
		c-42.226,42.226-54.491,105.179-32.065,159.698L0.254,404.584l-0.165,80.268l144.562,0.165v-55.722h55.705l0-55.705h55.705v-64.492
		l26.212-26.212c17.615,7.203,36.698,10.976,55.799,10.976c39.244,0,76.14-15.282,103.889-43.032
		C499.25,193.541,499.25,100.325,441.961,43.036z M420.748,229.617c-22.083,22.083-51.445,34.245-82.676,34.245
		c-18.133,0-36.237-4.265-52.353-12.333l-9.672-4.842l-49.986,49.985v46.918h-55.705l0,55.705h-55.705v55.688l-84.5-0.096
		l0.078-37.85L238.311,208.95l-4.842-9.672c-22.572-45.087-13.767-99.351,21.911-135.029C277.466,42.163,306.83,30,338.064,30
		c31.234,0,60.598,12.163,82.684,34.249C466.34,109.841,466.34,184.025,420.748,229.617z"
      />
    </g>
  </svg>
);