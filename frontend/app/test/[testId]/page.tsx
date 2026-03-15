'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

type Question = {
  id: string;
  text: string;
  type: string;
  options: string[];
  marks: number;
};

type Answer = { questionId: string; answer: string };

export default function TestPage() {
  const { testId } = useParams() as { testId: string };
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Start test
  const startTest = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/tests/start/${testId}`);
      setQuestions(data.questions);
      setAttemptId(data.attempt.id);
      setTimeLeft(data.attempt.duration * 60);
      setDuration(data.attempt.duration * 60);
      setTotalMarks(data.attempt.totalMarks);
      setStarted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start test');
    } finally {
      setIsLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  const { mutate: submitTest, isPending } = useMutation({
    mutationFn: (payload: any) => api.post(`/tests/submit/${attemptId}`, payload).then(r => r.data),
    onSuccess: (data) => setResult(data),
    onError: (err: any) => toast.error(err.response?.data?.error || 'Submission failed'),
  });

  const handleSubmit = useCallback(() => {
    if (!attemptId) return;
    const answersArr: Answer[] = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    submitTest({ answers: answersArr, timeTaken: duration - timeLeft });
  }, [attemptId, answers, duration, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const answered = Object.keys(answers).length;
  const skipped = questions.length - answered;
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  // ─── Result View ─────────────────────────────────────────────────────────
  if (result) {
    const { analysis, answers: detailedAnswers } = result;
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Score Card */}
          <div className={`card p-8 text-center mb-6 ${analysis.isPassed ? 'border-green-200' : 'border-red-200'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              analysis.isPassed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {analysis.isPassed
                ? <Trophy className="w-12 h-12 text-green-500" />
                : <XCircle className="w-12 h-12 text-red-500" />}
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
              {analysis.isPassed ? 'Congratulations! 🎉' : 'Better luck next time!'}
            </h1>
            <div className="text-5xl font-extrabold gradient-text mb-1">{analysis.percentage}%</div>
            <p className="text-slate-500">{analysis.score} / {analysis.totalMarks} marks</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: CheckCircle, label: 'Correct', value: analysis.correct, color: 'text-green-500 bg-green-50' },
              { icon: XCircle, label: 'Wrong', value: analysis.incorrect, color: 'text-red-500 bg-red-50' },
              { icon: AlertCircle, label: 'Skipped', value: analysis.skipped, color: 'text-amber-500 bg-amber-50' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-xl text-slate-900">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Answers Review */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-slate-900 mb-5">Answer Review</h2>
            <div className="space-y-6">
              {detailedAnswers?.map((ans: any, i: number) => {
                const q = questions.find(q => q.id === ans.questionId);
                return (
                  <div key={ans.questionId} className={`p-4 rounded-xl border-2 ${
                    ans.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        ans.isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                      }`}>{i+1}</span>
                      <p className="text-slate-800 text-sm font-medium">{q?.text}</p>
                    </div>
                    {q?.options && (
                      <div className="ml-9 grid grid-cols-2 gap-2 mb-3">
                        {(q.options as string[]).map((opt: string, oi: number) => (
                          <div key={oi} className={`text-xs px-3 py-2 rounded-lg border ${
                            opt === ans.correctAnswer ? 'option-correct border-green-300' :
                            opt === ans.givenAnswer && !ans.isCorrect ? 'option-wrong border-red-300' :
                            'bg-white border-slate-200'
                          }`}>{opt}</div>
                        ))}
                      </div>
                    )}
                    {ans.explanation && (
                      <div className="ml-9 text-xs text-slate-600 bg-white/70 p-3 rounded-lg">
                        💡 <strong>Explanation:</strong> {ans.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => router.back()} className="btn-outline flex-1">Back to Course</button>
            <button onClick={() => { setResult(null); setStarted(false); setAnswers({}); }} className="btn-primary flex-1">
              Retake Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pre-start ───────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8">
        <div className="card p-8 max-w-md w-full text-center mx-4">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Ready to Start?</h1>
          <p className="text-slate-500 text-sm mb-6">
            Once started, the timer cannot be paused. Make sure you're in a quiet environment.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
            <div className="text-left"><span className="text-slate-500">Total Marks:</span> <strong>{totalMarks || '–'}</strong></div>
            <div className="text-left"><span className="text-slate-500">Duration:</span> <strong>60 min</strong></div>
            <div className="text-left"><span className="text-slate-500">Questions:</span> <strong>{questions.length || '–'}</strong></div>
            <div className="text-left"><span className="text-slate-500">Negative:</span> <strong>-¼</strong></div>
          </div>
          <button onClick={startTest} disabled={isLoading} className="btn-primary w-full py-3.5">
            {isLoading ? 'Loading...' : 'Start Test Now'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Test View ────────────────────────────────────────────────────────────
  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className={`bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 ${timeLeft < 300 ? 'border-red-200 bg-red-50' : ''}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-700">
            Q {currentIdx + 1} of {questions.length}
          </div>
          <div className="progress-bar w-48">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
            <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
          </div>
          <button onClick={() => { if (confirm('Submit test now?')) handleSubmit(); }}
            disabled={isPending}
            className="btn-accent text-sm py-2 px-4">
            {isPending ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Question */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="badge-blue">Q{currentIdx + 1}</span>
              <span className="text-xs text-slate-500">{currentQ?.marks} mark{currentQ?.marks !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-slate-900 text-base font-medium leading-relaxed">{currentQ?.text}</p>
          </div>

          {/* Options */}
          {currentQ?.options && (
            <div className="space-y-3">
              {(currentQ.options as string[]).map((opt: string, i: number) => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}>
                    <span className={`inline-flex w-6 h-6 rounded-full border-2 items-center justify-center mr-3 text-xs font-bold ${
                      isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="btn-outline text-sm py-2 px-4 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
              disabled={currentIdx === questions.length - 1}
              className="btn-primary text-sm py-2 px-4">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Grid */}
        <div className="card p-5 h-fit">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentIdx(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  i === currentIdx
                    ? 'bg-brand-600 text-white shadow-brand'
                    : answers[q.id]
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>{i + 1}</button>
            ))}
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-brand-600" /><span>Current</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border border-green-300" /><span>Answered ({answered})</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-100" /><span>Not answered ({skipped})</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
