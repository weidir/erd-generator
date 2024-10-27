import React from "react";
import { rgba } from "polished";
import { Position, Handle } from "@xyflow/react";
import { KeyImg } from "./SVG";

export const GenerateTableNodesEdges = (parsedDbml: any) => {
  let nodes: any[] = [];
  let edges: any[] = [];
  let sources: string[] = [];
  let targets: string[] = [];

  // Try generating nodes and edges from the parsed DBML
  try {
    let index = 0;

    // Loop through each table in the parsed DBML
    for (const tableName in parsedDbml) {
      // Set the initial x and y position for each table
      const xPosition = 350 * index;
      const yPosition = 50 * index;

      const numColumns = Object.keys(parsedDbml[tableName].columns).length;

      // Generate nodes for each table and push them to the nodes array
      const tableNode = {
        id: tableName,
        data: {
          label: tableName,
        },
        position: { x: xPosition, y: yPosition },
        style: {
          backgroundColor: rgba(34, 34, 34, 0.8),
          color: "white",
          fontSize: "20px",
          width: "300px",
          height: `${numColumns * 40 + 40}px`, // # columns * 40px
          padding: "5px",
          textAlign: "left",
          // outline: "3px white solid",
        },
        type: "tableNode",
      };
      nodes.push(tableNode);

      // Loop through each column in the given table
      for (const columnName in parsedDbml[tableName].columns) {
        // Get the column object
        const column = parsedDbml[tableName].columns[columnName];

        // Set edges for each column, if there are refs in the column, create edges
        if (column.refs.length > 0) {
          for (const ref of column.refs) {
            // Set the start and end labels for the edges based on the ref type
            // Ref types:
            // ">": "many_to_one",
            // "<": "one_to_many",
            // "-": "one_to_one",
            // "<>": "many_to_many",
            // If the ref is one-to-many, set the start label to "1" and end label to "*",
            // if it is many-to-one set start label to "*" and end label to "1",
            // if it is one-to-one set start and end labels to "1"
            // if it is many-to-many set start and end labels to "*"
            const startLabel =
              ref.dbml_ref_type === "<"
                ? "1"
                : ref.dbml_ref_type === ">"
                ? "*"
                : "1";
            const endLabel =
              ref.dbml_ref_type === "<"
                ? "*"
                : ref.dbml_ref_type === ">"
                ? "1"
                : "1";
            // If the start or end label is "1", set the markerStart to "one"
            // if the start of end label is "*", set the markerEnd to "many"
            const markerStart =
              startLabel === "1" ? "one-marker" : "many-marker";
            const markerEnd = endLabel === "1" ? "one-marker" : "many-marker";
            // Create an edge for each ref and push it to the edges array
            const refTable = ref.column_name.split(".")[0];
            const tableEdge = {
              id: `${tableName}->${refTable}`,
              source: tableName,
              target: refTable,
              animated: false,
              style: {
                strokeWidth: 2,
                // stroke: '#FF0072',
              },
              type: "start-end",
              data: {
                startLabel: startLabel,
                endLabel: endLabel,
                markerStart: {
                  type: markerStart,
                },
                markerEnd: {
                  type: markerEnd,
                },
              },
            };
            edges.push(tableEdge);
            sources.push(`${tableName}.${columnName}`);
            targets.push(ref.column_name);
          }
        }
      }
      index++;
    }
  } catch (error) {
    alert("Error generating nodes");
    console.error("Error generating nodes.", error);
  }
  console.log("Nodes:", nodes);
  console.log("Edges:", edges);
  return { nodes, edges, sources, targets };
};

