# Hướng dẫn cập nhật portfolio — dành cho người không lập trình

Bạn quản lý website bằng các file JSON trong `src/content/` và `src/config/`. JSON giống một biểu mẫu văn bản: tên trường bên trái, nội dung bên phải. Layout tự đọc các trường này để dựng trang. Đọc phần “Xem demo” trong README trước; hãy sửa và xem thử trên máy trước khi đưa thay đổi lên website thật.

## 1. Quy tắc chỉnh file

1. Sao chép thư mục project sang một thư mục dự phòng trước khi chỉnh lần đầu, hoặc dùng Git để giữ lịch sử.
2. Trong VS Code, mở file bằng danh sách thư mục bên trái.
3. Giữ nguyên tên trường như `email`, `title`, `posterSrc`; chỉ thay phần giá trị.
4. Chuỗi văn bản dùng dấu nháy kép `"..."`. Nếu nội dung chứa dấu nháy kép, viết `\"`; dấu nháy đơn không cần xử lý.
5. Giữa hai trường hoặc hai phần tử có dấu phẩy. Phần tử cuối cùng trước `}` hoặc `]` **không có** dấu phẩy. JSON không nhận dòng ghi chú `//`.
6. `true` / `false` và số không đặt trong nháy kép. Văn bản đặt trong nháy kép.
7. Nhấn Ctrl+S/Cmd+S rồi chạy `npm run check:content` trong Terminal. Nếu báo lỗi, đọc tên file/trường và sửa trước khi tiếp tục. Với JSON sai cú pháp, kiểm tra dấu nháy, dấu phẩy và ngoặc ở vị trí được báo.

Không gửi key/mật khẩu vào các file này. Website hiện không cần tài khoản API, database hay Canva để chạy.

## 2. Sửa giới thiệu và liên hệ

Mở `src/content/profile.json`:

| Trường | Công dụng |
| --- | --- |
| `name`, `alias` | Tên trên hero và nhận diện ở đầu/cuối trang |
| `role` | Nghề chính |
| `tagline` | Đoạn dẫn lớn ngay sau ảnh hero |
| `location` | Địa điểm trên hero và contact |
| `bio` | Các đoạn giới thiệu; mỗi chuỗi là một đoạn |
| `hero` | Nhãn mở đầu và tên hai nút chính |
| `workIntro`, `portraitsIntro` | Giới thiệu hai section |
| `contact.email` | Email hiển thị và link gửi email |
| `contact.phone` | Số điện thoại dễ đọc |
| `contact.phoneLink` | Số để bấm gọi, có `+84` và không có khoảng trắng |
| `contact.socials` | Danh sách nút tròn mạng xã hội trong `profile.json`. Nhãn “Follow” nằm ở `src/content/ui.json` (`followLabel`) |
| `experience`, `education`, `tools`, `approach` | Kinh nghiệm (có `description` tùy chọn cho phạm vi công việc), học vấn, công cụ và cách làm việc |

Mỗi mục trong `contact.socials` có `id` duy nhất để giữ ổn định thứ tự render, `name` làm nhãn truy cập, `url` HTTPS và `icon`. Dùng `icon: "behance"` hoặc `"instagram"` cho hai biểu tượng hiện có; tên icon khác dùng biểu tượng link chung. Thêm, xóa hoặc đổi thứ tự mục trong mảng để cập nhật các nút, không cần sửa layout.

Ví dụ sửa phần giới thiệu: thay hai câu trong `bio` bằng câu của bạn, giữ dạng mảng:

```json
"bio": [
  "Đoạn giới thiệu thứ nhất do bạn viết.",
  "Đoạn giới thiệu thứ hai do bạn viết."
]
```

Giao diện mặc định tiếng Anh. Các tiêu đề section và nhãn nút nằm trong `src/content/ui.json`; sửa phần văn bản bên phải để đổi tiêu đề hoặc dịch nhãn. Tên menu điều hướng nằm trong `navigation` ở `src/config/site.json`. Nếu chuyển toàn bộ nội dung sang tiếng Việt, đổi `language` trong file đó thành `vi`; trường này khai báo ngôn ngữ cho trình duyệt, **không tự dịch các nhãn giao diện**. Đổi `siteTitle` và `description` nếu đổi tên/định vị.

