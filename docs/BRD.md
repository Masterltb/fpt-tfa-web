# Business Requirements Document

## 1. Executive Summary

Team Formation Assistant là hệ thống hỗ trợ tự động phân nhóm sinh viên dựa trên kỹ năng, ngành học, kinh nghiệm, lịch học, sở thích và vai trò mong muốn. Hệ thống dùng AI để đề xuất các đội hình tối ưu nhằm cân bằng năng lực giữa các nhóm và tăng khả năng thành công của dự án, đồng thời giúp giảm thiểu ảnh hưởng của quyết định cảm tính hoặc thiên lệch trong quá trình lập nhóm.

- **Vấn đề cần giải quyết:** việc lập nhóm sinh viên hiện làm thủ công hoặc để sinh viên tự chọn, dẫn tới tốn thời gian, các nhóm mất cân bằng năng lực và dễ phát sinh xung đột.
- **Giải pháp đề xuất:** một công cụ đề xuất đội hình cân bằng dựa trên hồ sơ sinh viên, có kèm lý do (rationale) và cho phép giảng viên xem xét, điều chỉnh trước khi chốt.
- **Người dùng chính:** sinh viên và giảng viên.
- **Giá trị kinh doanh:** rút ngắn thời gian lập nhóm, giảm xung đột và nâng cao chất lượng đội dự án.
- **Phạm vi chính:** thu thập hồ sơ sinh viên, thiết lập lớp/dự án và tiêu chí nhóm, phân nhóm tự động bằng AI, xem xét và chốt nhóm, kiểm soát truy cập theo vai trò.
- **Kết quả kỳ vọng:** các nhóm cân bằng hơn, quy trình lập nhóm nhanh và minh bạch hơn, quyết định có thể giải trình được (inferred, needs confirmation).

## 2. Problem Statement

### 2.1 Current Situation

Việc phân chia nhóm dự án trong môi trường học tập hiện được thực hiện thủ công bởi giảng viên hoặc do sinh viên tự chọn nhóm. Với số lượng sinh viên lớn, việc cân đối đồng thời kỹ năng, ngành học, kinh nghiệm, lịch học, sở thích và vai trò mong muốn là khó khăn và tốn nhiều công sức (inferred, needs confirmation).

### 2.2 Affected Users

| Nhóm người dùng | Mức độ ảnh hưởng | Mô tả ảnh hưởng |
| --------------- | ---------------- | --------------- |
| Sinh viên | High | Chất lượng nhóm, sự công bằng về khối lượng công việc và kết quả dự án phụ thuộc vào cách phân nhóm |
| Giảng viên | High | Chịu gánh nặng thời gian và trách nhiệm bảo đảm sự cân bằng, công bằng khi lập nhóm |
| Đơn vị đào tạo / Nhà trường | Medium | Kết quả dự án và tính nhất quán của quy trình lập nhóm (inferred, needs confirmation) |

### 2.3 Business Impact

| Khía cạnh | Tác động hiện tại |
| --------- | ----------------- |
| Thời gian | Lập nhóm thủ công tốn nhiều thời gian của giảng viên (inferred, needs confirmation) |
| Trải nghiệm người dùng | Sinh viên có thể bị xếp vào nhóm lệch năng lực hoặc lệch lịch học, gây khó phối hợp (inferred, needs confirmation) |
| Chi phí | Chưa được xác định (needs confirmation) |
| Kết quả hoạt động | Nhóm mất cân bằng làm giảm khả năng thành công của dự án và tăng xung đột (inferred, needs confirmation) |

### 2.4 Root Causes

| Nguyên nhân gốc rễ | Mô tả |
| ------------------ | ----- |
| Nhiều tiêu chí xung đột | Phải cân đối đồng thời kỹ năng, ngành học, kinh nghiệm, lịch học, sở thích và vai trò mong muốn |
| Thiếu công cụ hỗ trợ | Quy trình chủ yếu thủ công, không có công cụ tối ưu hóa (inferred, needs confirmation) |
| Thiên lệch khi tự chọn nhóm | Sinh viên có xu hướng chọn theo quan hệ quen biết thay vì theo năng lực bổ trợ (inferred, needs confirmation) |
| Thiếu tiêu chí minh bạch | Quyết định lập nhóm khó giải trình do không có lý do rõ ràng kèm theo (inferred, needs confirmation) |

