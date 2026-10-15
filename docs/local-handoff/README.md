# Chuyển từ cloud sang Codex local trên Windows

Bộ bàn giao ngày **08/10/2026**. Website chưa xuất bản. Nhánh chính để tiếp tục công việc là **`codex/portfolio-demo`**, không phải `main` và không phải những ZIP ngày 05–06/10.

## 1. Nguồn chính và trạng thái đã duyệt

- Source ứng dụng đã duyệt: commit **`2e860f0740e98b1e55c542348c554bb532f18e2a`**, release **`2026.10.08-film-media`**. Commit bàn giao sau đó chỉ bổ sung/cập nhật tài liệu và công cụ kiểm tra, không đổi ứng dụng.
- GitHub giữ source, lịch sử Git, toàn bộ media web và clip review. Chọn commit mới nhất của nhánh trên. Không reset về baseline nếu có thay đổi mới hơn.
- `src/config/release.json`, các JSON trong `src/content/` / `src/config/` và file thực trong `public/media/` là dữ liệu ứng dụng hiện hành. Không tạo một bộ cấu hình thứ hai.
- Hiện có **6 dự án hiển thị, 49 media entries**; `mediaMode:live`, `enableHoverPreview:true`. Chỉ Chuyến Đi Bất Ý có video URL. Vite khóa **7.3.6**; package và lockfile giữ nguyên.
- Intro/hero đã duyệt: ba ảnh thật, 3400 ms, hiện lại mỗi reload homepage. Hero-text hiện dần theo cuộn và ngược lại. Phim đã duyệt banner 01, preview MP4 8 giây, trailer dưới Overview, album 02–13.
- `QA_REPORT.md` và `CHANGELOG.md` mới nhất ở đầu file. Các section cũ là lịch sử. Kế hoạch ban đầu, storyboard và bảng NBNZIA có ngày/baseline riêng; không dùng số liệu cũ như kết quả mới.

## 2. Trước khi bắt đầu trên máy bạn

1. **Giữ nguyên thư mục Windows đang chạy được và folder media gốc.** Không giải nén/clone đè lên bản đó. Nếu có nội dung bạn đã sửa riêng, giữ bản dự phòng; Codex local cần so sánh trước khi gộp.
2. Cài Git for Windows, Node.js LTS được hỗ trợ (tối thiểu 22.12; cloud đang dùng 24.19), VS Code và tiện ích **Codex của OpenAI**. Đăng nhập qua màn hình chính thức; không gửi mật khẩu/token/cookie vào hội thoại.
3. Tạo thư mục `D:\HEW-dev` cho source và `D:\HEW-backup` cho bản dự phòng. Folder `D:\HEW-media\TVC TCV Rebranding` tiếp tục giữ **media gốc**, không đặt trong `public`.

## 3. Lấy source đúng phiên bản — cách ưu tiên

Mở Command Prompt (`cmd`). Nhập từng dòng. Nếu thư mục đích đã tồn tại, chọn tên thư mục mới, không xóa bản đang có.

```bat
mkdir D:\HEW-dev
git -c core.autocrlf=false clone --branch codex/portfolio-demo --single-branch https://github.com/trunghaungo/trung-hau-portfolio.git "D:\HEW-dev\trung-hau-portfolio"
cd /d "D:\HEW-dev\trung-hau-portfolio"
git config core.autocrlf false
git status --short
git log -1 --oneline
node scripts/verify-local-handoff.mjs
```

- `git status --short` không in gì nghĩa là chưa có thay đổi local. Nếu có, giữ nguyên và kiểm tra, không dùng reset/clean.
- `verify-local-handoff` phải báo mọi file khớp, 0 missing/changed. Công cụ chỉ đọc, không xóa/sửa/tải file. SHA-256 kiểm tra **bytes thực**, gồm media và tài liệu.
- `core.autocrlf=false` giữ đúng bytes khi clone trên Windows. Nếu tự clone theo cách khác và chỉ text đổi LF→CRLF, checksum cũng báo changed: đối chiếu trước, không chép đè media để “sửa”.
- Đây là checksum của **lần bàn giao này**. Sau khi bạn chủ động sửa nội dung, changed là bình thường. Khi GitHub có commit mới thay source, bản mới cần đối chiếu/reseal riêng, không reset về bản cũ chỉ để checksum đạt.
- Nếu clone yêu cầu đăng nhập, dùng Git Credential Manager/luồng GitHub chính thức. Quyền cloud không tự chuyển sang Windows.

