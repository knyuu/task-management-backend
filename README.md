# Heimer Task Management Backend

<p align="center">
  <strong>Multi-tenant Task Management & Collaboration Platform — Backend API</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/express-4.x-blue?style=flat-square&logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/mongodb-3.x-green?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/redis-2.x-red?style=flat-square&logo=redis" alt="Redis">
  <img src="https://img.shields.io/badge/socket.io-2.x-black?style=flat-square&logo=socket.io" alt="Socket.io">
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/CI%2FCD-CircleCI-343434?style=flat-square&logo=circleci" alt="CircleCI">
  <img src="https://img.shields.io/badge/version-1.0.1-orange?style=flat-square" alt="Version">
</p>

---

## Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Biến môi trường](#-biến-môi-trường)
- [API Endpoints](#-api-endpoints)
- [Docker](#-docker)
- [CI/CD](#-cicd)

---

## Giới thiệu

**Heimer Task Management Backend** là hệ thống backend cho nền tảng quản lý công việc và cộng tác doanh nghiệp. Hệ thống được xây dựng theo kiến trúc **Multi-tenant**, cho phép nhiều tổ chức/khách hàng hoạt động trên cùng một hạ tầng với dữ liệu hoàn toàn cách ly.

Hệ thống được triển khai trên **Google Kubernetes Engine (GKE)** thông qua **CircleCI** pipeline, đảm bảo quy trình CI/CD tự động hóa hoàn toàn.

---

## Tính năng chính

### Quản lý Công việc & Dự án
- Tạo, phân công, theo dõi tiến độ và quản lý deadline
- Quản lý theo hệ thống phân cấp: **Space → Project → Task**
- Hỗ trợ bình luận (comment) trong task
- Dashboard tổng quan và báo cáo
- My Tasks — quản lý công việc cá nhân
- Lịch (Calendar) theo dõi timeline

### Cộng tác Thời gian thực
- Tích hợp **Socket.io** cho thông báo và cập nhật tức thì
- Hệ thống kênh trò chuyện (Channel) nội bộ
- Chuông thông báo hệ thống (Ring Bell)

### Quản lý Tài liệu
- Tích hợp bộ công cụ **Office 365**
- Xử lý PDF: ký số (Digital Signature), trích xuất dữ liệu
- Tạo tài liệu từ template (DOCX Templater)
- Xuất dữ liệu Excel (XLSX)
- OCR qua **Tesseract.js**

### Tích hợp AI
- **Google Gemini** — AI tổng hợp và phân tích
- **OpenAI** — Hỗ trợ xử lý ngôn ngữ tự nhiên
- **Google Document AI** — Trích xuất dữ liệu từ tài liệu
- **Google Vision API** — Nhận dạng hình ảnh

### Bảo mật
- Xác thực **JWT** (JSON Web Token)
- Đăng nhập qua **Passport** (Facebook, Google)
- **Firebase Authentication**
- Xác thực hai yếu tố **2FA** (Speakeasy/TOTP)
- **Helmet** — Bảo vệ HTTP headers
- **CORS** — Kiểm soát truy cập cross-origin
- **Rate Limiting** — Giới hạn request theo IP

### Tìm kiếm & Hiệu suất
- **Elasticsearch** — Tìm kiếm toàn văn bản (full-text search) với fallback MongoDB
- **Redis** — Caching và quản lý session
- **Bull Queue** — Xử lý tác vụ nền (background jobs)

### Multi-tenancy
- Quản lý nhiều tổ chức trên cùng hệ thống
- Phân quyền theo module (`office`, `management`)
- Hệ thống quy tắc và vai trò (Rules & Roles)
- Đa ngôn ngữ (Localization)

---

## Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Apps                           │
│              (Web / Mobile / Third-party)                     │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼───────────────────────────────────────┐
│                    Express.js Server                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Helmet     │  │    CORS      │  │   Rate Limiter       │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Authentication Middleware                   │ │
│  │         (JWT / Passport / Firebase Auth / 2FA)           │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               Multi-Tenant Middleware                   │ │
│  │              (Permission & Module Check)                │ │
│  └─────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                      Router Layer                            │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │   /office/*           │  │   /management/*              │  │
│  │  ├── space            │  │  ├── user                    │  │
│  │  ├── project          │  │  ├── admin                   │  │
│  │  ├── task             │  │  ├── setup                   │  │
│  │  ├── dashboard        │  │  ├── system                  │  │
│  │  ├── mytasks          │  │  ├── localization            │  │
│  │  ├── calendar         │  │  ├── rule                    │  │
│  │  ├── channel          │  │  ├── setting                 │  │
│  │  └── document         │  │  └── ringbell_item           │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│               Controller → Service → MongoDB                 │
├──────────────────────────────────────────────────────────────┤
│                    Shared Providers                           │
│  ┌────────┐ ┌───────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐  │
│  │MongoDB │ │ Redis │ │ Socket.io│ │  Bull   │ │Firebase │  │
│  └────────┘ └───────┘ └──────────┘ └─────────┘ └─────────┘  │
│  ┌────────┐ ┌───────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐  │
│  │  MinIO │ │ Email │ │Elastic   │ │  AI     │ │  OCR    │  │
│  └────────┘ └───────┘ └──────────┘ └─────────┘ └─────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Công nghệ sử dụng

| Thành phần | Công nghệ | Mô tả |
|---|---|---|
| **Runtime** | Node.js 18 | JavaScript runtime |
| **Framework** | Express.js 4.x | Web framework |
| **Database (chính)** | MongoDB | NoSQL — lưu trữ dữ liệu chính |
| **Cache / Queue** | Redis | Caching, session, Socket.io adapter |
| **Job Queue** | Bull | Xử lý tác vụ nền |
| **Real-time** | Socket.io 2.x | WebSocket cho thông báo tức thì |
| **Search** | Elasticsearch 8.x | Full-text search (tùy chọn) |
| **Object Storage** | MinIO | Lưu trữ file (S3-compatible) |
| **Auth** | JWT, Passport, Firebase | Xác thực & phân quyền |
| **AI** | Gemini, OpenAI, DocumentAI | Tích hợp AI |
| **Email** | Nodemailer | Gửi email |
| **Template** | Pug | Server-side rendering |
| **Logging** | Winston, Morgan | Ghi log hệ thống |
| **Validation** | Joi | Kiểm tra dữ liệu đầu vào |
| **Container** | Docker (Alpine) | Containerization |
| **CI/CD** | CircleCI | Tự động build & deploy |
| **Cloud** | GKE (Google Kubernetes Engine) | Triển khai production |

---

## Cấu trúc thư mục

```
task-management-backend/
├── .circleci/
│   └── config.yml               # CircleCI CI/CD pipeline
├── app/
│   ├── basic/                   # Module cơ bản
│   ├── management/              # Quản trị hệ thống
│   │   ├── admin/               #   Quản lý admin
│   │   ├── user/                #   Quản lý người dùng
│   │   ├── rule/                #   Quản lý quy tắc & phân quyền
│   │   ├── localization/        #   Đa ngôn ngữ
│   │   ├── setting/             #   Cài đặt hệ thống
│   │   ├── services/            #   Setup & System services
│   │   ├── ringbell_item/       #   Hệ thống thông báo
│   │   ├── routerProvider.js    #   Đăng ký routes /management/*
│   │   └── socket.concern.js    #   Socket events
│   └── office/                  # Nghiệp vụ văn phòng
│       ├── space/               #   Quản lý không gian làm việc
│       ├── project/             #   Quản lý dự án
│       ├── task/                #   Quản lý công việc
│       ├── dashboard/           #   Bảng tổng quan
│       ├── mytasks/             #   Công việc cá nhân
│       ├── calendar/            #   Lịch & timeline
│       ├── channel/             #   Kênh trò chuyện
│       ├── document/            #   Quản lý tài liệu
│       └── routerProvider.js    #   Đăng ký routes /office/*
├── shared/                      # Providers & Modules dùng chung
│   ├── authentication/          #   JWT authentication
│   ├── middleware/               #   Express middlewares
│   ├── permission/              #   Kiểm tra phân quyền
│   ├── multi_tenant/            #   Multi-tenancy provider
│   ├── mongodb/                 #   MongoDB connection & helpers
│   ├── redis/                   #   Redis connection
│   ├── elasticsearch/           #   Elasticsearch provider
│   ├── socket/                  #   Socket.io provider
│   ├── queu/                    #   Bull queue provider
│   ├── firebase-auth/           #   Firebase authentication
│   ├── google-auth/             #   Google OAuth
│   ├── passport/                #   Passport strategies
│   ├── email/                   #   Email service (Nodemailer)
│   ├── file/                    #   File management
│   ├── store/                   #   MinIO object storage
│   ├── digital_signature/       #   Ký số PDF
│   ├── docx/ & docxtemplater/   #   Tạo tài liệu DOCX
│   ├── openai/                  #   OpenAI integration
│   ├── vision_api/              #   Google Vision API
│   ├── cronjob/                 #   Scheduled tasks
│   ├── job/                     #   Background jobs
│   ├── localization/            #   i18n provider
│   ├── validation/              #   Request validation (Joi)
│   ├── controller/              #   Base controller
│   ├── router/                  #   Base router helpers
│   ├── pagination/              #   Phân trang
│   ├── functions/               #   Utility functions
│   ├── log_nohierarchy/         #   Logging (Winston)
│   ├── error/                   #   Error handling
│   ├── init.js                  #   Khởi tạo DB, Redis, Firebase
│   └── ...
├── utils/                       # Tiện ích hệ thống
│   ├── setting.js               #   Cấu hình ứng dụng
│   ├── constant.js              #   Hằng số hệ thống
│   ├── taskFilterUtil.js        #   Bộ lọc task nâng cao
│   ├── workflowUtil.js          #   Xử lý workflow
│   ├── templateUtil.js          #   Xử lý template
│   └── ...
├── views/                       # Pug templates (trang lỗi, email)
├── Dockerfile                   # Docker image (Node 18 Alpine)
├── .dockerignore
├── env.example                  # Mẫu biến môi trường
├── server.js                    # Entry point — khởi tạo server
├── root.js
└── package.json
```

**Mỗi module trong `app/` tuân theo pattern:**

```
module/
├── router.js         # Định nghĩa routes & middlewares
├── controller.js     # Xử lý logic nghiệp vụ
├── service.js        # Tương tác database
└── validation.js     # Validate input (Joi)
```

---

## Cài đặt & Chạy dự án

### Yêu cầu hệ thống

| Phần mềm | Phiên bản | Bắt buộc |
|---|---|---|
| Node.js | ≥ 18.x | ✅ |
| MongoDB | ≥ 4.x | ✅ |
| Redis | ≥ 5.x | ✅ |
| Elasticsearch | ≥ 8.x | ❌ (tùy chọn, có fallback MongoDB) |
| MinIO | Latest | ❌ (tùy chọn, cho file storage) |

### Bước 1: Clone & Cài đặt Dependencies

```bash
git clone <repository-url>
cd task-management-backend
npm install
```

### Bước 2: Cấu hình Biến môi trường

```bash
cp env.example .env
```

Chỉnh sửa file `.env` với thông tin thực tế của bạn (xem mục [Biến môi trường](#-biến-môi-trường)).

### Bước 3: Chạy dự án

```bash
# Chế độ phát triển (hot-reload với Nodemon)
npm start

# Chế độ thông thường
npm run dev
```

Server sẽ chạy tại `http://localhost:9002` (mặc định).

---

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `PORT` | Port của server | `9002` |
| `HOST_NAME` | Hostname | `0.0.0.0` |
| `MODE_PRODUCTION` | Chế độ chạy | `development` / `production` |
| **Database** | | |
| `MONGODB_CONNECT_STRING` | MongoDB connection string | `mongodb+srv://...` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | _(để trống nếu local)_ |
| **Authentication** | | |
| `SECRET_KEY` | Khóa mã hóa AES | `3B94A7BB...` |
| `JWT_SECRET` | JWT signing secret | `your_jwt_secret` |
| **Google OAuth** | | |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `617187...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:3005/auth/google/callback` |
| **Email** | | |
| `EMAIL_SERVICE` | Dịch vụ email | `gmail` |
| `EMAIL_USER` | Email gửi | `user@gmail.com` |
| `EMAIL_PASSWORD` | App password | `xxxx xxxx xxxx xxxx` |
| **MinIO (Object Storage)** | | |
| `MINIO_ENDPOINT` | MinIO endpoint | `localhost` |
| `MINIO_PORT` | MinIO port | `7000` |
| `MINIO_ACCESS_KEY` | Access key | `admin` |
| `MINIO_SECRET_KEY` | Secret key | `12345678` |
| `MINIO_BUCKET_NAME` | Bucket name | `etask` |
| `STORAGE_TYPE` | Loại storage | `MINIO` |
| **AI Integration** | | |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| **Firebase** | | |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `heime-d0243` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account | `firebase-adminsdk-...` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | `-----BEGIN PRIVATE KEY-----...` |
| **CORS** | | |
| `CORS_ALLOWED_ORIGINS` | Danh sách origin được phép | `["https://etask.eranin.com"]` |

---

## API Endpoints

### Office Module (`/office`)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/office/space/*` | Quản lý không gian làm việc |
| POST | `/office/project/*` | Quản lý dự án |
| POST | `/office/task/load` | Lấy danh sách task |
| POST | `/office/task/count` | Đếm số lượng task |
| POST | `/office/task/loaddetails` | Lấy chi tiết task |
| POST | `/office/task/insert` | Tạo task mới |
| POST | `/office/task/update` | Cập nhật task |
| POST | `/office/task/delete` | Xóa task |
| POST | `/office/task/load-task-by-project` | Lấy task theo dự án |
| POST | `/office/task/add-comment` | Thêm bình luận |
| POST | `/office/task/update-comment` | Sửa bình luận |
| POST | `/office/task/delete-comment` | Xóa bình luận |
| POST | `/office/dashboard/*` | Dữ liệu dashboard |
| POST | `/office/mytasks/*` | Quản lý task cá nhân |
| POST | `/office/calendar/*` | Quản lý lịch |
| POST | `/office/channel/*` | Kênh trò chuyện |
| POST | `/office/document/*` | Quản lý tài liệu |

### Management Module (`/management`)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/management/user/*` | Quản lý người dùng |
| POST | `/management/admin/*` | Quản trị hệ thống |
| POST | `/management/setup/*` | Cấu hình ban đầu |
| POST | `/management/system/*` | Cài đặt hệ thống |
| POST | `/management/localization/*` | Quản lý đa ngôn ngữ |
| POST | `/management/rule/*` | Quản lý quy tắc & phân quyền |
| POST | `/management/setting/*` | Cài đặt chung |
| POST | `/management/ringbell_item/*` | Quản lý thông báo |

### File Routes

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/files/:filename` | Xem file |
| GET | `/fileDownload/:filename` | Tải file |

### Middleware Pipeline

Mỗi request đi qua pipeline sau:

```
Request → CORS → Helmet → Body Parser → Session
        → MultiTenant.match() → PermissionProvider.check()
        → Validation → Controller → Response
```

---

## Docker

### Build image

```bash
docker build -t heimer-task-backend .
```

### Chạy container

```bash
docker run -d \
  --name heimer-backend \
  -p 3000:3000 \
  --env-file .env \
  heimer-task-backend
```

**Dockerfile sử dụng:**
- Base image: `node:18-alpine`
- Bao gồm: Tesseract OCR (EN + VI), Ghostscript, Python 3
- Expose port: `3000`

---

## CI/CD

Dự án sử dụng **CircleCI** với 2 môi trường triển khai trên **Google Kubernetes Engine (GKE)**:

| Môi trường | Trigger | GKE Cluster | Namespace |
|---|---|---|---|
| **QA** | Tag `qa_*` | `vnadev-gcp-gke-qa` | `vnadev-qa` |
| **Production** | Tag `prod_*` | `vnadev-gcp-gke-prod` | `vnadev-prod` |

### Quy trình deploy

```
Git Tag → CircleCI → Build Docker Image → Push to Artifact Registry
        → Deploy to GKE → Rolling Update
```

**Ví dụ deploy QA:**
```bash
git tag qa_v1.0.1
git push origin qa_v1.0.1
```

**Ví dụ deploy Production:**
```bash
git tag prod_v1.0.1
git push origin prod_v1.0.1
```

---

## Module Aliases

Dự án sử dụng `module-alias` để đơn giản hóa import paths:

| Alias | Thư mục thực | Ví dụ |
|---|---|---|
| `@app` | `app/` | `require('@app/office/task/controller')` |
| `@management` | `app/management/` | `require('@management/user/user.router')` |
| `@office` | `app/office/` | `require('@office/project/service')` |
| `@shared` | `shared/` | `require('@shared/mongodb/mongodb.core')` |
| `@utils` | `utils/` | `require('@utils/setting')` |

---

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/ten-tinh-nang`)
3. Commit thay đổi (`git commit -m 'feat: thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/ten-tinh-nang`)
5. Tạo Pull Request

---

## License

Private — © Heimer Tech. All rights reserved.

---

<p align="center">
  <sub>Built by <strong>Heimer Tech</strong></sub>
</p>
