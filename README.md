# Trung Hau / HEW — Portfolio

Website React + TypeScript + Vite theo `Trung_Hau_Portfolio_Website_Execution_Plan.md`. Có homepage, sáu trang dự án, menu mobile, so sánh ảnh, điều hướng với phục hồi vị trí/focus và chuyển động theo tùy chọn giảm motion. Nội dung bằng tiếng Anh; hướng dẫn quản lý bằng tiếng Việt.

**Trạng thái:** demo đã bổ sung nội dung và ảnh/thumbnail riêng từ PDF mới (44 trang). Ưu tiên trang 1–14; Archive chỉ bổ sung poster/ảnh khác đã chọn, không đưa các trang trùng lên website. Cặp retouch dùng ảnh BEFORE/AFTER thật từ PDF. Bản chạy hiện bật media live riêng qua các URL của Chuyến Đi Bất Ý: preview nhẹ khi hover/chủ động bấm, trailer tải khi bấm Play trailer; các dự án khác chưa có video. Chưa xuất bản lên Internet. Xem [nguồn PDF và cách chọn ảnh](docs/PDF_SOURCE_MAP.md), [ghi chú thiết kế](docs/DESIGN_NOTES.md) và [nội dung còn thiếu](CONTENT_TODO.md).

**Bản hiện tại: `2026.10.08-film-media`**, source ứng dụng đã duyệt `2e860f0`: sáu dự án, 49 media entries. Intro ba ảnh dài 3400 ms và hiện lại mỗi reload homepage; hero-text reveal theo cuộn hai chiều. Chuyến Đi Bất Ý có banner mới, preview MP4 8 giây, trailer dưới Overview và album 02–13. Các round layout/motion trước là lịch sử trong [CHANGELOG](CHANGELOG.md) và [QA_REPORT](QA_REPORT.md).

**Chuyển sang Codex local trên Windows:** bắt đầu ở [bộ bàn giao](docs/local-handoff/README.md), gồm cách clone đúng nhánh, kiểm tra SHA-256, lưu file gốc và [prompt tiếp tục](docs/local-handoff/LOCAL_CODEX_PROMPT.md). `main` vẫn là nhánh cũ tại thời điểm bàn giao; không dùng ZIP cũ làm source hiện hành.

Chọn **Reduce motion → Off** để xem đầy đủ hiệu ứng, rồi reload homepage để xem intro. Link thẳng case/section và reduced bỏ intro. [Intro/hero desktop/mobile](docs/intro-hero-preview/README.md) · [Hero-text desktop/mobile](docs/hero-text-preview/README.md) · [Chuyến Đi Bất Ý desktop/mobile](docs/film-media-preview/README.md). Clip nằm trong docs, không tải trong website. [Mapping M01–M12](docs/REFINEMENT_MAPPING.md) và [khảo sát live NBNZIA](docs/NBNZIA_COMPARISON.md) ghi nhận các vòng trước, không phải lần khảo sát mới.

## Xem demo trên máy của bạn

Bạn cần Node.js phiên bản 22.12 trở lên (khuyên dùng bản LTS được Node.js hỗ trợ), một trình duyệt và VS Code. Môi trường hiện tại đã chạy và kiểm tra bằng Node.js 24.19.0.