## 3. Vision and Objectives

### 3.1 Vision

Hướng đến trạng thái trong đó giảng viên có thể lập được các nhóm sinh viên cân bằng và ít xung đột trong thời gian ngắn, kèm lý do rõ ràng và có thể giải trình; sinh viên tin tưởng kết quả vì quy trình minh bạch và công bằng. AI đóng vai trò hỗ trợ đề xuất, quyền quyết định cuối cùng thuộc về giảng viên (inferred, needs confirmation).

### 3.2 Objectives

| Mã | Mục tiêu | Liên hệ Problem Statement |
| -- | -------- | ------------------------- |
| OBJ-01 | Rút ngắn thời gian lập nhóm | 2.3 Thời gian |
| OBJ-02 | Nâng cao sự cân bằng năng lực giữa các nhóm | 2.4 Nhiều tiêu chí xung đột |
| OBJ-03 | Giảm xung đột trong quá trình thực hiện dự án | 2.3 Kết quả hoạt động |
| OBJ-04 | Tăng tính minh bạch, giải trình của quyết định lập nhóm | 2.4 Thiếu tiêu chí minh bạch |
| OBJ-05 | Bảo đảm mọi sinh viên đều được xếp nhóm hoặc nêu rõ lý do chưa xếp được | 2.2 Affected Users |

### 3.3 Success Metrics

| Goal | User/Business Value | Metric | Target | Timeframe |
| ---- | ------------------- | ------ | ------ | --------- |
| OBJ-01 | Tiết kiệm thời gian giảng viên | Thời gian trung bình để lập nhóm cho một lớp | Giảm đáng kể so với lập nhóm thủ công (inferred, needs confirmation) | Bản phát hành v1 (inferred, needs confirmation) |
| OBJ-02 | Nhóm cân bằng, tăng khả năng thành công | Điểm cân bằng năng lực giữa các nhóm | Cao hơn phương án phân nhóm ngẫu nhiên hoặc thủ công (inferred, needs confirmation) | Bản phát hành v1 (inferred, needs confirmation) |
| OBJ-03 | Giảm xung đột, giảm chỉnh sửa | Số lần điều chỉnh nhóm sau khi lập | Giảm so với kỳ trước (inferred, needs confirmation) | Chưa được xác định (needs confirmation) |
| OBJ-04 | Quyết định minh bạch, giải trình được | Tỷ lệ nhóm có kèm lý do (rationale) | 100% (inferred, needs confirmation) | Bản phát hành v1 (inferred, needs confirmation) |
| OBJ-05 | Không bỏ sót sinh viên | Số sinh viên chưa được xếp nhóm mà không có lý do | 0 (inferred, needs confirmation) | Bản phát hành v1 (inferred, needs confirmation) |

## 4. Stakeholder Register

| Stakeholder | Role | Interest / Expectation | Influence | Responsibility |
| ----------- | ---- | ---------------------- | --------- | -------------- |
| Sinh viên | Người dùng cuối, chủ sở hữu hồ sơ, thành viên nhóm | Được xếp nhóm công bằng, hợp lý về năng lực và lịch học | Medium | Cung cấp và cập nhật hồ sơ cá nhân chính xác |
| Giảng viên | Người dùng cuối, người chạy và chốt phân nhóm | Lập nhóm nhanh, cân bằng, có thể giải trình | High | Thiết lập tiêu chí, xem xét, điều chỉnh và phê duyệt nhóm cuối cùng (inferred, needs confirmation) |
| Quản trị viên đào tạo | Cấu hình người dùng và lớp học | Tính nhất quán và tuân thủ | Medium | Quản lý người dùng, lớp học và cấu hình hệ thống (inferred, needs confirmation) |
| Nhà trường / Đơn vị đào tạo | Bên bảo trợ | Cải thiện kết quả dự án, quy trình giải trình được | Medium | Phê duyệt chủ trương và nguồn lực (inferred, needs confirmation) |
| Bộ phận bảo vệ dữ liệu | Giám sát tuân thủ | Xử lý dữ liệu sinh viên hợp pháp | High | Kiểm soát việc sử dụng dữ liệu và thuộc tính nhạy cảm (inferred, needs confirmation) |
| Nhóm phát triển | Bên xây dựng và bảo trì | Hệ thống đúng đắn, dễ bảo trì | Medium | Phát triển, kiểm thử và vận hành hệ thống (inferred, needs confirmation) |

