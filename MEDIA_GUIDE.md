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

## 3. Thay hero, about và bộ ảnh before/after

| Mã trong media.json | Vị trí |
| --- | --- |
| `hero` | Ảnh đầu trang; file trong `public/media/profile/` |
| `about` | Ảnh làm việc ở About; bản web từ `HEW-media/Behind the work/The person.png` |
| `portrait-1`, `portrait-2`, `portrait-3`, `profile-portrait` | Ảnh cũ còn trong media config, không còn hiển thị ở mục Retouch |
| `retouch-01-before` đến `retouch-03-after` | Ba cặp ảnh so sánh hiện dùng; mã cặp 04 còn trong media.json nhưng không hiển thị |

Làm giống phần 2: đặt file thật, đổi đường dẫn, alt, width/height và `isPlaceholder`. Hero/about có thể chọn mã media khác qua `src/config/site.json`.

Nguồn chỉ đọc: `D:/Trung-Hau-Portfolio-Web/HEW-media/Photo Retouch/`, có bốn cặp đánh số 01–08. Bản web trong `public/media/portraits-retouch/comparisons/` gồm hai kích thước cho mỗi phía; cặp thứ ba được xoay đúng EXIF. `site.retouchPairs` trong `src/config/site.json` quyết định thứ tự, thêm/ẩn cặp mà không sửa component. Mỗi cặp phải là **cùng một ảnh**, cùng crop và đúng cùng kích thước pixel; vạch chia sẽ làm lộ sai lệch vị trí rất rõ. `check:content` kiểm tra kích thước metadata, còn sự khớp của chủ thể cần xem bằng mắt. Khi thay, cập nhật cả `posterSrc`, `srcSet`, `alt`, `width`, `height` của hai mã media tương ứng; nếu chỉ có một bản web, xóa `srcSet` cũ. Không đưa file gốc nhiều megapixel vào `public/`.

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

Bản hiện tại dùng `"mediaMode": "live"`, `enableHoverPreview:true` để phát media của Chuyến Đi Bất Ý, TVC TCV REBRAND và Short-form. Muốn bản chỉ ảnh, đặt `"mediaMode": "demo"`; ở chế độ này **không mount video, source hoặc iframe**, kể cả khi đã nhập đường dẫn video. Không tải video trong background.

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
7. Trong case Chuyến Đi Bất Ý, trailer có poster và controls, chỉ tải/tự phát không tiếng khi cuộn tới, tạm dừng khi ra khỏi màn hình. Reduced motion bỏ tự phát; người xem vẫn có thể bấm phát. Dự án khác dùng **Watch full video** khi `fullVideoSrc` nằm trên cover.
8. Chạy kiểm tra/build/preview; xem trên máy và điện thoại thật. Khi quay lại `demo`, mọi player/nút video biến mất.

Gallery thông thường vẫn hỗ trợ `fullVideoSrc` trên từng mã media; card cover hỗ trợ preview. Media URL bên ngoài cho player MP4 phải là HTTPS trỏ trực tiếp đến file ổn định, server cho phép trình duyệt phát và byte-range khi cần. Link Canva edit/YouTube watch/link folder không phải nguồn MP4 trực tiếp. Riêng Long-form dùng YouTube watch URL trong `shortLong.longVideos`: bấm banner mở trang YouTube trong tab mới, không tạo iframe trên website.

Tốc độ, codec, khả năng autoplay và phân phối file phụ thuộc video/hosting thực tế. Chế độ live đã kiểm tra trailer MP4 thật của phim trên Chromium/Linux; Windows, Safari/iOS và mạng di động vẫn cần xác nhận trên môi trường đó. Dữ liệu tiết kiệm chỉ nhận biết được ở trình duyệt cung cấp API tương ứng.

## Ảnh trong bản cập nhật layout

Trên desktop, mỗi dự án có cover lớn cạnh phần mô tả; mobile xếp thành một cột. Vẫn dùng các media ID và folder cũ, không cần chỉnh layout để thay hình. Hero lấy `heroMediaId`, ảnh About lấy `aboutMediaId` trong `src/config/site.json`.

