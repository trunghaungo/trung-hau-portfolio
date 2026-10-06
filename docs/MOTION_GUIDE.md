# Vòng chỉnh layout và chuyển động — 06/10/2026

Vòng đối chiếu NBNZIA mới giữ nguyên `profile.json`, `projects.json`, `media.json`, `ui.json` và toàn bộ ảnh trong `public/media/` so với bản motion `0a50a4f`. Nhãn “Skip intro” đã có từ vòng trước. Nội dung/ảnh sẽ tiếp tục được chỉnh ở round sau theo yêu cầu của Hậu. Xem [bảng phân tích, đối chiếu 15 hạng mục và ảnh trước/sau](NBNZIA_COMPARISON.md).

## Đã xem gì trong clip tham khảo

Đã xem clip đính kèm 80,6 giây (1920×970, 30 fps), gồm các khung cách 0,5 giây ở intro và dày hơn tại đoạn work. Đây là tham khảo chuyển động, không phải media portfolio. Khung tham khảo và file gốc không nằm trong source hoặc website.

| Đoạn gần đúng | Quan sát | Cách dùng trong HEW |
| --- | --- | --- |
| 0–1,5 giây | Tên xuất hiện theo từng phần từ sau lớp che | TRUNG HAU hiện theo chữ trên nền kem, dấu khung cam và HEW nhỏ |
| 1,5–5 giây | Media chen giữa tên rồi mở rộng; tên rời màn hình | Ảnh chen giữa TRUNG và HAU rồi mở tới đúng vị trí hero; tên mờ/dịch lên, nền tan để ảnh nối vào giao diện; không chèn video |
| 5–7 giây | Chữ tập hợp thành heading | Tiêu đề xuất hiện qua mask theo từ, giữ vị trí dòng và nội dung nguyên vẹn |
| 24–29 giây | Các hàng service có thay đổi nội dung/hình khi tương tác | Experience mở/đóng phạm vi công việc; tên/vai trò/thời gian hiện sẵn. Work giữ phản hồi ảnh và dấu “Open project” theo chuột |
| 31–36, 47–51 giây | Chữ lớn di chuyển ngang/uốn theo cuộn | Heading Work lớn, dòng thứ hai dịch ngang ngắn trên desktop; giữ nguyên câu chữ, không uốn body text |
| 37–46 giây | Panel dự án tiếp theo phủ lên panel trước | Stack bằng sticky native trên desktop đủ cao; tấm phía sau lùi/tối nhẹ; panel luân phiên kem/đen/cam |
| 53–57 giây | Ba thẻ quy trình xếp lệch, thay đổi góc khi cuộn | Plan / Produce / Finish có khung thẻ, vào vị trí với góc nghiêng nhỏ |
| 62–76 giây | Contact chữ lớn, email/nút đổi trạng thái khi hover | Contact nền tối, ảnh nhỏ nối hero; hover từ/email chuyển cam, ảnh nghiêng nhẹ, arrow phản hồi; nav trượt chữ, nút quét màu |

Các mốc chỉ giúp đối chiếu clip, không phải đo timing chính xác của site gốc. Clip không thể hiện rõ chuyển trang case; cover morph/fade vẫn là cách riêng đã có ở HEW.

## Cách xem bản mới

1. Chạy `npm ci`, rồi `npm run dev` như README. Mở địa chỉ Local, thường là `http://127.0.0.1:5173`.
2. Lần đầu mở homepage trong một tab: intro chạy khoảng **2,4 giây** rồi giao diện hiện. Có nút **Skip intro**, dùng được bằng chuột/tap/Tab + Enter; Escape cũng bỏ qua.
3. Để xem lại ngay trong cùng tab, mở `http://127.0.0.1:5173/?intro=1` (thay cổng nếu Vite dùng cổng khác). Link này chỉ phục vụ review, không bật video hay xuất bản site.
4. Cuộn tới Work trên desktop: các panel đi lên phủ nhau. Đưa chuột vào khung ảnh để thấy badge đi theo, bấm để mở case, rồi Back để kiểm tra vị trí trở về.
5. Trong About, bấm tên công ty ở Experience để mở phạm vi công việc; thử Tab + Enter/Space và Escape. Cuộn tới Approach/Contact, thử hover nav, CTA và email. Mobile dùng tap, menu mở lớp phủ với link lớn; không có badge đi theo chuột hay stack chồng thẻ.
6. Nếu máy đang bật giảm chuyển động, intro/stack/mask/hover movement được bỏ qua. Đây là hành vi chủ ý. Link case hoặc `/#work`, `/#about`, `/#contact` mở trực tiếp cũng không bị intro chặn.

Intro là đoạn mở đầu theo thời gian, không phải thanh % tải giả và không đợi download video. Intro mặc định chỉ chạy một lần trong mỗi phiên tab; tải lại cùng tab không lặp, trừ khi có `?intro=1`. Quay về từ case không lặp. Khi bộ nhớ phiên không dùng được, intro vẫn tự kết thúc và mọi thao tác vẫn hoạt động.