## 5. Scope

### 5.1 In Scope

- Thu thập và quản lý hồ sơ sinh viên: kỹ năng, ngành học, kinh nghiệm, lịch học, sở thích và vai trò mong muốn.
- Thiết lập lớp/dự án và tiêu chí nhóm bởi giảng viên (inferred, needs confirmation).
- Phân nhóm tự động bằng AI để đề xuất các đội hình cân bằng năng lực.
- Kèm lý do (rationale) cho mỗi đề xuất nhóm (inferred, needs confirmation).
- Xem xét, điều chỉnh và chốt nhóm bởi giảng viên (inferred, needs confirmation).
- Kiểm soát truy cập theo vai trò sinh viên và giảng viên (inferred, needs confirmation).

### 5.2 Out of Scope

- Phân nhóm liên lớp hoặc liên khóa (inferred, needs confirmation).
- Tự động tái phân nhóm sau khi dự án đã bắt đầu (inferred, needs confirmation).
- Chấm điểm đánh giá chéo giữa các thành viên (inferred, needs confirmation).
- Dự đoán điểm số hoặc kết quả học tập (inferred, needs confirmation).
- Tích hợp với hệ thống quản lý học tập bên ngoài trong phiên bản hiện tại (inferred, needs confirmation).

## 6. Business Capabilities

### 6.1 Capability Catalog

| Business Capability | Goal | User Segment | Business Value | Scope |
| ------------------- | ---- | ------------ | -------------- | ----- |
| Quản lý hồ sơ sinh viên | Ghi nhận đầy đủ dữ liệu đầu vào để phân nhóm | Sinh viên | Dữ liệu chính xác giúp đề xuất nhóm chất lượng hơn | Bao gồm nhập/cập nhật kỹ năng, ngành học, kinh nghiệm, lịch học, sở thích, vai trò mong muốn; không bao gồm xác thực năng lực bên ngoài (inferred, needs confirmation) |
| Thiết lập lớp và tiêu chí nhóm | Xác định bối cảnh và ràng buộc cho một lần lập nhóm | Giảng viên | Bảo đảm đề xuất phù hợp yêu cầu môn học/dự án | Bao gồm tạo lớp/dự án và đặt tiêu chí; không bao gồm quản lý chương trình đào tạo (inferred, needs confirmation) |
| Phân nhóm tự động bằng AI | Đề xuất các đội hình cân bằng năng lực | Giảng viên, Sinh viên | Rút ngắn thời gian và tăng chất lượng nhóm | Bao gồm sinh đề xuất đội hình; không bao gồm quyết định cuối cùng thay giảng viên |
| Giải thích đề xuất | Cung cấp lý do cho từng nhóm được đề xuất | Giảng viên | Tăng minh bạch và khả năng giải trình | Bao gồm lý do theo từng nhóm; không bao gồm phân tích dự báo kết quả (inferred, needs confirmation) |
| Xem xét và chốt nhóm | Cho phép con người điều chỉnh và phê duyệt kết quả | Giảng viên | Bảo đảm quyết định cuối cùng do con người kiểm soát | Bao gồm điều chỉnh và chốt; không bao gồm tự động chốt không qua giảng viên (inferred, needs confirmation) |
| Kiểm soát truy cập và quyền riêng tư | Bảo vệ dữ liệu cá nhân theo vai trò | Sinh viên, Giảng viên | Tuân thủ và giữ niềm tin người dùng | Bao gồm phân quyền theo vai trò và quyền sở hữu; không bao gồm quản lý danh tính cấp tổ chức (inferred, needs confirmation) |
| Ghi vết và tái lập lần chạy | Lưu và tái lập được kết quả phân nhóm | Giảng viên, Nhóm phát triển | Hỗ trợ kiểm toán và giải trình | Bao gồm lưu phiên bản kết quả; không bao gồm phân tích lịch sử nâng cao (inferred, needs confirmation) |

