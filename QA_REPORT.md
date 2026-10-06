# Kiểm tra — 2026.10.06-motion-controls

Ngày 06/10/2026. Baseline source `c845f78`. Môi trường **Linux cloud**, Node.js 24.19.0, npm 11.9.0, Chromium 151.0.7922.173. Đây không phải kết quả chạy trên máy Windows của Hậu.

## Kết quả thực tế

- **47/47 kiểm tra trình duyệt đạt**, không skip; lần chạy cuối sau chỉnh nhịp intro và khôi phục reveal mất 1,6 phút. [Log](docs/test-results.txt).
- **Build đạt**: validator nội dung, TypeScript và Vite production. Sáu dự án hiển thị, 33 media entries, `mediaMode:demo`. [Log](docs/build-results.txt).
- **Audit đầy đủ: 0 lỗ hổng**, gồm dev dependencies. [JSON](docs/audit.json). Package và lockfile vẫn khóa Vite **7.3.6**, không cài thêm thư viện motion. Kết quả audit chỉ phản ánh registry tại thời điểm chạy.
- `dev` và `preview` tiếp tục bind **127.0.0.1**. Website chưa deploy.
- Đối chiếu Git: `profile.json`, `projects.json`, `media.json`, `public/media/`, package/lockfile, `site.json` và kế hoạch gốc không đổi. `ui.json` chỉ thêm ba nhãn công tắc. Không đổi vai trò, giải phim, credit hoặc thông tin dự án.
- `git diff --check` đạt.

## Motion được đo, không chỉ kiểm tra class

[Dữ liệu quan sát](docs/motion-check.json) lấy tại **1536×730**, Chromium báo OS reduced=true nhưng người xem đã chọn Reduce motion **Off**:

| Thao tác | Kết quả |
| --- | --- |
| Hover Work | Transform chữ nav từ `none` sang translateY khoảng **−22,39 px** |
| Cuộn y=1718 → 1968 → 2218 | Mặt thẻ từ scale 1 sang khoảng **0,986**, rồi **0,949**, kèm dịch/lùi và nghiêng nhẹ |
| Bật Reduce motion On | Transform về `none`, stack tắt, số animation đang chạy qua `document.getAnimations()` là **0** |
| Chiều cao thẻ tại 1536×730 | Cả sáu mặt thẻ cao **595 px**, vừa vùng dành cho stack |

[clip desktop 29,04 giây](docs/motion-preview/desktop.mp4) ghi tại 1536×730 và [clip mobile 19,88 giây](docs/motion-preview/mobile.mp4) ghi tại 390×844 có intro, công tắc, cuộn và tương tác. Không phải mockup. Video nằm trong tài liệu, không được tải trong portfolio.

## Phạm vi kiểm tra

| Nhóm | Đã kiểm tra |
| --- | --- |
| OS / lựa chọn web | Chưa chọn thì theo OS; On/Off đổi ngay; lựa chọn full hoạt động dù OS reduced; lưu qua reload/route, đồng bộ tab; OS đổi sau đó không ghi đè lựa chọn rõ ràng; bật đầy đủ lại giữ nguyên phần đang đọc và khôi phục reveal cho phần chưa xem |
| Storage / global config | Storage không ghi được vẫn đổi chế độ trong lượt xem; `enableMotion:false` tắt toàn site; giảm motion trong intro giải phóng giao diện |
| Laptop | Stack thực sự biến đổi khi cuộn tại **1366×768, 1536×730, 1366×650**; mọi thẻ vừa chiều cao. 1093×560 dùng normal flow; vẫn mở case được |
| Nội dung dài / resize | Kéo dài đoạn summary bằng fixture làm stack tự tắt, tránh che chữ; ResizeObserver đo lại khi kích thước thay đổi |
| Responsive | 320, 390, 430, 768, 1024, 1440 px; landscape 844×390; viewport 720×450 mô phỏng không gian CSS nhỏ; không tràn ngang. Đây không phải phép thử zoom OS vật lý |
| Intro | Handoff ảnh thực sự mở rộng; giữ tỷ lệ; Skip/Escape/Tab/Enter/tap, resize, kết thúc, không lặp tab, `?intro=1`, deep link đi thẳng |
| Cuộn / hover | Hero ảnh đổi transform, chữ/frame giữ trục; nav, badge theo pointer và mặt thẻ đổi vị trí thực; native scroll không bị chặn |
| Keyboard / touch | Focus các link Work không bị stack che; menu focus trap bao gồm công tắc; Space/Enter đổi mode, Escape thoát; Experience accordion và Retouch tap/hold/release/cancel |
| Case | Cả sáu route: mở, title/focus, refresh, Back/Forward, phục hồi vị trí; direct link, 404, click nhanh |
| Reduced | Bỏ intro, animated hover, CSS timeline, stack và morph; nội dung/links vẫn dùng được. Lớp motion tháo scroll/pointer listeners; full không chạy vòng RAF liên tục |
| Nội dung / cấu hình | Thêm/ẩn/đổi thứ tự dự án bằng JSON; tone panel/ảnh Contact/accordion qua config; tên Chuyến Đi Bất Ý / Chuyen Di Bat Y, credit và giải của phim đúng |
| Demo media | 0 video/source/iframe, 0 request video, kể cả khi fixture có URL video. Ảnh decode được, poster contain, retouch ảnh thật |
| Chế độ live tương lai | Fixture video có load/play/stop theo yêu cầu, pause preview khác, hover/leave/offscreen, reduced ngăn auto preview, fallback khi lỗi. Không đưa clip thử vào `public/` |
| Accessibility | Axe WCAG 2 A/AA, 2.1 A/AA không ghi nhận violation ở intro, home và case đại diện; kiểm tra bàn phím riêng. Không thay thế đánh giá screen reader toàn diện |
| Debug | Chỉ hiện khi `?motionDebug=1`; nhận biết release/viewport/OS/lựa chọn/motion thực, có Refresh/Close; không hiện trong giao diện thông thường |

