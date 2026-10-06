# NBNZIA live → Trung Hau / HEW

Khảo sát trực tiếp ngày 06/10/2026. Baseline HEW: `c845f78`. Bản demo mới: `2026.10.06-motion-controls`.

## Nguồn và giới hạn

Đã mở **https://www.nbnzia.com/** trong Chromium 151, bật xác minh TLS, tải CSS/JS/font/ảnh và phát media live, cuộn và thao tác thật. Desktop 1440×900/1000; mobile mô phỏng touch 390×844. Đây là khảo sát **website live**, thay thế kết luận từ clip của vòng trước. Superdesign/Web Design được bỏ qua theo chỉ dẫn của người dùng; không có đầu ra nào từ hai dịch vụ này.

- [Bảng ảnh khảo sát live](reference-live/nbnzia-live-study.jpg): intro, hero, about, services, work, process và menu mobile đang mở.
- [Số đo services trước/hover/click](reference-live/interaction-evidence.json): hàng thứ hai cao 96 px khi chỉ hover, tăng lên 244 px sau click; hàng đầu thu lại 96 px. Ảnh của hàng mới dịch từ y=196 về 0. Sửa nhận định cũ: **click mở hàng**, hover đơn thuần không mở trong lượt thử này.
- Lượt kiểm tra xuyên trang: desktop cuộn tới y=18.498, mobile tới y=15.052; có 32 ScrollTrigger, progress và transform/opacity thay đổi thực tế theo cuộn. Video đạt readyState=4 và thời gian phát tăng. Không có pageerror JavaScript trong lượt kiểm tra đó.
- Một số request nền Cloudflare Turnstile/PAT vẫn bị lỗi; chúng không ngăn các thao tác khảo sát. Không gửi form, không kiểm tra thành công luồng đặt lịch hay mọi website được liên kết.
- Các link Work quan sát được dẫn ra website ngoài. **Chưa có bằng chứng về chuyển sang case nội bộ của NBNZIA**. Chuyển cover vào case HEW là thiết kế riêng.
- Mobile là giả lập Chromium, chưa phải iPhone/Android thật. Không khẳng định NBNZIA tuân thủ reduced motion hoặc có hiệu năng tốt hơn HEW; chưa thực hiện phép đo so sánh cùng điều kiện.

Ảnh tham khảo chỉ nằm trong tài liệu `docs/`, không đưa vào `public/`, không tải trong portfolio và không dùng làm tác phẩm của Hậu.

## Bảng đối chiếu

