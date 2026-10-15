> Cập nhật 06/10/2026: phần ghi chú dưới đây mô tả vòng trước. NBNZIA live hiện đã truy cập và khảo sát được; xem [bảng đối chiếu hiện tại](NBNZIA_COMPARISON.md). Bản `2026.10.06-motion-controls` giữ nguyên nội dung/ảnh và có công tắc Reduce motion, stack đo theo chiều cao thực, bố cục tiêu đề dự án rộng.

# Bản cập nhật thiết kế — Trung Hau / HEW

**Cập nhật 06/10/2026:** hướng triển khai motion hiện tại nằm ở [MOTION_GUIDE](MOTION_GUIDE.md), thay thế các timing/lựa chọn motion ghi dưới đây của vòng layout trước. Theo yêu cầu mới, đã thêm intro tên, stack work và hover rõ hơn; nội dung/ảnh được khóa lại. Các ghi chú bên dưới được giữ để theo dõi quyết định của vòng trước.

## Nguồn đã đọc và giới hạn

Đã đọc code hiện có và `Trung_Hau_Portfolio_Website_Execution_Plan.md`. Yêu cầu mới của người dùng được ưu tiên khi khác kế hoạch cũ.

- `Tham khao template website.mp4`: tải và phân tích được. Video 1920×970, 30 fps, dài khoảng 80,6 giây. Xem các khung xuyên suốt video và khung dày hơn ở intro/phần work trước khi triển khai chuyển động. Đây là tài liệu tham khảo; không đưa video hay các khung trích từ video vào `public/`, bundle hoặc dự án của Hậu.
- Bản PDF đầu vượt giới hạn truyền **32 MiB**. **Đã giải quyết bằng `Bản sao của Portfolio Trung Hau (1).pdf`**: đọc đủ 44 trang, trích chữ/hình riêng; ưu tiên trang 1–14, chọn một số ảnh bổ sung từ Archive 16–44. Chi tiết và truy nguồn tại [PDF_SOURCE_MAP.md](PDF_SOURCE_MAP.md).
- Canva và NBNZIA trực tiếp: proxy trả 403. Không suy diễn rằng đã đọc được trang hiện tại.
- Superdesign CLI chạy được nhưng login trả 403. Giao diện được chỉnh trực tiếp trong repository; không có canvas từ dịch vụ.

## Những gì quan sát trong video

Thời điểm là gần đúng, dựa trên khung hình đã kiểm tra. Tốc độ cuộn của người ghi không phải thời lượng animation chuẩn của website.

| Đoạn | Quan sát | Chuyển thành thiết kế của HEW |
| --- | --- | --- |
| 0–7 giây | Tên lớn trên khoảng trắng; một khung media nằm trong tên rồi mở rộng thành vùng hình lớn | Tên Trung Hau / HEW chiếm trục mở đầu. Nghề và phạm vi công việc xuất hiện ngay, bên cạnh ảnh. Khung ảnh mở nhẹ khi cuộn; không có màn intro chờ |
| 15–20 giây | Nhãn nhỏ và đoạn giới thiệu lớn nằm trên hai trục; CTA đặt dưới nội dung, có khoảng nghỉ | Tên, nghề, bio và CTA có phân cấp riêng; đoạn mô tả ngắn, không tăng số liệu hay lời quảng cáo chưa có nguồn |
| 21–29 giây | Vùng media lớn nối sang section tối với các hàng nội dung | Đổi nhịp kem → đen → kem. Màu giúp nhận ra chương work, không phủ màu lên từng tác phẩm thật |
| 31–46 giây | Chữ lớn đi ngang; các panel dự án nối và che dần nhau khi cuộn, tiêu đề và số thứ tự rõ | Mỗi dự án thành một hàng rộng: text/credit bên trái, cover bên phải, số thứ tự riêng. Dùng cuộn tự nhiên và reveal nhẹ; không khóa panel hoặc bắt đọc chữ đang chạy |
| 48–58 giây | Khoảng nghỉ, tiếp đến ba thẻ mô tả quy trình | Giữ ba bước Plan / Produce / Finish từ nội dung kế hoạch, canh cùng trục với bio và experience |
| 62–80 giây | Contact dùng heading lớn trên nền tối và điểm nhấn màu | Contact của HEW dùng nền cam, heading lớn và email có thể bấm. Không thêm form không có backend |

Video không cho thấy rõ thao tác mở trang case. Chuyển cover → case là cách triển khai riêng theo yêu cầu người dùng và khả năng View Transition API, không phải tuyên bố về animation bên trong NBNZIA.

## Bố cục và chuyển động đã triển khai

- Hero: tên lớn, nghề, phạm vi video/photography/post-production, địa điểm, hai CTA và ảnh từ config. Mobile đặt nghề và CTA trước ảnh để đọc được ngay.
- Work: sáu hàng dự án thay grid 8/4 cũ. Metadata luôn đọc được, không cần hover. Thứ tự/số lượng tự theo `visible` và `order` trong JSON.
- Case: một mẫu chung, tiêu đề lớn, cover liên tục với card, overview, gallery và các block có dữ liệu. Thiếu role/client/process thì không tạo thông tin thay thế.
- Scroll: fade một lần 450 ms, dịch 14 px. Hero có mở khung nhẹ từ scale 0,97 tới 1 và crop từ 3%/4% tới 0, chỉ desktop khi trình duyệt hỗ trợ CSS `animation-timeline`. Không hỗ trợ thì giữ ảnh bình thường. Văn bản giữ nguyên chiều rộng và vị trí ngang.
- Hover: cover nhấc 3 px, ảnh scale tối đa 1,02; arrow phản hồi. Focus bàn phím vẫn rõ.
- Mở case: cover morph 400 ms trên desktop có View Transition API; fade 220 ms là fallback. Back khôi phục vị trí/focus. Mobile ưu tiên fade.
- Retouch: giữ 450 ms để xem original tạm thời; click/tap/Enter/Space bật tắt được; chú thích luôn hiện. Cặp ảnh thật lấy từ trang 11 PDF; original/edited khớp crop và kích thước. Trạng thái demo vẫn tự có chú thích nếu sau này chọn lại media placeholder.
- `prefers-reduced-motion` hoặc `enableMotion:false`: tắt animation, frame morph và hover movement; nội dung và thao tác vẫn dùng được.
- Demo giữ `mediaMode:demo`; không tạo video player/source/request, dù đã chuẩn bị trường preview/full video cho lần sau.

## Nội dung đã sửa có nguồn

Tên chính **Chuyến Đi Bất Ý**, kèm **Chuyen Di Bat Y**. Vai trò **Director of Photography** giữ theo kế hoạch. Giải **Best Cinematography · HUGFIA 2023** thuộc phim; tên đầy đủ **HUTECH Graduation Film Award** được ghi trong overview và recognition. Các dự án khác vẫn ở mức showcase trung tính; chưa bổ sung vai trò, khách hàng, kết quả hoặc số liệu.
