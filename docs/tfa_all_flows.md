# TFA (Team Formation Assistant) — Comprehensive System Flows (Mermaid Code)

Tài liệu chứa toàn bộ sơ đồ quy trình và luồng hệ thống của dự án TFA viết bằng cú pháp **Mermaid**.  
Bạn có thể sao chép đoạn mã Mermaid trong từng phần bên dưới và import vào **Draw.io** (*Arrange > Insert > Advanced > Mermaid*) hoặc sử dụng trực tiếp trên **Mermaid Live Editor** ([mermaid.live](https://mermaid.live)).

---

## 1. Sơ đồ Cấu trúc Học thuật & Real-world Entity ERD

```mermaid
erDiagram
    CAMPUS ||--|{ TERM : "quản lý"
    CAMPUS ||--|{ PROGRAM : "thuộc về"
    PROGRAM ||--|{ MAJOR : "chứa các"
    MAJOR ||--|{ COURSE : "cung cấp"
    TERM ||--|{ CLASS_SECTION : "mở trong"
    COURSE ||--|{ CLASS_SECTION : "thuộc môn"
    USER ||--o{ CLASS_SECTION : "giảng dạy (Lecturer)"
    USER ||--o{ ENROLLMENT : "đăng ký (Student)"
    CLASS_SECTION ||--|{ ENROLLMENT : "danh sách lớp"
    ENROLLMENT ||--|| TEAM_DNA : "khai báo hồ sơ"
    CLASS_SECTION ||--|{ GROUPING_SESSION : "tạo đợt phân nhóm"
    GROUPING_SESSION ||--o{ DRAFT_TEAM : "chứa nhóm tự chọn"
    GROUPING_SESSION ||--o{ FORMATION : "sinh đề xuất AI"
    FORMATION ||--|{ TEAM : "chứa các nhóm"
    TEAM ||--|{ TEAM_MEMBER : "thành viên nhóm"
    TEAM ||--o{ CHECK_IN : "theo dõi tuần"
    TEAM ||--o{ RISK_ALERT : "cảnh báo sức khỏe"
```

---

## 2. Luồng Xác thực & Phân quyền Hệ thống (Auth & RBAC Flow)

```mermaid
flowchart TD
    Start(["Người dùng truy cập Hệ thống"]) --> AuthCheck{"Phương thức Xác thực?"}
    
    AuthCheck -- "Production Mode" --> Firebase["Firebase Auth SSO (Email Google/OAuth)"]
    AuthCheck -- "Dev Local Mode" --> MockAuth["Mock Auth UI (Chọn ID & Role)"]
    
    Firebase --> JWTToken["Cấp JWT Bearer Token (Claim Role & User ID)"]
    MockAuth --> JWTToken
    
    JWTToken --> APIRequest["Gửi API Request kèm Header Authorization"]
    APIRequest --> ServerGuard["FastAPI Security Guard (current_principal)"]
    
    ServerGuard --> RoleCheck{"Kiểm tra Role (RBAC)"}
    
    RoleCheck -- "Role = ADMIN" --> AdminScope["Quyền ADMIN: Quản lý Campus, Major, Course, User, Roster CSV Import"]
    RoleCheck -- "Role = LECTURER" --> LecturerScope{"Kiểm tra Quyền sở hữu Lớp (Object Ownership)"}
    RoleCheck -- "Role = STUDENT" --> StudentScope{"Kiểm tra Quyền sở hữu Cá nhân (Self Ownership)"}
    
    LecturerScope -- "Sở hữu Lớp" --> LecturerAllow["Cho phép: Tạo Session, Chạy AI Matching, Điều chỉnh, Xuất bản Nhóm"]
    LecturerScope -- "Không sở hữu Lớp" --> Deny403["Từ chối truy cập (403 Forbidden)"]
    
    StudentScope -- "Chính chủ" --> StudentAllow["Cho phép: Khai báo Team DNA, Tạo/Gia nhập Nhóm, Xem Nhóm của mình"]
    StudentScope -- "Không chính chủ" --> Deny403
```

---

## 3. Sơ đồ Máy trạng thái Vòng đời Đợt Phân nhóm (Grouping Session Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Giảng viên tạo Đợt phân nhóm mới
    
    state DRAFT {
        [*] --> ConfigSession : Cấu hình Chế độ, Kích thước nhóm, Kỹ năng, Trọng số
    }
    
    DRAFT --> OPEN : Mở đợt ghép nhóm & Kích hoạt Deadline
    
    state OPEN {
        [*] --> IntakeDNA : Sinh viên cập nhật Team DNA
        IntakeDNA --> StudentTeaming : (Student-Led / Hybrid) Tạo nhóm & Mời thành viên
    }
    
    OPEN --> FROZEN : Hết hạn Deadline / Đóng thu thập dữ liệu
    
    state FROZEN {
        [*] --> FreezeInput : Khóa hồ sơ & Nhóm nháp không cho sửa đổi
    }
    
    FROZEN --> MATCHING : Giảng viên bấm "Kích hoạt AI Matching"
    
    state MATCHING {
        [*] --> OrToolsEngine : AI CP-SAT Solver tối ưu đa mục tiêu
    }
    
    MATCHING --> REVIEW : AI xuất kết quả Đề xuất (Formation Result)
    
    state REVIEW {
        [*] --> LecturerBoard : Giảng viên xem Rationale, Cảnh báo & Kéo thả điều chỉnh
        LecturerBoard --> LockTeam : Khóa nhóm đạt chuẩn / Giải quyết xung đột
    }
    
    REVIEW --> PUBLISHED : Giảng viên Phê duyệt & Xuất bản nhóm
    REVIEW --> MATCHING : Tùy chỉnh trọng số & Chạy lại AI Matching
    
    state PUBLISHED {
        [*] --> NotifyStudents : Công bố danh sách chính thức đến Sinh viên
    }
    
    PUBLISHED --> [*]
```

---

## 4. Quy trình 3 Chế độ Ghép nhóm (Three Grouping Modes)

```mermaid
flowchart TD
    subgraph Mode1 ["Chế độ 1: Lecturer-Led (Giảng viên hoàn toàn)"]
        A1["Sinh viên khai báo Team DNA"] --> B1["Giảng viên khởi chạy AI Matching"]
        B1 --> C1["AI ghép 100% sinh viên vào các nhóm cân bằng"]
        C1 --> D1["Giảng viên duyệt & xuất bản"]
    end

    subgraph Mode2 ["Chế độ 2: Student-Led (Sinh viên tự ghép)"]
        A2["Sinh viên tự do tạo nhóm, gửi lời mời & xin gia nhập"] --> B2["Nộp danh sách nhóm cho Giảng viên"]
        B2 --> C2["Giảng viên xem xét & phê duyệt nhóm"]
        C2 --> D2["AI hỗ trợ xếp những sinh viên lẻ còn sót vào nhóm thiếu"]
    end

    subgraph Mode3 ["Chế độ 3: Hybrid (Chế độ Cờ đầu)"]
        A3["Sinh viên tự lập nhóm bán phần (Partial Teams)"] --> B3["Đến deadline, hệ thống tự động khóa nhóm nháp"]
        B3 --> C3["AI bảo lưu các nhóm sinh viên hợp lệ"]
        C3 --> D3["AI tự động lấp đầy sinh viên lẻ vào nhóm thiếu hoặc tạo nhóm mới"]
        D3 --> E3["Giảng viên đánh giá tổng thể, chỉnh sửa & xuất bản"]
    end
```

---

## 5. Thuật toán AI Matching & Quy hoạch Đa mục tiêu (OR-Tools CP-SAT Flow)

```mermaid
flowchart LR
    subgraph Inputs ["Dữ liệu Đầu vào (Inputs)"]
        Students["Danh sách Sinh viên & Team DNA"]
        Config["Cấu hình Session (Min/Max Size, Roles, Skills, Majors)"]
        Constraints["Ràng buộc Cứng (Must-pair, Cannot-pair)"]
        Weights["Bộ Trọng số Cấu hình (Weights)"]
    end

    subgraph CPSAT ["OR-Tools CP-SAT Solver"]
        HardRule1["R1: Kích thước nhóm nằm trong khoảng [Min, Max]"]
        HardRule2["R2: Tuân thủ Must-pair & Cannot-pair"]
        HardRule3["R7: Mỗi sinh viên được xếp đúng 1 nhóm"]
        
        SoftRule1["Tối đa Cân bằng Năng lực (Competency Spread)"]
        SoftRule2["Tối đa Trùng lịch rảnh (Availability Overlap)"]
        SoftRule3["Tối đa Đa dạng Vai trò (Role Diversity)"]
        SoftRule4["Tối đa Nguyện vọng Cá nhân (Peer Preferences)"]
        SoftRule5["Tối đa Đa dạng Ngành học (Major Diversity)"]
    end

    subgraph Output ["Kết quả Đầu ra (Output Formation)"]
        Teams["Danh sách Nhóm đề xuất (Teams)"]
        BalanceScore["Điểm Cân bằng (Balance Score 0-100%)"]
        Rationale["Lý do Giải trình Đề xuất (AI Rationale)"]
        Unassigned["Cảnh báo Sinh viên chưa thể xếp nhóm (nếu có)"]
    end

    Inputs --> CPSAT
    CPSAT --> Output
```

---

## 6. Luồng Tương tác của Sinh viên (Student Team DNA & Self-Formation Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Student as Sinh viên
    participant UI as Giao diện Web
    participant API as API Server
    participant DB as CSDL PostgreSQL/SQLite

    Student->>UI: Truy cập Lớp học & Đợt phân nhóm
    UI->>API: GET /api/v1/sections/{id}/dna
    API-->>UI: Trả về trạng thái Team DNA hiện tại

    Student->>UI: Điền Kỹ năng, Lịch rảnh, Vai trò mong muốn & Mức cam kết
    UI->>API: PUT /api/v1/sections/{id}/dna (Cập nhật Team DNA)
    API->>DB: Lưu Team DNA & Tính phần trăm hoàn thành (%)
    DB-->>API: Lưu thành công
    API-->>UI: Cập nhật Tiến độ Hồ sơ (Completeness Score)

    alt Tạo nhóm mới (Hybrid / Student-Led)
        Student->>UI: Bấm "Tạo nhóm mới" (Draft Team)
        UI->>API: POST /api/v1/student/teams
        API->>DB: Lưu Draft Team (Status: FORMING)
        API-->>UI: Tạo nhóm thành công (Leader ID = Student)
        
        Student->>UI: Gửi lời mời bạn học gia nhập nhóm
        UI->>API: POST /api/v1/student/teams/{id}/invitations
        API->>DB: Lưu TeamInvitation (Status: PENDING)
    else Gia nhập nhóm có sẵn
        Student->>UI: Bấm "Xin gia nhập nhóm" (Join Request)
        UI->>API: POST /api/v1/student/teams/{id}/join-requests
        API->>DB: Lưu JoinRequest (Status: PENDING)
    end
```

---

## 7. Luồng Giảng viên Duyệt & Điều chỉnh Nhóm (Lecturer Review Board Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Lecturer as Giảng viên
    participant Board as Review Board UI
    participant API as API Server
    participant Engine as OR-Tools AI Engine
    participant DB as CSDL

    Lecturer->>Board: Chọn Đợt ghép nhóm & bấm "Chạy AI Matching"
    Board->>API: POST /api/v1/sessions/{id}/match
    API->>Engine: Lấy dữ liệu Team DNA & giải bài toán CP-SAT
    Engine-->>API: Trả về Kết quả Đề xuất (Formation)
    API->>DB: Lưu Kết quả Đề xuất (Status: REVIEW)
    API-->>Board: Hiển thị các Nhóm đề xuất, Điểm cân bằng & Lý do AI

    Lecturer->>Board: Xem Lý do AI (Rationale) & Cảnh báo rủi ro
    
    alt Giảng viên kéo-thả di chuyển sinh viên sang nhóm khác
        Lecturer->>Board: Kéo thả Sinh viên X từ Nhóm A sang Nhóm B
        Board->>API: PATCH /api/v1/teams/{id}/members (Ghi đè thủ công)
        API->>DB: Cập nhật thành viên & Tính lại Điểm Cân bằng Nhóm
        API-->>Board: Cập nhật giao diện & Đánh dấu nhóm bị chỉnh sửa
    end

    alt Giảng viên Khóa Nhóm (Lock Team)
        Lecturer->>Board: Bấm "Khóa Nhóm" (Lock Team)
        Board->>API: POST /api/v1/teams/{id}/lock
        API->>DB: Đánh dấu locked = True (AI sẽ giữ nguyên nhóm này nếu chạy lại)
    end

    Lecturer->>Board: Bấm "Phê duyệt & Xuất bản Danh sách Nhóm"
    Board->>API: POST /api/v1/sessions/{id}/publish
    API->>DB: Cập nhật Session Status = PUBLISHED
    API-->>Board: Thông báo Xuất bản thành công & Gửi notification cho Sinh viên
```

---

## 8. Luồng Giám sát Sức khỏe Nhóm & Cảnh báo Rủi ro (Health & Risk Monitoring Flow)

```mermaid
flowchart TD
    subgraph WeeklyCheckin ["Check-in Hàng tuần"]
        Student["Sinh viên Check-in hàng tuần"] --> CheckinForm["Báo cáo: Tiến độ công việc, Mức độ quá tải, Đánh giá phối hợp (1-5)"]
        CheckinForm --> SaveCheckin["Lưu vào CSDL CheckIn Table"]
    end

    subgraph RiskEngine ["Động cơ Phát hiện Rủi ro (Risk Engine)"]
        SaveCheckin --> Rule1{"Số thành viên bỏ Check-in > 50%?"}
        SaveCheckin --> Rule2{"Điểm phối hợp trung bình < 3/5?"}
        SaveCheckin --> Rule3{"Có thành viên báo bị quá tải/quá rảnh?"}
        SaveCheckin --> Rule4{"Kích thước nhóm tụt xuống dưới Min Size?"}

        Rule1 -- "CÓ" --> Alert1["Tạo Cảnh báo: Missing Check-ins (HIGH)"]
        Rule2 -- "CÓ" --> Alert2["Tạo Cảnh báo: Collaboration Issue (MEDIUM)"]
        Rule3 -- "CÓ" --> Alert3["Tạo Cảnh báo: Workload Imbalance (HIGH)"]
        Rule4 -- "CÓ" --> Alert4["Tạo Cảnh báo: Size Below Min (CRITICAL)"]
    end

    subgraph Action ["Xử lý của Giảng viên"]
        Alert1 & Alert2 & Alert3 & Alert4 --> Dashboard["Hiển thị trên Dashboard Giảng viên (Health Badge: RED/YELLOW)"]
        Dashboard --> LecturerAction{"Giảng viên can thiệp"}
        LecturerAction -- "Điều chuyển sinh viên" --> SmartRebalance["Smart Rebalance: AI đề xuất hoán đổi sinh viên giữa các nhóm"]
        LecturerAction -- "Tự xử lý" --> ResolveAlert["Đánh dấu Đã giải quyết (RESOLVED)"]
    end
```