Intro hiện dùng ba ảnh: hai mã trong `intro.mediaIds` ở `src/config/motion.json`, sau đó là mã `heroMediaId` trong `src/config/site.json`. Ảnh cuối mở thành hero. Tiêu đề `contact.heading` trong `src/content/profile.json` chia dòng ở dấu hỏi đầu tiên; nếu không có dấu hỏi, giao diện chia gần giữa câu. Trên desktop, rê chuột qua phần Contact chỉ đổi màu vùng chữ gần con trỏ; touch và Reduce motion giữ chữ tĩnh. Đường dẫn ảnh nằm trong `src/content/media.json`; cập nhật hoặc xóa `srcSet` cũ theo MEDIA_GUIDE. Experience lấy tên, vai trò, thời gian và phạm vi công việc từ `experience[]` trong `src/content/profile.json`; thứ tự mảng là thứ tự các mục hiện khi cuộn qua khung nội dung. Câu dẫn dưới tiêu đề The approach nằm trong `src/content/ui.json` (`approachIntro`), còn chữ của ba bước nằm trong `profile.json` (`approach[]`).

### Đổi ảnh trong Photo Editing & Retouching

`portraitsIntro` trong `src/content/profile.json` là đoạn mô tả; nhãn, tiêu đề và chữ Before/After nằm trong `src/content/ui.json`. Trang dùng danh sách `retouchPairs` ở `src/config/site.json`: mỗi mục ghép một `beforeMediaId` với một `afterMediaId`. Đổi thứ tự, ẩn hoặc thêm cặp tại danh sách này; không cần sửa component. Các mã media nằm trong `src/content/media.json`, còn JPG web ở `public/media/portraits-retouch/comparisons/`.

Khi thay một cặp, chuẩn bị hai ảnh **cùng cảnh, cùng crop và cùng kích thước pixel**; cập nhật `posterSrc`, `alt`, `width`, `height` và cả đường dẫn `srcSet` của hai bên. Có thể bỏ `srcSet` nếu mỗi bên chỉ có một file. Mở demo để kiểm tra đường chia qua mặt người, mép vật thể và chữ; kiểm tra cả ảnh ngang lẫn dọc. Trên desktop chỉ cần rê chuột lên ảnh; thanh chia giữ vị trí cuối khi chuột rời ảnh. Bàn phím dùng phím mũi tên/Home/End, còn mobile nhấn giữ để xem bản gốc rồi thả. Nút mũi tên bên dưới chuyển cặp. Giữ ảnh gốc trong `HEW-media/Photo Retouch/` chỉ để đọc.

### Đổi cách trình bày mà không sửa code

Mở **`src/config/presentation.json`**:

```json
{
  "projectTones": ["paper", "ink", "accent"]
}
```

- `projectTones`: thứ tự nền dự án đang hiện; `paper` = kem, `ink` = đen, `accent` = cam. Danh sách lặp khi hết màu. Ví dụ `["ink"]` để tất cả nền đen, `["paper", "ink"]` để xen kẽ kem/đen. Không để `[]`. Màu đi theo thứ tự hiển thị, nên thêm/ẩn/đổi thứ tự dự án vẫn tự sắp xếp.

Mở **`src/config/motion.json`** để bật/tắt intro, ảnh nối vào hero (`intro.imageHandoff`), stack (`stackProjects`), badge theo chuột (`pointerFollow`) hoặc dịch nhẹ heading Work (`sectionDrift`). Các bước và giá trị cho phép ở [MOTION_GUIDE](docs/MOTION_GUIDE.md). Sau khi sửa, lưu file, chạy `npm run check:content`, xem demo rồi chạy `npm run build` trước khi cập nhật website.

