import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Layers, 
  FileText, 
  BrainCircuit, 
  AlertCircle,
  Lightbulb,
  ChevronRight,
  ShieldCheck,
  Zap,
  Award
} from 'lucide-react';
import { 
  askAIStudyAssistant, 
  getStoredChatHistory, 
  saveChatHistory, 
  clearChatHistory, 
  generatePracticeQuiz, 
  runStudyTool 
} from '../services/aiStudyService';
import { getStoredSubjects } from '../services/subjectService';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AIStudyAssistant({ onOpenPDF }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('CY301');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'quiz' | 'tools'

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCount, setQuizCount] = useState(3);

  // Tools State
  const [toolInput, setToolInput] = useState('');
  const [toolType, setToolType] = useState('explain');
  const [toolResult, setToolResult] = useState('');
  const [toolLoading, setToolLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    setSubjects(getStoredSubjects());
    const initialHistory = getStoredChatHistory();

    if (initialHistory.length === 0) {
      const welcomeMsg = {
        id: 'msg-welcome',
        sender: 'ai',
        markdown: `### Welcome to IERT AI Study Assistant! 🤖

I am your dedicated academic assistant for **B.Tech Cyber Security Semester 3**.

#### I can help you with:
- 📖 Explaining complex concepts in **Operating Systems, Data Structures, Cyber Security, COA, Discrete Maths, and Ethics**.
- 💡 Generating practice quizzes and revision summaries.
- 📚 Referencing available **IERT HUB Notes and Study Materials**.

*Select your subject above and ask any academic question below to get started!*`,
        citations: [],
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
      saveChatHistory([welcomeMsg]);
    } else {
      setMessages(initialHistory);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Suggested Prompts
  const suggestions = [
    { text: "Explain Unit 1 of Operating Systems", sub: "CS303", unit: "1" },
    { text: "Important topics for CY301 Cyber Security", sub: "CY301", unit: "all" },
    { text: "Explain linked lists with an example", sub: "CS301", unit: "2" },
    { text: "Help me revise Computer Architecture", sub: "CS302", unit: "all" },
    { text: "What is the CIA Triad?", sub: "CY301", unit: "1" }
  ];

  const handleSendPrompt = async (customPrompt) => {
    const textToSend = customPrompt || inputQuery;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setLoading(true);
    setErrorMsg('');

    try {
      const aiResult = await askAIStudyAssistant({
        prompt: textToSend.trim(),
        subjectId: selectedSubjectId,
        unit: selectedUnit
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        markdown: aiResult.markdown,
        citations: aiResult.citations || [],
        subjectId: aiResult.subjectId,
        subjectName: aiResult.subjectName,
        hasMaterialMatch: aiResult.hasMaterialMatch,
        timestamp: aiResult.timestamp
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      setLoading(false);
    } catch (err) {
      console.error('AI error:', err);
      setLoading(false);
      setErrorMsg(err.message || 'The AI Assistant is currently unavailable. Please try again.');
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
    setMessages([]);
    setShowClearConfirm(false);
  };

  // Handle Practice Quiz Generation
  const handleStartQuiz = () => {
    const questions = generatePracticeQuiz({
      subjectId: selectedSubjectId,
      count: Number(quizCount)
    });
    setQuizQuestions(questions);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSelectQuizOption = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateQuizScore = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  // Handle Study Tool
  const handleRunTool = async (e) => {
    e.preventDefault();
    if (!toolInput.trim()) return;

    setToolLoading(true);
    setToolResult('');

    try {
      const result = await runStudyTool({
        toolType,
        input: toolInput,
        subjectId: selectedSubjectId
      });
      setToolResult(result);
      setToolLoading(false);
    } catch (err) {
      setToolLoading(false);
      setToolResult(`Error running tool: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BrainCircuit className="w-4 h-4 text-cyan-500" />
            <span>Academic AI Copilot</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            IERT AI Study Assistant
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ask academic questions, practice quizzes, and generate summaries for B.Tech Cyber Security Semester 3.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-200 dark:bg-slate-800 text-xs font-bold shrink-0 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('chat')}
            type="button"
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'chat' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Chat</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quiz');
              if (quizQuestions.length === 0) handleStartQuiz();
            }}
            type="button"
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'quiz' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Practice Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            type="button"
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tools' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Study Tools</span>
          </button>
        </div>
      </div>

      {/* Context Selectors */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          
          {/* Subject Context Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Subject Context:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
            >
              <option value="CS301">CS301 — Data Structures & Algorithms</option>
              <option value="CS302">CS302 — Computer Architecture</option>
              <option value="CS303">CS303 — Operating Systems</option>
              <option value="CY301">CY301 — Cyber Security Fundamentals</option>
              <option value="MA301">MA301 — Discrete Mathematics</option>
              <option value="HU301">HU301 — Technical Comm & Ethics</option>
            </select>
          </div>

          {/* Unit Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Unit Context:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
            >
              <option value="all">All Units</option>
              <option value="1">Unit 1</option>
              <option value="2">Unit 2</option>
              <option value="3">Unit 3</option>
              <option value="4">Unit 4</option>
              <option value="5">Unit 5</option>
            </select>
          </div>

        </div>
      </div>

      {/* TAB 1: AI CHAT INTERFACE */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          
          {/* Suggested Prompts Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Suggested Academic Prompts:</span>
            <div className="flex flex-wrap items-center gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSubjectId(s.sub);
                    setSelectedUnit(s.unit);
                    handleSendPrompt(s.text);
                  }}
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/10 hover:text-cyan-500 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-xl flex flex-col h-[520px]">
            
            {/* Chat Top Action Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Active Session • {selectedSubjectId}</span>
              </div>

              {messages.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  type="button"
                  className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Chat</span>
                </button>
              )}
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                  }`}>
                    {msg.sender === 'user' ? 'ME' : <Bot className="w-5 h-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-3 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-none'
                  }`}>
                    
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-invert prose-xs max-w-none space-y-2 leading-relaxed">
                        
                        {/* Markdown / Formatted AI Text */}
                        <div className="whitespace-pre-wrap font-sans space-y-2">
                          {msg.markdown}
                        </div>

                        {/* Citation Badge if matching materials exist */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-700/60 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Cited IERT HUB Academic Material:</span>
                            </span>

                            <div className="space-y-1.5">
                              {msg.citations.map(c => (
                                <div key={c.id} className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
                                  <span className="font-bold text-cyan-300 truncate">{c.title} ({c.type})</span>
                                  {onOpenPDF && (
                                    <button
                                      onClick={() => onOpenPDF(c)}
                                      type="button"
                                      className="text-[10px] font-bold text-white bg-cyan-600 hover:bg-cyan-500 px-2 py-0.5 rounded cursor-pointer shrink-0"
                                    >
                                      View PDF
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Disclaimer */}
                        <div className="pt-2 text-[10px] text-slate-400 italic border-t border-slate-200/20 dark:border-slate-700/40 flex items-center justify-between">
                          <span>{msg.hasMaterialMatch ? "📚 Response integrated with IERT HUB metadata" : "🌐 Academic General Knowledge Response"}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                      </div>
                    )}

                  </div>

                </div>
              ))}

              {/* Loading Pulse State */}
              {loading && (
                <div className="flex gap-3 max-w-3xl">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="rounded-2xl p-4 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 space-y-2 flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing academic subject context & formulating structured response...</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask a question about ${selectedSubjectId} ${selectedUnit !== 'all' ? `Unit ${selectedUnit}` : ''}...`}
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* TAB 2: PRACTICE QUIZ MODE */}
      {activeTab === 'quiz' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span>Practice Quiz — {selectedSubjectId}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Test your knowledge with multiple-choice questions for B.Tech Cyber Security Semester 3.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={quizCount}
                onChange={(e) => setQuizCount(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="3">3 Questions</option>
                <option value="5">5 Questions</option>
              </select>

              <button
                onClick={handleStartQuiz}
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate New Quiz</span>
              </button>
            </div>
          </div>

          {quizQuestions.length > 0 ? (
            <div className="space-y-6">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {idx + 1}. {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      
                      let btnClass = "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                      if (quizSubmitted) {
                        if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                        else if (isSelected && !isCorrect) btnClass = "bg-rose-500/20 border-rose-500 text-rose-400";
                      } else if (isSelected) {
                        btnClass = "bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectQuizOption(q.id, optIdx)}
                          type="button"
                          className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-cyan-400 block">Explanation:</span>
                      <p className="text-slate-400">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    type="button"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg cursor-pointer"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-between w-full">
                    <span>Quiz Complete! Score: {calculateQuizScore()} / {quizQuestions.length} ({Math.round((calculateQuizScore() / quizQuestions.length) * 100)}%)</span>
                    <button
                      onClick={handleStartQuiz}
                      type="button"
                      className="px-4 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">Generating quiz questions for {selectedSubjectId}...</p>
          )}
        </div>
      )}

      {/* TAB 3: STUDY TOOLS */}
      {activeTab === 'tools' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-500" />
              <span>Quick Study Tools</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simplify complex topics, summarize lecture notes, or generate quick exam revision checklists.
            </p>
          </div>

          <form onSubmit={handleRunTool} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setToolType('explain')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  toolType === 'explain' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                💡 Explain Simply
              </button>

              <button
                type="button"
                onClick={() => setToolType('summarize')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  toolType === 'summarize' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                📝 Summarize Topic
              </button>

              <button
                type="button"
                onClick={() => setToolType('revision')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  toolType === 'revision' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                ⚡ Revision Points
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enter Academic Topic / Text *</label>
              <textarea
                rows="4"
                required
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                placeholder="e.g. Banker's Algorithm, AES Encryption, Data Structure Time Complexities..."
                className="w-full px-4 py-3 text-xs rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={toolLoading || !toolInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {toolLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Process Academic Tool</span>
            </button>
          </form>

          {toolResult && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white space-y-3 animate-fade-in">
              <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap">
                {toolResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clear Chat Confirmation Modal */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear AI Chat History"
        message="Are you sure you want to clear your local AI study assistant message history?"
        onConfirm={handleClearChat}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
}
