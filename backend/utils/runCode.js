async function compileCode(sourceCode, languageId, stdin) {
  const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
    method: "POST",
    headers: {
      'x-rapidapi-key': '75c24f205cmsha1438538e7fedfep1040c7jsnb26b02a30b4c',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin,
    }),
  });

  const result = await response.json();
  return result;
}

const runCodeOnJudge0 = async (req, res) => {
  const { code, languageId, stdin } = req.body;

  try {
    console.log(code, languageId, stdin)
    const result = await compileCode(code, languageId, stdin)
    console.log("result: ", result)
    res.status(200).json({ result })
  } catch (err) {
    console.error("Judge0 fetch error:", err.message);
    res.status(500).json({ error: "Code execution failed" });
  }
}

module.exports = { runCodeOnJudge0 };