## 3. Sửa, ẩn và sắp xếp dự án

Mở `src/content/projects.json`. Mỗi cặp `{ ... }` là một dự án.

1. Tìm dự án theo `slug` hoặc `title`.
2. Đổi `title`, `kind` (loại tác phẩm), `summary` (câu ngắn trên card), `overview` (giới thiệu trong case).
3. Có thể thêm `alternateTitle` để hiển thị tên phụ dưới tên chính và `titleLanguage` (ví dụ `"vi"`) để trình đọc màn hình phát âm tên chính đúng ngôn ngữ. Phim dùng tên chính **Chuyến Đi Bất Ý**, tên phụ **Chuyen Di Bat Y**. `role` và `year` chỉ thêm khi đã xác nhận. Nếu chưa có, bỏ cả dòng; không thêm vai trò dựa trên nghề chung. Đừng dùng chuỗi rỗng cho `role`.
4. Để ẩn: đổi `"visible": true` thành `"visible": false`. Dự án biến mất khỏi work, next project và đường dẫn case. Link cũ sẽ hiện trang “out of frame”.
5. Để hiện lại: đổi thành `true`.
6. Để đổi thứ tự: đổi `order`. Số nhỏ đứng trước; các dự án đang hiện phải có số khác nhau. Bạn có thể dùng 10, 20, 30 để dễ chèn dự án sau.
7. `coverMediaId` trỏ đến một mã trong `media.json`; `galleryMediaIds` là danh sách mã ảnh/video gallery. Card và case dùng chung cover.

Bản refinement tự sắp xếp title → credit → ảnh → mô tả trên mobile. Trên desktop, ảnh chiếm phần rộng hơn. Nếu thêm tiêu đề/mô tả dài khiến một thẻ không vừa cửa sổ, Work tự cuộn bình thường thay vì xếp chồng; đây là bảo vệ khả năng đọc, không phải lỗi. Không cần rút bớt nội dung hoặc sửa layout để ép stack. Poster dùng `objectFit: "contain"` theo MEDIA_GUIDE. Nhãn “My role” và “Film recognition” đã có trong `ui.json`; vai trò lấy từ `role`, giải của phim từ `recognition`, không gộp hai trường.

Đừng đổi `slug` của dự án đã công khai nếu chưa chuẩn bị redirect từ link cũ. Slug dùng chữ thường, không dấu, số và gạch nối.

Các block bổ sung đều tự hiện khi có dữ liệu. Ví dụ cấu trúc (thay bằng thông tin đã xác nhận, không dùng nguyên nội dung minh họa để phát hành):

```json
"contributions": ["Công việc cụ thể bạn đã thực hiện"],
"decisions": [
  { "title": "Quyết định đã xác nhận", "body": "Giải thích ngắn và có căn cứ", "mediaId": "ma-anh-minh-hoa" }
]
```

`mediaId` trong decisions là tùy chọn. Nếu chưa có brief/process, bỏ các trường này; website sẽ giữ case gọn. Giải HUGFIA thuộc **phim**, credit của Hậu là **Director of Photography**.

## 4. Thêm một dự án mới

1. Chuẩn bị ảnh web có quyền sử dụng. Xem MEDIA_GUIDE để đặt tên/kích thước.
2. Tạo folder `public/media/work/ten-du-an/`, đặt `cover.webp` và các ảnh khác vào đó.
3. Mở `src/content/media.json`, thêm bản ghi trước ngoặc `}` cuối cùng. Thêm dấu phẩy sau bản ghi đang đứng cuối:

   ```json
   "du-an-moi-cover": {
     "posterSrc": "/media/work/ten-du-an/cover.webp",
     "alt": "Mô tả chính xác ảnh cover của bạn",
     "width": 1600,
     "height": 1067,
     "isPlaceholder": false
   }
   ```

