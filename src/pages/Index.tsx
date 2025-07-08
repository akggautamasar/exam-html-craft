import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Plus, Trash2, Eye, FileText, Settings, HelpCircle, Upload, Palette, Timer, BookOpen, FileUp } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  imageUrl?: string;
  solutionHeading?: string;
}

interface ExamData {
  title: string;
  appName: string;
  duration: number;
  instructions: string;
  passingScore: number;
  showTimer: boolean;
  showPalette: boolean;
  showSolutions: boolean;
  allowReview: boolean;
  randomizeQuestions: boolean;
  primaryColor: string;
  accentColor: string;
  questions: Question[];
}

const Index = () => {
  const [examData, setExamData] = useState<ExamData>({
    title: '',
    appName: 'EXAM PORTAL',
    duration: 60,
    instructions: 'Answer all questions to the best of your ability. You can mark questions for review and come back to them later. The exam will automatically submit when time expires.',
    passingScore: 50,
    showTimer: true,
    showPalette: true,
    showSolutions: true,
    allowReview: true,
    randomizeQuestions: false,
    primaryColor: '#4285f4',
    accentColor: '#34a853',
    questions: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      solutionHeading: 'Explanation'
    };
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionId: number, optionIndex: number, value: string) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const deleteQuestion = (id: number) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
    toast.success('Question deleted successfully');
  };

  const parseBulkQuestions = () => {
    if (!bulkQuestions.trim()) {
      toast.error('Please enter questions to import');
      return;
    }

    try {
      const questions = bulkQuestions.split('---').map(questionBlock => {
        const lines = questionBlock.trim().split('\n').filter(line => line.trim());
        if (lines.length < 5) return null; // Skip incomplete questions

        // Find question text (usually line with number and text)
        const questionLine = lines.find(line => /^\d+\./.test(line.trim()));
        if (!questionLine) return null;

        const questionText = questionLine.replace(/^\d+\.\s*/, '').trim();
        
        // Find options (lines starting with a), b), c), d))
        const options = ['', '', '', ''];
        let correctAnswer = 0;
        
        lines.forEach(line => {
          const trimmed = line.trim();
          if (/^a\)\s*/.test(trimmed)) {
            options[0] = trimmed.replace(/^a\)\s*/, '');
          } else if (/^b\)\s*/.test(trimmed)) {
            options[1] = trimmed.replace(/^b\)\s*/, '');
          } else if (/^c\)\s*/.test(trimmed)) {
            options[2] = trimmed.replace(/^c\)\s*/, '');
          } else if (/^d\)\s*/.test(trimmed)) {
            options[3] = trimmed.replace(/^d\)\s*/, '');
          }
        });

        // Find explanation
        const explanationLine = lines.find(line => line.includes('👉') || line.toLowerCase().includes('explanation'));
        const explanation = explanationLine ? 
          explanationLine.replace(/👉\s*[Ee]xplanation:\s*/, '').trim() : '';

        // Determine correct answer (look for bold text or first non-empty option)
        const originalText = questionBlock;
        if (originalText.includes('**a)') || originalText.includes('*a)')) correctAnswer = 0;
        else if (originalText.includes('**b)') || originalText.includes('*b)')) correctAnswer = 1;
        else if (originalText.includes('**c)') || originalText.includes('*c)')) correctAnswer = 2;
        else if (originalText.includes('**d)') || originalText.includes('*d)')) correctAnswer = 3;

        return {
          id: Date.now() + Math.random(),
          text: questionText,
          options: options,
          correctAnswer: correctAnswer,
          explanation: explanation,
          solutionHeading: 'Explanation'
        };
      }).filter(Boolean);

      if (questions.length === 0) {
        toast.error('No valid questions found. Please check the format.');
        return;
      }

      setExamData(prev => ({
        ...prev,
        questions: [...prev.questions, ...questions]
      }));

      setBulkQuestions('');
      setShowBulkImport(false);
      toast.success(`${questions.length} questions imported successfully!`);
    } catch (error) {
      toast.error('Error parsing questions. Please check the format.');
    }
  };

  const generateHTML = () => {
    if (!examData.title || examData.questions.length === 0) {
      toast.error('Please fill in exam title and add at least one question');
      return;
    }

    const questionsJSON = examData.questions.map((q, index) => ({
      question: q.text,
      option_1: q.options[0],
      option_2: q.options[1],
      option_3: q.options[2],
      option_4: q.options[3],
      answer: (q.correctAnswer + 1).toString(),
      solution_heading: q.solutionHeading || 'Explanation',
      solution_text: q.explanation,
      ...(q.imageUrl && { image: q.imageUrl })
    }));

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examData.title}</title>
    <style>
        @font-face {
            font-family: 'Mangal';
            src: url('https://appxcontent.kaxa.in/fonts/MANGAL.ttf') format('truetype');
            font-display: swap;
        }
        @font-face {
            font-family: 'KOKILA';
            src: url('https://appxcontent.kaxa.in/fonts/kokila.ttf') format('truetype');
            font-display: swap;
        }
        @font-face {
            font-family: 'Kruti Dev';
            src: url('https://appxcontent.kaxa.in/fonts/k010.TTF') format('truetype');
            font-display: swap;
        }
        
        :root {
            --primary-color: ${examData.primaryColor};
            --accent-color: ${examData.accentColor};
            --warning-color: #fbbc05;
            --danger-color: #ea4335;
            --light-bg: #f8f9fa;
            --dark-bg: #202124;
            --dark-text: #202124;
            --light-text: #5f6368;
            --border-radius: 8px;
            --box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            --transition: all 0.3s ease;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: var(--dark-text);
            background-color: var(--light-bg);
            overflow-wrap: break-word;
        }
        
        /* Header Styles */
        .app-header {
            text-align: center;
            padding: 20px;
            background-color: white;
            box-shadow: var(--box-shadow);
            position: relative;
            z-index: 10;
        }
        
        .app-name {
            color: var(--primary-color);
            font-size: 2.4rem;
            margin-bottom: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.15);
            font-family: 'Arial Black', Gadget, sans-serif;
            background: linear-gradient(135deg, var(--primary-color) 0%, #6d9eeb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            padding: 5px 0;
        }
        
        .app-divider {
            height: 3px;
            width: 80px;
            background: linear-gradient(to right, var(--primary-color), var(--accent-color));
            margin: 0 auto 15px;
            border-radius: 2px;
        }
        
        .exam-title {
            color: var(--accent-color);
            font-size: 1.7rem;
            margin-bottom: 15px;
            font-family: 'Georgia', serif;
            font-weight: 600;
            line-height: 1.3;
            display: block;
            padding: 0 10px;
        }
        
        /* Start Screen */
        .start-screen {
            max-width: 800px;
            margin: 30px auto;
            padding: 30px;
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            text-align: center;
        }
        
        .exam-info {
            margin-bottom: 30px;
            text-align: left;
            display: inline-block;
        }
        
        .exam-info-item {
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        
        .exam-info-item strong {
            color: var(--primary-color);
        }
        
        .btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 24px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 10px 5px;
            cursor: pointer;
            border-radius: var(--border-radius);
            transition: var(--transition);
            min-width: 150px;
        }
        
        .btn:hover {
            background-color: #3367d6;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .btn-accent {
            background-color: var(--accent-color);
        }
        
        .btn-accent:hover {
            background-color: #2d9249;
        }
        
        .btn-warning {
            background-color: var(--warning-color);
        }
        
        .btn-warning:hover {
            background-color: #e6ac00;
        }
        
        .btn-danger {
            background-color: var(--danger-color);
        }
        
        .btn-danger:hover {
            background-color: #d33426;
        }
        
        /* Exam Container */
        .exam-container {
            display: none;
            max-width: 1000px;
            margin: 20px auto;
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            overflow: hidden;
        }
        
        /* Exam Header */
        .exam-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: var(--primary-color);
            color: white;
            position: relative;
        }
        
        .exam-header-left {
            display: flex;
            align-items: center;
        }
        
        .question-counter {
            font-weight: bold;
            margin-right: 15px;
        }
        
        .timer {
            font-family: monospace;
            font-size: 1.2rem;
            background-color: rgba(0,0,0,0.2);
            padding: 5px 10px;
            border-radius: 4px;
            ${!examData.showTimer ? 'display: none;' : ''}
        }
        
        .time-warning {
            background-color: var(--warning-color);
            color: var(--dark-text);
        }
        
        .time-danger {
            background-color: var(--danger-color);
            color: white;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .nav-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 4px;
            transition: var(--transition);
        }
        
        .nav-btn:hover {
            background-color: rgba(255,255,255,0.2);
        }
        
        /* Question Area */
        .question-area {
            padding: 25px;
        }
        
        .question-text {
            font-size: 1.2rem;
            margin-bottom: 25px;
            line-height: 1.5;
        }
        
        .question-image {
            max-width: 100%;
            height: auto;
            margin: 15px 0;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            cursor: pointer;
        }
        
        /* Options */
        .options-container {
            margin: 20px 0;
        }
        
        .option {
            display: block;
            margin-bottom: 12px;
            padding: 15px;
            background-color: var(--light-bg);
            border-left: 4px solid #ddd;
            border-radius: var(--border-radius);
            transition: var(--transition);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .option:hover {
            transform: translateX(5px);
            background-color: rgba(66, 133, 244, 0.1);
        }
        
        .option.selected {
            background-color: rgba(66, 133, 244, 0.2);
            border-left: 4px solid var(--primary-color);
        }
        
        .option.correct {
            background-color: rgba(52, 168, 83, 0.2);
            border-left: 4px solid var(--accent-color);
        }
        
        .option.incorrect {
            background-color: rgba(234, 67, 53, 0.2);
            border-left: 4px solid var(--danger-color);
        }
        
        .option input[type="radio"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
        }
        
        .option-label {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        .option-number {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background-color: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
            transition: var(--transition);
        }
        
        .option.selected .option-number {
            background-color: var(--primary-color);
            color: white;
        }
        
        .option.correct .option-number {
            background-color: var(--accent-color);
            color: white;
        }
        
        .option.incorrect .option-number {
            background-color: var(--danger-color);
            color: white;
        }
        
        .option-text {
            flex-grow: 1;
        }
        
        /* Navigation Buttons */
        .nav-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .nav-btn-group {
            display: flex;
            gap: 10px;
        }
        
        /* Question Palette */
        .palette-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 100;
            display: ${examData.showPalette ? 'flex' : 'none'};
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }
        
        .palette-btn:hover {
            transform: scale(1.1);
        }
        
        .question-palette {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
        }
        
        .palette-container {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 20px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .palette-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .palette-title {
            font-size: 1.5rem;
            color: var(--primary-color);
        }
        
        .palette-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--light-text);
        }
        
        .palette-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
            gap: 10px;
        }
        
        .palette-item {
            width: 100%;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #eee;
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
            font-weight: bold;
        }
        
        .palette-item:hover {
            transform: scale(1.1);
        }
        
        .palette-item.current {
            background-color: var(--primary-color);
            color: white;
        }
        
        .palette-item.answered {
            background-color: var(--accent-color);
            color: white;
        }
        
        .palette-item.marked {
            background-color: var(--warning-color);
            color: white;
        }
        
        .palette-item.not-visited {
            background-color: #ddd;
            color: var(--light-text);
        }
        
        /* Result Screen */
        .result-screen {
            display: none;
            max-width: 800px;
            margin: 30px auto;
            padding: 30px;
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }
        
        .result-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .result-title {
            color: var(--primary-color);
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .result-subtitle {
            color: var(--light-text);
            font-size: 1.2rem;
        }
        
        .score-card {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .score-item {
            background-color: var(--light-bg);
            border-radius: var(--border-radius);
            padding: 20px;
            text-align: center;
        }
        
        .score-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .score-label {
            color: var(--light-text);
        }
        
        .correct-answer .score-value {
            color: var(--accent-color);
        }
        
        .wrong-answer .score-value {
            color: var(--danger-color);
        }
        
        .accuracy .score-value {
            color: var(--primary-color);
        }
        
        .result-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
        }
        
        /* Review Questions */
        .review-container {
            display: none;
            margin-top: 30px;
        }
        
        .review-question {
            margin-bottom: 40px;
            padding: 20px;
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }
        
        .review-question-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .review-question-number {
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .review-status {
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .status-correct {
            background-color: rgba(52, 168, 83, 0.2);
            color: var(--accent-color);
        }
        
        .status-incorrect {
            background-color: rgba(234, 67, 53, 0.2);
            color: var(--danger-color);
        }
        
        .review-question-text {
            margin-bottom: 15px;
        }
        
        .review-answer {
            margin-top: 15px;
            padding: 15px;
            border-radius: var(--border-radius);
        }
        
        .user-answer {
            background-color: rgba(66, 133, 244, 0.1);
            border-left: 4px solid var(--primary-color);
        }
        
        .correct-answer-review {
            background-color: rgba(52, 168, 83, 0.1);
            border-left: 4px solid var(--accent-color);
        }
        
        .review-label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .review-solution {
            margin-top: 20px;
            padding: 15px;
            background-color: rgba(66, 133, 244, 0.05);
            border-radius: var(--border-radius);
            border-left: 4px solid var(--primary-color);
        }
        
        .solution-heading {
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--primary-color);
        }
        
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 30px;
            max-width: 500px;
            width: 90%;
            text-align: center;
        }
        
        .modal-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: var(--primary-color);
        }
        
        .modal-message {
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.5;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        /* Image Zoom */
        .img-zoom-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        
        .zoomed-image {
            max-width: 90%;
            max-height: 90%;
        }
        
        .close-zoom {
            position: absolute;
            top: 20px;
            right: 30px;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
            .app-name {
                font-size: 1.8rem;
            }
            
            .exam-title {
                font-size: 1.3rem;
            }
            
            .exam-header {
                flex-direction: column;
                align-items: flex-start;
                padding: 10px;
            }
            
            .exam-header-left {
                margin-bottom: 10px;
                width: 100%;
                justify-content: space-between;
            }
            
            .question-counter {
                margin-right: 0;
            }
            
            .question-area {
                padding: 15px;
            }
            
            .nav-buttons {
                flex-direction: column;
                gap: 10px;
            }
            
            .nav-btn-group {
                width: 100%;
            }
            
            .btn {
                width: 100%;
            }
            
            .score-card {
                grid-template-columns: 1fr 1fr;
            }
            
            .result-buttons {
                flex-direction: column;
            }
        }
        
        @media (max-width: 480px) {
            .app-name {
                font-size: 1.5rem;
            }
            
            .exam-title {
                font-size: 1.1rem;
            }
            
            .start-screen, .result-screen {
                padding: 20px;
                margin: 15px;
            }
            
            .score-card {
                grid-template-columns: 1fr;
            }
            
            .option {
                padding: 12px;
            }
            
            .option-number {
                width: 20px;
                height: 20px;
                margin-right: 10px;
                font-size: 0.8rem;
            }
        }
        
        /* Font Classes */
        .kokila-font {
            font-family: 'KOKILA', sans-serif;
            font-size: 15pt;
        }
        
        .mangal-font {
            font-family: 'Mangal', sans-serif;
        }
        
        .kruti-dev-font {
            font-family: 'Kruti Dev', sans-serif;
            font-size: 15pt;
        }
    </style>
</head>
<body>
    <!-- Start Screen -->
    <div class="app-header">
        <div class="app-name">${examData.appName}</div>
        <div class="app-divider"></div>
        <div class="exam-title">${examData.title}</div>
    </div>
    
    <div id="start-screen" class="start-screen">
        <div class="exam-info">
            <div class="exam-info-item"><strong>Exam Title:</strong> <span id="exam-title-display">${examData.title}</span></div>
            <div class="exam-info-item"><strong>Total Questions:</strong> <span id="total-questions">${examData.questions.length}</span></div>
            <div class="exam-info-item"><strong>Duration:</strong> <span id="exam-duration">${examData.duration}</span> minutes</div>
            <div class="exam-info-item"><strong>Instructions:</strong></div>
            <div style="margin-left: 20px; margin-bottom: 20px; text-align: left;">
                ${examData.instructions}
            </div>
        </div>
        <button id="start-exam-btn" class="btn btn-accent">Start Test</button>
    </div>

    <!-- Exam Container -->
    <div id="exam-container" class="exam-container">
        <div class="exam-header">
            <div class="exam-header-left">
                <div class="question-counter">Question <span id="current-question-num">1</span> of <span id="total-questions-exam">${examData.questions.length}</span></div>
                <div id="timer" class="timer">00:00:00</div>
            </div>
        </div>
        
        <div class="question-area">
            <div class="question-text" id="question-text"></div>
            <img id="question-image" class="question-image" src="" alt="" style="display: none;">
            
            <div class="options-container" id="options-container"></div>
            
            <div class="nav-buttons">
                <div class="nav-btn-group">
                    <button id="prev-btn" class="btn">Previous</button>
                    <button id="next-btn" class="btn">Next</button>
                </div>
                <div class="nav-btn-group">
                    ${examData.allowReview ? '<button id="mark-btn" class="btn btn-warning">Mark for Review</button>' : ''}
                    <button id="submit-btn" class="btn btn-danger">Submit Test</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Question Palette Button -->
    <button id="palette-btn" class="palette-btn" style="display: none;">≡</button>
    
    <!-- Question Palette Modal -->
    <div id="question-palette" class="question-palette">
        <div class="palette-container">
            <div class="palette-header">
                <div class="palette-title">Question Palette</div>
                <button class="palette-close">&times;</button>
            </div>
            <div class="palette-grid" id="palette-grid"></div>
            <div style="margin-top: 20px; text-align: left;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div class="palette-item current" style="width: 20px; height: 20px; margin-right: 10px;"></div>
                    <span>Current Question</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div class="palette-item answered" style="width: 20px; height: 20px; margin-right: 10px;"></div>
                    <span>Answered</span>
                </div>
                ${examData.allowReview ? `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div class="palette-item marked" style="width: 20px; height: 20px; margin-right: 10px;"></div>
                    <span>Marked for Review</span>
                </div>
                ` : ''}
                <div style="display: flex; align-items: center;">
                    <div class="palette-item not-visited" style="width: 20px; height: 20px; margin-right: 10px;"></div>
                    <span>Not Visited</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Result Screen -->
    <div id="result-screen" class="result-screen">
        <div class="result-header">
            <h1 class="result-title">Exam Results</h1>
            <div class="result-subtitle">Here's how you performed on the test</div>
        </div>
        
        <div class="score-card">
            <div class="score-item">
                <div class="score-value" id="total-questions-result">${examData.questions.length}</div>
                <div class="score-label">Total Questions</div>
            </div>
            <div class="score-item">
                <div class="score-value" id="attempted-questions">0</div>
                <div class="score-label">Attempted</div>
            </div>
            <div class="score-item correct-answer">
                <div class="score-value" id="correct-answers">0</div>
                <div class="score-label">Correct</div>
            </div>
            <div class="score-item wrong-answer">
                <div class="score-value" id="wrong-answers">0</div>
                <div class="score-label">Wrong</div>
            </div>
            <div class="score-item accuracy">
                <div class="score-value" id="accuracy">0%</div>
                <div class="score-label">Accuracy</div>
            </div>
        </div>
        
        <div class="result-buttons">
            ${examData.showSolutions ? '<button id="show-solutions-btn" class="btn btn-accent">Show Solutions</button>' : ''}
            <button id="restart-exam-btn" class="btn">Restart Test</button>
        </div>
        
        <div id="review-container" class="review-container">
            <!-- Review questions will be inserted here -->
        </div>
    </div>
    
    <!-- Image Zoom Container -->
    <div class="img-zoom-container" id="img-zoom-container">
        <span class="close-zoom">&times;</span>
        <img class="zoomed-image" id="zoomed-image" src="" alt="">
    </div>
    
    <!-- Confirmation Modal -->
    <div id="confirm-modal" class="modal">
        <div class="modal-content">
            <div class="modal-title" id="confirm-modal-title">Confirm Submission</div>
            <div class="modal-message" id="confirm-modal-message">Are you sure you want to submit the test?</div>
            <div class="modal-buttons">
                <button id="confirm-cancel" class="btn">Cancel</button>
                <button id="confirm-submit" class="btn btn-danger">Submit</button>
            </div>
        </div>
    </div>
    
    <script>
        // Questions data
        const questions = ${JSON.stringify(questionsJSON, null, 8)};
        
        // Exam configuration
        const examConfig = {
            title: "${examData.title}",
            duration: ${examData.duration},
            questions: questions,
            randomizeQuestions: ${examData.randomizeQuestions},
            showTimer: ${examData.showTimer},
            showPalette: ${examData.showPalette},
            showSolutions: ${examData.showSolutions},
            allowReview: ${examData.allowReview}
        };
        
        // State management
        let examState = {
            currentQuestion: 0,
            answers: {},
            markedQuestions: [],
            startTime: null,
            endTime: null,
            timerInterval: null,
            visitedQuestions: []
        };
        
        // DOM elements
        const startScreen = document.getElementById('start-screen');
        const examContainer = document.getElementById('exam-container');
        const resultScreen = document.getElementById('result-screen');
        const startExamBtn = document.getElementById('start-exam-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const markBtn = document.getElementById('mark-btn');
        const submitBtn = document.getElementById('submit-btn');
        const paletteBtn = document.getElementById('palette-btn');
        const paletteModal = document.getElementById('question-palette');
        const paletteGrid = document.getElementById('palette-grid');
        const showSolutionsBtn = document.getElementById('show-solutions-btn');
        const restartExamBtn = document.getElementById('restart-exam-btn');
        const confirmModal = document.getElementById('confirm-modal');
        const confirmCancel = document.getElementById('confirm-cancel');
        const confirmSubmit = document.getElementById('confirm-submit');
        const timerDisplay = document.getElementById('timer');
        const imgZoomContainer = document.getElementById('img-zoom-container');
        const zoomedImage = document.getElementById('zoomed-image');
        const closeZoom = document.querySelector('.close-zoom');
        
        // Initialize the app
        function initApp() {
            // Randomize questions if enabled
            if (examConfig.randomizeQuestions) {
                examConfig.questions = shuffleArray([...examConfig.questions]);
            }
            
            // Initialize answers array
            examState.answers = {};
            examConfig.questions.forEach((_, index) => {
                examState.answers[index] = {
                    selected: null,
                    marked: false
                };
            });
            
            // Initialize palette
            if (examConfig.showPalette) {
                initQuestionPalette();
            }
            
            // Event listeners
            startExamBtn.addEventListener('click', startExam);
            prevBtn.addEventListener('click', showPreviousQuestion);
            nextBtn.addEventListener('click', showNextQuestion);
            if (markBtn) markBtn.addEventListener('click', toggleMarkForReview);
            submitBtn.addEventListener('click', showSubmitConfirmation);
            
            if (paletteBtn && paletteModal) {
                paletteBtn.addEventListener('click', () => paletteModal.style.display = 'flex');
                document.querySelector('.palette-close').addEventListener('click', () => paletteModal.style.display = 'none');
            }
            
            if (showSolutionsBtn) showSolutionsBtn.addEventListener('click', showSolutions);
            restartExamBtn.addEventListener('click', restartExam);
            confirmCancel.addEventListener('click', () => confirmModal.style.display = 'none');
            confirmSubmit.addEventListener('click', submitExam);
            if (closeZoom) closeZoom.addEventListener('click', () => imgZoomContainer.style.display = 'none');
            
            // Prevent accidental exit
            window.addEventListener('beforeunload', handleBeforeUnload);
        }
        
        // Utility function to shuffle array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        // Initialize question palette
        function initQuestionPalette() {
            if (!paletteGrid) return;
            
            paletteGrid.innerHTML = '';
            examConfig.questions.forEach((_, index) => {
                const paletteItem = document.createElement('div');
                paletteItem.className = 'palette-item not-visited';
                paletteItem.textContent = index + 1;
                paletteItem.addEventListener('click', () => {
                    showQuestion(index);
                    paletteModal.style.display = 'none';
                });
                paletteGrid.appendChild(paletteItem);
            });
        }
        
        // Update question palette
        function updateQuestionPalette() {
            if (!examConfig.showPalette) return;
            
            const paletteItems = document.querySelectorAll('.palette-item');
            paletteItems.forEach((item, index) => {
                item.className = 'palette-item';
                
                if (index === examState.currentQuestion) {
                    item.classList.add('current');
                } else if (examState.answers[index].selected !== null) {
                    item.classList.add('answered');
                } else if (examState.answers[index].marked) {
                    item.classList.add('marked');
                } else if (examState.visitedQuestions.includes(index)) {
                    item.classList.add('not-visited');
                } else {
                    item.classList.add('not-visited');
                }
            });
        }
        
        // Start the exam
        function startExam() {
            startScreen.style.display = 'none';
            examContainer.style.display = 'block';
            if (paletteBtn) paletteBtn.style.display = 'flex';
            
            examState.startTime = new Date();
            
            if (examConfig.showTimer) {
                startTimer();
            }
            
            showQuestion(0);
        }
        
        // Start the countdown timer
        function startTimer() {
            const examDurationMs = examConfig.duration * 60 * 1000;
            const endTime = new Date(examState.startTime.getTime() + examDurationMs);
            
            updateTimerDisplay(endTime);
            
            examState.timerInterval = setInterval(() => {
                updateTimerDisplay(endTime);
            }, 1000);
        }
        
        // Update timer display
        function updateTimerDisplay(endTime) {
            const now = new Date();
            const timeLeftMs = endTime - now;
            
            if (timeLeftMs <= 0) {
                clearInterval(examState.timerInterval);
                timerDisplay.textContent = '00:00:00';
                timerDisplay.className = 'timer time-danger';
                submitExam();
                return;
            }
            
            const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60);
            const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
            
            const formattedTime = 
                hours.toString().padStart(2, '0') + ':' + 
                minutes.toString().padStart(2, '0') + ':' + 
                seconds.toString().padStart(2, '0');
            
            timerDisplay.textContent = formattedTime;
            
            if (timeLeftMs < 5 * 60 * 1000) {
                timerDisplay.className = 'timer time-warning';
            } else if (timeLeftMs < 2 * 60 * 1000) {
                timerDisplay.className = 'timer time-danger';
            } else {
                timerDisplay.className = 'timer';
            }
        }
        
        // Show a specific question
        function showQuestion(index) {
            if (index < 0 || index >= examConfig.questions.length) return;
            
            examState.currentQuestion = index;
            
            // Mark as visited
            if (!examState.visitedQuestions.includes(index)) {
                examState.visitedQuestions.push(index);
            }
            
            document.getElementById('current-question-num').textContent = index + 1;
            
            const question = examConfig.questions[index];
            
            document.getElementById('question-text').innerHTML = question.question;
            
            const questionImage = document.getElementById('question-image');
            if (question.image) {
                questionImage.src = question.image;
                questionImage.style.display = 'block';
                questionImage.onclick = () => zoomImage(question.image);
            } else {
                questionImage.style.display = 'none';
            }
            
            const optionsContainer = document.getElementById('options-container');
            optionsContainer.innerHTML = '';
            
            for (let i = 1; i <= 4; i++) {
                const optionKey = 'option_' + i;
                if (question[optionKey]) {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    if (examState.answers[index].selected === i.toString()) {
                        optionDiv.classList.add('selected');
                    }
                    
                    optionDiv.innerHTML = 
                        '<label class="option-label">' +
                        '<span class="option-number">' + i + '</span>' +
                        '<span class="option-text">' + question[optionKey] + '</span>' +
                        '</label>';
                    
                    optionDiv.addEventListener('click', () => selectOption(index, i.toString()));
                    optionsContainer.appendChild(optionDiv);
                }
            }
            
            if (markBtn) updateMarkButton();
            updateNavButtons();
            updateQuestionPalette();
        }
        
        // Zoom image
        function zoomImage(src) {
            zoomedImage.src = src;
            imgZoomContainer.style.display = 'flex';
        }
        
        // Select an option
        function selectOption(questionIndex, optionIndex) {
            examState.answers[questionIndex].selected = optionIndex;
            
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.classList.remove('selected');
            });
            
            const selectedOption = document.querySelectorAll('.option')[parseInt(optionIndex) - 1];
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
            
            updateQuestionPalette();
        }
        
        // Toggle mark for review
        function toggleMarkForReview() {
            if (!examConfig.allowReview) return;
            
            const currentIndex = examState.currentQuestion;
            examState.answers[currentIndex].marked = !examState.answers[currentIndex].marked;
            updateMarkButton();
            updateQuestionPalette();
        }
        
        // Update mark button text
        function updateMarkButton() {
            if (!markBtn || !examConfig.allowReview) return;
            
            const currentIndex = examState.currentQuestion;
            if (examState.answers[currentIndex].marked) {
                markBtn.textContent = 'Unmark';
                markBtn.classList.add('btn-warning');
            } else {
                markBtn.textContent = 'Mark for Review';
                markBtn.classList.remove('btn-warning');
            }
        }
        
        // Update navigation buttons
        function updateNavButtons() {
            if (examState.currentQuestion === 0) {
                prevBtn.disabled = true;
                prevBtn.style.opacity = '0.5';
            } else {
                prevBtn.disabled = false;
                prevBtn.style.opacity = '1';
            }
            
            if (examState.currentQuestion === examConfig.questions.length - 1) {
                nextBtn.textContent = 'Finish';
            } else {
                nextBtn.textContent = 'Next';
            }
        }
        
        // Show previous question
        function showPreviousQuestion() {
            if (examState.currentQuestion > 0) {
                showQuestion(examState.currentQuestion - 1);
            }
        }
        
        // Show next question
        function showNextQuestion() {
            if (examState.currentQuestion < examConfig.questions.length - 1) {
                showQuestion(examState.currentQuestion + 1);
            } else {
                showSubmitConfirmation();
            }
        }
        
        // Show submit confirmation
        function showSubmitConfirmation() {
            const unansweredQuestions = Object.values(examState.answers).filter(a => a.selected === null).length;
            
            document.getElementById('confirm-modal-title').textContent = 'Confirm Submission';
            
            if (unansweredQuestions > 0) {
                document.getElementById('confirm-modal-message').innerHTML = 
                    'You have ' + unansweredQuestions + ' unanswered question' + (unansweredQuestions > 1 ? 's' : '') + '.<br>Are you sure you want to submit the test?';
            } else {
                document.getElementById('confirm-modal-message').textContent = 
                    'Are you sure you want to submit the test?';
            }
            
            confirmModal.style.display = 'flex';
        }
        
        // Submit the exam
        function submitExam() {
            examState.endTime = new Date();
            
            if (examState.timerInterval) {
                clearInterval(examState.timerInterval);
            }
            
            examContainer.style.display = 'none';
            if (paletteBtn) paletteBtn.style.display = 'none';
            resultScreen.style.display = 'block';
            confirmModal.style.display = 'none';
            
            calculateResults();
        }
        
        // Calculate exam results
        function calculateResults() {
            let correct = 0;
            let wrong = 0;
            let attempted = 0;
            
            examConfig.questions.forEach((question, index) => {
                if (examState.answers[index].selected !== null) {
                    attempted++;
                    
                    if (examState.answers[index].selected === question.answer) {
                        correct++;
                    } else {
                        wrong++;
                    }
                }
            });
            
            const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
            
            document.getElementById('total-questions-result').textContent = examConfig.questions.length;
            document.getElementById('attempted-questions').textContent = attempted;
            document.getElementById('correct-answers').textContent = correct;
            document.getElementById('wrong-answers').textContent = wrong;
            document.getElementById('accuracy').textContent = accuracy + '%';
        }
        
        // Show solutions
        function showSolutions() {
            if (!examConfig.showSolutions) return;
            
            const reviewContainer = document.getElementById('review-container');
            reviewContainer.innerHTML = '';
            
            examConfig.questions.forEach((question, index) => {
                const reviewQuestion = document.createElement('div');
                reviewQuestion.className = 'review-question';
                
                const isCorrect = examState.answers[index].selected === question.answer;
                const statusClass = isCorrect ? 'status-correct' : 'status-incorrect';
                const statusText = isCorrect ? 'Correct' : 'Incorrect';
                
                let userAnswerText = 'Not attempted';
                if (examState.answers[index].selected !== null) {
                    const optionKey = 'option_' + examState.answers[index].selected;
                    userAnswerText = question[optionKey] || 'Invalid option';
                }
                
                const correctOptionKey = 'option_' + question.answer;
                const correctAnswerText = question[correctOptionKey] || 'Invalid option';
                
                reviewQuestion.innerHTML = 
                    '<div class="review-question-header">' +
                    '<div class="review-question-number">Question ' + (index + 1) + '</div>' +
                    '<div class="review-status ' + statusClass + '">' + statusText + '</div>' +
                    '</div>' +
                    '<div class="review-question-text">' + question.question + '</div>' +
                    '<div class="review-answer user-answer">' +
                    '<div class="review-label">Your Answer:</div>' +
                    userAnswerText +
                    '</div>' +
                    '<div class="review-answer correct-answer-review">' +
                    '<div class="review-label">Correct Answer:</div>' +
                    correctAnswerText +
                    '</div>' +
                    (question.solution_text ? 
                    '<div class="review-solution">' +
                    '<div class="solution-heading">' + (question.solution_heading || 'Explanation') + '</div>' +
                    question.solution_text +
                    '</div>' : '');
                
                reviewContainer.appendChild(reviewQuestion);
            });
            
            reviewContainer.style.display = 'block';
            
            showSolutionsBtn.textContent = 'Hide Solutions';
            showSolutionsBtn.removeEventListener('click', showSolutions);
            showSolutionsBtn.addEventListener('click', hideSolutions);
        }
        
        // Hide solutions
        function hideSolutions() {
            document.getElementById('review-container').style.display = 'none';
            showSolutionsBtn.textContent = 'Show Solutions';
            showSolutionsBtn.removeEventListener('click', hideSolutions);
            showSolutionsBtn.addEventListener('click', showSolutions);
        }
        
        // Restart exam
        function restartExam() {
            examState = {
                currentQuestion: 0,
                answers: {},
                markedQuestions: [],
                startTime: null,
                endTime: null,
                timerInterval: null,
                visitedQuestions: []
            };
            
            resultScreen.style.display = 'none';
            startScreen.style.display = 'block';
            
            initApp();
        }
        
        // Handle beforeunload event
        function handleBeforeUnload(e) {
            if (examContainer.style.display === 'block') {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost.';
                return e.returnValue;
            }
        }
        
        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', initApp);
    </script>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_exam.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Advanced HTML exam file generated and downloaded successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title *</Label>
                <Input
                  id="title"
                  value={examData.title}
                  onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter exam title"
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  value={examData.appName}
                  onChange={(e) => setExamData(prev => ({ ...prev, appName: e.target.value }))}
                  placeholder="EXAM PORTAL"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={examData.duration}
                  onChange={(e) => setExamData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  min="1"
                  max="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={examData.passingScore}
                  onChange={(e) => setExamData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 50 }))}
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="randomize">Randomize Questions</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="randomize"
                    checked={examData.randomizeQuestions}
                    onCheckedChange={(checked) => setExamData(prev => ({ ...prev, randomizeQuestions: checked }))}
                  />
                  <Label htmlFor="randomize" className="text-sm">Enable</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={examData.instructions}
                onChange={(e) => setExamData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Enter exam instructions for students"
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Exam Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showTimer"
                    checked={examData.showTimer}
                    onCheckedChange={(checked) => setExamData(prev => ({ ...prev, showTimer: checked }))}
                  />
                  <Label htmlFor="showTimer" className="text-sm flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    Timer
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showPalette"
                    checked={examData.showPalette}
                    onCheckedChange={(checked) => setExamData(prev => ({ ...prev, showPalette: checked }))}
                  />
                  <Label htmlFor="showPalette" className="text-sm flex items-center gap-1">
                    <Palette className="w-4 h-4" />
                    Palette
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showSolutions"
                    checked={examData.showSolutions}
                    onCheckedChange={(checked) => setExamData(prev => ({ ...prev, showSolutions: checked }))}
                  />
                  <Label htmlFor="showSolutions" className="text-sm flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Solutions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowReview"
                    checked={examData.allowReview}
                    onCheckedChange={(checked) => setExamData(prev => ({ ...prev, allowReview: checked }))}
                  />
                  <Label htmlFor="allowReview" className="text-sm flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Review
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Color Customization</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primaryColor"
                      type="color"
                      value={examData.primaryColor}
                      onChange={(e) => setExamData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={examData.primaryColor}
                      onChange={(e) => setExamData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#4285f4"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="accentColor"
                      type="color"
                      value={examData.accentColor}
                      onChange={(e) => setExamData(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={examData.accentColor}
                      onChange={(e) => setExamData(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#34a853"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Questions ({examData.questions.length})</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowBulkImport(!showBulkImport)} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileUp className="w-4 h-4" />
                  Bulk Import
                </Button>
                <Button onClick={addQuestion} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            </div>

            {showBulkImport && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="space-y-4">
                  <div>
                    <Label>Bulk Import Questions</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Paste questions in this format. Separate questions with "---". Bold the correct answer or it will default to option A.
                    </p>
                    <Textarea
                      value={bulkQuestions}
                      onChange={(e) => setBulkQuestions(e.target.value)}
                      placeholder={`1. By the time we reached the station, the train ___.
a) leave
**b) had left**
c) has left
d) was leaving
👉 Explanation: Past perfect is used for actions completed before another past action.

---

2. She ___ in Delhi for five years before she moved to Mumbai.
a) is living
**b) had lived**
c) lives
d) has lived
👉 Explanation: Past perfect shows the earlier past action.`}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={parseBulkQuestions} className="bg-blue-600 hover:bg-blue-700">
                      Import Questions
                    </Button>
                    <Button onClick={() => setShowBulkImport(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {examData.questions.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={addQuestion} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Question
                  </Button>
                  <Button onClick={() => setShowBulkImport(true)} variant="outline">
                    <FileUp className="w-4 h-4 mr-2" />
                    Bulk Import
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {examData.questions.map((question, index) => (
                  <Card key={question.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-lg">Question {index + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Question Text *</Label>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                          placeholder="Enter your question"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Image URL (optional)</Label>
                        <Input
                          value={question.imageUrl || ''}
                          onChange={(e) => updateQuestion(question.id, 'imageUrl', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Answer Options *</Label>
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                              className="w-4 h-4"
                            />
                            <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                            <Input
                              value={option}
                              onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Solution Heading</Label>
                          <Input
                            value={question.solutionHeading || ''}
                            onChange={(e) => updateQuestion(question.id, 'solutionHeading', e.target.value)}
                            placeholder="Explanation"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Explanation (optional)</Label>
                        <Textarea
                          value={question.explanation}
                          onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                          placeholder="Explain why this answer is correct"
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Advanced HTML Exam Generator</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                onClick={generateHTML}
                disabled={!examData.title || examData.questions.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Generate HTML
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Exam Settings', icon: Settings },
              { step: 2, title: 'Questions', icon: HelpCircle }
            ].map(({ step, title, icon: Icon }) => (
              <div
                key={step}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                  currentStep === step
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setCurrentStep(step)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 ? (
                <>
                  <Settings className="w-5 h-5" />
                  Exam Configuration & Features
                </>
              ) : (
                <>
                  <HelpCircle className="w-5 h-5" />
                  Question Management
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
            disabled={currentStep === 2}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Next
          </Button>
        </div>

        {/* Preview Modal */}
        {showPreview && examData.title && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Exam Preview</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold mb-2" style={{ color: examData.primaryColor }}>
                    {examData.appName}
                  </h1>
                  <div className="h-1 w-20 mx-auto mb-4" style={{ 
                    background: `linear-gradient(to right, ${examData.primaryColor}, ${examData.accentColor})` 
                  }}></div>
                  <h2 className="text-xl font-semibold" style={{ color: examData.accentColor }}>
                    {examData.title}
                  </h2>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><strong>Total Questions:</strong> {examData.questions.length}</div>
                    <div><strong>Duration:</strong> {examData.duration} minutes</div>
                    <div><strong>Passing Score:</strong> {examData.passingScore}%</div>
                    <div><strong>Randomize:</strong> {examData.randomizeQuestions ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="mb-4">
                    <strong>Features:</strong> 
                    {examData.showTimer && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Timer</span>}
                    {examData.showPalette && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Palette</span>}
                    {examData.showSolutions && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Solutions</span>}
                    {examData.allowReview && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Review</span>}
                  </div>
                  <div className="text-sm">
                    <strong>Instructions:</strong> {examData.instructions || 'No instructions provided'}
                  </div>
                </div>

                {examData.questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Sample Questions:</h3>
                    {examData.questions.slice(0, 2).map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="font-medium mb-3">Q{index + 1}. {question.text}</div>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                                question.correctAnswer === optIndex 
                                  ? 'border-green-500 text-green-700' 
                                  : 'border-gray-300'
                              }`} style={{
                                backgroundColor: question.correctAnswer === optIndex ? examData.accentColor + '20' : '',
                                borderColor: question.correctAnswer === optIndex ? examData.accentColor : ''
                              }}>
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className={question.correctAnswer === optIndex ? 'font-medium' : ''}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4" style={{ borderLeftColor: examData.primaryColor }}>
                            <div className="font-medium text-sm" style={{ color: examData.primaryColor }}>
                              {question.solutionHeading || 'Explanation'}
                            </div>
                            <div className="text-sm mt-1">{question.explanation}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
