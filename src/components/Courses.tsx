import React, { useState } from 'react';
import { Calendar, BookOpen, AlertCircle, FileText, BadgeCheck, CheckCircle, RefreshCw, X } from 'lucide-react';
import { Course } from '../types';
import { toast } from '../utils/toast';

interface CoursesProps {
  courses: Course[];
  onRefreshStudents?: () => void;
}

export default function Courses({ courses, onRefreshStudents }: CoursesProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
  const [registeringCourse, setRegisteringCourse] = useState<Course | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    identity: '',
    address: '',
    class: '',
    teacher: 'Tự do',
    notes: 'Đăng ký học trực tuyến'
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOpenRegister = (course: Course) => {
    setRegisteringCourse(course);
    setFormData(prev => ({
      ...prev,
      class: course.id
    }));
    setShowRegisterForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.identity || !formData.class) {
      setError("Vui lòng nhập đầy đủ các trường thông tin bắt buộc (*)");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gửi đơn đăng ký thất bại");
      }

      setSuccess(data.student);
      toast.success(`Đăng ký thành công khóa học hạng ${data.student.class}!`);
      if (onRefreshStudents) {
        onRefreshStudents();
      }

      // Reset form fields
      setFormData({
        name: '',
        phone: '',
        dob: '',
        identity: '',
        address: '',
        class: '',
        teacher: 'Tự do',
        notes: 'Đăng ký học trực tuyến'
      });
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto" id="courses-portal-section">
      {/* Page Title */}
      <div className="text-center mb-10">
        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Hệ thống đào tạo</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Các Khóa Đào Tạo Lái Xe Tiêu Chuẩn</h1>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Cam kết đào tạo bài bản, học phí công khai trọn gói, lịch thực hành linh hoạt tùy chọn. Hãy chọn khóa học phù hợp với nhu cầu của bạn.
        </p>
      </div>

      {/* Grid List of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-200 flex flex-col justify-between h-full hover:-translate-y-0.5"
          >
            {/* Top Image */}
            <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${course.image})` }}>
              <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Hạng {course.id}
              </span>
            </div>

            {/* Course Information body */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {course.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-50 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5 text-blue-900">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Thời gian: {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-900">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>Hạng bằng: {course.id}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Học phí trọn gói</span>
                  <span className="text-xl font-black text-orange-600">{formatCurrency(course.fee)}</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">* Cam kết không phát sinh chi phí phụ</span>
                </div>
              </div>

              {/* Interaction buttons */}
              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="bg-slate-50 hover:bg-slate-100 text-blue-900 font-bold text-xs py-3.5 rounded-xl border border-slate-100 transition text-center cursor-pointer"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => handleOpenRegister(course)}
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs py-3.5 rounded-xl transition text-center shadow-sm cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal Dialog */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-50 relative">
            {/* Header Image */}
            <div className="h-56 bg-cover bg-center relative" style={{ backgroundImage: `url(${selectedCourse.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-5 left-6 text-white">
                <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  HẠNG {selectedCourse.id}
                </span>
                <h2 className="text-xl font-bold mt-1.5">{selectedCourse.name}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-semibold text-slate-700">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">Thời gian học</span>
                  <span className="text-blue-950">{selectedCourse.duration}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">Học phí trọn gói</span>
                  <span className="text-orange-600 font-black">{formatCurrency(selectedCourse.fee)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Mô tả khóa học</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedCourse.description}</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Điều kiện ghi danh</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/40 p-3 rounded-lg border border-blue-50">{selectedCourse.requirements}</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-4 h-4 text-orange-500" /> Hồ sơ nhập học cần chuẩn bị
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedCourse.documents}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" /> Cam kết bao đậu lý thuyết khi thi thử đạt
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    Đóng lại
                  </button>
                  <button
                    onClick={() => {
                      const course = selectedCourse;
                      setSelectedCourse(null);
                      handleOpenRegister(course);
                    }}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-sm cursor-pointer"
                  >
                    Nộp đơn đăng ký học
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Funnel Slideover / Modal Form */}
      {showRegisterForm && registeringCourse && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 relative overflow-hidden">
            {/* Header banner */}
            <div className="bg-blue-900 text-white px-6 py-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-blue-800 text-blue-100 px-2.5 py-0.5 rounded font-extrabold uppercase">
                  ĐĂNG KÝ KHÓA HỌC TRỰC TUYẾN
                </span>
                <h3 className="text-base font-bold mt-1">Đơn Nhập Học {registeringCourse.id}</h3>
              </div>
              <button
                onClick={() => setShowRegisterForm(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Registration body form */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {success ? (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-500 text-green-500 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-blue-900 text-lg">Nộp Đơn Đăng Ký Thành Công!</h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed max-w-md mx-auto space-y-1.5 text-left">
                    <div><span className="font-bold">Họ tên học viên:</span> {success.name}</div>
                    <div><span className="font-bold">Mã số hồ sơ tạm thời:</span> <span className="font-mono font-bold text-blue-800">{success.id}</span></div>
                    <div><span className="font-bold">Hạng xe đăng ký:</span> Hạng {success.class}</div>
                    <div><span className="font-bold">Số CCCD ghi nhận:</span> {success.identity}</div>
                    <p className="pt-2 text-[10px] text-gray-400 italic font-semibold border-t border-slate-100 mt-2">
                      * Chuyên viên Tuyển sinh Thanh Thuỷ sẽ gọi điện tư vấn chi tiết lịch khai giảng và tiếp nhận hồ sơ gốc trong vòng 30 phút.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRegisterForm(false)}
                    className="bg-blue-950 text-white font-bold text-xs px-6 py-3 rounded-lg hover:bg-blue-900 cursor-pointer"
                  >
                    Hoàn tất & Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Visual course badge details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex justify-between items-center text-slate-700">
                    <div>
                      <span className="block text-slate-400 font-bold">Khóa học:</span>
                      <span className="font-extrabold text-blue-900">{registeringCourse.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-slate-400 font-bold">Học phí:</span>
                      <span className="font-black text-orange-600">{formatCurrency(registeringCourse.fee)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Họ và tên học viên <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Số điện thoại liên lạc <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0912345678"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Số CCCD/CMND <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.identity}
                        onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                        placeholder="12 số căn cước..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Ngày sinh học viên</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Địa chỉ thường trú/Tạm trú</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Thanh Thuỷ, Phú Thọ"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Người giới thiệu/Giáo viên chỉ định</label>
                      <input
                        type="text"
                        value={formData.teacher}
                        onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                        placeholder="Thầy Đức / Cô Hà... (nếu có)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Hạng xe đăng ký</label>
                      <input
                        type="text"
                        disabled
                        value={"Hạng " + registeringCourse.id}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-xs bg-slate-50 font-bold text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Lời nhắn / Yêu cầu riêng</label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ghi chú thêm về giờ học rảnh của bạn..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Gửi Đơn Đăng Ký Học Ngay"
                    )}
                    {submitting ? "Đang lưu hồ sơ bảo mật..." : "Nộp Hồ Sơ Đăng Ký"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
