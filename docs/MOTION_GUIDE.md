# Chuyển động — bản 2026.10.08-film-media

Trạng thái hiện hành lấy từ source/config, không từ báo cáo lịch sử: intro 3400 ms chạy lại sau reload homepage, ba ảnh thật; tagline reveal hai chiều; phim có preview/trailer/album. Layout và công tắc motion tái sử dụng [mapping M01–M12](REFINEMENT_MAPPING.md) và [khảo sát NBNZIA có ngày riêng](NBNZIA_COMPARISON.md). [Bàn giao local](local-handoff/README.md).

## Bật / tắt giảm chuyển động ngay trên web

Trên desktop, nhìn lên thanh điều hướng; trên điện thoại, bấm **Menu**. Có công tắc **Reduce motion**:

| Trạng thái | Bạn sẽ thấy |
| --- | --- |
| **On** — bật giảm chuyển động | Không intro, parallax, stack, chữ trượt hay badge chạy theo chuột. Dự án xếp dọc bình thường. Link, nút, so sánh ảnh và nội dung vẫn dùng được |
| **Off** — tắt giảm chuyển động | Intro, reveal, cuộn/hover và chuyển case hoạt động theo thiết bị; desktop đủ chỗ có stack |

Lần đầu truy cập, web lấy lựa chọn từ hệ điều hành. Khi bạn bấm công tắc, web nhớ lựa chọn đó cho địa chỉ hiện tại, kể cả sau khi tải lại hoặc mở tab khác. Vì vậy bạn có thể chọn **Off trên web mà không cần bật Animation effects của Windows**. Việc chọn Off không tự phát lại intro ngay khi đang đọc trang.

Lựa chọn được lưu trong trình duyệt, không thay cấu hình của máy, không gửi lên server. `127.0.0.1:5173`, `localhost:5173` và cổng khác là các địa chỉ lưu riêng. Nếu chặn bộ nhớ trình duyệt, lựa chọn vẫn dùng được trong lượt xem hiện tại nhưng không lưu qua reload. Xóa dữ liệu website sẽ trở lại mặc định theo hệ điều hành.

Công tắc dùng được bằng **Tab → Space/Enter**. Trên mobile, nó nằm trong vòng Tab của menu; Escape đóng menu và trả focus về nút Menu.

## Thử demo trên Windows trong 5 phút

1. Tải ZIP bản mới từ nhánh `codex/portfolio-demo`, giải nén vào **thư mục mới**. Không chép đè vào source cũ khi chưa sao lưu.
2. Trong File Explorer, mở đúng thư mục có `package.json`, bấm thanh địa chỉ, gõ `cmd`, nhấn Enter.
3. Chạy từng dòng:

   ```bat
   npm ci
   npm run dev
   ```

4. Giữ cửa sổ cmd mở. Mở Chrome ở địa chỉ **Local** Vite in ra, thường là `http://127.0.0.1:5173/`. Lệnh mặc định chỉ cho máy đang chạy truy cập.
5. Chọn **Reduce motion → Off**. Để xem intro từ đầu, mở `http://127.0.0.1:5173/?intro=1` — dùng đúng cổng ở bước 4. Tên hiện rồi mờ đi; ảnh mở nối vào hero. Skip intro/Escape có thể bỏ qua ngay.
6. Cuộn xuống: ảnh hero dịch nhẹ; tagline hiện dần từng từ với màu nhấn, cuộn ngược lùi lại; dòng Work dịch ngang; các thẻ dự án chồng lên nhau khi đủ chỗ. Rê chuột trên ảnh để xem badge theo chuột. Bấm một dự án rồi Back.
7. Chọn **Reduce motion → On**, thử lại cuộn/hover/mở case: các chuyển động trên dừng. Tải lại trang, công tắc vẫn On. Link, ảnh, thông tin và nút Show original vẫn dùng được.
8. Thu hẹp cửa sổ hoặc dùng Chrome giả lập mobile: mở Menu, đổi công tắc. Mobile cuộn một cột và reveal nhẹ ở chế độ đầy đủ; không bắt buộc hover.

Nếu muốn kiểm tra bản production, dừng dev bằng Ctrl+C rồi chạy `npm run build` và `npm run preview`; mở đúng địa chỉ Local mới. Build chỉ tạo file trên máy, không xuất bản.

## Nhận biết phiên bản / gửi kết quả kiểm tra

Mở `http://127.0.0.1:5173/?motionDebug=1` (thay cổng nếu khác). Khung **Motion diagnostics** chỉ xuất hiện với đường dẫn này:

- `version`: phải là **2026.10.08-film-media**.
- `viewport`: kích thước vùng web tính bằng CSS pixel, không phải độ phân giải màn hình Windows.
- `systemReduced`: tín hiệu của OS/Chrome.
- `choice`: `system` khi chưa chọn trên web, `full` hoặc `reduced` sau khi chọn.
- `reduced`: trạng thái cuối cùng mà website đang sử dụng.
- `intro`, `stack`, `pointer`, `hover`, `finePointer`: trạng thái lúc bấm **Refresh status**.

