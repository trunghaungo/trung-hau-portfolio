# NBNZIA → Trung Hau / HEW: phân tích và đối chiếu thiết kế

Ngày 06/10/2026, giờ Việt Nam. Baseline HEW: commit **0a50a4f** — vòng intro/stack đầu tiên. Vòng này giữ nguyên các file profile, dự án, media, nhãn nội dung và ảnh; thay bố cục, tương tác và cách trình bày.

## Nguồn và mức độ xác minh

- Đã thử truy cập **https://www.nbnzia.com/** trực tiếp. Proxy từ chối CONNECT với **HTTP 403**; chưa đọc được DOM/CSS hoặc tương tác live của website trong vòng này.
- **Superdesign:** CLI 0.14.0 chạy được, báo chưa xác thực; login trả 403. Dừng luồng canvas/extract của dịch vụ. Không có draft/canvas được tạo và không coi thiết kế này là đầu ra từ Superdesign.
- **Web Design:** plugin được nhắc trong prompt nhưng không có skill/tool khả dụng trong phiên. Catalog kỹ năng và công cụ đã được kiểm tra; không thể gọi plugin đó.
- Bằng chứng tham khảo sử dụng để tiếp tục là **video NBNZIA do người dùng gửi**, 1920×970, 30 fps, dài 80,6 giây. Đã xem toàn bộ chuỗi khung hình, dày hơn tại intro (0–7 s), service (20–29,5 s), work (31–46 s), process (53–57 s), contact (62–77,5 s).
- Không xác nhận tên font, thư viện animation, easing/timing gốc, breakpoint hoặc hành vi mobile của NBNZIA. Các số ms/breakpoint trong code mới là quyết định triển khai HEW. Không có dữ liệu performance của site tham khảo.

Vì vậy bảng dưới là **phân tích từ bản ghi NBNZIA**, không phải báo cáo khảo sát website live hiện tại. Tài nguyên của NBNZIA không được đưa vào portfolio; clip mới trong bộ bàn giao ghi lại HEW.

## Nhận định chính

NBNZIA tạo cảm giác liền mạch nhờ hình ảnh và chữ nối nhau qua các giai đoạn: tên → khung media → hero; khoảng nghỉ sáng → nội dung tối → panel có màu → process → contact. Ở HEW cũ, các hiệu ứng riêng đã có nhưng quan hệ giữa chúng còn yếu: intro đóng lại rồi hero bắt đầu như một màn khác, phần lớn Work là các khối tối gần giống nhau, nhiều section dùng cùng một kiểu heading bên trái/mô tả bên phải.

Vòng mới ưu tiên liên kết những giai đoạn đó, tăng vai trò của ảnh và nhịp sáng/tối. Màu/font, dự án, credit, giải phim và thông tin liên hệ giữ theo nội dung của Hậu.

## Bảng tổng hợp và đối chiếu

