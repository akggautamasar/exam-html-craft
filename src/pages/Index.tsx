import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { 
  FileText, 
  Download, 
  Copy, 
  Eye, 
  Code, 
  Palette, 
  Settings, 
  Plus, 
  Trash2, 
  Save,
  Upload,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Clock,
  Users,
  Award,
  CheckCircle
} from "lucide-react";

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

interface ExamSettings {
  title: string;
  description: string;
  timeLimit: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  passingScore: number;
  instructions: string;
}

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    title: 'Sample Exam',
    description: 'This is a sample exam created with Exam HTML Craft',
    timeLimit: 60,
    shuffleQuestions: false,
    showResults: true,
    passingScore: 70,
    instructions: 'Please read each question carefully and select the best answer.'
  });
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: Date.now().toString()
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      id: '',
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });
    toast.success("Question added successfully!");
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success("Question removed");
  };

  const updateQuestionOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const generateHTML = () => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examSettings.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
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
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .exam-info {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
        }
        
        .info-item .icon {
            width: 20px;
            height: 20px;
            background: #007bff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
        }
        
        .instructions {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
        }
        
        .content {
            padding: 30px;
        }
        
        .question {
            background: #fff;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            transition: all 0.3s ease;
        }
        
        .question:hover {
            border-color: #007bff;
            box-shadow: 0 5px 15px rgba(0,123,255,0.1);
        }
        
        .question-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .question-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
        
        .question-points {
            background: #28a745;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .question-text {
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .options {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 15px;
            background: #f8f9fa;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }
        
        .option:hover {
            background: #e3f2fd;
            border-color: #2196f3;
        }
        
        .option input[type="radio"],
        .option input[type="checkbox"] {
            margin: 0;
            transform: scale(1.2);
        }
        
        .option label {
            cursor: pointer;
            flex: 1;
            font-weight: 500;
        }
        
        .text-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        .text-input:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
        
        .textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        .submit-section {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(40,167,69,0.3);
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40,167,69,0.4);
        }
        
        .timer {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(220,53,69,0.3);
            z-index: 1000;
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
            
            .question {
                padding: 20px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .timer {
                position: relative;
                top: auto;
                right: auto;
                margin-bottom: 20px;
                display: inline-block;
            }
        }
        
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #007bff, #28a745);
            width: 0%;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${examSettings.title}</h1>
            <p>${examSettings.description}</p>
        </div>
        
        <div class="exam-info">
            <div class="info-grid">
                <div class="info-item">
                    <div class="icon">⏱</div>
                    <span>Time Limit: ${examSettings.timeLimit} minutes</span>
                </div>
                <div class="info-item">
                    <div class="icon">📝</div>
                    <span>Questions: ${questions.length}</span>
                </div>
                <div class="info-item">
                    <div class="icon">🎯</div>
                    <span>Total Points: ${totalPoints}</span>
                </div>
                <div class="info-item">
                    <div class="icon">✅</div>
                    <span>Passing Score: ${examSettings.passingScore}%</span>
                </div>
            </div>
            
            <div class="instructions">
                <strong>Instructions:</strong> ${examSettings.instructions}
            </div>
        </div>
        
        ${examSettings.timeLimit > 0 ? '<div class="timer" id="timer">Time Remaining: <span id="time-display"></span></div>' : ''}
        
        <div class="content">
            <div class="progress-bar">
                <div class="progress-fill" id="progress"></div>
            </div>
            
            <form id="examForm">
                ${questions.map((question, index) => {
                    let optionsHTML = '';
                    
                    if (question.type === 'multiple-choice') {
                        optionsHTML = `
                            <div class="options">
                                ${question.options?.map((option, optIndex) => `
                                    <div class="option">
                                        <input type="radio" id="q${index}_${optIndex}" name="question_${index}" value="${optIndex}">
                                        <label for="q${index}_${optIndex}">${option}</label>
                                    </div>
                                `).join('') || ''}
                            </div>
                        `;
                    } else if (question.type === 'true-false') {
                        optionsHTML = `
                            <div class="options">
                                <div class="option">
                                    <input type="radio" id="q${index}_true" name="question_${index}" value="true">
                                    <label for="q${index}_true">True</label>
                                </div>
                                <div class="option">
                                    <input type="radio" id="q${index}_false" name="question_${index}" value="false">
                                    <label for="q${index}_false">False</label>
                                </div>
                            </div>
                        `;
                    } else if (question.type === 'short-answer') {
                        optionsHTML = `
                            <input type="text" class="text-input" name="question_${index}" placeholder="Enter your answer here...">
                        `;
                    } else if (question.type === 'essay') {
                        optionsHTML = `
                            <textarea class="text-input textarea" name="question_${index}" placeholder="Write your essay here..."></textarea>
                        `;
                    }
                    
                    return `
                        <div class="question">
                            <div class="question-header">
                                <div class="question-number">Question ${index + 1}</div>
                                <div class="question-points">${question.points} point${question.points !== 1 ? 's' : ''}</div>
                            </div>
                            <div class="question-text">${question.question}</div>
                            ${optionsHTML}
                        </div>
                    `;
                }).join('')}
            </form>
        </div>
        
        <div class="submit-section">
            <button type="button" class="submit-btn" onclick="submitExam()">Submit Exam</button>
        </div>
    </div>
    
    <script>
        // Timer functionality
        ${examSettings.timeLimit > 0 ? `
        let timeRemaining = ${examSettings.timeLimit * 60}; // Convert to seconds
        
        function updateTimer() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            document.getElementById('time-display').textContent = 
                minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
            
            if (timeRemaining <= 0) {
                submitExam();
                return;
            }
            
            timeRemaining--;
            setTimeout(updateTimer, 1000);
        }
        
        updateTimer();
        ` : ''}
        
        // Progress tracking
        function updateProgress() {
            const form = document.getElementById('examForm');
            const inputs = form.querySelectorAll('input[type="radio"]:checked, input[type="text"], textarea');
            const totalQuestions = ${questions.length};
            let answeredQuestions = 0;
            
            // Count answered questions
            for (let i = 0; i < totalQuestions; i++) {
                const questionInputs = form.querySelectorAll('[name="question_' + i + '"]');
                let answered = false;
                
                questionInputs.forEach(input => {
                    if ((input.type === 'radio' && input.checked) || 
                        (input.type === 'text' && input.value.trim()) ||
                        (input.tagName === 'TEXTAREA' && input.value.trim())) {
                        answered = true;
                    }
                });
                
                if (answered) answeredQuestions++;
            }
            
            const progress = (answeredQuestions / totalQuestions) * 100;
            document.getElementById('progress').style.width = progress + '%';
        }
        
        // Add event listeners for progress tracking
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('examForm');
            form.addEventListener('change', updateProgress);
            form.addEventListener('input', updateProgress);
        });
        
        // Submit exam function
        function submitExam() {
            const form = document.getElementById('examForm');
            const formData = new FormData(form);
            
            // Collect answers
            const answers = {};
            for (let [key, value] of formData.entries()) {
                answers[key] = value;
            }
            
            // Calculate score (if answers are provided)
            let score = 0;
            let totalPoints = ${totalPoints};
            
            ${questions.map((question, index) => {
                if (question.correctAnswer !== undefined && question.correctAnswer !== '') {
                    return `
                    if (answers['question_${index}'] === '${question.correctAnswer}') {
                        score += ${question.points};
                    }
                    `;
                }
                return '';
            }).join('')}
            
            const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
            const passed = percentage >= ${examSettings.passingScore};
            
            ${examSettings.showResults ? `
            alert('Exam submitted!\\n\\nYour Score: ' + score + '/' + totalPoints + ' (' + percentage + '%)\\n' + 
                  'Status: ' + (passed ? 'PASSED' : 'FAILED'));
            ` : `
            alert('Exam submitted successfully!');
            `}
            
            // Disable form
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => input.disabled = true);
            document.querySelector('.submit-btn').disabled = true;
            document.querySelector('.submit-btn').textContent = 'Exam Submitted';
        }
        
        // Prevent accidental page refresh
        window.addEventListener('beforeunload', function(e) {
            e.preventDefault();
            e.returnValue = '';
        });
    </script>