1. Trên GitHub, đăng nhập tài khoản có quyền xem repository rồi mở nhánh [`codex/portfolio-demo`](https://github.com/trunghaungo/trung-hau-portfolio/tree/codex/portfolio-demo), chọn **Code → Download ZIP**, rồi giải nén. Chọn đúng nhánh này để tải bản website có `package.json`. Bạn cũng có thể [tải ZIP trực tiếp](https://github.com/trunghaungo/trung-hau-portfolio/archive/refs/heads/codex/portfolio-demo.zip) hoặc clone repository và checkout nhánh đó. Giải nén vào **thư mục mới**, giữ bản Windows bạn đã sửa làm bản dự phòng. Nếu link ZIP báo 404, đăng nhập GitHub rồi dùng **Code → Download ZIP** trên đúng nhánh.
2. Mở VS Code, chọn **File → Open Folder**, chọn thư mục có `package.json`.
3. Chọn **Terminal → New Terminal**. Đây là ô nhập lệnh phía dưới, không phải nơi sửa nội dung.
4. Nhập từng lệnh sau, nhấn Enter sau mỗi dòng:

   ```sh
   npm ci
   npm audit
   npm run dev
   ```

5. Giữ Terminal mở. Mở trình duyệt và nhập địa chỉ được Vite ghi ở dòng `Local` (thường là `http://127.0.0.1:5173`). `dev` và `preview` mặc định bind **127.0.0.1**, chỉ truy cập từ máy đang chạy. Không cần thêm `--host` vào lệnh. Source mới đã khóa Vite **7.3.6** trong cả `package.json` và lockfile.
6. Cuộn xem work, mở từng dự án, thử nút **Show original**, và thu hẹp cửa sổ để thử menu mobile. Trong Chrome, có thể nhấn F12 rồi bật biểu tượng điện thoại để xem kích thước 390 px.
7. Khi sửa file và nhấn Ctrl+S (Mac: Cmd+S), bản dev tự cập nhật. Dừng server bằng Ctrl+C trong Terminal.

Không mở `index.html` bằng cách nhấp đúp. Website cần chạy qua lệnh ở trên. Nếu cổng mặc định đã dùng, Vite có thể chọn cổng tiếp theo; dùng đúng dòng `Local`.

Ảnh chụp **bản cập nhật**: [desktop](docs/screenshots/home-desktop.png), [mobile](docs/screenshots/home-mobile.png), [trang phim desktop](docs/screenshots/case-desktop.png), [trang phim mobile](docs/screenshots/case-mobile.png), [work desktop](docs/screenshots/work-desktop.png), [so sánh ảnh](docs/screenshots/retouch-mobile.png).

## Chỉnh nội dung mà không sửa layout

Đọc [HƯỚNG DẪN CẬP NHẬT](EDITING_GUIDE.md) theo từng bước. Để thay ảnh/video, đọc [MEDIA_GUIDE](MEDIA_GUIDE.md).

| Bạn muốn đổi | File mở trong VS Code |
| --- | --- |
| Tên, nghề, giới thiệu, liên hệ, kinh nghiệm, công cụ | `src/content/profile.json` |
| Tên/miêu tả dự án, thứ tự, hiện/ẩn, case details | `src/content/projects.json` |
| Tiêu đề section, nhãn menu/nút, hướng dẫn tương tác | `src/content/ui.json` |
| Đường dẫn ảnh/video, mô tả ảnh, kích thước/crop | `src/content/media.json` |
| Intro, thời gian reveal, stack dự án, badge theo chuột | `src/config/motion.json` |
| Nhịp màu dự án, ảnh nhỏ Contact, Experience mở/đóng | `src/config/presentation.json` |
| Chế độ demo/live, chuyển động, điều hướng | `src/config/site.json` |
| Màu/font/khoảng cách toàn site nếu cần | `src/styles/tokens.css` |

Đường dẫn bắt đầu từ thư mục project. Các file `.tsx` trong `src/` là layout và tương tác; bạn không cần sửa chúng để cập nhật thông tin hoặc thêm dự án.

## Kiểm tra và xem bản chuẩn bị xuất bản

```sh
npm run check:content
npm run build
npm run preview
```

`check:content` kiểm tra JSON, media IDs, file tồn tại, slug trùng, thứ tự, thông tin bắt buộc và cặp so sánh. `build` chạy kiểm tra nội dung, TypeScript rồi đóng gói website vào `dist/`. `preview` cho xem bản `dist/` trên máy; đọc địa chỉ `Local` do lệnh in ra. Sửa nội dung rồi phải chạy `build` lại để preview đổi theo.

Kiểm tra tự động bằng trình duyệt:

```sh
npx playwright install chromium
npm test
```

Môi trường cloud dùng Chromium có sẵn tại `/usr/bin/chromium`. Trên máy khác Playwright dùng browser đã cài theo lệnh trên; có thể chỉ định đường dẫn bằng `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Kết quả và giới hạn kiểm chứng nằm trong [QA_REPORT](QA_REPORT.md). Để tạo lại ảnh preview và phép đo lab, giữ `npm run preview -- --port 4175 --strictPort` chạy trong một Terminal, mở Terminal thứ hai rồi chạy `npm run capture:demo`.

## Đưa lên Internet sau khi bạn quyết định xuất bản

Hướng dẫn từng bước nằm ở [EDITING_GUIDE — Xuất bản và cập nhật](EDITING_GUIDE.md#6-xuất-bản-và-cập-nhật-sau-này). Lệnh build chỉ tạo `dist/`, không tự xuất bản. Project chuẩn bị sẵn `public/_redirects` cho hosting static hỗ trợ SPA fallback, để link `/work/...` mở trực tiếp và refresh được.

Nếu chọn hosting khác, cần rewrite các đường dẫn ứng dụng về `index.html` và giữ đường dẫn file media/assets. Với GitHub Pages ở subdirectory cần cấu hình base path/router riêng trước khi dùng; bản này mặc định chạy ở root domain.

Thông tin cần bổ sung trước phát hành: [CONTENT_TODO](CONTENT_TODO.md). Font Inter được self-host từ package `@fontsource/inter`, kèm giấy phép trong `docs/INTER-OFL.txt`; không tải font bên thứ ba lúc xem website.
