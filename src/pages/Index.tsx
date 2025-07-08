import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Question {
  text: string;
  options: string[];
  correct: number;
  explanation?: string;
  explanationImage?: string;
}

interface ExamSettings {
  title: string;
  timeLimit: number;
  showTimer: boolean;
}

export default function Index() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correct: 2,
    },
  ]);
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    title: "Sample Exam",
    timeLimit: 60,
    showTimer: true,
  });
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");
  const [newExplanationImage, setNewExplanationImage] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      text: newQuestionText,
      options: newOptions,
      correct: newCorrectAnswer,
      explanation: newExplanation,
      explanationImage: newExplanationImage,
    };
    setQuestions([...questions, newQuestion]);
    setNewQuestionText("");
    setNewOptions(["", "", "", ""]);
    setNewCorrectAnswer(0);
    setNewExplanation("");
    setNewExplanationImage("");
  };

  const handleSettingsChange = (
    key: keyof ExamSettings,
    value: string | number | boolean
  ) => {
    setExamSettings({ ...examSettings, [key]: value });
  };

  const generateHTML = () => {
    const cssCode = `
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        color: #333;
      }
      .instructions, #exam-container, #results {
        width: 80%;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .instructions h1 {
        text-align: center;
        color: #0056b3;
      }
      .instructions-content {
        margin-top: 20px;
      }
      .instructions ul {
        list-style-type: disc;
        padding-left: 20px;
      }
      .start-btn {
        display: block;
        margin: 20px auto;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      }
      .start-btn:hover {
        background-color: #0056b3;
      }
      .timer-container {
        text-align: center;
        margin-bottom: 20px;
      }
      .timer {
        font-size: 1.2em;
        color: #d9534f;
      }
      .exam-header {
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
        margin-bottom: 20px;
      }
      .exam-content {
        display: flex;
        gap: 20px;
      }
      .question-section {
        flex: 3;
      }
      .question {
        font-size: 1.1em;
        margin-bottom: 15px;
      }
      .options {
        margin-bottom: 20px;
      }
      .option {
        margin-bottom: 10px;
      }
      .option input[type="radio"] {
        margin-right: 5px;
      }
      .navigation {
        text-align: center;
      }
      .navigation button {
        padding: 8px 16px;
        margin: 0 5px;
        cursor: pointer;
        border: none;
        background-color: #5bc0de;
        color: white;
        border-radius: 5px;
      }
      .navigation button:disabled {
        background-color: #9acfea;
        cursor: not-allowed;
      }
      .question-palette-container {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      .question-palette {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 10px;
      }
      .palette-btn {
        padding: 5px 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
        cursor: pointer;
        background-color: #eee;
      }
      .palette-btn.current {
        background-color: #007bff;
        color: white;
      }
      .palette-btn.answered {
        background-color: #5cb85c;
        color: white;
      }
      .palette-btn.marked {
        background-color: #f0ad4e;
        color: white;
      }
      .palette-legend {
        display: flex;
        justify-content: space-around;
        font-size: 0.8em;
      }
      .palette-legend div {
        display: flex;
        align-items: center;
      }
      .legend-box {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 3px;
        border-radius: 2px;
      }
      .legend-box.answered {
        background-color: #5cb85c;
      }
      .legend-box.marked {
        background-color: #f0ad4e;
      }
      .legend-box.current {
        background-color: #007bff;
      }
      #results .results-container {
        text-align: center;
      }
      #results .score-summary {
        margin-bottom: 20px;
      }
      #results .detailed-results {
        text-align: left;
      }
      #results .result-item {
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      #results .result-item.correct {
        background-color: #dff0d8;
      }
      #results .result-item.incorrect {
        background-color: #f2dede;
      }
      .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.8);
      }
      .modal-content {
        margin: auto;
        display: block;
        max-width: 80%;
        max-height: 80%;
      }
      .close {
        position: absolute;
        top: 15px;
        right: 35px;
        color: #f1f1f1;
        font-size: 40px;
        font-weight: bold;
        transition: 0.3s;
        cursor: pointer;
      }
      .close:hover,
      .close:focus {
        color: #bbb;
        text-decoration: none;
        cursor: pointer;
      }
    `;

    const jsCode = `
      let currentQuestion = 0;
      let userAnswers = {};
      let markedForReview = new Set();
      let timeRemaining = ${examSettings.timeLimit * 60};
      let examStarted = false;
      let timerInterval;

      function startExam() {
        examStarted = true;
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('exam-container').style.display = 'block';
        
        if (${examSettings.showTimer}) {
          startTimer();
        }
        
        showQuestion(0);
        updateQuestionPalette();
      }

      function startTimer() {
        timerInterval = setInterval(() => {
          if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
          } else {
            submitExam();
          }
        }, 1000);
      }

      function updateTimerDisplay() {
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('timer').textContent = 
          \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
      }

      function showQuestion(index) {
        currentQuestion = index;
        const question = questions[index];
        
        document.getElementById('question-text').innerHTML = question.text;
        
        const optionsHtml = question.options.map((option, i) => \`
          <div class="option">
            <input type="radio" id="q\${index}_opt\${i}" name="q\${index}" value="\${i}" 
                   onchange="selectAnswer(\${index}, \${i})" 
                   \${userAnswers[index] === i ? 'checked' : ''}>
            <label for="q\${index}_opt\${i}">\${option}</label>
          </div>
        \`).join('');
        
        document.getElementById('options').innerHTML = optionsHtml;
        
        document.getElementById('question-counter').textContent = \`Question \${index + 1} of \${questions.length}\`;
        
        document.getElementById('prev-btn').disabled = index === 0;
        document.getElementById('next-btn').textContent = index === questions.length - 1 ? 'Submit' : 'Next';
        
        document.getElementById('mark-review-btn').textContent = 
          markedForReview.has(index) ? 'Unmark for Review' : 'Mark for Review';
        
        updateQuestionPalette();
      }

      function selectAnswer(questionIndex, optionIndex) {
        userAnswers[questionIndex] = optionIndex;
        updateQuestionPalette();
      }

      function markForReview() {
        if (markedForReview.has(currentQuestion)) {
          markedForReview.delete(currentQuestion);
        } else {
          markedForReview.add(currentQuestion);
        }
        showQuestion(currentQuestion);
      }

      function nextQuestion() {
        if (currentQuestion < questions.length - 1) {
          showQuestion(currentQuestion + 1);
        } else {
          submitExam();
        }
      }

      function prevQuestion() {
        if (currentQuestion > 0) {
          showQuestion(currentQuestion - 1);
        }
      }

      function jumpToQuestion(index) {
        showQuestion(index);
      }

      function updateQuestionPalette() {
        const palette = document.getElementById('question-palette');
        palette.innerHTML = '';
        
        questions.forEach((_, index) => {
          const btn = document.createElement('button');
          btn.textContent = index + 1;
          btn.onclick = () => jumpToQuestion(index);
          
          btn.className = 'palette-btn';
          if (index === currentQuestion) btn.className += ' current';
          if (userAnswers.hasOwnProperty(index)) btn.className += ' answered';
          if (markedForReview.has(index)) btn.className += ' marked';
          
          palette.appendChild(btn);
        });
      }

      function submitExam() {
        if (timerInterval) clearInterval(timerInterval);
        
        let score = 0;
        questions.forEach((q, index) => {
          if (userAnswers[index] === q.correct) score++;
        });
        
        document.getElementById('exam-container').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('score').textContent = \`\${score}/\${questions.length}\`;
        document.getElementById('percentage').textContent = \`\${Math.round(score/questions.length*100)}%\`;
        
        showDetailedResults();
      }

      function showDetailedResults() {
        const resultsHtml = questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === q.correct;
          
          return \`
            <div class="result-item \${isCorrect ? 'correct' : 'incorrect'}">
              <h4>Question \${index + 1}</h4>
              <p><strong>Question:</strong> \${q.text}</p>
              <p><strong>Your Answer:</strong> \${userAnswer !== undefined ? q.options[userAnswer] : 'Not answered'}</p>
              <p><strong>Correct Answer:</strong> \${q.options[q.correct]}</p>
              \${q.explanation ? \`<p><strong>Explanation:</strong> \${q.explanation}</p>\` : ''}
              \${q.explanationImage ? \`<img src="\${q.explanationImage}" alt="Explanation" class="explanation-image" onclick="zoomImage('\${q.explanationImage}')">\` : ''}
            </div>
          \`;
        }).join('');
        
        document.getElementById('detailed-results').innerHTML = resultsHtml;
      }

      function zoomImage(src) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        modal.style.display = 'block';
        modalImg.src = src;
      }

      function closeImageModal() {
        document.getElementById('image-modal').style.display = 'none';
      }

      // Initialize
      window.onload = function() {
        updateTimerDisplay();
      };
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${examSettings.title}</title>
        <style>${cssCode}</style>
      </head>
      <body>
        <div id="instructions" class="instructions">
          <h1>${examSettings.title}</h1>
          <div class="instructions-content">
            <h2>Instructions:</h2>
            <ul>
              <li>Read each question carefully before selecting your answer</li>
              <li>You can navigate between questions using the Next/Previous buttons</li>
              <li>Use the question palette to jump to any question directly</li>
              <li>You can mark questions for review and return to them later</li>
              ${examSettings.showTimer ? `<li>Time limit: ${examSettings.timeLimit} minutes</li>` : ''}
              <li>Click Submit when you're ready to finish the exam</li>
            </ul>
          </div>
          <button onclick="startExam()" class="start-btn">Start Test</button>
        </div>

        <div id="exam-container" style="display: none;">
          ${examSettings.showTimer ? `
            <div class="timer-container">
              <div class="timer">Time Remaining: <span id="timer">00:00:00</span></div>
            </div>
          ` : ''}
          
          <div class="exam-header">
            <h1>${examSettings.title}</h1>
            <div id="question-counter">Question 1 of ${questions.length}</div>
          </div>

          <div class="exam-content">
            <div class="question-section">
              <div id="question-text" class="question"></div>
              <div id="options" class="options"></div>
              
              <div class="navigation">
                <button id="prev-btn" onclick="prevQuestion()">Previous</button>
                <button id="mark-review-btn" onclick="markForReview()">Mark for Review</button>
                <button id="next-btn" onclick="nextQuestion()">Next</button>
              </div>
            </div>

            <div class="question-palette-container">
              <h3>Question Palette</h3>
              <div id="question-palette" class="question-palette"></div>
              <div class="palette-legend">
                <div><span class="legend-box answered"></span> Answered</div>
                <div><span class="legend-box marked"></span> Marked for Review</div>
                <div><span class="legend-box current"></span> Current</div>
              </div>
            </div>
          </div>
        </div>

        <div id="results" style="display: none;">
          <div class="results-container">
            <h1>Exam Results</h1>
            <div class="score-summary">
              <h2>Your Score: <span id="score"></span></h2>
              <h3>Percentage: <span id="percentage"></span></h3>
            </div>
            <div id="detailed-results" class="detailed-results"></div>
          </div>
        </div>

        <div id="image-modal" class="modal" onclick="closeImageModal()">
          <span class="close">&times;</span>
          <img id="modal-image" class="modal-content">
        </div>

        <script>
          const questions = ${JSON.stringify(questions)};
          ${jsCode}
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${examSettings.title.replace(/\s+/g, "_").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exam Generator</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Exam Settings</CardTitle>
          <CardDescription>Configure the exam settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={examSettings.title}
              onChange={(e) => handleSettingsChange("title", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              type="number"
              id="timeLimit"
              value={examSettings.timeLimit}
              onChange={(e) =>
                handleSettingsChange("timeLimit", Number(e.target.value))
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showTimer"
              checked={examSettings.showTimer}
              onChange={(e) => handleSettingsChange("showTimer", e.target.checked)}
            />
            <Label htmlFor="showTimer">Show Timer</Label>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
          <CardDescription>Add questions to the exam.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="question">Question Text</Label>
            <Textarea
              id="question"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {newOptions.map((option, index) => (
              <div className="grid gap-2" key={index}>
                <Label htmlFor={`option${index}`}>Option {index + 1}</Label>
                <Input
                  type="text"
                  id={`option${index}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <select
              id="correctAnswer"
              className="border rounded px-2 py-1"
              value={newCorrectAnswer}
              onChange={(e) => setNewCorrectAnswer(Number(e.target.value))}
            >
              {newOptions.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="explanationImage">Explanation Image URL</Label>
            <Input
              type="text"
              id="explanationImage"
              value={newExplanationImage}
              onChange={(e) => setNewExplanationImage(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={addQuestion}>Add Question</Button>
        </CardFooter>
      </Card>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Questions</h2>
        {questions.map((question, index) => (
          <Card key={index} className="mb-2">
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{question.text}</p>
              <ul>
                {question.options.map((option, i) => (
                  <li key={i}>
                    {option} {i === question.correct ? "(Correct)" : ""}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={generateHTML}>Generate HTML</Button>
    </div>
  );
}
