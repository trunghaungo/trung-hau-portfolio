# Thay ảnh và thêm video

## 1. Folder và mã media khác nhau như thế nào?

`public/media/` chứa file thực tế. `src/content/media.json` là danh bạ: mã media → đường dẫn file + mô tả + kích thước. `projects.json` và `site.json` chỉ chọn mã trong danh bạ.

Ví dụ: mã `film-cover` đang trỏ đến `/media/work/chuyen-di-bat-y/banner.webp`. Khi thay `posterSrc` của mã đó, **cả card và cover case phim** cùng thay; layout không cần sửa. Đường dẫn web **không có chữ `public`**.

## 2. Thay ảnh đang có bằng ảnh mới

1. Chuẩn bị ảnh WebP/JPG/PNG của đúng dự án, đã được phép công bố. Tên không dấu, chữ thường, không khoảng trắng; ví dụ `banner.webp`.
2. Với phim, đặt file vào `public/media/work/chuyen-di-bat-y/banner.webp`.
3. Trong `src/content/media.json`, tìm `"film-cover"`.
4. Chỉ sửa các trường ảnh như ví dụ dưới, giữ `previewSrc`/`fullVideoSrc` và các trường khác nếu đã có. Nhập kích thước thật của ảnh (xem Properties/Get Info của file):

   ```json
   "film-cover": {
     "posterSrc": "/media/work/chuyen-di-bat-y/banner.webp",
     "alt": "Mô tả cảnh thật xuất hiện trong ảnh",
     "width": 1920,
     "height": 1080,
     "objectFit": "contain",
     "objectPosition": "50% 50%",
     "isPlaceholder": false
   }
   ```

5. **Nếu chỉ chuẩn bị một file ảnh mới, xóa toàn bộ dòng `srcSet` và `sizes` cũ trong bản ghi đó.** Nếu giữ `srcSet`, phải thay đủ các file/kích thước liệt kê; chỉ ghi đè `banner.webp` có thể khiến trình duyệt tiếp tục hiển thị variant cũ. Kiểm tra dấu phẩy sau khi xóa dòng.
6. `alt` nên mô tả cảnh/chủ thể thật; không dùng dòng minh họa ở trên. `objectPosition` mặc định là trung tâm; nếu chủ thể nằm phía trên, thử `"50% 25%"`.
7. Lưu và chạy `npm run check:content`, mở demo để xem crop. Chỉ bỏ nhãn placeholder khi file đã là media thật.
8. Có thể bỏ SVG placeholder cũ sau khi không bản ghi nào dùng nó. File không dùng vẫn nằm trong `public/` và được sao chép vào `dist/`, dù không tải trên trang.

**Không đổi tên ảnh JPG thành `.svg`.** Nếu đổi định dạng/tên file, đổi `posterSrc` cho đúng. Khi đã có file thật với tên ổn định như `banner.webp`, những lần sau bạn có thể ghi đè file đó; vẫn cập nhật kích thước/alt khi nội dung đổi. Build/deploy lại; nếu trình duyệt giữ bản cũ, reload mạnh hoặc đổi tên file và cập nhật manifest.

## 3. Thay hero, about, chân dung và cặp so sánh

| Mã trong media.json | Vị trí |
| --- | --- |
| `hero` | Ảnh đầu trang; file trong `public/media/profile/` |
| `about` | Ảnh làm việc ở About |
| `portrait-1`, `portrait-2` | Hai portrait phụ đang dùng |
| `profile-portrait`, `portrait-3` | Ảnh có sẵn để chọn thay sau |
| `retouch-original`, `retouch-edited` | Cặp Original/Edited |

Làm giống phần 2: đặt file thật, đổi đường dẫn, alt, width/height và `isPlaceholder`. Hero/about hoặc danh sách portrait có thể chọn mã khác qua `src/config/site.json`.

Cặp so sánh phải là **cùng một ảnh**, cùng crop và tỷ lệ; vị trí khuôn mặt/chủ thể trùng nhau. Kiểm tra tỷ lệ chạy trong `check:content`, nhưng việc đúng chủ thể/crop cần bạn xem trực quan. Cặp hiện tại là hai ảnh BEFORE/AFTER thật từ trang 11 PDF, đã cùng kích thước 720×1280; không có retouch giả tạo thêm. Khi thay cặp mới, thay cả hai ảnh và toàn bộ `srcSet` tương ứng (hoặc xóa `srcSet` để dùng một file).

## 4. Chất lượng và tốc độ

