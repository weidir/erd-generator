function replaceDoubleQuotes(input: string) {
  // Replace all double quotes with single quotes
  const escapedInput = input.replace(/"/g, "'");
  return escapedInput;
}

// Define a function to send the DBML content to the server and get a JSON string in response
export async function parseDbml(dbmlString: string): Promise<any> {
  // Escape double quotes in the DBML string
  const escapedDbmlString = replaceDoubleQuotes(dbmlString);

  // Create the expected JSON object for the endpoint
  const dbmlObject = {
    source_dbml: escapedDbmlString,
    target_dbml: null,
    include_refs: true,
  };
  const dbmlObjectJSON = JSON.stringify(dbmlObject);
  console.log("DBML Object JSON:", dbmlObjectJSON);

  try {
    const response = await fetch("http://localhost:3200/dbml_to_table_def", {
      method: "POST",
      body: dbmlObjectJSON,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "X-user-id": 1,
        "X-activity-id": "erd-generator",
        "X-service-id": 2,
      },
    });
    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}: ${response.body}: ${response.statusText}`
      );
    }

    // Calling the function to get the parsed data
    const parsedData = response.json();

    // Returning the parsed data
    return parsedData;
  } catch (error) {
    console.error("Error parsing DBML:", error.message);
    return null;
  }
}
