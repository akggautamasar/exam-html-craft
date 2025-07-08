
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Plus, Trash2, Eye, FileText, Settings, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  imageUrl?: string;
}

interface ExamData {
  title: string;
  duration: number;
  instructions: string;
  passingScore: number;
  questions: Question[];
}

const Index = () => {
  const [examData, setExamData] = useState<ExamData>({
    title: '',
    duration: 60,
    instructions: '',
    passingScore: 50,
    questions: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
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

  const generateHTML = () => {
    if (!examData.title || examData.questions.length === 0) {
      toast.error('Please fill in exam title and add at least one question');
      return;
    }

    const questionsHTML = examData.questions.map((q, index) => `
        {
            question: \`${q.text.replace(/`/g, '\\`')}\`,
            options: [${q.options.map(opt => `\`${opt.replace(/`/g, '\\`')}\``).join(', ')}],
            correct: ${q.correctAnswer},
            explanation: \`${q.explanation.replace(/`/g, '\\`')}\`,
            ${q.imageUrl ? `image: \`${q.imageUrl}\`,` : ''}
            visited: false,
            answered: false,
            marked: false,
            selectedOption: null
        }`).join(',\n        ');

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
            --primary-color: #4285f4;
            --accent-color: #34a853;
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

        /* Add all the remaining CSS from your template here */
        /* ... (continuing with all the other styles from your template) ... */
    </style>
</head>
<body>
    <div class="app-header">
        <h1 class="app-name">EXAM PORTAL</h1>
        <div class="app-divider"></div>
        <h2 class="exam-title">${examData.title}</h2>
    </div>

    <div class="start-screen" id="startScreen">
        <div class="exam-info">
            <div class="exam-info-item">
                <strong>Total Questions:</strong> ${examData.questions.length}
            </div>
            <div class="exam-info-item">
                <strong>Duration:</strong> ${examData.duration} minutes
            </div>
            <div class="exam-info-item">
                <strong>Passing Score:</strong> ${examData.passingScore}%
            </div>
            <div class="exam-info-item">
                <strong>Instructions:</strong> ${examData.instructions}
            </div>
        </div>
        <button class="btn" onclick="startExam()">Start Exam</button>
    </div>

    <script>
        const questions = [
        ${questionsHTML}
        ];

        let currentQuestion = 0;
        let timeLeft = ${examData.duration * 60};
        let examStarted = false;
        let timerInterval;

        function startExam() {
            document.getElementById('startScreen').style.display = 'none';
            // Add exam functionality here
            examStarted = true;
            console.log('Exam started with', questions.length, 'questions');
        }

        // Add all your exam functionality JavaScript here
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

    toast.success('HTML file generated and downloaded successfully!');
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
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={examData.instructions}
                onChange={(e) => setExamData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Enter exam instructions for students"
                rows={4}
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Questions ({examData.questions.length})</h3>
              <Button onClick={addQuestion} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>
            
            {examData.questions.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                <Button onClick={addQuestion} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Question
                </Button>
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
              <h1 className="text-2xl font-bold text-gray-900">HTML Exam Generator</h1>
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
              { step: 1, title: 'Exam Details', icon: Settings },
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
                  Exam Configuration
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
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">EXAM PORTAL</h1>
                  <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-green-600 mx-auto mb-4"></div>
                  <h2 className="text-xl text-green-600 font-semibold">{examData.title}</h2>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Total Questions:</strong> {examData.questions.length}</div>
                    <div><strong>Duration:</strong> {examData.duration} minutes</div>
                    <div><strong>Passing Score:</strong> {examData.passingScore}%</div>
                    <div className="col-span-2"><strong>Instructions:</strong> {examData.instructions || 'No instructions provided'}</div>
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
                                  ? 'bg-green-100 border-green-500 text-green-700' 
                                  : 'border-gray-300'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className={question.correctAnswer === optIndex ? 'text-green-700 font-medium' : ''}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
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