4. Mở `src/content/projects.json`, thêm bản ghi trước ngoặc `]` cuối cùng, thêm dấu phẩy sau dự án trước đó:

   ```json
   {
     "slug": "ten-du-an",
     "visible": true,
     "order": 7,
     "title": "Tên dự án đã xác nhận",
     "kind": "Photography",
     "summary": "Một câu ngắn về tác phẩm.",
     "overview": "Giới thiệu đã xác nhận về dự án.",
     "coverMediaId": "du-an-moi-cover",
     "galleryMediaIds": [],
     "contentLevel": "showcase"
   }
   ```

5. Thay các chuỗi minh họa bằng thông tin của bạn. `order` phải khác các dự án đang hiện. Gallery có thể để `[]` lúc chưa đủ ảnh.
6. Để thêm gallery: tạo các mã media như bước 3 rồi ghi vào `galleryMediaIds`, ví dụ `["du-an-moi-anh-1", "du-an-moi-anh-2"]`.
7. Lưu, chạy `npm run check:content`, mở demo và thử card/link mới. Danh sách tự thêm một hàng dự án và cập nhật số thứ tự/số lượng; không cần sửa component hoặc router.

## 5. Kiểm tra thay đổi trước khi đưa lên website

1. Chạy `npm run check:content`. Cần thấy `Content valid`.
2. Chạy `npm run build`. Cần chạy hết mà không có `error`.
3. Chạy `npm run preview`, mở địa chỉ `Local` trong Terminal. Dev và preview mặc định chỉ lắng nghe tại `127.0.0.1`; chỉ máy đang chạy mở được demo.
4. Xem hero, liên hệ, work và các case đã chỉnh. Refresh một đường dẫn `/work/...`.
5. Thu nhỏ màn hình, thử Menu, thử nút Original/Edited. Kiểm tra ảnh không bị crop mất chủ thể.
6. Khi có video thật, kiểm tra phát/dừng trên điện thoại thật và Safari/iOS; test Chromium không đảm bảo mọi codec chạy trên mọi thiết bị.
7. Ctrl+C để dừng preview. Nếu sửa tiếp, build lại trước khi preview hoặc upload `dist/`.

Nếu dùng Git, commit các file nội dung, media và source. Không commit `node_modules/`, `dist/`, `.env` hoặc ảnh gốc dung lượng lớn. `.gitignore` đã chuẩn bị sẵn. Nếu dùng GitHub Desktop, xem tab Changes, viết mô tả rõ rồi Commit; Push chỉ khi bạn muốn đưa source lên repository. Source trên GitHub không tự biến thành website công khai nếu chưa kết nối hosting/deploy.

## 6. Xuất bản và cập nhật sau này

**Website hiện chưa được xuất bản.** Các bước dưới đây là hướng dẫn khi bạn quyết định công khai. Chọn hosting static có SPA fallback; cách đơn giản là upload `dist/` qua giao diện Netlify. Tên nút trên dịch vụ có thể thay đổi theo phiên bản.

### Lần đầu xuất bản thủ công

1. Hoàn thành kiểm tra ở phần 5 và kiểm tra quyền công bố ảnh, thông tin dự án, contact. Xem CONTENT_TODO.
2. Trong Terminal chạy `npm run build`; thư mục `dist/` mới chứa website hoàn chỉnh.
3. Đăng nhập Netlify và chọn tạo site/project bằng cách triển khai thủ công (manual deploy / drag and drop).
4. Kéo **toàn bộ thư mục `dist/`** vào vùng upload. Không kéo thư mục project, `src/` hoặc chỉ `index.html`.
5. Dịch vụ cấp một URL công khai. Mở homepage rồi mở trực tiếp `URL/work/chuyen-di-bat-y` và refresh. File `_redirects` trong `dist/` cung cấp fallback cho các case.
6. Đổi tên site và thêm domain riêng trong cài đặt hosting nếu muốn. SSL/domain do hosting hướng dẫn; không cần đổi source khi website ở root domain.

### Mỗi lần cập nhật sau đó

