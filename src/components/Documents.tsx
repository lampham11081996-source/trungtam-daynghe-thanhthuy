import { useState } from 'react';
import { Download, FileText, Search, BookOpen, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsProps {
  documents: DocumentItem[];
  onRefreshDocs: () => void;
}

export default function Documents({ documents, onRefreshDocs }: DocumentsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const categories = [
    { value: 'All', label: 'Tất cả tài liệu' },
    { value: 'Lý thuyết 600 câu', label: 'Lý thuyết 600 câu' },
    { value: 'Biển báo giao thông', label: 'Biển báo giao thông' },
    { value: 'Mẹo thi lý thuyết', label: 'Mẹo thi lý thuyết' },
    { value: 'Tài liệu mô phỏng', label: 'Tài liệu mô phỏng' }
  ];

  // Increment download count and trigger standard PDF / attachment save
  const handleDownload = async (doc: DocumentItem) => {
    setDownloadingId(doc.id);
    try {
      await fetch(`/api/documents/${doc.id}/download`, { method: 'POST' });
      onRefreshDocs();

      // Trigger a simulated browser download of a sample PDF
      const link = document.createElement('a');
      link.href = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000'; // Placeholder to look real
      link.setAttribute('download', `${doc.name}.png`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto" id="documents-portal-section">
      <div className="text-center mb-10">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Học liệu chính thức</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Thư Viện Tài Liệu Lái Xe</h1>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Tải miễn phí toàn bộ bộ đề lý thuyết 600 câu, sách hướng dẫn biển báo, bảng căn thời gian tình huống mô phỏng do giáo viên Thanh Thuỷ biên soạn.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-slate-100 flex flex-col md:flex-row items-center gap-4">
        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tài liệu học lái xe..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs"
          />
        </div>
      </div>

      {/* Documents Grid Display */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="text-xs text-blue-700 font-bold hover:underline mt-2 cursor-pointer"
          >
            Reset bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-100 p-6 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>

              <div className="space-y-2 flex-grow">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                    <Download className="w-3 h-3" /> {doc.downloads} lượt tải
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm leading-snug hover:text-blue-800 transition">
                  {doc.name}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {doc.description}
                </p>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PDF / Học liệu chuẩn
                  </span>

                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer disabled:bg-gray-400"
                  >
                    {downloadingId === doc.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    {downloadingId === doc.id ? "Đang tải..." : "Tải xuống"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning tip banner */}
      <div className="mt-12 bg-gradient-to-r from-blue-900 to-blue-950 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none -translate-y-5">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="max-w-2xl relative z-10 space-y-3">
          <h3 className="text-lg font-bold text-orange-400">Bạn đã biết mẹo thi lý thuyết chưa?</h3>
          <p className="text-xs text-blue-200 leading-relaxed">
            Ngoài tài liệu PDF, Trung tâm Thanh Thuỷ đã tích hợp bộ thi thử 600 câu hỏi trực tuyến với đáp án chuẩn và phân tích điểm liệt của Tổng Cục Đường Bộ. Bạn hãy bấm vào liên kết dưới đây để thực hành đề thi ngẫu nhiên ngay!
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('exam-tab-btn');
                if (el) el.click();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-md cursor-pointer inline-block"
            >
              Vào Thi Thử 600 Câu Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