| Hạng mục | Quan sát có bằng chứng ở NBNZIA live | HEW ở c845f78 | Thay đổi / quyết định trong bản mới |
| --- | --- | --- | --- |
| Intro | Tên ở giữa nền sáng; ảnh xuất hiện giữa hai phần tên, mở thành media hero | Đã có name → image handoff; animating vị trí và kích thước mỗi frame | Giữ câu chuyện đó, đổi handoff sang transform + clip + opacity, giữ tỷ lệ ảnh; bỏ blur chữ lớn. Có Skip/Escape và replay |
| Hero | Media phủ rộng, chữ có tỷ lệ lớn, nav gọn; nội dung tiếp theo có khoảng nghỉ | Hero rộng nhưng chiều cao tối thiểu làm cửa sổ thấp khó thấy trọn nội dung | Hero thích nghi cửa sổ thấp, giữ tên/nghề/tín hiệu cuộn; không thay ảnh, màu hay font |
| Giới thiệu | Nhãn/ảnh nhỏ ở trục trái, đoạn chữ lớn ở trục phải; chữ thay đổi mức đậm theo cuộn | Cùng bố cục bất đối xứng nhưng tagline chỉ fade một khối | Tagline chuyển dần từ xám đủ tương phản sang đen theo tiến độ cuộn; chữ luôn đọc được |
| Nối chương | Có heading lớn đi ngang/xoay qua các đoạn cuộn dài | Work có drift rất ngắn, phụ thuộc ngưỡng cao 760 px | Tăng nhẹ độ dịch dòng Work và cho chạy cả cửa sổ thấp; không tạo màn trống nhiều viewport hoặc chặn wheel |
| Bố cục dự án | Tiêu đề/index chạy ngang phía trên; mô tả bên trái, media lớn bên phải; nền thay đổi theo dự án | Tiêu đề nằm cùng cột hẹp với phần mô tả, ảnh lệch xuống | Tiêu đề thành một hàng rộng; phía dưới ghép vai trò/credit và ảnh; CTA ở chân cột. Giữ panel kem/đen/cam |
| Stack | Tấm mới phủ tấm trước; tấm cũ thu nhỏ và nghiêng, ảnh chuyển động trong khung | Chỉ chạy khi viewport cao ít nhất 760 px | Bỏ ngưỡng cứng. Đo chiều cao thực của **tất cả** thẻ để chỉ xếp chồng khi vừa. Thu nhỏ, lùi và nghiêng rất nhẹ; fallback cuộn thường khi không vừa |
| Hover | Chữ nav đổi lớp khi hover; text CTA dịch lên, icon góc xoay/dịch | Có nav rollover và badge theo chuột nhưng bị khóa theo OS | Giữ phản hồi này, đồng bộ theo công tắc web; badge theo chuột chỉ trên pointer phù hợp; touch có link/nút rõ |
| Services / Experience | Click đổi hàng mở và ảnh, hover riêng không mở | Experience accordion đã có | Giữ click/tap/Enter/Space, Escape đóng; vai trò và thời gian luôn hiện. Không biến thành hover-only |
| Process | Ba thẻ cao, lệch độ cao/góc, bước 01–03 rõ | Ba thẻ màu có hiệu ứng nhưng bị chặn dưới 760 px | Giữ ba bước của HEW, bỏ ngưỡng chiều cao cho hiệu ứng nhẹ; mobile một cột, không nghiêng khi reduced |
| Mobile menu | Lớp phủ tối, tên nav lớn xuất hiện theo lớp | Lớp phủ nền kem có focus trap và Escape | Giữ palette và cách điều hướng HEW; thêm Reduce motion ở menu, đưa switch vào vòng Tab |
| Contact | Chương tối, statement lớn, ảnh nhỏ và điểm nhấn màu cam | Đã có cấu trúc phù hợp | Giữ nguyên; giảm chuyển động sẽ dừng phần trình bày nhưng liên hệ vẫn dùng được |
| Giảm chuyển động | Chưa xác minh chính sách của NBNZIA | Windows/OS là lựa chọn duy nhất | **Reduce motion On/Off**. Lần đầu theo OS; lựa chọn rõ ràng trên web có ưu tiên và được lưu. Off vẫn có hiệu lực khi OS đang giảm motion |
| Hiệu năng | Quan sát GSAP/ScrollTrigger và video live; chưa đo benchmark đối chiếu | RAF đã theo sự kiện; còn listener motion khi reduced và intro thay đổi layout | Reduced tháo listener scroll/pointer của lớp motion; full gộp cập nhật một frame, đọc hình học trước khi ghi; không chạy vòng RAF liên tục; demo 0 video |
| Chuyển case | Link quan sát được dẫn ra ngoài, chưa xác minh morph sang case nội bộ | Cover View Transition, focus và Back đã có | Giữ morph của HEW và đồng bộ tùy chọn motion; reduced chuyển ngay, trình duyệt thiếu API dùng fallback |

## Trải nghiệm đích

**Tên → người làm hình ảnh → phạm vi công việc → từng tác phẩm → khả năng hoàn thiện → con người và cách làm việc → liên hệ.** Nội dung kể câu chuyện này đã có trong config; vòng này điều chỉnh cách trình bày và nhịp chuyển động.

Hiệu ứng không quyết định khả năng đọc nội dung. Không bắt buộc hover, giữ chuột hoặc xem hết intro để mở dự án. Không sao chép cuộn dài của mẫu chỉ để tạo chuyển động. Nội dung, ảnh và credit được giữ nguyên.

## Bằng chứng HEW

- Work: [trước](reference-live/hew-before-work.png) · [sau](motion-preview/work-desktop.png).
- [Desktop](screenshots/home-desktop.png) · [mobile](screenshots/home-mobile.png).
- [Clip desktop](motion-preview/desktop.mp4) · [clip mobile](motion-preview/mobile.mp4) · [intro](motion-preview/intro.gif).
- Kết quả đo và kiểm thử: [QA_REPORT](../QA_REPORT.md). Cách bật/tắt và thử trên Windows: [MOTION_GUIDE](MOTION_GUIDE.md).