### 6.2 Capability Prioritization

| Capability | Priority | Rationale | Dependency |
| ---------- | -------- | --------- | ---------- |
| Quản lý hồ sơ sinh viên | Must | Là dữ liệu đầu vào bắt buộc cho phân nhóm | Không có |
| Thiết lập lớp và tiêu chí nhóm | Must | Xác định ràng buộc cho lần chạy | Quản lý hồ sơ sinh viên |
| Phân nhóm tự động bằng AI | Must | Là chức năng lõi tạo ra giá trị chính | Quản lý hồ sơ sinh viên; Thiết lập lớp và tiêu chí nhóm |
| Xem xét và chốt nhóm | Must | Bảo đảm con người kiểm soát quyết định cuối cùng (inferred, needs confirmation) | Phân nhóm tự động bằng AI |
| Giải thích đề xuất | Should | Tăng minh bạch, hỗ trợ chấp nhận kết quả | Phân nhóm tự động bằng AI |
| Kiểm soát truy cập và quyền riêng tư | Must | Bảo vệ dữ liệu cá nhân sinh viên (inferred, needs confirmation) | Quản lý hồ sơ sinh viên |
| Ghi vết và tái lập lần chạy | Should | Hỗ trợ kiểm toán và giải trình (inferred, needs confirmation) | Phân nhóm tự động bằng AI |

## 7. Business Rules

| Rule ID | Business Rule | Source / Owner | Priority | Status |
| ------- | ------------- | -------------- | -------- | ------ |
| BR-01 | Hệ thống phân nhóm dựa trên kỹ năng, ngành học, kinh nghiệm, lịch học, sở thích và vai trò mong muốn của sinh viên | Mô tả dự án | Must | Confirmed |
| BR-02 | Hệ thống đề xuất đội hình nhằm cân bằng năng lực giữa các nhóm | Mô tả dự án | Must | Confirmed |
| BR-03 | Quyền phê duyệt và chốt nhóm cuối cùng thuộc về giảng viên; AI chỉ hỗ trợ ra quyết định | Giảng viên | Must | Needs Confirmation |
| BR-04 | Mỗi sinh viên được xếp vào đúng một nhóm cho một dự án, hoặc được đánh dấu chưa xếp được kèm lý do | Giảng viên | Must | Needs Confirmation |
| BR-05 | Kích thước nhóm phải nằm trong khoảng tối thiểu và tối đa do giảng viên quy định | Giảng viên | Must | Needs Confirmation |
| BR-06 | Đề xuất phải tôn trọng các ràng buộc bắt buộc phải ghép hoặc không được ghép do người có thẩm quyền phê duyệt | Giảng viên | Should | Needs Confirmation |
| BR-07 | Mỗi nhóm được đề xuất phải kèm lý do có thể kiểm chứng | Giảng viên | Should | Needs Confirmation |
| BR-08 | Dữ liệu cá nhân của sinh viên chỉ hiển thị cho chính sinh viên đó và giảng viên phụ trách, không lộ cho sinh viên khác | Bộ phận bảo vệ dữ liệu | Must | Needs Confirmation |
| BR-09 | Không sử dụng thuộc tính nhạy cảm hoặc được bảo vệ làm tín hiệu phân nhóm trừ khi có chính sách hợp pháp và được ghi nhận | Bộ phận bảo vệ dữ liệu | Must | Needs Confirmation |
| BR-10 | Một lần chạy phân nhóm phải có tính tái lập: cùng dữ liệu đầu vào và cùng tham số cho ra cùng kết quả | Nhóm phát triển | Should | Needs Confirmation |

## 8. Constraints and Assumptions

