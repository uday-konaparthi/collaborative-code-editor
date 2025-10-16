import React from 'react'

const TestCasesInput = () => (
  <textarea
    style={{
      flex: 1,
      width: "100%",
      border: "none",
      padding: "12px",
      fontSize: "1rem",
      fontFamily: "monospace",
      borderRadius: "10px",
      resize: "none",
    }}
    placeholder="Enter test cases here..."
  />
);

export default TestCasesInput