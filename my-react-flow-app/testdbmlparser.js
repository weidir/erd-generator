import { Parser } from "@dbml/core";
import { dbmlObject } from "./dbml_file.js";

// console.log("DBML object:", dbmlObject);

function parseDbmlToJsObject(dbmlContent) {
  try {
    const parsedData = Parser.parse(dbmlContent, "dbmlv2");
    return parsedData;
  } catch (error) {
    console.error("Error parsing DBML:", error);
    return null;
  }
}


const parsedDbml = parseDbmlToJsObject(dbmlObject);
// console.log("Parsed DBML:", parsedDbml);
// console.log("Tables:", parsedDbml.schemas[0].tables);

// Generate nodes corresponding to each schema and table in the DBML 
// for rendering in a flow diagram
let nodes = [];
for (let schema of parsedDbml.schemas) {
  nodes.push(...schema.tables.map((table, index) => ({
    id: table.name,
    data: { label: table.name },
    position: { x: 100 * index, y: 100 * index } // Example positioning
  })));
}

let edges = [];
for (let schema of parsedDbml.schemas) {
  edges.push(...schema.refs.map((ref) => ({
    id: `${ref.endpoints[0].tableName}-${ref.endpoints[1].tableName}`,
    source: ref.endpoints[0].tableName,
    target: ref.endpoints[1].tableName
  })));
}

console.log("Nodes:", nodes);
console.log("Edges:", edges);