Badge Placeholder là chữ HTML dễ đọc cả trên điện thoại, tự theo `isPlaceholder`. Khi dùng ảnh thật, đổi sang `false`; giữ `true` nếu vẫn là ảnh minh họa demo.

**PDF mới `Bản sao của Portfolio Trung Hau (1).pdf` đã đọc và trích ảnh riêng.** Ưu tiên phần mới trang 1–14; Archive bổ sung poster và ảnh khác có nguồn. Không dùng cả trang PDF làm giao diện. Xem [bảng nguồn](docs/PDF_SOURCE_MAP.md). Video `Tham khao template website.mp4` đã xem để tham khảo chuyển động, không phải media để đăng lên website.

## 6. Giữ nguyên poster dọc và chọn ảnh khác

- `objectFit:"contain"`: hiện toàn ảnh trong khung; phù hợp poster/thumbnail có chữ. `objectFit:"cover"`: ảnh lấp đầy khung, có thể crop cạnh; phù hợp ảnh BTS/ảnh chụp.
- `frameAspectRatio:1.5` là khung rộng:cao = 3:2, độc lập với `width`/`height` của file thật. Nếu muốn giữ khung theo tỷ lệ ảnh, bỏ dòng `frameAspectRatio`. Hero vẫn dùng khung ngang theo thiết kế; chỉnh `objectPosition` để giữ chủ thể.
- Banner phim, album phim và collage cover Short-form dùng `contain`; riêng cover Short-form được giới hạn bề rộng ở case để hiện trọn chữ và khuôn mặt trên desktop. Với poster/ảnh có chữ khác, không tự đổi ảnh dọc thành ảnh ngang làm mất chữ/khuôn mặt.
- Để thử chân dung có sẵn ở hero: mở `src/config/site.json`, đổi `heroMediaId` từ `"hero-2026"` thành `"profile-portrait"`. Chỉnh crop qua bản ghi tương ứng trong `media.json` nếu cần.
- TVC TCV REBRAND đã có banner động, album sáu cảnh, storyboard, ảnh ekip và bảng credits. Thứ tự/caption/media ID chỉnh trong `projects.json` và `media.json`; không cần sửa layout.

## Chuyến Đi Bất Ý — media đã cập nhật

- Banner: media ID `film-cover`, file `public/media/work/chuyen-di-bat-y/banner.webp` và variants 480/960; thay từ ảnh 01_Anh_bia. Poster dọc cũ đã gỡ khỏi website/source.
- Preview: `preview.mp4`, 8 giây/768×432/không tiếng, tải sau hover hoặc bấm Preview video. Full trailer: `trailer.mp4`, bản MP4 người dùng gửi, 30,037 giây/1024×576; tải/phát khi cuộn tới player, tạm dừng khi ra khỏi màn hình. Không dùng m3u8 hoặc URL Adobe có hạn dùng.
- Trong `projects.json`, `trailerMediaId: "film-trailer"` đặt video dưới Overview; `galleryLayout: "scroll"` chọn album, `galleryTitle` sửa tên album. `galleryMediaIds` là thứ tự 02–13; đổi thứ tự/ẩn ảnh bằng danh sách này. Dự án Juno Hair dùng `galleryLayout: "album"`; các dự án không chọn layout riêng giữ case/grid.
- Mỗi ảnh album có `objectFit: "contain"`, kích thước đúng file và `srcSet` trong media.json. Nếu thay file, cập nhật/xóa srcSet cũ; đừng chỉ đổi bản lớn mà giữ variants cũ.
- Desktop đủ cao cuộn dọc để lướt ảnh ngang; mobile/cửa sổ thấp/reduced dùng swipe hoặc nút. Bấm ảnh mở bản 1920 px trong tab mới để đọc chữ/credit trong ảnh.

## TVC TCV REBRAND — media đã cập nhật

