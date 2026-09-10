# JSD13 Week 11: Mono-Repo Express Web App

เอกสารสรุปโครงสร้างโปรเจกต์และการทำงานของ API ระบบ Authentication (Register, Login, Logout, Auth Middleware) ด้วย bcrypt, jsonwebtoken, cookies และจัดเก็บข้อมูลลง MongoDB รวมถึง Supabase (PostgreSQL)

---

## 1. โครงสร้างโฟลเดอร์ (Folder Structure)

โปรเจกต์นี้ใช้โครงสร้างแบบ Mono-repo:

```text
mono-repo/
├── client/                         # [Frontend] พื้นที่สำหรับฝั่ง Client
│
├── server/                         # [Backend] Express.js REST API Server
│   ├── .env                        # Environment variables (PORT, MONGODB_URI, SUPABASE_URL, JWT_SECRET)
│   ├── .gitignore                  # กำหนดไฟล์ที่ไม่ต้องการ push ขึ้น git
│   ├── package.json                # Dependencies และ scripts
│   ├── package-lock.json
│   │
│   ├── src/
│   │   ├── server.js               # Entry point (CORS, Cookie-Parser, Error Handling)
│   │   │
│   │   ├── config/                 # การตั้งค่าการเชื่อมต่อฐานข้อมูล
│   │   │   ├── db.js               # เชื่อมต่อ MongoDB Atlas (Mongoose)
│   │   │   └── supabase.js         # เชื่อมต่อ Supabase Client
│   │   │
│   │   ├── fakeDB/                 # ข้อมูลจำลองสำหรับทดสอบ
│   │   │   └── fakeUsers.js
│   │   │
│   │   ├── middlewares/            # Custom Middleware
│   │   │   └── authUser.js         # ตรวจสอบ JWT accessToken จาก Cookie
│   │   │
│   │   ├── models/                 # Mongoose Schema & Model
│   │   │   └── user.model.js
│   │   │
│   │   ├── routes/                 # Modular Routing
│   │   │   ├── index.js            # Root router (/api/v1, /api/v2)
│   │   │   ├── v1/                 # API v1 (In-Memory Array)
│   │   │   │   ├── index.js
│   │   │   │   └── users.routes.js
│   │   │   └── v2/                 # API v2 (Database + Auth)
│   │   │       ├── index.js
│   │   │       ├── users.routes.js          # MongoDB CRUD + Register + Login + Logout + Auth
│   │   │       └── users.supabase.routes.js # Supabase PostgreSQL CRUD
│   │   │
│   │   └── utils/                  # Helper Utilities
│   │       └── generateSecretKey.js # สคริปต์สุ่มคีย์ 64-byte สำหรับ JWT_SECRET
│   │
│   ├── users-api-test.rest         # ทดสอบ API v1
│   ├── users-api-test-v2.rest      # ทดสอบ API v2 (MongoDB CRUD + Register)
│   ├── users-api-test-v2-auth.rest # ทดสอบ API v2 (Login, Logout, Check Auth)
│   └── users-api-test-v2-pg.rest   # ทดสอบ API v2 (Supabase)
│
└── README.md
```

---

## 2. การทำงานของระบบ Authentication (JWT & Cookies)

### 2.1 Password Hashing ด้วย bcrypt
ก่อนบันทึกรหัสผ่านลงฐานข้อมูล ต้องแปลงรหัสผ่านเป็น Hash เสมอ:
```javascript
import bcrypt from "bcrypt";

// hash password helper
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
```

### 2.2 JWT Token & HTTP-Only Cookie
เมื่อ Login สำเร็จ ระบบจะสร้าง JWT Token และส่งกลับไปในรูปแบบ HTTP-Only Cookie เพื่อป้องกันการโจมตีแบบ XSS:
```javascript
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: "1h",
});

res.cookie("accessToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 1000,
});
```

### 2.3 authUser Middleware
ใช้ดักจับ Request ที่ต้องการตรวจสอบตัวตน โดยอ่าน Token จาก `req.cookies.accessToken`:
```javascript
export const authUser = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied, No Token" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user: { _id: decodedToken.userId } };
    next();
  } catch (err) {
    next(err);
  }
};
```

---

## 3. สรุป API Endpoints

| Method | Endpoint | รายละเอียด | Auth Required | Database |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | หน้าต้อนรับ Matrix Canvas | No | Express |
| **GET** | `/api/v1/users` | ดึงข้อมูลผู้ใช้ทั้งหมด | No | In-Memory |
| **POST** | `/api/v1/users` | สร้างผู้ใช้ใหม่ | No | In-Memory |
| **PUT** | `/api/v1/users/:id` | แก้ไขข้อมูลผู้ใช้ | No | In-Memory |
| **DELETE** | `/api/v1/users/:id` | ลบผู้ใช้ | No | In-Memory |
| **POST** | `/api/v2/users/register` | สมัครสมาชิก (Hash รหัสผ่าน) | No | MongoDB |
| **POST** | `/api/v2/users/login` | เข้าสู่ระบบ (รับ accessToken cookie) | No | MongoDB |
| **POST** | `/api/v2/users/logout` | ออกจากระบบ (ล้าง cookie) | No | Express |
| **GET** | `/api/v2/users/auth` | ตรวจสอบสถานะ Token ผู้ใช้ | Yes (Cookie) | MongoDB |
| **GET** | `/api/v2/users` | ดึงข้อมูลผู้ใช้ทั้งหมด | No | MongoDB |
| **POST** | `/api/v2/users` | สร้างผู้ใช้ (Hash รหัสผ่าน) | No | MongoDB |
| **PUT** | `/api/v2/users/:id` | แก้ไขข้อมูลผู้ใช้ | No | MongoDB |
| **DELETE** | `/api/v2/users/:id` | ลบผู้ใช้ตาม ID | No | MongoDB |
| **GET** | `/api/v2/users/pg` | ดึงข้อมูลผู้ใช้ทั้งหมด | No | Supabase |
| **POST** | `/api/v2/users/pg` | สร้างผู้ใช้ใหม่ | No | Supabase |
| **PUT** | `/api/v2/users/pg/:id` | แก้ไขข้อมูลผู้ใช้ | No | Supabase |
| **DELETE** | `/api/v2/users/pg/:id` | ลบผู้ใช้ | No | Supabase |

---

## 4. การทดสอบระบบด้วย REST Client

สามารถเปิดไฟล์ `server/users-api-test-v2-auth.rest` เพื่อทดสอบ:
1. `POST /api/v2/users/register` - สมัครสมาชิก
2. `POST /api/v2/users/login` - รับ Cookie
3. `GET /api/v2/users/auth` - ตรวจสอบว่ายืนยันตัวตนสำเร็จ
4. `POST /api/v2/users/logout` - เคลียร์ Cookie