### 8.1 Constraints

| Constraint ID | Constraint | Impact | Owner / Source | Validation |
| ------------- | ---------- | ------ | -------------- | ---------- |
| CON-01 | Dữ liệu cá nhân sinh viên phải được xử lý theo quy định về quyền riêng tư | Giới hạn cách thu thập, lưu trữ và hiển thị dữ liệu | Bộ phận bảo vệ dữ liệu (inferred, needs confirmation) | Rà soát tuân thủ với bộ phận bảo vệ dữ liệu |
| CON-02 | Quyết định cuối cùng phải do con người kiểm soát (Human-in-the-loop) | AI chỉ hỗ trợ, không tự chốt nhóm | Giảng viên (inferred, needs confirmation) | Xác nhận với giảng viên và ban chủ nhiệm |
| CON-03 | Không sử dụng thuộc tính nhạy cảm làm tín hiệu phân nhóm | Giới hạn các đặc trưng đầu vào cho mô hình | Bộ phận bảo vệ dữ liệu (inferred, needs confirmation) | Rà soát danh mục đặc trưng đầu vào |
| CON-04 | Giới hạn thời gian và ngân sách của dự án | Ảnh hưởng phạm vi và tiến độ | Chưa được xác định (needs confirmation) | Xác nhận với bên bảo trợ |
| CON-05 | Ràng buộc về công nghệ triển khai | Ảnh hưởng lựa chọn kiến trúc và công cụ | Nhóm phát triển (inferred, needs confirmation) | Xác nhận yêu cầu hạ tầng với nhóm phát triển |

### 8.2 Assumptions

| Assumption ID | Assumption | Impact if False | Owner / Source | Validation |
| ------------- | ---------- | --------------- | -------------- | ---------- |
| ASM-01 | Sinh viên cung cấp hồ sơ tương đối đầy đủ và trung thực | Chất lượng đề xuất nhóm giảm | Sinh viên (inferred, needs confirmation) | Kiểm thử với dữ liệu mẫu và cơ chế xác thực đầu vào |
| ASM-02 | Quy mô lớp ở mức hàng chục đến vài trăm sinh viên cho mỗi lần lập nhóm | Ảnh hưởng hiệu năng và thiết kế thuật toán | Giảng viên (inferred, needs confirmation) | Xác nhận quy mô thực tế với giảng viên |
| ASM-03 | Có sẵn cơ chế xác thực để phân biệt vai trò sinh viên và giảng viên | Không thể áp dụng kiểm soát truy cập theo vai trò | Nhóm phát triển (inferred, needs confirmation) | Xác nhận phương án xác thực |
| ASM-04 | Giảng viên chấp nhận và sử dụng đề xuất của hệ thống trong quy trình thực tế | Giá trị của hệ thống không đạt được | Giảng viên (inferred, needs confirmation) | Khảo sát hoặc thử nghiệm sử dụng thực tế |

### 8.3 Validation Plan

- Xác nhận với giảng viên và ban chủ nhiệm về nguyên tắc Human-in-the-loop và quyền phê duyệt cuối cùng (BR-03, CON-02).
- Rà soát cùng bộ phận bảo vệ dữ liệu về xử lý dữ liệu cá nhân và danh mục thuộc tính được phép dùng (BR-08, BR-09, CON-01, CON-03).
- Xác nhận các mục tiêu và chỉ số thành công đang được đánh dấu suy luận trong mục 3.3.
- Xác nhận quy mô lớp, khoảng kích thước nhóm và các tiêu chí bắt buộc/ràng buộc (BR-04, BR-05, ASM-02).
- Thử nghiệm sử dụng thực tế với một số lớp để kiểm chứng mức độ chấp nhận và giá trị (ASM-01, ASM-04).
- Xác nhận giới hạn thời gian, ngân sách và ràng buộc công nghệ (CON-04, CON-05).

## 9. Risks and Mitigations

