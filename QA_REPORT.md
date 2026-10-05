# Báo cáo kiểm tra — Trung Hau / HEW

Ngày bàn giao: 06/10/2026 (Asia/Saigon). Môi trường: Node.js 24.19.0, npm 11.9.0; Chromium 151.0.7922.173; React 19.2.0, TypeScript 5.9.3, Vite 7.3.6.

## Kết quả

- Ở bước cập nhật kỹ thuật trước, repository dùng Vite **7.2.2** và dev/preview bind `0.0.0.0`. Đã đổi sang **7.3.6** exact và **127.0.0.1** trong scripts/config; cập nhật lockfile.
- Ở bước kỹ thuật trước, `npm ci` cài lại từ lockfile mới thành công; `npm ls vite` xác nhận 7.3.6. Bước bổ sung PDF giữ nguyên package/lockfile và cấu hình localhost; build hiện tại dùng Vite 7.3.6. Kế hoạch gốc giữ nguyên.
- `npm run check:content`: thành công — sáu dự án đang hiện, 33 media entries (26 entries ảnh thật, gồm một alias), chế độ `demo`.
- `npm run build`: thành công — kiểm tra nội dung, TypeScript và bundle production.
- `CI=1 npm test`: **30/30 kiểm tra qua**, không skip (58,6 giây), sau khi bổ sung PDF và build. Sau chỉnh ghi chú/cách capture, chạy lại hai kiểm tra ảnh PDF và thêm/ẩn/đổi thứ tự bằng JSON: **2/2 qua** (8,8 giây); build và capture cuối thành công. Log thực tế của hai lần chạy: [docs/test-results.txt](docs/test-results.txt).
- Build log: [docs/build-results.txt](docs/build-results.txt).
- **`npm audit` đầy đủ, gồm dev dependencies: 0 lỗ hổng** ở thời điểm chạy, không dùng `--omit=dev`. JSON: [docs/audit.json](docs/audit.json). Đây là kết quả advisory registry ở lần kiểm tra, không phải cam kết mọi vấn đề an ninh tương lai.
- Dev 5173 và preview 4175 đã chạy thực tế; socket lắng nghe tại **127.0.0.1**. Các server test 4173/5174 cũng dùng localhost.
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
| Giảm motion | `prefers-reduced-motion` và `enableMotion:false` đều tắt animation, không che nội dung; điều hướng/nút vẫn dùng được |
| Scroll frame | Frame mở nhẹ trong trình duyệt hỗ trợ; scrollY theo yêu cầu native và chiều rộng/trục ngang đoạn chữ không đổi; reduced motion bỏ crop/animation |
| Demo video | Không video/source/iframe hoặc request video trên demo; kể cả khi test cung cấp preview/full-video qua fixture |
| Video live | Clip WebM thử trong Chromium: load theo yêu cầu, muted/playsInline cho preview, dừng preview khác, hover/rời card, dừng khi card ngoài viewport, reduced motion bỏ auto preview, full player controls, giữ poster/link file khi lỗi |
| Ảnh từ PDF | Decode ảnh homepage và poster phim, đường dẫn và tỷ lệ cặp retouch thật; poster dùng `contain`, không crop thêm trong giao diện; không có badge placeholder ở các mục đang hiển thị |
| Media lỗi | Abort cover request: hiện fallback, giữ link mở case |
| Nội dung cấu hình | Fixture thêm/ẩn/đổi thứ tự dự án, case optional contribution/process; không sửa layout. Tên Chuyến Đi Bất Ý + Chuyen Di Bat Y và mô tả giải thuộc phim được kiểm tra |
| Accessibility | Axe-core WCAG 2 A/AA và 2.1 A/AA không ghi nhận violation trên home và case phim sau reveal; kiểm tra bàn phím/menu/retouch bằng Playwright |

Các fixture chỉ được trình duyệt kiểm tra nhận qua route interception. Không thêm dự án minh họa hoặc video thử vào nội dung/`public/`; clip thử nằm trong `tests/fixtures/` và không được build vào website.

## Hiệu năng bản demo production

Đo với context mới, mobile viewport 390×844, production preview trên localhost, gzip, không giả lập mạng chậm hoặc throttling CPU. LCP ban đầu lấy tại mốc 700 ms sau khi font sẵn sàng; không dùng cuộn tự động để tuyên bố LCP thực tế. Phép đo hiện dùng ảnh WebP đã trích từ PDF; chưa đại diện video thật hoặc mạng/hosting thực tế. Dữ liệu thô: [docs/performance.json](docs/performance.json).