</body>
</html>`;

    setGeneratedHTML(html);
    toast.success("HTML exam generated successfully!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedHTML);
    toast.success("HTML copied to clipboard!");
  };

  const downloadHTML = () => {
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examSettings.title.replace(/\s+/g, '_')}_exam.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded!");
  };

  const loadSampleExam = () => {
    const sampleQuestions: Question[] = [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
        correctAnswer: '0',
        points: 2
      },
      {
        id: '2',
        type: 'true-false',
        question: 'CSS stands for Cascading Style Sheets.',
        correctAnswer: 'true',
        points: 1
      },
      {
        id: '3',
        type: 'short-answer',
        question: 'What is the latest version of HTML?',
        correctAnswer: 'HTML5',
        points: 2
      },
      {
        id: '4',
        type: 'essay',
        question: 'Explain the difference between HTML, CSS, and JavaScript in web development.',
        points: 5
      }
    ];
    
    setQuestions(sampleQuestions);
    setExamSettings({
      ...examSettings,
      title: 'Web Development Fundamentals Exam',
      description: 'Test your knowledge of basic web development concepts'
    });
    toast.success("Sample exam loaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Exam HTML Craft
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional, interactive HTML exams with ease. Build, customize, and deploy beautiful exam interfaces in minutes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Questions</p>
                  <p className="text-2xl font-bold">{questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Total Points</p>
                  <p className="text-2xl font-bold">{questions.reduce((sum, q) => sum + q.points, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Time Limit</p>
                  <p className="text-2xl font-bold">{examSettings.timeLimit}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Pass Score</p>
                  <p className="text-2xl font-bold">{examSettings.passingScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Question Builder
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Exam Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Question Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Question Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Question
                  </CardTitle>
                  <CardDescription>
                    Create questions for your exam. Support for multiple choice, true/false, short answer, and essay questions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 mb-4">
                    <Button 
                      onClick={loadSampleExam} 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Load Sample Exam
                    </Button>
                    <Button 
                      onClick={() => {
                        setQuestions([]);
                        setCurrentQuestion({
                          id: '',
                          type: 'multiple-choice',
                          question: '',
                          options: ['', '', '', ''],
                          correctAnswer: '',
                          points: 1
                        });
                        toast.success("Questions cleared!");
                      }} 
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Clear All
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select 
                      value={currentQuestion.type} 
                      onValueChange={(value: any) => setCurrentQuestion({...currentQuestion, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="question-text">Question</Label>
                    <Textarea
                      id="question-text"
                      placeholder="Enter your question here..."
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>

                  {currentQuestion.type === 'multiple-choice' && (
                    <div>
                      <Label>Answer Options</Label>
                      <div className="space-y-2">
                        {currentQuestion.options?.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => updateQuestionOption(index, e.target.value)}
                            />
                            <RadioGroup 
                              value={currentQuestion.correctAnswer} 
                              onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value})}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`correct-${index}`} />
                                <Label htmlFor={`correct-${index}`} className="text-sm">Correct</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === 'true-false' && (
                    <div>
                      <Label>Correct Answer</Label>
                      <RadioGroup 
                        value={currentQuestion.correctAnswer} 
                        onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value})}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="true" />
                          <Label htmlFor="true">True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="false" />
                          <Label htmlFor="false">False</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {currentQuestion.type === 'short-answer' && (
                    <div>
                      <Label htmlFor="correct-answer">Correct Answer (Optional)</Label>
                      <Input
                        id="correct-answer"
                        placeholder="Enter the correct answer for auto-grading..."
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                    />
                  </div>

                  <Button onClick={addQuestion} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Questions ({questions.length})
                  </CardTitle>
                  <CardDescription>
                    Review and manage your exam questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No questions added yet</p>
                      <p className="text-sm">Start by adding your first question</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Q{index + 1}</Badge>
                              <Badge variant="outline">{question.type}</Badge>
                              <Badge variant="default">{question.points} pts</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-medium mb-2">{question.question}</p>
                          {question.options && (
                            <div className="text-sm text-gray-600">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <span className={optIndex.toString() === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                    {optIndex.toString() === question.correctAnswer ? '✓' : '•'} {option}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Exam Settings
                </CardTitle>
                <CardDescription>
                  Configure your exam parameters and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="exam-title">Exam Title</Label>
                      <Input
                        id="exam-title"
                        value={examSettings.title}
                        onChange={(e) => setExamSettings({...examSettings, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="exam-description">Description</Label>
                      <Textarea
                        id="exam-description"
                        value={examSettings.description}
                        onChange={(e) => setExamSettings({...examSettings, description: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={examSettings.instructions}
                        onChange={(e) => setExamSettings({...examSettings, instructions: e.target.value})}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        min="0"
                        value={examSettings.timeLimit}
                        onChange={(e) => setExamSettings({...examSettings, timeLimit: parseInt(e.target.value) || 0})}
                      />
                      <p className="text-sm text-gray-500 mt-1">Set to 0 for no time limit</p>
                    </div>

                    <div>
                      <Label htmlFor="passing-score">Passing Score (%)</Label>
                      <Input
                        id="passing-score"
                        type="number"
                        min="0"
                        max="100"
                        value={examSettings.passingScore}
                        onChange={(e) => setExamSettings({...examSettings, passingScore: parseInt(e.target.value) || 70})}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shuffle-questions"
                          checked={examSettings.shuffleQuestions}
                          onCheckedChange={(checked) => setExamSettings({...examSettings, shuffleQuestions: checked as boolean})}
                        />
                        <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="show-results"
                          checked={examSettings.showResults}
                          onCheckedChange={(checked) => setExamSettings({...examSettings, showResults: checked as boolean})}
                        />
                        <Label htmlFor="show-results">Show Results After Submission</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Exam Preview
                </CardTitle>
                <CardDescription>
                  Preview how your exam will look to students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No questions to preview</p>
                    <p>Add some questions to see the preview</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                      <h2 className="text-2xl font-bold mb-2">{examSettings.title}</h2>
                      <p className="opacity-90">{examSettings.description}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p><strong>Instructions:</strong> {examSettings.instructions}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                        <div className="text-sm text-gray-600">Questions</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-green-600">{questions.reduce((sum, q) => sum + q.points, 0)}</div>
                        <div className="text-sm text-gray-600">Total Points</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-600">{examSettings.timeLimit}m</div>
                        <div className="text-sm text-gray-600">Time Limit</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-orange-600">{examSettings.passingScore}%</div>
                        <div className="text-sm text-gray-600">Pass Score</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-6 bg-white">
                          <div className="flex justify-between items-center mb-4">
                            <Badge className="bg-blue-100 text-blue-800">Question {index + 1}</Badge>
                            <Badge variant="outline">{question.points} point{question.points !== 1 ? 's' : ''}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
                          
                          {question.type === 'multiple-choice' && (
                            <div className="space-y-2">
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                  <input type="radio" disabled />
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.type === 'true-false' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <input type="radio" disabled />
                                <span>True</span>
                              </div>
                              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <input type="radio" disabled />
                                <span>False</span>
                              </div>
                            </div>
                          )}
                          
                          {question.type === 'short-answer' && (
                            <Input placeholder="Enter your answer here..." disabled />
                          )}
                          
                          {question.type === 'essay' && (
                            <Textarea placeholder="Write your essay here..." disabled className="min-h-[100px]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Exam
                </CardTitle>
                <CardDescription>
                  Generate and download your HTML exam file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Download className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No questions to export</p>
                    <p>Add some questions before generating the HTML</p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <Button onClick={generateHTML} className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Generate HTML
                      </Button>
                      
                      {generatedHTML && (
                        <>
                          <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            Copy HTML
                          </Button>
                          
                          <Button onClick={downloadHTML} variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download File
                          </Button>
                        </>
                      )}
                    </div>

                    {generatedHTML && (
                      <div>
                        <Label>Generated HTML Code</Label>
                        <Textarea
                          value={generatedHTML}
                          readOnly
                          className="min-h-[300px] font-mono text-sm"
                        />
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">📋 How to use your exam:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Click "Generate HTML" to create your exam file</li>
                        <li>• Download the HTML file to your computer</li>
                        <li>• Open the file in any web browser to view your exam</li>
                        <li>• Share the file with students or upload to your learning platform</li>
                        <li>• The exam includes automatic scoring and timer functionality</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;