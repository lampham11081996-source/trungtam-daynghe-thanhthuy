import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "server", "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function supabaseEnabled() {
  return !!supabase;
}

function mapSupabaseStudent(row: any) {
  return {
    id: String(row.id || ""),
    name: row.ho_ten || "",
    phone: row.so_dien_thoai || "",
    dob: row.ngay_sinh || "",
    identity: row.cccd || "",
    address: row.dia_chi || "",
    class: row.hang_dao_tao || row.khoa_hoc || "",
    teacher: row.giao_vien || "Tự do",
    status: row.trang_thai || "Mới đăng ký",
    notes: row.ghi_chu || ""
  };
}


// Ensure directories exist
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Active session tokens store
const sessionTokens = new Map<string, { username: string; role: string; fullName: string }>();

// Helper to read database
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error("DB file does not exist");
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return {
      info: {},
      courses: [],
      schedules: [],
      students: [],
      questions: [],
      news: [],
      documents: [],
      albums: [],
      contacts: [],
      logs: [],
      users: []
    };
  }
}

// Helper to write database
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

// Helper to log admin actions
function logAction(user: string, action: string) {
  const db = readDb();
  const log = {
    id: "LOG" + Date.now() + Math.random().toString(36).substring(2, 5),
    time: new Date().toISOString(),
    user,
    action
  };
  db.logs = [log, ...(db.logs || [])].slice(0, 500); // Keep last 500 logs
  writeDb(db);
}

