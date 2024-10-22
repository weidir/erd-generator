import { Parser } from "@dbml/core";

export function parseDbml(dbmlContent: string) {
  try {
    // Using the DBML parser to parse the input content
    const parser = new Parser();
    const parsedData = parser.parse(dbmlContent, "dbmlv2");

    // Returning the parsed data
    return parsedData;
  } catch (error) {
    console.error("Error parsing DBML:", error.message);
    return null;
  }
}
