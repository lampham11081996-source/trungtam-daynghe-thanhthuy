import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Settings, BookOpen, Users, Calendar, FileText, HelpCircle,
  Image as ImageIcon, Mail, FileClock, ShieldCheck, LogIn, LogOut, Plus, Edit,
  Trash2, Download, Upload, Eye, Check, AlertCircle, RefreshCw, Database,
  Layout, Award, CheckSquare, Type, MapPin, X, MessageSquare, Star, UserCheck, KeyRound
} from 'lucide-react';
import { DEFAULT_SLIDES, DEFAULT_ADVANTAGES, DEFAULT_COMMITMENTS, DEFAULT_ABOUT_FEATURES, DEFAULT_FACILITIES, DEFAULT_TEACHERS, DEFAULT_QUALITY_COMMITMENTS } from '../utils/defaults';
import { Course, Schedule, Student, Question, News, DocumentItem, AlbumItem, ContactMessage, SystemLog, UserSession, UserAccount } from '../types';
import { toast } from '../utils/toast';
import * as XLSX from 'xlsx';

interface AdminPanelProps {
  courses: Course[];
  schedules: Schedule[];
  students: Student[];
  questions: Question[];
  newsList: News[];
  documents: DocumentItem[];
  albums: AlbumItem[];
  contacts: ContactMessage[];
  logs: SystemLog[];
  info: any;
  onRefreshAll: () => void;
  onClose?: () => void;
}

type AdminTab = 'dashboard' | 'info' | 'courses' | 'students' | 'schedules' | 'news' | 'documents' | 'questions' | 'albums' | 'contacts' | 'logs' | 'backup' | 'users';

