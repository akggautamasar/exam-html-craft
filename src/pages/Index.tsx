import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Users, 
  BarChart3, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Award,
  Target,
  Brain,
  Zap,
  Timer,
  FileText,
  Settings,
  Download,
  Upload,
  Share2,
  Filter,
  Search,
  Eye,
  EyeOff,
  Lightbulb,
  GraduationCap,
  Medal,
  Crown,
  Sparkles,
  Save,
  X,
  Copy,
  Import
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  passingScore: number;
  createdAt: Date;
  attempts: number;
  averageScore: number;
}

interface ExamResult {
  id: string;
  examId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
  answers: { [key: string]: number };
  passed: boolean;
}

interface UserStats {
  totalExams: number;
  averageScore: number;
  totalTimeSpent: number;
  streak: number;
  rank: string;
  achievements: string[];
}

const Index = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalExams: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    streak: 0,
    rank: 'Beginner',
    achievements: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    title: '',
    description: '',
    questions: [],
    timeLimit: 30,
    category: '',
    difficulty: 'medium',
    passingScore: 70
  });
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium',
    category: '',
    points: 1
  });
  const [bulkQuestions, setBulkQuestions] = useState('');

  // Sample data initialization
  useEffect(() => {
    const sampleExams: Exam[] = [
      {
        id: '1',
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript basics including variables, functions, and control structures.',
        questions: [
          {
            id: '1',
            question: 'What is the correct way to declare a variable in JavaScript?',
            options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
            correctAnswer: 0,
            explanation: 'The "var" keyword is used to declare variables in JavaScript.',
            difficulty: 'easy',
            category: 'JavaScript',
            points: 1
          },
          {
            id: '2',
            question: 'Which method is used to add an element to the end of an array?',
            options: ['append()', 'push()', 'add()', 'insert()'],
            correctAnswer: 1,
            explanation: 'The push() method adds one or more elements to the end of an array.',
            difficulty: 'medium',
            category: 'JavaScript',
            points: 2
          }
        ],
        timeLimit: 30,
        category: 'Programming',
        difficulty: 'medium',
        passingScore: 70,
        createdAt: new Date(),
        attempts: 156,
        averageScore: 78
      },
      {
        id: '2',
        title: 'React Components',
        description: 'Advanced concepts in React including hooks, state management, and component lifecycle.',
        questions: [
          {
            id: '3',
            question: 'What hook is used for side effects in React?',
            options: ['useState', 'useEffect', 'useContext', 'useReducer'],
            correctAnswer: 1,
            explanation: 'useEffect is used to perform side effects in functional components.',
            difficulty: 'medium',
            category: 'React',
            points: 2
          }
        ],
        timeLimit: 45,
        category: 'Frontend',
        difficulty: 'hard',
        passingScore: 80,
        createdAt: new Date(),
        attempts: 89,
        averageScore: 72
      }
    ];
    setExams(sampleExams);

    // Load user stats
    const stats: UserStats = {
      totalExams: 12,
      averageScore: 85,
      totalTimeSpent: 480,
      streak: 5,
      rank: 'Expert',
      achievements: ['First Exam', 'Perfect Score', 'Speed Demon', 'Consistent Performer']
    };
    setUserStats(stats);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExamActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamActive, isPaused, timeLeft]);

  const startExam = (exam: Exam) => {
    setCurrentExam(exam);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(exam.timeLimit * 60);
    setIsExamActive(true);
    setIsPaused(false);
    toast.success(`Started exam: ${exam.title}`);
  };

  const pauseExam = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Exam resumed' : 'Exam paused');
  };

  const finishExam = () => {
    if (!currentExam) return;

    const correctAnswers = currentExam.questions.reduce((count, question) => {
      return answers[question.id] === question.correctAnswer ? count + 1 : count;
    }, 0);

    const score = Math.round((correctAnswers / currentExam.questions.length) * 100);
    const timeSpent = (currentExam.timeLimit * 60) - timeLeft;
    const passed = score >= currentExam.passingScore;

    const result: ExamResult = {
      id: Date.now().toString(),
      examId: currentExam.id,
      score,
      totalQuestions: currentExam.questions.length,
      correctAnswers,
      timeSpent,
      completedAt: new Date(),
      answers,
      passed
    };

    setResults(prev => [...prev, result]);
    setCurrentResult(result);
    setShowResults(true);
    setIsExamActive(false);
    setCurrentExam(null);

    // Update user stats
    setUserStats(prev => ({
      ...prev,
      totalExams: prev.totalExams + 1,
      averageScore: Math.round((prev.averageScore * prev.totalExams + score) / (prev.totalExams + 1)),
      totalTimeSpent: prev.totalTimeSpent + timeSpent,
      streak: passed ? prev.streak + 1 : 0
    }));

    toast.success(passed ? 'Congratulations! You passed!' : 'Better luck next time!');
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const nextQuestion = () => {
    if (currentExam && currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Beginner': return <Target className="w-4 h-4" />;
      case 'Intermediate': return <Star className="w-4 h-4" />;
      case 'Advanced': return <Award className="w-4 h-4" />;
      case 'Expert': return <Crown className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exam.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || exam.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(exams.map(exam => exam.category))];

  // Question management functions
  const addQuestion = () => {
    if (!newQuestion.question || !newQuestion.options?.every(opt => opt.trim())) {
      toast.error('Please fill in all question fields');
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      question: newQuestion.question!,
      options: newQuestion.options!,
      correctAnswer: newQuestion.correctAnswer!,
      explanation: newQuestion.explanation || '',
      difficulty: newQuestion.difficulty!,
      category: newQuestion.category || newExam.category || '',
      points: newQuestion.points || 1
    };

    setNewExam(prev => ({
      ...prev,
      questions: [...(prev.questions || []), question]
    }));

    // Reset form
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
      category: '',
      points: 1
    });

    setShowAddQuestion(false);
    toast.success('Question added successfully!');
  };

  const editQuestion = (index: number) => {
    const question = newExam.questions![index];
    setNewQuestion(question);
    setEditingQuestionIndex(index);
    setShowAddQuestion(true);
  };

  const updateQuestion = () => {
    if (editingQuestionIndex === null) return;

    const updatedQuestions = [...(newExam.questions || [])];
    updatedQuestions[editingQuestionIndex] = {
      ...newQuestion,
      id: updatedQuestions[editingQuestionIndex].id
    } as Question;

    setNewExam(prev => ({
      ...prev,
      questions: updatedQuestions
    }));

    setEditingQuestionIndex(null);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
      category: '',
      points: 1
    });
    setShowAddQuestion(false);
    toast.success('Question updated successfully!');
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = newExam.questions?.filter((_, i) => i !== index) || [];
    setNewExam(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
    toast.success('Question deleted successfully!');
  };

  const processBulkQuestions = () => {
    try {
      const lines = bulkQuestions.trim().split('\n');
      const questions: Question[] = [];
      
      for (let i = 0; i < lines.length; i += 7) {
        if (i + 5 >= lines.length) break;
        
        const question = lines[i].replace(/^\d+\.\s*/, '').trim();
        const options = [
          lines[i + 1].replace(/^[a-d]\)\s*/i, '').trim(),
          lines[i + 2].replace(/^[a-d]\)\s*/i, '').trim(),
          lines[i + 3].replace(/^[a-d]\)\s*/i, '').trim(),
          lines[i + 4].replace(/^[a-d]\)\s*/i, '').trim()
        ];
        const correctAnswerLetter = lines[i + 5].replace(/^Answer:\s*/i, '').trim().toLowerCase();
        const correctAnswer = ['a', 'b', 'c', 'd'].indexOf(correctAnswerLetter);
        const explanation = lines[i + 6] ? lines[i + 6].replace(/^Explanation:\s*/i, '').trim() : '';

        if (question && options.every(opt => opt) && correctAnswer !== -1) {
          questions.push({
            id: Date.now().toString() + i,
            question,
            options,
            correctAnswer,
            explanation,
            difficulty: 'medium',
            category: newExam.category || '',
            points: 1
          });
        }
      }

      if (questions.length > 0) {
        setNewExam(prev => ({
          ...prev,
          questions: [...(prev.questions || []), ...questions]
        }));
        setBulkQuestions('');
        setShowBulkImport(false);
        toast.success(`${questions.length} questions imported successfully!`);
      } else {
        toast.error('No valid questions found. Please check the format.');
      }
    } catch (error) {
      toast.error('Error processing questions. Please check the format.');
    }
  };

  const saveExam = () => {
    if (!newExam.title || !newExam.description || !newExam.category || !newExam.questions?.length) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }

    const exam: Exam = {
      id: Date.now().toString(),
      title: newExam.title!,
      description: newExam.description!,
      questions: newExam.questions!,
      timeLimit: newExam.timeLimit!,
      category: newExam.category!,
      difficulty: newExam.difficulty!,
      passingScore: newExam.passingScore!,
      createdAt: new Date(),
      attempts: 0,
      averageScore: 0
    };

    setExams(prev => [...prev, exam]);
    
    // Reset form
    setNewExam({
      title: '',
      description: '',
      questions: [],
      timeLimit: 30,
      category: '',
      difficulty: 'medium',
      passingScore: 70
    });

    setShowCreateExam(false);
    toast.success('Exam created successfully!');
  };

  const generateHTMLTest = (exam: Exam) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${exam.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .exam-info {
            display: flex;
            justify-content: space-around;
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-item {
            text-align: center;
        }
        
        .info-item .label {
            font-size: 0.9em;
            color: #6c757d;
            margin-bottom: 5px;
        }
        
        .info-item .value {
            font-size: 1.2em;
            font-weight: bold;
            color: #495057;
        }
        
        .content {
            padding: 30px;
        }
        
        .question {
            margin-bottom: 30px;
            padding: 25px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .question:hover {
            border-color: #667eea;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
        }
        
        .question-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .question-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
        }
        
        .question-text {
            font-size: 1.1em;
            font-weight: 500;
            color: #2c3e50;
            line-height: 1.6;
            flex: 1;
        }
        
        .difficulty {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .difficulty.easy {
            background: #d4edda;
            color: #155724;
        }
        
        .difficulty.medium {
            background: #fff3cd;
            color: #856404;
        }
        
        .difficulty.hard {
            background: #f8d7da;
            color: #721c24;
        }
        
        .options {
            margin-top: 20px;
        }
        
        .option {
            display: flex;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #fff;
        }
        
        .option:hover {
            border-color: #667eea;
            background: #f8f9ff;
        }
        
        .option input[type="radio"] {
            margin-right: 15px;
            transform: scale(1.2);
        }
        
        .option label {
            cursor: pointer;
            font-size: 1em;
            color: #495057;
            flex: 1;
        }
        
        .submit-section {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.1em;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .timer {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            font-weight: bold;
            color: #495057;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .exam-info {
                flex-direction: column;
                gap: 15px;
            }
            
            .question-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .timer {
                position: static;
                margin-bottom: 20px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="timer" id="timer">Time: ${exam.timeLimit}:00</div>
    
    <div class="container">
        <div class="header">
            <h1>${exam.title}</h1>
            <p>${exam.description}</p>
        </div>
        
        <div class="exam-info">
            <div class="info-item">
                <div class="label">Questions</div>
                <div class="value">${exam.questions.length}</div>
            </div>
            <div class="info-item">
                <div class="label">Time Limit</div>
                <div class="value">${exam.timeLimit} min</div>
            </div>
            <div class="info-item">
                <div class="label">Passing Score</div>
                <div class="value">${exam.passingScore}%</div>
            </div>
            <div class="info-item">
                <div class="label">Difficulty</div>
                <div class="value">${exam.difficulty}</div>
            </div>
        </div>
        
        <form class="content" id="examForm">
            ${exam.questions.map((question, index) => `
                <div class="question">
                    <div class="question-header">
                        <div style="display: flex; align-items: center; flex: 1;">
                            <div class="question-number">${index + 1}</div>
                            <div class="question-text">${question.question}</div>
                        </div>
                        <div class="difficulty ${question.difficulty}">${question.difficulty}</div>
                    </div>
                    <div class="options">
                        ${question.options.map((option, optIndex) => `
                            <div class="option">
                                <input type="radio" id="q${index}_${optIndex}" name="question_${index}" value="${optIndex}">
                                <label for="q${index}_${optIndex}">${option}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            
            <div class="submit-section">
                <button type="submit" class="submit-btn">Submit Exam</button>
            </div>
        </form>
    </div>
    
    <script>
        // Timer functionality
        let timeLeft = ${exam.timeLimit * 60};
        const timerElement = document.getElementById('timer');
        
        function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = \`Time: \${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            
            if (timeLeft <= 0) {
                submitExam();
                return;
            }
            
            if (timeLeft <= 300) { // 5 minutes
                timerElement.style.color = '#dc3545';
                timerElement.style.animation = 'pulse 1s infinite';
            }
            
            timeLeft--;
        }
        
        setInterval(updateTimer, 1000);
        
        // Form submission
        document.getElementById('examForm').addEventListener('submit', function(e) {
            e.preventDefault();
            submitExam();
        });
        
        function submitExam() {
            const formData = new FormData(document.getElementById('examForm'));
            const answers = {};
            let score = 0;
            const totalQuestions = ${exam.questions.length};
            
            // Collect answers
            for (let i = 0; i < totalQuestions; i++) {
                const answer = formData.get(\`question_\${i}\`);
                if (answer !== null) {
                    answers[i] = parseInt(answer);
                }
            }
            
            // Calculate score
            const correctAnswers = ${JSON.stringify(exam.questions.map(q => q.correctAnswer))};
            for (let i = 0; i < totalQuestions; i++) {
                if (answers[i] === correctAnswers[i]) {
                    score++;
                }
            }
            
            const percentage = Math.round((score / totalQuestions) * 100);
            const passed = percentage >= ${exam.passingScore};
            
            // Show results
            alert(\`Exam completed!\\n\\nScore: \${percentage}%\\nCorrect: \${score}/\${totalQuestions}\\nResult: \${passed ? 'PASSED' : 'FAILED'}\`);
        }
        
        // Add pulse animation for timer
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_test.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML test file downloaded!');
  };

  if (isExamActive && currentExam) {
    const currentQuestion = currentExam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Exam Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentExam.title}</h1>
                  <p className="text-gray-600">Question {currentQuestionIndex + 1} of {currentExam.questions.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  <Timer className="w-4 h-4" />
                  <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                </div>
                <Button onClick={pauseExam} variant="outline" size="sm">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button onClick={finishExam} variant="destructive" size="sm">
                  Finish Exam
                </Button>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </Badge>
                  <Badge variant="outline">{currentQuestion.points} points</Badge>
                </div>
                <Badge variant="secondary">{currentQuestion.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border">
                <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(currentQuestion.id, index)}
                    className={`p-4 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      answers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="px-6"
                >
                  Previous
                </Button>
                {currentQuestionIndex === currentExam.questions.length - 1 ? (
                  <Button onClick={finishExam} className="px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    Submit Exam
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="px-6">
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Navigation */}
          <Card className="mt-6 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {currentExam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500 text-white shadow-md'
                        : answers[currentExam.questions[index].id] !== undefined
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ExamCraft Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master your skills with our advanced exam platform featuring real-time analytics, 
            adaptive learning, and comprehensive progress tracking.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-2xl p-2">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 rounded-xl">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center space-x-2 rounded-xl">
              <BookOpen className="w-4 h-4" />
              <span>Exams</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2 rounded-xl">
              <Trophy className="w-4 h-4" />
              <span>Results</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 rounded-xl">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2 rounded-xl">
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Exams</p>
                      <p className="text-3xl font-bold">{userStats.totalExams}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Average Score</p>
                      <p className="text-3xl font-bold">{userStats.averageScore}%</p>
                    </div>
                    <Trophy className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Current Streak</p>
                      <p className="text-3xl font-bold">{userStats.streak}</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Rank</p>
                      <div className="flex items-center space-x-2">
                        {getRankIcon(userStats.rank)}
                        <p className="text-2xl font-bold">{userStats.rank}</p>
                      </div>
                    </div>
                    <Crown className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {results.slice(-5).reverse().map((result, index) => {
                        const exam = exams.find(e => e.id === result.examId);
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <div className={`p-2 rounded-full ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                              {result.passed ? 
                                <CheckCircle className="w-4 h-4 text-green-600" /> : 
                                <XCircle className="w-4 h-4 text-red-600" />
                              }
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{exam?.title}</p>
                              <p className="text-sm text-gray-600">Score: {result.score}%</p>
                            </div>
                            <Badge variant={result.passed ? "default" : "destructive"}>
                              {result.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {userStats.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                        <Medal className="w-6 h-6 text-yellow-600" />
                        <span className="font-medium text-gray-900">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {exam.title}
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600">
                          {exam.description}
                        </CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(exam.difficulty)}>
                        {exam.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{exam.timeLimit} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>{exam.questions.length} questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{exam.attempts} attempts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <span>{exam.averageScore}% avg</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{exam.category}</Badge>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => generateHTMLTest(exam)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => startExam(exam)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Exam Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {results.map((result) => {
                      const exam = exams.find(e => e.id === result.examId);
                      return (
                        <div key={result.id} className="p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-blue-50">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{exam?.title}</h3>
                            <Badge variant={result.passed ? "default" : "destructive"}>
                              {result.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Score</p>
                              <p className="font-semibold text-lg">{result.score}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Correct</p>
                              <p className="font-semibold">{result.correctAnswers}/{result.totalQuestions}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Time</p>
                              <p className="font-semibold">{formatTime(result.timeSpent)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Date</p>
                              <p className="font-semibold">{result.completedAt.toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Performance Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                      <div>
                        <p className="text-sm text-gray-600">Best Performance</p>
                        <p className="text-2xl font-bold text-green-600">95%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div>
                        <p className="text-sm text-gray-600">Average Time</p>
                        <p className="text-2xl font-bold text-blue-600">24 min</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                      <div>
                        <p className="text-sm text-gray-600">Improvement Rate</p>
                        <p className="text-2xl font-bold text-purple-600">+12%</p>
                      </div>
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Subject Mastery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category, index) => {
                      const categoryResults = results.filter(r => {
                        const exam = exams.find(e => e.id === r.examId);
                        return exam?.category === category;
                      });
                      const avgScore = categoryResults.length > 0 
                        ? Math.round(categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length)
                        : 0;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{category}</span>
                            <span className="text-sm text-gray-600">{avgScore}%</span>
                          </div>
                          <Progress value={avgScore} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Exam</span>
                </CardTitle>
                <CardDescription>
                  Build custom exams with advanced question types and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Exam Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter exam title..."
                        value={newExam.title}
                        onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter exam description..."
                        value={newExam.description}
                        onChange={(e) => setNewExam(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        placeholder="Enter category..."
                        value={newExam.category}
                        onChange={(e) => setNewExam(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={newExam.timeLimit}
                        onChange={(e) => setNewExam(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={newExam.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewExam(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        value={newExam.passingScore}
                        onChange={(e) => setNewExam(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5" />
                      <span>Questions ({newExam.questions?.length || 0})</span>
                    </h3>
                    <div className="flex space-x-2">
                      <Button onClick={() => setShowBulkImport(true)} variant="outline">
                        <Import className="w-4 h-4 mr-2" />
                        Bulk Import
                      </Button>
                      <Button onClick={() => setShowAddQuestion(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                  
                  {newExam.questions && newExam.questions.length > 0 ? (
                    <div className="space-y-4">
                      {newExam.questions.map((question, index) => (
                        <Card key={index} className="border-2 border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline">Q{index + 1}</Badge>
                                  <Badge className={getDifficultyColor(question.difficulty)}>
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="secondary">{question.points} pts</Badge>
                                </div>
                                <p className="font-medium text-gray-900">{question.question}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button onClick={() => editQuestion(index)} variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button onClick={() => deleteQuestion(index)} variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className={`p-2 rounded border ${
                                  optIndex === question.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {optIndex === question.correctAnswer && (
                                    <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50 border-dashed">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300">
                            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No questions added yet</p>
                            <div className="flex justify-center space-x-4">
                              <Button onClick={() => setShowAddQuestion(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                Add First Question
                              </Button>
                              <Button onClick={() => setShowBulkImport(true)} variant="outline">
                                Bulk Import
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {newExam.questions && newExam.questions.length > 0 && (
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button onClick={() => setNewExam({
                      title: '',
                      description: '',
                      questions: [],
                      timeLimit: 30,
                      category: '',
                      difficulty: 'medium',
                      passingScore: 70
                    })} variant="outline">
                      Reset
                    </Button>
                    <Button onClick={saveExam} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Exam
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Question Dialog */}
        <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your question..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Answer Options *</Label>
                {newQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                      />
                      <Label className="text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </Label>
                    </div>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(newQuestion.options || [])];
                        newOptions[index] = e.target.value;
                        setNewQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionDifficulty">Difficulty</Label>
                  <Select value={newQuestion.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewQuestion(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain the correct answer..."
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button onClick={() => {
                  setShowAddQuestion(false);
                  setEditingQuestionIndex(null);
                  setNewQuestion({
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: '',
                    difficulty: 'medium',
                    category: '',
                    points: 1
                  });
                }} variant="outline">
                  Cancel
                </Button>
                <Button onClick={editingQuestionIndex !== null ? updateQuestion : addQuestion}>
                  {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Dialog */}
        <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Import Questions</DialogTitle>
              <DialogDescription>
                Import multiple questions at once using the format below. Each question should be separated by a blank line.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Format Example:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`1. What is the capital of France?
a) London
b) Berlin
c) Paris
d) Madrid
Answer: c
Explanation: Paris is the capital and largest city of France.

2. Which programming language is known for web development?
a) Python
b) JavaScript
c) C++
d) Java
Answer: b
Explanation: JavaScript is primarily used for web development.`}
                </pre>
              </div>
              
              <div>
                <Label htmlFor="bulkQuestions">Paste Questions Here</Label>
                <Textarea
                  id="bulkQuestions"
                  placeholder="Paste your questions in the format shown above..."
                  value={bulkQuestions}
                  onChange={(e) => setBulkQuestions(e.target.value)}
                  className="min-h-[300px]"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button onClick={() => {
                  setShowBulkImport(false);
                  setBulkQuestions('');
                }} variant="outline">
                  Cancel
                </Button>
                <Button onClick={processBulkQuestions} disabled={!bulkQuestions.trim()}>
                  <Import className="w-4 h-4 mr-2" />
                  Import Questions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6" />
                <span>Exam Results</span>
              </DialogTitle>
            </DialogHeader>
            {currentResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    currentResult.passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {currentResult.passed ? 
                      <CheckCircle className="w-10 h-10 text-green-600" /> : 
                      <XCircle className="w-10 h-10 text-red-600" />
                    }
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{currentResult.score}%</h2>
                  <p className={`text-lg font-semibold ${currentResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {currentResult.passed ? 'Congratulations! You passed!' : 'Better luck next time!'}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">{currentResult.correctAnswers}</p>
                    <p className="text-sm text-gray-600">Correct Answers</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50">
                    <p className="text-2xl font-bold text-purple-600">{formatTime(currentResult.timeSpent)}</p>
                    <p className="text-sm text-gray-600">Time Spent</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-2xl font-bold text-green-600">{currentResult.totalQuestions}</p>
                    <p className="text-sm text-gray-600">Total Questions</p>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setShowResults(false)} variant="outline">
                    Close
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;