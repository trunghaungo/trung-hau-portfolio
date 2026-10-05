# Bổ sung PDF — 06/10/2026

- Đã đọc bản PDF mới 44 trang; ưu tiên phần biên tập trang 1–14, đối chiếu Archive mà không lặp các trang cũ trên website. Bản mới giải quyết giới hạn tải file trước.
- Trích ảnh nhúng riêng, chuyển WebP và tạo variant responsive: BTS hero/About, poster phim, thumbnail TCV/Music/Social/Sabina/Tara, ảnh Juno Hair/Site Tour, portrait và cặp BEFORE/AFTER thật. 25 lựa chọn ảnh tạo 26 media entries thật (có một alias); không dùng nguyên trang PDF làm giao diện.
- Bổ sung bio, phạm vi experience và quy trình Plan/Produce/Finish có nguồn. TCV được mô tả trung tính là concept shot list/reference 2024; không tự gán khách hàng, vai trò hoặc kết quả.
- Giữ tên Chuyến Đi Bất Ý / Chuyen Di Bat Y; giải Best Cinematography HUGFIA 2023 thuộc phim, credit DoP riêng. Poster lấy từ collage Archive; không dùng footage khác làm film still. Film/TCV gallery để trống chờ ảnh riêng.
- Media config thêm `objectFit` và `frameAspectRatio` để giữ poster/thumbnail dọc; experience có mô tả tùy chọn. Validator kiểm tra cả đường dẫn `srcSet`. Hướng dẫn chỉ rõ phải xóa/cập nhật variant cũ khi thay một ảnh.
- Thêm bảng nguồn PDF và manifest page/xref/crop/hash; cập nhật danh sách cần bổ sung, ảnh preview và số đo với ảnh thật. Giữ layout, motion, bàn phím/reduced motion và cấu trúc thêm video sau này.
- Vite giữ 7.3.6, localhost mặc định. Audit đầy đủ 0 lỗ hổng; build qua; 30/30 kiểm tra trình duyệt và 2/2 kiểm tra tập trung cuối qua. Demo tải 0 video; chưa xuất bản website.

## Bản cập nhật layout và kỹ thuật trước đó — 06/10/2026

- Vite trong repository thực tế là 7.2.2, khác bản Windows đã sửa. Đã khóa 7.3.6 và cập nhật lockfile; giữ các dependency cấp cao khác.
- Dev và production preview mặc định chỉ lắng nghe `127.0.0.1`, cả trong npm scripts và Vite config.
- Hero có tên lớn, nghề và phạm vi công việc đọc ngay; work đổi từ grid bất đối xứng thành các hàng dự án với cover lớn, credit luôn hiện. Case giữ một mẫu chung, có heading lớn và số thứ tự.
- Đã phân tích video NBNZIA trước khi triển khai: dùng khoảng nghỉ, trục canh và sự nối tiếp giữa các chương; mở khung ảnh nhẹ khi cuộn, hover nhẹ, cover morph vào case với fallback. Giữ tap/hold, keyboard và reduced motion.
- Tên chính Chuyến Đi Bất Ý; tên phụ Chuyen Di Bat Y. Giải của phim Best Cinematography tại HUGFIA 2023 (HUTECH Graduation Film Award) được phân biệt với vai trò Director of Photography.
- Nội dung, thứ tự/ẩn/hiện, contact, media và nhãn vẫn sửa trong JSON. Thêm tên phụ/ngôn ngữ tên và mô tả giải tùy chọn; cập nhật kiểm tra nội dung và hướng dẫn.
- Ảnh preview desktop/mobile mới, script tạo lại preview, báo cáo audit đầy đủ và kiểm tra trình duyệt.
- PDF đính kèm vượt giới hạn truyền 32 MiB, chưa đọc/trích ảnh. Canva và NBNZIA trực tiếp bị proxy chặn. Giữ nội dung có nguồn từ kế hoạch, giữ placeholder và danh sách thiếu; không thêm thông tin dự án chưa xác nhận.
- Chưa xuất bản website lên Internet.