1. Sửa JSON/media trên máy.
2. Kiểm tra, build và preview lại như phần 5.
3. Đăng nhập hosting, **mở đúng site đang dùng**, vào phần Deploys và upload `dist/` mới. Đừng tạo một site mới cho mỗi lần cập nhật.
4. Chờ deploy hoàn tất rồi mở link công khai; reload và kiểm tra cả trang đã sửa, contact và một case trực tiếp.
5. Nếu lỗi, dùng bản deploy trước trong lịch sử hosting để phục hồi, rồi sửa trên máy và build/upload lại.

Chỉ thay file trong project hoặc sửa trên GitHub sẽ không cập nhật một site triển khai thủ công. Cần build lại và upload. Sau này nếu kết nối GitHub với hosting, dùng build command `npm run build`, publish directory `dist`, Node tương thích từ 22.12; deployment sẽ chạy theo branch đã chọn. Chưa có kết nối hoặc workflow tự động nào được tạo trong tác vụ này.

Không dán đường dẫn Canva edit hoặc link folder vào video player. Media phải là file trong `public/media` hoặc URL HTTPS trực tiếp, ổn định. Với hosting khác, cấu hình SPA rewrite trước khi phát hành; xem README.

## 7. Ảnh trong bố cục mới

Work dùng cover lớn cạnh phần mô tả trên desktop và một cột trên mobile. Giữ cùng media ID nên bạn thay ảnh trong `media.json` mà không sửa layout. Tên phim, credit và giải vẫn đọc được sẵn; không phụ thuộc hover. Hướng dẫn media và srcSet nằm trong MEDIA_GUIDE. Intro và motion hiện tại xem phần 8 bên dưới.

## 8. Chỉnh intro và chuyển động

Mở `src/config/motion.json` để bật/tắt intro, đổi thời gian, bật/tắt panel work xếp lớp hoặc badge theo chuột. Hướng dẫn từng bước và bảng giá trị ở [MOTION_GUIDE](docs/MOTION_GUIDE.md). `enableMotion:false` trong `src/config/site.json` vẫn là công tắc tắt toàn bộ motion. Intro hiện chạy lại sau mỗi reload homepage, dài 3400 ms; link thẳng case/section và chế độ Reduce motion vẫn bỏ qua. Có thể dùng `/?intro=1` để kiểm tra replay. Bio/dự án/credit giữ nguyên; chỉ ảnh intro và hero được thay trong vòng này.

## Lựa chọn chuyển động của người xem (bản 2026.10.06-motion-controls)

Trên desktop có công tắc **Reduce motion**, mobile mở **Menu** để thấy. **On** là giảm chuyển động; **Off** là hiệu ứng đầy đủ. Lần đầu web theo hệ điều hành; sau khi người xem bấm thì ưu tiên lựa chọn đó và lưu trên trình duyệt. Bạn không cần sửa code hoặc thiết lập Windows để thử hai chế độ. Nhãn nút nằm trong `src/content/ui.json`.

Giữ `enableMotion:true` trong `src/config/site.json` để người xem tự chọn. `false` là tắt toàn site, công tắc không hiển thị. Nội dung dài hoặc cửa sổ thấp có thể làm stack tự chuyển về cuộn thường; điều này giữ chữ không bị che, không làm mất dữ liệu. Hướng dẫn Windows, replay intro và chẩn đoán phiên bản nằm trong [MOTION_GUIDE](docs/MOTION_GUIDE.md). Quy trình sửa nội dung → build → xem preview → cập nhật hosting sau này vẫn theo các bước ở trên; vòng này chưa xuất bản website.

## Album/trailer của Chuyến Đi Bất Ý

Mở `src/content/projects.json`, tìm slug `chuyen-di-bat-y`. Sửa `galleryTitle` để đổi tiêu đề album. Các mã `film-album-02` đến `film-album-13` trong `galleryMediaIds` quyết định thứ tự ảnh; bỏ một mã nếu muốn ẩn ảnh, giữ nguyên các mã còn lại. `galleryLayout: "scroll"` là album cuộn, `"grid"` quay về gallery lưới. `trailerMediaId` trỏ tới media chứa video Trailer dưới Overview. Đường dẫn ảnh/video nằm trong `src/content/media.json`; xem mục Chuyến Đi Bất Ý trong MEDIA_GUIDE. Không cần sửa component để đổi ảnh/video/thứ tự.