| Risk ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
| ------- | ---- | ---------- | ------ | ---------- | ----- | ------ |
| RSK-01 | Hồ sơ sinh viên thiếu hoặc không trung thực làm giảm chất lượng đề xuất | Medium | High | Xác thực dữ liệu đầu vào và cho phép giảng viên xem xét, điều chỉnh | Giảng viên (inferred, needs confirmation) | Open |
| RSK-02 | Các ràng buộc bắt buộc không thể thỏa mãn đồng thời, không tạo được nhóm hợp lệ | Medium | High | Báo rõ các ràng buộc xung đột để giảng viên nới lỏng thay vì tạo nhóm không hợp lệ | Nhóm phát triển (inferred, needs confirmation) | Open |
| RSK-03 | Người dùng cảm thấy kết quả thiếu công bằng, làm giảm niềm tin | Medium | Medium | Kèm lý do rõ ràng cho từng nhóm và bảo đảm tính tái lập, giải trình được | Giảng viên (inferred, needs confirmation) | Open |
| RSK-04 | Sử dụng sai dữ liệu cá nhân hoặc thuộc tính nhạy cảm dẫn tới vi phạm quyền riêng tư | Low | High | Kiểm soát truy cập theo vai trò và loại trừ thuộc tính nhạy cảm khỏi tín hiệu phân nhóm | Bộ phận bảo vệ dữ liệu (inferred, needs confirmation) | Open |
| RSK-05 | Giảng viên không chấp nhận công cụ, tiếp tục làm thủ công | Medium | Medium | Bảo đảm quyền kiểm soát của con người và trải nghiệm đơn giản, minh bạch | Nhà trường / Đơn vị đào tạo (inferred, needs confirmation) | Open |

## 10. Research Basis

Chưa có nguồn nghiên cứu hoặc dữ liệu thực nghiệm được cung cấp (needs confirmation).

| Source ID | Source | Key Evidence | Related Requirement |
| --------- | ------ | ------------ | ------------------- |
| SRC-01 | Chưa được xác định (needs confirmation) | Chưa có nguồn nghiên cứu hoặc dữ liệu thực nghiệm được cung cấp (needs confirmation) | Chưa được xác định (needs confirmation) |

## 11. Open Questions and Items Needing Confirmation

| ID | Question / Item | Related Section | Decision Owner | Priority |
| -- | --------------- | --------------- | -------------- | -------- |
| OQ-01 | Nguyên tắc Human-in-the-loop và quyền phê duyệt cuối cùng của giảng viên có được xác nhận không | 3.1, 7 (BR-03), 8.1 (CON-02) | Giảng viên / Ban chủ nhiệm (inferred, needs confirmation) | High |
| OQ-02 | Các chỉ số và mục tiêu thành công (mục 3.3) có giá trị mục tiêu cụ thể nào được xác nhận | 3.3 | Giảng viên / Bên bảo trợ (inferred, needs confirmation) | High |
| OQ-03 | Cách đo lường "cân bằng năng lực" được định nghĩa chính xác như thế nào | 3.3, 6.1 | Giảng viên / Nhóm phát triển (inferred, needs confirmation) | High |
| OQ-04 | Khoảng kích thước nhóm tối thiểu và tối đa là bao nhiêu | 7 (BR-05) | Giảng viên (inferred, needs confirmation) | Medium |
| OQ-05 | Danh mục thuộc tính được phép và bị cấm dùng làm tín hiệu phân nhóm | 7 (BR-09), 8.1 (CON-03) | Bộ phận bảo vệ dữ liệu (inferred, needs confirmation) | High |
| OQ-06 | Quy mô lớp thực tế cho mỗi lần lập nhóm | 8.2 (ASM-02) | Giảng viên (inferred, needs confirmation) | Medium |
| OQ-07 | Giới hạn thời gian, ngân sách và ràng buộc công nghệ của dự án | 8.1 (CON-04, CON-05) | Bên bảo trợ / Nhóm phát triển (inferred, needs confirmation) | Medium |
| OQ-08 | Có nguồn nghiên cứu, khảo sát hoặc dữ liệu thực nghiệm nào để bổ sung không | 10 | Giảng viên / Bên bảo trợ (inferred, needs confirmation) | Medium |
