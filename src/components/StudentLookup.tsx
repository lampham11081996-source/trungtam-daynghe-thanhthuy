import React, { useState } from 'react';
import { Search, UserCheck, ShieldCheck, Calendar, BookOpen, AlertCircle, RefreshCw, Milestone, MapPin, User, FileText } from 'lucide-react';
import { Student } from '../types';

export default function StudentLookup() {
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setStudent(null);

    try {
      const response = await fetch(`/api/students/search?keyword=${encodeURIComponent(keyword.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không tìm thấy hồ sơ học viên");
      }

      setStudent(data);
    } catch (err: any) {
      setError(err.message || "Lỗi hệ thống khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get status index for step timeline
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Mới đăng ký': return 1;
      case 'Đang học': return 2;
      case 'Chờ thi': return 3;
      case 'Đã thi':
      case 'Đậu':
      case 'Rớt': return 4;
      default: return 1;
    }
  };

  const statusStep = student ? getStatusStep(student.status) : 1;

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto" id="student-lookup-section">
      <div className="text-center mb-8">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Cổng thông tin học viên</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Tra Cứu Hồ Sơ & Kết Quả Học Tập</h1>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Tra cứu nhanh trạng thái hồ sơ, lịch thi sát hạch, phân công giáo viên hướng dẫn và kết quả tốt nghiệp của bạn.
        </p>
      </div>

      {/* Search Bar Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập số CCCD (12 số) hoặc Mã học viên (ví dụ: HV0001)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition duration-150 shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? "Đang truy vấn..." : "Tra Cứu Ngay"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3 italic text-center md:text-left">
          * Ghi chú: Sử dụng số Căn cước công dân hoặc số điện thoại bạn đăng ký ban đầu để tìm kiếm thông tin cá nhân.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 text-blue-900 animate-spin" />
          <p className="text-gray-500 font-semibold mt-4">Đang truy xuất thông tin bảo mật...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-6 text-center shadow-sm animate-fade-in">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">Không Tìm Thấy Kết Quả</h3>
          <p className="text-sm text-red-700 max-w-md mx-auto">{error}</p>
          <p className="text-xs text-red-500 mt-4 leading-relaxed">
            Nếu bạn mới đăng ký đóng phí trong vòng 24 giờ, hồ sơ của bạn có thể đang trong quá trình duyệt số hóa. Vui lòng liên hệ Hotline <strong>0988 123 456</strong> để được hỗ trợ nhanh nhất.
          </p>
        </div>
      )}

      {/* Student Profile Display */}
      {student && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Header Badge */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-blue-800 text-blue-100 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded">
                  Hồ sơ học viên chính thức
                </span>
                <h2 className="text-2xl font-bold mt-1.5 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-orange-400 animate-pulse" /> {student.name}
                </h2>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm text-right shrink-0">
                <div className="text-xs text-blue-200 font-bold">MÃ SỐ HỌC VIÊN</div>
                <div className="text-lg font-mono font-bold tracking-wider">{student.id}</div>
              </div>
            </div>

            {/* Profile Detail List */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5 text-blue-900">
                  <User className="w-4 h-4" /> THÔNG TIN HỒ SƠ
                </h3>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Ngày sinh:</span>
                  <span className="col-span-2 font-medium">{student.dob || "Đang cập nhật"}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Số CCCD:</span>
                  <span className="col-span-2 font-mono font-medium">{student.identity}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Số điện thoại:</span>
                  <span className="col-span-2 font-medium">{student.phone}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Địa chỉ:</span>
                  <span className="col-span-2 font-medium">{student.address || "Chưa cập nhật"}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5 text-blue-900">
                  <BookOpen className="w-4 h-4" /> CHƯƠNG TRÌNH ĐÀO TẠO
                </h3>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Hạng đăng ký:</span>
                  <span className="col-span-2 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit text-xs">
                    Hạng {student.class}
                  </span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Giáo viên phụ trách:</span>
                  <span className="col-span-2 font-medium text-slate-700">{student.teacher || "Tự do"}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Trạng thái:</span>
                  <span className={`col-span-2 font-bold px-2 py-0.5 rounded w-fit text-xs ${
                    student.status === 'Đậu'
                      ? 'bg-green-100 text-green-700'
                      : student.status === 'Rớt'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-semibold col-span-1">Ghi chú nội bộ:</span>
                  <span className="col-span-2 text-xs text-gray-500 italic">{student.notes || "Hồ sơ bình thường"}</span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline Progress */}
            <div className="bg-slate-50 border-t border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 text-sm mb-6 flex items-center gap-1.5">
                <Milestone className="w-4 h-4 text-blue-600" /> TIẾN ĐỘ ĐÀO TẠO & THI SÁT HẠCH
              </h3>

              {/* Horizontal Stepper (for md+ screens) */}
              <div className="hidden md:flex justify-between items-center relative mb-6">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
                  <div
                    className="h-full bg-blue-900 transition-all duration-300"
                    style={{ width: `${((statusStep - 1) / 3) * 100}%` }}
                  />
                </div>

                {/* Step 1 */}
                <div className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    statusStep >= 1 ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    1
                  </div>
                  <span className={`text-xs font-semibold mt-2 ${statusStep >= 1 ? 'text-blue-950' : 'text-slate-400'}`}>Mới đăng ký</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    statusStep >= 2 ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    2
                  </div>
                  <span className={`text-xs font-semibold mt-2 ${statusStep >= 2 ? 'text-blue-950' : 'text-slate-400'}`}>Đang học</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    statusStep >= 3 ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    3
                  </div>
                  <span className={`text-xs font-semibold mt-2 ${statusStep >= 3 ? 'text-blue-950' : 'text-slate-400'}`}>Chờ thi</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    statusStep >= 4
                      ? student.status === 'Đậu'
                        ? 'bg-green-600 text-white'
                        : student.status === 'Rớt'
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    4
                  </div>
                  <span className={`text-xs font-semibold mt-2 ${statusStep >= 4 ? 'text-blue-950' : 'text-slate-400'}`}>
                    {student.status === 'Đậu' ? 'Thi Đậu' : student.status === 'Rớt' ? 'Thi Rớt' : 'Báo Kết Quả'}
                  </span>
                </div>
              </div>

              {/* Vertical Stepper (for mobile screens) */}
              <div className="md:hidden space-y-4">
                <div className="flex gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    statusStep >= 1 ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>1</div>
                  <span className={`text-xs font-semibold ${statusStep >= 1 ? 'text-blue-950' : 'text-slate-400'}`}>Mới đăng ký (Đã tiếp nhận hồ sơ)</span>
                </div>
                <div className="flex gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    statusStep >= 2 ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>2</div>
                  <span className={`text-xs font-semibold ${statusStep >= 2 ? 'text-blue-950' : 'text-slate-400'}`}>Đang học (Lý thuyết & Thực hành)</span>
                </div>
                <div className="flex gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    statusStep >= 3 ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>3</div>
                  <span className={`text-xs font-semibold ${statusStep >= 3 ? 'text-blue-950' : 'text-slate-400'}`}>Chờ thi sát hạch sở GTVT</span>
                </div>
                <div className="flex gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    statusStep >= 4 ? student.status === 'Đậu' ? 'bg-green-600 text-white' : student.status === 'Rớt' ? 'bg-red-600 text-white' : 'bg-blue-900' : 'bg-slate-200 text-slate-400'
                  }`}>4</div>
                  <span className={`text-xs font-semibold ${statusStep >= 4 ? 'text-blue-950' : 'text-slate-400'}`}>
                    Hoàn thành khóa học: {student.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines info block */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-sm flex items-start gap-3 text-blue-900 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Cần hỗ trợ chỉnh sửa thông tin hồ sơ?</h4>
              <p className="text-xs text-slate-600">
                Nếu phát hiện sai lệch về Họ tên, Số điện thoại, Ngày sinh, số CCCD, học viên vui lòng chụp ảnh mặt trước CCCD gửi cho giáo viên lý thuyết trực tiếp phụ trách lớp hoặc đến trực tiếp văn phòng Tuyển sinh Thanh Thuỷ để cập nhật kịp thời, tránh sai sót khi in phôi bằng lái xe của Sở Giao thông Vận tải.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
