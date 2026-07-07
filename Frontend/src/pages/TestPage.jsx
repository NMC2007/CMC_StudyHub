import React from "react";
import api from "#/lib/axios";

const TestPage = () => {
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    api
      .get("/")
      .then((response) => setMessage(response.data.data))
      .catch((error) => setMessage("Error: " + error.message))
      .finally(() => console.log("Request completed"));
  }, []);

  return (
    <div>
      <h1>Test Page</h1>
      <p>{message}</p>
    </div>
  );
};

export default TestPage;