- Nguồn chỉ đọc: `HEW-media/TVC TCV Rebranding/`. Website dùng bản web trong `public/media/work/tcv-rebrand/`; không đưa GIF/PNG gốc hay `credits.png` vào public.
- `banner.gif` thành `cover.webp` cùng variants 480/800 và `cover.mp4`. `media01.gif`–`media06.gif` thành poster WebP 480/960 và MP4 ngắn 960 px, không tiếng. `media.json` dùng `motionVideoSrc` cho clip động; chỉ cảnh đang xem mới phát, cuộn ra ngoài thì dừng. Reduced motion, tiết kiệm dữ liệu, demo mode hoặc lỗi video đều giữ poster tĩnh.
- `Story-board.png` và `Ekip.png` thành `storyboard.webp` / `crew.webp` cùng bản 800 px. Trang case mở ảnh đầy đủ trong tab mới khi bấm vào ảnh.
- `projects.json` quyết định thứ tự sáu cảnh bằng `galleryMediaIds`; `production.storyboard` giữ câu giải thích, `production.crew` giữ ảnh ekip, và `production.credits.groups` giữ vai trò/tên từ ảnh credits nguồn. Credits trên trang là bảng chữ HTML nền trắng chữ đen để đọc được trên mobile và bằng trình đọc màn hình. Khi sửa tên/credit, sửa dữ liệu này thay vì sửa ảnh.

## Wellbridge Global × Juno Hair — album ảnh

- Nguồn chỉ đọc: `D:/Trung-Hau-Portfolio-Web/HEW-media/Wellbridge Global x Juno Hair/`. Hai logo gốc được chuyển thành chữ đen trên nền trắng trong `public/media/work/juno-hair/cover-logos.jpg`; ảnh gốc không bị sửa. Banner này dùng chung cho card và trang dự án.
- Chín ảnh gốc `1.jpg`–`9.jpg` được thu nhỏ theo đúng tỉ lệ file, thành bản web cùng tên và bản `-900.jpg`. `projects.json` giữ thứ tự qua `galleryMediaIds`; `media.json` giữ đường dẫn, kích thước, alt, `srcSet` và vị trí crop của từng ảnh. Ảnh ngang `1.jpg` nằm dưới dải album với phụ đề tiếng Anh “The Hairstylist”; ảnh `2.jpg`–`9.jpg` là các thẻ dọc mở rộng khi chọn. Crop chỉ áp dụng trong dải album, file web mở riêng vẫn nguyên ảnh.
- Khi thay ảnh, chuẩn bị bản web phù hợp trong `public/media/work/juno-hair/` và sửa đồng bộ `posterSrc`, `width`, `height`, `srcSet` trong `media.json`. Nếu chỉ có một bản, xóa `srcSet` cũ. Đừng đưa JPG gốc 6.000 px vào `public/`.

## Events & Experiences — ba album ảnh

- Nguồn chỉ đọc: `D:/Trung-Hau-Portfolio-Web/HEW-media/Events & Experiences/`. Ba thư mục AGC – Global Camp 2022, Real Estate Project Site Tour và Camping Trip có tổng cộng 15 JPG. Bản web nằm trong `public/media/work/events-experiences/`, chia thành `agc/`, `site-tour/` và `camping/`; mỗi ảnh có bản cạnh dài tối đa 1.800px và bản `-900.jpg`. Ảnh có EXIF xoay được xuất lại đúng chiều, không sửa file gốc.
- `cover.jpg` và bản 480/800 là banner ba khung ghép từ một ảnh của mỗi album. Bản này dùng chung cho card Work và trang dự án. `projects.json` giữ tên/thứ tự ba album cùng thứ tự ảnh qua `photoAlbums`; `media.json` giữ đường dẫn, alt, kích thước và `srcSet`.
- Trong dải album, ảnh dùng `cover` để các thẻ mở rộng đồng đều; trên mobile khung ảnh là 4:5. Link trên mỗi thẻ mở bản web đầy đủ không crop. Khi thay ảnh, kiểm tra lại chủ thể ở cả thẻ thu gọn lẫn thẻ đang chọn; chỉnh `objectPosition` trong media config nếu cần. Không đưa JPG gốc 4.000–6.000px vào `public/`.

