# Intro / Hero — 2026.10.08-intro-hero

- Phạm vi riêng intro/hero, tiếp tục từ `ef5a117` trên `codex/portfolio-demo`; xem clip `intro-hero.mp4` do người dùng gửi, đọc được cả ba ảnh trong RAR bằng libarchive.
- Intro chạy lại khi reload homepage (`oncePerSession:false`), dài 3400 ms. Giữ Skip/Escape, bỏ qua case/hash link và reduced, cleanup resize/API/ảnh lỗi. Khi intro chạy trên reload, về đầu trang để bàn giao đúng hero.
- Chuỗi ảnh `intro.jpg` → `intro-2.JPG` → `hero.JPG`: hai mã mở đầu tập trung trong `intro.mediaIds`, ảnh cuối lấy trực tiếp từ hero. Chuỗi WAAPI hữu hạn, không GIF/video/RAF lặp; fixed geometry, transform/clip/opacity. Tên giữ lâu hơn; ảnh cuối mở rộng vào hero, khớp transform ảnh thật và giữ gutter lúc khóa cuộn.
- Thêm WebP tối ưu/responsive cho ảnh mới; không sửa 33 media records cũ hoặc ảnh dự án. Contact tách `contactMediaId` để giữ ảnh cũ, không thay bố cục/nội dung Contact. Bio/dự án/UI/credit/routes/thứ tự/visibility/package/lockfile/localhost bind giữ nguyên.
- Bổ sung kiểm tra chuỗi ảnh/geometry/reload/fallback; non-intro tests bấm Skip thật thay vì dựa session storage. Preview desktop/mobile và QA mới nằm trong `docs/intro-hero-preview/`. Chưa đóng ZIP, chưa deploy.

# Layout và motion refinement — 2026.10.06-layout-refinement

- Tiếp tục từ checkout sạch `0bb99d4`; đọc hai handoff mới, mapping M01–M12 trong `docs/REFINEMENT_MAPPING.md`. Giữ khảo sát NBNZIA live trước đó làm tham chiếu, không ghi nhận khảo sát mới trong vòng này.
- Hero rõ tên/nghề và CTA; mobile theo tên/nghề → ảnh → CTA. Work có title nguyên hàng, credit tách vai trò/giải của phim, ảnh rộng; thứ tự DOM mobile title → credit → ảnh → mô tả/link. Poster contain, gallery thiếu vẫn ẩn. Retouch nằm trong chương Work; About ảnh trái/bio phải; Approach ổn định và một cột trên tablet/mobile.
- Giữ Inter/palette thật, điều chỉnh gutter/type/spacing bằng tokens sẵn có. Không đổi profile/projects/media/ui/public media, slug/thứ tự/visibility hoặc credit; không tạo schema/config nội dung thứ hai.
- Reuse intro2400 ms/session/Skip/Escape/deep link; tune nhịp tên–ảnh, bỏ chờ reveal hero lần hai, bổ sung fallback ảnh/WAAPI lỗi. Hero parallax tối đa24 px trên desktop pointer fine; reveal/hover ngắn hơn, media clip/fade qua cùng observer; Approach bỏ scroll assembly liên tục.
- Stack chỉ khi tất cả mặt thẻ vừa vùng viewport trừ header đo được/gap/biên an toàn; giữ kích thước tự nhiên giữa các chế độ. Nội dung dài/cửa sổ thấp/mobile về flow. Bổ sung phục hồi vị trí đọc khi đổi motion và fallback observer lỗi.
- Điều hướng case giữ shared template/focus/history/scroll restoration; API transition lỗi hoặc giảm motion giữa callback vẫn apply đúng một lần. Reuse menu/Experience/Retouch và priority/persistence/sync của Reduce motion.
- Không thêm dependency; package/lockfile/Vite7.3.6/localhost bind giữ nguyên. Demo không tải video; website chưa deploy. Kết quả build/audit/browser/ZIP và số đo trước–sau mới nằm trong QA_REPORT.

# NBNZIA live và công tắc motion — 2026.10.06-motion-controls