| Chỉ tiêu | Kết quả quan sát | Budget trong kế hoạch |
| --- | --- | --- |
| JS initial gzip | 71.5 KB | ≤180 KB |
| CSS gzip | 5.4 KB | ≤35 KB |
| Transfer ban đầu, gồm HTML/fonts/media | 311.9 KB | khoảng ≤1.200 KB |
| Toàn homepage sau khi cuộn | 484.6 KB | khoảng ≤3.000 KB |
| LCP lab lần đo | 0.224 giây | ≤2,5 giây |
| CLS lab trong lần đo | 0.00099 | ≤0,1 |
| Request video trong demo | 0 | 0 |

Không tải gallery case trên homepage; chỉ gallery case đang mở được render/lazy load. Inter self-host hỗ trợ ký tự Việt; chữ nhỏ dùng màu đủ tương phản. Giá trị lab không chứng minh Core Web Vitals ngoài thực tế. Chưa đo INP/percentile 75 với người dùng thật; cần kiểm tra lại sau khi có video/media cuối và hosting.

## Ảnh chụp bản chạy

- [Desktop — màn hình đầu](docs/screenshots/home-desktop.png)
- [Mobile — màn hình đầu](docs/screenshots/home-mobile.png)
- [Desktop — toàn homepage](docs/screenshots/home-desktop-full.png)
- [Mobile — toàn homepage](docs/screenshots/home-mobile-full.png)
- [Work desktop](docs/screenshots/work-desktop.png) và [work mobile](docs/screenshots/work-mobile.png)
- [Case phim desktop](docs/screenshots/case-desktop.png) và [case phim mobile](docs/screenshots/case-mobile.png)
- [Retouch mobile](docs/screenshots/retouch-mobile.png)

## Giới hạn và những bước chưa thực hiện

- Đã đọc video tham khảo NBNZIA dài 80,6 giây trước triển khai motion; phân tích và quyết định ở [docs/DESIGN_NOTES.md](docs/DESIGN_NOTES.md). Video tham khảo không có trong website.
- **PDF mới đã đọc/trích chữ và ảnh riêng**: `Bản sao của Portfolio Trung Hau (1).pdf`, 44 trang, khoảng 26,7 MiB. Ưu tiên phần biên tập trang 1–14; Archive chỉ bổ sung poster và ảnh khác được chọn, tránh trùng nội dung. File trước trên 32 MiB từng bị công cụ tải từ chối; bản mới giải quyết việc này. Bảng trang/xref/crop/hash: [docs/PDF_SOURCE_MAP.md](docs/PDF_SOURCE_MAP.md), manifest JSON bên cạnh. Không đưa PDF nguyên bản vào website.
- Canva và NBNZIA trực tiếp bị proxy chặn 403; nội dung đã đối chiếu thêm PDF mới và yêu cầu cập nhật. Superdesign login trả 403, không có canvas; giao diện được chỉnh trực tiếp trong repository.
- Các mục đang hiển thị dùng ảnh/thumbnail thật từ PDF; poster phim trích từ collage nên có giới hạn độ nét/crop của nguồn. Film/TCV chưa có stills riêng, gallery để trống. Chưa xác nhận synopsis/role/client/process còn thiếu; xem [CONTENT_TODO](CONTENT_TODO.md). Placeholder dự phòng còn trong config/public nhưng không hiển thị mặc định.
- Chưa kiểm thử Safari/iOS, Firefox hoặc thiết bị vật lý; video thật cần kiểm tra codec/playback khi cung cấp.
- Axe không thay thế kiểm tra toàn diện bằng screen reader; chưa test người xem thật về mục tiêu hiểu nghề trong 10–15 giây.
- Chưa triển khai hosting, domain, SEO prerender hoặc đo field metrics. SPA fallback đã chuẩn bị ở `public/_redirects`; hướng dẫn Netlify trong EDITING_GUIDE chưa phải một deployment đã được thực hiện.
- Đã lưu `install_script` và `start_skill` vào **bản nháp** cấu hình môi trường. Lưu draft không xuất bản website hoặc publish snapshot môi trường; chưa xác minh khôi phục trong tác vụ cloud mới.