## Tự chỉnh hiệu ứng bằng config

Mở **`src/config/motion.json`** trong VS Code. Chỉ sửa giá trị bên phải, lưu rồi xem lại demo:

| Trường | Hiện tại | Cách đổi |
| --- | --- | --- |
| `intro.enabled` | `true` | `false` để bỏ riêng màn mở đầu |
| `intro.durationMs` | `2400` | Tổng thời gian intro, đơn vị mili giây; 1000 ms = 1 giây. Cho phép 1800–4000; khuyên giữ 2400 |
| `intro.oncePerSession` | `true` | `false` nếu muốn intro ở mỗi lần tải homepage; link section/case vẫn đi thẳng |
| `intro.imageHandoff` | `true` | `false` để trở về intro tên đơn giản, không có ảnh mở giữa tên |
| `stackProjects` | `true` | `false` để Work luôn là danh sách thường |
| `pointerFollow` | `true` | `false` để badge giữ vị trí cố định trong ảnh |
| `revealDurationMs` | `760` | Thời gian fade/dịch của block, cho phép 100–1500; mask heading có timing riêng trong CSS |
| `sectionDrift` | `true` | `false` để dòng thứ hai của heading Work không dịch ngang |

Để tắt toàn bộ motion, mở **`src/config/site.json`**, đặt `enableMotion` thành `false`. Tùy chọn giảm chuyển động của hệ điều hành luôn được ưu tiên. Nhãn nút Skip intro ở `src/content/ui.json`; tên intro lấy tự động từ `profile.name`, viết hoa bằng giao diện.

Sau khi đổi config, chạy `npm run check:content` rồi `npm run build`. Cách cập nhật website sau này vẫn theo EDITING_GUIDE; bước này chưa deploy.

Trong **`src/config/presentation.json`**, đổi `projectTones` để chọn nhịp nền `paper`/`ink`/`accent`; danh sách lặp theo thứ tự các dự án đang hiện. `contactImage:false` ẩn ảnh nhỏ Contact; `experienceAccordion:false` hiện toàn bộ mô tả kinh nghiệm. Ví dụ từng bước trong [EDITING_GUIDE](../EDITING_GUIDE.md#đổi-cách-trình-bày-mà-không-sửa-code). Intro/hero/Contact cùng dùng mã `heroMediaId` và ảnh trong media config, nên thay một nguồn sẽ cập nhật đồng thời.

## Điều kiện và giới hạn

- Stack chỉ bật khi màn hình rộng từ 1024 px, cao từ 760 px và chuột hỗ trợ hover. Màn hình thấp, tablet/touch/mobile dùng luồng dọc thường.
- Khi focus bàn phím nằm trong Work, stack trở về luồng thường để link phía sau không bị che. Focus và thứ tự đọc giữ theo thứ tự dự án.
- Cuộn native, không chặn wheel/touch, không thư viện smooth-scroll. Chỉ tính vị trí trong animation frame khi có scroll/resize/pointer; không chạy vòng lặp nền liên tục.
- Ảnh hero dịch trong frame bằng CSS scroll timeline nếu trình duyệt hỗ trợ; nơi không hỗ trợ giữ ảnh bình thường. Frame/chữ không phóng theo scroll. Intro dùng Web Animations API để nối khung ảnh; resize giữa intro sẽ bỏ qua để tránh đích cũ sai kích thước.
- Desktop hỗ trợ View Transition API dùng cover morph vào case; fallback/mobile dùng fade. Chưa kiểm thử Safari/iOS, Firefox hoặc thiết bị vật lý.
- Intro tạo thêm khoảng chờ trước giao diện chính; chỉ số LCP đơn lẻ có thể phản ánh nội dung intro, không diễn tả đúng thời điểm người xem bắt đầu đọc homepage. Báo cáo QA ghi riêng thời điểm intro kết thúc và giao diện đã ổn định.

## Preview chuyển động

Có [intro dạng GIF](motion-preview/intro.gif), [clip desktop 26,0 giây](motion-preview/desktop.mp4) và [clip mobile 18,7 giây](motion-preview/mobile.mp4). Trong thư mục `docs/motion-preview/` có bản ghi của **website HEW đang chạy**, ảnh intro/handoff, stack/hover, Experience, Approach, Contact và menu mobile. Clip desktop có mở case rồi Back về Work. Các video này là tài liệu bàn giao, không nằm trong `public/`, không được tải khi xem portfolio và không phải video tác phẩm.

Để tạo lại bản ghi: cài browser/encoder Playwright bằng `npx playwright install chromium ffmpeg`, giữ `npm run preview -- --port 4175 --strictPort` chạy trong một Terminal, rồi chạy `node scripts/capture-motion.mjs` ở Terminal khác. Script xuất WebM; bản MP4 trong bộ bàn giao được chuyển từ bản ghi này để tiện mở trên Windows. Công cụ cloud dùng Chromium và FFmpeg có sẵn vì CDN Playwright bị chặn; việc này chỉ ảnh hưởng công cụ ghi preview, không ảnh hưởng website.