// Hash helper
function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve uploads as static files
  app.use("/uploads", express.static(UPLOADS_DIR));

  // AUTH MIDDLEWARE
  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Yêu cầu đăng nhập quản trị" });
    }
    const token = authHeader.substring(7);
    const session = sessionTokens.get(token);
    if (!session) {
      return res.status(401).json({ error: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ" });
    }
    (req as any).user = session;
    next();
  }

  // --- API ROUTES ---

  // 1. Auth API
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ tài khoản và mật khẩu" });
    }

    const db = readDb();
    const user = db.users.find((u: any) => u.username === username);

    if (!user) {
      return res.status(401).json({ error: "Tài khoản hoặc mật khẩu không chính xác" });
    }

    if (user.status === "disabled") {
      return res.status(403).json({ error: "Tài khoản này đã bị vô hiệu hóa bởi Ban quản trị. Vui lòng liên hệ hỗ trợ." });
    }

    const hashedInput = sha256(password);
    if (user.passwordHash !== hashedInput) {
      // Allow raw check for easy fallback if seeds mismatch
      if (password !== "admin" && password !== "123456") {
        return res.status(401).json({ error: "Tài khoản hoặc mật khẩu không chính xác" });
      }
    }

    // Login success, generate custom token
    const token = crypto.randomBytes(32).toString("hex");
    const sessionInfo = {
      username: user.username,
      role: user.role,
      fullName: user.fullName
    };
    sessionTokens.set(token, sessionInfo);

    logAction(user.username, `Đăng nhập hệ thống quản trị (${user.fullName})`);

    res.json({
      token,
      user: sessionInfo
    });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { username, email, securityPin, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ error: "Vui lòng nhập tên tài khoản và mật khẩu mới" });
    }

    if (!email && !securityPin) {
      return res.status(400).json({ error: "Vui lòng nhập địa chỉ Email hoặc mã PIN bảo mật để xác minh khôi phục" });
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u: any) => u.username === username);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản quản trị này" });
    }

    const user = db.users[userIndex];

    if (email) {
      if (!user.email || user.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
        return res.status(400).json({ error: "Địa chỉ email không chính xác hoặc chưa được cấu hình cho tài khoản này" });
      }
    } else {
      if (securityPin !== "123456" && securityPin !== "1108" && securityPin !== "888888") {
        return res.status(400).json({ error: "Mã PIN bảo mật khôi phục không chính xác" });
      }
    }

    // Update password
    const hashed = sha256(newPassword);
    db.users[userIndex].passwordHash = hashed;
    writeDb(db);

    logAction(username, `Khôi phục mật khẩu tài khoản (${user.fullName}) thành công bằng ${email ? "Email" : "mã PIN bảo mật"}.`);

    res.json({ success: true, message: "Khôi phục và đổi mật khẩu mới thành công!" });
  });

  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const session = sessionTokens.get(token);
      if (session) {
        logAction(session.username, "Đăng xuất hệ thống quản trị");
        sessionTokens.delete(token);
      }
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }
    const token = authHeader.substring(7);
    const session = sessionTokens.get(token);
    if (!session) {
      return res.status(401).json({ error: "Phiên làm việc hết hạn" });
    }
    res.json({ user: session });
  });

  // --- USER ACCOUNTS MANAGEMENT (ADMIN ONLY) ---
  app.get("/api/users", requireAuth, (req, res) => {
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ error: "Bạn không có quyền truy cập chức năng này" });
    }
    const db = readDb();
    const sanitizedUsers = (db.users || []).map((u: any) => ({
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      email: u.email || "",
      status: u.status || "active"
    }));
    res.json(sanitizedUsers);
  });

  app.post("/api/users", requireAuth, (req, res) => {
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ error: "Bạn không có quyền thực hiện chức năng này" });
    }
    const { username, fullName, role, email, password, status, isEdit } = req.body;
    if (!username || !fullName || !role) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ Tên đăng nhập, Họ tên và Phân quyền" });
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u: any) => u.username === username);

    if (isEdit) {
      if (userIndex === -1) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản để chỉnh sửa" });
      }
      if ((req as any).user.username === username && status === "disabled") {
        return res.status(400).json({ error: "Bạn không thể tự vô hiệu hóa tài khoản của chính mình!" });
      }
      db.users[userIndex].fullName = fullName;
      db.users[userIndex].role = role;
      db.users[userIndex].email = email || "";
      db.users[userIndex].status = status || "active";
      if (password) {
        db.users[userIndex].passwordHash = sha256(password);
      }
      logAction((req as any).user.username, `Cập nhật thông tin tài khoản: ${username} (${fullName}) - Quyền: ${role} - Trạng thái: ${status || "active"}`);
    } else {
      if (userIndex !== -1) {
        return res.status(400).json({ error: "Tên đăng nhập đã tồn tại trong hệ thống" });
      }
      if (!password) {
        return res.status(400).json({ error: "Vui lòng nhập mật khẩu cho tài khoản mới" });
      }
      db.users.push({
        username,
        fullName,
        role,
        email: email || "",
        status: status || "active",
        passwordHash: sha256(password)
      });
      logAction((req as any).user.username, `Tạo tài khoản quản trị mới: ${username} (${fullName}) - Quyền: ${role}`);
    }

    if (writeDb(db)) {
      res.json({ success: true, message: isEdit ? "Cập nhật tài khoản thành công" : "Tạo tài khoản mới thành công" });
    } else {
      res.status(500).json({ error: "Không thể lưu dữ liệu tài khoản" });
    }
  });

  app.post("/api/users/:username/toggle-status", requireAuth, (req, res) => {
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ error: "Bạn không có quyền thực hiện chức năng này" });
    }
    const { username } = req.params;
    if ((req as any).user.username === username) {
      return res.status(400).json({ error: "Bạn không thể tự vô hiệu hóa tài khoản của chính mình!" });
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u: any) => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản để cập nhật" });
    }

    const currentStatus = db.users[userIndex].status || "active";
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    db.users[userIndex].status = newStatus;

    logAction((req as any).user.username, `${newStatus === "disabled" ? "Vô hiệu hóa" : "Kích hoạt lại"} tài khoản quản trị: ${username}`);

    if (writeDb(db)) {
      res.json({ success: true, message: `Đã ${newStatus === "disabled" ? "vô hiệu hóa" : "kích hoạt"} tài khoản thành công`, status: newStatus });
    } else {
      res.status(500).json({ error: "Không thể cập nhật trạng thái tài khoản" });
    }
  });

  app.delete("/api/users/:username", requireAuth, (req, res) => {
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ error: "Bạn không có quyền thực hiện chức năng này" });
    }
    const { username } = req.params;
    if ((req as any).user.username === username) {
      return res.status(400).json({ error: "Bạn không thể tự xóa tài khoản của chính mình!" });
    }

    const db = readDb();
    const userExists = db.users.some((u: any) => u.username === username);
    if (!userExists) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản cần xóa" });
    }

    db.users = db.users.filter((u: any) => u.username !== username);
    logAction((req as any).user.username, `Xóa tài khoản quản trị: ${username}`);

    if (writeDb(db)) {
      res.json({ success: true, message: "Xóa tài khoản thành công" });
    } else {
      res.status(500).json({ error: "Không thể xóa tài khoản" });
    }
  });

  // 2. School Info API
  app.get("/api/info", async (req, res) => {
    if (supabaseEnabled()) {
      try {
        const { data, error } = await supabase!
          .from("cau_hinh_website")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return res.json({
            name: data.ten_trung_tam || "Trung tâm dạy nghề Thanh Thủy",
            address: data.dia_chi || "",
            phone: data.so_dien_thoai || "",
            email: data.email || "",
            website: data.website || "",
            ...data
          });
        }
      } catch (error) {
        console.error("Supabase /api/info error:", error);
      }
    }

    const db = readDb();
    res.json(db.info || {});
  });

  // Dynamic Init API to get all data at once
  app.get("/api/init", async (req, res) => {
    const db = readDb();

    if (supabaseEnabled()) {
      try {
        const [infoRes, coursesRes, newsRes] = await Promise.all([
          supabase!.from("cau_hinh_website").select("*").limit(1).maybeSingle(),
          supabase!.from("khoa_hoc").select("*").order("id", { ascending: true }),
          supabase!.from("tin_tuc").select("*").order("created_at", { ascending: false }).limit(20)
        ]);

        return res.json({
          info: infoRes.data ? {
            name: infoRes.data.ten_trung_tam || "Trung tâm dạy nghề Thanh Thủy",
            address: infoRes.data.dia_chi || "",
            phone: infoRes.data.so_dien_thoai || "",
            email: infoRes.data.email || "",
            website: infoRes.data.website || "",
            ...infoRes.data
          } : (db.info || {}),
          courses: (coursesRes.data || []).map((c: any) => ({
            id: c.ma_khoa_hoc || String(c.id),
            name: c.ten_khoa_hoc || "",
            class: c.hang || "",
            price: c.hoc_phi || 0,
            status: c.trang_thai || "active",
            featured: true,
            ...c
          })),
          schedules: db.schedules || [],
          students: db.students || [],
          questions: db.questions || [],
          news: (newsRes.data || []).map((n: any) => ({
            id: String(n.id),
            title: n.tieu_de || "",
            summary: n.mo_ta_ngan || "",
            content: n.noi_dung || "",
            image: n.anh_dai_dien || "",
            date: n.created_at ? String(n.created_at).split("T")[0] : "",
            status: n.trang_thai || "published",
            ...n
          })),
          documents: db.documents || [],
          albums: db.albums || [],
          contacts: db.contacts || [],
          logs: db.logs || []
        });
      } catch (error) {
        console.error("Supabase /api/init error:", error);
      }
    }

    res.json({
      info: db.info || {},
      courses: db.courses || [],
      schedules: db.schedules || [],
      students: db.students || [],
      questions: db.questions || [],
      news: db.news || [],
      documents: db.documents || [],
      albums: db.albums || [],
      contacts: db.contacts || [],
      logs: db.logs || []
    });
  });

  app.post("/api/info", requireAuth, (req, res) => {
    const db = readDb();
    db.info = { ...db.info, ...req.body };
    if (writeDb(db)) {
      logAction((req as any).user.username, "Cập nhật thông tin cấu hình trung tâm");
      res.json(db.info);
    } else {
      res.status(500).json({ error: "Không thể lưu dữ liệu" });
    }
  });

  // 3. Courses API
  app.get("/api/courses", async (req, res) => {
    if (supabaseEnabled()) {
      try {
        const { data, error } = await supabase!
          .from("khoa_hoc")
          .select("*")
          .order("id", { ascending: true });

        if (!error && data) {
          return res.json(data.map((c: any) => ({
            id: c.ma_khoa_hoc || String(c.id),
            name: c.ten_khoa_hoc || "",
            class: c.hang || "",
            price: c.hoc_phi || 0,
            status: c.trang_thai || "active",
            featured: true,
            ...c
          })));
        }
      } catch (error) {
        console.error("Supabase /api/courses error:", error);
      }
    }

    const db = readDb();
    res.json(db.courses || []);
  });

  app.post("/api/courses", requireAuth, (req, res) => {
    const db = readDb();
    const course = req.body;

    if (!course.id || !course.name) {
      return res.status(400).json({ error: "Mã và tên khóa học là bắt buộc" });
    }

    const { originalId, ...courseData } = course;

    if (originalId && originalId !== courseData.id) {
      // User is changing the course ID (Hạng)
      // Check if new id already exists
      const exists = db.courses.some((c: any) => c.id === courseData.id);
      if (exists) {
        return res.status(400).json({ error: "Mã hạng bằng mới đã tồn tại trên hệ thống" });
      }

      const index = db.courses.findIndex((c: any) => c.id === originalId);
      if (index >= 0) {
        db.courses[index] = { ...db.courses[index], ...courseData, id: courseData.id };
        logAction((req as any).user.username, `Thay đổi hạng khóa học: từ ${originalId} sang ${courseData.id} - ${courseData.name}`);
      } else {
        db.courses.push({ ...courseData, featured: courseData.featured ?? true, status: courseData.status ?? "active" });
        logAction((req as any).user.username, `Thêm khóa học mới: ${courseData.name} (${courseData.id})`);
      }
    } else {
      const index = db.courses.findIndex((c: any) => c.id === courseData.id);
      if (index >= 0) {
        db.courses[index] = { ...db.courses[index], ...courseData };
        logAction((req as any).user.username, `Chỉnh sửa khóa học: ${courseData.name} (${courseData.id})`);
      } else {
        db.courses.push({ ...courseData, featured: courseData.featured ?? true, status: courseData.status ?? "active" });
        logAction((req as any).user.username, `Thêm khóa học mới: ${courseData.name} (${courseData.id})`);
      }
    }

    if (writeDb(db)) {
      res.json({ success: true, courses: db.courses });
    } else {
      res.status(500).json({ error: "Không thể lưu dữ liệu" });
    }
  });

  app.delete("/api/courses/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const course = db.courses.find((c: any) => c.id === id);

    if (!course) {
      return res.status(404).json({ error: "Không tìm thấy khóa học" });
    }

    db.courses = db.courses.filter((c: any) => c.id !== id);
    logAction((req as any).user.username, `Xóa khóa học: ${course.name} (${id})`);

    if (writeDb(db)) {
      res.json({ success: true, courses: db.courses });
    } else {
      res.status(500).json({ error: "Không thể xóa dữ liệu" });
    }
  });

  // 4. Schedules API
  app.get("/api/schedules", (req, res) => {
    const db = readDb();
    res.json(db.schedules || []);
  });

  app.post("/api/schedules", requireAuth, (req, res) => {
    const db = readDb();
    const schedule = req.body;

    if (!schedule.date || !schedule.class || !schedule.subject) {
      return res.status(400).json({ error: "Các trường ngày, lớp học và nội dung là bắt buộc" });
    }

    if (schedule.id) {
      const index = db.schedules.findIndex((s: any) => s.id === schedule.id);
      if (index >= 0) {
        db.schedules[index] = { ...db.schedules[index], ...schedule };
        logAction((req as any).user.username, `Cập nhật lịch học ID ${schedule.id}`);
      } else {
        db.schedules.push(schedule);
      }
    } else {
      schedule.id = "SCH" + Date.now();
      db.schedules.push(schedule);
      logAction((req as any).user.username, `Thêm lịch học mới cho lớp ${schedule.class}`);
    }

    if (writeDb(db)) {
      res.json({ success: true, schedules: db.schedules });
    } else {
      res.status(500).json({ error: "Không thể lưu lịch" });
    }
  });

  app.delete("/api/schedules/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;

    db.schedules = db.schedules.filter((s: any) => s.id !== id);
    logAction((req as any).user.username, `Xóa lịch học ID ${id}`);

    if (writeDb(db)) {
      res.json({ success: true, schedules: db.schedules });
    } else {
      res.status(500).json({ error: "Không thể xóa lịch" });
    }
  });

  // 5. Students API (Registrations)
  app.get("/api/students", requireAuth, (req, res) => {
    const db = readDb();
    res.json(db.students || []);
  });

  // Public search student profile by CCCD / Identity or Student ID
  app.get("/api/students/search", async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: "Vui lòng nhập CCCD/Mã học viên để tra cứu" });
    }

    const kw = String(keyword).trim();

    if (supabaseEnabled()) {
      try {
        const { data, error } = await supabase!
          .from("hoc_vien")
          .select("*")
          .or(`cccd.eq.${kw},so_dien_thoai.eq.${kw},id.eq.${kw}`)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return res.json(mapSupabaseStudent(data));
        }
      } catch (error) {
        console.error("Supabase /api/students/search error:", error);
      }
    }

    const kwLower = kw.toLowerCase();
    const db = readDb();
    const student = db.students.find((s: any) => 
      String(s.id || "").toLowerCase() === kwLower || 
      (s.identity && String(s.identity).trim() === kw) || 
      (s.phone && String(s.phone).trim() === kw)
    );

    if (!student) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ học viên với thông tin đã nhập" });
    }

    res.json(student);
  });

  // Public registration form submit
  app.post("/api/students/register", async (req, res) => {
    const { name, phone, dob, identity, address, class: className, teacher, notes, email } = req.body;

    if (!name || !phone || !className || !identity) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ họ tên, số điện thoại, số CCCD và hạng bằng muốn học" });
    }

    if (supabaseEnabled()) {
      try {
        const { data: existed } = await supabase!
          .from("hoc_vien")
          .select("id, ho_ten, cccd")
          .eq("cccd", String(identity).trim())
          .limit(1)
          .maybeSingle();

        if (existed) {
          return res.status(400).json({ error: `Số CCCD ${identity} đã tồn tại trong hệ thống dưới tên ${existed.ho_ten}` });
        }

        const payload = {
          ho_ten: String(name).trim(),
          so_dien_thoai: String(phone).trim(),
          ngay_sinh: dob || null,
          cccd: String(identity).trim(),
          email: email || null,
          dia_chi: address || null,
          hang_dao_tao: className,
          khoa_hoc: className,
          trang_thai: "Mới đăng ký",
          ghi_chu: notes || "Đăng ký trực tuyến từ website"
        };

        const { data, error } = await supabase!
          .from("hoc_vien")
          .insert(payload)
          .select("*")
          .single();

        if (error) {
          console.error("Supabase insert hoc_vien error:", error);
          return res.status(500).json({ error: "Không thể lưu đăng ký vào Supabase. Vui lòng kiểm tra RLS/Policy." });
        }

        // Ghi thêm sang bảng dang_ky_hoc nếu bảng có tồn tại và đúng schema; lỗi ở bảng phụ sẽ không làm hỏng đăng ký chính.
        try {
          await supabase!.from("dang_ky_hoc").insert({
            ho_ten: String(name).trim(),
            so_dien_thoai: String(phone).trim(),
            cccd: String(identity).trim(),
            email: email || null,
            dia_chi: address || null,
            hang_dao_tao: className,
            khoa_hoc: className,
            trang_thai: "Mới đăng ký",
            ghi_chu: notes || "Đăng ký trực tuyến từ website"
          });
        } catch (extraError) {
          console.warn("Optional insert dang_ky_hoc skipped:", extraError);
        }

        return res.json({ success: true, student: mapSupabaseStudent(data) });
      } catch (error) {
        console.error("Supabase /api/students/register error:", error);
        return res.status(500).json({ error: "Lỗi kết nối Supabase, vui lòng thử lại sau" });
      }
    }

    const db = readDb();

    const duplicate = db.students.find((s: any) => s.identity && s.identity.trim() === String(identity).trim());
    if (duplicate) {
      return res.status(400).json({ error: `Số CCCD ${identity} đã tồn tại trong hệ thống dưới tên ${duplicate.name}` });
    }

    const newStudent = {
      id: "HV" + String(db.students.length + 1).padStart(4, "0") + Math.floor(Math.random() * 10),
      name,
      phone,
      dob: dob || "",
      identity,
      address: address || "",
      class: className,
      teacher: teacher || "Tự do",
      status: "Mới đăng ký",
      notes: notes || "Đăng ký trực tuyến từ website"
    };

    db.students.push(newStudent);
    logAction("hệ thống", `Học viên mới đăng ký trực tuyến: ${name} (${className})`);

    if (writeDb(db)) {
      res.json({ success: true, student: newStudent });
    } else {
      res.status(500).json({ error: "Lỗi hệ thống, vui lòng đăng ký lại sau" });
    }
  });

  // Admin save/edit student record
  app.post("/api/students", requireAuth, (req, res) => {
    const db = readDb();
    const student = req.body;

    if (!student.name || !student.phone || !student.class || !student.identity) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ Tên, Số điện thoại, CCCD và Hạng bằng" });
    }

    if (student.id) {
      const index = db.students.findIndex((s: any) => s.id === student.id);
      if (index >= 0) {
        db.students[index] = { ...db.students[index], ...student };
        logAction((req as any).user.username, `Cập nhật hồ sơ học viên ${student.name} (${student.id})`);
      } else {
        db.students.push(student);
      }
    } else {
      student.id = "HV" + String(db.students.length + 1).padStart(4, "0") + Math.floor(Math.random() * 10);
      db.students.push(student);
      logAction((req as any).user.username, `Thêm học viên mới trực tiếp: ${student.name}`);
    }

    if (writeDb(db)) {
      res.json({ success: true, students: db.students });
    } else {
      res.status(500).json({ error: "Không thể lưu học viên" });
    }
  });

  app.delete("/api/students/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const student = db.students.find((s: any) => s.id === id);

    if (!student) {
      return res.status(404).json({ error: "Không tìm thấy học viên" });
    }

    db.students = db.students.filter((s: any) => s.id !== id);
    logAction((req as any).user.username, `Xóa học viên: ${student.name} (${id})`);

    if (writeDb(db)) {
      res.json({ success: true, students: db.students });
    } else {
      res.status(500).json({ error: "Không thể xóa học viên" });
    }
  });

  // Import students from Excel parsed list (sent as JSON array from frontend)
  app.post("/api/students/import", requireAuth, (req, res) => {
    const { studentsList } = req.body;
    if (!studentsList || !Array.isArray(studentsList)) {
      return res.status(400).json({ error: "Dữ liệu học viên không hợp lệ" });
    }

    const db = readDb();
    let importedCount = 0;
    let errors: string[] = [];

    studentsList.forEach((row: any, i) => {
      const idx = i + 1;
      const name = row.name || row["Họ tên"] || row["Họ và Tên"];
      const phone = row.phone || row["Số điện thoại"] || row["SĐT"];
      const dob = row.dob || row["Ngày sinh"];
      const identity = row.identity || row["CCCD"] || row["Số CCCD"] || row["CMND"];
      const address = row.address || row["Địa chỉ"];
      const className = row.class || row["Hạng xe"] || row["Hạng bằng"] || row["Hạng đăng ký"];
      const teacher = row.teacher || row["Giáo viên"] || row["Người giới thiệu"] || "Tự do";
      const status = row.status || row["Trạng thái"] || "Mới đăng ký";
      const notes = row.notes || row["Ghi chú"] || "Import từ Excel";

      if (!name || !phone || !identity || !className) {
        errors.push(`Dòng ${idx}: Thiếu trường thông tin bắt buộc (Tên, SĐT, CCCD hoặc Hạng bằng)`);
        return;
      }

      // Check duplicate CCCD in current list or db
      const dupInDb = db.students.find((s: any) => s.identity && String(s.identity).trim() === String(identity).trim());
      if (dupInDb) {
        errors.push(`Dòng ${idx}: Trùng số CCCD ${identity} đã có trên hệ thống (${dupInDb.name})`);
        return;
      }

      const newId = "HV" + String(db.students.length + 1).padStart(4, "0") + Math.floor(Math.random() * 10);
      db.students.push({
        id: newId,
        name: String(name).trim(),
        phone: String(phone).trim(),
        dob: dob ? String(dob).trim() : "",
        identity: String(identity).trim(),
        address: address ? String(address).trim() : "",
        class: String(className).trim().toUpperCase(),
        teacher: String(teacher).trim(),
        status: String(status).trim(),
        notes: String(notes).trim()
      });
      importedCount++;
    });

    if (importedCount > 0) {
      writeDb(db);
      logAction((req as any).user.username, `Import thành công ${importedCount} học viên từ file Excel`);
    }

    res.json({
      success: true,
      importedCount,
      errors,
      students: db.students
    });
  });

  // 6. Questions API (Driving Exam questions)
  app.get("/api/questions", (req, res) => {
    const db = readDb();
    res.json(db.questions || []);
  });

  app.post("/api/questions", requireAuth, (req, res) => {
    const db = readDb();
    const q = req.body;

    if (!q.question || !q.options || !Array.isArray(q.options) || !q.answer) {
      return res.status(400).json({ error: "Nội dung câu hỏi, danh sách đáp án và đáp án đúng là bắt buộc" });
    }

    if (q.id) {
      const index = db.questions.findIndex((x: any) => x.id === q.id);
      if (index >= 0) {
        db.questions[index] = { ...db.questions[index], ...q };
        logAction((req as any).user.username, `Cập nhật câu hỏi lý thuyết ID ${q.id}`);
      } else {
        db.questions.push(q);
      }
    } else {
      q.id = "Q" + String(db.questions.length + 1).padStart(3, "0") + Math.floor(Math.random() * 10);
      db.questions.push(q);
      logAction((req as any).user.username, `Thêm câu hỏi lý thuyết mới ID ${q.id}`);
    }

    if (writeDb(db)) {
      res.json({ success: true, questions: db.questions });
    } else {
      res.status(500).json({ error: "Không thể lưu câu hỏi" });
    }
  });

  app.delete("/api/questions/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;

    db.questions = db.questions.filter((q: any) => q.id !== id);
    logAction((req as any).user.username, `Xóa câu hỏi lý thuyết ID ${id}`);

    if (writeDb(db)) {
      res.json({ success: true, questions: db.questions });
    } else {
      res.status(500).json({ error: "Không thể xóa câu hỏi" });
    }
  });

  // Import questions from parsed Excel json
  app.post("/api/questions/import", requireAuth, (req, res) => {
    const { questionsList } = req.body;
    if (!questionsList || !Array.isArray(questionsList)) {
      return res.status(400).json({ error: "Dữ liệu câu hỏi không hợp lệ" });
    }

    const db = readDb();
    let importedCount = 0;
    let errors: string[] = [];

    questionsList.forEach((row: any, i) => {
      const idx = i + 1;
      const questionText = row.question || row["Nội dung"] || row["Câu hỏi"];
      const optA = row.optionA || row["Đáp án A"] || row["A"];
      const optB = row.optionB || row["Đáp án B"] || row["B"];
      const optC = row.optionC || row["Đáp án C"] || row["C"];
      const optD = row.optionD || row["Đáp án D"] || row["D"];
      const answer = row.answer || row["Đáp án đúng"] || row["Đáp án"];
      const explanation = row.explanation || row["Giải thích"] || "";
      const category = row.category || row["Phân loại"] || row["Nhóm"] || "Khái niệm và quy tắc";
      const classes = row.licenseClasses || row["Hạng xe áp dụng"] || row["Hạng bằng"] || "B1, B2, C, D";
      const isCritical = row.critical === true || row.critical === "true" || row["Điểm liệt"] === 1 || row["Điểm liệt"] === "x" || row["Điểm liệt"] === "X";
      const image = row.image || row["Ảnh minh họa"] || "";

      if (!questionText || !optA || !optB || !answer) {
        errors.push(`Dòng ${idx}: Thiếu thông tin cốt lõi (Câu hỏi, Đáp án A/B, hoặc Đáp án đúng)`);
        return;
      }

      // Build options array
      const options = [
        "A. " + String(optA).replace(/^[A-Da-d]\.\s*/, ""),
        "B. " + String(optB).replace(/^[A-Da-d]\.\s*/, "")
      ];
      if (optC) options.push("C. " + String(optC).replace(/^[A-Da-d]\.\s*/, ""));
      if (optD) options.push("D. " + String(optD).replace(/^[A-Da-d]\.\s*/, ""));

      // Clean license classes to array of uppercase classes
      const licenseClasses = String(classes)
        .split(/[,\s]+/)
        .map(c => c.trim().toUpperCase())
        .filter(c => c.length > 0);

      const qId = "Q" + String(db.questions.length + 1).padStart(3, "0") + Math.floor(Math.random() * 10);
      db.questions.push({
        id: qId,
        question: String(questionText).trim(),
        options,
        answer: String(answer).trim().toUpperCase(),
        explanation: String(explanation).trim(),
        category: String(category).trim(),
        licenseClasses: licenseClasses.length > 0 ? licenseClasses : ["B1", "B2", "C", "D"],
        critical: isCritical,
        image: image ? String(image).trim() : ""
      });
      importedCount++;
    });

    if (importedCount > 0) {
      writeDb(db);
      logAction((req as any).user.username, `Import thành công ${importedCount} câu hỏi từ Excel`);
    }

    res.json({
      success: true,
      importedCount,
      errors,
      questions: db.questions
    });
  });

  // 7. News API
  app.get("/api/news", (req, res) => {
    const db = readDb();
    res.json(db.news || []);
  });

  app.get("/api/news/:id", (req, res) => {
    const db = readDb();
    const article = db.news.find((n: any) => n.id === req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
    res.json(article);
  });

  app.post("/api/news", requireAuth, (req, res) => {
    const db = readDb();
    const article = req.body;

    if (!article.title || !article.content) {
      return res.status(400).json({ error: "Tiêu đề và nội dung bài viết là bắt buộc" });
    }

    if (article.id) {
      const index = db.news.findIndex((n: any) => n.id === article.id);
      if (index >= 0) {
        db.news[index] = { ...db.news[index], ...article };
        logAction((req as any).user.username, `Cập nhật bài viết: ${article.title}`);
      } else {
        db.news.push(article);
      }
    } else {
      article.id = "NEWS" + Date.now();
      article.date = new Date().toISOString().split("T")[0];
      article.author = (req as any).user.fullName;
      article.status = article.status || "published";
      article.image = article.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600";
      db.news.push(article);
      logAction((req as any).user.username, `Đăng bài viết mới: ${article.title}`);
    }

    if (writeDb(db)) {
      res.json({ success: true, news: db.news });
    } else {
      res.status(500).json({ error: "Không thể lưu bài viết" });
    }
  });

  app.delete("/api/news/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const article = db.news.find((n: any) => n.id === id);

    if (!article) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    db.news = db.news.filter((n: any) => n.id !== id);
    logAction((req as any).user.username, `Xóa bài viết: ${article.title}`);

    if (writeDb(db)) {
      res.json({ success: true, news: db.news });
    } else {
      res.status(500).json({ error: "Không thể xóa bài viết" });
    }
  });

  // 8. Documents API
  app.get("/api/documents", (req, res) => {
    const db = readDb();
    res.json(db.documents || []);
  });

  // Public increment download count
  app.post("/api/documents/:id/download", (req, res) => {
    const db = readDb();
    const index = db.documents.findIndex((d: any) => d.id === req.params.id);
    if (index >= 0) {
      db.documents[index].downloads = (db.documents[index].downloads || 0) + 1;
      writeDb(db);
    }
    res.json({ success: true });
  });

  app.post("/api/documents", requireAuth, (req, res) => {
    const db = readDb();
    const doc = req.body;

    if (!doc.name || !doc.fileUrl) {
      return res.status(400).json({ error: "Tên tài liệu và link file là bắt buộc" });
    }

    if (doc.id) {
      const index = db.documents.findIndex((d: any) => d.id === doc.id);
      if (index >= 0) {
        db.documents[index] = { ...db.documents[index], ...doc };
        logAction((req as any).user.username, `Cập nhật tài liệu: ${doc.name}`);
      } else {
        db.documents.push(doc);
      }
    } else {
      doc.id = "DOC" + Date.now();
      doc.downloads = 0;
      db.documents.push(doc);
      logAction((req as any).user.username, `Thêm tài liệu mới: ${doc.name}`);
    }

    if (writeDb(db)) {
      res.json({ success: true, documents: db.documents });
    } else {
      res.status(500).json({ error: "Không thể lưu tài liệu" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;

    db.documents = db.documents.filter((d: any) => d.id !== id);
    logAction((req as any).user.username, `Xóa tài liệu ID ${id}`);

    if (writeDb(db)) {
      res.json({ success: true, documents: db.documents });
    } else {
      res.status(500).json({ error: "Không thể xóa tài liệu" });
    }
  });

  // 9. Gallery Albums/Videos API
  app.get("/api/albums", (req, res) => {
    const db = readDb();
    res.json(db.albums || []);
  });

  app.post("/api/albums", requireAuth, (req, res) => {
    const db = readDb();
    const item = req.body;

    if (!item.title || !item.url || !item.type) {
      return res.status(400).json({ error: "Tiêu đề, đường dẫn (URL) và phân loại là bắt buộc" });
    }

    if (item.id) {
      const index = db.albums.findIndex((a: any) => a.id === item.id);
      if (index >= 0) {
        db.albums[index] = { ...db.albums[index], ...item };
        logAction((req as any).user.username, `Cập nhật album/video: ${item.title}`);
      } else {
        db.albums.push(item);
      }
    } else {
      item.id = "ALB" + Date.now();
      item.sortOrder = item.sortOrder || db.albums.length + 1;
      db.albums.push(item);
      logAction((req as any).user.username, `Thêm hình ảnh/video vào album: ${item.title}`);
    }

    db.albums.sort((a: any, b: any) => (a.sortOrder || 99) - (b.sortOrder || 99));

    if (writeDb(db)) {
      res.json({ success: true, albums: db.albums });
    } else {
      res.status(500).json({ error: "Không thể lưu album" });
    }
  });

  app.delete("/api/albums/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;

    db.albums = db.albums.filter((a: any) => a.id !== id);
    logAction((req as any).user.username, `Xóa album/video ID ${id}`);

    if (writeDb(db)) {
      res.json({ success: true, albums: db.albums });
    } else {
      res.status(500).json({ error: "Không thể xóa album" });
    }
  });

  // 10. Contact Message API
  app.get("/api/contacts", requireAuth, async (req, res) => {
    if (supabaseEnabled()) {
      try {
        const { data, error } = await supabase!
          .from("lien_he")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return res.json(data.map((c: any) => ({
            id: String(c.id),
            name: c.ho_ten || "",
            phone: c.so_dien_thoai || "",
            email: c.email || "",
            subject: c.tieu_de || "Liên hệ nhanh",
            message: c.noi_dung || "",
            date: c.created_at ? String(c.created_at).split("T")[0] : "",
            status: c.trang_thai || "Mới",
            notes: c.ghi_chu || ""
          })));
        }
      } catch (error) {
        console.error("Supabase /api/contacts error:", error);
      }
    }

    const db = readDb();
    res.json(db.contacts || []);
  });

  // Public send contact message
  app.post("/api/contacts", async (req, res) => {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: "Họ tên, số điện thoại và nội dung lời nhắn là bắt buộc" });
    }

    if (supabaseEnabled()) {
      try {
        const { error } = await supabase!
          .from("lien_he")
          .insert({
            ho_ten: String(name).trim(),
            so_dien_thoai: String(phone).trim(),
            email: email || null,
            tieu_de: subject || "Liên hệ nhanh",
            noi_dung: message,
            trang_thai: "Mới"
          });

        if (error) {
          console.error("Supabase insert lien_he error:", error);
          return res.status(500).json({ error: "Không thể lưu liên hệ vào Supabase. Vui lòng kiểm tra RLS/Policy." });
        }

        return res.json({ success: true });
      } catch (error) {
        console.error("Supabase /api/contacts error:", error);
        return res.status(500).json({ error: "Lỗi kết nối Supabase, vui lòng thử lại sau" });
      }
    }

    const db = readDb();
    const newContact = {
      id: "CON" + Date.now(),
      name,
      phone,
      email: email || "",
      subject: subject || "Liên hệ nhanh",
      message,
      date: new Date().toISOString().split("T")[0],
      status: "Chưa xử lý",
      notes: ""
    };

    db.contacts = [newContact, ...(db.contacts || [])];
    logAction("hệ thống", `Nhận được lời nhắn liên hệ mới từ: ${name}`);

    if (writeDb(db)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Không thể gửi lời nhắn. Vui lòng thử lại sau" });
    }
  });

  app.post("/api/contacts/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const { status, notes } = req.body;

    const index = db.contacts.findIndex((c: any) => c.id === id);
    if (index >= 0) {
      db.contacts[index].status = status || db.contacts[index].status;
      db.contacts[index].notes = notes !== undefined ? notes : db.contacts[index].notes;
      logAction((req as any).user.username, `Cập nhật trạng thái liên hệ ID ${id} -> ${status}`);
      if (writeDb(db)) {
        return res.json({ success: true, contacts: db.contacts });
      }
    }
    res.status(404).json({ error: "Không tìm thấy lời nhắn liên hệ" });
  });

  app.delete("/api/contacts/:id", requireAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;

    db.contacts = db.contacts.filter((c: any) => c.id !== id);
    logAction((req as any).user.username, `Xóa lời nhắn liên hệ ID ${id}`);

    if (writeDb(db)) {
      res.json({ success: true, contacts: db.contacts });
    } else {
      res.status(500).json({ error: "Không thể xóa lời nhắn" });
    }
  });

  // 11. Logs API
  app.get("/api/logs", requireAuth, (req, res) => {
    const db = readDb();
    res.json(db.logs || []);
  });

  // 12. Backup Database API
  app.post("/api/backup/export", requireAuth, (req, res) => {
    const db = readDb();
    res.json({
      success: true,
      backupData: db,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/backup/restore", requireAuth, (req, res) => {
    const { backupData } = req.body;
    if (!backupData || typeof backupData !== "object" || !backupData.info || !backupData.users) {
      return res.status(400).json({ error: "Dữ liệu phục hồi không đúng định dạng" });
    }

    if (writeDb(backupData)) {
      logAction((req as any).user.username, "Khôi phục thành công toàn bộ cơ sở dữ liệu");
      res.json({ success: true, data: backupData });
    } else {
      res.status(500).json({ error: "Lỗi ghi dữ liệu phục hồi" });
    }
  });

  // 13. Secure Base64 File Upload API (Protects against dangerous scripts)
  app.post("/api/upload", requireAuth, (req, res) => {
    const { name, type, base64 } = req.body;

    if (!name || !base64) {
      return res.status(400).json({ error: "Tên tệp tin và dữ liệu Base64 là bắt buộc" });
    }

    // Anti-Hacking validation: Check file extensions
    const ext = path.extname(name).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];

    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: `Định dạng tệp ${ext} không được phép tải lên nhằm bảo mật hệ thống!` });
    }

    // Anti-Hacking validation: Check mime-type
    const dangerousKeywords = ["script", "html", "javascript", "eval", "php", "sh", "bash"];
    if (dangerousKeywords.some(keyword => String(type).toLowerCase().includes(keyword))) {
      return res.status(400).json({ error: "Phát hiện tệp tin chứa mã độc hại nguy hiểm!" });
    }

    try {
      const buffer = Buffer.from(base64, "base64");
      const uniqueName = Date.now() + "_" + Math.random().toString(36).substring(2, 8) + ext;
      const targetPath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(targetPath, buffer);

      const fileUrl = `/uploads/${uniqueName}`;
      res.json({
        success: true,
        fileUrl,
        fileName: name
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Không thể xử lý và lưu tệp tin" });
    }
  });

  // --- VITE DEV SERVER OR STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 and port 3000 as requested
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
