# Intro / Hero — 08/10/2026

Preview từ bản chạy Chromium/Linux, không phải mockup. Desktop 1440×900; mobile 390×844 có touch emulation. Mỗi MP4 ghi lần mở trang rồi reload để thấy intro chạy lại. Không đưa clip tham khảo vào public assets.

- [Desktop](desktop.mp4), [Mobile](mobile.mp4).
- Ảnh `*-photo-1/2/3.png` chụp ở các mốc timeline có kiểm soát, để xem từng ảnh rõ; MP4 chạy thời gian thực, không pause timeline.
- Ba ảnh do người dùng gửi: `intro.jpg` → `intro-2.JPG` → `hero.JPG`. EXIF orientation được xử lý, xuất WebP; giữ file gốc trong upload, không cần đưa ảnh gốc 6000 px lên website.
- Hai ảnh mở đầu khoảng 57.2/42.3 kB; hero 67.9 kB (480/960 px: 11.1/27.2 kB). Không tải video/GIF để tạo intro.
- Thời lượng 3400 ms, không replay khi điều hướng nội bộ/Back; reload homepage replay, còn case/hash link và reduced bypass. Reload homepage ở vị trí cuộn cũ trở về hero nếu intro đang chạy.
- Skip/Escape/resize/reduced/API/ảnh lỗi giải phóng overlay, inert và khóa cuộn. Geometry cố định; chỉ transform/clip/opacity; giữ gutter khi khóa để tránh đổi chiều rộng khi bàn giao.
- Hai mã ảnh mở đầu: `src/config/motion.json` → `intro.mediaIds`; ảnh cuối: `src/config/site.json` → `heroMediaId`. Đường dẫn và responsive variants: `src/content/media.json`. Contact giữ ảnh cũ qua `contactMediaId`.
- Quay lại: build, chạy preview port 4176, `node scripts/capture-intro-review.mjs`. Cần Chromium và bộ ghi FFmpeg của Playwright; cloud vòng này dùng FFmpeg hệ thống qua registry path `/tmp/hew-playwright/ffmpeg-1011/ffmpeg-linux` vì CDN trả 403. `PLAYWRIGHT_BROWSERS_PATH=/tmp/hew-playwright node scripts/capture-intro-review.mjs`. Không sửa package/lockfile.

Chưa thử trên Windows/điện thoại thật trong vòng này, chưa deploy, chưa đóng ZIP theo yêu cầu. Các clip chỉ để duyệt intro/hero.