## Hiệu năng lab

Production localhost, context mới 390×844, không throttle mạng/CPU. [Dữ liệu gốc](docs/performance.json).

| Chỉ tiêu | Lần đo cuối |
| --- | --- |
| JS initial gzip | **75,22 KB** |
| CSS gzip | **10,23 KB** |
| Transfer ban đầu gồm HTML/font/ảnh | **320,54 KB** |
| Toàn homepage sau cuộn | **493,22 KB** |
| CLS | **0,00748** |
| LCP ghi nhận | **0,200 giây**, có giới hạn do intro |
| Intro được quan sát kết thúc | **2,555 giây** sau navigation |
| Sau khoảng chờ reveal chủ ý | **3,660 giây**; không phải phép đo TTI |
| Request video | **0** |

LCP thấp không có nghĩa homepage đã hiện trong 0,200 giây: lần đầu có intro theo thời gian. Người xem có thể bỏ qua; quay lại cùng tab hoặc Reduced không chạy intro. Intro mới không animate width/height mỗi frame; CLS quan sát thấp hơn số đo cũ 0,06892, nhưng hai lượt lab riêng không chứng minh một tỷ lệ cải thiện cố định trên mọi máy. Chưa có field Core Web Vitals, INP, benchmark FPS, pin hoặc mạng Windows thực tế. Bật giảm chuyển động giảm công việc animation, không làm nhỏ file ảnh.

## Kiểm tra gói ZIP

Giải nén ZIP vào thư mục sạch, chạy `npm ci`, `npm audit`, `npm run build`, `npm run dev` và `npm run preview` trên cloud. [Báo cáo kết quả](docs/zip-validation.json). Kiểm tra thêm trình duyệt tại dev 5177/preview 4177: phiên bản, công tắc với OS reduced, stack 1536×730, mở/refresh case phim, không lỗi JS/tải tài nguyên hoặc request video. Bundle JS/CSS từ source giải nén được đối chiếu với build của repository.

Sau kiểm tra chỉ hoàn thiện tài liệu bàn giao rồi đóng ZIP lại; hash của toàn bộ 133 file runtime/config/media được giữ nguyên so với source đã giải nén để kiểm tra. ZIP không chứa `node_modules`, `dist`, `.git`, secret hoặc bản MP4 tham khảo của NBNZIA.

## Tham khảo và phần còn cần xác nhận

- **NBNZIA live đã xem được**: intro, hero, about, services click/hover, panel cuộn, process, menu mobile; [bảng đối chiếu có bằng chứng](docs/NBNZIA_COMPARISON.md). Request nền Turnstile/PAT còn lỗi nhưng không ngăn các thao tác khảo sát; chưa thử gửi form hoặc mọi link ngoài.
- Chrome Windows trước đó đã được Hậu xác nhận intro/hover chạy sau khi bật animation của Windows. **Bản ZIP mới và công tắc riêng cần Hậu kiểm tra lại trên máy mình**; kết quả cloud không xác nhận thay cho máy Windows.
- Chưa kiểm thử Safari/iOS, Firefox hoặc điện thoại vật lý.
- Nội dung/ảnh giữ theo PDF đã xử lý ở vòng trước; [nguồn PDF](docs/PDF_SOURCE_MAP.md). Poster và một số ảnh vẫn có giới hạn của nguồn PDF; film/TCV còn thiếu gallery riêng. [Danh sách cần bổ sung](CONTENT_TODO.md) giữ cho round nội dung sau.
- Chưa deploy, cấu hình domain hoặc kiểm tra hosting thật. Hướng dẫn trong [EDITING_GUIDE](EDITING_GUIDE.md) chuẩn bị cho lúc người dùng quyết định xuất bản.