export default function AdminPanel({
  courses, schedules, students, questions, newsList, documents, albums, contacts, logs, info, onRefreshAll, onClose
}: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot password fields
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'pin'>('email');
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySecurityPin, setRecoverySecurityPin] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // User accounts management state (Admin-only)
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // User form state
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState('staff');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Custom confirm dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Xác nhận',
    isDanger: false,
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel = 'Xác nhận', isDanger = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      isDanger,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Nav state
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [infoSubTab, setInfoSubTab] = useState<'basic' | 'banners' | 'advantages' | 'about' | 'testimonials'>('basic');

  // Generic Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'course' | 'schedule' | 'student' | 'question' | 'news' | 'document' | 'album' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Excel Importer State
  const [importType, setImportType] = useState<'students' | 'questions' | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  // Local state variables for School Info, Theme and Fonts Editor
  const [infoName, setInfoName] = useState('');
  const [infoHotline, setInfoHotline] = useState('');
  const [infoAddress, setInfoAddress] = useState('');
  const [infoEmail, setInfoEmail] = useState('');
  const [infoLogo, setInfoLogo] = useState('');
  const [infoBanner, setInfoBanner] = useState('');
  const [infoIntro, setInfoIntro] = useState('');
  const [infoFooter, setInfoFooter] = useState('');
  const [infoSeoTitle, setInfoSeoTitle] = useState('');
  const [infoSeoDescription, setInfoSeoDescription] = useState('');
  const [infoSeoKeywords, setInfoSeoKeywords] = useState('');
  const [infoThemeStyle, setInfoThemeStyle] = useState('blue');
  const [infoFontFamily, setInfoFontFamily] = useState('default');
  const [infoSubtitle, setInfoSubtitle] = useState('');
  const [infoFooterSlogan, setInfoFooterSlogan] = useState('');
  const [infoIntroVideoUrl, setInfoIntroVideoUrl] = useState('');
  const [infoFooterDesc, setInfoFooterDesc] = useState('');
  const [infoFooterTag1, setInfoFooterTag1] = useState('');
  const [infoFooterTag2, setInfoFooterTag2] = useState('');
  const [infoZalo, setInfoZalo] = useState('');
  const [infoDomain, setInfoDomain] = useState('');
  const [infoWebsiteUrl, setInfoWebsiteUrl] = useState('');
  const [infoGoogleMapUrl, setInfoGoogleMapUrl] = useState('');
  const [infoTestimonials, setInfoTestimonials] = useState<any[]>([]);

  // New state variables for dynamic content sections
  const [infoSlides, setInfoSlides] = useState<any[]>(DEFAULT_SLIDES);
  const [infoAdvantages, setInfoAdvantages] = useState<any[]>(DEFAULT_ADVANTAGES);
  const [infoCommitments, setInfoCommitments] = useState<string[]>(DEFAULT_COMMITMENTS);

  const [infoAboutTitle, setInfoAboutTitle] = useState('');
  const [infoAboutYears, setInfoAboutYears] = useState('');
  const [infoAboutDesc1, setInfoAboutDesc1] = useState('');
  const [infoAboutDesc2, setInfoAboutDesc2] = useState('');
  const [infoAboutFeatures, setInfoAboutFeatures] = useState<any[]>(DEFAULT_ABOUT_FEATURES);
  const [infoFacilities, setInfoFacilities] = useState<any[]>(DEFAULT_FACILITIES);
  const [infoTeachers, setInfoTeachers] = useState<any[]>(DEFAULT_TEACHERS);

  const [infoQualityCommitmentTitle, setInfoQualityCommitmentTitle] = useState('');
  const [infoQualityCommitmentDesc, setInfoQualityCommitmentDesc] = useState('');
  const [infoQualityCommitments, setInfoQualityCommitments] = useState<string[]>(DEFAULT_QUALITY_COMMITMENTS);

  const [infoLegalTitle, setInfoLegalTitle] = useState('');
  const [infoLegalDesc, setInfoLegalDesc] = useState('');
  const [infoLegalBadge, setInfoLegalBadge] = useState('');
  const [infoLegalFooter, setInfoLegalFooter] = useState('');

  const [saveInfoLoading, setSaveInfoLoading] = useState(false);
  const [saveInfoStatus, setSaveInfoStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Course Management states
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseModalType, setCourseModalType] = useState<'add' | 'edit'>('add');
  const [courseForm, setCourseForm] = useState<Partial<Course> & { originalId?: string }>({
    id: '',
    name: '',
    fee: 0,
    duration: '',
    requirements: '',
    description: '',
    documents: '',
    image: '',
    featured: true,
    status: 'active',
    originalId: ''
  });
  const [savingCourse, setSavingCourse] = useState(false);

  // Student Management states
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentModalType, setStudentModalType] = useState<'add' | 'edit'>('add');
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    id: '',
    name: '',
    phone: '',
    identity: '',
    dob: '',
    address: '',
    class: '',
    teacher: '',
    status: 'Mới đăng ký',
    notes: ''
  });
  const [savingStudent, setSavingStudent] = useState(false);

  // Schedule Management states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleModalType, setScheduleModalType] = useState<'add' | 'edit'>('add');
  const [scheduleForm, setScheduleForm] = useState<Partial<Schedule>>({
    id: '',
    date: '',
    class: '',
    subject: '',
    location: '',
    notes: ''
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // News Management states
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [newsModalType, setNewsModalType] = useState<'add' | 'edit'>('add');
  const [newsForm, setNewsForm] = useState<Partial<News>>({
    id: '',
    title: '',
    category: 'Tuyển sinh',
    summary: '',
    content: '',
    date: '',
    author: '',
    status: 'published',
    image: ''
  });
  const [savingNews, setSavingNews] = useState(false);

  // Document Management states
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentModalType, setDocumentModalType] = useState<'add' | 'edit'>('add');
  const [documentForm, setDocumentForm] = useState<Partial<DocumentItem>>({
    id: '',
    name: '',
    category: 'Mẹo thi lý thuyết',
    fileUrl: '',
    description: '',
    downloads: 0
  });
  const [savingDocument, setSavingDocument] = useState(false);

  // Album Management states
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [albumModalType, setAlbumModalType] = useState<'add' | 'edit'>('add');
  const [albumForm, setAlbumForm] = useState<Partial<AlbumItem>>({
    id: '',
    title: '',
    type: 'image',
    url: '',
    sortOrder: 1
  });
  const [savingAlbum, setSavingAlbum] = useState(false);

  const handleOpenAddSchedule = () => {
    setScheduleModalType('add');
    setScheduleForm({
      id: '',
      date: new Date().toISOString().split('T')[0],
      class: 'B2',
      subject: 'Học lý thuyết pháp luật giao thông đường bộ',
      location: 'Phòng học lý thuyết trung tâm',
      notes: ''
    });
    setScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (schedule: Schedule) => {
    setScheduleModalType('edit');
    setScheduleForm({ ...schedule });
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.date || !scheduleForm.class || !scheduleForm.subject) {
      alert("Ngày học, Lớp học và nội dung môn học là bắt buộc!");
      return;
    }
    setSavingSchedule(true);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu lịch học/thi');
      alert(scheduleModalType === 'add' ? "Thêm lịch thành công!" : "Cập nhật lịch thành công!");
      setScheduleModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu lịch học');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleOpenAddNews = () => {
    setNewsModalType('add');
    setNewsForm({
      id: '',
      title: '',
      category: 'Tuyển sinh',
      summary: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      author: 'Ban tuyển sinh',
      status: 'published',
      image: ''
    });
    setNewsModalOpen(true);
  };

  const handleOpenEditNews = (news: News) => {
    setNewsModalType('edit');
    setNewsForm({ ...news });
    setNewsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.category || !newsForm.content) {
      alert("Tiêu đề, danh mục và nội dung bài viết là bắt buộc!");
      return;
    }
    setSavingNews(true);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newsForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài viết');
      alert(newsModalType === 'add' ? "Đăng bài viết thành công!" : "Cập nhật bài viết thành công!");
      setNewsModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu bài viết');
    } finally {
      setSavingNews(false);
    }
  };

  const handleOpenAddDocument = () => {
    setDocumentModalType('add');
    setDocumentForm({
      id: '',
      name: '',
      category: 'Mẹo thi lý thuyết',
      fileUrl: '',
      description: '',
      downloads: 0
    });
    setDocumentModalOpen(true);
  };

  const handleOpenEditDocument = (doc: DocumentItem) => {
    setDocumentModalType('edit');
    setDocumentForm({ ...doc });
    setDocumentModalOpen(true);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentForm.name || !documentForm.category || !documentForm.fileUrl) {
      alert("Tên tài liệu, danh mục và link tải tài liệu là bắt buộc!");
      return;
    }
    setSavingDocument(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(documentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu tài liệu');
      alert(documentModalType === 'add' ? "Thêm tài liệu học liệu thành công!" : "Cập nhật tài liệu thành công!");
      setDocumentModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu tài liệu');
    } finally {
      setSavingDocument(false);
    }
  };

  const handleOpenAddAlbum = () => {
    setAlbumModalType('add');
    setAlbumForm({
      id: '',
      title: '',
      type: 'image',
      url: '',
      sortOrder: (albums?.length || 0) + 1
    });
    setAlbumModalOpen(true);
  };

  const handleOpenEditAlbum = (album: AlbumItem) => {
    setAlbumModalType('edit');
    setAlbumForm({ ...album });
    setAlbumModalOpen(true);
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.title || !albumForm.url) {
      alert("Tiêu đề và đường dẫn URL ảnh/video là bắt buộc!");
      return;
    }
    setSavingAlbum(true);
    try {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(albumForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu album');
      alert(albumModalType === 'add' ? "Thêm hình ảnh/video vào album thành công!" : "Cập nhật thành công!");
      setAlbumModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu album');
    } finally {
      setSavingAlbum(false);
    }
  };

  const handleOpenAddStudent = () => {
    setStudentModalType('add');
    setStudentForm({
      id: '',
      name: '',
      phone: '',
      identity: '',
      dob: '',
      address: '',
      class: 'B2',
      teacher: '',
      status: 'Mới đăng ký',
      notes: ''
    });
    setStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentModalType('edit');
    setStudentForm({ ...student });
    setStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.phone || !studentForm.identity || !studentForm.class) {
      alert("Họ tên, Số điện thoại, CCCD và Hạng bằng là bắt buộc!");
      return;
    }
    setSavingStudent(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu thông tin học viên');
      alert(studentModalType === 'add' ? "Thêm học viên thành công!" : "Cập nhật thông tin học viên thành công!");
      setStudentModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu học viên');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleOpenAddCourse = () => {
    setCourseModalType('add');
    setCourseForm({
      id: '',
      name: '',
      fee: 0,
      duration: '3 tháng',
      requirements: 'Đủ 18 tuổi trở lên, đủ sức khỏe tập lái xe',
      description: '',
      documents: 'CCCD photo, 6 ảnh 3x4 nền xanh',
      image: '',
      featured: true,
      status: 'active',
      originalId: ''
    });
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setCourseModalType('edit');
    setCourseForm({ ...course, originalId: course.id });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.id || !courseForm.name) {
      alert("Mã hạng và tên khóa học là bắt buộc!");
      return;
    }
    setSavingCourse(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu khóa học');
      alert(courseModalType === 'add' ? "Thêm khóa học thành công!" : "Cập nhật khóa học thành công!");
      setCourseModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu khóa học');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khóa học hạng này không?`)) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa khóa học');
      alert("Xóa khóa học thành công!");
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa khóa học');
    }
  };

  // Sync info prop to local edit state on load
  useEffect(() => {
    if (info) {
      setInfoName(info.name || '');
      setInfoHotline(info.hotline || '');
      setInfoAddress(info.address || '');
      setInfoEmail(info.email || '');
      setInfoLogo(info.logo || '');
      setInfoBanner(info.banner || '');
      setInfoIntro(info.intro || '');
      setInfoFooter(info.footer || '');
      setInfoSeoTitle(info.seo_title || '');
      setInfoSeoDescription(info.seo_description || '');
      setInfoSeoKeywords(info.seo_keywords || '');
      setInfoThemeStyle(info.themeStyle || 'blue');
      setInfoFontFamily(info.fontFamily || 'default');
      setInfoSubtitle(info.subtitle || '');
      setInfoFooterSlogan(info.footerSlogan || '');
      setInfoIntroVideoUrl(info.introVideoUrl || '');
      setInfoFooterDesc(info.footerDesc || '');
      setInfoFooterTag1(info.footerTag1 || '');
      setInfoFooterTag2(info.footerTag2 || '');
      setInfoZalo(info.zalo || '0988123456');
      setInfoDomain(info.domain || 'daynghelaixethanhthuy.com');
      setInfoWebsiteUrl(info.websiteUrl || 'https://daynghelaixethanhthuy.com');
      setInfoGoogleMapUrl(info.googleMapUrl || '');
      setInfoTestimonials(info.testimonials || [
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
      ]);

      // Sync new dynamic content fields with proper fallbacks
      setInfoSlides(info.slides && info.slides.length > 0 ? info.slides : DEFAULT_SLIDES);
      setInfoAdvantages(info.advantages && info.advantages.length === 4 ? info.advantages : DEFAULT_ADVANTAGES);
      setInfoCommitments(info.commitments && info.commitments.length > 0 ? info.commitments : DEFAULT_COMMITMENTS);

      setInfoAboutTitle(info.aboutTitle || 'Hành Trình Kiến Tạo Những Hành Trình An Toàn');
      setInfoAboutYears(info.aboutYears || '10+');
      setInfoAboutDesc1(info.aboutDesc1 || 'Được thành lập với sứ mệnh phổ cập kỹ năng điều khiển phương tiện giao thông an toàn và chuyên nghiệp, Trung tâm Dạy nghề Thanh Thuỷ đã trở thành điểm đến tin cậy của hơn 15.000 học viên tại Phú Thọ và các tỉnh lân cận. Chúng tôi tự hào sở hữu quy trình đào tạo đồng bộ, chú trọng thực hành kỹ năng xử lý tình huống khẩn cấp hơn là việc học thuộc lòng máy móc.');
      setInfoAboutDesc2(info.aboutDesc2 || 'Với quy mô rộng hơn 2 hecta đặt ngay tại trung tâm huyện Thanh Thuỷ, sân sát hạch sa hình của chúng tôi đạt chuẩn ISO của Bộ Giao Thông Vận Tải, bao gồm toàn bộ 11 bài thi sát hạch liên hoàn như vệt bánh xe, đường vòng quanh co, ghép xe dọc ghép xe ngang, dừng và khởi hành xe ngang dốc thiết kế cảm biến 100% giống như ngày thi thật.');
      setInfoAboutFeatures(info.aboutFeatures && info.aboutFeatures.length === 4 ? info.aboutFeatures : DEFAULT_ABOUT_FEATURES);
      setInfoFacilities(info.facilities && info.facilities.length === 3 ? info.facilities : DEFAULT_FACILITIES);
      setInfoTeachers(info.teachers && info.teachers.length === 4 ? info.teachers : DEFAULT_TEACHERS);

      setInfoQualityCommitmentTitle(info.qualityCommitmentTitle || 'Cam Kết Chất Lượng Đào Tạo');
      setInfoQualityCommitmentDesc(info.qualityCommitmentDesc || 'Chúng tôi luôn tâm niệm lấy sự an toàn và thành công của học viên làm trọng tâm phát triển. Trung tâm dạy nghề Thanh Thuỷ cam kết thực thi nghiêm ngặt 3 KHÔNG:');
      setInfoQualityCommitments(info.qualityCommitments && info.qualityCommitments.length === 3 ? info.qualityCommitments : DEFAULT_QUALITY_COMMITMENTS);

      setInfoLegalTitle(info.legalTitle || 'Hồ Sơ Pháp Lý Độc Lập');
      setInfoLegalDesc(info.legalDesc || 'Trung tâm dạy nghề Thanh Thuỷ được thành lập và hoạt động dưới sự cấp phép, giám sát chặt chẽ của Sở Giao Thông Vận Tải tỉnh Phú Thọ. Toàn bộ hồ sơ thi sát hạch đều là hồ sơ gốc, học viên có quyền tự do kiểm tra và lưu giữ thông tin học tập của mình minh bạch trên cơ sở dữ liệu hệ thống quốc gia.');
      setInfoLegalBadge(info.legalBadge || 'Đạt danh hiệu "Đơn vị Đào tạo Lái xe xuất sắc tỉnh Phú Thọ" liên tiếp nhiều năm liền.');
      setInfoLegalFooter(info.legalFooter || 'Giấy phép hoạt động số 4122/GP-SGTVT cấp phép bởi Sở Giao Thông Vận Tải Phú Thọ.');
    }
  }, [info]);

  const handleSaveInfo = async () => {
    setSaveInfoLoading(true);
    setSaveInfoStatus(null);
    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: infoName,
          hotline: infoHotline,
          address: infoAddress,
          email: infoEmail,
          logo: infoLogo,
          banner: infoBanner,
          intro: infoIntro,
          footer: infoFooter,
          seo_title: infoSeoTitle,
          seo_description: infoSeoDescription,
          seo_keywords: infoSeoKeywords,
          themeStyle: infoThemeStyle,
          fontFamily: infoFontFamily,
          subtitle: infoSubtitle,
          footerSlogan: infoFooterSlogan,
          introVideoUrl: infoIntroVideoUrl,
          footerDesc: infoFooterDesc,
          footerTag1: infoFooterTag1,
          footerTag2: infoFooterTag2,

          slides: infoSlides,
          advantages: infoAdvantages,
          commitments: infoCommitments,

          aboutTitle: infoAboutTitle,
          aboutYears: infoAboutYears,
          aboutDesc1: infoAboutDesc1,
          aboutDesc2: infoAboutDesc2,
          aboutFeatures: infoAboutFeatures,
          facilities: infoFacilities,
          teachers: infoTeachers,

          qualityCommitmentTitle: infoQualityCommitmentTitle,
          qualityCommitmentDesc: infoQualityCommitmentDesc,
          qualityCommitments: infoQualityCommitments,

          legalTitle: infoLegalTitle,
          legalDesc: infoLegalDesc,
          legalBadge: infoLegalBadge,
          legalFooter: infoLegalFooter,
          zalo: infoZalo,
          domain: infoDomain,
          websiteUrl: infoWebsiteUrl,
          googleMapUrl: infoGoogleMapUrl,
          testimonials: infoTestimonials
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Không thể cập nhật cấu hình');
      }

      setSaveInfoStatus({ type: 'success', message: 'Lưu cấu hình hệ thống, giao diện màu sắc và phông chữ thành công!' });
      onRefreshAll();
    } catch (err: any) {
      setSaveInfoStatus({ type: 'error', message: err.message || 'Lỗi kết nối máy chủ' });
    } finally {
      setSaveInfoLoading(false);
    }
  };

  // Authenticate on mount if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => setSession(data.user))
      .catch(() => handleLogout());
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");

      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setSession(data.user);
      setUsername('');
      setPassword('');
      onRefreshAll();
    } catch (err: any) {
      setLoginError(err.message || "Tài khoản hoặc mật khẩu không đúng");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);
    setRecoveryLoading(true);
    try {
      const payload: any = {
        username: recoveryUsername,
        newPassword: recoveryNewPassword
      };
      if (recoveryMethod === 'email') {
        payload.email = recoveryEmail;
      } else {
        payload.securityPin = recoverySecurityPin;
      }

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Khôi phục mật khẩu thất bại");

      setRecoverySuccess("Mật khẩu của bạn đã được cập nhật thành công! Vui lòng quay lại đăng nhập.");
      setRecoveryUsername('');
      setRecoveryEmail('');
      setRecoverySecurityPin('');
      setRecoveryNewPassword('');
    } catch (err: any) {
      setRecoveryError(err.message || "Có lỗi xảy ra trong quá trình khôi phục");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách tài khoản:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && token && session?.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, token, session]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formUsername,
          fullName: formFullName,
          role: formRole,
          email: formEmail,
          status: formStatus,
          password: formPassword || undefined,
          isEdit: !!editingUser
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể thực hiện hành động");

      toast.success(editingUser ? "Cập nhật tài khoản thành công!" : "Tạo tài khoản quản trị thành công!");
      setUserModalOpen(false);
      setFormUsername('');
      setFormFullName('');
      setFormRole('staff');
      setFormEmail('');
      setFormStatus('active');
      setFormPassword('');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Có lỗi xảy ra");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleUserStatus = async (usernameToToggle: string) => {
    const userToToggle = usersList.find(u => u.username === usernameToToggle);
    const actionName = userToToggle?.status === 'disabled' ? "mở khóa" : "vô hiệu hóa";

    showConfirm(
      userToToggle?.status === 'disabled' ? "Mở Khóa Tài Khoản" : "Vô Hiệu Hóa Tài Khoản",
      `Bạn có chắc chắn muốn ${actionName} tài khoản "${usernameToToggle}" không?`,
      async () => {
        try {
          const res = await fetch(`/api/users/${usernameToToggle}/toggle-status`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Không thể thay đổi trạng thái tài khoản");

          toast.success(data.message || "Đã thay đổi trạng thái thành công!");
          fetchUsers();
        } catch (err: any) {
          toast.error(err.message || "Có lỗi xảy ra");
        }
      },
      userToToggle?.status === 'disabled' ? 'Mở khóa' : 'Vô hiệu hóa',
      userToToggle?.status !== 'disabled'
    );
  };

  const handleDeleteUser = async (usernameToDelete: string) => {
    showConfirm(
      "Xóa Tài Khoản Vĩnh Viễn",
      `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${usernameToDelete}" không? Hành động này không thể hoàn tác và tài khoản sẽ bị loại bỏ hoàn toàn khỏi hệ thống.`,
      async () => {
        try {
          const res = await fetch(`/api/users/${usernameToDelete}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Không thể xóa tài khoản");

          toast.success("Xóa tài khoản thành công!");
          fetchUsers();
        } catch (err: any) {
          toast.error(err.message || "Có lỗi xảy ra");
        }
      },
      'Xóa vĩnh viễn',
      true
    );
  };

  const openEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormFullName(user.fullName);
    setFormRole(user.role);
    setFormEmail(user.email || '');
    setFormStatus(user.status || 'active');
    setFormPassword('');
    setFormError(null);
    setUserModalOpen(true);
  };

  const openAddUser = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormFullName('');
    setFormRole('staff');
    setFormEmail('');
    setFormStatus('active');
    setFormPassword('');
    setFormError(null);
    setUserModalOpen(true);
  };

  const handleLogout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setSession(null);
      });
    }
  };

  // BASE64 File uploader for simple string states
  const handleInfoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setFieldString: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            base64
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setFieldString(data.fileUrl);
        alert(`Tải lên hình ảnh thành công!`);
      } catch (err: any) {
        alert(err.message || "Lỗi tải lên hình ảnh");
      }
    };
    reader.readAsDataURL(file);
  };

  // BASE64 File uploader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, stateSetter: Function) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            base64
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        stateSetter((prev: any) => ({
          ...prev,
          [fieldName]: data.fileUrl
        }));
        alert(`Tải lên tệp thành công!`);
      } catch (err: any) {
        alert(err.message || "Lỗi tải lên tệp");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- CRUD HELPERS ---
  const saveItem = async (endpoint: string, itemData: any) => {
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu dữ liệu");

      alert("Lưu thông tin thành công!");
      setShowModal(false);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteItem = async (endpoint: string, id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác.")) return;
    try {
      const res = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể xóa dữ liệu");

      alert("Xóa thành công!");
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update contact status
  const updateContact = async (id: string, status: string, notes: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      if (!res.ok) throw new Error("Thất bại");
      alert("Cập nhật trạng thái liên hệ thành công!");
      onRefreshAll();
    } catch (err) {
      alert("Không thể cập nhật");
    }
  };

  // --- EXCEL LOGIC POWERED BY XLSX ---
  
  // 1. Export registrations list to Excel
  const exportStudentsToExcel = () => {
    const dataToExport = students.map((s, idx) => ({
      "STT": idx + 1,
      "Mã Học Viên": s.id,
      "Họ Và Tên": s.name,
      "Số Điện Thoại": s.phone,
      "Số CCCD": s.identity,
      "Ngày Sinh": s.dob,
      "Địa Chỉ": s.address,
      "Hạng Đăng Ký": s.class,
      "Giáo Viên Phụ Trách": s.teacher,
      "Trạng Thái Hồ Sơ": s.status,
      "Ghi Chú": s.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHocVien");
    
    // Auto-fit column widths
    const max_widths = dataToExport.reduce((acc, row) => {
      Object.keys(row).forEach((key, col_idx) => {
        const val = String((row as any)[key]);
        acc[col_idx] = Math.max(acc[col_idx] || 0, val.length + 4);
      });
      return acc;
    }, [] as number[]);
    worksheet["!cols"] = max_widths.map(w => ({ wch: w }));

    XLSX.writeFile(workbook, `ThanhThuy_HocVien_Sathach_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 2. Parse Excel sheets for student or question import
  const handleExcelImportFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'students' | 'questions') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportType(type);
    setImportErrors([]);
    setImportPreview([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          throw new Error("Tệp Excel trống rỗng, không chứa dòng dữ liệu nào");
        }

        // Validate rows locally
        const errorsList: string[] = [];
        json.forEach((row: any, rIdx) => {
          const idx = rIdx + 1;
          if (type === 'students') {
            const name = row.name || row["Họ tên"] || row["Họ và Tên"];
            const phone = row.phone || row["Số điện thoại"] || row["SĐT"];
            const identity = row.identity || row["CCCD"] || row["Số CCCD"] || row["CMND"];
            const className = row.class || row["Hạng xe"] || row["Hạng bằng"] || row["Hạng đăng ký"];

            if (!name) errorsList.push(`Dòng ${idx}: Thiếu Họ tên học viên.`);
            if (!phone) errorsList.push(`Dòng ${idx}: Thiếu Số điện thoại.`);
            if (!identity) errorsList.push(`Dòng ${idx}: Thiếu Số CCCD.`);
            if (!className) errorsList.push(`Dòng ${idx}: Thiếu Hạng xe đăng ký.`);

            // Check duplicate CCCD in current database
            if (identity && students.some(s => String(s.identity).trim() === String(identity).trim())) {
              errorsList.push(`Dòng ${idx}: Trùng số CCCD ${identity} (Đã có học viên này trên hệ thống).`);
            }
          } else {
            const questionText = row.question || row["Nội dung"] || row["Câu hỏi"];
            const optA = row.optionA || row["Đáp án A"] || row["A"];
            const optB = row.optionB || row["Đáp án B"] || row["B"];
            const answer = row.answer || row["Đáp án đúng"] || row["Đáp án"];

            if (!questionText) errorsList.push(`Dòng ${idx}: Thiếu Nội dung câu hỏi.`);
            if (!optA || !optB) errorsList.push(`Dòng ${idx}: Phải có tối thiểu 2 đáp án lựa chọn A và B.`);
            if (!answer) errorsList.push(`Dòng ${idx}: Thiếu Đáp án đúng (A/B/C/D).`);
          }
        });

        setImportPreview(json);
        setImportErrors(errorsList);
      } catch (err: any) {
        alert("Lỗi đọc tệp Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit parsed list to backend merge API
  const saveImportedData = async () => {
    if (importPreview.length === 0) return;
    if (importErrors.length > 0) {
      if (!confirm(`Tệp tin chứa ${importErrors.length} dòng lỗi dữ liệu cấu trúc. Bạn có muốn bỏ qua các dòng lỗi và chỉ import các dòng hợp lệ?`)) {
        return;
      }
    }

    setImporting(true);
    try {
      const endpoint = importType === 'students' ? '/api/students/import' : '/api/questions/import';
      const bodyKey = importType === 'students' ? 'studentsList' : 'questionsList';
      
      // Filter out invalid rows before submitting
      const validRows = importPreview.filter((row, rIdx) => {
        const idx = rIdx + 1;
        // Simple check to exclude rows causing errors
        return !importErrors.some(e => e.startsWith(`Dòng ${idx}:`));
      });

      if (validRows.length === 0) {
        alert("Không có dòng dữ liệu nào hợp lệ để nhập vào hệ thống.");
        return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [bodyKey]: validRows })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thất bại");

      alert(`Đã nạp thành công ${data.importedCount} bản ghi vào cơ sở dữ liệu!`);
      setImportPreview([]);
      setImportErrors([]);
      setImportType(null);
      onRefreshAll();
    } catch (err: any) {
      alert("Lỗi import: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Back up entire database
  const exportBackup = async () => {
    try {
      const res = await fetch('/api/backup/export', {
        headers: { 'Authorization': `Bearer ${token}` },
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error();

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ThanhThuy_BackupDB_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      alert("Tải tệp tin sao lưu hệ thống thành công!");
    } catch (err) {
      alert("Lỗi sao lưu");
    }
  };

  if (!token || !session) {
    // Elegant Admin Login Panel
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" id="admin-login-screen">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden relative">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 text-center relative">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                title="Thoát"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Hệ thống quản trị
            </span>
            <h2 className="text-xl font-bold mt-2 font-display">Trung tâm sát hạch Thanh Thuỷ</h2>
            <p className="text-xs text-blue-100 mt-1">
              {isForgotPasswordMode 
                ? "Khôi phục mật khẩu bảo mật của tài khoản cán bộ quản trị" 
                : "Đăng nhập tài khoản dành cho cán bộ quản lý và nhân viên tuyển sinh"}
            </p>
          </div>

          {!isForgotPasswordMode ? (
            <form onSubmit={handleLogin} className="p-8 space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-lg font-semibold flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tên tài khoản quản trị</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tài khoản..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mật khẩu bảo mật</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer disabled:bg-gray-400 mt-2"
              >
                <LogIn className="w-4 h-4" />
                {loginLoading ? "Đang xác thực bảo mật..." : "Đăng Nhập Quản Trị"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(true);
                    setLoginError(null);
                    setRecoveryError(null);
                    setRecoverySuccess(null);
                  }}
                  className="text-xs text-blue-900 hover:text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="p-8 space-y-4">
              {recoveryError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-lg font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-lg font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{recoverySuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tên tài khoản cần khôi phục</label>
                <input
                  type="text"
                  required
                  value={recoveryUsername}
                  onChange={(e) => setRecoveryUsername(e.target.value)}
                  placeholder="Ví dụ: admin"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              {/* Selector for recovery method */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Phương thức xác minh</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('email')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                      recoveryMethod === 'email'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Xác minh qua Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('pin')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                      recoveryMethod === 'pin'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Mã PIN bảo mật
                  </button>
                </div>
              </div>

              {recoveryMethod === 'email' ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Địa chỉ Email đã đăng ký</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="Ví dụ: admin@thanhthuy.edu.vn"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">Mã PIN bảo mật khôi phục</label>
                    <span className="text-[10px] text-slate-400 font-medium">(Mặc định: 123456 hoặc 1108)</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={recoverySecurityPin}
                    onChange={(e) => setRecoverySecurityPin(e.target.value)}
                    placeholder="Nhập mã PIN khôi phục 6 số..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={recoveryNewPassword}
                  onChange={(e) => setRecoveryNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer disabled:bg-gray-400 mt-2"
              >
                {recoveryLoading ? "Đang xử lý khôi phục..." : "Đổi mật khẩu & Khôi phục"}
              </button>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed space-y-1 bg-slate-50 p-3 rounded-xl">
                <strong className="text-blue-950 font-bold block">Hỗ trợ khôi phục tài khoản:</strong>
                <p>Khuyên dùng xác minh qua địa chỉ Email đã đăng ký trong hồ sơ cán bộ. Hoặc liên hệ hotline để được quản trị viên reset trực tiếp.</p>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setLoginError(null);
                    setRecoveryError(null);
                    setRecoverySuccess(null);
                  }}
                  className="text-xs text-blue-900 hover:text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER MASTER DASHBOARD VIEW ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="admin-master-view">
      {/* Top Banner Control bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-800" />
          </div>
          <div>
            <h1 className="font-extrabold text-blue-950 text-base">HỆ THỐNG QUẢN TRỊ THANH THUỶ</h1>
            <p className="text-xs text-slate-500">Xin chào, <strong className="text-blue-900">{session.fullName}</strong> ({session.role === 'admin' ? 'Quyền Admin' : 'Quyền Nhân viên'})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshAll}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-blue-900 transition cursor-pointer"
            title="Đồng bộ lại dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Nav - 3 columns */}
        <div className="lg:col-span-3 space-y-1.5 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-50 mb-2">Chức năng quản lý</h3>
          
          <button
            onClick={() => { setActiveTab('dashboard'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" /> Tổng quan (Dashboard)
          </button>

          <button
            onClick={() => { setActiveTab('info'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'info' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" /> Cấu hình trường học
          </button>

          <button
            onClick={() => { setActiveTab('courses'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'courses' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" /> Quản lý khóa học
          </button>

          <button
            onClick={() => { setActiveTab('students'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'students' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" /> Quản lý học viên ({students.length})
          </button>

          <button
            onClick={() => { setActiveTab('schedules'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'schedules' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" /> Lịch học/Sát hạch
          </button>

          <button
            onClick={() => { setActiveTab('news'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'news' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" /> Quản lý tin tức
          </button>

          <button
            onClick={() => { setActiveTab('documents'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'documents' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" /> Quản lý học liệu
          </button>

          <button
            onClick={() => { setActiveTab('questions'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'questions' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" /> Ngân hàng 600 câu hỏi ({questions.length})
          </button>

          <button
            onClick={() => { setActiveTab('albums'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'albums' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" /> Album ảnh/Video
          </button>

          <button
            onClick={() => { setActiveTab('contacts'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'contacts' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" /> Yêu cầu liên hệ ({contacts.filter(c => c.status === 'Chưa xử lý').length})
          </button>

          <button
            onClick={() => { setActiveTab('logs'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'logs' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <FileClock className="w-4 h-4 shrink-0" /> Nhật ký hệ thống (Logs)
          </button>

          <button
            onClick={() => { setActiveTab('backup'); setImportType(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'backup' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" /> Phục hồi & Sao lưu
          </button>

          {session?.role === 'admin' && (
            <button
              onClick={() => { setActiveTab('users'); setImportType(null); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'users' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0 text-orange-500" /> Tài khoản & Phân quyền
            </button>
          )}
        </div>

        {/* Dynamic Content Panel - 9 columns */}
        <div className="lg:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* EXCEL IMPORT SCREEN (OVERLAY IF CHOSEN) */}
          {importType && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="font-extrabold text-blue-950 text-base flex items-center gap-1.5">
                  <Upload className="w-5 h-5 text-orange-500" /> 
                  Xác nhận nạp dữ liệu {importType === 'students' ? 'Học viên' : 'Câu hỏi thi'} từ Excel
                </h2>
                <button
                  onClick={() => setImportType(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Hủy bỏ
                </button>
              </div>

              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-900 space-y-1 max-h-36 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1 mb-1"><AlertCircle className="w-4 h-4 text-red-600" /> Phát hiện {importErrors.length} lỗi cấu trúc cần lưu ý:</div>
                  {importErrors.map((err, eIdx) => <div key={eIdx}>• {err}</div>)}
                </div>
              )}

              {/* Excel rows table preview */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-80">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-3">STT</th>
                      {importType === 'students' ? (
                        <>
                          <th className="p-3">Họ Tên</th>
                          <th className="p-3">Số Điện Thoại</th>
                          <th className="p-3">Số CCCD</th>
                          <th className="p-3">Hạng Đăng Ký</th>
                          <th className="p-3">Giáo Viên</th>
                        </>
                      ) : (
                        <>
                          <th className="p-3">Nội Dung Câu Hỏi</th>
                          <th className="p-3">Đáp Án A</th>
                          <th className="p-3">Đáp Án B</th>
                          <th className="p-3">Đúng</th>
                          <th className="p-3">Điểm Liệt</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {importPreview.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-500">{rIdx + 1}</td>
                        {importType === 'students' ? (
                          <>
                            <td className="p-3 font-bold">{row.name || row["Họ tên"] || row["Họ và Tên"]}</td>
                            <td className="p-3">{row.phone || row["Số điện thoại"] || row["SĐT"]}</td>
                            <td className="p-3 font-mono">{row.identity || row["CCCD"] || row["Số CCCD"]}</td>
                            <td className="p-3">{row.class || row["Hạng xe"] || row["Hạng bằng"]}</td>
                            <td className="p-3">{row.teacher || row["Giáo viên"] || "Tự do"}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 font-bold max-w-xs truncate">{row.question || row["Nội dung"] || row["Câu hỏi"]}</td>
                            <td className="p-3 max-w-xs truncate">{row.optionA || row["Đáp án A"]}</td>
                            <td className="p-3 max-w-xs truncate">{row.optionB || row["Đáp án B"]}</td>
                            <td className="p-3 text-center font-bold text-orange-600">{row.answer || row["Đáp án đúng"]}</td>
                            <td className="p-3 text-center">{String(row.critical || row["Điểm liệt"]) === "true" || row["Điểm liệt"] === 1 || row["Điểm liệt"] === "x" ? "🔴 Có" : "Không"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => setImportType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Quay lại
                </button>
                <button
                  onClick={saveImportedData}
                  disabled={importing || importPreview.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shrink-0 flex items-center gap-1"
                >
                  {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Lưu tất cả vào Database ({importPreview.length} dòng)
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && !importType && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-extrabold text-blue-950 text-base border-b border-slate-50 pb-2">Bảng Số Liệu Tổng Quan</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <div className="text-2xl font-black text-blue-900">{students.length}</div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase mt-1">Tổng học viên</div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                  <div className="text-2xl font-black text-orange-600">{students.filter(s => s.status === 'Mới đăng ký').length}</div>
                  <div className="text-[10px] text-orange-600 font-bold uppercase mt-1">Hồ sơ mới đăng ký</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="text-2xl font-black text-slate-800">{courses.length}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Tổng số hạng đào tạo</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <div className="text-2xl font-black text-emerald-700">{contacts.filter(c => c.status === 'Chưa xử lý').length}</div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Yêu cầu tư vấn chưa xử lý</div>
                </div>
              </div>

              {/* Dynamic Interactive SVG Charts for student demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-xs mb-4">HỌC VIÊN THEO HẠNG BẰNG</h3>
                  <div className="h-44 flex items-end justify-around gap-2 px-4 pb-4 border-b border-slate-200">
                    {(() => {
                      const hClasses = Array.from(new Set([
                        ...courses.map(c => (c.id || '').toUpperCase()),
                        ...students.map(s => (s.class || '').toUpperCase())
                      ].filter(Boolean))).sort();

                      const maxCount = Math.max(...hClasses.map(hc => students.filter(s => (s.class || '').toUpperCase() === hc).length)) || 1;

                      return hClasses.map(hClass => {
                        const count = students.filter(s => (s.class || '').toUpperCase() === hClass).length;
                        const pct = (count / maxCount) * 100;

                        return (
                          <div key={hClass} className="flex flex-col items-center gap-1.5 w-12 group">
                            <div className="text-[10px] font-bold text-blue-900 opacity-0 group-hover:opacity-100 transition duration-100">{count} HV</div>
                            <div className="w-full bg-blue-900 rounded-t-md transition-all duration-300 hover:bg-orange-500" style={{ height: `${Math.max(8, pct)}%` }} />
                            <span className="text-[10px] font-bold text-slate-500">Hạng {hClass}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-xs mb-4 font-display">TỈ LỆ TRẠNG THÁI HỒ SƠ</h3>
                  <div className="h-44 flex items-center justify-center gap-6">
                    {/* Render visual progress table */}
                    <div className="space-y-1.5 w-full">
                      {['Mới đăng ký', 'Đang học', 'Chờ thi', 'Đậu', 'Rớt'].map(status => {
                        const count = students.filter(s => s.status === status).length;
                        const pct = ((count / (students.length || 1)) * 100).toFixed(0);
                        return (
                          <div key={status} className="text-xs space-y-0.5">
                            <div className="flex justify-between font-semibold text-slate-700 text-[10px]">
                              <span>{status}</span>
                              <span>{count} HV ({pct}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Update Section / Phần cập nhật thông tin nhanh */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      Cập Nhật Thông Tin Nhanh (Quick Settings)
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Thay đổi nhanh các thông tin liên hệ cốt lõi hiển thị trên website mà không cần vào phần cấu hình chi tiết.</p>
                  </div>
                  <button
                    onClick={handleSaveInfo}
                    disabled={saveInfoLoading}
                    className="bg-blue-900 hover:bg-blue-850 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer self-start sm:self-auto shadow-sm"
                  >
                    {saveInfoLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Cập nhật ngay
                  </button>
                </div>
                
                {saveInfoStatus && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    saveInfoStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
                  }`}>
                    {saveInfoStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên Trung tâm / Trường học</label>
                    <input
                      type="text"
                      value={infoName}
                      onChange={(e) => setInfoName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Tên trường..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hotline báo danh (Hỗ trợ 24/7)</label>
                    <input
                      type="text"
                      value={infoHotline}
                      onChange={(e) => setInfoHotline(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Số hotline..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hòm thư điện tử (Email)</label>
                    <input
                      type="email"
                      value={infoEmail}
                      onChange={(e) => setInfoEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Email liên hệ..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Liên hệ Zalo (Số điện thoại / Link)</label>
                    <input
                      type="text"
                      value={infoZalo}
                      onChange={(e) => setInfoZalo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Số điện thoại hoặc link Zalo..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên miền trang web (Domain)</label>
                    <input
                      type="text"
                      value={infoDomain}
                      onChange={(e) => setInfoDomain(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono text-blue-900"
                      placeholder="Ví dụ: daynghelaixethanhthuy.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Địa chỉ truy cập đầy đủ (Website URL)</label>
                    <input
                      type="text"
                      value={infoWebsiteUrl}
                      onChange={(e) => setInfoWebsiteUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono text-blue-900"
                      placeholder="Ví dụ: https://daynghelaixethanhthuy.com"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-bold text-slate-700">Link nhúng Google Map chỉ đường (Embed URL)</label>
                    <input
                      type="text"
                      value={infoGoogleMapUrl}
                      onChange={(e) => setInfoGoogleMapUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono text-blue-900"
                      placeholder="Ví dụ: https://www.google.com/maps/embed?pb=..."
                    />
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Để lấy link nhúng: Lên Google Maps tìm trung tâm → Chia sẻ → Nhúng bản đồ → Copy phần URL trong thuộc tính src="..." của thẻ iframe.
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-bold text-slate-700">Địa chỉ văn phòng / Trụ sở tuyển sinh</label>
                    <input
                      type="text"
                      value={infoAddress}
                      onChange={(e) => setInfoAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Địa chỉ..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Slogan chân trang (Footer Slogan)</label>
                    <input
                      type="text"
                      value={infoFooterSlogan}
                      onChange={(e) => setInfoFooterSlogan(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Slogan..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM CONFIG / INFO */}
          {activeTab === 'info' && !importType && (
            <div className="space-y-6 animate-fade-in pb-10">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-blue-950 text-base">Cấu Hình Giao Diện & Thông Tin Trung Tâm</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Tùy chỉnh thông tin, thiết lập màu sắc giao diện và phông chữ toàn cổng thông tin.</p>
                </div>
                <button
                  onClick={handleSaveInfo}
                  disabled={saveInfoLoading}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saveInfoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              </div>

              {saveInfoStatus && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  saveInfoStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {saveInfoStatus.message}
                </div>
              )}

              {/* SECTION 1: INTERFACE & THEME CONFIG */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                  Tùy Chỉnh Giao Diện & Màu Sắc
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    blue: { name: "Xanh Dương & Cam", desc: "Mặc định truyền thống, uy tín", bg: "bg-blue-900", accent: "bg-orange-500" },
                    green: { name: "Lục Bảo & Hổ Phách", desc: "Tươi mới, thân thiện môi trường", bg: "bg-emerald-800", accent: "bg-amber-500" },
                    teal: { name: "Xanh Ngọc & San Hô", desc: "Trẻ trung, hiện đại, nổi bật", bg: "bg-teal-800", accent: "bg-rose-500" },
                    charcoal: { name: "Xám Đá & Hồng Phấn", desc: "Sang trọng, đậm chất công nghệ", bg: "bg-slate-800", accent: "bg-pink-500" },
                    purple: { name: "Tím Quý Phái & Vàng Kim", desc: "Cổ điển, hoàng gia, độc đáo", bg: "bg-purple-900", accent: "bg-yellow-500" },
                    red: { name: "Đỏ Đậm & Xám Tối", desc: "Năng động, cuốn hút, mạnh mẽ", bg: "bg-red-800", accent: "bg-slate-600" },
                    orange: { name: "Cam Đất & Xanh Rừng", desc: "Ấm áp, tự nhiên, đầy sức sống", bg: "bg-orange-600", accent: "bg-green-600" },
                    navy: { name: "Navy Cổ Điển & Cát Vàng", desc: "Lịch lãm, uy tín, hoàng gia", bg: "bg-sky-950", accent: "bg-yellow-500" },
                    indigo: { name: "Xanh Chàm & Đào Ấm", desc: "Mơ mộng, thư thái, hiện đại", bg: "bg-indigo-700", accent: "bg-rose-400" },
                    rose: { name: "Hồng Tro & Than Thép", desc: "Thanh lịch, thời thượng, tinh tế", bg: "bg-rose-700", accent: "bg-slate-500" },
                    cyan: { name: "Cyan Biển Cả & San Hô", desc: "Khoáng đạt, rực rỡ, năng động", bg: "bg-cyan-700", accent: "bg-orange-500" },
                    forest: { name: "Xanh Rừng Già & Mật Ong", desc: "Sang trọng, thuần khiết, quý phái", bg: "bg-emerald-900", accent: "bg-amber-400" }
                  }).map(([key, item]) => {
                    const isSelected = infoThemeStyle === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setInfoThemeStyle(key)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                          isSelected ? 'border-blue-900 ring-2 ring-blue-100 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-xs text-slate-800 flex items-center justify-between gap-1.5">
                            <span className="truncate">{item.name}</span>
                            {isSelected && <span className="text-[8px] bg-blue-900 text-white px-1.5 py-0.5 rounded-full shrink-0 font-bold">Đang dùng</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-2">{item.desc}</p>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <div className={`w-6 h-3 rounded-md ${item.bg}`} />
                          <div className={`w-3 h-3 rounded-md ${item.accent}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: FONT CONFIG */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                  Lựa Chọn Phông Chữ (Typography)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    default: { name: "Inter & Outfit", preview: "Giao diện hiện đại, dễ đọc", style: { fontFamily: '"Outfit", sans-serif' } },
                    roboto: { name: "Roboto & Montserrat", preview: "Đường nét thanh lịch, sắc sảo", style: { fontFamily: '"Montserrat", sans-serif' } },
                    serif: { name: "Lora & Playfair Display", preview: "Phong cách cổ điển, trang trọng", style: { fontFamily: '"Playfair Display", serif' } },
                    mono: { name: "JetBrains Mono", preview: "Tối giản kỹ thuật, rõ ràng", style: { fontFamily: '"JetBrains Mono", monospace' } },
                    system: { name: "System UI", preview: "Giao diện hệ thống quen thuộc", style: { fontFamily: 'system-ui, sans-serif' } }
                  }).map(([key, item]) => {
                    const isSelected = infoFontFamily === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setInfoFontFamily(key)}
                        className={`text-left p-3.5 rounded-xl border transition-all h-24 flex flex-col justify-between cursor-pointer ${
                          isSelected ? 'border-blue-900 ring-2 ring-blue-100 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-xs text-slate-800 flex items-center justify-between">
                            <span>{item.name}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-blue-900" />}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">{item.preview}</p>
                        </div>
                        <div className="text-xs font-bold text-blue-950/80 tracking-wide mt-2" style={item.style}>
                          Aa Bb Cc - Đào tạo lái xe
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUB-TAB NAV BAR */}
              <div className="flex border-b border-slate-200 gap-1 sm:gap-2 overflow-x-auto pb-1">
                {(['basic', 'banners', 'advantages', 'about', 'testimonials'] as const).map((tab) => {
                  const label = {
                    basic: "Thông tin chung & SEO",
                    banners: "Banners & Slides",
                    advantages: "Ưu điểm & Cam kết",
                    about: "Trang giới thiệu (About)",
                    testimonials: "Ý kiến khách hàng"
                  }[tab];
                  const Icon = {
                    basic: Settings,
                    banners: ImageIcon,
                    advantages: Award,
                    about: FileText,
                    testimonials: MessageSquare
                  }[tab];
                  const isSelected = infoSubTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setInfoSubTab(tab)}
                      className={`px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition shrink-0 ${
                        isSelected 
                          ? 'border-blue-900 text-blue-900' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* SUB-TAB CONTENT 1: BASIC & SEO */}
              {infoSubTab === 'basic' && (
                <div className="space-y-6">
                  {/* SECTION 3: CORE SCHOOL INFORMATION */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      Thông Tin Cơ Bản Của Trung Tâm
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Tên trung tâm / trường học</label>
                        <input
                          type="text"
                          value={infoName}
                          onChange={(e) => setInfoName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Nhập tên trung tâm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Khẩu hiệu phụ / Slogan tiêu đề (Header)</label>
                        <input
                          type="text"
                          value={infoSubtitle}
                          onChange={(e) => setInfoSubtitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="ĐÀO TẠO & SÁT HẠCH LÁI XE PHÚ THỌ"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Hotline liên hệ</label>
                        <input
                          type="text"
                          value={infoHotline}
                          onChange={(e) => setInfoHotline(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Nhập số điện thoại hotline"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Hòm thư điện tử (Email)</label>
                        <input
                          type="email"
                          value={infoEmail}
                          onChange={(e) => setInfoEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Nhập địa chỉ email"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Liên hệ Zalo (Số điện thoại / Link)</label>
                        <input
                          type="text"
                          value={infoZalo}
                          onChange={(e) => setInfoZalo(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Số điện thoại hoặc link Zalo"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Địa chỉ chính</label>
                        <input
                          type="text"
                          value={infoAddress}
                          onChange={(e) => setInfoAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Địa chỉ chi tiết"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Tên miền trang web (Domain name)</label>
                        <input
                          type="text"
                          value={infoDomain}
                          onChange={(e) => setInfoDomain(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono text-blue-900"
                          placeholder="Ví dụ: daynghelaixethanhthuy.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Địa chỉ truy cập website đầy đủ (Website URL)</label>
                        <input
                          type="text"
                          value={infoWebsiteUrl}
                          onChange={(e) => setInfoWebsiteUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono text-blue-900"
                          placeholder="Ví dụ: https://daynghelaixethanhthuy.com"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Link nhúng Google Map chỉ đường (Embed Iframe URL)</label>
                        <input
                          type="text"
                          value={infoGoogleMapUrl}
                          onChange={(e) => setInfoGoogleMapUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono text-blue-900"
                          placeholder="Ví dụ: https://www.google.com/maps/embed?pb=..."
                        />
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Để lấy link nhúng: Lên Google Maps tìm trung tâm → Chia sẻ → Nhúng bản đồ → Copy phần URL trong thuộc tính src="..." của thẻ iframe.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Slogan phụ chân trang (Footer slogan)</label>
                        <input
                          type="text"
                          value={infoFooterSlogan}
                          onChange={(e) => setInfoFooterSlogan(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Sát hạch lái xe uy tín số 1"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 font-bold text-blue-900">Video giới thiệu toàn cảnh sân thi (YouTube URL / Link chia sẻ)</label>
                        <input
                          type="text"
                          value={infoIntroVideoUrl}
                          onChange={(e) => setInfoIntroVideoUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ hoặc https://youtu.be/dQw4w9WgXcQ"
                        />
                        <p className="text-[10px] text-slate-400 font-medium">Bạn có thể sao chép liên kết video trực tiếp từ YouTube. Hệ thống sẽ tự động tối ưu hóa hiển thị trên trang chủ.</p>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="text-xs font-semibold text-slate-700">Mô tả giới thiệu ngắn (Hiển thị tại trang chủ)</label>
                      <textarea
                        rows={3}
                        value={infoIntro}
                        onChange={(e) => setInfoIntro(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Giới thiệu sơ lược về quy mô, chất lượng đào tạo..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 font-bold text-blue-900">Logo đại diện thương hiệu</label>
                        <div className="flex gap-3 items-center">
                          <div className="w-14 h-14 shrink-0 rounded-full border-2 border-orange-500 bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm">
                            {infoLogo ? (
                              <img src={infoLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase">Không ảnh</span>
                            )}
                          </div>
                          <div className="flex-grow space-y-1.5">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={infoLogo}
                                onChange={(e) => setInfoLogo(e.target.value)}
                                className="flex-grow px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                                placeholder="Link ảnh hoặc tải lên"
                              />
                              <label className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer">
                                Tải ảnh
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleInfoImageUpload(e, setInfoLogo)}
                                />
                              </label>
                            </div>
                            <p className="text-[9px] text-slate-400 font-semibold leading-none">Khuyên dùng logo hình vuông hoặc tròn.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 font-bold text-blue-900">Ảnh Banner chính trang chủ</label>
                        <div className="flex gap-3 items-center">
                          <div className="w-20 h-14 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-xs">
                            {infoBanner ? (
                              <img src={infoBanner} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase">Không ảnh</span>
                            )}
                          </div>
                          <div className="flex-grow space-y-1.5">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={infoBanner}
                                onChange={(e) => setInfoBanner(e.target.value)}
                                className="flex-grow px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                                placeholder="Link ảnh hoặc tải lên"
                              />
                              <label className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer">
                                Tải ảnh
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleInfoImageUpload(e, setInfoBanner)}
                                />
                              </label>
                            </div>
                            <p className="text-[9px] text-slate-400 font-semibold leading-none">Khuyên dùng ảnh phong cảnh (landscape).</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="text-xs font-semibold text-slate-700">Thông tin bản quyền chân trang (Footer Copyright)</label>
                      <input
                        type="text"
                        value={infoFooter}
                        onChange={(e) => setInfoFooter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="© 2026 Trung tâm. Tất cả các quyền được bảo lưu."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Đoạn mô tả giới thiệu chân trang (Footer Description)</label>
                        <textarea
                          value={infoFooterDesc}
                          onChange={(e) => setInfoFooterDesc(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none resize-none"
                          placeholder="Mô tả ngắn hiển thị ở cột chân trang chính..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Nhãn/Thẻ chứng chỉ chân trang 1 (Tag 1)</label>
                        <input
                          type="text"
                          value={infoFooterTag1}
                          onChange={(e) => setInfoFooterTag1(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Mặc định: ISO 9001:2015"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Nhãn/Thẻ chứng chỉ chân trang 2 (Tag 2)</label>
                        <input
                          type="text"
                          value={infoFooterTag2}
                          onChange={(e) => setInfoFooterTag2(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Mặc định: Đạt chuẩn Bộ GTVT"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: SEO SETTINGS */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      Cấu Hình SEO & Tìm Kiếm Google
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">SEO Tiêu đề website (SEO Title)</label>
                        <input
                          type="text"
                          value={infoSeoTitle}
                          onChange={(e) => setInfoSeoTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Nhập tiêu đề hiển thị trên thẻ Google Search"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">SEO Mô tả website (SEO Description)</label>
                        <textarea
                          rows={2}
                          value={infoSeoDescription}
                          onChange={(e) => setInfoSeoDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Nhập mô tả ngắn gọn giúp thu hút học viên khi thấy trên Google"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Từ khóa tìm kiếm (SEO Keywords)</label>
                        <input
                          type="text"
                          value={infoSeoKeywords}
                          onChange={(e) => setInfoSeoKeywords(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="đào tạo lái xe, thi bằng b2, trường lái xe thanh thủy (ngăn cách bằng dấu phẩy)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB CONTENT 2: BANNERS & SLIDES */}
              {infoSubTab === 'banners' && (
                <div className="space-y-6">
                  {infoSlides.map((slide, sIdx) => (
                    <div key={sIdx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                      <h4 className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5 uppercase border-b border-slate-50 pb-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-bold">{sIdx + 1}</span>
                        Banner Slide {sIdx + 1}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Tiêu đề chính (Title)</label>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) => {
                              const updated = [...infoSlides];
                              updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                              setInfoSlides(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                            placeholder="Tiêu đề hiển thị lớn"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Nút bấm hành động (CTA Text)</label>
                          <input
                            type="text"
                            value={slide.cta || ''}
                            onChange={(e) => {
                              const updated = [...infoSlides];
                              updated[sIdx] = { ...updated[sIdx], cta: e.target.value };
                              setInfoSlides(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                            placeholder="Đăng ký ngay / Thi thử ngay"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Phụ đề chi tiết (Subtitle)</label>
                          <textarea
                            rows={2}
                            value={slide.subtitle || ''}
                            onChange={(e) => {
                              const updated = [...infoSlides];
                              updated[sIdx] = { ...updated[sIdx], subtitle: e.target.value };
                              setInfoSlides(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                            placeholder="Mô tả phụ cho banner"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Đường dẫn ảnh nền (URL)</label>
                          <input
                            type="text"
                            value={slide.image || ''}
                            onChange={(e) => {
                              const updated = [...infoSlides];
                              updated[sIdx] = { ...updated[sIdx], image: e.target.value };
                              setInfoSlides(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Tab chuyển hướng khi nhấn</label>
                          <select
                            value={slide.tab || ''}
                            onChange={(e) => {
                              const updated = [...infoSlides];
                              updated[sIdx] = { ...updated[sIdx], tab: e.target.value };
                              setInfoSlides(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                          >
                            <option value="courses">Khóa học (Courses)</option>
                            <option value="exam">Thi thử 600 câu (Exam)</option>
                            <option value="lookup">Tra cứu hồ sơ (Lookup)</option>
                            <option value="schedules">Lịch học (Schedules)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUB-TAB CONTENT 3: ADVANTAGES & COMMITMENTS */}
              {infoSubTab === 'advantages' && (
                <div className="space-y-6">
                  {/* Advantages Header */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      4 Ưu Điểm Cốt Lõi (Hiển thị Trang Chủ)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {infoAdvantages.map((adv, aIdx) => (
                        <div key={aIdx} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/30 space-y-2">
                          <span className="text-[10px] font-black text-orange-500 uppercase">Ưu điểm {aIdx + 1}</span>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600 block">Tiêu đề</label>
                            <input
                              type="text"
                              value={adv.title || ''}
                              onChange={(e) => {
                                const updated = [...infoAdvantages];
                                updated[aIdx] = { ...updated[aIdx], title: e.target.value };
                                setInfoAdvantages(updated);
                              }}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              placeholder="Tiêu đề ngắn"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600 block">Mô tả ngắn</label>
                            <input
                              type="text"
                              value={adv.desc || ''}
                              onChange={(e) => {
                                const updated = [...infoAdvantages];
                                updated[aIdx] = { ...updated[aIdx], desc: e.target.value };
                                setInfoAdvantages(updated);
                              }}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              placeholder="Giới thiệu một câu ngắn gọn"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Commitments Header */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      3 Cam Kết Đào Tạo (Hộp Nổi Trang Chủ)
                    </h3>
                    <div className="space-y-3">
                      {infoCommitments.map((com, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 shrink-0 w-8"># {cIdx + 1}</span>
                          <input
                            type="text"
                            value={com || ''}
                            onChange={(e) => {
                              const updated = [...infoCommitments];
                              updated[cIdx] = e.target.value;
                              setInfoCommitments(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                            placeholder="Nhập dòng cam kết"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB CONTENT 4: ABOUT PAGE */}
              {infoSubTab === 'about' && (
                <div className="space-y-6">
                  {/* About Block 1: Narrative */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      Nội Dung Giới Thiệu Lịch Sử & Sứ Mệnh
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Tiêu đề trang giới thiệu</label>
                        <input
                          type="text"
                          value={infoAboutTitle}
                          onChange={(e) => setInfoAboutTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="Hành Trình Kiến Tạo..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Số năm kinh nghiệm</label>
                        <input
                          type="text"
                          value={infoAboutYears}
                          onChange={(e) => setInfoAboutYears(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                          placeholder="10+"
                        />
                      </div>
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Đoạn mô tả 1 (Sứ mệnh)</label>
                        <textarea
                          rows={3}
                          value={infoAboutDesc1}
                          onChange={(e) => setInfoAboutDesc1(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        />
                      </div>
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Đoạn mô tả 2 (Sân sát hạch)</label>
                        <textarea
                          rows={3}
                          value={infoAboutDesc2}
                          onChange={(e) => setInfoAboutDesc2(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Block 2: 4 Features checkmarks */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      4 Tiêu Chí Điểm Cộng (Checkmarks)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {infoAboutFeatures.map((feat, fIdx) => (
                        <div key={fIdx} className="p-3 border border-slate-100 rounded-xl space-y-2 bg-slate-50/20">
                          <span className="text-[10px] font-bold text-orange-500 block">Tiêu chí {fIdx + 1}</span>
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={feat.title || ''}
                              onChange={(e) => {
                                const updated = [...infoAboutFeatures];
                                updated[fIdx] = { ...updated[fIdx], title: e.target.value };
                                setInfoAboutFeatures(updated);
                              }}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              placeholder="Tiêu đề tiêu chí"
                            />
                            <input
                              type="text"
                              value={feat.desc || ''}
                              onChange={(e) => {
                                const updated = [...infoAboutFeatures];
                                updated[fIdx] = { ...updated[fIdx], desc: e.target.value };
                                setInfoAboutFeatures(updated);
                              }}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              placeholder="Mô tả cụ thể"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Block 3: 3 Facilities cards */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      3 Cơ Sở Vật Chất Đạt Chuẩn Quốc Gia
                    </h4>
                    <div className="space-y-4">
                      {infoFacilities.map((fac, facIdx) => (
                        <div key={facIdx} className="p-4 border border-slate-100 rounded-xl space-y-3 bg-slate-50/20">
                          <span className="text-[10px] font-bold text-orange-500 block">Cơ sở {facIdx + 1}</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold">Tên cơ sở vật chất</label>
                              <input
                                type="text"
                                value={fac.title || ''}
                                onChange={(e) => {
                                  const updated = [...infoFacilities];
                                  updated[facIdx] = { ...updated[facIdx], title: e.target.value };
                                  setInfoFacilities(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold">Đường dẫn ảnh minh họa (URL)</label>
                              <input
                                type="text"
                                value={fac.image || ''}
                                onChange={(e) => {
                                  const updated = [...infoFacilities];
                                  updated[facIdx] = { ...updated[facIdx], image: e.target.value };
                                  setInfoFacilities(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold">Đoạn mô tả giới thiệu</label>
                              <textarea
                                rows={2}
                                value={fac.desc || ''}
                                onChange={(e) => {
                                  const updated = [...infoFacilities];
                                  updated[facIdx] = { ...updated[facIdx], desc: e.target.value };
                                  setInfoFacilities(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Block 4: 4 Teachers */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      4 Giáo Viên Giảng Dạy Sư Phạm
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {infoTeachers.map((teacher, tIdx) => (
                        <div key={tIdx} className="p-3 border border-slate-100 rounded-xl space-y-2 bg-slate-50/20">
                          <span className="text-[10px] font-bold text-orange-500 block">Giáo viên {tIdx + 1}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500">Họ và tên</label>
                              <input
                                type="text"
                                value={teacher.name || ''}
                                onChange={(e) => {
                                  const updated = [...infoTeachers];
                                  updated[tIdx] = { ...updated[tIdx], name: e.target.value };
                                  setInfoTeachers(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500">Chức danh sư phạm</label>
                              <input
                                type="text"
                                value={teacher.role || ''}
                                onChange={(e) => {
                                  const updated = [...infoTeachers];
                                  updated[tIdx] = { ...updated[tIdx], role: e.target.value };
                                  setInfoTeachers(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="text-[10px] text-slate-500">Đường dẫn ảnh chân dung (URL)</label>
                              <input
                                type="text"
                                value={teacher.image || ''}
                                onChange={(e) => {
                                  const updated = [...infoTeachers];
                                  updated[tIdx] = { ...updated[tIdx], image: e.target.value };
                                  setInfoTeachers(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="text-[10px] text-slate-500">Câu nói châm ngôn</label>
                              <input
                                type="text"
                                value={teacher.quote || ''}
                                onChange={(e) => {
                                  const updated = [...infoTeachers];
                                  updated[tIdx] = { ...updated[tIdx], quote: e.target.value };
                                  setInfoTeachers(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Block 5: Quality & Legal */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                      Khối Cam Kết & Hồ Sơ Pháp Lý
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Quality */}
                      <div className="space-y-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50/10">
                        <span className="text-xs font-extrabold text-blue-900 uppercase">1. Hộp Cam Kết Chất Lượng (Trái)</span>
                        <div className="space-y-2 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">Tiêu đề hộp</label>
                            <input
                              type="text"
                              value={infoQualityCommitmentTitle}
                              onChange={(e) => setInfoQualityCommitmentTitle(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">Đoạn mô tả ngắn</label>
                            <textarea
                              rows={2}
                              value={infoQualityCommitmentDesc}
                              onChange={(e) => setInfoQualityCommitmentDesc(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                            />
                          </div>
                          <div className="space-y-2 pt-1">
                            <label className="text-[10px] text-slate-500 font-bold block">3 Cam kết chính (TIÊU ĐỀ: Nội dung)</label>
                            {infoQualityCommitments.map((com, qIdx) => (
                              <input
                                key={qIdx}
                                type="text"
                                value={com || ''}
                                onChange={(e) => {
                                  const updated = [...infoQualityCommitments];
                                  updated[qIdx] = e.target.value;
                                  setInfoQualityCommitments(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Legal */}
                      <div className="space-y-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50/10">
                        <span className="text-xs font-extrabold text-blue-900 uppercase">2. Hộp Hồ Sơ Pháp Lý (Phải)</span>
                        <div className="space-y-2 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">Tiêu đề hộp</label>
                            <input
                              type="text"
                              value={infoLegalTitle}
                              onChange={(e) => setInfoLegalTitle(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">Đoạn mô tả chi tiết</label>
                            <textarea
                              rows={2}
                              value={infoLegalDesc}
                              onChange={(e) => setInfoLegalDesc(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">Huy chương / Danh hiệu</label>
                            <input
                              type="text"
                              value={infoLegalBadge}
                              onChange={(e) => setInfoLegalBadge(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">Số hiệu cấp phép (Chân trang)</label>
                            <input
                              type="text"
                              value={infoLegalFooter}
                              onChange={(e) => setInfoLegalFooter(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB CONTENT 5: TESTIMONIALS */}
              {infoSubTab === 'testimonials' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                          Quản lý ý kiến khách hàng (Học viên)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tùy chỉnh danh sách nhận xét, đánh giá của học viên hiển thị trên trang chủ.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newTestimonial = {
                            name: "Học viên mới",
                            text: "Ý kiến nhận xét của học viên...",
                            score: 5,
                            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                          };
                          setInfoTestimonials([...infoTestimonials, newTestimonial]);
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm ý kiến
                      </button>
                    </div>

                    {infoTestimonials.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs font-medium">
                        Chưa có ý kiến học viên nào. Hãy bấm "Thêm ý kiến" để bắt đầu.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {infoTestimonials.map((t, idx) => (
                          <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-4 relative hover:border-slate-200 transition">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = infoTestimonials.filter((_, i) => i !== idx);
                                setInfoTestimonials(updated);
                              }}
                              className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded-lg cursor-pointer animate-none"
                              title="Xóa ý kiến"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex gap-4 items-start">
                              {/* Avatar Preview & Upload */}
                              <div className="flex flex-col items-center gap-2 shrink-0">
                                <img
                                  src={t.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                                  alt="Avatar"
                                  className="w-14 h-14 rounded-full object-cover border border-slate-200 bg-white shadow-xs shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <label className="bg-slate-200/60 hover:bg-slate-200 hover:text-blue-950 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md transition cursor-pointer text-center w-20">
                                  Thay ảnh
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      handleInfoImageUpload(e, (url) => {
                                        const updated = [...infoTestimonials];
                                        updated[idx] = { ...updated[idx], avatar: url };
                                        setInfoTestimonials(updated);
                                      });
                                    }}
                                  />
                                </label>
                              </div>

                              <div className="flex-grow space-y-3">
                                {/* Name Input */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-500 font-bold block">Tên học viên / Danh hiệu</label>
                                  <input
                                    type="text"
                                    value={t.name || ""}
                                    onChange={(e) => {
                                      const updated = [...infoTestimonials];
                                      updated[idx] = { ...updated[idx], name: e.target.value };
                                      setInfoTestimonials(updated);
                                    }}
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
                                    placeholder="Ví dụ: Anh Hoàng Lâm (Học viên B2)"
                                  />
                                </div>

                                {/* Avatar URL Direct Input */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-500 font-bold block">Link ảnh đại diện (Hoặc tải lên tự động)</label>
                                  <input
                                    type="text"
                                    value={t.avatar || ""}
                                    onChange={(e) => {
                                      const updated = [...infoTestimonials];
                                      updated[idx] = { ...updated[idx], avatar: e.target.value };
                                      setInfoTestimonials(updated);
                                    }}
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-mono focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white text-slate-500"
                                    placeholder="Link ảnh Unsplash hoặc tải lên..."
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              {/* Rating score */}
                              <div className="space-y-1 sm:col-span-1">
                                <label className="text-[10px] text-slate-500 font-bold block">Đánh giá</label>
                                <select
                                  value={t.score || 5}
                                  onChange={(e) => {
                                    const updated = [...infoTestimonials];
                                    updated[idx] = { ...updated[idx], score: Number(e.target.value) };
                                    setInfoTestimonials(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold text-yellow-600"
                                >
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <option key={s} value={s}>{s} Sao</option>
                                  ))}
                                </select>
                              </div>

                              {/* Testimonial quote text */}
                              <div className="space-y-1 sm:col-span-3">
                                <label className="text-[10px] text-slate-500 font-bold block">Nội dung nhận xét</label>
                                <textarea
                                  rows={3}
                                  value={t.text || ""}
                                  onChange={(e) => {
                                    const updated = [...infoTestimonials];
                                    updated[idx] = { ...updated[idx], text: e.target.value };
                                    setInfoTestimonials(updated);
                                  }}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white text-slate-700 leading-relaxed"
                                  placeholder="Nhập ý kiến nhận xét chi tiết của học viên..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveInfo}
                  disabled={saveInfoLoading}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saveInfoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Lưu thiết lập & Áp dụng
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STUDENTS MANAGER */}
          {activeTab === 'students' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <h2 className="font-extrabold text-blue-950 text-base">Danh Sách Đăng Ký Học Lái Xe</h2>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenAddStudent}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Thêm Học Viên
                  </button>

                  <label className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer">
                    <Upload className="w-4 h-4 text-orange-500" /> Nhập Excel
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={(e) => handleExcelImportFile(e, 'students')}
                    />
                  </label>

                  <button
                    onClick={exportStudentsToExcel}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Xuất Excel ({students.length})
                  </button>
                </div>
              </div>

              {/* Student table list */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-3">Học Viên</th>
                      <th className="p-3">Số Điện Thoại</th>
                      <th className="p-3">Số CCCD</th>
                      <th className="p-3 text-center">Hạng bằng</th>
                      <th className="p-3">Giáo viên</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">{s.id}</span>
                        </td>
                        <td className="p-3 font-medium">{s.phone}</td>
                        <td className="p-3 font-mono text-slate-600">{s.identity}</td>
                        <td className="p-3 text-center"><span className="bg-blue-50 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Hạng {s.class}</span></td>
                        <td className="p-3 font-semibold text-slate-600">{s.teacher || "Tự do"}</td>
                        <td className="p-3">
                          <select
                            value={s.status}
                            onChange={(e) => {
                              s.status = e.target.value;
                              saveItem('students', s);
                            }}
                            className="bg-white border border-slate-200 text-[10px] font-bold rounded px-1.5 py-0.5"
                          >
                            <option value="Mới đăng ký">Mới đăng ký</option>
                            <option value="Đang học">Đang học</option>
                            <option value="Chờ thi">Chờ thi</option>
                            <option value="Đậu">Đậu (Đã thi)</option>
                            <option value="Rớt">Rớt (Thi lại)</option>
                          </select>
                        </td>
                        <td className="p-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditStudent(s)}
                            className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer inline-flex items-center justify-center"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem('students', s.id)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer inline-flex items-center justify-center"
                            title="Xóa học viên"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: QUESTION BANK */}
          {activeTab === 'questions' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <h2 className="font-extrabold text-blue-950 text-base">Ngân Hàng 600 Câu Hỏi Sát Hạch</h2>
                
                <div className="flex gap-2">
                  <label className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer">
                    <Upload className="w-4 h-4 text-orange-500" /> Import câu hỏi từ Excel
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={(e) => handleExcelImportFile(e, 'questions')}
                    />
                  </label>

                  <button
                    onClick={() => {
                      const newQ = {
                        question: "Nhập nội dung câu hỏi mới?",
                        options: ["A. Đáp án thứ nhất", "B. Đáp án thứ hai"],
                        answer: "A",
                        explanation: "Giải thích đáp án cho học sinh ôn luyện.",
                        category: "Khái niệm và quy tắc",
                        licenseClasses: ["B1", "B2"],
                        critical: false
                      };
                      saveItem('questions', newQ);
                    }}
                    className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Thêm câu hỏi
                  </button>
                </div>
              </div>

              {/* Questions database list */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        MÃ: {q.id}
                      </span>
                      <div className="flex gap-2.5 items-center">
                        {q.critical && (
                          <span className="bg-red-100 text-red-700 text-[9px] font-extrabold px-2 py-0.5 rounded">ĐIỂM LIỆT</span>
                        )}
                        <span className="text-[10px] text-gray-500 font-semibold">{q.category}</span>
                        <button
                          onClick={() => deleteItem('questions', q.id)}
                          className="text-red-500 hover:text-red-700 p-1 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-xs leading-relaxed">{idx + 1}. {q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pl-2">
                      {q.options.map((opt, oIdx) => <div key={oIdx}>{opt}</div>)}
                    </div>

                    <div className="text-[11px] font-bold text-orange-600 pt-1 border-t border-slate-200/50">
                      Đáp án đúng: {q.answer} • Hạng áp dụng: {q.licenseClasses.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: CONTACTS */}
          {activeTab === 'contacts' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-extrabold text-blue-950 text-base border-b border-slate-50 pb-2">Danh Sách Yêu Cầu Tư Vấn</h2>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {contacts.map((c) => (
                  <div key={c.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-blue-950 text-sm leading-none">{c.name}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-1">SĐT: {c.phone} • Email: {c.email || 'không có'}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                        c.status === 'Đã xử lý' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-100 leading-relaxed">
                      <strong>Tiêu đề:</strong> {c.subject}<br />
                      <strong>Lời nhắn:</strong> {c.message}
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200/40">
                      <div className="text-[10px] text-gray-400 font-semibold shrink-0">Ngày gửi: {c.date}</div>
                      
                      {c.status === 'Chuâ xử lý' || c.status === 'Chưa xử lý' ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Ghi chú phản hồi học viên..."
                            onBlur={(e) => updateContact(c.id, 'Đã xử lý', e.target.value)}
                            className="bg-white border border-slate-200 text-xs px-2.5 py-1 rounded w-full sm:w-48 focus:outline-none"
                          />
                          <button
                            onClick={() => updateContact(c.id, 'Đã xử lý', 'Đã điện thoại tư vấn thành công')}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3 py-1 rounded shrink-0 cursor-pointer"
                          >
                            Xác nhận xử lý
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-medium italic">Ghi chú phản hồi: {c.notes || "Học viên được tư vấn thành công"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SYSTEM LOGS */}
          {activeTab === 'logs' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-extrabold text-blue-950 text-base border-b border-slate-50 pb-2">Nhật Ký Hoạt Động Hệ Thống</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="text-xs py-2 border-b border-slate-50 flex justify-between items-center gap-4">
                    <span className="font-mono text-slate-400 shrink-0">{new Date(log.time).toLocaleTimeString()}</span>
                    <span className="text-slate-800 font-medium flex-grow">{log.action}</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold shrink-0">{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: BACKUP & RESTORE */}
          {activeTab === 'backup' && !importType && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-extrabold text-blue-950 text-base border-b border-slate-50 pb-2">Sao Lưu & Khôi Phục Hệ Thống</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Block */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Database className="w-5 h-5 text-blue-900" /> SAO LƯU DỮ LIỆU GỐC
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tải tệp sao lưu dữ liệu toàn bộ hệ thống (`db.json`) bao gồm thông tin trường học, học viên, lịch học và ngân hàng 600 câu hỏi về máy tính cá nhân để lưu giữ an toàn.
                  </p>
                  <button
                    onClick={exportBackup}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition inline-block cursor-pointer"
                  >
                    Tải tệp sao lưu (.json)
                  </button>
                </div>

                {/* Restore Block */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Upload className="w-5 h-5 text-orange-500" /> PHỤC HỒI DỮ LIỆU GỐC
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Nạp tệp sao lưu hệ thống `.json` bạn đã lưu trữ trước đây để ghi đè khôi phục dữ liệu nguyên trạng thái cũ. Lưu ý: Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện có!
                  </p>
                  
                  <label className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition inline-block cursor-pointer shadow-sm w-fit">
                    Chọn tệp phục hồi (.json)
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const text = await file.text();
                        try {
                          const backupData = JSON.parse(text);
                          if (!confirm("Hành động này sẽ ghi đè toàn bộ dữ liệu của website lái xe hiện tại. Bạn có chắc chắn muốn khôi phục?")) return;
                          
                          const res = await fetch('/api/backup/restore', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ backupData })
                          });
                          if (!res.ok) throw new Error();
                          alert("Khôi phục toàn bộ cơ sở dữ liệu thành công!");
                          onRefreshAll();
                        } catch {
                          alert("Định dạng file không chính xác!");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: USERS & ROLE AUTHORIZATION */}
          {activeTab === 'users' && !importType && session?.role === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-blue-950 text-base">Tài Khoản & Phân Quyền</h2>
                  <p className="text-xs text-slate-500 mt-1">Quản lý tài khoản truy cập hệ thống quản trị, phân chia quyền hạn và cài đặt Email bảo mật.</p>
                </div>
                <button
                  onClick={openAddUser}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" /> Thêm tài khoản mới
                </button>
              </div>

              {usersLoading ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-900" />
                  Đang tải danh sách tài khoản...
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4">Họ và tên</th>
                        <th className="p-4">Tên đăng nhập</th>
                        <th className="p-4">Địa chỉ Email</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Quyền hạn</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                      {usersList.map((u) => (
                        <tr key={u.username} className={`hover:bg-slate-50/50 transition ${u.status === 'disabled' ? 'bg-red-50/30' : ''}`}>
                          <td className="p-4 font-bold text-slate-900">
                            {u.fullName}
                            {session?.username === u.username && (
                              <span className="ml-1.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-normal">Tôi</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-slate-500">{u.username}</td>
                          <td className="p-4 font-mono text-slate-500">{u.email || <span className="text-slate-300 italic">Chưa thiết lập</span>}</td>
                          <td className="p-4">
                            {u.status === 'disabled' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-100 text-red-800 border border-red-200">
                                <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" /> Vô hiệu hóa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-green-100 text-green-800 border border-green-200">
                                <Check className="w-3.5 h-3.5 text-green-600" /> Hoạt động
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {u.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5" /> Quản Trị Viên (Admin)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                                <Users className="w-3.5 h-3.5" /> Nhân Viên Tuyển Sinh (Staff)
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button
                              onClick={() => openEditUser(u)}
                              className="text-blue-600 hover:text-blue-900 font-bold hover:underline cursor-pointer transition inline-flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" /> Sửa
                            </button>
                            {session?.username !== u.username && (
                              <>
                                <button
                                  onClick={() => handleToggleUserStatus(u.username)}
                                  className={`font-bold hover:underline cursor-pointer transition inline-flex items-center gap-1 ${
                                    u.status === 'disabled' ? 'text-green-600 hover:text-green-900' : 'text-amber-600 hover:text-amber-900'
                                  }`}
                                >
                                  {u.status === 'disabled' ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" /> Mở khóa
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3.5 h-3.5" /> Vô hiệu
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="text-red-600 hover:text-red-900 font-bold hover:underline cursor-pointer transition inline-flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {usersList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 italic">Không tìm thấy tài khoản quản trị nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MODAL USER FORM */}
              {userModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-slide-up">
                    <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-base">{editingUser ? "Chỉnh Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}</h3>
                        <p className="text-[11px] text-blue-200 mt-0.5">Thiết lập thông tin và phân chia quyền hạn hệ thống</p>
                      </div>
                      <button
                        onClick={() => setUserModalOpen(false)}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                      {formError && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-lg font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Tên đăng nhập (Username)</label>
                        <input
                          type="text"
                          required
                          disabled={!!editingUser}
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="Ví dụ: nguyenvan_a"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs font-mono disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Họ và tên cán bộ</label>
                        <input
                          type="text"
                          required
                          value={formFullName}
                          onChange={(e) => setFormFullName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Địa chỉ Email (Để khôi phục mật khẩu)</label>
                        <input
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="Ví dụ: canbo@thanhthuy.edu.vn"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                        />
                        <span className="text-[10px] text-slate-400">Email này sẽ được dùng để xác thực và đổi mật khẩu khi bấm quên mật khẩu.</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Cấp phân quyền hệ thống</label>
                        <select
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                        >
                          <option value="staff">Nhân viên tuyển sinh (Chỉ quản lý học viên, tin tức, lịch học)</option>
                          <option value="admin">Quản trị viên tối cao (Quản lý mọi cấu hình, backup, tài khoản)</option>
                        </select>
                      </div>

                      {editingUser && session?.username !== editingUser.username && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Trạng thái hoạt động</label>
                          <select
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                          >
                            <option value="active">Đang hoạt động (Active)</option>
                            <option value="disabled">Vô hiệu hóa (Deactivated)</option>
                          </select>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-700">Mật khẩu đăng nhập</label>
                          {editingUser && <span className="text-[10px] text-slate-400 italic">(Để trống nếu giữ nguyên mật khẩu cũ)</span>}
                        </div>
                        <input
                          type="password"
                          required={!editingUser}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder={editingUser ? "Nhập mật khẩu mới..." : "Nhập mật khẩu tài khoản..."}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-xs"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setUserModalOpen(false)}
                          className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition cursor-pointer text-center"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition disabled:bg-gray-400 cursor-pointer text-center"
                        >
                          {formLoading ? "Đang lưu..." : "Lưu tài khoản"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: COURSES MANAGEMENT */}
          {activeTab === 'courses' && !importType && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-blue-950 text-base">Quản Lý Danh Sách Khóa Học Đào Tạo</h2>
                  <p className="text-xs text-slate-500 mt-1">Cập nhật thông tin, thay đổi hạng bằng, giá tiền học phí và cấu hình hiển thị.</p>
                </div>
                <button
                  onClick={handleOpenAddCourse}
                  className="bg-blue-900 hover:bg-blue-850 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/10"
                >
                  <Plus className="w-4 h-4" /> Thêm khóa học mới
                </button>
              </div>

              {/* Table of courses */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4 w-20">Hình ảnh</th>
                      <th className="p-4 w-24">Hạng / Mã</th>
                      <th className="p-4">Tên khóa học</th>
                      <th className="p-4 text-right">Học phí (Trọn gói)</th>
                      <th className="p-4 text-center">Thời gian học</th>
                      <th className="p-4 text-center">Nổi bật</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {courses && courses.length > 0 ? (
                      courses.map((course) => (
                        <tr key={course.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4">
                            <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                              {course.image ? (
                                <img
                                  src={course.image}
                                  alt={course.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-[10px]">
                                  {course.id.toUpperCase()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-extrabold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg uppercase text-[10px] tracking-wider">
                              {course.id}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900 text-xs">{course.name}</div>
                            {course.requirements && (
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{course.requirements}</div>
                            )}
                          </td>
                          <td className="p-4 text-right font-black text-orange-600">
                            {Number(course.fee).toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-4 text-center font-semibold text-slate-600">{course.duration}</td>
                          <td className="p-4 text-center">
                            {course.featured ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                ★ Nổi bật
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[9px]">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {course.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                                ● Tuyển sinh
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                                Tạm dừng
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditCourse(course)}
                              className="p-1.5 hover:bg-blue-50 text-blue-700 hover:text-blue-900 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                              title="Chỉnh sửa khóa học"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-800 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                              title="Xóa khóa học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                          Chưa có khóa học nào được cấu hình.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCHEDULES MANAGEMENT TAB */}
          {activeTab === 'schedules' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-blue-950 text-base">Quản Lý Lịch Học & Lịch Sát Hạch</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Cấu hình lịch học lý thuyết, thực hành và lịch thi sát hạch cho học viên.</p>
                </div>
                <button
                  onClick={handleOpenAddSchedule}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm Lịch Học / Thi
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">STT</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28">Ngày diễn ra</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Lớp / Hạng</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Môn học / Nội dung</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Địa điểm</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {schedules && schedules.length > 0 ? (
                        schedules.map((s, idx) => (
                          <tr key={s.id || idx} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3 font-semibold text-slate-800">{s.date}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded-md font-bold text-[10px]">
                                {s.class}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-800">{s.subject}</td>
                            <td className="p-3 text-slate-600">{s.location}</td>
                            <td className="p-3 text-slate-500 italic max-w-xs truncate" title={s.notes}>{s.notes || '-'}</td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditSchedule(s)}
                                className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('schedules', s.id)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                            Chưa có lịch học hay lịch thi nào được khởi tạo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEWS MANAGEMENT TAB */}
          {activeTab === 'news' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-blue-950 text-base">Quản Lý Bài Viết & Tin Tức</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Viết bài tuyển sinh, hướng dẫn ôn tập, thông báo lịch thi và mẹo lái xe cho học viên.</p>
                </div>
                <button
                  onClick={handleOpenAddNews}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Viết Bài Mới
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">STT</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-20">Hình ảnh</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-32">Chuyên mục</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28">Ngày đăng</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28">Tác giả</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28">Trạng thái</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {newsList && newsList.length > 0 ? (
                        newsList.map((n, idx) => (
                          <tr key={n.id || idx} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3">
                              <img
                                src={n.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=120'}
                                alt="News cover"
                                className="w-12 h-8 object-cover rounded-lg border border-slate-100"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="p-3 font-bold text-slate-800 max-w-sm truncate" title={n.title}>
                              {n.title}
                            </td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-semibold text-[10px]">
                                {n.category}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">{n.date}</td>
                            <td className="p-3 text-slate-600 font-medium">{n.author || 'Admin'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                n.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {n.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditNews(n)}
                                className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Sửa bài viết"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('news', n.id)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Xóa bài viết"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                            Chưa có bài viết tin tức nào được đăng.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS MANAGEMENT TAB */}
          {activeTab === 'documents' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-blue-950 text-base">Quản Lý Học Liệu & Tài Liệu</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tải lên các tài liệu ôn tập, file luật giao thông, phần mềm mô phỏng lái xe cho học viên tải về.</p>
                </div>
                <button
                  onClick={handleOpenAddDocument}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm Học Liệu
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">STT</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên tài liệu / Học liệu</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-40">Chuyên mục</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả chi tiết</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 text-center">Lượt tải</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-40">Tệp tin / Đường dẫn URL</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {documents && documents.length > 0 ? (
                        documents.map((d, idx) => (
                          <tr key={d.id || idx} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-800">{d.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md font-semibold text-[10px]">
                                {d.category}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 max-w-xs truncate" title={d.description}>
                              {d.description || '-'}
                            </td>
                            <td className="p-3 text-center text-slate-600 font-bold">{d.downloads || 0}</td>
                            <td className="p-3 text-slate-400 font-mono text-[10px] max-w-xs truncate" title={d.fileUrl}>
                              {d.fileUrl}
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditDocument(d)}
                                className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Sửa học liệu"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('documents', d.id)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Xóa học liệu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                            Chưa có tài liệu học liệu nào được đăng tải.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ALBUMS MANAGEMENT TAB */}
          {activeTab === 'albums' && !importType && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-blue-950 text-base">Quản Lý Album Ảnh & Video Sa Hình</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tải lên hình ảnh sân tập lái, dàn xe tập lái và video hướng dẫn các bài thi sa hình thực tế.</p>
                </div>
                <button
                  onClick={handleOpenAddAlbum}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm Ảnh / Video
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">STT</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 text-center">Xem trước</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề mô tả</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28 text-center">Định dạng</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 text-center">Thứ tự</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đường dẫn tệp (URL)</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {albums && albums.length > 0 ? (
                        albums.map((a, idx) => (
                          <tr key={a.id || idx} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3 text-center">
                              {a.type === 'image' ? (
                                <img
                                  src={a.url}
                                  alt="Preview"
                                  className="w-14 h-10 object-cover rounded-lg border border-slate-100 mx-auto"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-14 h-10 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center mx-auto">
                                  <span className="text-[9px] font-bold text-red-600 uppercase">YOUTUBE</span>
                                </div>
                              )}
                            </td>
                            <td className="p-3 font-bold text-slate-800">{a.title}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                a.type === 'image' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {a.type === 'image' ? 'Hình ảnh' : 'Video Sa Hình'}
                              </span>
                            </td>
                            <td className="p-3 text-center text-slate-600 font-bold">{a.sortOrder || 0}</td>
                            <td className="p-3 text-slate-400 text-[10px] max-w-xs truncate font-mono" title={a.url}>
                              {a.url}
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditAlbum(a)}
                                className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('albums', a.id)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer inline-flex items-center justify-center"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                            Chưa có hình ảnh hay video nào trong album.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STUDENT ADD/EDIT MODAL */}
          {studentModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-blue-950 text-base">
                      {studentModalType === 'add' ? "Thêm Học Viên Mới" : "Cập Nhật Thông Tin Học Viên"}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Vui lòng nhập thông tin chi tiết của học viên đăng ký.</p>
                  </div>
                  <button
                    onClick={() => setStudentModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </div>

                <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Họ tên */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Họ và tên <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={studentForm.name || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Số điện thoại <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={studentForm.phone || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="0988123456"
                        required
                      />
                    </div>

                    {/* Số CCCD */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Số CCCD <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={studentForm.identity || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, identity: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="025096001234"
                        required
                      />
                    </div>

                    {/* Ngày sinh */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Ngày sinh</label>
                      <input
                        type="text"
                        value={studentForm.dob || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="01/01/2000"
                      />
                    </div>

                    {/* Địa chỉ */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Địa chỉ thường trú</label>
                      <input
                        type="text"
                        value={studentForm.address || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Thanh Thủy, Phú Thọ"
                      />
                    </div>

                    {/* Hạng bằng */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Hạng bằng lái xe <span className="text-red-500">*</span></label>
                      <select
                        value={studentForm.class || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, class: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold"
                        required
                      >
                        <option value="">-- Chọn hạng bằng --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id.toUpperCase()}>{c.id.toUpperCase()} - {c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Giáo viên kèm */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Giáo viên hướng dẫn</label>
                      <input
                        type="text"
                        value={studentForm.teacher || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, teacher: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Thầy Nguyễn Đức..."
                      />
                    </div>

                    {/* Trạng thái học tập */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Trạng thái hiện tại</label>
                      <select
                        value={studentForm.status || 'Mới đăng ký'}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold"
                      >
                        <option value="Mới đăng ký">Mới đăng ký</option>
                        <option value="Đang học">Đang học</option>
                        <option value="Chờ thi">Chờ thi</option>
                        <option value="Đậu">Đậu (Đã thi)</option>
                        <option value="Rớt">Rớt (Thi lại)</option>
                      </select>
                    </div>
                  </div>

                  {/* Nhận xét / Ghi chú */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Ghi chú & Nhận xét của học viên</label>
                    <textarea
                      rows={3}
                      value={studentForm.notes || ''}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Ghi chú về hồ sơ, lịch thực hành, hoặc nhận xét phản hồi về dịch vụ..."
                    />
                  </div>

                  {/* Nút thao tác */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setStudentModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-500 cursor-pointer transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingStudent}
                      className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingStudent ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        "Lưu thông tin"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SCHEDULE ADD/EDIT MODAL */}
          {scheduleModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-blue-950 text-base">
                      {scheduleModalType === 'add' ? "Thêm Lịch Học / Sát Hạch Mới" : "Cập Nhật Lịch Học / Thi"}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Vui lòng điền chi tiết lịch học/thi lý thuyết và thực hành.</p>
                  </div>
                  <button
                    onClick={() => setScheduleModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </div>

                <form onSubmit={handleSaveSchedule} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Ngày */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Ngày diễn ra <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={scheduleForm.date || ''}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        required
                      />
                    </div>

                    {/* Lớp / Hạng */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Hạng bằng / Lớp đào tạo <span className="text-red-500">*</span></label>
                      <select
                        value={scheduleForm.class || ''}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, class: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold"
                        required
                      >
                        <option value="">-- Chọn hạng bằng --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id.toUpperCase()}>{c.id.toUpperCase()} - {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Môn học / Nội dung */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Nội dung học / Thi sát hạch <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={scheduleForm.subject || ''}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Ví dụ: Thi thử lý thuyết 600 câu hoặc Học thực hành lái xe đường trường"
                      required
                    />
                  </div>

                  {/* Địa điểm */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Địa điểm học / Tập trung <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={scheduleForm.location || ''}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Ví dụ: Phòng lý thuyết trung tâm hoặc Sân tập Thanh Thủy"
                      required
                    />
                  </div>

                  {/* Ghi chú */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Ghi chú bổ sung</label>
                    <textarea
                      rows={3}
                      value={scheduleForm.notes || ''}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Các yêu cầu học viên mang theo CCCD, lệ phí, hoặc lưu ý trang phục học thực hành..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setScheduleModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-500 cursor-pointer transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingSchedule}
                      className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingSchedule ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        "Lưu lịch học"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* NEWS ADD/EDIT MODAL */}
          {newsModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-blue-950 text-base">
                      {newsModalType === 'add' ? "Đăng Bài Viết Tin Tức Mới" : "Cập Nhật Nội Dung Bài Viết"}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Soạn thảo nội dung thông báo tuyển sinh, tài liệu hay tin tức bổ ích.</p>
                  </div>
                  <button
                    onClick={() => setNewsModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </div>

                <form onSubmit={handleSaveNews} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tiêu đề */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={newsForm.title || ''}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-semibold text-slate-800"
                        placeholder="Nhập tiêu đề bài viết..."
                        required
                      />
                    </div>

                    {/* Chuyên mục */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Chuyên mục <span className="text-red-500">*</span></label>
                      <select
                        value={newsForm.category || 'Tuyển sinh'}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold text-slate-800"
                        required
                      >
                        <option value="Tuyển sinh">Tuyển sinh</option>
                        <option value="Thông báo">Thông báo</option>
                        <option value="Lịch thi">Lịch thi</option>
                        <option value="Tài liệu">Tài liệu</option>
                      </select>
                    </div>

                    {/* Trạng thái bài viết */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Trạng thái phát hành</label>
                      <select
                        value={newsForm.status || 'published'}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold text-slate-800"
                      >
                        <option value="published">Đã xuất bản (Công khai)</option>
                        <option value="draft">Bản nháp (Ẩn bài viết)</option>
                      </select>
                    </div>

                    {/* Ngày viết */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Ngày viết bài <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={newsForm.date || ''}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        required
                      />
                    </div>

                    {/* Tác giả */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Tác giả bài viết</label>
                      <input
                        type="text"
                        value={newsForm.author || ''}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Ban Tuyển Sinh..."
                      />
                    </div>

                    {/* Link ảnh bìa */}
                    <div className="space-y-1 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 block">Link ảnh bìa bài viết</label>
                        <label className="text-[10px] text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Tải lên ảnh mới
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'image', setNewsForm)}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={newsForm.image || ''}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none text-slate-600 font-mono"
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </div>
                  </div>

                  {/* Tóm tắt */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Tóm tắt ngắn (Hiển thị ở trang danh sách)</label>
                    <textarea
                      rows={2}
                      value={newsForm.summary || ''}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, summary: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Tóm tắt ngắn gọn nội dung cốt lõi của bài viết..."
                    />
                  </div>

                  {/* Nội dung chi tiết */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Nội dung chi tiết bài viết (Hỗ trợ Markdown) <span className="text-red-500">*</span></label>
                    <textarea
                      rows={6}
                      value={newsForm.content || ''}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono"
                      placeholder="Nhập nội dung chi tiết của bài viết tại đây. Bạn có thể sử dụng các cú pháp Markdown cơ bản..."
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setNewsModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-500 cursor-pointer transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingNews}
                      className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingNews ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Đang đăng...
                        </>
                      ) : (
                        "Đăng bài viết"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DOCUMENT ADD/EDIT MODAL */}
          {documentModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-blue-950 text-base">
                      {documentModalType === 'add' ? "Đăng Học Liệu / Tài Liệu Mới" : "Cập Nhật Học Liệu / Tài Liệu"}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Tải lên các file tài liệu pdf, phần mềm, app ôn thi hoặc mẹo thi lý thuyết.</p>
                  </div>
                  <button
                    onClick={() => setDocumentModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </div>

                <form onSubmit={handleSaveDocument} className="p-6 space-y-4">
                  {/* Tên tài liệu */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Tên tài liệu / Học liệu <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={documentForm.name || ''}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-bold text-slate-800"
                      placeholder="Ví dụ: Tài liệu Mẹo học 600 câu lý thuyết bao đậu 100%"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Chuyên mục */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Chuyên mục tài liệu <span className="text-red-500">*</span></label>
                      <select
                        value={documentForm.category || 'Mẹo thi lý thuyết'}
                        onChange={(e) => setDocumentForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold"
                        required
                      >
                        <option value="Mẹo thi lý thuyết">Mẹo thi lý thuyết</option>
                        <option value="Lý thuyết 600 câu">Lý thuyết 600 câu</option>
                        <option value="Biển báo giao thông">Biển báo giao thông</option>
                        <option value="Tài liệu mô phỏng">Tài liệu mô phỏng</option>
                      </select>
                    </div>

                    {/* Lượt tải */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Lượt tải mặc định</label>
                      <input
                        type="number"
                        value={documentForm.downloads || 0}
                        onChange={(e) => setDocumentForm(prev => ({ ...prev, downloads: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Link tải về / file URL */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 block">Link tải tài liệu hoặc tệp đính kèm <span className="text-red-500">*</span></label>
                      <label className="text-[10px] text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Tải lên tệp PDF/Doc mới
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'fileUrl', setDocumentForm)}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={documentForm.fileUrl || ''}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none text-slate-600 font-mono"
                      placeholder="Đường dẫn link tải Google Drive hoặc link tệp tải lên..."
                      required
                    />
                  </div>

                  {/* Mô tả tài liệu */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Mô tả ngắn gọn về tài liệu</label>
                    <textarea
                      rows={3}
                      value={documentForm.description || ''}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="Tóm tắt về tài liệu ôn thi này..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setDocumentModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-500 cursor-pointer transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingDocument}
                      className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingDocument ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        "Lưu tài liệu"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ALBUM ADD/EDIT MODAL */}
          {albumModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-blue-950 text-base">
                      {albumModalType === 'add' ? "Thêm Hình Ảnh / Video Mới" : "Cập Nhật Thông Tin Album"}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Thêm hình ảnh hoạt động sân tập lái xe hoặc link video sa hình từ Youtube.</p>
                  </div>
                  <button
                    onClick={() => setAlbumModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </div>

                <form onSubmit={handleSaveAlbum} className="p-6 space-y-4">
                  {/* Tiêu đề */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Tiêu đề mô tả <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={albumForm.title || ''}
                      onChange={(e) => setAlbumForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none text-slate-800 font-semibold"
                      placeholder="Ví dụ: Hình ảnh dàn xe Vios mới 100% của trung tâm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Định dạng */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Định dạng tệp <span className="text-red-500">*</span></label>
                      <select
                        value={albumForm.type || 'image'}
                        onChange={(e) => setAlbumForm(prev => ({ ...prev, type: e.target.value as 'image' | 'video' }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white font-bold"
                        required
                      >
                        <option value="image">Hình ảnh hoạt động</option>
                        <option value="video">Video sa hình (Youtube Embed)</option>
                      </select>
                    </div>

                    {/* Thứ tự sắp xếp */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Thứ tự hiển thị</label>
                      <input
                        type="number"
                        value={albumForm.sortOrder || 1}
                        onChange={(e) => setAlbumForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Số nhỏ xếp trước..."
                      />
                    </div>
                  </div>

                  {/* Đường dẫn URL */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 block">Đường dẫn tệp (URL) <span className="text-red-500">*</span></label>
                      {albumForm.type === 'image' && (
                        <label className="text-[10px] text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Tải lên ảnh mới
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'url', setAlbumForm)}
                          />
                        </label>
                      )}
                    </div>
                    <input
                      type="text"
                      value={albumForm.url || ''}
                      onChange={(e) => setAlbumForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none text-slate-600 font-mono"
                      placeholder={albumForm.type === 'image' ? "https://images.unsplash.com/..." : "https://www.youtube.com/embed/..."}
                      required
                    />
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {albumForm.type === 'image' 
                        ? "Nhập link ảnh Unsplash/Web hoặc chọn tải lên ảnh trực tiếp từ máy của bạn."
                        : "Nhập link nhúng Youtube có dạng: https://www.youtube.com/embed/Mã-Video"
                      }
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setAlbumModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-500 cursor-pointer transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingAlbum}
                      className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingAlbum ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        "Lưu ảnh/video"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* COURSE ADD/EDIT MODAL */}
          {courseModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-blue-950 text-base">
                      {courseModalType === 'add' ? "Thêm Khóa Học Đào Tạo Mới" : "Cập Nhật Thông Tin Khóa Học"}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Vui lòng điền đầy đủ các thông tin khóa học bên dưới.</p>
                  </div>
                  <button
                    onClick={() => setCourseModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </div>

                <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hạng / Mã id */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Hạng bằng / Mã khóa học <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={courseForm.id || ''}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, id: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Ví dụ: b1, b2, c, a1..."
                        required
                      />
                      <p className="text-[9px] text-slate-400">Mã định danh duy nhất (ví dụ: b1, b2, c). Bạn có thể thay đổi mã hạng này trực tiếp.</p>
                    </div>

                    {/* Tên khóa học */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Tên khóa học <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={courseForm.name || ''}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Ví dụ: Khóa học Lái xe Ô tô Hạng B1"
                        required
                      />
                    </div>

                    {/* Học phí */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Học phí trọn gói (VND) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={courseForm.fee || 0}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, fee: Number(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Ví dụ: 14500000"
                        required
                        min={0}
                      />
                    </div>

                    {/* Thời gian học */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Thời gian học <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={courseForm.duration || ''}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Ví dụ: 3 tháng, 5 tháng..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Yêu cầu nhập học */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Yêu cầu sức khỏe / Độ tuổi</label>
                      <input
                        type="text"
                        value={courseForm.requirements || ''}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, requirements: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Ví dụ: Đủ 18 tuổi trở lên, đủ sức khỏe..."
                      />
                    </div>

                    {/* Hồ sơ nhập học */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Hồ sơ bao gồm</label>
                      <input
                        type="text"
                        value={courseForm.documents || ''}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, documents: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        placeholder="Ví dụ: CCCD photo, 6 ảnh 3x4..."
                      />
                    </div>
                  </div>

                  {/* Hình ảnh */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Hình ảnh đại diện khóa học</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={courseForm.image || ''}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none animate-fade-in"
                        placeholder="Đường dẫn ảnh hoặc tải lên bằng nút bên cạnh..."
                      />
                      <label className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0">
                        <Upload className="w-4 h-4 text-orange-500" /> Tải ảnh lên
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const base64 = (reader.result as string).split(',')[1];
                              try {
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({
                                    name: file.name,
                                    type: file.type,
                                    base64
                                  })
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error);
                                setCourseForm(prev => ({ ...prev, image: data.fileUrl }));
                                alert("Tải ảnh khóa học lên thành công!");
                              } catch (err: any) {
                                alert(err.message || "Lỗi tải ảnh");
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                    {courseForm.image && (
                      <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                        <img src={courseForm.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>

                  {/* Mô tả chi tiết */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Mô tả ngắn giới thiệu</label>
                    <textarea
                      value={courseForm.description || ''}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none resize-none"
                      placeholder="Nhập thông tin giới thiệu ngắn về khóa học..."
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-6 items-center pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={courseForm.featured || false}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-900 border-slate-200 focus:ring-blue-900 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">Khóa học nổi bật (Hiển thị trang chủ)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Trạng thái:</span>
                      <select
                        value={courseForm.status || 'active'}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      >
                        <option value="active">Đang tuyển sinh</option>
                        <option value="inactive">Tạm dừng tuyển sinh</option>
                      </select>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCourseModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingCourse}
                      className="px-5 py-2 text-xs font-bold bg-blue-900 hover:bg-blue-850 text-white rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingCourse ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        "Lưu thông tin"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* CUSTOM CONFIRM MODAL */}
          {confirmModal.isOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[10000] animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden animate-slide-up">
                <div className={`p-5 border-b flex items-center gap-3 ${confirmModal.isDanger ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                  <div className={`p-2.5 rounded-full ${confirmModal.isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{confirmModal.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Yêu cầu xác nhận tác vụ quản trị</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{confirmModal.message}</p>
                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition cursor-pointer ${
                      confirmModal.isDanger 
                        ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' 
                        : 'bg-blue-900 hover:bg-blue-850 active:bg-blue-950'
                    }`}
                  >
                    {confirmModal.confirmLabel || 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
