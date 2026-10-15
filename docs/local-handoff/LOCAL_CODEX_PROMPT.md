Tiếp tục dự án Trung Hau / HEW trên máy Windows LOCAL.

Repository: trunghaungo/trung-hau-portfolio.
Nhánh đang làm: codex/portfolio-demo (main cũ, không dùng làm baseline).
Working folder dự kiến: D:\HEW-dev\trung-hau-portfolio.
Folder media TCV gốc: D:\HEW-media\TVC TCV Rebranding.
Nguồn gốc khác nếu đã tải backup: D:\HEW-media\cloud-originals.

Đây là chuyển phiên cloud sang local, chưa phải yêu cầu redesign hoặc deploy. Trước tiên xác nhận môi trường thật, source và dữ liệu rồi lập inventory media TCV; báo kết quả và chờ yêu cầu thay media cụ thể. Chỉ đọc file gốc, không sửa/di chuyển/xóa file trong HEW-media. Không làm thêm dự án khác.

Đọc AGENTS.md nếu tồn tại, docs/local-handoff/README.md, INVENTORY.md, VALIDATION.md, CHANGELOG.md, QA_REPORT.md, EDITING_GUIDE.md, MEDIA_GUIDE.md, docs/MOTION_GUIDE.md và kế hoạch trước khi sửa. Xem section mới nhất ở đầu báo cáo; tài liệu/clip các round cũ là lịch sử. Nếu không có AGENTS.md, báo thực tế, không tự tạo luật mới.

Baseline ứng dụng đã được người dùng duyệt: 2e860f0740e98b1e55c542348c554bb532f18e2a, release 2026.10.08-film-media. Commit bàn giao sau baseline chỉ có docs/checksum/helper. Kiểm tra git status, branch, HEAD, origin và remote thật; tôn trọng commit mới hơn và thay đổi local. Không reset/reinstall ghi đè source, không git clean/force push, không tự tạo worktree hoặc hệ cấu hình thứ hai. Nếu có bản Windows đã chỉnh riêng, giữ và đối chiếu trước khi gộp. node scripts/verify-local-handoff.mjs kiểm tra snapshot trước sửa; checksum khác sau sửa hoặc khi có phiên bản mới cần giải thích, không ép reset cho đạt.

Trạng thái đã duyệt:
- React/TS/Vite exact 7.3.6, package/lockfile giữ nguyên; dev/preview bind 127.0.0.1.
- Sáu dự án hiển thị, 49 media entries. Nội dung/config tập trung ở src/content và src/config; file web ở public/media.
- Intro 3400 ms, ba ảnh thật, reload homepage chạy lại; Skip/Escape/deep link/resize/reduced fallback. Hero-text có reveal từng từ theo native scroll, đảo chiều được.
- Phim Chuyến Đi Bất Ý / Chuyen Di Bat Y: banner 01, hover preview MP4 8 giây tạo từ trailer, full trailer MP4 dưới Overview, album Frames & visual notes gồm ảnh 02–13. Desktop đủ chỗ dùng native vertical scroll→horizontal track; mobile/low/reduced native horizontal rail + buttons/keyboard, ảnh contain.
- DoP là credit cá nhân Trung Hau; Best Cinematography HUGFIA 2023 (HUTECH Graduation Film Award) là giải của phim. Không gộp hoặc tự thêm vai trò/khách hàng/thành tích TCV.
- mediaMode live và hover enabled; hiện chỉ phim có video URL. Demo guard 0 video/source/iframe/request vẫn có tests. Không đưa m3u8 ký/expiry vào source; người dùng đã duyệt MP4 thay thế.
- Reduce motion: config off → tắt; lựa chọn người xem ưu tiên OS; persistence/tab sync/blocked storage; không xóa accessibility để ép motion.
- Không thay layout/content/route/order/visibility/credit và media các dự án ngoài yêu cầu được giao. Không GSAP/Lenis/dependency motion mới, không chặn wheel/touch, không idle RAF loop. Giữ fallback đọc được.

Bước đầu:
1. Chứng minh đang chạy local: đọc thư mục media nêu trên và liệt kê tên, loại, kích thước file. Nếu chưa có quyền đọc, báo đường dẫn + lỗi và xin quyền trong giao diện; không yêu cầu mật khẩu/token/cookie vào chat.
2. Xác nhận source/checksum/commit. Chưa sửa app chỉ để giống số liệu báo cáo cũ.
3. Inventory TCV: xác định cover, ảnh gallery, full video/preview nếu có; hash để tìm file trùng và xem kích thước/codec khi công cụ có sẵn. Không tự suy luận credit từ Behance.
4. Báo bảng file thật→vị trí web đề xuất, bản nào là gốc/bản web/duplicate, phần cần người dùng xác nhận. Chờ yêu cầu triển khai tiếp. Không tự upload toàn bộ originals lên GitHub hoặc Internet.

Thông tin công cụ: Behance link https://www.behance.net/gallery/223921635/THAO-CAM-VIEN-SAIGON-ZOO-REBRANDING-VIETNAM từng bị proxy cloud chặn CONNECT 403; chưa xem nội dung/đọc ảnh/video ở vòng đó. Local network khác nên cần kiểm chứng mới nếu được yêu cầu truy cập; không tuyên bố Behance đã đọc. NBNZIA live đã khảo sát ở vòng trước, bằng chứng có ngày nằm trong docs/NBNZIA_COMPARISON.md và docs/reference-live; không cần truy cập để chuyển source. Superdesign/Web Design không là điều kiện bắt buộc ở bước local inventory này.

Khi làm việc: báo lỗi bước bắt buộc ngay; chỉ thử thêm tối đa một lần với thay đổi có căn cứ. Nếu vẫn bị chặn, dừng phần phụ thuộc và chờ người dùng, không tự thay website live bằng clip hay đổi công cụ cho scope bắt buộc. Routine spacing/timing khi đã được giao scope có thể tự quyết. Phân biệt quan sát, giả thuyết và chưa kiểm chứng. Không dùng subagents trừ khi có chỉ dẫn áp dụng cho phép.

Khi được giao sửa tiếp, chạy npm ci/audit/build và kiểm tra liên quan trên môi trường thực, báo kết quả mới. 83/83 của release phim là kết quả Linux cloud, KHÔNG phải Windows. Dùng Playwright Chromium cài local, không hardcode /tmp hoặc /usr/bin từ cloud. Đo thay đổi scroll/transform/currentTime thật khi cần. Có thể npm run dev rồi người dùng xem URL Local in ra; chưa xuất bản website.

Mọi thao tác deploy/publish, đổi brand, cập nhật dependency, đổi nội dung/credit chưa căn cứ đều ngoài scope hiện tại. Không nâng Vite chỉ vì bản cũ trong ZIP hoặc audit khác: kiểm tra repo và lỗi thực trước. Bàn giao từng round theo yêu cầu mới, ưu tiên đúng dữ liệu/source hơn việc tái dựng ngữ cảnh hội thoại cũ.
