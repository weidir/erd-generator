function escapeDoubleQuotes(input: string) {
  // Escape all double quotes in the input
  const escapedInput = input.replace(/"/g, '\\"');
  return escapedInput;
}

// Define a function to send the DBML content to the server and get a JSON string in response
export async function parseDbml(dbmlString: string) {
  // Escape double quotes in the DBML string
  const escapedDbmlString = escapeDoubleQuotes(dbmlString);

  // Create the expected JSON object for the endpoint
  const dbmlObject = {
    source_dbml: escapedDbmlString,
    target_dbml: null,
    include_refs: true,
  };
  const dbmlObjectJSON = JSON.stringify(dbmlObject);

  try {
    const response = await fetch("http://localhost:3200/dbml_to_table_def", {
      method: "POST",
      body: dbmlObjectJSON,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    // Calling the function to get the parsed data
    const parsedData = response.json();

    // Returning the parsed data
    return parsedData;
  } catch (error) {
    console.error("Error parsing DBML:", error.message);
    return null;
  }
}
