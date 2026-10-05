# Báo cáo kiểm tra — Trung Hau / HEW

Ngày bàn giao: 06/10/2026 (Asia/Saigon). Môi trường: Node.js 24.19.0, npm 11.9.0; Chromium 151.0.7922.173; React 19.2.0, TypeScript 5.9.3, Vite 7.2.2.

## Kết quả

- `npm ci` với lockfile: thành công. Script cài đặt có thể chạy lại; không thay lockfile hoặc file kế hoạch gốc.
- `npm run check:content`: thành công — sáu dự án đang hiện, 30 media assets, chế độ `demo`.
- `npm run build`: thành công — kiểm tra nội dung, TypeScript và bundle production.
- `npm test`: **27/27 kiểm tra qua**, không skip. Sau khi tách các nhãn/tiêu đề sang `ui.json`, đã build và chạy lại 4 kiểm tra smoke liên quan: tất cả qua.
- `npm audit --omit=dev`: không báo lỗ hổng trong dependency production ở thời điểm chạy. Không phải đánh giá toàn bộ an ninh website.
- `git diff --check`: qua. File kế hoạch gốc giữ nguyên. Source và tài liệu đã được đẩy lên nhánh `codex/portfolio-demo` trên GitHub theo xác nhận của người dùng; website chưa được deploy.

## Phạm vi đã kiểm tra

| Nhóm | Bằng chứng |
| --- | --- |
| Layout | Chromium viewport 320, 390, 430, 768, 1.024, 1.440 px; không tràn ngang trên home và case đại diện |
| Landscape / reflow | Viewport 844×390 và 720×450; viewport nhỏ mô phỏng không gian CSS của zoom 200%, không phải kiểm tra nút zoom browser trên thiết bị thật |
| Case routing | Home → cả sáu case, title/focus, refresh, Back/Forward, phục hồi vị trí tại thời điểm click thực tế và focus card |
| Link trực tiếp / lỗi | Case trực tiếp trở về /#work; slug không tồn tại có trang lỗi và lối về |
| Click nhanh | Hai lựa chọn dự án liên tiếp trong một lượt; lựa chọn cuối được áp dụng và Back to work về homepage |
| Mobile menu | Mở bằng tap/click, focus chuyển tới link, Escape đóng và trả focus, điều hướng About hoạt động |
| Retouch | Edited mặc định; toggle bằng click/tap/Enter/Space; giữ hơn 450 ms, thả; cancel khi pointer rời, pointercancel, blur và scroll; không đổi trạng thái hai lần sau long press |
| Giảm motion | Nội dung vẫn hiện, không animation route, điều hướng và nút vẫn dùng được |
| Demo video | Không video/source/iframe hoặc request video trên demo; kể cả khi test cung cấp preview/full-video qua fixture |
| Video live | Clip WebM thử trong Chromium: load theo yêu cầu, muted/playsInline cho preview, dừng preview khác, hover/rời card, dừng khi card ngoài viewport, reduced motion bỏ auto preview, full player controls, giữ poster/link file khi lỗi |
| Media lỗi | Abort cover request: hiện fallback, giữ link mở case |
| Nội dung cấu hình | Fixture thêm/ẩn/đổi thứ tự dự án, case optional contribution/process; không sửa layout |
| Accessibility | Axe-core WCAG 2 A/AA và 2.1 A/AA không ghi nhận violation trên home và case phim sau reveal; kiểm tra bàn phím/menu/retouch bằng Playwright |

Các fixture chỉ được trình duyệt kiểm tra nhận qua route interception. Không thêm dự án minh họa hoặc video thử vào nội dung/`public/`; clip thử nằm trong `tests/fixtures/` và không được build vào website.

## Hiệu năng bản demo production

Đo với context mới, mobile viewport 390×844, production preview trên localhost, gzip, không giả lập mạng chậm hoặc throttling CPU. Placeholder SVG không đại diện dung lượng ảnh/video thật. Dữ liệu thô: [docs/performance.json](docs/performance.json).

| Chỉ tiêu | Kết quả quan sát | Budget trong kế hoạch |
| --- | --- | --- |
| JS initial gzip | 69.7 KB | ≤180 KB |
| CSS gzip | 5.0 KB | ≤35 KB |
| Transfer ban đầu, gồm HTML/fonts/media | 170.7 KB | khoảng ≤1.200 KB |
| Toàn homepage sau khi cuộn | 178.9 KB | khoảng ≤3.000 KB |
| LCP lab lần đo | 0.232 giây | ≤2,5 giây |
| CLS lab trong lần đo | 0.00078 | ≤0,1 |
| Request video trong demo | 0 | 0 |

Không tải gallery case trên homepage; chỉ gallery case đang mở được render/lazy load. Inter self-host hỗ trợ ký tự Việt; chữ nhỏ dùng màu đủ tương phản. Giá trị lab không chứng minh Core Web Vitals ngoài thực tế. Chưa đo INP/percentile 75 với người dùng thật; cần kiểm tra lại sau khi có media thật và hosting.

## Ảnh chụp bản chạy

- [Desktop — màn hình đầu](docs/screenshots/home-desktop.png)
- [Mobile — màn hình đầu](docs/screenshots/home-mobile.png)
- [Desktop — toàn homepage](docs/screenshots/home-desktop-full.png)
- [Mobile — toàn homepage](docs/screenshots/home-mobile-full.png)
- [Case phim](docs/screenshots/case-desktop.png)
- [Retouch mobile](docs/screenshots/retouch-mobile.png)

## Giới hạn và những bước chưa thực hiện

- Canva và hai tham khảo bị chặn proxy 403; nội dung theo kế hoạch, chưa đối chiếu lại bản Canva trực tiếp. Superdesign login cũng trả 403 nên không có bản thiết kế canvas; giao diện được thực thi trực tiếp theo brief.
- Media là placeholder, chưa xác nhận synopsis/role/client/process còn thiếu; xem CONTENT_TODO.
- Chưa kiểm thử Safari/iOS, Firefox hoặc thiết bị vật lý; video thật cần kiểm tra codec/playback khi cung cấp.
- Axe không thay thế kiểm tra toàn diện bằng screen reader; chưa test người xem thật về mục tiêu hiểu nghề trong 10–15 giây.
- Chưa triển khai hosting, domain, SEO prerender hoặc đo field metrics. SPA fallback đã chuẩn bị ở `public/_redirects`; hướng dẫn Netlify trong EDITING_GUIDE chưa phải một deployment đã được thực hiện.
- Đã lưu `install_script` và `start_skill` vào **bản nháp** cấu hình môi trường. Lưu draft không xuất bản website hoặc publish snapshot môi trường; chưa xác minh khôi phục trong tác vụ cloud mới.
