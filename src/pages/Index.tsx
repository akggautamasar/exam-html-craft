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

    const dataStr = JSON.stringify(examData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${examData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_exam.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Success",
      description: "Exam exported successfully"
    });
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
                    Export Exam
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