Ở desktop/laptop có con lăn và đủ chiều cao, cuộn trang sẽ lần lượt đưa từng ảnh album vào giữa; nút tới/lùi vẫn dùng được. Thanh cuộn ngang được ẩn nhưng mobile/cửa sổ thấp vẫn vuốt ngang được. Chế độ giảm chuyển động giữ album cuộn ngang và bỏ hiệu ứng phóng ảnh.

Hiện `src/config/site.json` dùng mediaMode live và enableHoverPreview true. Chuyến Đi Bất Ý có trailer, TVC TCV REBRAND và Music videos có các clip ngắn; những dự án còn lại vẫn dùng ảnh. Trailer hiện dưới Overview là một player có poster: chỉ tải và tự phát không tiếng khi cuộn tới, tạm dừng khi ra khỏi màn hình; điều khiển video cho phép phát/tạm dừng và bật tiếng. Muốn tắt toàn bộ video tạm thời, đổi mediaMode sang demo; giảm motion ngăn tự phát hover preview/trailer và dùng ảnh tĩnh cho các cảnh TVC/Music videos.

## Music videos

Trong `src/content/projects.json`, dự án `music-videos` có `musicVideos` gồm ba MV theo đúng thứ tự hiển thị. Sửa `title`, `year`, `role`, `videoUrl` và `clipMediaIds` tại từng mục để đổi tên, năm, vai trò, link MV đầy đủ hoặc thứ tự best-cut. Hiện số clip lần lượt là 1–3–1; `galleryMediaIds` để trống nên không hiện “Selected frames”. `overview` điều khiển đoạn giới thiệu; nội dung giao diện dùng tiếng Anh, tên riêng giữ nguyên tiếng Việt.

Poster và MP4 không tiếng nằm trong `public/media/work/music-videos/`, đường dẫn được khai báo tại `src/content/media.json`. `motionVideoSrc` phát lặp, không tiếng khi clip vào khung nhìn; Reduce motion, chế độ demo hoặc lỗi video vẫn hiện poster. Nếu thay clip, cập nhật poster tương ứng và giữ media gốc trong `HEW-media/Music-Video/` chỉ để đọc.

## Album Wellbridge Global × Juno Hair

Trong `src/content/projects.json`, dự án `juno-hair` dùng `galleryLayout: "album"`. `galleryMediaIds` đang xếp `juno-photo-1` đến `juno-photo-9`, tương ứng `1.jpg`–`9.jpg`; đổi thứ tự hoặc ẩn ảnh bằng cách sửa danh sách này. `coverMediaId` dùng banner hai logo, đồng thời là ảnh card ở trang chủ. Tên file, kích thước, alt và ảnh nhỏ `srcSet` nằm trong `src/content/media.json`. Khi thay ảnh, giữ đúng tỉ lệ file web và cập nhật cả bản lớn lẫn bản `-900`, hoặc xóa `srcSet` nếu chỉ dùng một file. Ảnh ngang tự tách xuống dưới album; phụ đề của ảnh này nằm ở `caption` trong media config. Dải album dùng ảnh dọc: desktop hover/focus mở rộng một ảnh thành khung gần vuông; mobile vuốt từng ảnh hoặc dùng hai nút mũi tên. Ảnh trong dải có thể crop theo `objectFit`/`objectPosition`, còn link ảnh mở file web đầy đủ. Tên file và số thứ tự không hiện trên trang; thanh cuộn ngang được ẩn.

## Events & Experiences — ba album ảnh

