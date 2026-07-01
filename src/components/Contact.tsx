import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, ExternalLink, ShieldCheck, CheckCircle, Globe } from 'lucide-react';
import { toast } from '../utils/toast';

export default function Contact({ info }: { info?: any }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Yêu cầu tư vấn khóa học lái xe',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      setError("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Lời nhắn");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gửi lời nhắn thất bại");
      }

      setSuccess(true);
      toast.success("Gửi yêu cầu liên hệ thành công! Chúng tôi sẽ phản hồi bạn sớm nhất.");
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'Yêu cầu tư vấn khóa học lái xe',
        message: ''
      });
    } catch (err: any) {
      setError(err.message || "Lỗi hệ thống khi gửi thông tin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto" id="contact-page-section">
      <div className="text-center mb-12">
        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Liên hệ & Hỗ trợ</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Kết Nối Với Chúng Tôi</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Trung tâm dạy nghề Thanh Thuỷ luôn sẵn sàng lắng nghe, tư vấn tận tình mọi thắc mắc về khóa học, thủ tục hồ sơ và lịch thi sát hạch của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Contact Info Details - 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
              <Phone className="w-64 h-64" />
            </div>

            <h2 className="text-xl font-bold mb-6 text-orange-400">Thông Tin Liên Hệ</h2>

            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-blue-200">ĐỊA CHỈ TRUNG TÂM</h3>
                  <p className="text-sm mt-1 leading-relaxed">{info?.address || "Khu 3, Thị trấn Thanh Thuỷ, Huyện Thanh Thuỷ, Tỉnh Phú Thọ"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-blue-200">ĐƯỜNG DÂY NÓNG (HOTLINE)</h3>
                  <p className="text-lg font-bold mt-1 text-white">{info?.hotline || "0988 123 456"}</p>
                  <p className="text-xs text-blue-300 mt-0.5">Tư vấn miễn phí 24/7 (Cả Thứ 7, Chủ Nhật)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-blue-200">HÒM THƯ ĐIỆN TỬ (EMAIL)</h3>
                  <p className="text-sm mt-1 text-white">{info?.email || "thanhtuydaynghe@example.com"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-blue-200">WEBSITE CHÍNH THỨC</h3>
                  <p className="text-sm mt-1 text-white">
                    <a href={info?.websiteUrl || `https://${info?.domain || 'daynghelaixethanhthuy.com'}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-orange-400 font-bold">
                      {info?.domain || "daynghelaixethanhthuy.com"}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6 flex gap-3">
              <a
                href={info?.hotline ? `tel:${info.hotline.replace(/\s+/g, '')}` : "tel:0988123456"}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition text-center flex-1 cursor-pointer"
              >
                Gọi Hotline
              </a>
              <a
                href={info?.zalo ? (info.zalo.startsWith('http') ? info.zalo : `https://zalo.me/${info.zalo.replace(/\s+/g, '')}`) : "https://zalo.me/0988123456"}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition text-center flex-1 cursor-pointer"
              >
                Nhắn Zalo
              </a>
            </div>
          </div>

          {/* Opening hours block */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Thời gian làm việc</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex justify-between">
                <span>Thứ Hai - Thứ Sáu:</span>
                <span className="font-semibold text-slate-900">07:30 - 17:30</span>
              </li>
              <li className="flex justify-between">
                <span>Thứ Bảy, Chủ Nhật:</span>
                <span className="font-semibold text-slate-900">08:00 - 17:00</span>
              </li>
              <li className="border-t border-slate-50 pt-2 text-blue-700 font-medium">
                * Học viên tập thực hành sa hình có thể xếp lịch tập ngoài giờ đến 21:00 tối với giáo viên phụ trách.
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic Submission Form - 7 columns */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl p-8 border border-slate-50">
          <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-1.5">
            <MessageSquare className="text-orange-500 w-5 h-5" /> Gửi Yêu Cầu Tư Vấn Nhanh
          </h2>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-900 rounded-xl p-6 text-center animate-fade-in">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">Gửi Lời Nhắn Thành Công!</h3>
              <p className="text-sm text-green-700">
                Cảm ơn bạn đã gửi liên hệ. Đội ngũ chuyên viên tư vấn tuyển sinh tại Thanh Thuỷ sẽ chủ động gọi điện hỗ trợ bạn trong vòng 15-30 phút tới.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 text-xs font-semibold text-blue-900 hover:underline cursor-pointer"
              >
                Gửi tiếp lời nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Họ và tên của bạn <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Số điện thoại liên lạc <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Hòm thư điện tử (Không bắt buộc)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ví dụ: nguyenvana@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tiêu đề liên hệ</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 text-sm font-medium focus:outline-none bg-white"
                  >
                    <option value="Yêu cầu tư vấn khóa học lái xe">Tư vấn khóa học lái xe</option>
                    <option value="Hỏi về lịch thi sát hạch">Lịch thi sát hạch</option>
                    <option value="Yêu cầu hỗ trợ hồ sơ">Hồ sơ / Bổ sung giấy tờ</option>
                    <option value="Hợp tác tuyển sinh đào tạo">Hợp tác tuyển sinh</option>
                    <option value="Ý kiến đóng góp khác">Ý kiến đóng góp khác</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nội dung câu hỏi / yêu cầu cụ thể <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Nhập nội dung chi tiết bạn cần hỗ trợ tư vấn..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-600 text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 pb-2">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span>Cam kết bảo mật 100% thông tin cá nhân của học viên đăng ký.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-blue-100 transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Đang xử lý..." : "Gửi thông tin liên hệ"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Styled Responsive Google Maps mock */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 overflow-hidden mb-12">
        <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Vị Trí Bản Đồ Trung Tâm Sát Hạch</h3>
            <p className="text-xs text-gray-500">Thị trấn Thanh Thuỷ, Huyện Thanh Thuỷ, Tỉnh Phú Thọ (Bên cạnh Sân vận động huyện)</p>
          </div>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 shrink-0"
          >
            Mở trong Google Maps <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Aesthetic Google Map Illustration */}
        <div className="h-80 w-full rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200")' }}>
          <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px]" />
          <div className="absolute bg-white/95 text-slate-800 p-5 rounded-xl shadow-xl max-w-sm border border-slate-100 relative z-10 m-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <MapPin className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-blue-900 text-sm">SÂN SÁT HẠCH THANH THUỶ</h4>
              <p className="text-xs text-gray-600 mt-1">Nằm ngay cạnh Sân vận động Huyện, thuận tiện di chuyển, bến xe buýt Phú Thọ đỗ tận cửa.</p>
              <span className="inline-block bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded mt-2.5">Mở cửa đón khách</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