- Khảo sát trực tiếp NBNZIA desktop/mobile; bảng đối chiếu mới có ảnh và số đo. Xác minh services mở bằng click, không chỉ hover. Không dùng Superdesign/Web Design theo chỉ dẫn đã cập nhật.
- Thêm Reduce motion On/Off dùng chuột/touch/bàn phím; mặc định theo OS, lựa chọn riêng lưu qua reload và đồng bộ tab; fallback trong bộ nhớ khi storage bị chặn. Đồng bộ intro, CSS/scroll, hover, điều hướng case và preview media tương lai.
- Tiêu đề dự án thành hàng rộng, phần mô tả/credit và ảnh ở hai cột phía dưới. Stack đo thẻ thực tế, chạy trên laptop 1536×730/1366×768/1366×650; cửa sổ quá thấp/nội dung dài dùng normal flow.
- Intro giữ tỷ lệ ảnh, dùng transform/clip/opacity thay kích thước mỗi frame; bỏ blur. Tagline đậm dần theo cuộn, Work drift rõ hơn; giữ native scroll, không vòng RAF khi đứng yên; reduced tháo listener của lớp motion.
- Trang debug chỉ bật bằng `?motionDebug=1`, có phiên bản và trạng thái hiệu lực; giao diện thông thường không chứa thông tin kỹ thuật.
- Giữ nguyên profile/projects/media/public media, credit và package/lockfile (Vite 7.3.6). Chỉ thêm ba nhãn công tắc vào ui.json. 47 kiểm tra đạt, audit 0; xem QA_REPORT cho đo và giới hạn.
- Bổ sung hướng dẫn Windows, cập nhật ảnh/clip và ZIP; chưa deploy website.

# Đối chiếu NBNZIA và hoàn thiện layout — 06/10/2026

- Bảng đối chiếu 15 hạng mục, mốc clip và ảnh trước/sau trong `docs/NBNZIA_COMPARISON.md`. NBNZIA live/Superdesign login trả 403; Web Design không có công cụ khả dụng. Phân tích dựa trên clip đã gửi, không tuyên bố đã kiểm tra DOM/CSS của mẫu.
- Giữ nguyên toàn bộ file nội dung/UI/media, ảnh, package/lockfile và cấu hình site so với vòng motion `0a50a4f`.
- Intro có ảnh chen giữa TRUNG và HAU, mở ra vị trí hero. Tên mờ đi, ảnh hòa vào homepage; giữ 2,4 giây, skip, giảm motion và không lặp cùng tab. Đổi kích thước cửa sổ trong intro giải phóng giao diện ngay.
- Hero rộng toàn trang, tên và nghề trên ảnh; đoạn dẫn lớn riêng bên dưới. Ảnh dịch nhẹ theo cuộn bằng timeline của vùng hero, chữ giữ vị trí. Work có statement lớn, heading dịch ngang ngắn và panel luân phiên kem/đen/cam; index ở góc trên.
- Experience mở/đóng bằng chuột, bàn phím và tap; vai trò/thời gian luôn hiện. Approach ba nền, Contact nền tối với ảnh nhỏ nối lại hero. Menu mobile phủ dưới header, không đẩy layout, có cleanup khóa cuộn khi đổi breakpoint.
- Thêm `presentation.json`, mở rộng `motion.json` và validator; hướng dẫn chỉnh cho người không lập trình. Bổ sung kiểm tra intro handoff/resize, accordion, menu overlay và config trình bày. Giữ case morph/fade, retouch và demo không tải video.
- Bản chụp/clip/GIF và số đo mới từ production preview; kết quả kiểm tra thực tế trong QA_REPORT. Chưa xuất bản website.

# Layout và motion — 06/10/2026

- Giữ nguyên profile, dự án, media manifest và file ảnh; chỉ thêm nhãn giao diện Skip intro.
- Intro TRUNG HAU hiện qua mask chữ, mờ/dịch lên rồi lớp nền mở ra; tổng 2,4 giây, một lần mỗi phiên tab, bỏ qua bằng nút/Escape. Link case/section và reduced motion đi thẳng.
- Heading lớn hơn, reveal theo từ, hero mở khung rõ hơn; Work xếp panel sticky và tấm trước lùi nhẹ theo cuộn trên desktop đủ cao. Native scrolling, không chặn wheel/touch.
- Hover ảnh có Open project đi theo con trỏ; nav trượt chữ, CTA quét màu, arrow/email và hàng experience có phản hồi. Approach thành ba thẻ xếp lệch có chuyển động vào vị trí.
- Mobile/reduced motion/bàn phím có bố cục và thao tác tương ứng. Thêm config motion riêng và hướng dẫn thử/chỉnh, ảnh cùng clip bản chạy desktop/mobile.
- Sửa aria của tiêu đề chia từ sau khi kiểm tra Axe phát hiện lỗi; giữ chuỗi đọc/heading nguyên vẹn. Kiểm tra intro/timing, storage không khả dụng, deep link, bàn phím, touch, stack và pointer bổ sung trong suite.
- Chưa xuất bản website. Kết quả kiểm tra và giới hạn hiện tại ở QA_REPORT.

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
