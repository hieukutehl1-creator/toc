/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Image as ImageIcon, 
  Headphones, 
  FileText,
  RotateCcw,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TOTAL_QUESTIONS = 30;
const INITIAL_TIME = 60 * 60; // 60 minutes

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('tocfl_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('tocfl_notes') || '';
  });
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync answers to localStorage
  useEffect(() => {
    localStorage.setItem('tocfl_answers', JSON.stringify(answers));
  }, [answers]);

  // Sync notes to localStorage
  useEffect(() => {
    localStorage.setItem('tocfl_notes', notes);
  }, [notes]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const handleAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: option }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrls(prev => ({ ...prev, [currentQuestion]: url }));
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrls(prev => ({ ...prev, [currentQuestion]: url }));
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
  };

  const resetPractice = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ kết quả và làm lại từ đầu?')) {
      setAnswers({});
      setNotes('');
      setTimeLeft(INITIAL_TIME);
      if (editorRef.current) editorRef.current.innerHTML = '';
      localStorage.removeItem('tocfl_answers');
      localStorage.removeItem('tocfl_notes');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden font-sans text-[#1F2937]">
      {/* Left Panel: Practice Area */}
      <main className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 bg-white">
        {/* Header */}
        <header className="h-16 border-bottom border-gray-100 flex items-center justify-between px-8 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">TOCFL Practice <span className="text-emerald-600 font-medium">Band B1</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-lg font-semibold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-700'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={resetPractice}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </header>

        {/* Question Grid */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-4xl mx-auto">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`
                  w-8 h-8 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center
                  ${currentQuestion === i 
                    ? 'bg-emerald-600 text-white shadow-lg scale-110 z-10' 
                    : answers[i] 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-white text-gray-400 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600'}
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="text-3xl font-serif italic text-gray-900">Câu {currentQuestion + 1}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {answers[currentQuestion] ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Đã trả lời: {answers[currentQuestion]}
                      </span>
                    ) : (
                      <span>Chưa trả lời</span>
                    )}
                  </div>
                </div>

                {/* Media Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group relative overflow-hidden">
                      {imageUrls[currentQuestion] ? (
                        <img 
                          src={imageUrls[currentQuestion]} 
                          alt="Preview" 
                          className="w-full h-full object-contain p-2"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-emerald-600">
                          <ImageIcon className="w-10 h-10" />
                          <span className="text-sm font-medium">Tải ảnh lên</span>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group relative overflow-hidden">
                      {audioUrls[currentQuestion] ? (
                        <div className="w-full p-4 flex flex-col items-center gap-4">
                          <Headphones className="w-10 h-10 text-emerald-600" />
                          <audio 
                            src={audioUrls[currentQuestion]} 
                            controls 
                            className="w-full h-10"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-emerald-600">
                          <Headphones className="w-10 h-10" />
                          <span className="text-sm font-medium">Tải âm thanh lên</span>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAudioUpload} accept="audio/*" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-4 pt-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Chọn đáp án</p>
                  <div className="grid grid-cols-4 gap-4">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className={`
                          py-6 rounded-xl text-2xl font-bold transition-all duration-200 border-2
                          ${answers[currentQuestion] === opt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'}
                        `}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="h-20 border-t border-gray-200 px-8 flex items-center justify-between bg-white">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại
          </button>
          
          <div className="text-sm font-medium text-gray-400">
            Tiến độ: {Object.keys(answers).length} / {TOTAL_QUESTIONS}
          </div>

          <button
            onClick={() => setCurrentQuestion(prev => Math.min(TOTAL_QUESTIONS - 1, prev + 1))}
            disabled={currentQuestion === TOTAL_QUESTIONS - 1}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-md hover:shadow-lg"
          >
            Tiếp tục
            <ChevronRight className="w-5 h-5" />
          </button>
        </footer>
      </main>

      {/* Right Panel: Notes Area */}
      <aside className="w-80 flex flex-col bg-white shadow-2xl z-20">
        <div className="h-16 border-b border-gray-100 flex items-center px-6 bg-gray-50/50">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Ghi chú cá nhân
          </h2>
        </div>
        
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white">
          <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
          <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
          <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Underline"><Underline className="w-4 h-4" /></button>
          <div className="flex-1" />
          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Đã lưu tự động">
            <Save className="w-4 h-4" />
          </button>
        </div>

        <div 
          ref={editorRef}
          contentEditable
          onInput={(e) => setNotes(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: notes }}
          className="flex-1 p-6 editor-content overflow-y-auto text-sm leading-relaxed text-gray-600 font-sans"
          placeholder="Nhập ghi chú tại đây..."
        />
        
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold text-center">
            Tự động lưu vào trình duyệt
          </p>
        </div>
      </aside>
    </div>
  );
}