Nếu chưa dùng được Git, tải **Code → Download ZIP trên đúng nhánh** rồi giải nén vào thư mục mới. Vẫn chạy verifier và demo được, nhưng ZIP không giữ lịch sử/.git; nên clone trước khi làm việc lâu dài hoặc push.

## 4. Bản dự phòng offline và media gốc

Bàn giao có `HEW-source-history.bundle`: source và lịch sử của nhánh công việc, không chứa node_modules/dist, credentials hay cấu hình cloud ngoài repo. Đây là bản dự phòng, không phải source thứ hai để sửa song song.

Nếu GitHub chưa truy cập được, tải bundle vào `D:\HEW-backup`, kiểm tra SHA-256 theo `TRANSFER_SHA256SUMS.txt` bằng PowerShell (`Get-FileHash`), rồi dùng cmd:

```bat
git -c core.autocrlf=false clone --branch codex/portfolio-demo "D:\HEW-backup\HEW-source-history.bundle" "D:\HEW-dev\trung-hau-portfolio"
cd /d "D:\HEW-dev\trung-hau-portfolio"
git config core.autocrlf false
git bundle verify "D:\HEW-backup\HEW-source-history.bundle"
git remote set-url origin https://github.com/trunghaungo/trung-hau-portfolio.git
node scripts/verify-local-handoff.mjs
```

Git clone kiểm tra bundle khi nhập lịch sử; `git bundle verify` phía trên chạy trong repo vừa clone. Sau khi có mạng, `git fetch origin` và đối chiếu nhánh trước khi push. Không force push.

**Bốn ZIP nguồn độc lập**, mỗi ZIP dưới 32 MiB, không phải các part cần nối:

| ZIP | Nội dung chưa có trong repo |
| --- | --- |
| `HEW-originals-01-portfolio.zip` | PDF portfolio gốc đã dùng |
| `HEW-originals-02-reference.zip` | Một bản clip NBNZIA tham khảo; hai upload cùng checksum được gộp một bản |
| `HEW-originals-03-intro-hero.zip` | RAR ảnh intro/hero và hai clip tham khảo intro, hero-text |
| `HEW-originals-04-film-images.zip` | RAR PNG ảnh phim gốc, gồm cả B01–B03 chưa dùng |

Tải nếu chưa giữ các file gốc này. Giải nén tất cả vào cùng thư mục mới, ví dụ **`D:\HEW-media\cloud-originals`**. Bên trong có `sources/` và `references/`; giữ nguyên cấu trúc để kiểm tra:

```bat
cd /d "D:\HEW-dev\trung-hau-portfolio"
node scripts/verify-local-handoff.mjs --originals "D:\HEW-media\cloud-originals"
```

Phải báo **6/6 originals khớp**. Xem [inventory](INVENTORY.md), [checksum chi tiết](integrity.json). Full trailer, storyboard PDF và handoff Markdown đã byte-identical trong repo nên không đóng lặp vào ZIP nguồn. M3u8 có URL ký/hạn dùng đã bị loại khỏi website theo xác nhận của bạn; không xuất token sang GitHub hoặc bộ bàn giao. Nếu bạn cần lưu playlist nguyên bản, giữ bản upload gốc trên máy của bạn.

Các ZIP source cũ, build dist, node_modules, browser cache, file tạm /tmp và log khám phá dư thừa không dùng làm bản bàn giao. Bằng chứng/clip QA quan trọng đã nằm trong docs của repository. Bản backup không được đưa vào public assets.

## 5. Mở Codex local và bàn giao ngữ cảnh

