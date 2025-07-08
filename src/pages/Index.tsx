import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2, Download, Upload, Eye, FileText, Image, CheckCircle, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  explanationImageUrl?: string;
}

interface ExamData {
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

const Index = () => {
  const [examData, setExamData] = useState<ExamData>({
    title: "",
    description: "",
    timeLimit: 60,
    questions: []
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      explanationImageUrl: ""
    };
    setEditingQuestion(newQuestion);
    setIsEditDialogOpen(true);
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
    setIsEditDialogOpen(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive"
      });
      return;
    }

    if (editingQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "Error",
        description: "All options must be filled",
        variant: "destructive"
      });
      return;
    }

    setExamData(prev => {
      const existingIndex = prev.questions.findIndex(q => q.id === editingQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev.questions];
        updated[existingIndex] = editingQuestion;
        return { ...prev, questions: updated };
      } else {
        return { ...prev, questions: [...prev.questions, editingQuestion] };
      }
    });

    setIsEditDialogOpen(false);
    setEditingQuestion(null);
    toast({
      title: "Success",
      description: "Question saved successfully"
    });
  };

  const deleteQuestion = (id: string) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
    toast({
      title: "Success",
      description: "Question deleted successfully"
    });
  };

  const parseBulkImport = (text: string): Question[] => {
    const questions: Question[] = [];
    const sections = text.split(/---+/).filter(section => section.trim());

    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      let questionText = "";
      const options: string[] = [];
      let correctAnswer = 0;
      let explanation = "";
      let explanationImageUrl = "";

      let currentLine = 0;

      // Extract question (first non-empty line that doesn't start with a letter followed by ')')
      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        if (line && !line.match(/^[a-d]\)/)) {
          // Remove question number if present (e.g., "1. ", "2. ")
          questionText = line.replace(/^\d+\.\s*/, "");
          currentLine++;
          break;
        }
        currentLine++;
      }

      // Extract options
      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        if (line.match(/^[a-d]\)/)) {
          const optionText = line.substring(2).trim();
          const isBold = line.includes('**') || optionText.startsWith('**') || optionText.endsWith('**');
          
          if (isBold) {
            correctAnswer = options.length;
            options.push(optionText.replace(/\*\*/g, ''));
          } else {
            options.push(optionText);
          }
          currentLine++;
        } else if (line.startsWith('👉') || line.toLowerCase().includes('explanation')) {
          // Extract explanation
          explanation = line.replace(/^👉\s*/, '').replace(/^explanation:\s*/i, '');
          currentLine++;
          break;
        } else {
          currentLine++;
        }
      }

      // Look for image URL in remaining lines
      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        if (line.startsWith('http') || line.includes('image:') || line.includes('img:')) {
          explanationImageUrl = line.replace(/^(image:|img:)\s*/i, '');
          break;
        }
        currentLine++;
      }

      if (questionText && options.length >= 2) {
        questions.push({
          id: `bulk_${Date.now()}_${index}`,
          question: questionText,
          options: options.length < 4 ? [...options, ...Array(4 - options.length).fill("")] : options.slice(0, 4),
          correctAnswer,
          explanation,
          explanationImageUrl
        });
      }
    });

    return questions;
  };

  const handleBulkImportPreview = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "Error",
        description: "Please enter questions to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsed = parseBulkImport(bulkImportText);
      if (parsed.length === 0) {
        toast({
          title: "Error",
          description: "No valid questions found. Please check the format.",
          variant: "destructive"
        });
        return;
      }
      setPreviewQuestions(parsed);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse questions. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const confirmBulkImport = () => {
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, ...previewQuestions]
    }));
    setBulkImportText("");
    setPreviewQuestions([]);
    setShowPreview(false);
    setIsBulkImportOpen(false);
    toast({
      title: "Success",
      description: `${previewQuestions.length} questions imported successfully`
    });
  };

  const generateHTMLExam = (): string => {
    const questionsJSON = JSON.stringify(examData.questions);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examData.title}</title>
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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
        
        .timer {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            font-size: 1.5em;
            font-weight: bold;
        }
        
        .content {
            padding: 30px;
        }
        
        .start-screen, .exam-screen, .results-screen {
            text-align: center;
        }
        
        .start-screen h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2em;
        }
        
        .exam-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
        
        .exam-info h3 {
            color: #495057;
            margin-bottom: 15px;
        }
        
        .info-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        
        .question-container {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
        
        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .question-number {
            background: #007bff;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        
        .question-text {
            font-size: 1.2em;
            color: #333;
            margin: 20px 0;
            line-height: 1.6;
        }
        
        .options {
            margin: 20px 0;
        }
        
        .option {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
        }
        
        .option:hover {
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,123,255,0.2);
        }
        
        .option.selected {
            border-color: #007bff;
            background: #e3f2fd;
        }
        
        .option.correct {
            border-color: #28a745;
            background: #d4edda;
        }
        
        .option.incorrect {
            border-color: #dc3545;
            background: #f8d7da;
        }
        
        .option-letter {
            background: #6c757d;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-weight: bold;
        }
        
        .option.selected .option-letter {
            background: #007bff;
        }
        
        .option.correct .option-letter {
            background: #28a745;
        }
        
        .option.incorrect .option-letter {
            background: #dc3545;
        }
        
        .explanation {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #ffc107;
        }
        
        .explanation h4 {
            color: #856404;
            margin-bottom: 10px;
        }
        
        .explanation-image {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            margin-top: 10px;
        }
        
        .navigation {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
        }
        
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn:hover {
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,123,255,0.3);
        }
        
        .btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .btn-success {
            background: #28a745;
        }
        
        .btn-success:hover {
            background: #1e7e34;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .results-summary {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .score {
            font-size: 3em;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
        }
        
        .score.excellent { color: #28a745; }
        .score.good { color: #17a2b8; }
        .score.average { color: #ffc107; }
        .score.poor { color: #dc3545; }
        
        .hidden {
            display: none;
        }
        
        .progress-bar {
            background: #e9ecef;
            height: 8px;
            border-radius: 4px;
            margin: 20px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            background: linear-gradient(90deg, #007bff, #0056b3);
            height: 100%;
            transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 10px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .content {
                padding: 20px;
            }
            
            .navigation {
                flex-direction: column;
                gap: 10px;
            }
            
            .btn {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${examData.title}</h1>
            <p>${examData.description}</p>
            <div class="timer hidden" id="timer">
                Time Remaining: <span id="time-display">${examData.timeLimit}:00</span>
            </div>
        </div>
        
        <div class="content">
            <!-- Start Screen -->
            <div class="start-screen" id="start-screen">
                <h2>Welcome to the Exam</h2>
                <div class="exam-info">
                    <h3>Exam Information</h3>
                    <div class="info-item">
                        <strong>Total Questions:</strong> ${examData.questions.length}
                    </div>
                    <div class="info-item">
                        <strong>Time Limit:</strong> ${examData.timeLimit} minutes
                    </div>
                    <div class="info-item">
                        <strong>Instructions:</strong> 
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li>Read each question carefully</li>
                            <li>Select the best answer for each question</li>
                            <li>You can navigate between questions</li>
                            <li>Submit your exam before time runs out</li>
                        </ul>
                    </div>
                </div>
                <button class="btn" onclick="startExam()">Start Exam</button>
            </div>
            
            <!-- Exam Screen -->
            <div class="exam-screen hidden" id="exam-screen">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                </div>
                
                <div class="question-container" id="question-container">
                    <!-- Questions will be loaded here -->
                </div>
                
                <div class="navigation">
                    <button class="btn btn-secondary" id="prev-btn" onclick="previousQuestion()" disabled>Previous</button>
                    <span id="question-info">Question 1 of ${examData.questions.length}</span>
                    <button class="btn" id="next-btn" onclick="nextQuestion()">Next</button>
                    <button class="btn btn-success hidden" id="submit-btn" onclick="submitExam()">Submit Exam</button>
                </div>
            </div>
            
            <!-- Results Screen -->
            <div class="results-screen hidden" id="results-screen">
                <h2>Exam Results</h2>
                <div class="results-summary">
                    <div class="score" id="final-score">0%</div>
                    <div id="score-details"></div>
                </div>
                <div id="detailed-results"></div>
                <button class="btn" onclick="restartExam()">Retake Exam</button>
            </div>
        </div>
    </div>

    <script>
        const questions = ${questionsJSON};
        let currentQuestion = 0;
        let userAnswers = {};
        let timeRemaining = ${examData.timeLimit} * 60; // Convert to seconds
        let timerInterval;
        let examStarted = false;

        function startExam() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('exam-screen').classList.remove('hidden');
            document.getElementById('timer').classList.remove('hidden');
            examStarted = true;
            startTimer();
            loadQuestion();
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    submitExam();
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            document.getElementById('time-display').textContent = 
                minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }

        function loadQuestion() {
            const question = questions[currentQuestion];
            const container = document.getElementById('question-container');
            
            let explanationHtml = '';
            if (question.explanation) {
                explanationHtml = \`
                    <div class="explanation hidden" id="explanation-\${currentQuestion}">
                        <h4>Explanation:</h4>
                        <p>\${question.explanation}</p>
                        \${question.explanationImageUrl ? \`<img src="\${question.explanationImageUrl}" alt="Explanation" class="explanation-image">\` : ''}
                    </div>
                \`;
            }
            
            container.innerHTML = \`
                <div class="question-header">
                    <div class="question-number">Question \${currentQuestion + 1}</div>
                </div>
                <div class="question-text">\${question.question}</div>
                <div class="options">
                    \${question.options.map((option, index) => \`
                        <div class="option" onclick="selectAnswer(\${index})" id="option-\${index}">
                            <div class="option-letter">\${String.fromCharCode(65 + index)}</div>
                            <span>\${option}</span>
                        </div>
                    \`).join('')}
                </div>
                \${explanationHtml}
            \`;
            
            // Restore previous answer if exists
            if (userAnswers[currentQuestion] !== undefined) {
                document.getElementById(\`option-\${userAnswers[currentQuestion]}\`).classList.add('selected');
            }
            
            updateNavigation();
            updateProgress();
        }

        function selectAnswer(optionIndex) {
            // Remove previous selection
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            document.getElementById(\`option-\${optionIndex}\`).classList.add('selected');
            
            // Store answer
            userAnswers[currentQuestion] = optionIndex;
            
            updateNavigation();
        }

        function nextQuestion() {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                loadQuestion();
            }
        }

        function previousQuestion() {
            if (currentQuestion > 0) {
                currentQuestion--;
                loadQuestion();
            }
        }

        function updateNavigation() {
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const submitBtn = document.getElementById('submit-btn');
            const questionInfo = document.getElementById('question-info');
            
            prevBtn.disabled = currentQuestion === 0;
            
            if (currentQuestion === questions.length - 1) {
                nextBtn.classList.add('hidden');
                submitBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                submitBtn.classList.add('hidden');
            }
            
            questionInfo.textContent = \`Question \${currentQuestion + 1} of \${questions.length}\`;
        }

        function updateProgress() {
            const progress = ((currentQuestion + 1) / questions.length) * 100;
            document.getElementById('progress-fill').style.width = progress + '%';
        }

        function submitExam() {
            clearInterval(timerInterval);
            calculateResults();
            showResults();
        }

        function calculateResults() {
            let correct = 0;
            const totalQuestions = questions.length;
            
            for (let i = 0; i < totalQuestions; i++) {
                if (userAnswers[i] === questions[i].correctAnswer) {
                    correct++;
                }
            }
            
            const percentage = Math.round((correct / totalQuestions) * 100);
            
            // Update score display
            const scoreElement = document.getElementById('final-score');
            scoreElement.textContent = percentage + '%';
            
            // Add score class for styling
            if (percentage >= 90) scoreElement.className = 'score excellent';
            else if (percentage >= 75) scoreElement.className = 'score good';
            else if (percentage >= 60) scoreElement.className = 'score average';
            else scoreElement.className = 'score poor';
            
            // Update score details
            document.getElementById('score-details').innerHTML = \`
                <p><strong>Correct Answers:</strong> \${correct} out of \${totalQuestions}</p>
                <p><strong>Percentage:</strong> \${percentage}%</p>
                <p><strong>Grade:</strong> \${getGrade(percentage)}</p>
            \`;
            
            // Generate detailed results
            generateDetailedResults();
        }

        function getGrade(percentage) {
            if (percentage >= 90) return 'A+';
            if (percentage >= 80) return 'A';
            if (percentage >= 70) return 'B';
            if (percentage >= 60) return 'C';
            if (percentage >= 50) return 'D';
            return 'F';
        }

        function generateDetailedResults() {
            const detailedResults = document.getElementById('detailed-results');
            let html = '<h3>Detailed Review</h3>';
            
            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                html += \`
                    <div class="question-container">
                        <div class="question-header">
                            <div class="question-number">Question \${index + 1}</div>
                            <div style="color: \${isCorrect ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                \${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </div>
                        </div>
                        <div class="question-text">\${question.question}</div>
                        <div class="options">
                            \${question.options.map((option, optIndex) => {
                                let className = 'option';
                                if (optIndex === question.correctAnswer) className += ' correct';
                                else if (optIndex === userAnswer && userAnswer !== question.correctAnswer) className += ' incorrect';
                                
                                return \`
                                    <div class="\${className}">
                                        <div class="option-letter">\${String.fromCharCode(65 + optIndex)}</div>
                                        <span>\${option}</span>
                                        \${optIndex === userAnswer ? ' (Your Answer)' : ''}
                                        \${optIndex === question.correctAnswer ? ' (Correct Answer)' : ''}
                                    </div>
                                \`;
                            }).join('')}
                        </div>
                        \${question.explanation ? \`
                            <div class="explanation">
                                <h4>Explanation:</h4>
                                <p>\${question.explanation}</p>
                                \${question.explanationImageUrl ? \`<img src="\${question.explanationImageUrl}" alt="Explanation" class="explanation-image">\` : ''}
                            </div>
                        \` : ''}
                    </div>
                \`;
            });
            
            detailedResults.innerHTML = html;
        }

        function showResults() {
            document.getElementById('exam-screen').classList.add('hidden');
            document.getElementById('results-screen').classList.remove('hidden');
            document.getElementById('timer').classList.add('hidden');
        }

        function restartExam() {
            currentQuestion = 0;
            userAnswers = {};
            timeRemaining = ${examData.timeLimit} * 60;
            examStarted = false;
            
            document.getElementById('results-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            document.getElementById('timer').classList.add('hidden');
            
            clearInterval(timerInterval);
        }

        // Prevent page refresh during exam
        window.addEventListener('beforeunload', function(e) {
            if (examStarted && !document.getElementById('results-screen').classList.contains('hidden')) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    </script>
</body>
</html>`;
  };

  const exportExam = () => {
    if (!examData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter exam title before exporting",
        variant: "destructive"
      });
      return;
    }

    if (examData.questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question before exporting",
        variant: "destructive"
      });
      return;
    }

    try {
      const htmlContent = generateHTMLExam();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const exportFileDefaultName = `${examData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_exam.html`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      // Clean up
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "HTML exam exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export exam. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam HTML Craft</h1>
          <p className="text-lg text-gray-600">Create professional HTML-based exams with ease</p>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Exam Setup</TabsTrigger>
            <TabsTrigger value="questions">Questions ({examData.questions.length})</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Exam Configuration</CardTitle>
                <CardDescription>Set up your exam details and parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={examData.title}
                    onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter exam title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={examData.description}
                    onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter exam description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={examData.timeLimit}
                    onChange={(e) => setExamData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Questions</h2>
                <div className="flex gap-2">
                  <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Bulk Import Questions</DialogTitle>
                        <DialogDescription>
                          Import multiple questions at once. Use the format shown below. Bold options will be marked as correct answers.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!showPreview ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Format Example:</h4>
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`1. By the time we reached the station, the train ___.
a) leave
b) **had left**
c) has left
d) was leaving
👉 Explanation: Past perfect ("had left") is used for an action completed before another past action.

---

2. She ___ in Delhi for five years before she moved to Mumbai.
a) is living
b) **had lived**
c) lives
d) has lived
👉 Explanation: Past perfect shows the earlier past action before "moved."
Image: https://example.com/image.jpg

---`}
                            </pre>
                          </div>
                          
                          <div>
                            <Label htmlFor="bulkText">Paste your questions here:</Label>
                            <Textarea
                              id="bulkText"
                              value={bulkImportText}
                              onChange={(e) => setBulkImportText(e.target.value)}
                              placeholder="Paste your questions in the format shown above..."
                              rows={15}
                              className="font-mono text-sm"
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleBulkImportPreview}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Preview ({previewQuestions.length} questions)</h4>
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                              Back to Edit
                            </Button>
                          </div>
                          
                          <div className="max-h-96 overflow-y-auto space-y-4">
                            {previewQuestions.map((question, index) => (
                              <Card key={question.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-4">
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <Badge variant="secondary">{index + 1}</Badge>
                                      <p className="font-medium">{question.question}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-1 ml-8">
                                      {question.options.map((option, optIndex) => (
                                        <div key={optIndex} className={`flex items-center gap-2 p-2 rounded ${
                                          optIndex === question.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                        }`}>
                                          {optIndex === question.correctAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                                          <span className="font-medium">{String.fromCharCode(97 + optIndex)})</span>
                                          <span>{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {question.explanation && (
                                      <div className="ml-8 mt-2 p-2 bg-blue-50 rounded border-l-4 border-l-blue-400">
                                        <div className="flex items-start gap-2">
                                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                          <span className="text-sm">{question.explanation}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {question.explanationImageUrl && (
                                      <div className="ml-8 mt-2 p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                          <Image className="w-4 h-4 text-gray-600" />
                                          <span className="text-sm text-blue-600 underline">{question.explanationImageUrl}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={confirmBulkImport}>
                              <Plus className="w-4 h-4 mr-2" />
                              Import {previewQuestions.length} Questions
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button onClick={addNewQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              {examData.questions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first question or use bulk import</p>
                    <div className="flex justify-center gap-2">
                      <Button onClick={addNewQuestion}>Add Question</Button>
                      <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
                        Bulk Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {examData.questions.map((question, index) => (
                    <Card key={question.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <div className="flex-1">
                              <p className="font-medium mb-2">{question.question}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className={`p-2 rounded text-sm ${
                                    optIndex === question.correctAnswer 
                                      ? 'bg-green-50 border border-green-200 text-green-800' 
                                      : 'bg-gray-50'
                                  }`}>
                                    <span className="font-medium">{String.fromCharCode(97 + optIndex)})</span> {option}
                                  </div>
                                ))}
                              </div>
                              {question.explanation && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-l-blue-400">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <span className="text-sm">{question.explanation}</span>
                                  </div>
                                </div>
                              )}
                              {question.explanationImageUrl && (
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-blue-600 underline">{question.explanationImageUrl}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => editQuestion(question)}>
                              <Edit2 className="w-4 h-4" />
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Exam</CardTitle>
                <CardDescription>Generate your HTML exam file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Exam Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Title:</span>
                      <p className="font-medium">{examData.title || "Not set"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Questions:</span>
                      <p className="font-medium">{examData.questions.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time Limit:</span>
                      <p className="font-medium">{examData.timeLimit} minutes</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={examData.title && examData.questions.length > 0 ? "default" : "secondary"}>
                        {examData.title && examData.questions.length > 0 ? "Ready" : "Incomplete"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-center">
                  <Button 
                    onClick={exportExam}
                    disabled={!examData.title.trim() || examData.questions.length === 0}
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export HTML Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Question Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion?.id.includes('bulk_') || !examData.questions.find(q => q.id === editingQuestion?.id) 
                  ? 'Add Question' : 'Edit Question'}
              </DialogTitle>
            </DialogHeader>
            
            {editingQuestion && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="questionText">Question</Label>
                  <Textarea
                    id="questionText"
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
                    placeholder="Enter your question"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Options</Label>
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant={index === editingQuestion.correctAnswer ? "default" : "outline"}>
                        {String.fromCharCode(97 + index)}
                      </Badge>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditingQuestion(prev => prev ? { ...prev, options: newOptions } : null);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                      <Button
                        variant={index === editingQuestion.correctAnswer ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: index } : null)}
                      >
                        {index === editingQuestion.correctAnswer ? <CheckCircle className="w-4 h-4" /> : "Correct"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={editingQuestion.explanation || ""}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, explanation: e.target.value } : null)}
                    placeholder="Provide an explanation for the correct answer"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="explanationImage">Explanation Image URL (Optional)</Label>
                  <Input
                    id="explanationImage"
                    value={editingQuestion.explanationImageUrl || ""}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, explanationImageUrl: e.target.value } : null)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveQuestion}>
                    Save Question
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