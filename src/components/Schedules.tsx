import { useState } from 'react';
import { Calendar, Filter, Search, MapPin, Bell, Info } from 'lucide-react';
import { Schedule } from '../types';

interface SchedulesProps {
  schedules: Schedule[];
}

export default function Schedules({ schedules }: SchedulesProps) {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const classFilters = [
    { value: 'All', label: 'Tất cả hạng xe' },
    { value: 'B1', label: 'Hạng B1' },
    { value: 'B2', label: 'Hạng B2' },
    { value: 'C', label: 'Hạng C' },
    { value: 'D', label: 'Hạng D' }
  ];

  // Derive unique months in database schedule list (format: YYYY-MM)
  const getMonthsList = () => {
    const months = new Set<string>();
    schedules.forEach(s => {
      if (s.date) {
        const month = s.date.substring(0, 7); // e.g., "2026-07"
        months.add(month);
      }
    });
    return Array.from(months).sort();
  };

  const monthsList = getMonthsList();

  const formatMonthLabel = (yyyyMM: string) => {
    const parts = yyyyMM.split('-');
    return `Tháng ${parts[1]}/${parts[0]}`;
  };

  const filteredSchedules = schedules.filter(s => {
    // Class filter: matches exact or sub-string (e.g., 'Hạng B1 & B2' matches 'B1' or 'B2')
    const matchesClass = selectedClass === 'All' || 
                         s.class.toLowerCase().includes(selectedClass.toLowerCase());
                         
    // Month filter
    const matchesMonth = selectedMonth === 'All' || 
                         s.date.startsWith(selectedMonth);

    // Search text query
    const matchesSearch = s.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.notes.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClass && matchesMonth && matchesSearch;
  });

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto" id="schedules-portal-section">
      <div className="text-center mb-8">
        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Thông báo lịch trình</span>
        <h1 className="text-3xl font-extrabold text-blue-900 mt-2">Lịch Học & Lịch Sát Hạch Lái Xe</h1>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Cập nhật chi tiết lịch học lý thuyết tập trung, lịch tập lái xe sa hình thực tế dã ngoại và lịch thi sát hạch cấp bằng của Sở Giao Thông Vận Tải Phú Thọ.
        </p>
      </div>

      {/* Advanced Filter Console */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
          <Filter className="w-4 h-4 text-blue-900" /> BỘ LỌC TÌM KIẾM NHANH
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Filter dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Lọc theo hạng xe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs bg-white font-medium"
            >
              <option value="All">Tất cả hạng xe</option>
              <option value="B1">Hạng B1 (Số tự động)</option>
              <option value="B2">Hạng B2 (Số sàn)</option>
              <option value="C">Hạng C (Xe tải)</option>
              <option value="D">Hạng D/E (Nâng hạng)</option>
            </select>
          </div>

          {/* Month Filter dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Lọc theo tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs bg-white font-medium"
            >
              <option value="All">Tất cả các tháng</option>
              {monthsList.map(m => (
                <option key={m} value={m}>{formatMonthLabel(m)}</option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Từ khóa tự do</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập nội dung, địa điểm học..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedules Results */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm animate-fade-in">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Hiện không tìm thấy lịch trình đào tạo nào khớp với bộ lọc của bạn</p>
          <p className="text-xs text-gray-400 mt-1">Vui lòng quay lại sau hoặc liên hệ văn phòng tuyển sinh để nhận lịch cứng trực tiếp.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table headers for desktop screen */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-blue-900 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-sm uppercase tracking-wider">
            <div className="col-span-2">Ngày học/thi</div>
            <div className="col-span-2">Áp dụng lớp</div>
            <div className="col-span-4">Nội dung chi tiết</div>
            <div className="col-span-3">Địa điểm diễn ra</div>
            <div className="col-span-1 text-right">Lưu ý</div>
          </div>

          {/* Schedule rows */}
          <div className="space-y-4">
            {filteredSchedules.map((schedule) => {
              // Extract date fields
              const dateObj = new Date(schedule.date);
              const dayStr = String(dateObj.getDate()).padStart(2, '0');
              const mthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
              const isExam = schedule.subject.toLowerCase().includes('thi sát hạch') || 
                             schedule.subject.toLowerCase().includes('sát hạch');

              return (
                <div
                  key={schedule.id}
                  className={`bg-white rounded-2xl shadow-sm border p-5 md:p-6 transition-all duration-150 grid grid-cols-1 md:grid-cols-12 gap-4 items-center ${
                    isExam ? 'border-red-100 hover:border-red-200 bg-red-50/10' : 'border-slate-100 hover:border-blue-100'
                  }`}
                >
                  {/* Date Column */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 border ${
                      isExam 
                        ? 'bg-red-600 border-red-500 text-white shadow-sm' 
                        : 'bg-blue-50 border-blue-100 text-blue-900'
                    }`}>
                      <span className="text-lg leading-none pt-0.5">{dayStr}</span>
                      <span className="text-[9px] leading-tight font-extrabold uppercase mt-0.5">Tháng {mthStr}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 md:hidden">Lịch học ngày {schedule.date}</span>
                  </div>

                  {/* Class Column */}
                  <div className="col-span-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isExam 
                        ? 'bg-red-50 text-red-700 border border-red-100' 
                        : 'bg-blue-50 text-blue-800 border border-blue-100'
                    }`}>
                      {schedule.class}
                    </span>
                  </div>

                  {/* Subject Column */}
                  <div className="col-span-4 space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                      {isExam && <Bell className="w-4 h-4 text-red-600 animate-bounce shrink-0" />}
                      {schedule.subject}
                    </h4>
                    {schedule.notes && (
                      <p className="text-xs text-slate-500 leading-relaxed md:hidden">
                        <strong className="text-slate-600">Ghi chú:</strong> {schedule.notes}
                      </p>
                    )}
                  </div>

                  {/* Location Column */}
                  <div className="col-span-3 text-xs text-slate-600 flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{schedule.location}</span>
                  </div>

                  {/* Notes Column */}
                  <div className="col-span-1 text-right text-xs">
                    {schedule.notes ? (
                      <div className="group relative inline-block">
                        <span className="text-blue-800 hover:text-blue-950 font-bold underline cursor-help flex items-center justify-end gap-0.5">
                          <Info className="w-3.5 h-3.5 inline" /> Chi tiết
                        </span>
                        {/* Custom hover tooltip */}
                        <div className="hidden group-hover:block absolute right-0 bottom-full mb-2 bg-slate-900 text-white p-3 rounded-lg w-56 text-[11px] text-left leading-relaxed shadow-xl z-20">
                          {schedule.notes}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-medium">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating support tip */}
      <div className="mt-8 bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-slate-600">
        <Bell className="w-4.5 h-4.5 text-orange-500 shrink-0 animate-pulse mt-0.5" />
        <div>
          <strong className="text-slate-800 font-bold block mb-0.5">Học viên lưu ý lịch thay đổi:</strong>
          Tất cả học viên phải đăng ký lịch học thực hành trực tiếp qua Cổng quản lý trước tối thiểu 24 giờ. Trường hợp bận đột xuất không thể lên xe tập, vui lòng liên hệ Thầy/Cô trực tiếp phụ trách trước 18:00 chiều ngày hôm trước để không bị trừ buổi huấn luyện dã ngoại trong học bạ sát hạch.
        </div>
      </div>
    </div>
  );
}
