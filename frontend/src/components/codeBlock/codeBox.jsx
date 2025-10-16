import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveCode } from "../../redux/codeSlice";
import { socket } from "../../utils/socket";
import { Code, CodeXml, Copy, Maximize2, RotateCcw } from "lucide-react";

const codeBlock = () => {
  const [code, setCode] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);

  const dispatch = useDispatch();
  const room = useSelector((state) => state.room.room);
  const roomId = room?.roomId;
  const { username: runningUser, status: isRunning } = useSelector(
    (state) => state.code.runningStatus
  );

  const tabSize = 2;
  const tabString = " ".repeat(tabSize);

  const [locked, setLocked] = useState(false);
  const [lockBy, setLockBy] = useState(null);

  // ------------------ Update code and emit to server ------------------
  const updateCode = (newCode) => {
    setCode(newCode);
    dispatch(saveCode(newCode));
    if (roomId) socket.emit("handle-code", { roomId, code: newCode });
  };

  // ------------------ Scroll sync ------------------
  const handleScroll = (e) => {
    if (scrollRef.current) scrollRef.current.scrollTop = e.target.scrollTop;
  };

  const handleMouseMove = (e) => {
    if (!textareaRef.current) return;
    const rect = textareaRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // ------------------ Key handling ------------------
  const handleKeyDown = (e) => {
    const textarea = e.target;
    const { selectionStart, selectionEnd } = textarea;

    // prevent editing if locked by someone else
    if (locked && lockBy !== socket.id) {
      e.preventDefault();
      return;
    }

    // Tab / Shift+Tab indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const before = code.slice(0, selectionStart);
      const after = code.slice(selectionEnd);

      if (!e.shiftKey) {
        // Tab → Indent
        const newCode = before + tabString + after;
        updateCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + tabString.length;
        }, 0);
      } else {
        // Shift+Tab → Unindent
        const lineStart = before.lastIndexOf("\n") + 1;
        const currentLine = code.slice(lineStart, selectionStart);
        const newLine = currentLine.startsWith(tabString)
          ? currentLine.slice(tabString.length)
          : currentLine;
        const newCode =
          code.slice(0, lineStart) + newLine + code.slice(selectionEnd);
        const removed = currentLine.length - newLine.length;
        updateCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart - removed;
        }, 0);
      }
    }

    // Enter key → Auto-indent
    if (e.key === "Enter") {
      e.preventDefault();

      const before = code.slice(0, selectionStart);
      const after = code.slice(selectionEnd);

      const lineStart = before.lastIndexOf("\n") + 1;
      const currentLine = before.slice(lineStart);
      const currentIndent = currentLine.match(/^\s*/)?.[0] || "";

      if (currentLine.trim().endsWith("{")) {
        // Auto-indent + insert closing brace
        const newCode =
          before +
          "\n" +
          currentIndent +
          tabString +
          "\n" +
          currentIndent +
          after;
        updateCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + 1 + currentIndent.length + tabString.length;
        }, 0);
      } else {
        // Normal indentation
        const newCode = before + "\n" + currentIndent + after;
        updateCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + 1 + currentIndent.length;
        }, 0);
      }
      return;
    }

    // Auto-close brackets / quotes
    const closingPairs = { "(": ")", "{": "}", "[": "]", '"': '"', "'": "'" };
    if (closingPairs[e.key] && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = closingPairs[openChar];
      const cursorChar = code[selectionStart];
      const skipClosing = cursorChar === closeChar;
      const before = code.slice(0, selectionStart);
      const after = code.slice(selectionEnd);
      const newCode = skipClosing
        ? before + openChar + after
        : before + openChar + closeChar + after;

      updateCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
    }

    // Request lock on keypress
    if (!locked) socket.emit("request-lock", roomId);
  };

  // ------------------ Receive code updates from others ------------------
  useEffect(() => {
    const handleReceiveCode = (newCode) => {
      if (newCode !== code) {
        setCode(newCode);
        dispatch(saveCode(newCode));
      }
    };

    socket.on("receive-code", handleReceiveCode);
    return () => socket.off("receive-code", handleReceiveCode);
  }, [code, dispatch]);

  // ------------------ Locking system ------------------
  const handleFocus = () => {
    if (!locked) socket.emit("request-lock", roomId);
  };

  const handleBlur = () => {
    if (lockBy === socket.id) {
      socket.emit("release-lock", roomId);
      setLocked(false);
      setLockBy(null);
    }
  };

  useEffect(() => {
    socket.on("lock-granted", () => {
      setLocked(true);
      setLockBy(socket.id);
    });

    socket.on("lock-denied", ({ by }) => {
      setLocked(true);
      setLockBy(by);
    });

    socket.on("lock-update", ({ locked: isLocked, by }) => {
      setLocked(isLocked);
      setLockBy(by);
    });

    return () => {
      socket.off("lock-granted");
      socket.off("lock-denied");
      socket.off("lock-update");
    };
  }, []);

  const lineCount = code.split("\n").length;

  const codeFiles = [
    {
      language: 'typescript',
      code: `const hello: string = "Hello World";\nconsole.log(hello);`
    },
    {
      language: 'javascript',
      code: `console.log("Hello from JS")`
    },
    {
      language: 'c++',
      code: `cout<<"Hello World"<<endl`
    }
  ];

  // ------------------ Copy Function ------------------
  const handleCopy = async () => {
    if (!code.trim()) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy code!");
    }
  };

  // ------------------ Reset Function ------------------
  const handleReset = () => {
    if (!code.trim()) {
      toast("Editor is already empty");
      return;
    }
    setCode("");
    dispatch(saveCode(""));
    if (roomId) socket.emit("handle-code", { roomId, code: "" });
    toast.success("Code reset successfully");
  };

  // ------------------ Render ------------------
  return (
    <div className="flex-[2] w-full dark:bg-[#1E1E1E] bg-[#F3F4F6] border dark:border-[#2D2D2D] border-gray-300 rounded-md overflow-hidden shadow-lg flex flex-col">

      <div className="flex overflow-hidden dark:text-white text-black dark:bg-[#252526] bg-[#E5E7EB] py-2 px-5 justify-between border-b dark:border-[#2D2D2D] border-slate-300">
        <p className="font-manrope font-semibold flex gap-2 items-center  cursor-default">
          <CodeXml className="w-5 h-5 bg-clip-text " />
          Code
        </p>
        <div className="flex gap-3 items-center">
          {/* Copy Icon + Tooltip */}
          <div className="group relative flex items-center justify-center" onClick={handleCopy}>
            <Copy className="size-4 dark:text-white text-black hover:scale-110 cursor-pointer transition-transform duration-200" />
            <span className="absolute -left-6 mb-1 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none">
              Copy
            </span>
          </div>

          {/* Reset Icon + Tooltip */}
          <div className="group relative flex items-center justify-center" onClick={handleReset}>
            <RotateCcw className="size-4 dark:text-white text-black -rotate-60 hover:scale-110 cursor-pointer transition-transform duration-200" />
            <span className="absolute mb-1 -left-6 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none">
              Reset
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row flex-1 overflow-hidden dark:bg-[#1E1E1E] bg-[#F3F4F6]">

        {/* Line numbers */}
        <div
          ref={scrollRef}
          className="overflow-y-auto scrollbar-hide text-sm font-mono leading-6 select-none border-r 
                 dark:bg-[#252526] bg-[#E5E7EB] 
                 dark:text-[#858585] text-[#6B7280] 
                 dark:border-[#2D2D2D] border-gray-300
                 px-4 py-4 text-right flex-shrink-0"
          style={{ minWidth: "2.5rem" }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              if (!locked || lockBy === socket.id) updateCode(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseMove={handleMouseMove}
            readOnly={locked && lockBy !== socket.id}
            placeholder="// Start coding collaboratively..."
            spellCheck={false}
            className="w-full h-full scrollbar-hide outline-none resize-none px-4 py-4 text-sm font-mono leading-6
                   dark:bg-[#1E1E1E] bg-[#F3F4F6]
                   dark:text-[#D4D4D4] text-[#111827]
                   dark:caret-[#00BCD4] caret-[#0D9488]
                   dark:placeholder-[#6B7280] placeholder-[#9CA3AF]"
            style={{
              whiteSpace: "pre",
              overflowWrap: "normal",
              fontFamily: "monospace",
              overflowY: "auto",
            }}
          />

          {locked && lockBy && lockBy !== socket.id && (
            <div className="absolute inset-0 bg-transparent z-10 cursor-not-allowed" />
          )}

          {isRunning && (
            <div className="absolute inset-0 bg-transparent z-10 cursor-not-allowed" />
          )}
        </div>
      </div>
    </div>
  );
};

export default codeBlock; 