export const GenerateColumnNodesEdges = (
  parsedDbml: any,
  sources: string[],
  targets: string[]
) => {
  let nodes: any[] = [];
  let edges: any[] = [];

  console.log("Sources:", sources);
  console.log("Targets:", targets);

  // Try generating nodes and edges from the parsed DBML
  try {
    let index = 0;

    // Loop through each table in the parsed DBML
    for (const tableName in parsedDbml) {
      // Loop through each column in the given table
      let yColPosition = 0;

      for (const columnName in parsedDbml[tableName].columns) {
        // Get the column object
        const column = parsedDbml[tableName].columns[columnName];

        yColPosition += 40;

        // Set edges for each column, if there are refs in the column, create edges
        if (column.refs.length > 0) {
          for (const ref of column.refs) {
            // Set the start and end labels for the edges based on the ref type
            // Ref types:
            // ">": "many_to_one",
            // "<": "one_to_many",
            // "-": "one_to_one",
            // "<>": "many_to_many",
            // If the ref is one-to-many, set the start label to "1" and end label to "*",
            // if it is many-to-one set start label to "*" and end label to "1",
            // if it is one-to-one set start and end labels to "1"
            // if it is many-to-many set start and end labels to "*"
            const startLabel =
              ref.dbml_ref_type === "<"
                ? "1"
                : ref.dbml_ref_type === ">"
                ? "*"
                : "1";
            const endLabel =
              ref.dbml_ref_type === "<"
                ? "*"
                : ref.dbml_ref_type === ">"
                ? "1"
                : "1";
            // If the start or end label is "1", set the markerStart to "one"
            // if the start of end label is "*", set the markerEnd to "many"
            const markerStart =
              startLabel === "1" ? "one-source-marker" : "many-source-marker";
            const markerEnd =
              endLabel === "1" ? "one-target-marker" : "many-target-marker";
            // Create an edge for each ref and push it to the edges array
            const edge = {
              id: `${tableName}.${columnName}->${ref.column_name}`,
              source: `${tableName}.${columnName}`,
              target: ref.column_name,
              animated: false,
              style: {
                strokeWidth: 2,
                stroke: "white",
              },
              type: "start-end",
              data: {
                startLabel: startLabel,
                endLabel: endLabel,
                markerStart: {
                  type: markerStart,
                },
                markerEnd: {
                  type: markerEnd,
                },
              },
            };
            edges.push(edge);
          }
        }
        // Set the initial x and y position for each table
        const xPosition = 350 * index;

        // Create a node for each column and push it to the nodes array
        const columnNode = {
          id: `${tableName}.${columnName}`,
          data: {
            label: (
              // Add handles to the column node if it has an edge
              <div key={columnName}>
                {sources.includes(`${tableName}.${columnName}`) && (
                  <Handle type="source" position={Position.Right} />
                )}
                {targets.includes(`${tableName}.${columnName}`) && (
                  <Handle type="target" position={Position.Left} />
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Field details */}
                  <span>
                    {columnName}
                    {"   "}
                    {column.primary_key && (
                      <svg
                        fill="none"
                        height="13px"
                        width="13px"
                        version="1.1"
                        id="Layer_1"
                        viewBox="0 0 485.017 485.017"
                        stroke="white"
                        color="white"
                      >
                        <path
                          fill="white"
                          color="white"
                          stroke="white"
                          d="M361.205,68.899c-14.663,0-28.447,5.71-38.816,16.078c-21.402,21.403-21.402,56.228,0,77.631
		c10.368,10.368,24.153,16.078,38.815,16.078s28.447-5.71,38.816-16.078c21.402-21.403,21.402-56.228,0-77.631
		C389.652,74.609,375.867,68.899,361.205,68.899z M378.807,141.394c-4.702,4.702-10.953,7.292-17.603,7.292
		s-12.901-2.59-17.603-7.291c-9.706-9.706-9.706-25.499,0-35.205c4.702-4.702,10.953-7.291,17.603-7.291s12.9,2.589,17.603,7.291
		C388.513,115.896,388.513,131.688,378.807,141.394z"
                        />
                        <path
                          fill="white"
                          color="white"
                          stroke="white"
                          d="M441.961,43.036C414.21,15.284,377.311,0,338.064,0c-39.248,0-76.146,15.284-103.897,43.036
		c-42.226,42.226-54.491,105.179-32.065,159.698L0.254,404.584l-0.165,80.268l144.562,0.165v-55.722h55.705l0-55.705h55.705v-64.492
		l26.212-26.212c17.615,7.203,36.698,10.976,55.799,10.976c39.244,0,76.14-15.282,103.889-43.032
		C499.25,193.541,499.25,100.325,441.961,43.036z M420.748,229.617c-22.083,22.083-51.445,34.245-82.676,34.245
		c-18.133,0-36.237-4.265-52.353-12.333l-9.672-4.842l-49.986,49.985v46.918h-55.705l0,55.705h-55.705v55.688l-84.5-0.096
		l0.078-37.85L238.311,208.95l-4.842-9.672c-22.572-45.087-13.767-99.351,21.911-135.029C277.466,42.163,306.83,30,338.064,30
		c31.234,0,60.598,12.163,82.684,34.249C466.34,109.841,466.34,184.025,420.748,229.617z"
                        />
                      </svg>
                    )}
                  </span>{" "}
                  <span style={{ color: rgba(153, 153, 153, 0.8) }}>
                    {column.type.toLowerCase()}
                  </span>
                </div>
              </div>
            ),
          },
          position: { x: xPosition, y: yColPosition },
          style: {
            backgroundColor: rgba(55, 56, 63, 0.8),
            color: "white",
            width: "300px",
            height: "40px",
            padding: "10px",
          },
          parentId: tableName,
          extent: "parent" as const,
          // sourcePosition: Position.Right,
          // targetPosition: Position.Left,
          type: "tableNode",
        };
        nodes.push(columnNode);
      }
      index++;
    }
  } catch (error) {
    alert("Error generating nodes");
    console.error("Error generating nodes.", error);
  }
  console.log("Nodes:", nodes);
  console.log("Edges:", edges);
  return { nodes, edges };
};
