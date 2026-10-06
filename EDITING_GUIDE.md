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
| `contact.socials` | Danh sách link mạng xã hội |
| `experience`, `education`, `tools`, `approach` | Kinh nghiệm (có `description` tùy chọn cho phạm vi công việc), học vấn, công cụ và cách làm việc |

Ví dụ sửa phần giới thiệu: thay hai câu trong `bio` bằng câu của bạn, giữ dạng mảng:

```json
"bio": [
  "Đoạn giới thiệu thứ nhất do bạn viết.",
  "Đoạn giới thiệu thứ hai do bạn viết."
]
```

Giao diện mặc định tiếng Anh. Các tiêu đề section và nhãn nút nằm trong `src/content/ui.json`; sửa phần văn bản bên phải để đổi tiêu đề hoặc dịch nhãn. Tên menu điều hướng nằm trong `navigation` ở `src/config/site.json`. Nếu chuyển toàn bộ nội dung sang tiếng Việt, đổi `language` trong file đó thành `vi`; trường này khai báo ngôn ngữ cho trình duyệt, **không tự dịch các nhãn giao diện**. Đổi `siteTitle` và `description` nếu đổi tên/định vị.

Ở bản mới, ảnh intro, ảnh hero và ảnh nhỏ Contact cùng lấy từ mã `heroMediaId` trong `src/config/site.json`. Muốn thay cả ba: đổi ảnh/đường dẫn của mã đó trong `src/content/media.json`, cập nhật hoặc xóa `srcSet` cũ theo MEDIA_GUIDE. Không cần sửa ba chỗ trong layout. Phạm vi công việc mở trong Experience lấy từ `experience[].description`; tên công ty, vai trò và thời gian vẫn luôn hiển thị.

### Đổi cách trình bày mà không sửa code

Mở **`src/config/presentation.json`**:

```json
{
  "projectTones": ["paper", "ink", "accent"],
  "contactImage": true,
  "experienceAccordion": true
}
```

- `projectTones`: thứ tự nền dự án đang hiện; `paper` = kem, `ink` = đen, `accent` = cam. Danh sách lặp khi hết màu. Ví dụ `["ink"]` để tất cả nền đen, `["paper", "ink"]` để xen kẽ kem/đen. Không để `[]`. Màu đi theo thứ tự hiển thị, nên thêm/ẩn/đổi thứ tự dự án vẫn tự sắp xếp.
- `contactImage`: đổi thành `false` để ẩn ảnh nhỏ ở Contact.
- `experienceAccordion`: đổi thành `false` để hiện toàn bộ mô tả kinh nghiệm cùng lúc.

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

Mở `src/config/motion.json` để bật/tắt intro, đổi thời gian, bật/tắt panel work xếp lớp hoặc badge theo chuột. Hướng dẫn từng bước và bảng giá trị ở [MOTION_GUIDE](docs/MOTION_GUIDE.md). `enableMotion:false` trong `src/config/site.json` vẫn là công tắc tắt toàn bộ motion. Muốn xem lại intro trong cùng tab, mở demo với `/?intro=1`. Các file bio/dự án/media và ảnh không thay đổi trong round motion này.
