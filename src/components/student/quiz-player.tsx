"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react";

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  type: string;
  orderIndex: number;
  answerOptions: AnswerOption[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  submittedAt: Date;
}

interface QuizResult {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
}

interface QuizPlayerProps {
  quiz: Quiz;
  latestAttempt: QuizAttempt | null;
  courseId: string;
  onPassed: () => void;
  onContinue: () => void;
  isPreview?: boolean;
}

export function QuizPlayer({ quiz, latestAttempt, courseId, onPassed, onContinue, isPreview = false }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, { optionId?: string; text?: string }>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const [error, setError] = useState("");

  const showForm = !result && (!latestAttempt || retaking);

  const setAnswer = (questionId: string, value: { optionId?: string; text?: string }) => {
    setAnswers((p) => ({ ...p, [questionId]: value }));
  };

  const submit = async () => {
    setError("");
    const unanswered = quiz.questions.filter(
      (q) => q.type !== "SHORT_ANSWER" && !answers[q.id]?.optionId
    );
    if (unanswered.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        answerOptionId: answers[q.id]?.optionId,
        textAnswer: answers[q.id]?.text,
      }));

      const res = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.data);
        setRetaking(false);
        if (data.data.passed) {
          onPassed();
        }
      } else {
        setError(data.error || "Failed to submit quiz");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setRetaking(true);
    setError("");
  };

  // Result screen (after submission or showing previous attempt)
  if (!showForm && (result || latestAttempt)) {
    const attempt = result ?? latestAttempt!;
    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 border-2 ${attempt.passed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-3 mb-2">
            {attempt.passed ? (
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <p className={`text-lg font-bold ${attempt.passed ? "text-emerald-800" : "text-red-800"}`}>
                {attempt.passed ? "Quiz Passed!" : "Not Passed"}
              </p>
              <p className={`text-sm ${attempt.passed ? "text-emerald-600" : "text-red-600"}`}>
                Score: {Math.round(attempt.score)}% &nbsp;·&nbsp; Passing score: {quiz.passingScore}%
              </p>
            </div>
          </div>
          {!attempt.passed && (
            <p className="text-sm text-red-700 mt-2">
              Review the material and try again to improve your score.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleRetake} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          {attempt.passed && (
            <Button onClick={onContinue}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Quiz form
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-sm text-slate-600">
          <span className="font-medium">{quiz.questions.length} questions</span> · Passing score:{" "}
          <span className="font-medium">{quiz.passingScore}%</span>
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {quiz.questions.map((question, idx) => (
        <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Question {idx + 1} of {quiz.questions.length}</p>
          <p className="text-base text-slate-900 mb-4">{question.questionText}</p>

          {question.type === "SHORT_ANSWER" ? (
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3d8f]"
              rows={3}
              placeholder="Your answer..."
              value={answers[question.id]?.text || ""}
              onChange={(e) => setAnswer(question.id, { text: e.target.value })}
            />
          ) : (
            <div className="space-y-2">
              {question.answerOptions.map((option) => {
                const selected = answers[question.id]?.optionId === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#1a3d8f]" : "border-slate-300"}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-[#1a3d8f]" />}
                    </div>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={selected}
                      onChange={() => setAnswer(question.id, { optionId: option.id })}
                      className="sr-only"
                    />
                    <span className="text-sm text-slate-800">{option.text}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <Button
        onClick={submit}
        loading={submitting}
        size="lg"
        className="w-full"
        disabled={isPreview}
        title={isPreview ? "Quiz submission disabled in preview mode" : undefined}
      >
        {isPreview ? "Submit Quiz (Preview — disabled)" : "Submit Quiz"}
      </Button>
    </div>
  );
}
