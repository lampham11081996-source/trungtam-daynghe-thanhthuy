import { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, XCircle, AlertTriangle, HelpCircle, ArrowLeft, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { Question } from '../types';

interface ExamEngineProps {
  questions: Question[];
}

export default function ExamEngine({ questions }: ExamEngineProps) {
  const [selectedClass, setSelectedClass] = useState<'B1' | 'B2' | 'C' | 'D' | null>(null);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOption }
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [results, setResults] = useState<{
    score: number;
    total: number;
    passed: boolean;
    hasCriticalError: boolean;
    criticalFailures: Question[];
    wrongAnswers: { question: Question; selected: string; correct: string }[];
  } | null>(null);

  // Constants based on Vietnamese transport regulations
  const examConfig = {
    B1: { total: 30, duration: 20 * 60, passing: 27 },
    B2: { total: 35, duration: 22 * 60, passing: 32 },
    C: { total: 40, duration: 24 * 60, passing: 36 },
    D: { total: 40, duration: 24 * 60, passing: 38 }
  };

  // Generate dynamic random exam set
  const generateExam = (licenseClass: 'B1' | 'B2' | 'C' | 'D') => {
    const config = examConfig[licenseClass];
    // Filter questions applicable to this license class
    const pool = questions.filter(q => q.licenseClasses.includes(licenseClass));

    if (pool.length === 0) {
      alert("Hệ thống chưa có câu hỏi nào áp dụng cho hạng này. Vui lòng đăng nhập trang quản trị để thêm câu hỏi hoặc import từ Excel!");
      return;
    }

    // Sort to ensure we always include 1-3 critical questions if they exist in pool
    const criticals = pool.filter(q => q.critical);
    const normals = pool.filter(q => !q.critical);

    // Shuffle helper
    const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

    const shuffledCriticals = shuffle(criticals);
    const shuffledNormals = shuffle(normals);

    // Real exam usually has 2-4 critical questions
    const criticalCount = Math.min(shuffledCriticals.length, 3);
    const selectedCriticals = shuffledCriticals.slice(0, criticalCount);
    
    const normalCountNeeded = config.total - selectedCriticals.length;
    const selectedNormals = shuffledNormals.slice(0, Math.min(shuffledNormals.length, normalCountNeeded));

    const finalExamSet = shuffle([...selectedCriticals, ...selectedNormals]);
    
    setExamQuestions(finalExamSet);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(config.duration);
    setExamStarted(true);
    setExamFinished(false);
    setResults(null);
  };

  // Timer loop
  useEffect(() => {
    if (!examStarted || examFinished || timeLeft <= 0) {
      if (timeLeft === 0 && examStarted && !examFinished) {
        submitExam();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished, timeLeft]);

  const handleSelectOption = (questionId: string, optionLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const submitExam = () => {
    if (!selectedClass) return;
    setExamFinished(true);

    const config = examConfig[selectedClass];
    let score = 0;
    let hasCriticalError = false;
    const criticalFailures: Question[] = [];
    const wrongAnswers: { question: Question; selected: string; correct: string }[] = [];

    examQuestions.forEach(q => {
      const selected = answers[q.id];
      const correct = q.answer.trim().toUpperCase();

      if (selected === correct) {
        score++;
      } else {
        if (q.critical) {
          hasCriticalError = true;
          criticalFailures.push(q);
        }
        wrongAnswers.push({
          question: q,
          selected: selected || "Không trả lời",
          correct
        });
      }
    });

    const passedScore = score >= config.passing;
    const passed = passedScore && !hasCriticalError;

    setResults({
      score,
      total: examQuestions.length,
      passed,
      hasCriticalError,
      criticalFailures,
      wrongAnswers
    });
  };

  const resetExam = () => {
    setSelectedClass(null);
    setExamStarted(false);
    setExamFinished(false);
    setExamQuestions([]);
    setAnswers({});
    setResults(null);
  };

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto" id="exam-engine-section">
      <div className="text-center mb-8">
        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">Phần mềm sát hạch</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Thi Thử Lý Thuyết 600 Câu</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Phần mềm luyện thi lý thuyết lái xe ô tô trực tuyến theo cấu trúc đề thi chính thức của Tổng cục Đường bộ Việt Nam.
        </p>
      </div>

      {!examStarted ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto border border-blue-50">
          <h2 className="text-xl font-bold text-blue-900 mb-6 text-center flex items-center justify-center gap-2">
            <BookOpen className="text-blue-600" /> Chọn Hạng Giấy Phép Để Bắt Đầu Thi Thử
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSelectedClass('B1')}
              className={`p-5 rounded-xl border text-left transition duration-200 cursor-pointer ${
                selectedClass === 'B1' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xl text-blue-950">HẠNG B1</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">Xe tự động</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Ô tô chở người dưới 9 chỗ, ô tô tải dưới 3.5 tấn số tự động.</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-medium text-slate-700">
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">30 câu hỏi</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">20 phút</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">Đạt 27/30</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedClass('B2')}
              className={`p-5 rounded-xl border text-left transition duration-200 cursor-pointer ${
                selectedClass === 'B2' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xl text-blue-950">HẠNG B2</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">Xe số sàn</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Được kinh doanh vận tải, ô tô chở người dưới 9 chỗ, tải dưới 3.5 tấn.</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-medium text-slate-700">
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">35 câu hỏi</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">22 phút</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">Đạt 32/35</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedClass('C')}
              className={`p-5 rounded-xl border text-left transition duration-200 cursor-pointer ${
                selectedClass === 'C' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xl text-blue-950">HẠNG C</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">Xe tải nặng</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Ô tô tải, đầu kéo trên 3.5 tấn và các loại xe hạng B1, B2.</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-medium text-slate-700">
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">40 câu hỏi</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">24 phút</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">Đạt 36/40</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedClass('D')}
              className={`p-5 rounded-xl border text-left transition duration-200 cursor-pointer ${
                selectedClass === 'D' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xl text-blue-950">HẠNG D</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">Xe khách lớn</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Xe ô tô chở người từ 10 đến 30 chỗ ngồi và các loại xe B1, B2, C.</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-medium text-slate-700">
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">40 câu hỏi</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">24 phút</div>
                <div className="bg-white/80 p-1.5 rounded border border-gray-100 text-center">Đạt 38/40</div>
              </div>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-3 sm:mb-0">
              <input
                id="practice-mode"
                type="checkbox"
                checked={practiceMode}
                onChange={(e) => setPracticeMode(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="practice-mode" className="text-sm font-medium text-gray-700 cursor-pointer">
                Chế độ tự học (Hiển thị đáp án đúng & giải thích ngay sau khi chọn)
              </label>
            </div>
            <span className="bg-yellow-50 text-yellow-700 text-[11px] px-2.5 py-1 rounded-md font-medium border border-yellow-200">
              Có câu hỏi điểm liệt!
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-sm text-blue-800 leading-relaxed">
            <h3 className="font-bold flex items-center gap-1.5 mb-2"><AlertTriangle className="w-4 h-4 text-orange-500 animate-pulse" /> LƯU Ý QUAN TRỌNG KHI SÁT HẠCH:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Mỗi đề thi đều chứa từ 1 đến 3 <strong>câu hỏi điểm liệt</strong> (về hành vi bị nghiêm cấm, quy tắc giao thông cốt lõi).</li>
              <li>Nếu làm đúng hết tất cả các câu nhưng <strong>sai duy nhất 1 câu điểm liệt</strong>, kết quả thi vẫn bị tính là <strong>RỚT (Không đạt)</strong>.</li>
              <li>Không được sử dụng điện thoại hay tài liệu trợ giúp trong phòng thi sát hạch thực tế.</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => selectedClass && generateExam(selectedClass)}
              disabled={!selectedClass}
              className={`px-8 py-3.5 rounded-full font-bold text-white shadow-lg transition duration-200 w-full sm:w-auto text-lg cursor-pointer ${
                selectedClass
                  ? 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 hover:shadow-blue-200 transform hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Bắt Đầu Làm Bài Thi Sát Hạch
            </button>
          </div>
        </div>
      ) : !examFinished ? (
        // Active exam state
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Question Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 relative">
              {/* Question metadata header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <span className="text-sm font-semibold text-blue-600">
                  Câu hỏi {currentIndex + 1} / {examQuestions.length}
                </span>
                <div className="flex gap-2">
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded font-medium">
                    {examQuestions[currentIndex]?.category}
                  </span>
                  {examQuestions[currentIndex]?.critical && (
                    <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded font-bold uppercase animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Điểm liệt
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg font-bold text-slate-900 leading-relaxed mb-6">
                {examQuestions[currentIndex]?.question}
              </h2>

              {/* Illustration Image if any */}
              {examQuestions[currentIndex]?.image && (
                <div className="mb-6 flex justify-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <img
                    src={examQuestions[currentIndex].image}
                    alt="Biển báo giao thông / Sa hình minh họa"
                    className="max-h-56 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                {examQuestions[currentIndex]?.options.map((option, idx) => {
                  const letter = option.charAt(0); // 'A', 'B', 'C', 'D'
                  const isSelected = answers[examQuestions[currentIndex].id] === letter;
                  const showExplanation = practiceMode && answers[examQuestions[currentIndex].id];
                  const isCorrectLetter = letter === examQuestions[currentIndex].answer;

                  let optionStyle = "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30";
                  if (isSelected) {
                    optionStyle = "border-orange-500 bg-orange-50/50 font-medium text-orange-950";
                  }

                  if (showExplanation) {
                    if (isCorrectLetter) {
                      optionStyle = "border-green-500 bg-green-50/80 font-medium text-green-950";
                    } else if (isSelected) {
                      optionStyle = "border-red-500 bg-red-50/80 font-medium text-red-950";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !showExplanation && handleSelectOption(examQuestions[currentIndex].id, letter)}
                      disabled={!!showExplanation}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : showExplanation && isCorrectLetter
                            ? 'bg-green-600 text-white'
                            : showExplanation && isSelected
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-sm leading-relaxed">{option.substring(3).trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Practice Mode Explanation Box */}
              {practiceMode && answers[examQuestions[currentIndex]?.id] && (
                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm animate-fade-in">
                  <div className="flex items-center gap-1.5 mb-1 text-green-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Đáp án đúng là: {examQuestions[currentIndex].answer}
                  </div>
                  <p className="text-slate-600 leading-relaxed mt-1">
                    <strong className="text-slate-700">Giải thích:</strong> {examQuestions[currentIndex].explanation || "Theo luật giao thông đường bộ Việt Nam quy định."}
                  </p>
                </div>
              )}

              {/* Navigation arrows */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className={`flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer border ${
                    currentIndex === 0 ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed' : 'text-blue-900 bg-white border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" /> Câu trước
                </button>

                <button
                  onClick={() => setCurrentIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
                  disabled={currentIndex === examQuestions.length - 1}
                  className={`flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer border ${
                    currentIndex === examQuestions.length - 1 ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed' : 'text-blue-900 bg-white border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  Câu tiếp <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Panel with Timer & Question Navigation Grid */}
          <div className="space-y-6">
            {/* Timer and Submit block */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 mb-1 text-gray-500 text-sm font-semibold">
                <Clock className="w-4 h-4" /> THỜI GIAN CÒN LẠI
              </div>
              <div className={`text-4xl font-mono font-bold tracking-wider mb-6 ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                {formatTime(timeLeft)}
              </div>

              <button
                onClick={submitExam}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-orange-100 transition duration-150 text-base cursor-pointer"
              >
                Nộp Bài & Chấm Điểm
              </button>
              <button
                onClick={resetExam}
                className="w-full text-slate-500 hover:text-red-600 text-xs font-semibold mt-3 hover:underline cursor-pointer"
              >
                Hủy bỏ bài thi này
              </button>
            </div>

            {/* Question Grid Block */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center justify-between border-b border-slate-50 pb-2">
                <span>DANH SÁCH CÂU HỎI</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {Object.keys(answers).length} / {examQuestions.length} đã trả lời
                </span>
              </h3>

              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                {examQuestions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = currentIndex === idx;

                  let gridStyle = "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
                  if (isAnswered) {
                    gridStyle = "bg-orange-500 text-white border-orange-500 hover:bg-orange-600";
                  }
                  if (isCurrent) {
                    gridStyle = "ring-2 ring-blue-600 ring-offset-2 border-transparent font-bold " + (isAnswered ? "bg-orange-500 text-white" : "bg-slate-200 text-blue-900");
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 w-full rounded-lg border text-xs font-bold transition flex items-center justify-center cursor-pointer ${gridStyle}`}
                    >
                      {idx + 1}
                      {q.critical && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-ping" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-gray-500 font-medium border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-500 inline-block" /> Đã làm
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" /> Chưa làm
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="w-3 h-3 rounded ring-2 ring-blue-600 inline-block" /> Đang xem
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Exam finished, display scoring results
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-4xl mx-auto">
          {results && (
            <div className="text-center mb-8 border-b border-gray-100 pb-8">
              <div className="flex justify-center mb-4">
                {results.passed ? (
                  <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-500 flex items-center justify-center text-green-500 animate-bounce">
                    <Award className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-500 flex items-center justify-center text-red-500">
                    <XCircle className="w-10 h-10" />
                  </div>
                )}
              </div>

              <h2 className={`text-3xl font-extrabold tracking-tight ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                {results.passed ? "KẾT QUẢ: ĐẠT" : "KẾT QUẢ: KHÔNG ĐẠT"}
              </h2>

              <p className="text-slate-600 mt-2 max-w-lg mx-auto">
                {results.passed
                  ? `Xin chúc mừng! Bạn đã hoàn thành xuất sắc đề thi thử hạng ${selectedClass}. Hãy duy trì phong độ này cho kì thi sát hạch chính thức!`
                  : results.hasCriticalError
                    ? `Rất tiếc! Mặc dù đạt điểm đỗ (${results.score}/${results.total} câu), bạn đã trả lời sai câu hỏi ĐIỂM LIỆT nên bài thi bị đánh rớt theo quy chế.`
                    : `Rất tiếc! Điểm số của bạn chưa đạt yêu cầu tối thiểu của hạng ${selectedClass} (${results.score}/${results.total} câu, tối thiểu ${examConfig[selectedClass!].passing} câu). Hãy ôn luyện thêm.`}
              </p>

              {/* Big metric score display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-xl mx-auto">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-2xl font-bold text-slate-800">{results.score} / {results.total}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">Số câu đúng</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-2xl font-bold text-slate-800">{results.total - results.score}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">Số câu sai/bỏ trống</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-2xl font-bold text-slate-800">{formatTime(timeLeft)}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">Thời gian dư</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className={`text-xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {results.passed ? "XUẤT SẮC" : results.hasCriticalError ? "SAI ĐIỂM LIỆT" : "THI LẠI"}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">Trạng thái</div>
                </div>
              </div>

              {/* Retake buttons */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => selectedClass && generateExam(selectedClass)}
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-blue-100 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Thi lại đề khác (Hạng {selectedClass})
                </button>
                <button
                  onClick={resetExam}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại chọn Hạng
                </button>
              </div>
            </div>
          )}

          {/* Wrong answers detail list */}
          {results && results.wrongAnswers.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <HelpCircle className="text-red-500 w-5 h-5" /> Đánh Giá Chi Tiết Các Câu Trả Lời Sai
              </h3>

              <div className="space-y-6">
                {results.wrongAnswers.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <span className="bg-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded font-bold">
                        CÂU HỎI {examQuestions.indexOf(item.question) + 1}
                      </span>
                      {item.question.critical && (
                        <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded font-bold uppercase animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Điểm liệt
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 leading-relaxed text-sm mb-4">
                      {item.question.question}
                    </h4>

                    {item.question.image && (
                      <div className="mb-4 flex bg-white p-3 rounded-lg border border-slate-100 inline-block">
                        <img src={item.question.image} alt="Illustration" className="max-h-36 object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <div className="space-y-2 mb-4 text-xs">
                      {item.question.options.map((opt, oIdx) => {
                        const letter = opt.charAt(0);
                        const isSelected = item.selected === letter;
                        const isCorrect = item.correct === letter;

                        let optStyle = "bg-white text-slate-700 border-slate-200";
                        if (isSelected) optStyle = "bg-red-50 text-red-950 border-red-300 font-medium";
                        if (isCorrect) optStyle = "bg-green-50 text-green-950 border-green-300 font-medium";

                        return (
                          <div key={oIdx} className={`p-3 rounded-lg border flex items-start gap-2 ${optStyle}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isSelected ? 'bg-red-600 text-white' : isCorrect ? 'bg-green-600 text-white' : 'bg-slate-100'
                            }`}>
                              {letter}
                            </span>
                            <span>{opt.substring(3)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 text-xs text-blue-900 leading-relaxed">
                      <p className="font-bold flex items-center gap-1 mb-1 text-blue-950">Giải thích:</p>
                      <p className="text-blue-800">{item.question.explanation || "Đối chiếu theo luật quy định hiện hành."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