Trang `/work/site-tour` giữ nguyên đường dẫn cũ để các liên kết đã chia sẻ vẫn hoạt động. Trong `src/content/projects.json`, mục `photoAlbums` chứa ba bộ theo thứ tự hiển thị. Sửa `title` của từng bộ để đổi tên, sửa/sắp xếp `mediaIds` để đổi thứ tự hoặc ẩn ảnh; không cần sửa component. `coverMediaId` chọn banner dùng chung cho card trang Work và đầu trang dự án. `kind` là nhãn phân loại, còn `overview` là đoạn giới thiệu.

Mỗi mã ảnh nằm trong `src/content/media.json` với `posterSrc`, `alt`, kích thước thật và `srcSet`. Ảnh dọc và ngang cùng đi vào dải thẻ: desktop hover hoặc focus mở rộng ảnh được chọn; mobile vuốt từng ảnh hoặc dùng nút mũi tên. Thẻ có thể crop để đều bố cục, nhưng bấm ảnh sẽ mở bản web đủ khung hình. Khi thay ảnh, tạo cả bản lớn và bản `-900` trong `public/media/work/events-experiences/`, rồi cập nhật đồng bộ đường dẫn, kích thước, alt và `srcSet`. Nếu chỉ có một bản, xóa `srcSet` cũ. File gốc trong `HEW-media` chỉ dùng để đọc.

## Cuts & Stories — Short-form và Long-form

Trong `src/content/projects.json`, dự án `short-form` có `shortLong.clipMediaIds` để xếp/ẩn các clip dọc và `shortLong.longVideos` để đổi thứ tự, tiêu đề tiếng Anh, link YouTube và ảnh banner của ba video dài. Tên file gốc không hiện trên trang. `title`, `kind`, `summary`, `overview` điều khiển tên, nhãn loại dự án và mô tả. Hai phần Short-form và Long-form nối tiếp nhau: desktop hiển thị năm poster dọc trên một hàng và cụm ba poster ngang; tablet ba cột dọc, mobile hai cột dọc rồi một cột Long-form.

Mỗi clip dọc có một mã trong `src/content/media.json`: `posterSrc` là ảnh tĩnh, `fullVideoSrc` trỏ tới MP4 web đầy đủ. Khi thay clip, giữ bản gốc ngoài project; xuất bản web H.264/AAC, cập nhật poster, kích thước và URL trong media config. Bấm nút Play trên poster để mở player lớn có tiếng; MP4 chỉ được gắn sau thao tác này. Đóng player hoặc ẩn tab sẽ dừng clip. Các nhãn `Clip`, số lượng và tên phần nằm trong `src/content/ui.json`; có thể đổi chữ mà không sửa component. `longVideos[].videoUrl` nhận YouTube watch URL, `posterMediaId` trỏ tới banner tĩnh; bấm banner mở link tương ứng trong tab mới, không tạo iframe. Thẻ chỉ hiện tiêu đề video, không hiện dòng “Watch on YouTube”. Xem thêm mục Cuts & Stories trong MEDIA_GUIDE.

## TVC TCV REBRAND

Trong `src/content/projects.json`, dự án `tcv-rebrand` dùng `coverMediaId` cho banner và sáu mã trong `galleryMediaIds` cho thứ tự album. Trường `production.storyboard` điều khiển tiêu đề, câu giải thích và ảnh storyboard; `production.crew` điều khiển ảnh ekip; `production.credits.groups` chứa từng nhóm, vai trò (`role`) và tên (`names`). Sửa tên/vai trò tại đây, không cần sửa giao diện. Bảng credits là chữ thật trên nền trắng, không dùng ảnh `credits.png` làm nội dung trang.

Ảnh poster và đường dẫn clip nằm trong `src/content/media.json`. Với mỗi cảnh TVC, `posterSrc` là ảnh tĩnh, `motionVideoSrc` là MP4 ngắn phát không tiếng khi cảnh đó ở trong khung nhìn; Reduced motion và chế độ demo chỉ hiện poster. Nếu thay clip, cập nhật cả poster và các đường dẫn `srcSet` tương ứng; giữ file gốc trong `HEW-media` để đối chiếu, chỉ đưa bản web vào `public/media/work/tcv-rebrand/`.
