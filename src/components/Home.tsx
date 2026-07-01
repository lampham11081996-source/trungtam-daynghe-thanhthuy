import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Trophy, Users, Award, Clock, ArrowRight, Video, ChevronLeft, ChevronRight, HelpCircle, PhoneCall, Star, FileText, MapPin, Map, Navigation } from 'lucide-react';
import { Course, News, AlbumItem } from '../types';
import { DEFAULT_SLIDES, DEFAULT_ADVANTAGES, DEFAULT_COMMITMENTS } from '../utils/defaults';

interface HomeProps {
  info: any;
  courses: Course[];
  news: News[];
  albums: AlbumItem[];
  onChangeTab: (tabName: string) => void;
}

export default function Home({ info = {}, courses, news, albums, onChangeTab }: HomeProps) {
  // Banner Slide Show State
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = info.slides && info.slides.length > 0 ? info.slides : DEFAULT_SLIDES;
  const advantages = info.advantages && info.advantages.length === 4 ? info.advantages : DEFAULT_ADVANTAGES;
  const commitments = info.commitments && info.commitments.length > 0 ? info.commitments : DEFAULT_COMMITMENTS;


  // Auto slide loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  // Quick Consult Form State
  const [consultForm, setConsultForm] = useState({ name: '', phone: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.name || !consultForm.phone) return;
    setSubmitting(true);
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: consultForm.name,
          phone: consultForm.phone,
          message: consultForm.note || "Đăng ký tư vấn nhanh từ Trang chủ"
        })
      });
      setSuccess(true);
      setConsultForm({ name: '', phone: '', note: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out featured courses & images
  const featuredCourses = courses.filter(c => c.featured && c.status === 'active');
  const photoGallery = albums.filter(a => a.type === 'image').slice(0, 3);
  const videoGallery = albums.filter(a => a.type === 'video').slice(0, 1);
  const latestNews = news.slice(0, 3);

  // Helper to convert watch link to embed link
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/;
    const match = url.match(watchRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  const primaryVideoUrl = info.introVideoUrl ? getEmbedUrl(info.introVideoUrl) : (videoGallery[0]?.url || '');

  const testimonials = info.testimonials && info.testimonials.length > 0 ? info.testimonials : [
    {
      name: "Anh Hoàng Lâm (Học viên B2)",
      text: "Tôi cực kỳ hài lòng với sân tập cảm biến của trung tâm. Thầy Đức dạy rất tỉ mỉ, không hề cáu gắt quát mắng. Nhờ trung tâm mà tôi đã thi đậu ngay từ lần đầu tiên với số điểm sa hình 95/100.",
      score: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
    },
    {
      name: "Chị Thảo Nguyên (Học viên B1)",
      text: "Lịch học tự chọn rất linh hoạt nên một nhân viên văn phòng bận rộn như tôi cũng có thể dễ dàng theo học vào cuối tuần. Xe tập lái Vios 100% đời mới sạch sẽ mát mẻ, giáo viên kèm 1:1 siêu tận tâm.",
      score: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
    },
    {
      name: "Chú Tiến Thành (Học viên nâng Hạng D)",
      text: "Hồ sơ pháp lý của trung tâm Thanh Thuỷ rất rõ ràng, cam kết trọn gói là trọn gói thật, không hề có chuyện thu thêm bồi dưỡng hay phụ phí xăng dầu. Rất uy tín và đáng tin cậy tại Phú Thọ.",
      score: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
    }
  ];

  return (
    <div className="space-y-16 pb-12" id="home-view-container">
      {/* 1. Large Slider Hero Banner */}
      <div className="relative h-[450px] sm:h-[550px] w-full overflow-hidden bg-slate-900 group">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/40 to-transparent" />
            
            {/* Banner content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-4xl mx-auto px-6 w-full text-white space-y-6">
                <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit block shadow-md">
                  Trung tâm dạy nghề Thanh Thuỷ
                </span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl font-display">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      onChangeTab(slide.tab);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-orange-100 transition duration-200 cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Manual Slides Controls */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full z-20 cursor-pointer transition hidden group-hover:block"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full z-20 cursor-pointer transition hidden group-hover:block"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. 4 Core Advantages Block */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {advantages.map((adv: any, idx: number) => {
          const Icon = [Award, ShieldCheck, Users, Trophy][idx] || Award;
          const bgClass = idx % 2 === 0 ? "bg-blue-50 border-blue-100 text-blue-900" : "bg-orange-50 border-orange-100 text-orange-600";
          const iconClass = idx % 2 === 0 ? "text-blue-800" : "text-orange-500";
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
                <Icon className={`w-6 h-6 ${iconClass}`} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm">{adv.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{adv.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Brief Introduction Section */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column text */}
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">Giới thiệu tổng quan</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-display">
            Trung Tâm Đào Tạo & Sát Hạch Lái Xe Uy Tín Tại Phú Thọ
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {info.intro || "Trung tâm Dạy nghề Thanh Thuỷ tự hào là một trong những đơn vị đào tạo lái xe ô tô có chất lượng hàng đầu tại khu vực. Với phương châm giúp học viên làm chủ tay lái trên mọi cung đường, chúng tôi đầu tư đồng bộ về cơ sở vật chất, hệ thống phòng học lý thuyết đạt chuẩn và xe tập lái đời mới 100% trang bị máy lạnh."}
          </p>
          <div className="pt-2">
            <button
              onClick={() => { onChangeTab('about'); window.scrollTo({ top: 0 }); }}
              className="text-xs font-bold text-blue-900 hover:text-orange-500 transition flex items-center gap-1 cursor-pointer"
            >
              Tìm hiểu thêm về trung tâm <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right column graphic badge */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 to-blue-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-5 translate-y-5">
            <ShieldCheck className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="font-bold text-lg text-orange-400">Cam Kết Đào Tạo Thanh Thuỷ</h3>
            <div className="space-y-4">
              {commitments.map((com: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0 mt-1.5" />
                  <span>{com}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-extrabold text-white">Hotline hỗ trợ: {info.hotline || "0988 123 456"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Featured Courses Preview */}
      <div className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">Tuyển sinh liên tục</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-display">Khóa Đào Tạo Nổi Bật</h2>
            <p className="text-xs text-gray-500">
              Chi tiết học phí trọn gói cam kết không phát sinh, thời gian ôn tập cấp bằng lái xe nhanh nhất Phú Thọ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition flex flex-col justify-between h-full"
              >
                <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">Hạng {course.id}</span>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{course.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{course.description}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-gray-400 block font-bold uppercase">Trọn gói</span>
                      <span className="text-sm font-black text-orange-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.fee)}
                      </span>
                    </div>
                    <button
                      onClick={() => { onChangeTab('courses'); window.scrollTo({ top: 0 }); }}
                      className="text-xs font-bold text-blue-900 hover:text-orange-500 cursor-pointer flex items-center gap-1 transition"
                    >
                      Đăng ký học <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Photo Album & Videos Section */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Photos grid - 7 columns */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">Hình ảnh thực tế</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-blue-950 font-display">Học Viên & Sân Sát Hạch</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {photoGallery.length > 0 ? (
              photoGallery.map((p, idx) => (
                <div key={idx} className="h-44 sm:h-56 rounded-2xl overflow-hidden border border-slate-100 group relative">
                  <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-150 p-3 flex items-end">
                    <p className="text-[10px] text-white font-bold leading-tight">{p.title}</p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback seed images
              <>
                <div className="h-44 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200" />
                <div className="h-44 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200" />
                <div className="h-44 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200" />
              </>
            )}
          </div>
        </div>

        {/* Video embed - 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">Video clip giới thiệu</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-blue-950 font-display">Khám Phá Toàn Cảnh Sân Thi</h2>
          </div>

          {primaryVideoUrl ? (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-black">
              <iframe
                title="Video giới thiệu toàn cảnh sân thi"
                src={primaryVideoUrl}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
              <Video className="w-10 h-10 text-gray-400 mb-2 animate-pulse" />
              <p className="text-xs text-gray-500 font-semibold">Chưa thiết lập video giới thiệu từ ban giám hiệu</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. Testimonials Section */}
      <div className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">Ý kiến khách hàng</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-display">Học Viên Nói Gì Về Thanh Thuỷ?</h2>
            <p className="text-xs text-gray-500">Đánh giá thực tế từ các thế hệ học viên đã nhận bằng lái xe ô tô tại trung tâm.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(t.score)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <img src={t.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                  <span className="font-extrabold text-slate-800 text-xs">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Quick Consultation Request Form */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left narrative */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
          <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full w-fit">
            Gửi yêu cầu gọi lại
          </span>
          <h2 className="text-2xl font-black text-blue-950 font-display">
            Bạn Đang Băn Khoăn Chưa Biết Chọn Hạng Bằng Nào?
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hãy để lại tên và số điện thoại liên lạc của bạn. Đội ngũ tư vấn tuyển sinh chuyên nghiệp của Trung tâm dạy nghề Thanh Thuỷ sẽ chủ động gọi lại trao đổi cặn kẽ, tư vấn kỹ lưỡng các gói học phí, thời gian thi phù hợp với nhu cầu của bạn hoàn toàn miễn phí.
          </p>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          {success ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-12 h-12 rounded-full bg-green-50 border-4 border-green-500 text-green-500 flex items-center justify-center mx-auto animate-bounce">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-blue-950 text-base">Gửi yêu cầu tư vấn thành công!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cảm ơn bạn đã quan tâm. Chuyên viên tư vấn Thanh Thuỷ sẽ chủ động gọi điện hỗ trợ bạn trong vài phút tới.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Họ và tên của bạn <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={consultForm.name}
                    onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Số điện thoại di động <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={consultForm.phone}
                    onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Bạn muốn học lái xe hạng gì? (Không bắt buộc)</label>
                <input
                  type="text"
                  value={consultForm.note}
                  onChange={(e) => setConsultForm({ ...consultForm, note: e.target.value })}
                  placeholder="Ví dụ: Tôi muốn học B2 vào cuối tuần..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !consultForm.name || !consultForm.phone}
                className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-xl transition duration-150 shadow-md text-xs cursor-pointer"
              >
                {submitting ? "Đang gửi yêu cầu..." : "Gửi Đăng Ký Tư Vấn Miễn Phí"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 8. Latest News block inside Home */}
      <div className="max-w-6xl mx-auto px-6 border-t border-slate-100 pt-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">Tin tuyển sinh & hoạt động</span>
            <h2 className="text-2xl font-extrabold text-blue-950 font-display">Tin Tức Sự Kiện Mới Nhất</h2>
          </div>
          <button
            onClick={() => { onChangeTab('news'); window.scrollTo({ top: 0 }); }}
            className="text-xs font-bold text-blue-900 hover:text-orange-500 flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            Tất cả bài viết <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestNews.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full"
            >
              <div className="h-40 bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url(${article.image})` }} onClick={() => { onChangeTab('news'); window.scrollTo({ top: 0 }); }} />
              <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">{article.category}</span>
                  <h3 className="font-bold text-slate-900 text-xs leading-snug hover:text-blue-900 cursor-pointer line-clamp-2" onClick={() => { onChangeTab('news'); window.scrollTo({ top: 0 }); }}>{article.title}</h3>
                  <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">{article.summary}</p>
                </div>
                <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                  <span>{article.date}</span>
                  <button onClick={() => { onChangeTab('news'); window.scrollTo({ top: 0 }); }} className="text-blue-900 hover:underline">Chi tiết</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Google Map Directions Section */}
      <div className="max-w-6xl mx-auto px-6 border-t border-slate-100 pt-16 pb-12" id="home-google-map-section">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block flex items-center justify-center gap-1.5">
            <Map className="w-3.5 h-3.5" /> Chỉ đường & Vị trí
          </span>
          <h2 className="text-2xl font-extrabold text-blue-950 font-display mt-1">Bản Đồ Chỉ Đường Đến Trung Tâm</h2>
          <p className="text-xs text-slate-500 mt-2">
            Tìm vị trí chính xác và nhận chỉ đường nhanh nhất trên Google Maps để tới sân tập lái xe Thanh Thuỷ, Phú Thọ.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Info Details Column */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-slate-50/50 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider">Vị trí sân tập</h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">{info.address || "Huyện Thanh Thuỷ, Phú Thọ"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider">Hỗ trợ chỉ đường</h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">Hotline: {info.hotline || "0988.123.456"}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs">Hướng dẫn di chuyển:</h4>
                <ul className="mt-2 space-y-1.5 text-slate-500 text-[11px] leading-relaxed list-disc list-inside">
                  <li>Học viên từ Việt Trì hoặc Hà Nội đi theo tuyến Quốc lộ 32.</li>
                  <li>Xe đưa đón học viên miễn phí từ các điểm trung chuyển.</li>
                  <li>Có bãi đậu xe ô tô và xe máy rộng rãi tại khu vực trung tâm.</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 sm:pt-0">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(info.address || "Trung tâm sát hạch lái xe Thanh Thủy, Phú Thọ")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Navigation className="w-4 h-4" /> Mở Trên Google Maps
              </a>
            </div>
          </div>

          {/* Map Embed Column */}
          <div className="lg:col-span-8 h-[350px] lg:h-[420px] bg-slate-100 relative">
            <iframe
              src={(() => {
                const rawUrl = info.googleMapUrl;
                if (!rawUrl) {
                  return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2023.5594813936787!2d105.28754811754581!3d21.097408127021218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313463c83064af51%3A0xa61672cbbe571ffa!2zVHJ1bmcgVMOibSBE4bqheSBOZ2jhu4EgVGhhbmggVGjhu6d5!5e1!3m2!1svi!2s!4v1782813643362!5m2!1svi!2s";
                }
                if (rawUrl.includes("<iframe")) {
                  const match = rawUrl.match(/src="([^"]+)"/);
                  if (match && match[1]) {
                    return match[1];
                  }
                }
                return rawUrl;
              })()}
              className="w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map Trung Tâm Sát Hạch Lái Xe Thanh Thuỷ"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
