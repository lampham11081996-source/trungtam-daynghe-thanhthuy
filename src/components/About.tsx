import React from 'react';
import { Award, ShieldCheck, Milestone, CheckCircle2, Star, Users, MapPin } from 'lucide-react';
import { 
  DEFAULT_ABOUT_FEATURES, 
  DEFAULT_FACILITIES, 
  DEFAULT_TEACHERS, 
  DEFAULT_QUALITY_COMMITMENTS 
} from '../utils/defaults';

interface AboutProps {
  info: any;
}

export default function About({ info = {} }: AboutProps) {
  // Extract and fall back dynamic variables
  const aboutYears = info.aboutYears || "10+";
  const aboutTitle = info.aboutTitle || "Hành Trình Kiến Tạo Những Hành Trình An Toàn";
  const aboutDesc1 = info.aboutDesc1 || "Được thành lập với sứ mệnh phổ cập kỹ năng điều khiển phương tiện giao thông an toàn và chuyên nghiệp, Trung tâm Dạy nghề Thanh Thuỷ đã trở thành điểm đến tin cậy của hơn 15.000 học viên tại Phú Thọ và các tỉnh lân cận. Chúng tôi tự hào sở hữu quy trình đào tạo đồng bộ, chú trọng thực hành kỹ năng xử lý tình huống khẩn cấp hơn là việc học thuộc lòng máy móc.";
  const aboutDesc2 = info.aboutDesc2 || "Với quy mô rộng hơn 2 hecta đặt ngay tại trung tâm huyện Thanh Thuỷ, sân sát hạch sa hình của chúng tôi đạt chuẩn ISO của Bộ Giao Thông Vận Tải, bao gồm toàn bộ 11 bài thi sát hạch liên hoàn như vệt bánh xe, đường vòng quanh co, ghép xe dọc ghép xe ngang, dừng và khởi hành xe ngang dốc thiết kế cảm biến 100% giống như ngày thi thật.";
  
  const aboutFeatures = info.aboutFeatures && info.aboutFeatures.length === 4 
    ? info.aboutFeatures 
    : DEFAULT_ABOUT_FEATURES;

  const facilities = info.facilities && info.facilities.length === 3 
    ? info.facilities 
    : DEFAULT_FACILITIES;

  const teachers = info.teachers && info.teachers.length === 4 
    ? info.teachers 
    : DEFAULT_TEACHERS;

  const qualityCommitmentTitle = info.qualityCommitmentTitle || "Cam Kết Chất Lượng Đào Tạo";
  const qualityCommitmentDesc = info.qualityCommitmentDesc || "Chúng tôi luôn tâm niệm lấy sự an toàn và thành công của học viên làm trọng tâm phát triển. Trung tâm dạy nghề Thanh Thuỷ cam kết thực thi nghiêm ngặt 3 KHÔNG:";
  const qualityCommitments = info.qualityCommitments && info.qualityCommitments.length === 3 
    ? info.qualityCommitments 
    : DEFAULT_QUALITY_COMMITMENTS;

  const legalTitle = info.legalTitle || "Hồ Sơ Pháp Lý Độc Lập";
  const legalDesc = info.legalDesc || "Trung tâm dạy nghề Thanh Thuỷ được thành lập và hoạt động dưới sự cấp phép, giám sát chặt chẽ của Sở Giao Thông Vận Tải tỉnh Phú Thọ. Toàn bộ hồ sơ thi sát hạch đều là hồ sơ gốc, học viên có quyền tự do kiểm tra và lưu giữ thông tin học tập của mình minh bạch trên cơ sở dữ liệu hệ thống quốc gia.";
  const legalBadge = info.legalBadge || "Đạt danh hiệu \"Đơn vị Đào tạo Lái xe xuất sắc tỉnh Phú Thọ\" liên tiếp nhiều năm liền.";
  const legalFooter = info.legalFooter || "Giấy phép hoạt động số 4122/GP-SGTVT cấp phép bởi Sở Giao Thông Vận Tải Phú Thọ.";

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto" id="about-us-section">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Lịch sử & Sứ mệnh</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Về {info.name || "Trung Tâm Dạy Nghề Thanh Thuỷ"}</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Tìm hiểu chặng đường xây dựng thương hiệu đào tạo lái xe uy tín hàng đầu với triết lý học thật, thi thật, kỹ năng thật.
        </p>
      </div>

      {/* Main presentation grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
        {/* Left Side: Images */}
        <div className="lg:col-span-5 relative">
          <div className="bg-orange-500 rounded-3xl absolute inset-0 transform rotate-3 scale-95 opacity-25 z-0" />
          <img
            src={info.banner || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600"}
            alt="Driving School Training Yard"
            className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-80 sm:h-96"
            referrerPolicy="no-referrer"
          />
          {/* Overlay stats badges */}
          <div className="absolute -bottom-6 -right-4 bg-white text-slate-800 p-4 rounded-2xl shadow-xl z-20 border border-slate-50 flex items-center gap-3">
            <span className="text-3xl font-black text-blue-900 leading-none">{aboutYears}</span>
            <div className="text-[10px] text-gray-500 font-bold leading-tight">
              NĂM KINH NGHIỆM<br />ĐÀO TẠO LÁI XE
            </div>
          </div>
        </div>

        {/* Right Side: Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-extrabold text-blue-950 font-display">
            {aboutTitle}
          </h2>
          
          <p className="text-sm text-slate-600 leading-relaxed">
            {aboutDesc1}
          </p>

          <p className="text-sm text-slate-600 leading-relaxed">
            {aboutDesc2}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {aboutFeatures.map((feat: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-bold block">{feat.title}</strong>
                  <span className="text-slate-500">{feat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities detail grid */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-blue-950 mb-6 text-center flex items-center justify-center gap-1.5 border-b border-slate-100 pb-3">
          <Milestone className="text-orange-500 w-5 h-5" /> Cơ Sở Vật Chất Đạt Tiêu Chuẩn Quốc Gia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facilities.map((fac: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              <img src={fac.image} alt={fac.title} className="h-44 w-full object-cover" />
              <div className="p-5 space-y-2 flex-grow">
                <h3 className="font-extrabold text-slate-900 text-sm">{fac.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teachers Section */}
      <div className="mb-16 bg-blue-50/50 rounded-3xl p-8 sm:p-10 border border-blue-100/50">
        <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
          <h2 className="text-xl font-bold text-blue-950 flex items-center justify-center gap-1.5 font-display">
            <Users className="text-orange-500 w-5 h-5" /> Đội Ngũ Giáo Viên Sư Phạm Tận Tâm
          </h2>
          <p className="text-xs text-gray-500">
            100% giáo viên tại {info.name || "trung tâm"} đều sở hữu Chứng chỉ Sư phạm Đào tạo Lái xe do Sở Giao Thông Vận Tải kiểm tra sát hạch cấp phép hàng năm.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center space-y-3 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <img src={teacher.image} alt={teacher.name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-blue-100" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{teacher.name}</h4>
                  <p className="text-[10px] text-blue-800 font-semibold uppercase mt-0.5">{teacher.role}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic mt-2">"{teacher.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Commitments & Guarantee section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl shadow-xl p-8 text-white flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-orange-400 flex items-center gap-1.5 font-display">
              <Award className="w-5 h-5" /> {qualityCommitmentTitle}
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              {qualityCommitmentDesc}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-blue-200">
              {qualityCommitments.map((com: string, idx: number) => {
                const parts = com.split(':');
                if (parts.length > 1) {
                  return (
                    <li key={idx}>
                      <strong>{parts[0]}:</strong>{parts.slice(1).join(':')}
                    </li>
                  );
                }
                return <li key={idx}>{com}</li>;
              })}
            </ul>
          </div>
          <div className="pt-6 border-t border-white/10 mt-6 text-[10px] text-blue-300">
            * Mọi hành vi sai phạm của giáo viên sẽ bị xử lý kỷ luật nghiêm khắc. Tổng đài phản ánh trực tiếp Ban Giám Hiệu: {info.hotline || "0988 123 456"}.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 font-display">
              <ShieldCheck className="text-emerald-600 w-5 h-5" /> {legalTitle}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {legalDesc}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-800 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
              <Star className="text-yellow-500 w-4 h-4 fill-current shrink-0" />
              <span>{legalBadge}</span>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 mt-6 text-[10px] text-gray-400">
            {legalFooter}
          </div>
        </div>
      </div>
    </div>
  );
}
