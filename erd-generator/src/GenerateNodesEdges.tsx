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
      // Set a variable for the table object
      const table = parsedDbml[tableName];

      // Set the initial x and y position for each table
      const xPosition = 350 * index;
      const yPosition = 50 * index;

      const numColumns = Object.keys(parsedDbml[tableName].columns).length;

      // Generate nodes for each table and push them to the nodes array
      const tableNode = {
        id: tableName,
        data: {
          label: (
            <div
              style={{ textAlign: "left" }}
              data-tooltip-id="table-tool-tip"
              data-tooltip-content={table.description}
              data-tooltip-place="right"
            >
              {tableName}
              {"   "}
              {table.description && (
                <svg
                  width="13px"
                  height="13px"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="white"
                >
                  <path
                    d="M8 10.25C8 9.83579 8.33579 9.5 8.75 9.5H18.75C19.1642 9.5 19.5 9.83579 19.5 10.25C19.5 10.6642 19.1642 11 18.75 11H8.75C8.33579 11 8 10.6642 8 10.25Z"
                    fill="#212121"
                    stroke="white"
                  />
                  <path
                    d="M8 14.75C8 14.3358 8.33579 14 8.75 14H18.75C19.1642 14 19.5 14.3358 19.5 14.75C19.5 15.1642 19.1642 15.5 18.75 15.5H8.75C8.33579 15.5 8 15.1642 8 14.75Z"
                    fill="#212121"
                    stroke="white"
                  />
                  <path
                    d="M8.75 18.5C8.33579 18.5 8 18.8358 8 19.25C8 19.6642 8.33579 20 8.75 20H13.25C13.6642 20 14 19.6642 14 19.25C14 18.8358 13.6642 18.5 13.25 18.5H8.75Z"
                    fill="#212121"
                    stroke="white"
                  />
                  <path
                    d="M14 2C14.4142 2 14.75 2.33579 14.75 2.75V4H18.5V2.75C18.5 2.33579 18.8358 2 19.25 2C19.6642 2 20 2.33579 20 2.75V4H20.75C21.9926 4 23 5.00736 23 6.25V19.2459C23 19.4448 22.921 19.6356 22.7803 19.7762L17.2762 25.2803C17.1355 25.421 16.9447 25.5 16.7458 25.5H6.75C5.50736 25.5 4.5 24.4926 4.5 23.25V6.25C4.5 5.00736 5.50736 4 6.75 4H8V2.75C8 2.33579 8.33579 2 8.75 2C9.16421 2 9.5 2.33579 9.5 2.75V4H13.25V2.75C13.25 2.33579 13.5858 2 14 2ZM6 6.25V23.25C6 23.6642 6.33579 24 6.75 24H15.9958V20.7459C15.9958 19.5032 17.0032 18.4959 18.2458 18.4959H21.5V6.25C21.5 5.83579 21.1642 5.5 20.75 5.5H6.75C6.33579 5.5 6 5.83579 6 6.25ZM18.2458 19.9959C17.8316 19.9959 17.4958 20.3317 17.4958 20.7459V22.9394L20.4393 19.9959H18.2458Z"
                    fill="#212121"
                    stroke="white"
                  />
                </svg>
              )}
            </div>
          ),
        },
        position: { x: xPosition, y: yPosition },
        style: {
          backgroundColor: rgba(34, 34, 34, 1),
          color: "white",
          fontSize: "20px",
          width: "300px",
          height: `${numColumns * 40 + 40}px`, // # columns * 40px
          padding: "5px",
          textAlign: "left",
          // outline: "3px white solid",
        },
        type: "tableNode",
        "data-tip": table.description,
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
              type: "custom-start-end",
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
              type: "custom-start-end",
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
          draggable: false,
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
                  data-tooltip-id="column-tool-tip"
                  data-tooltip-content={column.note}
                  data-tooltip-place="right"
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
                    )}{" "}
                    {column.note && (
                      <svg
                        width="13px"
                        height="13px"
                        viewBox="0 0 28 28"
                        fill="none"
                        stroke="white"
                      >
                        <path
                          d="M8 10.25C8 9.83579 8.33579 9.5 8.75 9.5H18.75C19.1642 9.5 19.5 9.83579 19.5 10.25C19.5 10.6642 19.1642 11 18.75 11H8.75C8.33579 11 8 10.6642 8 10.25Z"
                          fill="#212121"
                          stroke="white"
                        />
                        <path
                          d="M8 14.75C8 14.3358 8.33579 14 8.75 14H18.75C19.1642 14 19.5 14.3358 19.5 14.75C19.5 15.1642 19.1642 15.5 18.75 15.5H8.75C8.33579 15.5 8 15.1642 8 14.75Z"
                          fill="#212121"
                          stroke="white"
                        />
                        <path
                          d="M8.75 18.5C8.33579 18.5 8 18.8358 8 19.25C8 19.6642 8.33579 20 8.75 20H13.25C13.6642 20 14 19.6642 14 19.25C14 18.8358 13.6642 18.5 13.25 18.5H8.75Z"
                          fill="#212121"
                          stroke="white"
                        />
                        <path
                          d="M14 2C14.4142 2 14.75 2.33579 14.75 2.75V4H18.5V2.75C18.5 2.33579 18.8358 2 19.25 2C19.6642 2 20 2.33579 20 2.75V4H20.75C21.9926 4 23 5.00736 23 6.25V19.2459C23 19.4448 22.921 19.6356 22.7803 19.7762L17.2762 25.2803C17.1355 25.421 16.9447 25.5 16.7458 25.5H6.75C5.50736 25.5 4.5 24.4926 4.5 23.25V6.25C4.5 5.00736 5.50736 4 6.75 4H8V2.75C8 2.33579 8.33579 2 8.75 2C9.16421 2 9.5 2.33579 9.5 2.75V4H13.25V2.75C13.25 2.33579 13.5858 2 14 2ZM6 6.25V23.25C6 23.6642 6.33579 24 6.75 24H15.9958V20.7459C15.9958 19.5032 17.0032 18.4959 18.2458 18.4959H21.5V6.25C21.5 5.83579 21.1642 5.5 20.75 5.5H6.75C6.33579 5.5 6 5.83579 6 6.25ZM18.2458 19.9959C17.8316 19.9959 17.4958 20.3317 17.4958 20.7459V22.9394L20.4393 19.9959H18.2458Z"
                          fill="#212121"
                          stroke="white"
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
            parent: tableName,
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
          type: "columnNode",
          "data-tip": column.note,
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