| Hạng mục | NBNZIA quan sát trong clip | HEW trước vòng này | Cải tiến đã triển khai | Giới hạn / kiểm chứng |
| --- | --- | --- | --- | --- |
| Intro | 0–1,5 s: tên lộ dần; 1,5–5 s: media chen giữa tên rồi mở ra thành vùng lớn | Tên xuất hiện rồi mờ, lớp nền kéo lên; ảnh và tên chưa có sự tiếp nối | Dùng chính ảnh hero trong khe giữa TRUNG và HAU; khung ảnh mở tới vị trí hero thật, hòa vào giao diện; giữ skip và phiên tab | Dùng ảnh hiện có; thời lượng 2400 ms là của HEW, không sao chép timing gốc |
| Hero | 5–15 s: media chiếm màn hình, heading lớn và nav gọn | Tên lớn nhưng phần ảnh chỉ nằm trong cột phải | Khung ảnh rộng toàn trang, tên ở phía trên và nghề ở phía dưới trên nền ảnh; intro và hero dùng chung nguồn ảnh | Có lớp tối bảo đảm đọc chữ; mobile giữ tên/nghề ngay trong vùng mở đầu |
| Đoạn giới thiệu | 15–20 s: nhãn nhỏ một bên, đoạn giới thiệu lớn bên kia, CTA có khoảng nghỉ | Tagline nhỏ trong cột cạnh ảnh | Tagline đã có chuyển thành đoạn dẫn lớn sau hero; nhãn nghề và CTA canh trục riêng | Không thêm copy quảng cáo hoặc số liệu |
| Thang chữ | Tên/statement chiếm tỷ lệ lớn, caption/nav rất nhỏ so với chúng | Nhiều heading cùng tỷ lệ và cùng bố cục | Tách ba mức: tên/statement, tên dự án, thông tin đọc; Work thành đoạn chuyển chương rộng | Không xác định font gốc từ video; giữ Inter |
| Khoảng trắng / trục canh | Có khoảng nghỉ trước work/process; ảnh được đặt có chủ ý | Nhịp section đều, Work khá giống danh sách dài | Hero rộng; phần dẫn hẹp; Work rộng hơn trục chữ; khoảng nghỉ đưa mắt sang chương tiếp theo | Chiều dài đoạn đọc vẫn giới hạn, không kéo body text tràn màn hình |
| Chuyển section | 21–24 s: media lớn dẫn vào vùng tối; 31–36 s: statement đi ngang | Chủ yếu fade từng block, khung hero mở nhẹ | Ảnh hero có chuyển dịch nhẹ khi cuộn; dòng thứ hai của Work dịch ngang một đoạn ngắn; màu panel và khoảng nghỉ tạo nhịp | Native scroll; không bắt kéo ngang hoặc chặn wheel/touch |
| Panel dự án | 37–46 s: tấm tiếp theo che tấm trước, mỗi dự án có nền riêng; title/index đọc rõ | Đã có stack nhưng tất cả panel gần như cùng màu đen; index ở dưới, khoảng trống lớn | Panel luân phiên kem/đen/cam; title lớn hơn, index góc trên; hình và thông tin thành một composition | Dữ liệu vẫn sáu dự án cùng mẫu; tone tự theo config/thứ tự |
| Hover và tín hiệu bấm | 24–29 s: hàng service mở phần mô tả/hình; 65–76 s: nút/email đổi trạng thái | Badge theo chuột, arrow, underline đã có | Giữ badge/CTA/nav; đổi màu theo panel; email/contact có phản hồi rõ; không phải hover mới đọc được credit | Không khẳng định chính xác trigger của mọi đoạn trong clip |
| Các hàng mở/đóng | Service có nội dung thay đổi theo hàng đang xem | Kinh nghiệm hiển thị tất cả, cùng kiểu hàng văn bản | Experience thành accordion: tên, vai trò và thời gian luôn hiện; phạm vi mở bằng click/tap/Enter/Space; Escape đóng | Dùng các mô tả experience đã có, không tạo danh sách dịch vụ/khách hàng mới |
| Process | 53–57 s: ba thẻ lệch vị trí/góc, bố cục thoáng | Ba thẻ cùng nền kem, cạnh nhau | Plan/Produce/Finish có ba nền theo palette và độ lệch vào vị trí; tăng phân cấp số/tên/body | Mobile xếp dọc; reduced motion bỏ chuyển dịch |
| Contact | 62–77,5 s: một chương tối, statement lớn, ảnh nhỏ, email là đích rõ | Nền cam toàn khối, heading và email giống một section CTA thông thường | Chương tối, statement lớn, ảnh BTS nhỏ nối lại hero, điểm nhấn cam, email lớn và footer cùng nền | Không thêm form chưa có backend; contact lấy nguyên từ config |
| Menu mobile | Clip chỉ ghi desktop; chưa có bằng chứng hành vi mobile của mẫu | Menu mở làm nội dung phía dưới bị đẩy xuống | Menu thành lớp phủ dưới header, link lớn đánh số; khóa cuộn tạm, Escape/focus và đổi breakpoint có cleanup | Đây là thiết kế riêng cho HEW; không tuyên bố sao chép mobile NBNZIA |
| Chuyển case | Clip không thể hiện rõ mở case | Đã có cover morph trên desktop và fade fallback | Giữ chuyển case, focus và Back về vị trí cũ; màu panel không làm thay nội dung case | Kiểm tra cả sáu route, không suy ra animation chưa thấy trong mẫu |
| Khả năng chỉnh sửa | Không xác minh CMS/code của NBNZIA | Nội dung/ảnh đã tách JSON | Thêm `presentation.json` cho tone panel, ảnh Contact, accordion; mở rộng `motion.json` cho handoff/drift | Không cần sửa layout khi sửa nội dung hoặc thêm/ẩn/đổi thứ tự dự án |
| Accessibility / tốc độ | Không thể đánh giá từ clip | Có kiểm tra Chromium, bàn phím, giảm motion | Giữ reduced motion/skip, accordion/menu bàn phím; đo bundle và demo không tải video | Kết quả thực tế ở QA_REPORT; chưa thay thế kiểm thử Safari/iOS/Firefox/thiết bị thật |

## Trước và sau

Ảnh trước vòng này được giữ riêng để so sánh với bản mới:

- Hero: [trước](reference-review/before-home.png) · [sau](screenshots/home-desktop.png)
- Work: [trước](reference-review/before-work.png) · [sau](screenshots/work-desktop.png)
- Contact: [trước](reference-review/before-contact.png) · [sau](motion-preview/contact-desktop.png)
- [Intro GIF](motion-preview/intro.gif), [clip desktop](motion-preview/desktop.mp4), [clip mobile](motion-preview/mobile.mp4)

Ảnh “sau” và video được chụp/ghi từ bản chạy production, không phải mockup. Chưa xuất bản website lên Internet.
