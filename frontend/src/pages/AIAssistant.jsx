import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  User,
  Loader2,
  BookOpen,
  Code2,
  Briefcase,
  Lightbulb,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";

const QUICK_PROMPTS = [
  {
    icon: BookOpen,
    title: "Study Plan",
    prompt: "Create a study plan for my upcoming exams.",
  },
  {
    icon: Code2,
    title: "Learn Coding",
    prompt: "Create a beginner-friendly roadmap to learn MERN stack.",
  },
  {
    icon: Briefcase,
    title: "Career",
    prompt: "How can I prepare for a software developer job?",
  },
  {
    icon: Lightbulb,
    title: "Project Idea",
    prompt: "Give me a unique final year project idea using GenAI.",
  },
];

const INITIAL_MESSAGE = {
  id: 1,
  role: "assistant",
  content:
    "Hi! 👋 I'm your AI Student Assistant. I can help you with coding, study plans, projects, career preparation, assignments, and more. What would you like to work on today?",
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    INITIAL_MESSAGE,
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // =========================
  // AUTO SCROLL CHAT
  // =========================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // =========================
  // GENERATE ID
  // =========================

  const generateId = () => {
    return Date.now() + Math.random();
  };

  // =========================
  // SAVE CHAT TO HISTORY
  // =========================

  const saveCurrentChatToHistory = () => {
    const userMessages = messages.filter(
      (message) => message.role === "user"
    );

    if (userMessages.length === 0) return;

    const firstMessage =
      userMessages[0]?.content || "New conversation";

    const historyItem = {
      id: generateId(),
      title:
        firstMessage.length > 30
          ? `${firstMessage.slice(0, 30)}...`
          : firstMessage,
      messages: [...messages],
      createdAt: new Date(),
    };

    setChatHistory((prev) => [
      historyItem,
      ...prev,
    ]);
  };

  // =========================
  // NEW CHAT
  // =========================

  const clearChat = () => {
    saveCurrentChatToHistory();

    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: generateId(),
      },
    ]);

    setInput("");
    setSidebarOpen(false);
  };

  // =========================
  // LOAD OLD CHAT
  // =========================

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setSidebarOpen(false);
  };

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async (messageText = input) => {
    const text = messageText.trim();

    if (!text || isTyping) return;

    const userMessage = {
      id: generateId(),
      role: "user",
      content: text,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Conversation for backend
      const conversation = messages
        .filter(
          (message) =>
            message.role === "user" ||
            message.role === "assistant"
        )
        .slice(-10)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const response = await fetch(
        "http://localhost:5000/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            conversation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get AI response"
        );
      }

      const assistantMessage = {
        id: generateId(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "AI Assistant Error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            error.message ||
            "Sorry, something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setIsTyping(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // =========================
  // FORM SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // =========================
  // KEYBOARD
  // =========================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  // =========================
  // QUICK PROMPT
  // =========================

  const handleQuickPrompt = (prompt) => {
    setSidebarOpen(false);
    sendMessage(prompt);
  };

  // =========================
  // COPY
  // =========================

  const copyMessage = async (
    content,
    id
  ) => {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  return (
    <div
      className="
        h-[calc(100dvh-9rem)]
        min-h-0
        bg-slate-950
        text-white
        flex
        overflow-hidden
      "
    >

      {/* =====================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <div
          className="
            fixed
            inset-0
            bg-black/60
            z-40
            lg:hidden
          "
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          fixed
          lg:relative
          z-50
          lg:z-auto

          top-0
          left-0

          h-full
          min-h-0

          w-[280px]

          bg-slate-900
          border-r
          border-slate-800

          flex
          flex-col

          transition-transform
          duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* SIDEBAR HEADER */}

        <div
          className="
            shrink-0
            p-4
            border-b
            border-slate-800
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-indigo-600/20
                  border
                  border-indigo-500/20
                  flex
                  items-center
                  justify-center
                "
              >
                <Bot
                  size={21}
                  className="text-indigo-400"
                />
              </div>

              <div>

                <h2 className="font-semibold">
                  AI Assistant
                </h2>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    mt-0.5
                  "
                >
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-green-400
                    "
                  />

                  <span
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    Online
                  </span>
                </div>

              </div>

            </div>


            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="
                lg:hidden
                p-2
                rounded-lg
                hover:bg-slate-800
              "
            >
              <X size={19} />
            </button>

          </div>

        </div>


        {/* =====================================
            SIDEBAR SCROLL AREA
        ====================================== */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            scrollbar-thin
            scrollbar-thumb-slate-700
            scrollbar-track-transparent
          "
        >

          {/* NEW CHAT */}

          <div className="p-4">

            <button
              onClick={clearChat}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2

                px-4
                py-3

                rounded-xl

                bg-indigo-600
                hover:bg-indigo-500

                transition

                font-medium
              "
            >
              <Sparkles size={17} />

              New Conversation
            </button>

          </div>


          {/* QUICK PROMPTS */}

          <div className="px-4">

            <p
              className="
                text-[10px]
                uppercase
                tracking-wider
                text-slate-500
                font-semibold
                mb-3
              "
            >
              Quick Prompts
            </p>

            <div className="space-y-1">

              {QUICK_PROMPTS.map(
                (item) => {

                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() =>
                        handleQuickPrompt(
                          item.prompt
                        )
                      }
                      className="
                        w-full
                        text-left
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        hover:bg-slate-800
                        transition
                        group
                      "
                    >

                      <div
                        className="
                          p-2
                          rounded-lg
                          bg-slate-800
                          group-hover:bg-indigo-500/10
                        "
                      >
                        <Icon
                          size={16}
                          className="
                            text-slate-400
                            group-hover:text-indigo-400
                          "
                        />
                      </div>

                      <div>

                        <p
                          className="
                            text-sm
                            font-medium
                          "
                        >
                          {item.title}
                        </p>

                        <p
                          className="
                            text-[10px]
                            text-slate-500
                            mt-0.5
                          "
                        >
                          Ask AI
                        </p>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </div>


          {/* =====================================
              CHAT HISTORY
          ====================================== */}

          <div className="px-4 mt-7">

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  font-semibold
                "
              >
                Chat History
              </p>

              <MessageSquare
                size={14}
                className="text-slate-600"
              />

            </div>


            {chatHistory.length === 0 ? (

              <div
                className="
                  rounded-xl
                  border
                  border-slate-800
                  bg-white/[0.02]
                  px-3
                  py-4
                  text-center
                "
              >

                <MessageSquare
                  size={18}
                  className="
                    mx-auto
                    text-slate-700
                    mb-2
                  "
                />

                <p
                  className="
                    text-[11px]
                    text-slate-600
                  "
                >
                  No previous chats
                </p>

              </div>

            ) : (

              <div className="space-y-1">

                {chatHistory.map(
                  (chat) => (

                    <button
                      key={chat.id}
                      onClick={() =>
                        loadChat(chat)
                      }
                      className="
                        w-full
                        text-left
                        flex
                        items-center
                        gap-2
                        px-3
                        py-2.5
                        rounded-lg
                        text-xs
                        text-slate-400
                        hover:text-white
                        hover:bg-slate-800
                        transition
                      "
                    >

                      <MessageSquare
                        size={14}
                        className="
                          shrink-0
                          text-slate-600
                        "
                      />

                      <span
                        className="
                          truncate
                        "
                      >
                        {chat.title}
                      </span>

                    </button>

                  )
                )}

              </div>

            )}

          </div>

        </div>


        {/* SIDEBAR BOTTOM */}

        <div
          className="
            shrink-0
            p-4
            border-t
            border-slate-800
          "
        >

          <div
            className="
              p-3
              rounded-xl
              bg-slate-800/50
              border
              border-slate-800
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                mb-1.5
              "
            >

              <Sparkles
                size={14}
                className="text-indigo-400"
              />

              <span
                className="
                  text-xs
                  font-medium
                "
              >
                Student Assistant
              </span>

            </div>

            <p
              className="
                text-[10px]
                leading-4
                text-slate-500
              "
            >
              Your AI companion for
              learning, coding, projects
              and career preparation.
            </p>

          </div>

        </div>

      </aside>


      {/* =====================================
          MAIN CHAT
      ====================================== */}

      <main
        className="
          flex-1
          min-w-0
          min-h-0
          flex
          flex-col
          overflow-hidden
        "
      >

        {/* CHAT HEADER */}

        <header
          className="
            h-14
            shrink-0
            border-b
            border-slate-800
            bg-slate-950/95
            backdrop-blur
            flex
            items-center
            justify-between
            px-4
            md:px-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="
                lg:hidden
                p-2
                rounded-lg
                hover:bg-slate-800
              "
            >
              <Menu size={20} />
            </button>


            <div>

              <h1
                className="
                  text-sm
                  md:text-base
                  font-semibold
                "
              >
                Student AI Assistant
              </h1>

              <p
                className="
                  hidden
                  sm:block
                  text-[10px]
                  text-slate-500
                "
              >
                Your personal learning assistant
              </p>

            </div>

          </div>


          <button
            onClick={clearChat}
            className="
              flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              text-xs
              text-slate-400
              hover:text-white
              hover:bg-slate-800
              transition
            "
          >
            <Trash2 size={15} />

            <span className="hidden sm:inline">
              Clear
            </span>
          </button>

        </header>


        {/* =====================================
            CHAT MESSAGES - ONLY THIS SCROLLS
        ====================================== */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            overscroll-contain
          "
        >

          <div
            className="
              max-w-4xl
              mx-auto
              px-4
              md:px-6
              py-6
            "
          >

            {messages.map(
              (message) => (

                <div
                  key={message.id}
                  className={`
                    flex
                    gap-3
                    md:gap-4
                    mb-6
                    ${
                      message.role ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >

                  {/* AI AVATAR */}

                  {message.role ===
                    "assistant" && (
                    <div
                      className="
                        shrink-0
                        w-8
                        h-8
                        rounded-xl
                        bg-indigo-600/20
                        border
                        border-indigo-500/20
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Bot
                        size={17}
                        className="text-indigo-400"
                      />
                    </div>
                  )}


                  {/* MESSAGE */}

                  <div
                    className={`
                      max-w-[80%]
                      ${
                        message.role ===
                        "user"
                          ? "order-first"
                          : ""
                      }
                    `}
                  >

                    <div
                      className={`
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                        leading-6
                        whitespace-pre-wrap

                        ${
                          message.role ===
                          "user"
                            ? `
                              bg-indigo-600
                              text-white
                              rounded-tr-md
                            `
                            : `
                              bg-slate-900
                              border
                              border-slate-800
                              text-slate-200
                              rounded-tl-md
                            `
                        }
                      `}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>


                    {/* COPY */}

                    {message.role ===
                      "assistant" && (
                      <div className="mt-1">

                        <button
                          onClick={() =>
                            copyMessage(
                              message.content,
                              message.id
                            )
                          }
                          className="
                            flex
                            items-center
                            gap-1
                            px-2
                            py-1
                            rounded-md
                            text-[10px]
                            text-slate-600
                            hover:text-slate-300
                            hover:bg-slate-900
                            transition
                          "
                        >

                          {copiedId ===
                          message.id ? (
                            <>
                              <Check
                                size={12}
                              />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy
                                size={12}
                              />
                              Copy
                            </>
                          )}

                        </button>

                      </div>
                    )}

                  </div>


                  {/* USER AVATAR */}

                  {message.role ===
                    "user" && (
                    <div
                      className="
                        shrink-0
                        w-8
                        h-8
                        rounded-xl
                        bg-slate-800
                        border
                        border-slate-700
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <User
                        size={16}
                        className="text-slate-300"
                      />
                    </div>
                  )}

                </div>

              )
            )}


            {/* TYPING */}

            {isTyping && (
              <div
                className="
                  flex
                  gap-3
                  md:gap-4
                  mb-6
                "
              >

                <div
                  className="
                    shrink-0
                    w-8
                    h-8
                    rounded-xl
                    bg-indigo-600/20
                    border
                    border-indigo-500/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Bot
                    size={17}
                    className="text-indigo-400"
                  />
                </div>


                <div
                  className="
                    px-4
                    py-3
                    rounded-2xl
                    rounded-tl-md
                    bg-slate-900
                    border
                    border-slate-800
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Loader2
                      size={15}
                      className="
                        animate-spin
                        text-indigo-400
                      "
                    />

                    <span
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      AI is thinking...
                    </span>

                  </div>

                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

        </div>


        {/* =====================================
            INPUT - ALWAYS FIXED INSIDE CHAT
        ====================================== */}

        <div
          className="
            shrink-0
            border-t
            border-slate-800
            bg-slate-950
            px-4
            pt-3
            pb-3
          "
        >

          <div
            className="
              max-w-4xl
              mx-auto
            "
          >

            <form
              onSubmit={handleSubmit}
              className="relative"
            >

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI assistant anything..."
                rows={1}
                disabled={isTyping}
                className="
                  w-full
                  resize-none
                  min-h-[50px]
                  max-h-32

                  bg-slate-900

                  border
                  border-slate-700

                  rounded-2xl

                  px-5
                  py-3.5
                  pr-14

                  text-sm
                  text-white

                  placeholder:text-slate-500

                  outline-none

                  focus:border-indigo-500/60
                  focus:ring-2
                  focus:ring-indigo-500/10

                  transition
                "
              />


              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  isTyping
                }
                className="
                  absolute
                  right-2
                  bottom-2

                  w-9
                  h-9

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  bg-indigo-600
                  hover:bg-indigo-500

                  disabled:bg-slate-800
                  disabled:text-slate-600

                  text-white
                  transition
                "
              >

                {isTyping ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={16} />
                )}

              </button>

            </form>


            <p
              className="
                text-center
                text-[9px]
                text-slate-700
                mt-2
              "
            >
              AI can make mistakes. Verify
              important information. · Enter
              to send · Shift + Enter for new line
            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default AIAssistant;