1. Trong VS Code: **File → Open Folder** → `D:\HEW-dev\trung-hau-portfolio`.
2. Mở Codex, chọn phiên chạy **Local** nếu công cụ có lựa chọn Local/Cloud. Làm việc tại thư mục vừa mở. Phiên cloud cũ không tự trở thành phiên local, lịch sử chat không tự chuyển.
3. Mở [LOCAL_CODEX_PROMPT.md](LOCAL_CODEX_PROMPT.md), chép toàn bộ prompt vào phiên local mới.
4. Prompt đã ghi đường dẫn `D:\HEW-media\TVC TCV Rebranding`. Nếu thực tế khác, sửa đúng dòng đó. Codex cần thử đọc thư mục và báo kết quả; nếu môi trường xin quyền, chỉ cho phép phạm vi cần thiết. Không giả định rằng chọn local là đã có mọi quyền.
5. Bước đầu ở local **chỉ xác nhận source + dữ liệu và lập danh sách media TCV**, chưa tự thay dự án hoặc chỉnh layout. Bạn gửi tiếp yêu cầu cụ thể sau khi nhận danh sách.

## 6. Chạy demo và xác nhận Windows

Trong Terminal tại thư mục source:

```bat
node --version
npm ci
npm audit
npm run build
npm run dev
```

Giữ Terminal mở, dùng đúng URL ở dòng **Local** (thường `http://127.0.0.1:5173/`). Dev/preview vẫn bind localhost. Không mở index.html bằng nhấp đúp. `npm ci` dùng lockfile, không tự nâng dependency. Nếu cài đặt lỗi, giữ log để chẩn đoán; đừng đổi package/lockfile theo phỏng đoán.

Kiểm tra: Reduce motion Off → reload intro ba ảnh; cuộn xuống/ngược hero-text; hover banner phim; mở case → Play trailer; album 02–13; Back; menu mobile và Reduce motion On vẫn đọc/điều hướng được. Preview muted, trailer có audio sau bấm phát. Dừng server bằng Ctrl+C.

Tùy chọn chạy suite ở Terminal mới, sau khi build (cài Chromium Playwright là bước riêng, cần mạng):

```bat
npx playwright install chromium
npm test
```

Suite tự mở preview 4173 và dev 5174. Nếu cổng đang có server cũ, dừng server cũ trước để tránh test nhầm source. Đừng mang các biến/chromium path `/tmp`, `/usr/bin` của cloud sang Windows. Quay clip bằng các script cũ có thể cần FFmpeg/đường dẫn Linux riêng; không phải điều kiện để chạy website. Chưa xác nhận script quay clip trên Windows.

Cloud release trước đã đạt **83/83 tests**. Đó không phải kết quả Windows và không phải suite chạy lại ở vòng bàn giao. Kết quả mới của việc chuyển được ghi trong [VALIDATION.md](VALIDATION.md).

## 7. Tránh mất hoặc nhân đôi dữ liệu về sau

- Một working folder hoạt động, một nhánh công việc; không sửa song song bản ZIP cũ, bundle clone và clone GitHub.
- File gốc ở `D:\HEW-media`; bản web tối ưu ở `public/media`. Chúng có mục đích khác nhau. Không copy toàn bộ folder gốc vào public. Kiểm tra checksum trước khi tạo bản trùng; responsive variants/preview ngắn là các bản phục vụ web có chủ đích.
- Không tự xóa media chưa dùng hoặc có caption khác chỉ vì tên giống. So sánh hash/manifest/usage rồi mới đề xuất. Existing audit logs giống nhau thuộc các lần QA khác nhau, giữ provenance lịch sử.
- Trước khi tiếp tục: `git status`, `git fetch origin`, đối chiếu `git log`. Nếu sạch và remote mới hơn, chỉ `git pull --ff-only`; nếu có thay đổi local hoặc phân nhánh, so sánh và gộp có kiểm soát, không reset/clean/force push.
- Sau mỗi vòng đã kiểm tra: commit source + media web + báo cáo thực; push nhánh hiện tại khi được yêu cầu. Không đính kèm mật khẩu/token/cookie, originals, file benchmark hoặc clip tham khảo vào public.
- Handoff này không chuyển cài đặt cloud, session trình duyệt, lựa chọn motion hay quyền GitHub sang máy bạn. Website không cần secret/API/database để chạy.
- Giữ cloud và các bản gốc hiện có cho tới khi clone, checksum và demo Windows đã được bạn xác nhận. Khi đó mới coi việc chuyển hoàn tất.
