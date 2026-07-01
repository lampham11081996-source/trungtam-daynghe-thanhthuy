export interface SchoolInfo {
  name: string;
  address: string;
  hotline: string;
  email: string;
  logo: string;
  banner: string;
  intro: string;
  footer: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  themeStyle?: string;
  fontFamily?: string;
  subtitle?: string;
  footerSlogan?: string;
  introVideoUrl?: string;
  footerDesc?: string;
  footerTag1?: string;
  footerTag2?: string;
  domain?: string;
  websiteUrl?: string;
}

export interface Course {
  id: string;
  name: string;
  fee: number;
  duration: string;
  requirements: string;
  description: string;
  documents: string;
  featured: boolean;
  status: 'active' | 'inactive';
  image: string;
}

export interface Schedule {
  id: string;
  date: string;
  class: string;
  subject: string;
  location: string;
  notes: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  dob: string;
  identity: string;
  address: string;
  class: string;
  teacher: string;
  status: string; // 'Mới đăng ký' | 'Đang học' | 'Chờ thi' | 'Đã thi' | 'Đậu' | 'Rớt'
  notes: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[]; // e.g. ["A. ...", "B. ..."]
  answer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  category: string; // 'Khái niệm và quy tắc' | 'Hệ thống biển báo' | 'Giải thế sa hình' | ...
  licenseClasses: string[]; // ['B1', 'B2', 'C', 'D']
  critical: boolean; // Câu hỏi điểm liệt
  image?: string; // Optional illustration URL
}

export interface News {
  id: string;
  title: string;
  category: string; // 'Thông báo' | 'Tuyển sinh' | 'Lịch thi' | 'Tài liệu'
  summary: string;
  content: string; // Markdown / rich-text string
  date: string;
  author: string;
  status: 'published' | 'draft';
  image: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string; // 'Lý thuyết 600 câu' | 'Biển báo giao thông' | 'Mẹo thi lý thuyết' | 'Tài liệu mô phỏng'
  fileUrl: string;
  description: string;
  downloads: number;
}

export interface AlbumItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string; // Image URL or YouTube Embed Link
  sortOrder: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: string; // 'Chưa xử lý' | 'Đã xử lý'
  notes: string;
}

export interface SystemLog {
  id: string;
  time: string;
  user: string;
  action: string;
}

export interface UserSession {
  username: string;
  role: string;
  fullName: string;
}

export interface UserAccount {
  username: string;
  fullName: string;
  role: string;
  email: string;
  status?: string;
}
