import { useState } from 'react';
import { Calendar, User, ArrowRight, ArrowLeft, Tag, FileText, Award } from 'lucide-react';
import { News } from '../types';

interface NewsSectionProps {
  newsList: News[];
}

export default function NewsSection({ newsList }: NewsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<News | null>(null);

  const categories = ['All', 'Thông báo', 'Tuyển sinh', 'Lịch thi', 'Tài liệu'];

  const filteredNews = newsList.filter(article => {
    return selectedCategory === 'All' || article.category === selectedCategory;
  });

  // Safe renderer for simplified markdown contents in news body
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-bold text-blue-900 mt-6 mb-3 font-display">{trimmed.substring(4)}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx} className="text-lg font-bold text-slate-950 mt-5 mb-2 font-display">{trimmed.substring(5)}</h4>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return <li key={idx} className="ml-5 list-disc text-sm text-slate-700 leading-relaxed my-1">{trimmed.substring(2)}</li>;
      }
      if (/^\d+\.\s*/.test(trimmed)) {
        return <li key={idx} className="ml-5 list-decimal text-sm text-slate-700 leading-relaxed my-1">{trimmed.replace(/^\d+\.\s*/, '')}</li>;
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      // Simple bold replacements inside line
      let processed = trimmed;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(processed)) !== null) {
        parts.push(processed.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(processed.substring(lastIndex));

      return <p key={idx} className="text-sm text-slate-600 leading-relaxed my-2">{parts.length > 1 ? parts : trimmed}</p>;
    });
  };

  if (activeArticle) {
    // Single Article Immersive Detail Reader
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto animate-fade-in" id="news-reader-section">
        <button
          onClick={() => { setActiveArticle(null); window.scrollTo({ top: 0 }); }}
          className="flex items-center gap-2 text-xs font-bold text-blue-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full cursor-pointer transition mb-6 border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách tin tức
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-50">
          {/* Banner cover */}
          <div className="h-64 sm:h-96 w-full bg-cover bg-center" style={{ backgroundImage: `url(${activeArticle.image})` }} />

          {/* Article Header block */}
          <div className="p-6 sm:p-10 border-b border-gray-100 space-y-4">
            <div className="flex flex-wrap gap-2.5">
              <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {activeArticle.category}
              </span>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {activeArticle.date}
              </span>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Đăng bởi: {activeArticle.author}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 leading-snug font-display">
              {activeArticle.title}
            </h1>

            <p className="text-slate-500 font-medium text-sm leading-relaxed border-l-4 border-blue-900 pl-4 italic">
              {activeArticle.summary}
            </p>
          </div>

          {/* Article Markdown Body */}
          <div className="p-6 sm:p-10 space-y-2 prose max-w-none">
            {renderMarkdown(activeArticle.content)}
          </div>
        </div>

        {/* Support block in bottom of reader */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Bạn có câu hỏi cần tư vấn trực tiếp từ ban giám hiệu?</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Chúng tôi luôn hỗ trợ giải đáp miễn phí thủ tục làm hồ sơ học lái xe nhanh nhất tại Phú Thọ. Hãy kết nối qua Zalo hoặc Hotline trực tuyến.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <a href="tel:0988123456" className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-5 py-2 rounded-lg transition shadow">Gọi ngay: 0988 123 456</a>
          </div>
        </div>
      </div>
    );
  }

  // General news listing screen
  return (
    <div className="py-8 px-4 max-w-6xl mx-auto" id="news-grid-section">
      <div className="text-center mb-10">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Tin tức - Sự kiện</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Bản Tin Đào Tạo Thanh Thuỷ</h1>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Cập nhật nhanh nhất các quyết định tuyển sinh, lịch khai giảng lớp học lái xe số tự động B1, số sàn B2, xe tải nặng C mới nhất trong tuần.
        </p>
      </div>

      {/* Tabs list to filter news */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'
            }`}
          >
            {cat === 'All' ? 'Tất cả bài viết' : cat}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Hiện tại chưa có bài viết nào thuộc chuyên mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 flex flex-col h-full hover:-translate-y-0.5"
            >
              {/* Cover Photo */}
              <div
                className="h-48 bg-cover bg-center cursor-pointer relative"
                style={{ backgroundImage: `url(${article.image})` }}
                onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0 }); }}
              >
                <span className="absolute top-3 left-3 bg-blue-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                  {article.category}
                </span>
              </div>

              {/* Text content block */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author}</span>
                  </div>

                  <h3
                    className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-900 cursor-pointer transition"
                    onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0 }); }}
                  >
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 mt-4">
                  <button
                    onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0 }); }}
                    className="text-xs font-bold text-blue-900 hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    Đọc tiếp bài viết <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
