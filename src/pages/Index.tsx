
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, Minus } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  imageUrl?: string;
}

interface ExamSettings {
  title: string;
  instructions: string;
  timeLimit: number;
  questions: Question[];
}

const Index = () => {
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    title: '',
    instructions: '',
    timeLimit: 60,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    imageUrl: ''
  });

  const [bulkQuestions, setBulkQuestions] = useState('');

  const addQuestion = () => {
    if (currentQuestion.question.trim() && currentQuestion.options.some(opt => opt.trim())) {
      setExamSettings(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }));
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        imageUrl: ''
      });
    }
  };

  const removeQuestion = (index: number) => {
    setExamSettings(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options.length > 2) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
        correctAnswer: prev.correctAnswer >= index ? Math.max(0, prev.correctAnswer - 1) : prev.correctAnswer
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const parseBulkQuestions = () => {
    const lines = bulkQuestions.trim().split('\n');
    const questions: Question[] = [];
    let currentQ: Partial<Question> = {};
    let options: string[] = [];
    let correctAnswer = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Check if it's a question (starts with number and period)
      if (/^\d+\./.test(line)) {
        // Save previous question if exists
        if (currentQ.question && options.length > 0) {
          questions.push({
            question: currentQ.question,
            options: [...options],
            correctAnswer,
            explanation: currentQ.explanation || '',
            imageUrl: currentQ.imageUrl || ''
          });
        }
        
        // Start new question
        currentQ = { question: line.replace(/^\d+\.\s*/, '') };
        options = [];
        correctAnswer = 0;
      }
      // Check if it's an option (starts with a), b), c), etc.)
      else if (/^[a-z]\)/.test(line)) {
        const optionText = line.replace(/^[a-z]\)\s*/, '');
        const optionIndex = options.length;
        
        // Check if this option is bold (correct answer)
        if (line.includes('**') || line.includes('<b>') || line.includes('<strong>')) {
          correctAnswer = optionIndex;
        }
        
        options.push(optionText.replace(/\*\*|<\/?b>|<\/?strong>/g, ''));
      }
    }

    // Add the last question
    if (currentQ.question && options.length > 0) {
      questions.push({
        question: currentQ.question,
        options: [...options],
        correctAnswer,
        explanation: currentQ.explanation || '',
        imageUrl: currentQ.imageUrl || ''
      });
    }

    setExamSettings(prev => ({
      ...prev,
      questions: [...prev.questions, ...questions]
    }));
    setBulkQuestions('');
  };

  const generateHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examSettings.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }
        .timer {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
        }
        .question {
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fafafa;
        }
        .question h3 {
            margin-top: 0;
            color: #333;
            font-size: 18px;
        }
        .question-image {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            border-radius: 5px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .question-image:hover {
            transform: scale(1.05);
        }
        .options {
            margin: 15px 0;
        }
        .option {
            margin: 8px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .option:hover {
            background-color: #e9ecef;
        }
        .option input {
            margin-right: 10px;
        }
        .correct {
            background-color: #d4edda !important;
            border-color: #c3e6cb !important;
        }
        .incorrect {
            background-color: #f8d7da !important;
            border-color: #f5c6cb !important;
        }
        .explanation {
            margin-top: 10px;
            padding: 10px;
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            border-radius: 4px;
            display: none;
        }
        .explanation-image {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            border-radius: 5px;
            cursor: pointer;
        }
        .btn {
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .results {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .hidden {
            display: none;
        }
        .instructions {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1001;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
        }
        .modal-content {
            margin: auto;
            display: block;
            width: 80%;
            max-width: 700px;
            position: relative;
            top: 50%;
            transform: translateY(-50%);
        }
        .close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${examSettings.title}</h1>
            <div class="instructions">
                <p>${examSettings.instructions}</p>
            </div>
        </div>
        
        <div id="timer" class="timer hidden">
            Time: <span id="timeLeft">${examSettings.timeLimit}:00</span>
        </div>
        
        <div id="startSection">
            <div style="text-align: center; margin: 40px 0;">
                <button class="btn" onclick="startExam()">Start Test</button>
            </div>
        </div>
        
        <div id="examSection" class="hidden">
            ${examSettings.questions.map((q, index) => `
                <div class="question" id="question${index}">
                    <h3>Question ${index + 1}: ${q.question}</h3>
                    ${q.imageUrl ? `<img src="${q.imageUrl}" alt="Question ${index + 1}" class="question-image" onclick="openModal('${q.imageUrl}')">` : ''}
                    <div class="options">
                        ${q.options.map((option, optIndex) => `
                            <div class="option" onclick="selectOption(${index}, ${optIndex})">
                                <input type="radio" id="q${index}o${optIndex}" name="question${index}" value="${optIndex}">
                                <label for="q${index}o${optIndex}">${option}</label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="explanation" id="explanation${index}">
                        <strong>Explanation:</strong> ${q.explanation}
                        ${q.imageUrl ? `<br><img src="${q.imageUrl}" alt="Explanation" class="explanation-image" onclick="openModal('${q.imageUrl}')">` : ''}
                    </div>
                </div>
            `).join('')}
            
            <div style="text-align: center; margin: 30px 0;">
                <button class="btn" onclick="submitExam()">Submit Exam</button>
            </div>
        </div>
        
        <div id="resultsSection" class="hidden">
            <div class="results">
                <div class="score" id="scoreDisplay"></div>
                <p id="resultMessage"></p>
                <button class="btn" onclick="showSolutions()">Show Solutions</button>
                <button class="btn" onclick="restartExam()">Restart Exam</button>
            </div>
        </div>
    </div>

    <div id="imageModal" class="modal">
        <span class="close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>

    <script>
        let timeLeft = ${examSettings.timeLimit} * 60;
        let timerInterval;
        let userAnswers = [];
        let examStarted = false;
        let examSubmitted = false;
        
        const questions = ${JSON.stringify(examSettings.questions)};

        function startExam() {
            document.getElementById('startSection').classList.add('hidden');
            document.getElementById('examSection').classList.remove('hidden');
            document.getElementById('timer').classList.remove('hidden');
            examStarted = true;
            startTimer();
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    submitExam();
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timeLeft').textContent = 
                minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }

        function selectOption(questionIndex, optionIndex) {
            userAnswers[questionIndex] = optionIndex;
            const options = document.querySelectorAll(\`input[name="question\${questionIndex}"]\`);
            options.forEach(option => option.checked = false);
            document.getElementById(\`q\${questionIndex}o\${optionIndex}\`).checked = true;
        }

        function submitExam() {
            if (examSubmitted) return;
            
            examSubmitted = true;
            clearInterval(timerInterval);
            
            let score = 0;
            let total = questions.length;
            
            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const correctAnswer = question.correctAnswer;
                
                if (userAnswer === correctAnswer) {
                    score++;
                }
            });
            
            const percentage = Math.round((score / total) * 100);
            
            document.getElementById('examSection').classList.add('hidden');
            document.getElementById('timer').classList.add('hidden');
            document.getElementById('resultsSection').classList.remove('hidden');
            
            document.getElementById('scoreDisplay').textContent = \`Score: \${score}/\${total} (\${percentage}%)\`;
            
            let message = '';
            if (percentage >= 80) {
                message = 'Excellent work! You have a great understanding of the subject.';
            } else if (percentage >= 60) {
                message = 'Good job! There\\'s room for improvement, but you\\'re on the right track.';
            } else {
                message = 'Keep studying! Review the solutions to improve your understanding.';
            }
            
            document.getElementById('resultMessage').textContent = message;
        }

        function showSolutions() {
            document.getElementById('resultsSection').classList.add('hidden');
            document.getElementById('examSection').classList.remove('hidden');
            
            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const correctAnswer = question.correctAnswer;
                const options = document.querySelectorAll(\`#question\${index} .option\`);
                
                options.forEach((option, optIndex) => {
                    if (optIndex === correctAnswer) {
                        option.classList.add('correct');
                    } else if (optIndex === userAnswer && userAnswer !== correctAnswer) {
                        option.classList.add('incorrect');
                    }
                });
                
                const explanation = document.getElementById(\`explanation\${index}\`);
                if (explanation && question.explanation) {
                    explanation.style.display = 'block';
                }
            });
            
            const submitButton = document.querySelector('#examSection .btn');
            submitButton.style.display = 'none';
        }

        function restartExam() {
            timeLeft = ${examSettings.timeLimit} * 60;
            userAnswers = [];
            examStarted = false;
            examSubmitted = false;
            
            document.getElementById('resultsSection').classList.add('hidden');
            document.getElementById('examSection').classList.add('hidden');
            document.getElementById('startSection').classList.remove('hidden');
            document.getElementById('timer').classList.add('hidden');
            
            questions.forEach((question, index) => {
                const options = document.querySelectorAll(\`#question\${index} .option\`);
                options.forEach(option => {
                    option.classList.remove('correct', 'incorrect');
                });
                
                const explanation = document.getElementById(\`explanation\${index}\`);
                if (explanation) {
                    explanation.style.display = 'none';
                }
                
                const inputs = document.querySelectorAll(\`input[name="question\${index}"]\`);
                inputs.forEach(input => input.checked = false);
            });
            
            const submitButton = document.querySelector('#examSection .btn');
            submitButton.style.display = 'inline-block';
        }

        function openModal(imageUrl) {
            document.getElementById('imageModal').style.display = 'block';
            document.getElementById('modalImage').src = imageUrl;
        }

        function closeModal() {
            document.getElementById('imageModal').style.display = 'none';
        }

        window.onclick = function(event) {
            const modal = document.getElementById('imageModal');
            if (event.target === modal) {
                closeModal();
            }
        }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examSettings.title || 'exam'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Exam Generator</h1>
        
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Exam Settings</TabsTrigger>
            <TabsTrigger value="questions">Add Questions</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Exam Configuration</CardTitle>
                <CardDescription>Set up your exam details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={examSettings.title}
                    onChange={(e) => setExamSettings(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter exam title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={examSettings.instructions}
                    onChange={(e) => setExamSettings(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Enter exam instructions"
                  />
                </div>
                
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={examSettings.timeLimit}
                    onChange={(e) => setExamSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Question</CardTitle>
                  <CardDescription>Create individual questions for your exam</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      value={currentQuestion.imageUrl}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Enter image URL"
                    />
                  </div>
                  
                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQuestion.correctAnswer === index}
                            onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                          />
                          <Label>Correct</Label>
                          {currentQuestion.options.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {currentQuestion.options.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addOption}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="explanation">Explanation (optional)</Label>
                    <Textarea
                      id="explanation"
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                      placeholder="Enter explanation for the correct answer"
                    />
                  </div>
                  
                  <Button onClick={addQuestion} className="w-full">
                    Add Question
                  </Button>
                </CardContent>
              </Card>
              
              {examSettings.questions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Questions ({examSettings.questions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {examSettings.questions.map((q, index) => (
                        <div key={index} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">Q{index + 1}: {q.question}</h4>
                              {q.imageUrl && (
                                <img src={q.imageUrl} alt={`Question ${index + 1}`} className="max-w-xs h-auto mt-2 rounded" />
                              )}
                              <ul className="mt-2 space-y-1">
                                {q.options.map((option, optIndex) => (
                                  <li key={optIndex} className={`${optIndex === q.correctAnswer ? 'font-bold text-green-600' : ''}`}>
                                    {String.fromCharCode(97 + optIndex)}) {option}
                                  </li>
                                ))}
                              </ul>
                              {q.explanation && (
                                <p className="mt-2 text-sm text-gray-600">
                                  <strong>Explanation:</strong> {q.explanation}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(index)}
                              className="ml-4"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import Questions</CardTitle>
                <CardDescription>
                  Paste your questions in the following format. Make the correct answer bold using **text** or &lt;b&gt;text&lt;/b&gt;:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg text-sm">
                  <strong>Example format:</strong><br />
                  1. What is the capital of France?<br />
                  a) London<br />
                  b) **Paris**<br />
                  c) Berlin<br />
                  d) Madrid<br />
                  <br />
                  2. Which planet is closest to the Sun?<br />
                  a) **Mercury**<br />
                  b) Venus<br />
                  c) Earth<br />
                  d) Mars
                </div>
                
                <div>
                  <Label htmlFor="bulkQuestions">Questions Text</Label>
                  <Textarea
                    id="bulkQuestions"
                    value={bulkQuestions}
                    onChange={(e) => setBulkQuestions(e.target.value)}
                    placeholder="Paste your questions here..."
                    className="min-h-[300px]"
                  />
                </div>
                
                <Button onClick={parseBulkQuestions} className="w-full">
                  Import Questions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <Button
            onClick={generateHTML}
            disabled={!examSettings.title || examSettings.questions.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate HTML Exam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
