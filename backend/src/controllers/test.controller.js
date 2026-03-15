const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/appError');

const prisma = new PrismaClient();

// ─── Get Tests for Course ─────────────────────────────────────────────────────
exports.getCourseTests = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (!enrollment) throw new AppError('Not enrolled in this course', 403);

    const tests = await prisma.test.findMany({
      where: { courseId, isPublished: true },
      include: { _count: { select: { questions: true, attempts: true } } }
    });

    // Get user's best attempt for each test
    const testsWithAttempts = await Promise.all(tests.map(async (test) => {
      const bestAttempt = await prisma.testAttempt.findFirst({
        where: { userId, testId: test.id, submittedAt: { not: null } },
        orderBy: { score: 'desc' }
      });
      return { ...test, bestAttempt };
    }));

    res.json({ success: true, tests: testsWithAttempts });
  } catch (err) { next(err); }
};

// ─── Start Test ───────────────────────────────────────────────────────────────
exports.startTest = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const userId = req.user.userId;

    const test = await prisma.test.findUnique({
      where: { id: testId, isPublished: true },
      include: {
        questions: {
          select: {
            id: true, text: true, type: true, options: true,
            marks: true, negativeMarks: true
          }
        }
      }
    });
    if (!test) throw new AppError('Test not found', 404);

    // Create attempt
    const attempt = await prisma.testAttempt.create({
      data: { userId, testId }
    });

    // Shuffle questions for randomization
    const shuffled = test.questions.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      attempt: {
        id: attempt.id,
        startedAt: attempt.startedAt,
        duration: test.duration,
        totalMarks: test.totalMarks
      },
      questions: shuffled
    });
  } catch (err) { next(err); }
};

// ─── Submit Test ──────────────────────────────────────────────────────────────
exports.submitTest = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeTaken } = req.body; // answers: [{questionId, answer}]
    const userId = req.user.userId;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!attempt) throw new AppError('Attempt not found', 404);
    if (attempt.userId !== userId) throw new AppError('Unauthorized', 403);
    if (attempt.submittedAt) throw new AppError('Already submitted', 400);

    // Evaluate answers
    let totalScore = 0;
    const evaluatedAnswers = answers.map(({ questionId, answer }) => {
      const question = attempt.test.questions.find(q => q.id === questionId);
      if (!question) return null;

      const isCorrect = answer === question.correctAnswer;
      const marksGiven = isCorrect
        ? question.marks
        : answer ? -question.negativeMarks : 0;

      totalScore += marksGiven;

      return { questionId, givenAnswer: answer, isCorrect, marksGiven };
    }).filter(Boolean);

    totalScore = Math.max(0, totalScore); // No negative total
    const percentage = (totalScore / attempt.test.totalMarks) * 100;
    const isPassed = totalScore >= attempt.test.passingMarks;

    // Save attempt
    const updated = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        score: totalScore,
        percentage,
        isPassed,
        timeTaken,
        answers: {
          create: evaluatedAnswers
        }
      }
    });

    // Build detailed analysis
    const analysis = {
      score: totalScore,
      totalMarks: attempt.test.totalMarks,
      percentage: percentage.toFixed(2),
      isPassed,
      timeTaken,
      correct: evaluatedAnswers.filter(a => a.isCorrect).length,
      incorrect: evaluatedAnswers.filter(a => !a.isCorrect && a.givenAnswer).length,
      skipped: attempt.test.questions.length - evaluatedAnswers.filter(a => a.givenAnswer).length,
      total: attempt.test.questions.length
    };

    // Include answers with explanations
    const detailedAnswers = evaluatedAnswers.map(ans => {
      const q = attempt.test.questions.find(q => q.id === ans.questionId);
      return {
        ...ans,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      };
    });

    res.json({ success: true, analysis, answers: detailedAnswers });
  } catch (err) { next(err); }
};

// ─── Get Test Result ──────────────────────────────────────────────────────────
exports.getTestResult = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.userId;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { select: { title: true, totalMarks: true, passingMarks: true, duration: true } },
        answers: {
          include: {
            question: {
              select: { text: true, options: true, correctAnswer: true, explanation: true, marks: true }
            }
          }
        }
      }
    });

    if (!attempt) throw new AppError('Attempt not found', 404);
    if (attempt.userId !== userId) throw new AppError('Unauthorized', 403);

    res.json({ success: true, attempt });
  } catch (err) { next(err); }
};

// ─── Get My Test History ──────────────────────────────────────────────────────
exports.getMyTestHistory = async (req, res, next) => {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { userId: req.user.userId, submittedAt: { not: null } },
      include: {
        test: { select: { id: true, title: true, totalMarks: true, courseId: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
    res.json({ success: true, attempts });
  } catch (err) { next(err); }
};

// ─── Create Test (Admin) ──────────────────────────────────────────────────────
exports.createTest = async (req, res, next) => {
  try {
    const { title, description, duration, totalMarks, passingMarks, courseId, isMock, questions } = req.body;

    const test = await prisma.test.create({
      data: {
        title, description, duration, totalMarks, passingMarks,
        courseId, isMock: isMock || false,
        questions: {
          create: questions.map(q => ({
            text: q.text,
            type: q.type || 'MCQ',
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || 0
          }))
        }
      },
      include: { questions: true }
    });

    res.status(201).json({ success: true, test });
  } catch (err) { next(err); }
};