Sau khi đổi kích thước cửa sổ hoặc intro kết thúc, bấm **Refresh status** rồi chụp khung này nếu cần báo lỗi. **Close diagnostics** trở lại giao diện thông thường. Không cần dán code, mật khẩu, cookie hoặc token vào Console/hội thoại.

`stack:false` không có nghĩa toàn bộ motion bị tắt. Stack cần chuột hỗ trợ hover, rộng từ 1024 CSS px, và mọi thẻ phải vừa chiều cao thực tế. Vùng dành cho stack trừ chiều cao header đo được, khoảng trống trên/dưới và biên an toàn 16 px; kết quả kích thước cụ thể nằm trong QA_REPORT. Không có ngưỡng chiều cao 760 px. Khi cửa sổ quá thấp hoặc nội dung một dự án quá dài, web giữ cuộn dọc bình thường để không che thông tin.

## Tự chỉnh qua file cấu hình

| File / trường | Ý nghĩa |
| --- | --- |
| `src/config/site.json` → `enableMotion` | `false` tắt toàn bộ motion ở cấp website và ẩn công tắc; ưu tiên cao nhất. Giữ `true` để người xem tự chọn |
| `src/config/motion.json` → `intro.enabled` | Bật/tắt riêng intro |
| `intro.durationMs` | Hiện 3400 ms; validator cho 1800–4000 |
| `intro.oncePerSession` | Hiện `false`: chạy lại sau mỗi reload homepage. Đặt `true` nếu muốn một lần mỗi tab |
| `intro.mediaIds` | Hai ảnh mở đầu theo thứ tự; ảnh thứ ba tự lấy từ `site.heroMediaId` |
| `intro.imageHandoff` | `true`: ảnh mở từ tên sang hero; `false`: intro chữ |
| `stackProjects` | `false` để luôn cuộn thẻ bình thường |
| `pointerFollow` | `false` để badge giữ vị trí cố định |
| `revealDurationMs` | Hiện 500 ms; thời gian fade/dịch block, không thay mọi animation |
| `sectionDrift` | Bật/tắt dịch ngang dòng Work |
| `src/content/ui.json` | Nhãn `reduceMotion`, `motionOn`, `motionOff`, `skipIntro` |
| `src/config/presentation.json` | Nhịp `projectTones`, ảnh Contact, Experience accordion |

Nội dung vẫn ở `profile.json`, `projects.json`, `media.json`; xem [EDITING_GUIDE](../EDITING_GUIDE.md). File `release.json` là dấu nhận biết bản bàn giao, không cần chỉnh để sửa nội dung.

## Hiệu năng và giới hạn

- Cuộn native, không chặn wheel/touch, không cài thư viện animation mới. Reduced tháo listener scroll/pointer của lớp hiệu ứng. Full chỉ tính lại khi có sự kiện, gộp vào một animation frame; không có vòng RAF chạy liên tục khi đứng yên.
- Intro dùng geometry cố định rồi animate transform/clip/opacity; không animate width/height mỗi frame. Ảnh giữ tỷ lệ khi mở. Resize giữa intro bỏ qua để tránh đích cũ bị lệch.
- Khi dùng bàn phím trong Work, stack trở về luồng thường để link không bị che.
- Hero mobile luôn theo thứ tự tên/nghề → ảnh → CTA. Work mobile theo title → credit → ảnh → mô tả/link. Approach chỉ reveal một lần, không nghiêng liên tục.
- Ảnh hero desktop có chuột chính xác dịch tối đa 24 px theo CSS scroll timeline; browser thiếu hỗ trợ giữ ảnh tĩnh. Desktop có View Transition API dùng cover morph 480 ms; nơi thiếu API và mobile dùng fade. Reduced bỏ cả fade/morph. Nếu API ném lỗi, vẫn mở case một lần và phục hồi focus/history. Nếu bật reduced khi đang đọc một thẻ sticky, phần đang đọc được giữ trên màn hình.
- `mediaMode:live` hiện cho preview/trailer phim tải theo tương tác; `demo` vẫn chỉ tải ảnh, không mount video. Album desktop đủ cao dùng native vertical scroll → horizontal; mobile/thấp/reduced có swipe/nút. Hạ motion giảm công việc animation, không đồng nghĩa giảm dung lượng ảnh. Không cam kết FPS hoặc thời lượng pin trên máy chưa đo.
- Cloud Chromium đã kiểm tra; Chrome Windows của bạn cần xác nhận lại trên đúng ZIP mới. Chưa kiểm thử Safari/iOS/Firefox hoặc thiết bị thật.

## Preview

Bản mới: [intro/hero](intro-hero-preview/README.md), [hero-text](hero-text-preview/README.md), [phim](film-media-preview/README.md).

Clip công tắc/layout ngày 06/10 (lịch sử): [Desktop](motion-preview/desktop.mp4) · [mobile](motion-preview/mobile.mp4) · [intro GIF](motion-preview/intro.gif). Đây là bản ghi HEW đang chạy, có thao tác đổi công tắc; nằm trong `docs/`, không được tải vào website.

Để tạo lại: cài browser/encoder Playwright (`npx playwright install chromium ffmpeg`), chạy preview tại cổng 4175, rồi `node scripts/capture-motion.mjs`. Script tạo WebM; MP4 bàn giao được chuyển bằng FFmpeg để mở thuận tiện trên Windows.
