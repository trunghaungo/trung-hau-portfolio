# Hero text — 08/10/2026

Chỉ cập nhật chuyển động đoạn tagline ngay dưới hero, không đổi chữ/ảnh/layout/credit. Xem clip tham khảo do người dùng gửi `hero-text-nbnzia.mp4` (11,47 giây): chữ xuất hiện dần theo scroll, có màu nhấn tại đoạn đang hiện, cuộn ngược lùi lại. Không tuyên bố cấu trúc DOM/thư viện của NBNZIA và không đưa clip tham khảo vào public assets.

- [Desktop preview](desktop.mp4): 1440×900, 10,40 giây.
- [Mobile preview](mobile.mp4): Chromium touch emulation 390×844, 9,76 giây.
- Mỗi clip bỏ qua intro bằng Skip thật, cuộn native xuống rồi ngược lên; không ép timeline hoặc chỉnh class để diễn hiệu ứng. PNG down/up/full chụp trực tiếp giữa hai lượt cuộn.
- [Số đo thực](motion-measurements.json): 0 page errors; progress desktop 0 → .571 → 1 → .571 → 0, mobile 0 → .537 → 1 → .537 → 0. Partial có 5 từ hoàn toàn hiện; full có cả 10 từ. Opacity chi tiết lưu trong JSON.

Reuse `ReadingText` và scroll/RAF driver hiện có. Mỗi từ fade 0→1 với dải accent hiện tại #f04b32, sau đó về ink #171717; không transform chữ/reflow, không thêm dependency, observer hay vòng RAF. Đo theo vị trí đoạn văn; cuối câu hoàn tất khi đoạn vẫn nằm thoải mái trong viewport. Bỏ one-shot reveal ở wrapper hero-copy để không cộng chuyển động một lần vào scrub hai chiều. Metadata bên trái và note bên dưới giữ hiển thị tĩnh.

Chỉ kích hoạt opacity khi driver đo thành công (`data-reading-active`). Reduced/global-off/observer lỗi giữ toàn bộ chữ đọc được; cleanup khi đổi mode/route/unmount. Nội dung vẫn lấy từ profile.json, không có bản sao hoặc chữ hardcode mới. Font/màu/spacing/các phần ngoài block giữ nguyên.

Quay lại trên cloud: `npm run build`, chạy production preview localhost port 4176, rồi `PLAYWRIGHT_BROWSERS_PATH=/tmp/hew-playwright node scripts/capture-hero-text.mjs`. Registry FFmpeg trong /tmp dùng bản hệ thống đã chuẩn bị từ vòng intro; không đổi package/lockfile. Có thể dùng `PORTFOLIO_PREVIEW_URL` cho port khác. Chưa kiểm tra Windows hoặc điện thoại thật, chưa deploy, không đóng ZIP vòng này.
