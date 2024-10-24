import React from "react";
import { rgba } from "polished";
import { Edge, Node, Position, MarkerType } from "@xyflow/react";
import { parseDbml } from "./dbmlParser";

const GenerateNodesEdges = (parsedResponse: any) => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  let parsedDbml: any = {};

  // Try generating nodes and edges from the parsed DBML
  try {
    parsedDbml = parsedResponse["parsed_source"];
    let index = 0;

    // Loop through each table in the parsed DBML
    for (const tableName in parsedDbml) {
      // Set the initial x and y position for each table
      const xPosition = 350 * index;
      const yPosition = 50 * index;

      // Generate nodes and edges for each column
      // Set nodes for each table and push them to the nodes array
      const tableNode = {
        id: tableName,
        data: {
          label: tableName,
        },
        position: { x: xPosition, y: yPosition },
        style: {
          backgroundColor: rgba(39, 168, 245, 0.43),
          color: "white",
          width: "300px",
          height: "400px",
          padding: "10px",
          outline: "3px white solid",
        },
        type: "tableNode",
      };
      nodes.push(tableNode);

      // Set the initial y position for the columns
      let yColPosition = 40;
      // Loop through each column in the given table
      for (const columnName in parsedDbml[tableName].columns) {
        // Get the column object
        const column = parsedDbml[tableName].columns[columnName];
        // Create a node for each column and push it to the nodes array
        const columnNode = {
          id: `${tableName}.${columnName}`,
          data: {
            label: (
              <div
                key={columnName}
                style={{
                  position: "relative",
                }}
              >
                {/* Field details */}
                {columnName}: {column.type.toLowerCase()}{" "}
                {column.primary_key ? "(PK)" : ""}
              </div>
            ),
          },
          position: { x: xPosition, y: yColPosition },
          style: {
            backgroundColor: "white",
            color: "black",
            width: "300px",
            padding: "10px",
          },
          parentId: tableName,
          extent: "parent" as const,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };
        nodes.push(columnNode);
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
              startLabel === "1" ? "one-marker" : "many-marker";
            const markerEnd = endLabel === "1" ? "one-marker" : "many-marker";
            // Create an edge for each ref and push it to the edges array
            const edge = {
              id: `${tableName}.${columnName}->${ref.column_name}`,
              source: `${tableName}.${columnName}`,
              target: ref.column_name,
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
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: "#FF0072",
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: "#FF0072",
                },
              },
            };
            edges.push(edge);
          }
        }
      }
      index++;
    }
  } catch (error) {
    alert("Error generating nodes");
    console.error("Error generating nodes.", error);
  }

  return { nodes, edges };
};

export default GenerateNodesEdges;
