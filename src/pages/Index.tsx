import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Download } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });
  const [bulkInput, setBulkInput] = useState('');

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error("Please fill in all options");
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      ...currentQuestion
    };
    
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    
    toast.success("Question added successfully!");
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success("Question deleted successfully!");
  };

  const updateCurrentQuestion = (field: string, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseBulkQuestions = () => {
    if (!bulkInput.trim()) {
      toast.error("Please enter questions to import");
      return;
    }

    try {
      const questionBlocks = bulkInput.split('---').filter(block => block.trim());
      const parsedQuestions: Question[] = [];

      questionBlocks.forEach(block => {
        const lines = block.trim().split('\n').filter(line => line.trim());
        
        if (lines.length < 6) return; // Skip incomplete questions
        
        // Extract question (first line after number)
        const questionLine = lines[0];
        const questionMatch = questionLine.match(/^\d+\.\s*(.+)$/);
        if (!questionMatch) return;
        
        const question = questionMatch[1];
        const options: string[] = [];
        let correctAnswer = 0;
        let explanation = '';
        
        // Parse options and find correct answer
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.match(/^[a-d]\)/)) {
            const optionText = line.substring(2).trim();
            // Check if this option is bold (correct answer)
            if (line.includes('**') || optionText.startsWith('**')) {
              correctAnswer = options.length;
              options.push(optionText.replace(/\*\*/g, ''));
            } else {
              options.push(optionText);
            }
          } else if (line.startsWith('👉 Explanation:')) {
            explanation = line.substring('👉 Explanation:'.length).trim();
          }
        }
        
        if (options.length === 4) {
          parsedQuestions.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            question,
            options,
            correctAnswer,
            explanation
          });
        }
      });

      if (parsedQuestions.length > 0) {
        setQuestions(prev => [...prev, ...parsedQuestions]);
        setBulkInput('');
        toast.success(`${parsedQuestions.length} questions imported successfully!`);
      } else {
        toast.error("No valid questions found. Please check the format.");
      }
    } catch (error) {
      console.error('Error parsing bulk questions:', error);
      toast.error("Error parsing questions. Please check the format.");
    }
  };

  const generateHTML = () => {
    if (questions.length === 0) {
      toast.error("Please add some questions first");
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .question-container {
            display: none;
            margin-bottom: 20px;
        }
        .question-container.active {
            display: block;
        }
        .question {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .options {
            margin-bottom: 20px;
        }
        .option {
            display: block;
            margin: 10px 0;
            padding: 10px;
            background-color: #fff;
            border: 2px solid #ddd;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .option:hover {
            background-color: #e9ecef;
            border-color: #007bff;
        }
        .option.selected {
            background-color: #007bff;
            color: white;
            border-color: #007bff;
        }
        .btn {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .navigation {
            text-align: center;
            margin: 20px 0;
        }
        .progress {
            width: 100%;
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .progress-bar {
            height: 100%;
            background-color: #28a745;
            transition: width 0.3s;
        }
        .results {
            display: none;
            text-align: center;
        }
        .score {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .explanation {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            text-align: left;
        }
        .start-screen {
            text-align: center;
        }
        .question-counter {
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Quiz Application</h1>
        </div>
        
        <div id="startScreen" class="start-screen">
            <h2>Welcome to the Quiz!</h2>
            <p>You have ${questions.length} questions to answer.</p>
            <button class="btn" onclick="startExam()">Start Test</button>
        </div>

        <div id="examArea" style="display: none;">
            <div class="progress">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            
            <div class="question-counter">
                <span id="currentQuestionNum">1</span> of <span id="totalQuestions">${questions.length}</span>
            </div>

            ${questions.map((q, index) => `
            <div class="question-container" id="question${index}">
                <div class="question">${q.question}</div>
                <div class="options">
                    ${q.options.map((option, optIndex) => `
                    <label class="option" onclick="selectOption(${index}, ${optIndex})">
                        <input type="radio" name="question${index}" value="${optIndex}" style="display: none;">
                        ${String.fromCharCode(97 + optIndex)}) ${option}
                    </label>
                    `).join('')}
                </div>
                <div class="explanation" id="explanation${index}" style="display: none;">
                    <strong>Explanation:</strong> ${q.explanation}
                </div>
            </div>
            `).join('')}

            <div class="navigation">
                <button class="btn" id="prevBtn" onclick="previousQuestion()" disabled>Previous</button>
                <button class="btn" id="nextBtn" onclick="nextQuestion()">Next</button>
                <button class="btn" id="submitBtn" onclick="submitExam()" style="display: none;">Submit</button>
            </div>
        </div>

        <div id="results" class="results">
            <h2>Quiz Results</h2>
            <div class="score" id="scoreDisplay"></div>
            <button class="btn" onclick="restartExam()">Restart Quiz</button>
        </div>
    </div>

    <script>
        // Questions data
        const questions = ${JSON.stringify(questions)};
        
        let currentQuestionIndex = 0;
        let userAnswers = [];
        let examStarted = false;

        function startExam() {
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('examArea').style.display = 'block';
            examStarted = true;
            showQuestion(0);
            updateProgress();
        }

        function showQuestion(index) {
            // Hide all questions
            document.querySelectorAll('.question-container').forEach(q => {
                q.classList.remove('active');
            });
            
            // Show current question
            document.getElementById('question' + index).classList.add('active');
            
            // Update question counter
            document.getElementById('currentQuestionNum').textContent = index + 1;
            
            // Update navigation buttons
            document.getElementById('prevBtn').disabled = index === 0;
            document.getElementById('nextBtn').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
            document.getElementById('submitBtn').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
            
            currentQuestionIndex = index;
            updateProgress();
        }

        function selectOption(questionIndex, optionIndex) {
            userAnswers[questionIndex] = optionIndex;
            
            // Update visual selection
            const options = document.querySelectorAll(\`input[name="question\${questionIndex}"]\`);
            options.forEach((option, index) => {
                option.parentElement.classList.toggle('selected', index === optionIndex);
            });
        }

        function nextQuestion() {
            if (currentQuestionIndex < questions.length - 1) {
                showQuestion(currentQuestionIndex + 1);
            }
        }

        function previousQuestion() {
            if (currentQuestionIndex > 0) {
                showQuestion(currentQuestionIndex - 1);
            }
        }

        function updateProgress() {
            const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }

        function submitExam() {
            // Calculate score
            let correctAnswers = 0;
            for (let i = 0; i < questions.length; i++) {
                if (userAnswers[i] === questions[i].correctAnswer) {
                    correctAnswers++;
                }
            }
            
            const percentage = Math.round((correctAnswers / questions.length) * 100);
            
            // Show results
            document.getElementById('examArea').style.display = 'none';
            document.getElementById('results').style.display = 'block';
            document.getElementById('scoreDisplay').innerHTML = 
                \`You scored \${correctAnswers} out of \${questions.length} (\${percentage}%)\`;
            
            // Show explanations for all questions
            questions.forEach((question, index) => {
                const explanationDiv = document.getElementById('explanation' + index);
                if (explanationDiv) {
                    explanationDiv.style.display = 'block';
                }
            });
        }

        function restartExam() {
            currentQuestionIndex = 0;
            userAnswers = [];
            examStarted = false;
            
            // Reset UI
            document.getElementById('results').style.display = 'none';
            document.getElementById('startScreen').style.display = 'block';
            
            // Clear selections
            document.querySelectorAll('.option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Hide explanations
            document.querySelectorAll('.explanation').forEach(exp => {
                exp.style.display = 'none';
            });
        }
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz.html';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("HTML file generated and downloaded successfully!");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Quiz Generator</h1>
      
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Add Question Manually</CardTitle>
              <CardDescription>Create questions one by one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your question here..."
                  value={currentQuestion.question}
                  onChange={(e) => updateCurrentQuestion('question', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <div key={index}>
                    <Label htmlFor={`option${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                    <Input
                      id={`option${index}`}
                      placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[index] = e.target.value;
                        updateCurrentQuestion('options', newOptions);
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <Label htmlFor="correct">Correct Answer</Label>
                <select
                  id="correct"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => updateCurrentQuestion('correctAnswer', parseInt(e.target.value))}
                >
                  {currentQuestion.options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {String.fromCharCode(65 + index)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain why this is the correct answer..."
                  value={currentQuestion.explanation}
                  onChange={(e) => updateCurrentQuestion('explanation', e.target.value)}
                />
              </div>
              
              <Button onClick={addQuestion} className="w-full">
                Add Question
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import Questions</CardTitle>
              <CardDescription>
                Import multiple questions using the specified format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulkInput">Paste Questions</Label>
                <Textarea
                  id="bulkInput"
                  placeholder="Paste your questions here in the specified format..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
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
      
      {questions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Questions ({questions.length})
              <Button onClick={generateHTML} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Generate HTML
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Q{index + 1}: {question.question}</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          optIndex === question.correctAnswer
                            ? 'bg-green-100 border-green-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}) {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
