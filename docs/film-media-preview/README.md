# Chuyến Đi Bất Ý — media / album, 08/10/2026

[Desktop preview](desktop.mp4), [Mobile preview](mobile.mp4). Video ghi bản chạy Chromium/Linux: hover/chủ động phát preview, mở case, phát trailer dưới Overview, xem album. Desktop có cuộn xuống/ngược lên, nút và keyboard tới ảnh cuối; mobile có vuốt thật bằng touch event Chromium và nút Next. Clip review chỉ nằm trong docs, không phải asset website; recorder không thu âm.

## Media được dùng

- `01_Anh_bia.png`: banner WebP + variants 480/960/1920. Poster dọc cũ đã gỡ khỏi source và giao diện.
- MP4 người dùng gửi: giữ nguyên tại `public/media/work/chuyen-di-bat-y/trailer.mp4` (30,037 giây, H.264/AAC, 1024×576, 6.800.606 B).
- Preview tạo từ giây 3–11 của MP4: `preview.mp4`, 8 giây, 768×432, H.264, không audio, khoảng 695 kB; hover desktop sau 220 ms, mobile/keyboard/reduced có nút chủ động.
- 02–13: đúng 12 ảnh theo thứ tự. Một số file là ảnh ghép có chữ và tỷ lệ khác 16:9; giữ contain/tỷ lệ, không cắt chữ, thêm bản responsive. Bấm ảnh mở bản 1920 px để đọc chi tiết.
- B01/B02/B03 không thêm vào album vì người dùng yêu cầu 02–13; tránh trùng nhân vật/title đã có.
- M3u8 đã bỏ theo xác nhận người dùng: không đưa playlist/URL Adobe có hạn dùng/token vào public hoặc repo.

## Cấu hình và scope

Media/source tập trung trong `media.json`; riêng dự án phim thêm `trailerMediaId`, `galleryLayout: "scroll"`, `galleryTitle`, danh sách `galleryMediaIds` vào projects.json. Caption/alt mô tả trung tính dựa trên file; không thêm vai trò/khách hàng/thành tích. UI labels mới nằm trong ui.json. Bio và năm/DoP/award/slug/order/visibility của phim giữ nguyên; năm dự án khác giữ nguyên dữ liệu/media/layout. Intro/hero text và package/lockfile/localhost bind giữ nguyên.

Site chuyển mediaMode live/hover true để các URL phim hoạt động; các dự án khác chưa có URL video nên vẫn chỉ ảnh. Demo mode vẫn được kiểm tra 0 video/request ngay cả fixture có URL. Trailer chỉ mount player sau Play trailer; preview dừng khi leave/offscreen/tab hidden hoặc reduced bỏ auto. Nút preview đo vị trí để nằm trên banner mà không tăng chiều cao thẻ/ảnh hưởng stack laptop.

ScrollAlbum opt-in trong case template chung: desktop fine pointer rộng ≥1024 và stage còn ≥480 px mới pin; vertical native scroll điều khiển transform ngang. Không chặn wheel/touch, không đổi scroll engine/dependency. Cửa sổ thấp/mobile/reduced/RO lỗi là native horizontal rail + nút/keyboard. Mode/resize cleanup giữ ảnh đang xem và trả trang bình thường. [Số đo](measurements.json), [resize/idle](resize-idle.json), [QA](../../QA_REPORT.md).

## Quay lại / giới hạn

Build, chạy production preview localhost 4176 rồi `PLAYWRIGHT_BROWSERS_PATH=/tmp/hew-playwright node scripts/capture-film-review.mjs` (FFmpeg hệ thống qua registry path đã chuẩn bị ở vòng intro). Có thể đặt PORTFOLIO_PREVIEW_URL. Đây là cloud Chromium/touch emulation, chưa phải Windows/iPhone thật hoặc mạng Internet thật. Chưa deploy và không đóng ZIP vòng này.
