# Bằng chứng kiểm tra refinement

- `before/`: build/test/performance vừa chạy trên checkout sạch `0bb99d4` trước khi sửa, không sao chép số47/47 từ báo cáo cũ.
- `comparison.json`: đối chiếu baseline đó với release `2026.10.06-layout-refinement`; đơn vị byte, CLS và ms.
- `runtime-sha256.json`: hash133 file runtime của source đã build/test và bản ZIP đã giải nén. Tài liệu/ảnh/clip có thể được hoàn tất sau mà không thay runtime.
- `zip-*.txt`, `zip-audit.json`, `zip-smoke.json`: cài/build/audit và mở trình duyệt từ thư mục giải nén mới, dùng dependencies riêng.
- Số đo cuối ở `../performance.json`, `../motion-check.json`; ảnh ở `../screenshots/`, clip ở `../motion-preview/`. Các resource này không nằm trongpublic và không tải trong website.

Lặp kiểm tra trên môi trường có Chromium/Playwright:

```sh
npm run build
npm test
npm run preview -- --port 4180 --strictPort
```

Giữ preview mở, dùng một Terminal khác, chạy tuần tự:

```sh
node scripts/review-performance.mjs
node scripts/review-motion.mjs
```

Các script lấy repository từ vị trí của script, mặc định dùnglocalhost4180. Có thể đổi bằng `PORTFOLIO_PREVIEW_URL`, `REVIEW_OUTPUT`, `REVIEW_MOTION_OUTPUT`. Không chạy test hay recording đồng thời với phép đo performance nếu muốn đối chiếu. Hai script không sửa nội dung/manifest/config.

Baseline và source mới dùng cùng quy trình3 context mới/viewport. Sau6 mẫu performance, phần chụp ảnh từng project trở về đầu trang trước khi định vị thẻ để không lấy nhầm hình học sticky đang bị ghim. Việc sửa thao tác chụp này không thay quy trình lấy mẫu. JSON baseline ở đây giữ số đo và bỏ danh sách ảnh không đóng kèm; mô tả transfer đã được làm rõ theo encoded/decoded thực tế, không thay dữ liệu mẫu.

Đọc [QA_REPORT](../../QA_REPORT.md) để xem giới hạn Windows, CLS/LCP, network transfer và những regression đã sửa.