## Music videos — media đã cập nhật

- Nguồn chỉ đọc: `D:/Trung-Hau-Portfolio-Web/HEW-media/Music-Video/`. `Banner.gif` tạo `banner.mp4` và poster WebP 480/800/1280; các file `Best-cut.mp4`/`best-cut1.mp4`–`best-cut3.mp4` tạo năm MP4 và poster trong `public/media/work/music-videos/`.
- Thứ tự file nguồn: `1. MV-Doan-duong-phia-truoc-2024/Best-cut.mp4` → MV 1; `2. MV-Cho-toi-tinh-yeu-2024/best-cut1.mp4`–`best-cut3.mp4` → MV 2; `3. MV-Co-chut-nang-2025/best-cut.mp4` → MV 3. Bản web rộng 1280 px, H.264, không có track audio, `+faststart`; clip dài giữ nguyên thời lượng gần 13 và 14 giây.
- `projects.json` giữ tên, năm, vai trò, link MV đầy đủ và thứ tự `clipMediaIds`. `media.json` giữ poster và `motionVideoSrc`; clip chỉ tải/phát lặp khi hiện trong khung nhìn. Reduce motion, demo mode và tiết kiệm dữ liệu dùng poster tĩnh. Link MV đầy đủ mở trang ngoài theo URL người dùng cung cấp.

## Cuts & Stories — media đã cập nhật

- Nguồn chỉ đọc: `D:/Trung-Hau-Portfolio-Web/HEW-media/Short-form/`. Năm file trong folder này đã được xuất trọn thời lượng thành `reel-01.mp4`–`reel-05.mp4` trong `public/media/work/short-form/`, theo thứ tự: `Clip 1 no FX.mp4`, `KB 1 -Sabina.mp4`, `KB 1.mp4`, `KB 2 - Sabina.mp4`, `Recap SN Tara final.mov`. Tên file gốc không hiện trên trang.
- Bản web H.264/AAC 720×1280, 30 fps, CRF 27, `+faststart`, còn âm thanh. Thời lượng lần lượt khoảng 55,66; 39,34; 55,66; 62,67; 92,39 giây, lệch gốc dưới 0,04 giây. Tổng 40,9 MiB thay vì 563,4 MiB nguồn. Poster WebP được lấy từ chính clip web; poster của clip 1 và 3 dùng frame người nói mở mắt. Năm poster hiện trực tiếp trong lưới. Chỉ sau khi bấm Play, player mới gắn MP4 và phát **không mute**; native controls cho phép tạm dừng, bật/tắt âm thanh và tua. Đóng player hoặc ẩn tab sẽ dừng clip. Trình duyệt có thể chặn phát tự động có tiếng; trong trường hợp này người xem dùng native controls ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay), tra cứu 10/10/2026).
- Banner card/case `cover-story.jpg` ghép frame clip ngắn với hai thumbnail Long-form, có bản 480/800; frame người nói trên banner mở mắt. Ba thumbnail YouTube trong `long-01.webp`–`long-03.webp` lấy theo các link người dùng cung cấp ngày 10/10/2026. `shortLong.longVideos` trong `projects.json` giữ tiêu đề tiếng Anh, watch URL và `posterMediaId`; click banner mở URL trong tab mới, không tạo iframe. Tên chính thức của video vẫn cần người dùng xác nhận trước khi công khai.
- Để thay clip: xuất MP4 H.264/AAC đầy đủ với poster cùng nội dung, cập nhật `fullVideoSrc`, `posterSrc`, `width`, `height` trong `media.json`, rồi đổi/sắp thứ tự `shortLong.clipMediaIds`. Để thay Long-form: đổi `videoUrl` YouTube watch, tiêu đề và thumbnail tương ứng trong `shortLong.longVideos`; kiểm tra link còn truy cập được. Không đưa file nguồn nặng từ HEW-media vào `public/`.
