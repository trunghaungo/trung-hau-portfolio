# Nội dung và media đã bổ sung từ PDF

Đã tải và đọc **Bản sao của Portfolio Trung Hau (1).pdf**, 44 trang, 27.965.783 bytes. Bản này nằm dưới giới hạn truyền file. Số trang dưới đây là số trang PDF, bắt đầu từ 1.

**Ưu tiên:** trang 1–14 là portfolio mới đã biên tập; trang 15 là trang phân cách Archive; trang 16–44 dùng để đối chiếu hoặc bổ sung có chọn lọc. Không tạo các trang web theo từng slide và không đưa những nhóm dự án trùng lên website.

Đã tách chữ bằng pdftotext/PyMuPDF, xem bản render của các trang và trích các image object riêng. Một số image object trong Archive có chữ được raster hóa, bóng hoặc alpha mask; đã kiểm tra hình trực quan thay vì chỉ dựa vào text selectable. Raw PDF và bộ ảnh gốc tạm không nằm trong website/repository. Manifest truy nguồn và crop/resizing: [PDF_SOURCE_MAP.json](PDF_SOURCE_MAP.json).

## Nội dung

| Nguồn | Cập nhật | Điều giữ nguyên/chưa suy ra |
| --- | --- | --- |
| Trang 1, 12, 14 | Bio: media professional tại TP.HCM; brand content, event coverage, post-production. Tên Trung Hau / HEW và contact đã đối chiếu | Giữ nghề mở đầu Videographer & Video Editor; không thêm tuyên bố đang làm tại một công ty |
| Trang 4; đối chiếu 18, 28 | Chuyến Đi Bất Ý / Chuyen Di Bat Y, 2023; Director of Photography; Best Cinematography HUGFIA 2023; HUTECH Graduation Film Award | Giải thuộc phim. Chưa có synopsis/quyết định quay/film stills riêng |
| Trang 5, thumbnail trong trang; đối chiếu 19 | TCV REBRAND: thumbnail ghi 2024, Saigon Zoo & Botanical Gardens, Shotlist & reference | Mô tả commercial video concept/tài liệu ý tưởng. Không coi địa điểm trong concept là khách hàng được thuê; không suy ra vai trò từ “present by Hew” |
| Trang 3 | Đoạn đường phía trước, một mục Music video và một mục Selected footage | Không tự đặt tên cho MV/footage còn lại, không suy ra credit/năm |
| Trang 6–7 | Social video đi cùng thumbnail; Sabina, Tara recap, Selected cut; workflow pacing/sound/subtitles/effects/color/export | “KB1” giữ làm media ID cũ, không coi là tên chính thức đã xác nhận trong PDF. Selected cut chỉ có frame trắng/logo mờ nên chưa dùng làm thumbnail |
| Trang 8–9 | Brand photography Wellbridge Global × Juno Hair; Real Estate Project Site Tour | Không gán thêm role, client, campaign hoặc kết quả |
| Trang 12; đối chiếu 28 | Bốn mốc kinh nghiệm đã khớp; bổ sung phạm vi ngắn cho từng mục | ERA Jan–Jun 2026 khớp cả bản mới và trang Archive khi xem rõ. “Present” cần kiểm tra khi phát hành |
| Trang 13 | Thay câu approach biên tập bằng ba bước có nguồn: brief/references/shot lists; film/photo/light/composition; edit/sound/color/deliverables | Công cụ và contact khớp cấu hình trước |

## Media dùng trên website

| Vị trí / media ID | Trang PDF | Cách chọn |
| --- | --- | --- |
| `hero` | 1 | Ảnh BTS camera riêng; crop hiển thị chỉnh bằng objectPosition, bản file vẫn giữ ảnh gốc theo tỷ lệ |
| `about` | 12 | Ảnh bàn dựng riêng |
| `film-cover` | 28, Archive | Tách đúng vùng poster trong image collage. Giữ toàn vùng poster có trong PDF, không tái tạo phần thiếu. `objectFit:contain` để không crop thêm trong card/case |
| `tcv-cover` | 5 | Thumbnail shot list/reference có chữ trong media gốc; title/overview/credit của giao diện vẫn là HTML riêng |
| `music-cover`, `music-still-1/2` | 3 | Title frame Đoạn đường phía trước, frame Music video, Selected footage. Tách phần frame cây xanh khỏi canvas đen dư, không thay nội dung cảnh |
| `juno-cover`, `juno-photo-1/2` | 8 | Ba ảnh khác nhau: tạo kiểu, tư vấn và gội đầu |
| `juno-photo-3` | 22, Archive | Portrait thương hiệu khác các ảnh ở trang 8; bỏ phần padding trong suốt của PDF export |
| `site-cover`, `site-photo-1` | 9 | Ảnh nhóm và trao đổi |
| `site-photo-2/3` | 23, Archive | Hai ảnh khác với trang 9: thảo luận và xem mô hình; không dùng lại ảnh nhóm/ảnh trao đổi trùng |
| `short-cover`, `kb1-thumbnail`, `sabina`, `tara` | 6–7 | Frame và thumbnail thực tế, không player/video. Frame dọc dùng contain để không cắt mất khuôn mặt |
| `portrait-1/2` | 10 | Hai portrait chọn lọc |
| `retouch-original/edited` | 11 | Đúng cặp BEFORE/AFTER, trái/phải như PDF. Chuẩn hóa kích thước cùng 720×1280 từ hai ảnh có tỷ lệ gần như nhau; không sửa khuôn mặt, màu hay hiệu ứng retouch |
| `profile-portrait`, `portrait-3` | 14, 10 | Có sẵn trong config để đổi sau; không tải trên homepage mặc định |

Ảnh web dùng WebP và các width variant 480/800/bản lớn khi độ phân giải nguồn cho phép; không upscale. `width`/`height` giữ kích thước file thật. Poster dọc có `frameAspectRatio` riêng cho khung trình bày. Nguồn image hash, trang, image index/xref, tọa độ crop và kích thước đầu ra nằm trong manifest JSON.

Film/TCV có poster/thumbnail nhưng chưa có stills riêng: gallery được để `[]` để tránh lặp ảnh cover hoặc đưa gallery toàn placeholder. Các media ID placeholder cũ vẫn có sẵn để thay/bổ sung sau. Music video chỉ giữ hai frame gallery có nguồn. Selected cut chưa có thumbnail rõ nên chưa đưa vào gallery. Không tải video ở chế độ demo.

## Archive chưa đưa thành dự án mới

Trang 24–25, 36–38 có thêm portrait/casting/graduation; 39–41 có event/AGC Global Camp 2022/Camping Trip; 42–43 có footage/long-form; 30/34/44 có công cụ và workflow bổ sung. Đã xem để đối chiếu, không tự biến thành các case có client/role/outcome chưa được xác nhận. Có thể chọn thêm ở lượt sau với tên, phạm vi và ảnh ưu tiên của từng dự án.