| Vị trí | Bản web gợi ý |
| --- | --- |
| Hero | 1.400–1.800 px cạnh dài; mục tiêu khoảng 200–350 KB |
| Work cover/gallery | 960–1.600 px cạnh dài; khoảng 100–180 KB khi chất lượng cho phép |
| Portrait | Khung dọc; giữ tỷ lệ thật, tránh ép ảnh ngang thành chân dung |
| Short-form | Thumbnail 9:16, rộng 480–720 px |

Giữ file gốc lớn ở nơi riêng. `portfolio-media/` được gitignore để bạn cất nguồn tạm, nhưng thư mục đó không được đưa vào website. Chỉ bản web trong `public/media/` được build.

Nếu có nhiều bản ảnh, có thể thêm `srcSet` và `sizes` để tải bản phù hợp:

```json
"srcSet": "/media/work/chuyen-di-bat-y/banner-640.webp 640w, /media/work/chuyen-di-bat-y/banner-1600.webp 1600w",
"sizes": "(max-width: 767px) calc(100vw - 40px), 800px"
```

Các file trong `srcSet` phải tồn tại và giữ cùng crop. `check:content` hiện kiểm tra cả đường dẫn variant với descriptor `480w`, `800w`... Bản nhập từ PDF đã có variant WebP; bạn có thể bỏ `srcSet` khi thay bằng một ảnh đơn để dễ quản lý.

## 5. Thêm video sau này

Bản hiện tại dùng `"mediaMode": "live"`, `enableHoverPreview:true` để phát media của Chuyến Đi Bất Ý. Muốn bản chỉ ảnh, đặt `"mediaMode": "demo"`; ở chế độ này **không mount video, source hoặc iframe**, kể cả khi đã nhập đường dẫn video. Không tải video trong background.

1. Xuất file MP4 H.264 phù hợp trình duyệt. Preview ngắn 6–10 giây, 720p/960p, mục tiêu 0,5–1,5 MB. Bản đầy đủ là file khác.
2. Đặt file vào folder dự án, ví dụ `public/media/work/chuyen-di-bat-y/preview.mp4` và `trailer.mp4`. Không đưa bản quay gốc nặng vào project.
3. Với phim hiện tại, `film-cover` chỉ có preview; `film-trailer` có video đầy đủ để đặt dưới Overview. Sửa đúng bản ghi trong `media.json` (các đoạn dưới chỉ là trường cần sửa, không thay cả bản ghi):

   ```json
   "previewSrc": "/media/work/chuyen-di-bat-y/preview.mp4"
   ```

   Trong bản ghi `film-trailer`:

   ```json
   "fullVideoSrc": "/media/work/chuyen-di-bat-y/trailer.mp4"
   ```

   Giữ `trailerMediaId: "film-trailer"` trong projects.json. Dự án khác không có trailerMediaId vẫn có thể dùng fullVideoSrc trên cover như cơ chế cũ.

4. Trong `src/config/site.json`, hiện đã là `"mediaMode": "live"`. Chỉ đổi từ demo sang live nếu bạn đã chủ động chuyển sang chế độ ảnh trước đó.
5. Đặt `"enableHoverPreview": false` nếu muốn video chỉ tải khi người xem bấm **Preview video** / **Watch full video**. Nút Preview nằm riêng khỏi link mở case.
6. Nếu muốn hover preview trên desktop, đặt `enableHoverPreview` thành `true`. Sau khoảng 220 ms rê chuột, preview phát muted; rời card thì dừng nếu chưa chọn phát thủ công. Chỉ một video được bật cùng lúc; dừng khi ra khỏi viewport hoặc tab bị ẩn. Giảm motion/tiết kiệm dữ liệu sẽ bỏ tự phát, vẫn có nút chủ động.
7. Trong case phim, **Play trailer** (dự án khác: **Watch full video**) chỉ tạo player sau click. Có controls, poster và link mở file khi playback lỗi. Chưa có file thì không hiện nút.
8. Chạy kiểm tra/build/preview; xem trên máy và điện thoại thật. Khi quay lại `demo`, mọi player/nút video biến mất.

Gallery cũng hỗ trợ `fullVideoSrc` trên từng mã sample, ví dụ KB1; card cover hỗ trợ preview. Media URL bên ngoài phải là HTTPS trỏ trực tiếp đến file ổn định, server cho phép trình duyệt phát và byte-range khi cần. Link Canva edit/YouTube watch/link folder không phải nguồn MP4 trực tiếp; iframe video chưa được triển khai.

