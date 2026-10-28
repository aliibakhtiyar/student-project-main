
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const QuizPractice = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(10);

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const { data } = await api.get("/quiz/history");
      setHistory(data.history || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not load quiz history"
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const generateQuiz = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setAnswers({});
      setQuiz(null);

      const { data } = await api.post("/quiz/generate", {
        topic: topic.trim(),
        difficulty,
        count: Number(count),
      });

      setQuiz(data);
      toast.success("Your quiz is ready!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to generate quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error("Please answer every question");
      return;
    }

    try {
      setLoading(true);

      const selectedAnswers = quiz.questions.map(
        (_, index) => answers[index]
      );

      const { data } = await api.post("/quiz/submit", {
        quizId: quiz.quizId,
        answers: selectedAnswers,
      });

      setResult(data);
      await loadHistory();
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  const startNewQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setResult(null);
  };

  const card =
    "rounded-2xl border border-white/10 bg-white/[0.04] p-5";

  const input =
    "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500";

  return (
    <div className="min-h-screen bg-[#070B14] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
            UniSphere AI
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Quiz Practice
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Choose a topic, test your knowledge, and track
            your progress.
          </p>
        </header>

        {!quiz && (
          <form onSubmit={generateQuiz} className={card}>
            <h2 className="mb-5 text-lg font-semibold">
              Create your quiz
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Topic or subject
                </label>

                <input
                  className={input}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. C++ Arrays, DBMS, React Hooks..."
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Difficulty
                  </label>

                  <select
                    className={input}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Number of questions
                  </label>

                  <select
                    className={input}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  >
                    <option value={5}>5 questions</option>
                    <option value={10}>10 questions</option>
                    <option value={15}>15 questions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Generating..." : "Generate Quiz with AI"}
              </button>
            </div>
          </form>
        )}

        {quiz && !result && (
          <section className="space-y-5">
            <div className={card}>
              <p className="text-xs text-indigo-400">
                {quiz.difficulty} difficulty
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {quiz.topic}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {quiz.questions.length} questions · Each question
                carries 1 mark
              </p>
            </div>

            {quiz.questions.map((q, index) => (
              <div key={q.id} className={card}>
                <p className="mb-4 text-sm font-semibold leading-6">
                  <span className="mr-2 text-indigo-400">
                    Q{index + 1}.
                  </span>
                  {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((option, optionIndex) => {
                    const selected = answers[index] === optionIndex;

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [index]: optionIndex,
                          }))
                        }
                        className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                          selected
                            ? "border-indigo-500 bg-indigo-500/15 text-white"
                            : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/30"
                        }`}
                      >
                        <span className="mr-3 text-indigo-400">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={submitQuiz}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          </section>
        )}

        {result && (
          <section className="space-y-5">
            <div className={`${card} text-center`}>
              <p className="text-sm text-slate-400">
                Quiz completed
              </p>

              <h2 className="mt-3 text-5xl font-bold text-emerald-400">
                {result.percentage}%
              </h2>

              <p className="mt-3 text-lg font-semibold">
                {result.score} / {result.totalQuestions} marks
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {result.score === result.totalQuestions
                  ? "Excellent work!"
                  : "Review your mistakes and keep practising."}
              </p>

              <button
                type="button"
                onClick={startNewQuiz}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
              >
                Practice Another Topic
              </button>
            </div>

            {result.results.map((item, index) => (
              <div key={index} className={card}>
                <p className="font-semibold leading-6">
                  {index + 1}. {item.question}
                </p>

                <p
                  className={`mt-3 text-sm ${
                    item.isCorrect
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  Your answer:{" "}
                  {item.options[item.selectedAnswer]}
                  {" — "}
                  {item.isCorrect ? "Correct" : "Incorrect"}
                </p>

                {!item.isCorrect && (
                  <p className="mt-2 text-sm text-emerald-400">
                    Correct answer: {item.options[item.correctAnswer]}
                  </p>
                )}

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {item.explanation}
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Quiz History</h2>
            <p className="mt-1 text-sm text-slate-400">
              Your previous completed attempts
            </p>
          </div>

          {historyLoading ? (
            <p className="text-sm text-slate-400">
              Loading history...
            </p>
          ) : history.length === 0 ? (
            <div className={card}>
              <p className="text-sm text-slate-400">
                No completed quizzes yet. Take your first quiz
                to start tracking your scores.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-semibold">{item.topic}</h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.difficulty} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-bold text-indigo-400">
                      {item.score}/{item.totalQuestions}
                    </p>

                    <p className="text-xs text-slate-400">
                      {item.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuizPractice;
