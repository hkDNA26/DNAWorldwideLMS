"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

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

interface GradedAnswer {
  questionId: string;
  answerOptionId?: string;
  textAnswer?: string;
  correct: boolean;
}

interface QuizResult {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
  gradedAnswers: GradedAnswer[];
}

interface QuizPlayerProps {
  quiz: Quiz;
  latestAttempt: QuizAttempt | null;
  courseId: string;
  onPassed: () => void;
  isPreview?: boolean;
}

export function QuizPlayer({ quiz, latestAttempt, courseId, onPassed, isPreview = false }: QuizPlayerProps) {
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
      setError(`Please answer all questions before submitting.`);
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

  // Show previous attempt result if not retaking
  if (!showForm && (result || latestAttempt)) {
    const attempt = result || latestAttempt!;
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
                Score: {Math.round(attempt.score)}% (Passing: {quiz.passingScore}%)
              </p>
            </div>
          </div>
          {!attempt.passed && (
            <p className="text-sm text-red-700 mt-2">
              You need {quiz.passingScore}% to pass. You can retake the quiz to try again.
            </p>
          )}
        </div>

        {result?.gradedAnswers && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Review</h3>
            {quiz.questions.map((question) => {
              const graded = result.gradedAnswers.find((a) => a.questionId === question.id);
              const selectedOption = question.answerOptions.find((o) => o.id === graded?.answerOptionId);
              const correctOption = question.answerOptions.find((o) => o.isCorrect);
              return (
                <div key={question.id} className={`p-4 rounded-lg border ${graded?.correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                  <p className="text-sm font-medium text-slate-800 mb-2">{question.questionText}</p>
                  {question.type === "SHORT_ANSWER" ? (
                    <p className="text-xs text-slate-600">Your answer: {answers[question.id]?.text || "(not submitted)"}</p>
                  ) : (
                    <div className="text-xs space-y-1">
                      {selectedOption && (
                        <p className={graded?.correct ? "text-emerald-700" : "text-red-700"}>
                          Your answer: {selectedOption.text}
                        </p>
                      )}
                      {!graded?.correct && correctOption && (
                        <p className="text-emerald-700">Correct: {correctOption.text}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!attempt.passed && (
          <Button onClick={handleRetake} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        )}
      </div>
    );
  }

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
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-indigo-500" : "border-slate-300"}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
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