Tốc độ, codec, khả năng autoplay và phân phối file phụ thuộc video/hosting thực tế. Chế độ live đã kiểm tra trailer MP4 thật của phim trên Chromium/Linux; Windows, Safari/iOS và mạng di động vẫn cần xác nhận trên môi trường đó. Dữ liệu tiết kiệm chỉ nhận biết được ở trình duyệt cung cấp API tương ứng.

## Ảnh trong bản cập nhật layout

Trên desktop, mỗi dự án có cover lớn cạnh phần mô tả; mobile xếp thành một cột. Vẫn dùng các media ID và folder cũ, không cần chỉnh layout để thay hình. Hero lấy `heroMediaId`, ảnh About lấy `aboutMediaId` trong `src/config/site.json`.

Badge Placeholder là chữ HTML dễ đọc cả trên điện thoại, tự theo `isPlaceholder`. Khi dùng ảnh thật, đổi sang `false`; giữ `true` nếu vẫn là ảnh minh họa demo.

**PDF mới `Bản sao của Portfolio Trung Hau (1).pdf` đã đọc và trích ảnh riêng.** Ưu tiên phần mới trang 1–14; Archive bổ sung poster và ảnh khác có nguồn. Không dùng cả trang PDF làm giao diện. Xem [bảng nguồn](docs/PDF_SOURCE_MAP.md). Video `Tham khao template website.mp4` đã xem để tham khảo chuyển động, không phải media để đăng lên website.

## 6. Giữ nguyên poster dọc và chọn ảnh khác

- `objectFit:"contain"`: hiện toàn ảnh trong khung; phù hợp poster/thumbnail có chữ. `objectFit:"cover"`: ảnh lấp đầy khung, có thể crop cạnh; phù hợp ảnh BTS/ảnh chụp.
- `frameAspectRatio:1.5` là khung rộng:cao = 3:2, độc lập với `width`/`height` của file thật. Nếu muốn giữ khung theo tỷ lệ ảnh, bỏ dòng `frameAspectRatio`. Hero vẫn dùng khung ngang theo thiết kế; chỉnh `objectPosition` để giữ chủ thể.
- Banner phim, album phim và cover short-form đang dùng `contain`; không tự đổi ảnh dọc thành ảnh ngang làm mất chữ/khuôn mặt.
- Để thử chân dung có sẵn ở hero: mở `src/config/site.json`, đổi `heroMediaId` từ `"hero-2026"` thành `"profile-portrait"`. Chỉnh crop qua bản ghi tương ứng trong `media.json` nếu cần.
- TCV hiện có cover thật nhưng `galleryMediaIds:[]` vì chưa bổ sung bộ media riêng. Phim đã có 12 ảnh album (02–13), không dùng danh sách rỗng. Đặt ảnh mới vào folder, thêm mã media, rồi đưa mã đó vào danh sách gallery theo EDITING_GUIDE. Không cần sửa layout.

## Chuyến Đi Bất Ý — media đã cập nhật

- Banner: media ID `film-cover`, file `public/media/work/chuyen-di-bat-y/banner.webp` và variants 480/960; thay từ ảnh 01_Anh_bia. Poster dọc cũ đã gỡ khỏi website/source.
- Preview: `preview.mp4`, 8 giây/768×432/không tiếng, tải sau hover hoặc bấm Preview video. Full trailer: `trailer.mp4`, bản MP4 người dùng gửi, 30,037 giây/1024×576; chỉ tải/phát khi bấm Play trailer. Không dùng m3u8 hoặc URL Adobe có hạn dùng.
- Trong `projects.json`, `trailerMediaId: "film-trailer"` đặt video dưới Overview; `galleryLayout: "scroll"` chọn album, `galleryTitle` sửa tên album. `galleryMediaIds` là thứ tự 02–13; đổi thứ tự/ẩn ảnh bằng danh sách này. Các dự án khác không thêm trường thì giữ case/grid như trước.
- Mỗi ảnh album có `objectFit: "contain"`, kích thước đúng file và `srcSet` trong media.json. Nếu thay file, cập nhật/xóa srcSet cũ; đừng chỉ đổi bản lớn mà giữ variants cũ.
- Desktop đủ cao cuộn dọc để lướt ảnh ngang; mobile/cửa sổ thấp/reduced dùng swipe hoặc nút. Bấm ảnh mở bản 1920 px trong tab mới để đọc chữ/credit trong ảnh.
