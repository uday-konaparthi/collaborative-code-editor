import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setResult, setStdIn } from "../redux/codeSlice";
import { useEffect } from "react";
import { socket } from "../utils/socket";
import { SquareCheck, Terminal } from "lucide-react";

const OutputPanel = () => {
  const [resultBtn, setResultBtn] = useState(false);
  const [stdin, setStdin] = useState("");
  const dispatch = useDispatch();

  const result = useSelector((state) => state.code.codeResult);
  const testcases = useSelector((state) => state.code.stdin);

  const outputRef = useRef(null);

  const isCodeRunning = useSelector((state) => state.code.runningStatus.status);

  useEffect(() => {
    if (isCodeRunning) {
      setResultBtn(true);
    }
  }, [isCodeRunning])

  useEffect(() => {
    if (resultBtn && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result, resultBtn]);

  useEffect(() => {
    const handleResult = (result) => {
      dispatch(setResult(result)); // update Redux store
    };

    socket.on("receive-result", handleResult);

    return () => socket.off("receive-result", handleResult);
  }, []);

  const handleClear = () => {
    setResultBtn(false);
    dispatch(setResult(null));
  };

  const handleTestCases = () => {
    setResultBtn(false);
  };

  const handleOutput = () => {
    setResultBtn(true);
  };

  const getFormattedOutput = () => {
    console.log("result: ", result)
    if (!result) return "No output yet...";

    if (result.stderr) return result.stderr;
    if (result.compile_output) return result.compile_output;
    if (result.message) return result.message;
    if (result.stdout) return result.stdout;

    return "No output returned.";
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full dark:bg-[#252526] bg-[#E5E7EB] rounded-xl p-4 min-h-0 border dark:border-[#2D2D2D] border-gray-300">
      {/* Header buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {/* Test Cases Button */}
          <button
            onClick={handleTestCases}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm
              ${resultBtn
                ? "bg-gray-200 dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-[#2A2E37] hover:scale-[1.02]"
                : "bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-600/30 hover:scale-[1.05]"
              }`}
          >
            <SquareCheck className="w-4 h-4" />
            <span>Test Cases</span>
          </button>

          {/* Output Button */}
          <button
            onClick={handleOutput}
            className={`flex items-center gap-2 py-1.5 px-5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm
              ${resultBtn
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-600/30 hover:scale-[1.05]"
                : "bg-gray-200 dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-[#2A2E37] hover:scale-[1.02]"
              }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Output</span>
          </button>
        </div>

        <button
          onClick={handleClear}
          className="py-2 px-4 rounded-lg text-sm font-semibold 
          bg-[#EF4444]/90 text-white hover:bg-[#DC2626] focus:ring-2 focus:ring-[#EF4444]/70 cursor-pointer
          transition-all duration-200"
        >
          Clear
        </button>
      </div>

      {/* Content area */}
      {resultBtn ? (
        <div
          ref={outputRef}
          className="flex-1 text-sm overflow-y-auto text-black
          dark:bg-[#1E1E1E] bg-[#F3F4F6] dark:text-[#7FFF7F] font-mono 
          rounded-lg p-4 leading-relaxed tracking-tight 
          min-h-0 whitespace-pre-wrap shadow-inner
          scrollbar-thin scrollbar-thumb-[#2E3440] scrollbar-track-transparent"
        >
          {getFormattedOutput()}
        </div>
      ) : (
        <textarea
          value={stdin}
          onChange={(e) => {
            const value = e.target.value;
            setStdin(value);
            dispatch(setStdIn(value));
          }}
          className="flex-1 w-full dark:bg-[#1E1E1E] bg-[#F3F4F6] dark:text-white text-black focus:outline-none 
          p-4 text-sm font-mono rounded-lg resize-none placeholder-gray-500 
          transition-all duration-200 shadow-inner border dark:border-[#2D2D2D] border-gray-300
          scrollbar-thin scrollbar-thumb-[#2E3440] scrollbar-track-transparent"
          placeholder="Enter test cases here..."
        />
      )}
    </div>
  );
};

export default OutputPanel;