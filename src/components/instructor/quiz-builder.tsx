"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Save } from "lucide-react";
import type { Quiz, Question, AnswerOption } from "@/types";

type FullQuestion = Question & { answerOptions: AnswerOption[] };
type FullQuiz = Quiz & { questions: FullQuestion[] };

interface QuizBuilderProps {
  quiz: FullQuiz;
  onUpdate: (quiz: FullQuiz) => void;
}

export function QuizBuilder({ quiz: initialQuiz, onUpdate }: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<FullQuiz>(initialQuiz);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const updateQuizMeta = (updates: Partial<FullQuiz>) => {
    setQuiz((p) => ({ ...p, ...updates }));
  };

  const addQuestion = async (type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER") => {
    const res = await fetch(`/api/quizzes/${quiz.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    if (res.ok) {
      const updated = { ...quiz, questions: [...quiz.questions, data.data] };
      setQuiz(updated);
      onUpdate(updated);
    } else {
      addToast(data.error || "Failed to add question", "error");
    }
  };

  const deleteQuestion = async (questionId: string) => {
    const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
    if (res.ok) {
      const updated = { ...quiz, questions: quiz.questions.filter((q) => q.id !== questionId) };
      setQuiz(updated);
      onUpdate(updated);
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<FullQuestion>) => {
    setQuiz((p) => ({
      ...p,
      questions: p.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
    }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Save quiz metadata
      await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: quiz.title, passingScore: quiz.passingScore }),
      });

      // Save each question
      for (const question of quiz.questions) {
        await fetch(`/api/questions/${question.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionText: question.questionText,
            answerOptions: question.answerOptions,
          }),
        });
      }

      onUpdate(quiz);
      addToast("Quiz saved", "success");
    } catch {
      addToast("Failed to save quiz", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Quiz Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quiz title"
            value={quiz.title}
            onChange={(e) => updateQuizMeta({ title: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Passing score (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={quiz.passingScore}
              onChange={(e) => updateQuizMeta({ passingScore: parseInt(e.target.value) || 0 })}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, idx) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={idx + 1}
            onChange={(updates) => updateQuestion(question.id, updates)}
            onDelete={() => deleteQuestion(question.id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => addQuestion("MULTIPLE_CHOICE")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Multiple choice
        </button>
        <button
          onClick={() => addQuestion("TRUE_FALSE")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          True / False
        </button>
        <button
          onClick={() => addQuestion("SHORT_ANSWER")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Short answer
        </button>
      </div>

      <Button onClick={saveAll} loading={saving} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Quiz
      </Button>
    </div>
  );
}

function QuestionEditor({
  question, index, onChange, onDelete,
}: {
  question: FullQuestion;
  index: number;
  onChange: (updates: Partial<FullQuestion>) => void;
  onDelete: () => void;
}) {
  const typeLabel = {
    MULTIPLE_CHOICE: "Multiple Choice",
    TRUE_FALSE: "True / False",
    SHORT_ANSWER: "Short Answer",
  }[question.type];

  const setCorrect = (optionId: string) => {
    onChange({
      answerOptions: question.answerOptions.map((o) => ({
        ...o,
        isCorrect: question.type === "MULTIPLE_CHOICE" ? o.id === optionId : o.id === optionId,
      })),
    });
  };

  const updateOptionText = (optionId: string, text: string) => {
    onChange({
      answerOptions: question.answerOptions.map((o) => (o.id === optionId ? { ...o, text } : o)),
    });
  };

  const addOption = () => {
    onChange({
      answerOptions: [
        ...question.answerOptions,
        { id: `temp-${Date.now()}`, questionId: question.id, text: "New option", isCorrect: false },
      ],
    });
  };

  const removeOption = async (optionId: string) => {
    if (question.answerOptions.length <= 2) return;
    // Temp options haven't been persisted — remove from local state only
    if (optionId.startsWith("temp-")) {
      onChange({ answerOptions: question.answerOptions.filter((o) => o.id !== optionId) });
      return;
    }
    const res = await fetch(`/api/answer-options/${optionId}`, { method: "DELETE" });
    if (res.ok) {
      onChange({ answerOptions: question.answerOptions.filter((o) => o.id !== optionId) });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-medium text-indigo-600">Q{index} · {typeLabel}</span>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <textarea
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
        rows={2}
        placeholder="Question text..."
        value={question.questionText}
        onChange={(e) => onChange({ questionText: e.target.value })}
      />

      {question.type === "SHORT_ANSWER" ? (
        <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-500 italic">
          Students will type a free-form answer (not auto-graded as correct/incorrect).
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 mb-1">
            Answer options — check the correct answer{question.type === "MULTIPLE_CHOICE" ? "" : ""}
          </p>
          {question.answerOptions.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Checkbox
                checked={option.isCorrect}
                onCheckedChange={() => setCorrect(option.id)}
              />
              <input
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                value={option.text}
                onChange={(e) => updateOptionText(option.id, e.target.value)}
                disabled={question.type === "TRUE_FALSE"}
              />
              {question.type === "MULTIPLE_CHOICE" && question.answerOptions.length > 2 && (
                <button
                  onClick={() => removeOption(option.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Remove option"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {question.type === "MULTIPLE_CHOICE" && (
            <button
              onClick={addOption}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-1"
            >
              <Plus className="h-3 w-3" />
              Add option
            </button>
          )}
        </div>
      )}
    </div>
  );
}
