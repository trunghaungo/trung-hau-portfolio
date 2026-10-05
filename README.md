# Trung Hau / HEW — Portfolio

Website React + TypeScript + Vite theo `Trung_Hau_Portfolio_Website_Execution_Plan.md`. Có homepage, sáu trang dự án, menu mobile, so sánh ảnh, điều hướng với phục hồi vị trí/focus và chuyển động theo tùy chọn giảm motion. Nội dung bằng tiếng Anh; hướng dẫn quản lý bằng tiếng Việt.

**Trạng thái:** demo với thumbnail đồ họa được ghi rõ là placeholder. Không có video được tải trong chế độ demo. Chưa xuất bản website lên Internet. Canva và hai website tham khảo bị chặn truy cập ở môi trường thực thi; dữ liệu được lấy từ kế hoạch đã cung cấp.

## Xem demo trên máy của bạn

Bạn cần Node.js phiên bản 22.12 trở lên (khuyên dùng bản LTS được Node.js hỗ trợ), một trình duyệt và VS Code. Môi trường hiện tại đã chạy và kiểm tra bằng Node.js 24.19.0.

1. Trên GitHub, mở nhánh [`codex/portfolio-demo`](https://github.com/trunghaungo/trung-hau-portfolio/tree/codex/portfolio-demo), chọn **Code → Download ZIP**, rồi giải nén. Chọn đúng nhánh này để tải bản website có `package.json`. Bạn cũng có thể [tải ZIP trực tiếp](https://github.com/trunghaungo/trung-hau-portfolio/archive/refs/heads/codex/portfolio-demo.zip) hoặc clone repository và checkout nhánh đó.
2. Mở VS Code, chọn **File → Open Folder**, chọn thư mục có `package.json`.
3. Chọn **Terminal → New Terminal**. Đây là ô nhập lệnh phía dưới, không phải nơi sửa nội dung.
4. Nhập từng lệnh sau, nhấn Enter sau mỗi dòng:

   ```sh
   npm ci
   npm run dev
   ```

5. Giữ Terminal mở. Mở trình duyệt và nhập địa chỉ được Vite ghi ở dòng `Local` (thường là `http://localhost:5173`). Địa chỉ này chỉ chạy trên máy bạn, chưa phải website công khai.
6. Cuộn xem work, mở từng dự án, thử nút **Show original**, và thu hẹp cửa sổ để thử menu mobile. Trong Chrome, có thể nhấn F12 rồi bật biểu tượng điện thoại để xem kích thước 390 px.
7. Khi sửa file và nhấn Ctrl+S (Mac: Cmd+S), bản dev tự cập nhật. Dừng server bằng Ctrl+C trong Terminal.

Không mở `index.html` bằng cách nhấp đúp. Website cần chạy qua lệnh ở trên. Nếu cổng mặc định đã dùng, Vite có thể chọn cổng tiếp theo; dùng đúng dòng `Local`.

Ảnh chụp bản chạy: [desktop](docs/screenshots/home-desktop.png), [mobile](docs/screenshots/home-mobile.png), [trang phim](docs/screenshots/case-desktop.png), [so sánh ảnh](docs/screenshots/retouch-mobile.png).

## Chỉnh nội dung mà không sửa layout

Đọc [HƯỚNG DẪN CẬP NHẬT](EDITING_GUIDE.md) theo từng bước. Để thay ảnh/video, đọc [MEDIA_GUIDE](MEDIA_GUIDE.md).

| Bạn muốn đổi | File mở trong VS Code |
| --- | --- |
| Tên, nghề, giới thiệu, liên hệ, kinh nghiệm, công cụ | `src/content/profile.json` |
| Tên/miêu tả dự án, thứ tự, hiện/ẩn, case details | `src/content/projects.json` |
| Tiêu đề section, nhãn menu/nút, hướng dẫn tương tác | `src/content/ui.json` |
| Đường dẫn ảnh/video, mô tả ảnh, kích thước/crop | `src/content/media.json` |
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

Môi trường cloud dùng Chromium có sẵn tại `/usr/bin/chromium`. Trên máy khác Playwright dùng browser đã cài theo lệnh trên; có thể chỉ định đường dẫn bằng `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Kết quả và giới hạn kiểm chứng nằm trong [QA_REPORT](QA_REPORT.md).

## Đưa lên Internet sau khi bạn quyết định xuất bản

Hướng dẫn từng bước nằm ở [EDITING_GUIDE — Xuất bản và cập nhật](EDITING_GUIDE.md#6-xuất-bản-và-cập-nhật-sau-này). Lệnh build chỉ tạo `dist/`, không tự xuất bản. Project chuẩn bị sẵn `public/_redirects` cho hosting static hỗ trợ SPA fallback, để link `/work/...` mở trực tiếp và refresh được.

Nếu chọn hosting khác, cần rewrite các đường dẫn ứng dụng về `index.html` và giữ đường dẫn file media/assets. Với GitHub Pages ở subdirectory cần cấu hình base path/router riêng trước khi dùng; bản này mặc định chạy ở root domain.

Thông tin cần bổ sung trước phát hành: [CONTENT_TODO](CONTENT_TODO.md). Font Inter được self-host từ package `@fontsource/inter`, kèm giấy phép trong `docs/INTER-OFL.txt`; không tải font bên thứ ba lúc xem website.
