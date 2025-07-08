import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  FileText, 
  Clock, 
  Users, 
  BarChart3,
  Settings,
  Eye,
  Save,
  X,
  Copy,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Globe,
  Image
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  questionImage?: string;
  options: string[];
  optionImages?: string[];
  correctAnswer: number;
  explanation?: string;
  explanationImage?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  marks: number;
  negativeMarks: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
  createdAt: Date;
  settings: {
    showResults: boolean;
    allowReview: boolean;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
  };
}

interface ExamResult {
  examId: string;
  score: number;
  totalMarks: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  timeTaken: number;
  completedAt: Date;
}

const Index = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [activeTab, setActiveTab] = useState('exams');
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  // Form states
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    duration: 60,
    showResults: true,
    allowReview: true,
    randomizeQuestions: false,
    randomizeOptions: false
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    questionImage: '',
    options: ['', '', '', ''],
    optionImages: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    explanationImage: '',
    difficulty: 'medium' as const,
    category: '',
    marks: 1,
    negativeMarks: 0.25
  });

  // Load data from localStorage
  useEffect(() => {
    const savedExams = localStorage.getItem('exams');
    const savedResults = localStorage.getItem('examResults');
    
    if (savedExams) {
      setExams(JSON.parse(savedExams));
    }
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('examResults', JSON.stringify(results));
  }, [results]);

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      questionImage: '',
      options: ['', '', '', ''],
      optionImages: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      explanationImage: '',
      difficulty: 'medium',
      category: '',
      marks: 1,
      negativeMarks: 0.25
    });
  };

  const resetExamForm = () => {
    setExamForm({
      title: '',
      description: '',
      duration: 60,
      showResults: true,
      allowReview: true,
      randomizeQuestions: false,
      randomizeOptions: false
    });
  };

  const createExam = () => {
    if (!examForm.title.trim()) {
      toast.error('Please enter exam title');
      return;
    }

    const newExam: Exam = {
      id: Date.now().toString(),
      title: examForm.title,
      description: examForm.description,
      duration: examForm.duration,
      totalMarks: 0,
      questions: [],
      createdAt: new Date(),
      settings: {
        showResults: examForm.showResults,
        allowReview: examForm.allowReview,
        randomizeQuestions: examForm.randomizeQuestions,
        randomizeOptions: examForm.randomizeOptions
      }
    };

    setExams([...exams, newExam]);
    setCurrentExam(newExam);
    resetExamForm();
    setIsCreateExamOpen(false);
    toast.success('Exam created successfully!');
  };

  const addQuestion = () => {
    if (!currentExam) return;
    
    if (!questionForm.question.trim()) {
      toast.error('Please enter question text');
      return;
    }

    if (questionForm.options.some(opt => !opt.trim())) {
      toast.error('Please fill all options');
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: questionForm.question,
      questionImage: questionForm.questionImage || undefined,
      options: questionForm.options,
      optionImages: questionForm.optionImages.some(img => img.trim()) ? questionForm.optionImages : undefined,
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation || undefined,
      explanationImage: questionForm.explanationImage || undefined,
      difficulty: questionForm.difficulty,
      category: questionForm.category,
      marks: questionForm.marks,
      negativeMarks: questionForm.negativeMarks
    };

    const updatedExam = {
      ...currentExam,
      questions: [...currentExam.questions, newQuestion],
      totalMarks: currentExam.totalMarks + questionForm.marks
    };

    setExams(exams.map(exam => exam.id === currentExam.id ? updatedExam : exam));
    setCurrentExam(updatedExam);
    resetQuestionForm();
    setIsQuestionDialogOpen(false);
    toast.success('Question added successfully!');
  };

  const updateQuestion = () => {
    if (!currentExam || !editingQuestion) return;

    if (!questionForm.question.trim()) {
      toast.error('Please enter question text');
      return;
    }

    if (questionForm.options.some(opt => !opt.trim())) {
      toast.error('Please fill all options');
      return;
    }

    const updatedQuestion: Question = {
      ...editingQuestion,
      question: questionForm.question,
      questionImage: questionForm.questionImage || undefined,
      options: questionForm.options,
      optionImages: questionForm.optionImages.some(img => img.trim()) ? questionForm.optionImages : undefined,
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation || undefined,
      explanationImage: questionForm.explanationImage || undefined,
      difficulty: questionForm.difficulty,
      category: questionForm.category,
      marks: questionForm.marks,
      negativeMarks: questionForm.negativeMarks
    };

    const oldMarks = editingQuestion.marks;
    const newMarks = questionForm.marks;
    const marksDifference = newMarks - oldMarks;

    const updatedExam = {
      ...currentExam,
      questions: currentExam.questions.map(q => q.id === editingQuestion.id ? updatedQuestion : q),
      totalMarks: currentExam.totalMarks + marksDifference
    };

    setExams(exams.map(exam => exam.id === currentExam.id ? updatedExam : exam));
    setCurrentExam(updatedExam);
    setEditingQuestion(null);
    resetQuestionForm();
    setIsQuestionDialogOpen(false);
    toast.success('Question updated successfully!');
  };

  const deleteQuestion = (questionId: string) => {
    if (!currentExam) return;

    const questionToDelete = currentExam.questions.find(q => q.id === questionId);
    if (!questionToDelete) return;

    const updatedExam = {
      ...currentExam,
      questions: currentExam.questions.filter(q => q.id !== questionId),
      totalMarks: currentExam.totalMarks - questionToDelete.marks
    };

    setExams(exams.map(exam => exam.id === currentExam.id ? updatedExam : exam));
    setCurrentExam(updatedExam);
    toast.success('Question deleted successfully!');
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      questionImage: question.questionImage || '',
      options: question.options,
      optionImages: question.optionImages || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      explanationImage: question.explanationImage || '',
      difficulty: question.difficulty,
      category: question.category,
      marks: question.marks,
      negativeMarks: question.negativeMarks
    });
    setIsQuestionDialogOpen(true);
  };

  const processBulkImport = () => {
    if (!currentExam || !bulkImportText.trim()) {
      toast.error('Please enter questions in the specified format');
      return;
    }

    try {
      const lines = bulkImportText.trim().split('\n');
      const questions: Question[] = [];
      let currentQuestion: Partial<Question> = {};
      let optionIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('Q:')) {
          // Save previous question if exists
          if (currentQuestion.question && currentQuestion.options) {
            questions.push({
              id: Date.now().toString() + Math.random(),
              question: currentQuestion.question,
              questionImage: currentQuestion.questionImage,
              options: currentQuestion.options,
              optionImages: currentQuestion.optionImages,
              correctAnswer: currentQuestion.correctAnswer || 0,
              explanation: currentQuestion.explanation,
              explanationImage: currentQuestion.explanationImage,
              difficulty: currentQuestion.difficulty || 'medium',
              category: currentQuestion.category || 'General',
              marks: currentQuestion.marks || 1,
              negativeMarks: currentQuestion.negativeMarks || 0.25
            });
          }

          // Start new question
          currentQuestion = {
            question: line.substring(2).trim(),
            options: [],
            optionImages: ['', '', '', ''],
            correctAnswer: 0,
            difficulty: 'medium',
            category: 'General',
            marks: 1,
            negativeMarks: 0.25
          };
          optionIndex = 0;
        } else if (line.startsWith('QI:')) {
          currentQuestion.questionImage = line.substring(3).trim();
        } else if (line.match(/^[A-D]:/)) {
          if (currentQuestion.options) {
            currentQuestion.options[optionIndex] = line.substring(2).trim();
            optionIndex++;
          }
        } else if (line.match(/^[A-D]I:/)) {
          const optIdx = line.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          if (currentQuestion.optionImages) {
            currentQuestion.optionImages[optIdx] = line.substring(3).trim();
          }
        } else if (line.startsWith('ANSWER:')) {
          const answer = line.substring(7).trim().toUpperCase();
          currentQuestion.correctAnswer = answer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        } else if (line.startsWith('EXPLANATION:')) {
          currentQuestion.explanation = line.substring(12).trim();
        } else if (line.startsWith('EI:')) {
          currentQuestion.explanationImage = line.substring(3).trim();
        } else if (line.startsWith('DIFFICULTY:')) {
          const diff = line.substring(11).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            currentQuestion.difficulty = diff as 'easy' | 'medium' | 'hard';
          }
        } else if (line.startsWith('CATEGORY:')) {
          currentQuestion.category = line.substring(9).trim();
        } else if (line.startsWith('MARKS:')) {
          currentQuestion.marks = parseInt(line.substring(6).trim()) || 1;
        } else if (line.startsWith('NEGATIVE:')) {
          currentQuestion.negativeMarks = parseFloat(line.substring(9).trim()) || 0;
        }
      }

      // Add the last question
      if (currentQuestion.question && currentQuestion.options) {
        questions.push({
          id: Date.now().toString() + Math.random(),
          question: currentQuestion.question,
          questionImage: currentQuestion.questionImage,
          options: currentQuestion.options,
          optionImages: currentQuestion.optionImages,
          correctAnswer: currentQuestion.correctAnswer || 0,
          explanation: currentQuestion.explanation,
          explanationImage: currentQuestion.explanationImage,
          difficulty: currentQuestion.difficulty || 'medium',
          category: currentQuestion.category || 'General',
          marks: currentQuestion.marks || 1,
          negativeMarks: currentQuestion.negativeMarks || 0.25
        });
      }

      if (questions.length === 0) {
        toast.error('No valid questions found. Please check the format.');
        return;
      }

      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      const updatedExam = {
        ...currentExam,
        questions: [...currentExam.questions, ...questions],
        totalMarks: currentExam.totalMarks + totalMarks
      };

      setExams(exams.map(exam => exam.id === currentExam.id ? updatedExam : exam));
      setCurrentExam(updatedExam);
      setBulkImportText('');
      setIsBulkImportOpen(false);
      toast.success(`${questions.length} questions imported successfully!`);
    } catch (error) {
      toast.error('Error parsing questions. Please check the format.');
    }
  };

  const generateHTMLTest = (exam: Exam) => {
    if (!exam.questions.length) {
      toast.error('Cannot generate test without questions');
      return;
    }

    const questionsData = exam.questions.map((q, index) => ({
      id: (index + 1).toString(),
      test_series_id: "1",
      test_id: "1",
      question_type: "1",
      question_ui_type: "1",
      question: q.question,
      option_1: q.options[0] || "",
      option_2: q.options[1] || "",
      option_3: q.options[2] || "",
      option_4: q.options[3] || "",
      option_5: "",
      option_6: "",
      option_7: "",
      option_8: "",
      option_9: "",
      option_10: "",
      option_image_1: q.optionImages?.[0] || "",
      option_image_2: q.optionImages?.[1] || "",
      option_image_3: q.optionImages?.[2] || "",
      option_image_4: q.optionImages?.[3] || "",
      option_image_5: "",
      option_image_6: "",
      option_image_7: "",
      option_image_8: "",
      option_image_9: "",
      option_image_10: "",
      image_link_1: q.questionImage || "",
      image_link_2: "",
      image_link_3: "",
      answer: (q.correctAnswer + 1).toString(),
      solution_heading: "Solution",
      solution_text: q.explanation || "",
      solution_image_1: q.explanationImage || "",
      solution_image_2: "",
      solution_video: "",
      difficulty_level: q.difficulty === 'easy' ? '1' : q.difficulty === 'medium' ? '2' : '3',
      topic: q.category,
      exam: exam.title,
      section_id: "1",
      subject: q.category,
      concept: "",
      report_count: "0",
      set_no: "0",
      positive_marks: q.marks.toString(),
      negative_marks: q.negativeMarks.toString(),
      sortingparam: "0.00",
      question_heading: "",
      directive: "",
      deleted: "0",
      image_check: q.questionImage ? "1" : "0"
    }));

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${exam.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        :root {
            --primary: #6c5ce7;
            --primary-light: #a29bfe;
            --primary-dark: #5649c0;
            --secondary: #00cec9;
            --accent: #fd79a8;
            --success: #00b894;
            --warning: #fdcb6e;
            --danger: #d63031;
            --light: #f8f9fa;
            --dark: #2d3436;
            --gray: #636e72;
            --light-gray: #dfe6e9;
            --card-bg: #ffffff;
            --body-bg: #f5f6fa;
            --header-bg: linear-gradient(135deg, var(--primary), var(--primary-dark));
            --footer-bg: #ffffff;
            --box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            --box-shadow-sm: 0 2px 10px rgba(0,0,0,0.05);
            --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            --review-color: #f39c12;
        }
        
        * {
            -webkit-tap-highlight-color: transparent;
        }
        
        body {
            background-color: var(--body-bg);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: var(--dark);
            line-height: 1.6;
            padding-bottom: 80px;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 16px;
        }
        
        /* Header Styles */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: var(--header-bg);
            color: white;
            display: flex;
            align-items: center;
            padding: 0 16px;
            z-index: 1000;
            box-shadow: var(--box-shadow-sm);
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }
        
        .header-brand {
            display: flex;
            align-items: center;
            font-weight: 600;
            font-size: 1.1rem;
            color: white;
            text-decoration: none;
        }
        
        .header-brand i {
            margin-right: 8px;
            font-size: 1.2rem;
        }
        
        .header-controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .control-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .control-btn:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .mobile-jump-to-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .mobile-jump-to-btn:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .timer-display {
            background: rgba(0,0,0,0.2);
            border-radius: 18px;
            padding: 4px 12px;
            font-size: 0.85rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            white-space: nowrap;
        }
        
        .timer-display i {
            margin-right: 6px;
        }
        
        /* Main Content */
        .main-content {
            margin-top: 60px;
            padding: 16px;
            min-height: calc(100vh - 140px);
        }
        
        /* Welcome Screen Styles */
        .welcome-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .welcome-logo {
            width: 100px;
            height: 100px;
            background: var(--header-bg);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            box-shadow: var(--box-shadow);
        }
        
        .welcome-logo i {
            font-size: 3rem;
            color: white;
        }
        
        .welcome-title {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-dark);
            margin-bottom: 16px;
        }
        
        .test-series-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 8px;
        }
        
        .test-meta {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .meta-item {
            background: white;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: var(--box-shadow-sm);
            min-width: 120px;
        }
        
        .meta-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary);
        }
        
        .meta-label {
            font-size: 0.9rem;
            color: var(--gray);
        }
        
        .instructions-container {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
            text-align: left;
            box-shadow: var(--box-shadow-sm);
            width: 100%;
        }
        
        .instructions-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .instructions-list {
            padding-left: 20px;
        }
        
        .instructions-list li {
            margin-bottom: 10px;
        }
        
        .action-buttons {
            display: flex;
            gap: 16px;
            margin-top: 24px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .action-btn {
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: var(--transition);
            cursor: pointer;
            text-decoration: none;
        }
        
        .action-btn-primary {
            background: var(--primary);
            color: white;
            border: none;
        }
        
        .action-btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--box-shadow);
            color: white;
        }
        
        .action-btn-outline {
            background: white;
            color: var(--primary);
            border: 1px solid var(--primary);
        }
        
        .action-btn-outline:hover {
            background: rgba(108, 92, 231, 0.1);
            transform: translateY(-2px);
            box-shadow: var(--box-shadow-sm);
        }
        
        /* Question Card Styles */
        .question-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: var(--box-shadow-sm);
            border: none;
            transition: var(--transition);
        }
        
        .question-counter {
            font-size: 0.9rem;
            color: var(--gray);
            text-align: center;
            margin-bottom: 16px;
            font-weight: 500;
        }
        
        .question-text {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 20px;
            color: var(--dark);
            overflow-wrap: break-word;
            word-wrap: break-word;
            hyphens: auto;
            max-width: 100%;
        }
        
        .question-text img,
        .option-label img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 8px 0;
            border-radius: 8px;
        }
        
        .option-item {
            margin-bottom: 12px;
            position: relative;
        }
        
        .option-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .option-label {
            display: block;
            padding: 14px 16px 14px 50px;
            background: var(--card-bg);
            border: 1px solid var(--light-gray);
            border-radius: 12px;
            cursor: pointer;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }
        
        .option-number {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--light-gray);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: var(--dark);
        }
        
        .option-label:hover {
            border-color: var(--primary-light);
            transform: translateY(-2px);
            box-shadow: var(--box-shadow-sm);
        }
        
        .option-input:checked + .option-label {
            border-color: var(--primary);
            background: rgba(108, 92, 231, 0.05);
            box-shadow: 0 0 0 1px var(--primary);
        }
        
        .option-input:checked + .option-label::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            background: var(--primary);
        }
        
        /* Feedback icons */
        .feedback-icon {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
        }
        
        .correct-icon {
            background: var(--success);
        }
        
        .incorrect-icon {
            background: var(--danger);
        }
        
        /* When reviewing answers */
        .review-mode .option-label.correct-answer {
            border-color: var(--success);
            background: rgba(0, 184, 148, 0.05);
            box-shadow: 0 0 0 1px var(--success);
        }
        
        .review-mode .option-label.correct-answer::after {
            background: var(--success);
        }
        
        .review-mode .option-input:checked + .option-label.incorrect {
            border-color: var(--danger);
            background: rgba(214, 48, 49, 0.05);
            box-shadow: 0 0 0 1px var(--danger);
        }
        
        /* Ensure correct answer is always highlighted properly */
        .review-mode .option-label.correct-answer {
            border-color: var(--success) !important;
            background: rgba(0, 184, 148, 0.05) !important;
            box-shadow: 0 0 0 1px var(--success) !important;
        }
        
        .MathJax, .mjx-chtml {
            overflow-x: auto;
            max-width: 100%;
            display: inline-block;
        }
        
        .solution-container {
            margin-top: 20px;
            padding: 16px;
            background: rgba(108, 92, 231, 0.05);
            border-radius: 12px;
            border-left: 3px solid var(--primary);
        }
        
        .solution-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--primary);
        }
        
        .correct-answer-indicator {
            color: var(--success);
            font-weight: 600;
            margin-top: 8px;
        }
        
        /* Bottom Navigation */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: var(--footer-bg);
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 800;
        }
        
        .nav-btn {
            height: 48px;
            border-radius: 12px;
            border: none;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 20px;
            transition: var(--transition);
            gap: 8px;
        }
        
        .nav-btn i {
            font-size: 1rem;
        }
        
        .nav-btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .nav-btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
        }
        
        .nav-btn-outline {
            background: transparent;
            color: var(--primary);
            border: 1px solid var(--primary);
        }
        
        .nav-btn-outline:hover {
            background: rgba(108, 92, 231, 0.1);
            transform: translateY(-2px);
        }
        
        .nav-btn-warning {
            background: var(--review-color);
            color: white;
        }
        
        .nav-btn-warning:hover {
            background: #e67e22;
            transform: translateY(-2px);
        }
        
        /* Question Navigation Modal */
        .questions-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1100;
            opacity: 0;
            pointer-events: none;
            transition: var(--transition);
            padding: 16px;
        }
        
        .questions-modal.show {
            opacity: 1;
            pointer-events: all;
        }
        
        .questions-card {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 800px;
            max-height: 80vh;
            overflow: hidden;
            transform: translateY(20px);
            transition: var(--transition);
        }
        
        .questions-modal.show .questions-card {
            transform: translateY(0);
        }
        
        .questions-header {
            background: var(--header-bg);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }
        
        .questions-title {
            margin: 0;
            font-weight: 600;
        }
        
        .close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .questions-body {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(80vh - 120px);
        }
        
        .questions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
            gap: 10px;
        }
        
        .q-box {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 500;
            border: 1px solid var(--light-gray);
            background: var(--card-bg);
            transition: var(--transition);
            position: relative;
        }
        
        .q-box:hover {
            transform: translateY(-2px);
            box-shadow: var(--box-shadow-sm);
        }
        
        .q-box.attempted {
            background-color: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        
        .q-box.correct {
            background-color: var(--success);
            color: white;
            border-color: var(--success);
        }
        
        .q-box.incorrect {
            background-color: var(--danger);
            color: white;
            border-color: var(--danger);
        }
        
        .q-box.current {
            border: 2px solid var(--accent) !important;
            transform: translateY(-3px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .q-box.marked {
            position: relative;
            overflow: hidden;
        }
        
        .q-box.marked::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 16px 16px 0;
            border-color: transparent var(--review-color) transparent transparent;
        }
        
        .q-box.marked::before {
            content: '★';
            position: absolute;
            top: -2px;
            right: 0;
            font-size: 8px;
            color: white;
            z-index: 1;
        }
        
        /* Results Modal */
        .results-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1100;
            opacity: 0;
            pointer-events: none;
            transition: var(--transition);
            padding: 16px;
        }
        
        .results-modal.show {
            opacity: 1;
            pointer-events: all;
        }
        
        .results-card {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(20px);
            transition: var(--transition);
        }
        
        .results-modal.show .results-card {
            transform: translateY(0);
        }
        
        .results-header {
            background: var(--header-bg);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }
        
        .results-title {
            margin: 0;
            font-weight: 600;
            font-size: 1.5rem;
        }
        
        .test-name {
            margin: 8px 0 0;
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .results-body {
            padding: 24px;
        }
        
        .stats-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .main-stats {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }
        
        .main-stat-card {
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            box-shadow: var(--box-shadow-sm);
            position: relative;
            overflow: hidden;
            background: white;
        }
        
        .main-stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
        }
        
        .main-stat-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 8px;
            color: var(--primary-dark);
        }
        
        .main-stat-label {
            font-size: 0.9rem;
            color: var(--gray);
        }
        
        .score-circle {
            width: 100px;
            height: 100px;
            margin: 0 auto 16px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .score-circle-bg {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 8px solid var(--light-gray);
        }
        
        .score-circle-fill {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 8px solid;
            border-color: var(--primary);
            clip: rect(0, 50px, 100px, 0);
            transform: rotate(0deg);
        }
        
        .score-circle-inner {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 1;
            box-shadow: var(--box-shadow-sm);
        }
        
        .score-percent {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            line-height: 1;
        }
        
        .score-label {
            font-size: 0.8rem;
            color: var(--gray);
        }
        
        .secondary-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        .stat-card {
            padding: 12px;
            border-radius: 10px;
            text-align: center;
            color: white;
            box-shadow: var(--box-shadow-sm);
        }
        
        .stat-value {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 0.7rem;
            opacity: 0.9;
        }
        
        .detailed-results {
            margin-top: 16px;
        }
        
        .detailed-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .detailed-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .detailed-card {
            padding: 10px;
            border-radius: 8px;
            background: white;
            box-shadow: var(--box-shadow-sm);
            text-align: center;
            transition: var(--transition);
        }
        
        .detailed-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--box-shadow);
        }
        
        .detailed-value {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .detailed-label {
            font-size: 0.7rem;
            color: var(--gray);
        }
        
        .results-footer {
            padding: 16px;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid var(--light-gray);
            flex-wrap: wrap;
            gap: 12px;
        }
        
        /* Responsive Adjustments */
        @media (min-width: 576px) {
            .main-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .secondary-stats {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .detailed-grid {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .main-stat-value {
                font-size: 2.2rem;
            }
            
            .main-stat-label {
                font-size: 1rem;
            }
            
            .stat-value {
                font-size: 1.5rem;
            }
            
            .stat-label {
                font-size: 0.8rem;
            }
            
            .detailed-value {
                font-size: 1.1rem;
            }
            
            .detailed-label {
                font-size: 0.8rem;
            }
            
            .results-footer {
                flex-wrap: nowrap;
            }
        }
        
        @media (min-width: 768px) {
            .main-stats {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .main-stat-card {
                padding: 24px;
            }
            
            .main-stat-value {
                font-size: 2.5rem;
            }
            
            .score-circle {
                width: 120px;
                height: 120px;
            }
            
            .score-circle-inner {
                width: 80px;
                height: 80px;
            }
            
            .score-percent {
                font-size: 1.8rem;
            }
        }
        
        @media (max-width: 768px) {
            .questions-grid {
                grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                gap: 8px;
            }
            
            .q-box {
                width: 40px;
                height: 40px;
                font-size: 0.9rem;
            }
            
            .option-label {
                padding: 12px 16px 12px 42px;
            }
            
            .option-number {
                width: 20px;
                height: 20px;
                font-size: 0.8rem;
            }
            
            .welcome-title {
                font-size: 1.8rem;
            }
            
            .test-series-name {
                font-size: 1.3rem;
            }
            
            .meta-item {
                min-width: 100px;
                padding: 10px 16px;
            }
            
            .meta-value {
                font-size: 1.1rem;
            }
            
            .action-buttons {
                flex-direction: column;
                width: 100%;
            }
            
            .action-btn {
                width: 100%;
                justify-content: center;
            }
            
            .results-card {
                max-height: 95vh;
            }
            
            .results-footer {
                flex-direction: column;
            }
            
            .results-footer .nav-btn {
                width: 100%;
            }
        }
        
        @media (max-width: 576px) {
            .header-controls {
                gap: 8px;
            }
            
            .option-label {
                padding: 12px 14px 12px 40px;
            }
            
            .question-text {
                font-size: 1rem;
            }
            
            .header-brand {
                font-size: 1rem;
            }
            
            .control-btn, .mobile-jump-to-btn {
                width: 32px;
                height: 32px;
            }
            
            .timer-display {
                font-size: 0.8rem;
                padding: 4px 10px;
            }
            
            .nav-btn {
                height: 44px;
                padding: 0 16px;
                font-size: 0.9rem;
            }
            
            .welcome-title {
                font-size: 1.5rem;
            }
            
            .test-series-name {
                font-size: 1.2rem;
            }
            
            .welcome-logo {
                width: 80px;
                height: 80px;
            }
            
            .welcome-logo i {
                font-size: 2.5rem;
            }
            
            .test-meta {
                gap: 12px;
            }
            
            .meta-item {
                min-width: 80px;
                padding: 8px 12px;
            }
            
            .meta-value {
                font-size: 1rem;
            }
            
            .instructions-container {
                padding: 16px;
            }
            
            .results-body {
                padding: 16px;
            }
            
            .main-stat-card {
                padding: 12px;
            }
            
            .main-stat-value {
                font-size: 1.8rem;
            }
            
            .secondary-stats {
                grid-template-columns: 1fr;
            }
            
            .detailed-grid {
                grid-template-columns: 1fr;
            }
            
            .score-circle {
                width: 80px;
                height: 80px;
            }
            
            .score-circle-inner {
                width: 60px;
                height: 60px;
            }
            
            .score-percent {
                font-size: 1.2rem;
            }
            
            .stat-value {
                font-size: 1rem;
            }
            
            .detailed-value {
                font-size: 0.9rem;
            }
        }
        
        /* Confirmation Modal */
        .confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            opacity: 0;
            pointer-events: none;
            transition: var(--transition);
        }
        
        .confirmation-modal.show {
            opacity: 1;
            pointer-events: all;
        }
        
        .confirmation-card {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            padding: 24px;
            text-align: center;
            transform: translateY(20px);
            transition: var(--transition);
        }
        
        .confirmation-modal.show .confirmation-card {
            transform: translateY(0);
        }
        
        .confirmation-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 16px;
        }
        
        .confirmation-message {
            color: var(--gray);
            margin-bottom: 24px;
        }
        
        .confirmation-buttons {
            display: flex;
            justify-content: center;
            gap: 16px;
        }
        
        .confirmation-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .btn-cancel {
            background: var(--light-gray);
            color: var(--dark);
            border: none;
        }
        
        .btn-cancel:hover {
            background: #d1d1d1;
        }
        
        .btn-confirm {
            background: var(--danger);
            color: white;
            border: none;
        }
        
        .btn-confirm:hover {
            background: #c02c2c;
        }
        
        /* Submit Confirmation Modal */
        .submit-confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            opacity: 0;
            pointer-events: none;
            transition: var(--transition);
        }
        
        .submit-confirmation-modal.show {
            opacity: 1;
            pointer-events: all;
        }
        
        .submit-confirmation-card {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            padding: 24px;
            text-align: center;
            transform: translateY(20px);
            transition: var(--transition);
        }
        
        .submit-confirmation-modal.show .submit-confirmation-card {
            transform: translateY(0);
        }
        
        .submit-confirmation-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark);
            margin-bottom: 16px;
        }
        
        .submit-confirmation-message {
            color: var(--gray);
            margin-bottom: 24px;
        }
        
        .submit-confirmation-buttons {
            display: flex;
            justify-content: center;
            gap: 12px;
        }
        
        .submit-confirmation-btn {
            padding: 8px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .submit-btn-cancel {
            background: var(--light-gray);
            color: var(--dark);
            border: none;
        }
        
        .submit-btn-cancel:hover {
            background: #d1d1d1;
        }
        
        .submit-btn-confirm {
            background: var(--primary);
            color: white;
            border: none;
        }
        
        .submit-btn-confirm:hover {
            background: var(--primary-dark);
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <a href="#" class="header-brand">
                <i class="fas fa-graduation-cap"></i>
                <span id="header-app-name">ExamCraft</span>
            </a>
            
            <div class="header-controls" id="header-controls" style="display: none;">
                <!-- Timer -->
                <div class="timer-display">
                    <i class="far fa-clock"></i>
                    <span id="timer-display">${exam.duration}:00</span>
                </div>
                
                <!-- Jump to question button - single button for all devices -->
                <button class="mobile-jump-to-btn" onclick="showQuestionsModal()">
                    <i class="fas fa-list-ol"></i>
                </button>
                
                <!-- Submit button -->
                <button class="control-btn" id="submit-btn" onclick="confirmSubmit()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </header>
    
    <!-- Main content -->
    <main class="main-content" id="main-content">
        <!-- Welcome Screen -->
        <div class="welcome-screen" id="welcome-screen">
            <div class="welcome-logo">
                <i class="fas fa-graduation-cap"></i>
            </div>
            
            <h1 class="welcome-title">ExamCraft</h1>
            <h2 class="test-series-name">${exam.title}</h2>
            
            <div class="test-meta">
                <div class="meta-item">
                    <div class="meta-value">${exam.questions.length}</div>
                    <div class="meta-label">Questions</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${exam.totalMarks}</div>
                    <div class="meta-label">Total Marks</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${exam.duration} min</div>
                    <div class="meta-label">Duration</div>
                </div>
            </div>
            
            <div class="instructions-container">
                <h3 class="instructions-title">
                    <i class="fas fa-info-circle"></i>
                    Instructions
                </h3>
                <ol class="instructions-list">
                    <li>This test contains ${exam.questions.length} multiple choice questions.</li>
                    <li>Each question has only one correct answer.</li>
                    <li>You will have ${exam.duration} minutes to complete the test.</li>
                    <li>Click on the option to select your answer.</li>
                    <li>You can mark questions for review using the "Mark for Review" button.</li>
                    <li>You can navigate between questions using the Previous/Next buttons.</li>
                    <li>Click "Submit" when you're finished to see your results.</li>
                </ol>
            </div>
            
            <div class="action-buttons">
                <button class="action-btn action-btn-primary" onclick="startTest()">
                    <i class="fas fa-play"></i>
                    Start Test
                </button>
            </div>
        </div>
        
        <!-- Test Content (hidden initially) -->
        <div id="test-content" style="display: none;">
            <div class="question-counter" id="question-counter">Question 1 of ${exam.questions.length}</div>
            
            <!-- Questions will be displayed here -->
            <div id="questions-container"></div>
        </div>
    </main>
    
    <!-- Bottom navigation (hidden initially) -->
    <nav class="bottom-nav" id="bottom-nav" style="display: none;">
        <button class="nav-btn nav-btn-outline" onclick="prevQuestion()">
            <i class="fas fa-chevron-left"></i>
            <span class="nav-btn-text">Previous</span>
        </button>
        <button class="nav-btn nav-btn-warning" id="review-btn" onclick="toggleReview()">
            <i class="far fa-star"></i>
            <span class="nav-btn-text">Mark for Review</span>
        </button>
        <button class="nav-btn nav-btn-outline" id="next-btn" onclick="nextQuestion()">
            <span class="nav-btn-text">Next</span>
            <i class="fas fa-chevron-right"></i>
        </button>
    </nav>
    
    <!-- Questions Navigation Modal -->
    <div class="questions-modal" id="questions-modal">
        <div class="questions-card">
            <div class="questions-header">
                <h3 class="questions-title">Questions Navigation</h3>
                <button class="close-btn" onclick="hideQuestionsModal()">×</button>
            </div>
            <div class="questions-body">
                <div class="questions-grid" id="questions-grid"></div>
            </div>
        </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div class="confirmation-modal" id="confirmation-modal">
        <div class="confirmation-card">
            <h3 class="confirmation-title">Leave Test?</h3>
            <p class="confirmation-message">Your progress will be lost if you leave this page. Are you sure you want to exit?</p>
            <div class="confirmation-buttons">
                <button class="confirmation-btn btn-cancel" onclick="hideConfirmationModal()">No, Continue</button>
                <button class="confirmation-btn btn-confirm" onclick="confirmExit()">Yes, Exit</button>
            </div>
        </div>
    </div>
    
    <!-- Submit Confirmation Modal -->
    <div class="submit-confirmation-modal" id="submit-confirmation-modal">
        <div class="submit-confirmation-card">
            <h3 class="submit-confirmation-title">Confirm Submission</h3>
            <p class="submit-confirmation-message" id="submit-confirmation-message">
                You have attempted 0 of ${exam.questions.length} questions.<br>
                ${exam.questions.length} questions are unattempted.
            </p>
            <div class="submit-confirmation-buttons">
                <button class="submit-confirmation-btn submit-btn-cancel" onclick="hideSubmitConfirmationModal()">Cancel</button>
                <button class="submit-confirmation-btn submit-btn-confirm" onclick="submitTest()">Submit Test</button>
            </div>
        </div>
    </div>
    
    <!-- Results Modal -->
    <div class="results-modal" id="results-modal">
        <div class="results-card">
            <div class="results-header">
                <h3 class="results-title">Test Results</h3>
                <p class="test-name">${exam.title}</p>
            </div>
            <div class="results-body">
                <div class="stats-container">
                    <div class="main-stats">
                        <div class="main-stat-card">
                            <div class="score-circle">
                                <div class="score-circle-bg"></div>
                                <div class="score-circle-fill" id="score-circle-fill"></div>
                                <div class="score-circle-inner">
                                    <div class="score-percent" id="score-percent">0%</div>
                                    <div class="score-label">Score</div>
                                </div>
                            </div>
                            <div class="main-stat-value" id="score-value">0</div>
                            <div class="main-stat-label">Out of ${exam.totalMarks} Marks</div>
                        </div>
                        <div class="main-stat-card">
                            <div class="main-stat-value" id="correct-value">0</div>
                            <div class="main-stat-label">Correct Answers</div>
                        </div>
                        <div class="main-stat-card">
                            <div class="main-stat-value" id="incorrect-value">0</div>
                            <div class="main-stat-label">Incorrect Answers</div>
                        </div>
                    </div>
                    
                    <div class="secondary-stats">
                        <div class="stat-card" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark))">
                            <div class="stat-value" id="attempted-value">0</div>
                            <div class="stat-label">Attempted</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, var(--success), #1b9aaa)">
                            <div class="stat-value" id="accuracy-value">0%</div>
                            <div class="stat-label">Accuracy</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, var(--danger), var(--accent))">
                            <div class="stat-value" id="unattempted-value">0</div>
                            <div class="stat-label">Unattempted</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, var(--review-color), #e67e22)">
                            <div class="stat-value" id="reviewed-value">0</div>
                            <div class="stat-label">Marked for Review</div>
                        </div>
                    </div>
                    
                    <div class="detailed-results">
                        <h4 class="detailed-title">
                            <i class="fas fa-chart-pie"></i>
                            Detailed Breakdown
                        </h4>
                        <div class="detailed-grid">
                            <div class="detailed-card">
                                <div class="detailed-value" id="time-taken">0 min</div>
                                <div class="detailed-label">Time Taken</div>
                            </div>
                            <div class="detailed-card">
                                <div class="detailed-value" id="time-per-question">0 sec</div>
                                <div class="detailed-label">Avg Time per Q</div>
                            </div>
                            <div class="detailed-card">
                                <div class="detailed-value" id="marks-obtained">0</div>
                                <div class="detailed-label">Marks Obtained</div>
                            </div>
                            <div class="detailed-card">
                                <div class="detailed-value" id="marks-per-question">0</div>
                                <div class="detailed-label">Avg Marks per Q</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="results-footer">
                <button class="nav-btn nav-btn-outline" onclick="window.location.reload()">
                    <i class="fas fa-redo"></i>
                    <span>Take Again</span>
                </button>
                <button class="nav-btn nav-btn-primary" onclick="reviewTest()">
                    <i class="fas fa-search"></i>
                    <span>Review Test</span>
                </button>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Questions data
        const questions = ${JSON.stringify(questionsData)};
        let currentQuestion = 0;
        let answers = {};
        let markedForReview = {};
        let submitted = false;
        let totalTime = ${exam.duration} * 60;
        let testStarted = false;
        let startTime = null;
        let endTime = null;
        
        // Initialize the test
        window.onload = function() {
            // Show welcome screen by default
            showWelcomeScreen();
            
            // Preload test content but don't show it
            generateQuestionsGrid();
            
            // Hide text on small screens for bottom nav buttons
            handleBottomNavResponsive();
            window.addEventListener('resize', handleBottomNavResponsive);
        };
        
        // Handle responsive bottom navigation
        function handleBottomNavResponsive() {
            const navTexts = document.querySelectorAll('.nav-btn-text');
            if (window.innerWidth < 500) {
                navTexts.forEach(el => el.style.display = 'none');
            } else {
                navTexts.forEach(el => el.style.display = 'inline');
            }
        }
        
        // Function to handle beforeunload event
        function beforeUnloadHandler(e) {
            if (testStarted && !submitted) {
                e.preventDefault();
                e.returnValue = 'You have an ongoing test. Are you sure you want to leave?';
                showConfirmationModal();
                return 'You have an ongoing test. Are you sure you want to leave?';
            }
        }
        
        // Prevent page refresh or close during test
        window.addEventListener('beforeunload', beforeUnloadHandler);
        
        // Show welcome screen
        function showWelcomeScreen() {
            document.getElementById('welcome-screen').style.display = 'flex';
            document.getElementById('test-content').style.display = 'none';
            document.getElementById('bottom-nav').style.display = 'none';
            document.getElementById('header-controls').style.display = 'none';
            document.getElementById('header-app-name').textContent = 'ExamCraft';
        }
        
        // Show confirmation modal
        function showConfirmationModal() {
            document.getElementById('confirmation-modal').classList.add('show');
        }
        
        // Hide confirmation modal
        function hideConfirmationModal() {
            document.getElementById('confirmation-modal').classList.remove('show');
        }
        
        // Confirm exit
        function confirmExit() {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            window.location.href = window.location.href;
        }
        
        // Show submit confirmation modal
        function showSubmitConfirmationModal() {
            const attempted = Object.keys(answers).length;
            const remaining = questions.length - attempted;
            const marked = Object.keys(markedForReview).length;
            
            document.getElementById('submit-confirmation-message').innerHTML = \`
                You have attempted \${attempted} of \${questions.length} questions.<br>
                \${remaining} questions are unattempted.<br>
                \${marked} questions marked for review.
            \`;
            
            document.getElementById('submit-confirmation-modal').classList.add('show');
        }
        
        // Hide submit confirmation modal
        function hideSubmitConfirmationModal() {
            document.getElementById('submit-confirmation-modal').classList.remove('show');
        }
        
        // Start the test
        function startTest() {
            testStarted = true;
            startTime = new Date();
            // Push state to enable back button handling
            history.pushState(null, document.title, window.location.href);
            
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('test-content').style.display = 'block';
            document.getElementById('bottom-nav').style.display = 'flex';
            document.getElementById('header-controls').style.display = 'flex';
            document.getElementById('header-app-name').textContent = '${exam.title}';
            
            initializeTest();
            startTimer();
            updateNextButton();
            updateReviewButton();
        }
        
        // Initialize test data
        function initializeTest() {
            // Show first question
            showQuestion(0);
            updateProgress();
        }

        // Generate questions grid for navigation
        function generateQuestionsGrid() {
            const grid = document.getElementById('questions-grid');
            grid.innerHTML = '';
            
            questions.forEach((q, index) => {
                const box = document.createElement('div');
                box.className = 'q-box';
                box.textContent = index + 1;
                box.onclick = () => {
                    showQuestion(index);
                    hideQuestionsModal();
                };
                box.id = \`nav-box-\${index}\`;
                grid.appendChild(box);
            });
        }
        
        // Show questions navigation modal
        function showQuestionsModal() {
            document.getElementById('questions-modal').classList.add('show');
            updateQuestionsGrid();
        }
        
        // Hide questions navigation modal
        function hideQuestionsModal() {
            document.getElementById('questions-modal').classList.remove('show');
        }
        
        // Update questions grid with current status
        function updateQuestionsGrid() {
            questions.forEach((q, index) => {
                const box = document.getElementById(\`nav-box-\${index}\`);
                if (!box) return;
                
                box.classList.remove('current', 'attempted', 'correct', 'incorrect', 'marked');
                
                if (index === currentQuestion) {
                    box.classList.add('current');
                }
                
                if (submitted) {
                    const userAns = answers[q.id];
                    if (userAns === q.answer) {
                        box.classList.add('correct');
                    } else if (userAns) {
                        box.classList.add('incorrect');
                    }
                } else if (answers[q.id]) {
                    box.classList.add('attempted');
                }
                
                if (markedForReview[q.id]) {
                    box.classList.add('marked');
                }
            });
        }
        
        // Show a specific question
        function showQuestion(index) {
            if (index < 0 || index >= questions.length) return;
            
            currentQuestion = index;
            const question = questions[index];
            
            // Update question counter
            document.getElementById('question-counter').textContent = \`Question \${index + 1} of \${questions.length}\`;
            
            // Generate question HTML
            let html = \`
                <div class="question-card">
                    <div class="question-text">
                        \${formatContent(question.question)}
                        \${question.image_link_1 ? \`<img src="\${question.image_link_1}" alt="Question Image" style="max-width:100%;height:auto;margin:8px 0;border-radius:8px;">\` : ''}
                    </div>
                    <div class="options" id="options-container">\`;
            
            // Add options
            ['option_1', 'option_2', 'option_3', 'option_4'].forEach((optKey, i) => {
                const opt = question[optKey];
                if (!opt) return;
                
                const optionNumber = (i + 1).toString();
                const isCorrectAnswer = optionNumber === question.answer;
                const isUserAnswer = answers[question.id] === optionNumber;
                let optionClass = '';
                let feedbackIcon = '';
                
                // When reviewing, add appropriate classes and feedback icons
                if (submitted) {
                    if (isCorrectAnswer) {
                        optionClass += ' correct-answer';
                        feedbackIcon = \`<span class="feedback-icon correct-icon">✓</span>\`;
                    } 
                    
                    if (isUserAnswer) {
                        if (isCorrectAnswer) {
                            optionClass += ' correct-answer';
                            feedbackIcon = \`<span class="feedback-icon correct-icon">✓</span>\`;
                        } else {
                            optionClass += ' incorrect';
                            feedbackIcon = \`<span class="feedback-icon incorrect-icon">✗</span>\`;
                        }
                    }
                }
                
                const optionImageKey = \`option_image_\${i + 1}\`;
                const optionImage = question[optionImageKey];
                
                html += \`
                    <div class="option-item">
                        <input class="option-input" type="radio" name="q\${index}" 
                            id="opt-\${index}-\${optionNumber}" value="\${optionNumber}"
                            data-option="\${optionNumber}" data-correct="\${isCorrectAnswer}"
                            \${isUserAnswer ? 'checked' : ''}
                            \${submitted ? 'disabled' : ''}
                            onclick="toggleAnswer('\${question.id}', '\${optionNumber}', this)">
                       <label class="option-label\${optionClass}" for="opt-\${index}-\${optionNumber}">
                            <span class="option-number">\${optionNumber}</span>
                            \${formatContent(opt)}
                            \${optionImage ? \`<img src="\${optionImage}" alt="Option Image" style="max-width:100%;height:auto;margin:8px 0;border-radius:8px;">\` : ''}
                            \${feedbackIcon}
                        </label>
                    </div>\`;
            });
            
            // Add solution if submitted
            if (submitted && question.solution_text) {
                const isCorrect = answers[question.id] === question.answer;
                const resultText = answers[question.id] ? 
                    (isCorrect ? '<span style="color: var(--success)">✓ Correct!</span>' : 
                                '<span style="color: var(--danger)">✗ Incorrect!</span>') : 
                    '<span style="color: var(--gray)">Not attempted</span>';
                const correctAnswer = \`Correct Answer: <strong>\${question.answer}</strong>\`;
                
                html += \`
                    <div class="solution-container">
                        <div class="solution-title">\${resultText}</div>
                        <div class="correct-answer-indicator">\${correctAnswer}</div>
                        <div class="solution-text">
                            \${formatContent(question.solution_text)}
                            \${question.solution_image_1 ? \`<img src="\${question.solution_image_1}" alt="Solution Image" style="max-width:100%;height:auto;margin:8px 0;border-radius:8px;">\` : ''}
                        </div>
                    </div>\`;
            }
            
            html += \`</div></div>\`;
            
            document.getElementById('questions-container').innerHTML = html;
            
            // Add review mode class if submitted
            if (submitted) {
                document.getElementById('options-container').classList.add('review-mode');
            }
            
            // Update questions grid
            updateQuestionsGrid();
            updateNextButton();
            updateReviewButton();
        }
        
        // Update the next button to show submit on last question
        function updateNextButton() {
            if (!testStarted) return;
            
            const nextBtn = document.getElementById('next-btn');
            if (currentQuestion === questions.length - 1) {
                if (!submitted) {
                    nextBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                    nextBtn.onclick = confirmSubmit;
                    nextBtn.classList.remove('nav-btn-outline');
                    nextBtn.classList.add('nav-btn-primary');
                    if (window.innerWidth >= 500) {
                        nextBtn.innerHTML = '<span>Submit</span><i class="fas fa-paper-plane"></i>';
                    }
                } else {
                    nextBtn.style.display = 'none';
                }
            } else {
                nextBtn.style.display = 'flex';
                nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                nextBtn.onclick = nextQuestion;
                nextBtn.classList.remove('nav-btn-primary');
                nextBtn.classList.add('nav-btn-outline');
                if (window.innerWidth >= 500) {
                    nextBtn.innerHTML = '<span>Next</span><i class="fas fa-chevron-right"></i>';
                }
            }
        }
        
        // Update the review button state
        function updateReviewButton() {
            if (!testStarted || submitted) return;
            
            const reviewBtn = document.getElementById('review-btn');
            const isMarked = markedForReview[questions[currentQuestion].id];
            
            if (isMarked) {
                reviewBtn.innerHTML = '<i class="fas fa-star"></i>';
                reviewBtn.classList.add('active');
                if (window.innerWidth >= 500) {
                    reviewBtn.innerHTML = '<i class="fas fa-star"></i><span>Marked for Review</span>';
                }
            } else {
                reviewBtn.innerHTML = '<i class="far fa-star"></i>';
                reviewBtn.classList.remove('active');
                if (window.innerWidth >= 500) {
                    reviewBtn.innerHTML = '<i class="far fa-star"></i><span>Mark for Review</span>';
                }
            }
        }
        
        function formatContent(text) {
            if (!text) return '';
            // Ensure images don't overflow and preserve other formatting
            return text.replace(/<img/g, '<img style="max-width:100%;height:auto;"');
        }
        
        // Toggle answer selection (allows unselecting by clicking again)
        function toggleAnswer(qId, option, inputElement) {
            if (submitted) return;
            
            // If clicking the already selected option, unselect it
            if (answers[qId] === option) {
                delete answers[qId];
                inputElement.checked = false;
            } else {
                answers[qId] = option;
            }
            
            updateProgress();
            updateQuestionsGrid();
            updateNextButton();
        }
        
        // Toggle review status for current question
        function toggleReview() {
            if (submitted) return;
            
            const qId = questions[currentQuestion].id;
            if (markedForReview[qId]) {
                delete markedForReview[qId];
            } else {
                markedForReview[qId] = true;
            }
            
            updateQuestionsGrid();
            updateReviewButton();
        }
        
        // Navigate to previous/next question
        function prevQuestion() { 
            if (currentQuestion > 0) showQuestion(currentQuestion - 1); 
        }
        
        function nextQuestion() { 
            if (currentQuestion < questions.length - 1) showQuestion(currentQuestion + 1); 
        }
        
        // Update progress
        function updateProgress() {
            const attempted = Object.keys(answers).length;
            // Update any progress indicators if needed
        }
        
        // Start timer
        function startTimer() {
            const timerDisplay = document.getElementById('timer-display');
            let timeLeft = totalTime;
            
            const timerInterval = setInterval(() => {
                if (timeLeft <= 0 || submitted) {
                    clearInterval(timerInterval);
                    if (!submitted) submitTest();
                    return;
                }
                
                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;
                
                if (hours > 0) {
                    timerDisplay.textContent = \`\${hours}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
                } else {
                    timerDisplay.textContent = \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
                }
                
                timeLeft--;
            }, 1000);
        }
        
        // Confirm before submitting
        function confirmSubmit() {
            if (submitted) return;
            showSubmitConfirmationModal();
        }
        
        // Submit test
        function submitTest() {
            if (submitted) return;
            
            submitted = true;
            endTime = new Date();
            hideSubmitConfirmationModal();
            
            let score = 0;
            let correctCount = 0;
            let incorrectCount = 0;
            let unattemptedCount = 0;
            let totalMarks = ${exam.totalMarks};
            
            questions.forEach((q, index) => {
                const userAns = answers[q.id];
                const positive = parseFloat(q.positive_marks) || 0;
                const negative = parseFloat(q.negative_marks) || 0;
                
                if (!userAns) {
                    unattemptedCount++;
                } else if (userAns === q.answer) {
                    correctCount++;
                    score += positive;
                } else {
                    incorrectCount++;
                    score -= Math.abs(negative);
                }
            });
            
            // Round score to 2 decimal places
            score = Math.round(score * 100) / 100;
            
            // Calculate accuracy
            const accuracy = correctCount / (correctCount + incorrectCount) * 100;
            const accuracyText = isNaN(accuracy) ? '0%' : Math.round(accuracy) + '%';
            
            // Calculate time taken
            const timeTakenMs = endTime - startTime;
            const timeTakenMinutes = Math.floor(timeTakenMs / 60000);
            const timeTakenSeconds = Math.floor((timeTakenMs % 60000) / 1000);
            const avgTimePerQuestion = Math.floor(timeTakenMs / questions.length / 1000);
            
            // Calculate score percentage for the circle
            const scorePercent = Math.round((score / totalMarks) * 100);
            const circleRotation = (scorePercent / 100) * 360;
            
            // Update the score circle
            const circleFill = document.getElementById('score-circle-fill');
            circleFill.style.transform = \`rotate(\${Math.min(circleRotation, 180)}deg)\`;
            
            if (circleRotation > 180) {
                circleFill.style.borderColor = 'var(--primary) var(--primary) transparent transparent';
                
                // Remove any existing second half circle
                const existingSecondHalf = document.getElementById('score-circle-fill-second');
                if (existingSecondHalf) existingSecondHalf.remove();
                
                // Add a second half circle
                const secondHalf = document.createElement('div');
                secondHalf.className = 'score-circle-fill';
                secondHalf.style.borderColor = 'transparent transparent var(--primary) var(--primary)';
                secondHalf.style.transform = \`rotate(\${circleRotation - 180}deg)\`;
                secondHalf.id = 'score-circle-fill-second';
                document.querySelector('.score-circle').appendChild(secondHalf);
            } else {
                circleFill.style.borderColor = 'var(--primary)';
                const existingSecondHalf = document.getElementById('score-circle-fill-second');
                if (existingSecondHalf) existingSecondHalf.remove();
            }
            
            // Update result values
            document.getElementById('score-value').textContent = score;
            document.getElementById('score-percent').textContent = scorePercent + '%';
            document.getElementById('correct-value').textContent = correctCount;
            document.getElementById('incorrect-value').textContent = incorrectCount;
            document.getElementById('unattempted-value').textContent = unattemptedCount;
            document.getElementById('attempted-value').textContent = correctCount + incorrectCount;
            document.getElementById('accuracy-value').textContent = accuracyText;
            document.getElementById('reviewed-value').textContent = Object.keys(markedForReview).length;
            
            // Update detailed stats
            document.getElementById('time-taken').textContent = \`\${timeTakenMinutes} min \${timeTakenSeconds} sec\`;
            document.getElementById('time-per-question').textContent = \`\${avgTimePerQuestion} sec\`;
            document.getElementById('marks-obtained').textContent = score;
            document.getElementById('marks-per-question').textContent = (score / (correctCount + incorrectCount)).toFixed(2);
            
            // Show the results modal
            document.getElementById('results-modal').classList.add('show');
            
            // Disable submit button
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-check"></i>';
            submitBtn.style.backgroundColor = 'var(--success)';
            
            // Update next button
            updateNextButton();
            
            // Refresh current question view to show solution
            showQuestion(currentQuestion);
        }
        
        // Review test after submission
        function reviewTest() {
            document.getElementById('results-modal').classList.remove('show');
            currentQuestion = 0; // Start from first question
            showQuestion(currentQuestion);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') prevQuestion();
            if (e.key === 'ArrowRight') nextQuestion();
            if (e.key === 'Escape') hideQuestionsModal();
        });
        
        // Handle clicks on links during test
        document.addEventListener('click', function(e) {
            if (testStarted && !submitted) {
                const target = e.target.closest('a');
                if (target && target.getAttribute('href') && !target.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    showConfirmationModal();
                }
            }
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === document.getElementById('results-modal')) {
                document.getElementById('results-modal').classList.remove('show');
            }
            if (event.target === document.getElementById('questions-modal')) {
                hideQuestionsModal();
            }
            if (event.target === document.getElementById('confirmation-modal')) {
                hideConfirmationModal();
            }
            if (event.target === document.getElementById('submit-confirmation-modal')) {
                hideSubmitConfirmationModal();
            }
        });
        
        // Handle browser back button
        window.addEventListener('popstate', function(e) {
            if (testStarted && !submitted) {
                e.preventDefault();
                showConfirmationModal();
                // Push a new state to prevent immediate navigation
                history.pushState(null, document.title, window.location.href);
            }
        });
    </script>
</body>
</html>`;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_test.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('HTML test file generated and downloaded!');
  };

  const deleteExam = (examId: string) => {
    setExams(exams.filter(exam => exam.id !== examId));
    if (currentExam?.id === examId) {
      setCurrentExam(null);
    }
    toast.success('Exam deleted successfully!');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const bulkImportExample = `Q: What is the capital of France?
QI: https://example.com/france-map.jpg
A: London
B: Berlin
C: Paris
D: Madrid
AI: https://example.com/london.jpg
BI: https://example.com/berlin.jpg
CI: https://example.com/paris.jpg
DI: https://example.com/madrid.jpg
ANSWER: C
EXPLANATION: Paris is the capital and largest city of France.
EI: https://example.com/paris-explanation.jpg
DIFFICULTY: easy
CATEGORY: Geography
MARKS: 1
NEGATIVE: 0.25

Q: What is 2 + 2?
A: 3
B: 4
C: 5
D: 6
ANSWER: B
EXPLANATION: Basic addition: 2 + 2 = 4
DIFFICULTY: easy
CATEGORY: Mathematics
MARKS: 1
NEGATIVE: 0.25`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">ExamCraft</h1>
              <p className="text-gray-600">Create, manage, and deploy professional online examinations</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <BookOpen className="w-4 h-4 mr-1" />
                {exams.length} Exams
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Target className="w-4 h-4 mr-1" />
                {exams.reduce((sum, exam) => sum + exam.questions.length, 0)} Questions
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Exams
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Manage Exams</h2>
                <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create New Exam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Exam</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Exam Title</Label>
                        <Input
                          id="title"
                          value={examForm.title}
                          onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                          placeholder="Enter exam title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={examForm.description}
                          onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                          placeholder="Enter exam description"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={examForm.duration}
                          onChange={(e) => setExamForm({...examForm, duration: parseInt(e.target.value) || 60})}
                          min="1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateExamOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createExam}>Create Exam</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {exams.length === 0 ? (
                  <Card className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No exams created yet</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first exam</p>
                    <Button onClick={() => setIsCreateExamOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Exam
                    </Button>
                  </Card>
                ) : (
                  exams.map((exam) => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                            <p className="text-gray-600 mb-4">{exam.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {exam.questions.length} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {exam.duration} minutes
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                {exam.totalMarks} marks
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(exam.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentExam(exam)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateHTMLTest(exam)}
                              disabled={exam.questions.length === 0}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Generate HTML
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{exam.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteExam(exam.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            {!currentExam ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an exam to manage questions</h3>
                <p className="text-gray-500 mb-4">Choose an exam from the Exams tab to start adding questions</p>
                <Button onClick={() => setActiveTab('exams')}>
                  Go to Exams
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold">Questions for "{currentExam.title}"</h2>
                    <p className="text-gray-600">
                      {currentExam.questions.length} questions • {currentExam.totalMarks} total marks
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Bulk Import
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Bulk Import Questions</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Import Format Example:</Label>
                            <ScrollArea className="h-40 w-full border rounded p-3 bg-gray-50">
                              <pre className="text-xs">{bulkImportExample}</pre>
                            </ScrollArea>
                          </div>
                          <div>
                            <Label htmlFor="bulk-import">Paste your questions here:</Label>
                            <Textarea
                              id="bulk-import"
                              value={bulkImportText}
                              onChange={(e) => setBulkImportText(e.target.value)}
                              placeholder="Paste questions in the format shown above..."
                              rows={10}
                              className="font-mono text-sm"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={processBulkImport}>
                              Import Questions
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>
                            {editingQuestion ? 'Edit Question' : 'Add New Question'}
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] pr-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="question">Question Text</Label>
                              <Textarea
                                id="question"
                                value={questionForm.question}
                                onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                                placeholder="Enter your question here..."
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="question-image">Question Image URL (Optional)</Label>
                              <Input
                                id="question-image"
                                value={questionForm.questionImage}
                                onChange={(e) => setQuestionForm({...questionForm, questionImage: e.target.value})}
                                placeholder="https://example.com/question-image.jpg"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label>Options</Label>
                              {questionForm.options.map((option, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...questionForm.options];
                                        newOptions[index] = e.target.value;
                                        setQuestionForm({...questionForm, options: newOptions});
                                      }}
                                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                      className="flex-1"
                                    />
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name="correct-answer"
                                        checked={questionForm.correctAnswer === index}
                                        onChange={() => setQuestionForm({...questionForm, correctAnswer: index})}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm text-gray-500">Correct</span>
                                    </div>
                                  </div>
                                  <div className="ml-10">
                                    <Input
                                      value={questionForm.optionImages[index]}
                                      onChange={(e) => {
                                        const newImages = [...questionForm.optionImages];
                                        newImages[index] = e.target.value;
                                        setQuestionForm({...questionForm, optionImages: newImages});
                                      }}
                                      placeholder={`Option ${String.fromCharCode(65 + index)} image URL (optional)`}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div>
                              <Label htmlFor="explanation">Explanation (Optional)</Label>
                              <Textarea
                                id="explanation"
                                value={questionForm.explanation}
                                onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                                placeholder="Provide an explanation for the correct answer..."
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="explanation-image">Explanation Image URL (Optional)</Label>
                              <Input
                                id="explanation-image"
                                value={questionForm.explanationImage}
                                onChange={(e) => setQuestionForm({...questionForm, explanationImage: e.target.value})}
                                placeholder="https://example.com/explanation-image.jpg"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select
                                  value={questionForm.difficulty}
                                  onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                                    setQuestionForm({...questionForm, difficulty: value})
                                  }
                                >
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
                                <Label htmlFor="category">Category</Label>
                                <Input
                                  id="category"
                                  value={questionForm.category}
                                  onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                                  placeholder="e.g., Mathematics, Science"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="marks">Marks</Label>
                                <Input
                                  id="marks"
                                  type="number"
                                  value={questionForm.marks}
                                  onChange={(e) => setQuestionForm({...questionForm, marks: parseFloat(e.target.value) || 1})}
                                  min="0"
                                  step="0.5"
                                />
                              </div>
                              <div>
                                <Label htmlFor="negative-marks">Negative Marks</Label>
                                <Input
                                  id="negative-marks"
                                  type="number"
                                  value={questionForm.negativeMarks}
                                  onChange={(e) => setQuestionForm({...questionForm, negativeMarks: parseFloat(e.target.value) || 0})}
                                  min="0"
                                  step="0.25"
                                />
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsQuestionDialogOpen(false);
                              setEditingQuestion(null);
                              resetQuestionForm();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={editingQuestion ? updateQuestion : addQuestion}>
                            {editingQuestion ? 'Update Question' : 'Add Question'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {currentExam.questions.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
                    <p className="text-gray-500 mb-4">Start building your exam by adding questions</p>
                    <Button onClick={() => setIsQuestionDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Question
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {currentExam.questions.map((question, index) => (
                      <Card key={question.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty}
                                </Badge>
                                <Badge variant="outline">{question.category}</Badge>
                                <Badge variant="outline">{question.marks} marks</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editQuestion(question)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this question? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteQuestion(question.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-gray-900 font-medium">{question.question}</p>
                              {question.questionImage && (
                                <div className="mt-2">
                                  <img 
                                    src={question.questionImage} 
                                    alt="Question" 
                                    className="max-w-xs rounded border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex}
                                  className={`p-3 rounded-lg border ${
                                    optIndex === question.correctAnswer 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                      optIndex === question.correctAnswer
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-300 text-gray-700'
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-sm">{option}</p>
                                      {question.optionImages?.[optIndex] && (
                                        <img 
                                          src={question.optionImages[optIndex]} 
                                          alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                                          className="mt-2 max-w-24 rounded border"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      )}
                                    </div>
                                    {optIndex === question.correctAnswer && (
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {question.explanation && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                                <p className="text-blue-800 text-sm">{question.explanation}</p>
                                {question.explanationImage && (
                                  <img 
                                    src={question.explanationImage} 
                                    alt="Explanation" 
                                    className="mt-2 max-w-xs rounded border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Results & Analytics</h3>
              <p className="text-gray-500 mb-4">View exam results and performance analytics</p>
              <p className="text-sm text-gray-400">Feature coming soon...</p>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-8 text-center">
              <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings & Configuration</h3>
              <p className="text-gray-500 mb-4">Configure exam settings and preferences</p>
              <p className="text-sm text-gray-400">Feature coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;