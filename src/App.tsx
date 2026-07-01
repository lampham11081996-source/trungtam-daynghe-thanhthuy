import { useState, useEffect } from 'react';
import {
  Phone, Mail, MapPin, Shield, Menu, X, Award, ExternalLink,
  BookOpen, HelpCircle, Users, CheckCircle2, RefreshCw, ChevronDown, Globe
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Components imports
import Home from './components/Home';
import About from './components/About';
import Courses from './components/Courses';
import Schedules from './components/Schedules';
import StudentLookup from './components/StudentLookup';
import NewsSection from './components/NewsSection';
import Documents from './components/Documents';
import ExamEngine from './components/ExamEngine';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import ToastContainer from './components/ToastContainer';
import ScrollToTop from './components/ScrollToTop';

import { Course, Schedule, Student, Question, News, DocumentItem, AlbumItem, ContactMessage, SystemLog } from './types';

// Style Presets for Custom Themes
export const THEME_PRESETS: Record<string, {
  name: string;
  primary50: string;
  primary100: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;
  primary950: string;
  accent50: string;
  accent500: string;
  accent600: string;
  accent700: string;
}> = {
  blue: {
    name: "Xanh dương & Cam (Mặc định)",
    primary50: "#f0f7ff",
    primary100: "#e0effe",
    primary600: "#0284c7",
    primary700: "#0369a1",
    primary800: "#075985",
    primary900: "#0f172a",
    primary950: "#090d16",
    accent50: "#fffaf0",
    accent500: "#f97316",
    accent600: "#ea580c",
    accent700: "#c2410c",
  },
  green: {
    name: "Lục bảo & Hổ phách (Xanh tươi mát)",
    primary50: "#f0fdf4",
    primary100: "#dcfce7",
    primary600: "#16a34a",
    primary700: "#15803d",
    primary800: "#166534",
    primary900: "#064e3b",
    primary950: "#022c22",
    accent50: "#fffbeb",
    accent500: "#f59e0b",
    accent600: "#d97706",
    accent700: "#b45309",
  },
  teal: {
    name: "Xanh ngọc & San hô (Trẻ trung)",
    primary50: "#f0fdfa",
    primary100: "#ccfbf1",
    primary600: "#0d9488",
    primary700: "#0f766e",
    primary800: "#115e59",
    primary900: "#042f2e",
    primary950: "#021a1e",
    accent50: "#fff1f2",
    accent500: "#f43f5e",
    accent600: "#e11d48",
    accent700: "#be123c",
  },
  charcoal: {
    name: "Xám đá & Hồng phấn (Đậm chất công nghệ)",
    primary50: "#f9fafb",
    primary100: "#f3f4f6",
    primary600: "#4b5563",
    primary700: "#374151",
    primary800: "#1f2937",
    primary900: "#111827",
    primary950: "#030712",
    accent50: "#fff1f2",
    accent500: "#ec4899",
    accent600: "#db2777",
    accent700: "#be185d",
  },
  purple: {
    name: "Tím quý phái & Vàng hoàng gia",
    primary50: "#faf5ff",
    primary100: "#f3e8ff",
    primary600: "#9333ea",
    primary700: "#7e22ce",
    primary800: "#6b21a8",
    primary900: "#3b0764",
    primary950: "#240046",
    accent50: "#fefdf0",
    accent500: "#eab308",
    accent600: "#ca8a04",
    accent700: "#a16207",
  },
  red: {
    name: "Đỏ đậm & Xám tối (Năng động)",
    primary50: "#fef2f2",
    primary100: "#fee2e2",
    primary600: "#dc2626",
    primary700: "#b91c1c",
    primary800: "#991b1b",
    primary900: "#450a0a",
    primary950: "#2d0000",
    accent50: "#f8fafc",
    accent500: "#475569",
    accent600: "#334155",
    accent700: "#1e293b",
  }
};

// Style Presets for Custom Fonts
export const FONT_PRESETS: Record<string, {
  name: string;
  sans: string;
  display: string;
}> = {
  default: {
    name: "Inter & Outfit (Mặc định)",
    sans: 'Inter, sans-serif',
    display: 'Outfit, sans-serif'
  },
  roboto: {
    name: "Roboto & Montserrat (Hiện đại)",
    sans: 'Roboto, sans-serif',
    display: 'Montserrat, sans-serif'
  },
  serif: {
    name: "Lora & Playfair Display (Trang trọng)",
    sans: 'Lora, serif',
    display: 'Playfair Display, serif'
  },
  mono: {
    name: "JetBrains Mono (Kỹ thuật/Cá tính)",
    sans: 'JetBrains Mono, monospace',
    display: 'JetBrains Mono, monospace'
  },
  system: {
    name: "System UI (Tối giản hệ thống)",
    sans: 'system-ui, -apple-system, sans-serif',
    display: 'system-ui, -apple-system, sans-serif'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Global State parsed from /api/init
  const [info, setInfo] = useState<any>({
    name: "Trung Tâm Dạy Nghề Thanh Thuỷ",
    hotline: "0988 123 456",
    address: "Khu 5, thị trấn Thanh Thuỷ, huyện Thanh Thuỷ, tỉnh Phú Thọ",
    email: "daynghethanhthuy@gmail.com",
    logo: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=200",
    intro: "",
    themeStyle: "blue",
    fontFamily: "default"
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Apply theme configurations dynamically on document root when info changes
  useEffect(() => {
    if (!info) return;

    // 1. Theme colors
    const themeKey = info.themeStyle || 'blue';
    const theme = THEME_PRESETS[themeKey] || THEME_PRESETS.blue;
    
    const root = document.documentElement;
    root.style.setProperty('--custom-primary-50', theme.primary50);
    root.style.setProperty('--custom-primary-100', theme.primary100);
    root.style.setProperty('--custom-primary-600', theme.primary600);
    root.style.setProperty('--custom-primary-700', theme.primary700);
    root.style.setProperty('--custom-primary-800', theme.primary800);
    root.style.setProperty('--custom-primary-900', theme.primary900);
    root.style.setProperty('--custom-primary-950', theme.primary950);
    
    root.style.setProperty('--custom-accent-50', theme.accent50);
    root.style.setProperty('--custom-accent-500', theme.accent500);
    root.style.setProperty('--custom-accent-600', theme.accent600);
    root.style.setProperty('--custom-accent-700', theme.accent700);

    // 2. Font family
    const fontKey = info.fontFamily || 'default';
    const font = FONT_PRESETS[fontKey] || FONT_PRESETS.default;
    root.style.setProperty('--custom-font-sans', font.sans);
    root.style.setProperty('--custom-font-display', font.display);
  }, [info.themeStyle, info.fontFamily]);

  // Function to pull database data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/init');
      if (!res.ok) throw new Error("Thất bại");
      const data = await res.json();
      
      if (data.info) setInfo(data.info);
      if (data.courses) setCourses(data.courses);
      if (data.schedules) setSchedules(data.schedules);
      if (data.students) setStudents(data.students);
      if (data.questions) setQuestions(data.questions);
      if (data.news) setNews(data.news);
      if (data.documents) setDocuments(data.documents);
      if (data.albums) setAlbums(data.albums);
      if (data.contacts) setContacts(data.contacts);
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    // Smooth scroll back to top on navigation change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-t-blue-900 border-blue-50 animate-spin mx-auto" />
          <div>
            <h2 className="text-lg font-extrabold text-blue-950 font-display">TRUNG TÂM DẠY NGHỀ THANH THUỶ</h2>
            <p className="text-xs text-slate-500 mt-1">Đang khởi tạo cổng thông tin tuyển sinh & học trực tuyến bảo mật...</p>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Items Catalog for Mobile
  const navItems = [
    { value: 'home', label: 'Trang chủ' },
    { value: 'about', label: 'Giới thiệu' },
    { value: 'courses', label: 'Khóa học lái xe' },
    { value: 'schedules', label: 'Lịch học/Lịch thi' },
    { value: 'lookup', label: 'Tra cứu hồ sơ' },
    { value: 'news', label: 'Tin tức' },
    { value: 'documents', label: 'Tài liệu học' },
    { value: 'exam', label: 'Thi thử 600 câu', id: 'exam-tab-btn' },
    { value: 'contact', label: 'Liên hệ' }
  ];

  // Compact Navigation with Hover Dropdowns for Desktop
  const desktopNavGroups = [
    { type: 'single', value: 'home', label: 'Trang chủ' },
    {
      type: 'dropdown',
      label: 'Giới thiệu',
      values: ['about', 'contact'],
      children: [
        { value: 'about', label: 'Giới thiệu chung' },
        { value: 'contact', label: 'Liên hệ & Góp ý' }
      ]
    },
    {
      type: 'dropdown',
      label: 'Khóa học',
      values: ['courses', 'schedules'],
      children: [
        { value: 'courses', label: 'Khóa học lái xe' },
        { value: 'schedules', label: 'Lịch học & Lịch thi' }
      ]
    },
    {
      type: 'dropdown',
      label: 'Học viên',
      values: ['lookup', 'exam', 'documents'],
      children: [
        { value: 'lookup', label: 'Tra cứu hồ sơ' },
        { value: 'exam', label: 'Thi thử 600 câu' },
        { value: 'documents', label: 'Tài liệu học tập' }
      ]
    },
    { type: 'single', value: 'news', label: 'Tin tức' }
  ];

  const initials = info.name
    ? info.name
        .split(" ")
        .filter((w: string) => w.trim().length > 0)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3)
    : "TT";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white" id="main-application-portal">
      
      {/* 1. TOP BAR */}
      <div className="bg-blue-950 text-white text-[11px] font-semibold py-2 px-4 border-b border-blue-900/40 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-orange-400" /> Hotline tuyển sinh: {info.hotline}</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-orange-400" /> Email: {info.email}</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-orange-400" /> Website: <a href={info.websiteUrl || `https://${info.domain || 'daynghelaixethanhthuy.com'}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-200">{info.domain || 'daynghelaixethanhthuy.com'}</a></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-orange-400" /> Địa điểm: Huyện Thanh Thuỷ, Phú Thọ</span>
            <button
              onClick={() => handleTabChange('admin')}
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded transition cursor-pointer ${
                activeTab === 'admin' ? 'bg-orange-500 text-white' : 'bg-white/10 text-orange-400 hover:bg-white/20'
              }`}
            >
              🔒 Hệ thống quản trị
            </button>
          </div>
        </div>
      </div>
  
      {/* 2. MAIN HEADER */}
      <header className="sticky top-0 bg-white shadow-sm border-b border-slate-100 z-40 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          
          {/* Logo & title group */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-white border-2 border-orange-500 shadow-md overflow-hidden transform hover:scale-105 transition duration-200">
              {info.logo ? (
                <img src={info.logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-blue-900 flex items-center justify-center font-black text-lg">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-blue-900 uppercase leading-tight font-display">
                {info.name || "Trường Dạy Nghề Thanh Thuỷ"}
              </h1>
              <p className="text-[10px] sm:text-xs text-orange-500 font-extrabold tracking-wider uppercase">
                {info.subtitle || "Đào tạo & sát hạch lái xe Phú Thọ"}
              </p>
            </div>
          </div>
 
          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {desktopNavGroups.map((group) => {
              if (group.type === 'single') {
                const isActive = activeTab === group.value;
                return (
                  <button
                    key={group.value}
                    onClick={() => handleTabChange(group.value!)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer relative ${
                      isActive
                        ? 'text-blue-900 bg-blue-50/70'
                        : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                    }`}
                  >
                    {group.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-orange-500 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              } else {
                const isActive = group.values!.includes(activeTab);
                return (
                  <div key={group.label} className="relative group py-2">
                    <button
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 relative ${
                        isActive
                          ? 'text-blue-900 bg-blue-50/70'
                          : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                      }`}
                    >
                      {group.label}
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-orange-500 rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                    
                    {/* Hover Dropdown List */}
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-1.5 space-y-0.5">
                        {group.children!.map((child) => {
                          const isChildActive = activeTab === child.value;
                          return (
                            <button
                              key={child.value}
                              onClick={() => handleTabChange(child.value)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                isChildActive
                                  ? 'text-blue-900 bg-blue-50/80 font-black'
                                  : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                              }`}
                            >
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            <button
              onClick={() => handleTabChange('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ml-3 ${
                activeTab === 'admin'
                  ? 'bg-blue-950 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
              }`}
            >
              Cổng Admin
            </button>
          </nav>

          {/* Mobile controllers */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleTabChange('admin')}
              className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
            >
              🔒 Admin
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1 shadow-inner overflow-hidden"
            >
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleTabChange(item.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition block ${
                    activeTab === item.value
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. FLOATING SPEED UTILITIES & HOTLINES */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3 flex flex-col items-end pointer-events-none">
        
        {/* Messenger CTA link */}
        <a
          href="https://m.me/daynghethanhthuy"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-xl hover:shadow-blue-100 hover:-translate-y-0.5 transition duration-150 flex items-center justify-center"
          title="Kết nối qua Messenger"
        >
          <span className="text-[10px] font-black mr-2 bg-white/10 px-2 py-0.5 rounded-full">Chat</span>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.908 1.455 5.485 3.738 7.034v3.748l3.527-1.936c.866.24 1.782.37 2.735.37 5.523 0 10-4.146 10-9.258C22 6.145 17.523 2 12 2zm1.082 11.836l-2.52-2.693-4.916 2.693 5.405-5.74 2.585 2.692 4.85-2.692-5.404 5.74z" />
          </svg>
        </a>

        {/* Zalo Callout */}
        <a
          href={info.zalo ? (info.zalo.startsWith('http') ? info.zalo : `https://zalo.me/${info.zalo.replace(/\s+/g, '')}`) : "https://zalo.me/0988123456"}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto bg-sky-500 hover:bg-sky-600 text-white p-3.5 rounded-full shadow-xl hover:shadow-sky-100 hover:-translate-y-0.5 transition duration-150 flex items-center justify-center"
          title="Kết nối qua Zalo"
        >
          <span className="text-[10px] font-black mr-2 bg-white/10 px-2 py-0.5 rounded-full">Zalo</span>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 12.3c-.2.53-.78 1.15-1.3 1.4-.44.2-.95.34-1.46.34-.84 0-1.84-.36-2.73-1.02-1.33-1-2.43-2.33-3.26-3.8-.4-.7-.64-1.43-.64-2.13 0-.58.17-1.12.5-1.54.34-.43.93-.84 1.45-.84.28 0 .54.14.7.35l1.23 1.7c.18.25.18.6 0 .84l-.53.53c.63 1.15 1.57 2.1 2.72 2.7l.53-.52c.24-.18.58-.18.84 0l1.72 1.23c.2.16.33.42.33.7-.01.2-.07.4-.13.5zm-5-3.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5zm1.5-1.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5zm1.5-1.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5z" />
          </svg>
        </a>

        {/* Real hotline phone button */}
        <a
          href={`tel:${info.hotline}`}
          className="pointer-events-auto bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl hover:shadow-orange-200 hover:-translate-y-0.5 transition duration-150 flex items-center justify-center animate-bounce"
          title="Gọi hotline ngay"
        >
          <Phone className="w-5.5 h-5.5 animate-pulse" />
        </a>

      </div>

      {/* 4. MAIN WORKSPACE WITH MOTION TRANSITION EFFECT */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === 'home' && (
              <Home info={info} courses={courses} news={news} albums={albums} onChangeTab={handleTabChange} />
            )}
            {activeTab === 'about' && (
              <About info={info} />
            )}
            {activeTab === 'courses' && (
              <Courses courses={courses} onRefreshStudents={fetchData} />
            )}
            {activeTab === 'schedules' && (
              <Schedules schedules={schedules} />
            )}
            {activeTab === 'lookup' && (
              <StudentLookup />
            )}
            {activeTab === 'news' && (
              <NewsSection newsList={news} />
            )}
            {activeTab === 'documents' && (
              <Documents documents={documents} onRefreshDocs={fetchData} />
            )}
            {activeTab === 'exam' && (
              <ExamEngine questions={questions} />
            )}
            {activeTab === 'contact' && (
              <Contact info={info} />
            )}
            {activeTab === 'admin' && (
              <AdminPanel
                courses={courses}
                schedules={schedules}
                students={students}
                questions={questions}
                newsList={news}
                documents={documents}
                albums={albums}
                contacts={contacts}
                logs={logs}
                info={info}
                onRefreshAll={fetchData}
                onClose={() => setActiveTab('home')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Column 1: School Identity */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-white border-2 border-orange-500 shadow-sm overflow-hidden">
                {info.logo ? (
                  <img src={info.logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-blue-900 flex items-center justify-center font-bold text-sm">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                  {info.name || "Trung tâm Dạy nghề Thanh Thuỷ"}
                </h3>
                <p className="text-[10px] text-orange-400 font-bold uppercase">
                  {info.footerSlogan || "Sát hạch lái xe uy tín số 1"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {info.footerDesc || "Trực thuộc Sở Giao Thông Vận Tải tỉnh Phú Thọ, trung tâm cam kết dịch vụ đào tạo chuyên nghiệp, học thật chất lượng cao, bao đậu thi lý thuyết khi thi thử đạt yêu cầu."}
            </p>
            {(info.footerTag1 || info.footerTag2 || (!info.footerTag1 && !info.footerTag2)) && (
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-800 text-[10px] font-bold px-2.5 py-1 rounded">
                  {info.footerTag1 || "ISO 9001:2015"}
                </span>
                <span className="bg-slate-800 text-[10px] font-bold px-2.5 py-1 rounded">
                  {info.footerTag2 || "Đạt chuẩn Bộ GTVT"}
                </span>
              </div>
            )}
          </div>

          {/* Column 2: Direct links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">Liên kết nhanh</h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-400">
              <button onClick={() => handleTabChange('courses')} className="text-left hover:text-white transition cursor-pointer flex items-center gap-1">• Khóa học lái xe B1, B2, C</button>
              <button onClick={() => handleTabChange('lookup')} className="text-left hover:text-white transition cursor-pointer flex items-center gap-1">• Tra cứu tiến trình học tập</button>
              <button onClick={() => handleTabChange('exam')} className="text-left hover:text-white transition cursor-pointer flex items-center gap-1">• Sát hạch lý thuyết 600 câu</button>
              <button onClick={() => handleTabChange('schedules')} className="text-left hover:text-white transition cursor-pointer flex items-center gap-1">• Lịch thi sát hạch mới nhất</button>
              <button onClick={() => handleTabChange('documents')} className="text-left hover:text-white transition cursor-pointer flex items-center gap-1">• Tải cẩm nang 120 tình huống</button>
            </div>
          </div>

          {/* Column 3: Contacts */}
          <div className="md:col-span-5 space-y-4 text-xs text-slate-400 leading-relaxed">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">Văn phòng tuyển sinh</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span><strong>Trụ sở chính:</strong> {info.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span><strong>Hotline báo danh:</strong> {info.hotline} (Hỗ trợ 24/7 cả Thứ 7 và Chủ Nhật)</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span><strong>Email hỗ trợ:</strong> {info.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span><strong>Website chính thức:</strong> <a href={info.websiteUrl || `https://${info.domain || 'daynghelaixethanhthuy.com'}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">{info.domain || 'daynghelaixethanhthuy.com'}</a></span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyleft & design notice */}
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-semibold uppercase">
          <span>{info.footer || `© 2026 ${info.name || "Trung tâm Dạy nghề Thanh Thuỷ"}. Bảo lưu mọi quyền đối với nội dung và thương hiệu.`}</span>
        </div>
      </footer>

      <ToastContainer />
      <ScrollToTop />
    </div>
  );
}
