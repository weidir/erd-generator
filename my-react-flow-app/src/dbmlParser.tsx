import { Parser } from "@dbml/core";

export function parseDbml(dbmlContent: string) {
  try {
    // Using the DBML parser to parse the input content
    const parsedData = Parser.parse(dbmlContent, "dbmlv2");

    // Return the parsed JavaScript object
    return parsedData;
  } catch (error) {
    console.error("Error parsing DBML:", error.message);
    return null;
  }
}
