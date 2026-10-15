# Inventory bàn giao — 08/10/2026

## Source / dữ liệu hiện hành

Ứng dụng đã duyệt ở `2e860f0`, nhánh `codex/portfolio-demo`, release `2026.10.08-film-media`. Commit bàn giao bổ sung docs/helper, không đổi runtime. Source, package/lockfile, 6 dự án, 49 media records, 141 file public và clip QA nằm trong Git. Không có media public trùng bytes; responsive variants/preview/trailer có mục đích khác nhau. File content/media config giữ nguyên ở vòng chuyển.

| Dữ liệu | Nơi duy nhất dùng để tiếp tục |
| --- | --- |
| Bio, contact, experience | `src/content/profile.json` |
| Sáu project, order/visibility/credit, routes | `src/content/projects.json` |
| URL ảnh/video, kích thước/caption/alt | `src/content/media.json` |
| Label giao diện | `src/content/ui.json` |
| Flags media/motion, intro, presentation | `src/config/` |
| File web/ảnh responsive/video thật | `public/media/` |
| Clip review, ảnh, QA, handoff/storyboard | `docs/` |
| Các gốc TCV mới | `D:\HEW-media\TVC TCV Rebranding` — cloud **chưa đọc**, local phải xác minh |

## Sáu file gốc riêng — mỗi nội dung một bản

Không commit lại các originals vào source. Bốn ZIP độc lập nằm ngoài repo; checksum file gốc trong integrity.json, checksum ZIP/bundle trong TRANSFER_SHA256SUMS.txt đi kèm. Tên export chỉ chuẩn hóa để dễ lưu; bytes giữ nguyên.

| Tên upload | Đường dẫn khi giải nén | ZIP | Bytes |
| --- | --- | --- | --- |
| Bản sao của Portfolio Trung Hau (1).pdf | `sources/portfolio-trung-hau.pdf` | `HEW-originals-01-portfolio.zip` | 27,965,783 |
| Tham khao template website.mp4 | `references/nbnzia-screen-recording.mp4` | `HEW-originals-02-reference.zip` | 33,308,075 |
| Intro.Hero.rar | `sources/intro-hero-photos.rar` | `HEW-originals-03-intro-hero.zip` | 17,174,880 |
| intro-hero.mp4 | `references/intro-hero-reference.mp4` | `HEW-originals-03-intro-hero.zip` | 8,003,777 |
| hero-text-nbnzia.mp4 | `references/hero-text-reference.mp4` | `HEW-originals-03-intro-hero.zip` | 2,134,489 |
| Ban_cat_nguyen_goc_PNG.rar | `sources/chuyen-di-bat-y-photos.rar` | `HEW-originals-04-film-images.zip` | 32,786,498 |

## Tránh đóng lặp / thất lạc

- Hai upload `Tham khao template website.mp4` có SHA-256 giống hệt: chỉ một file reference được đóng gói; vẫn giữ clip là tham khảo, không đưa vào public/tác phẩm.
- `Chuyen-Di-Bat-Y-Trailer.mp4` giống byte-for-byte với `public/media/work/chuyen-di-bat-y/trailer.mp4` (6.800.606 B); không thêm vào ZIP originals.
- Hai tài liệu layout handoff/storyboard giống byte-for-byte với `docs/handoff/`; không đóng lặp vào ZIP originals.
- RAR ảnh phim giữ cả B01–B03, mặc dù website chỉ dùng 01–13 theo scope. RAR intro/hero giữ ảnh gốc trước tối ưu WebP.
- M3u8 đã bị loại theo xác nhận của người dùng, có URL ký/hạn dùng: **không xuất** playlist/token sang bundle/ZIP/repo. Muốn lưu nguyên bản thì giữ upload gốc đang có trên máy cá nhân. Không dùng m3u8 làm nguồn phát.
- Những upload cũ không tải được/không còn trong workspace không được tuyên bố đã sao lưu. Bộ backup này bao phủ source hiện hành và toàn bộ sáu originals độc nhất đã tải, chưa có trong Git; không phải toàn bộ kho file của máy người dùng.
- Các ZIP website ngày 05–06/10 là bản cũ, không đóng lại/chuyển làm baseline. Không xóa bản cũ hay cloud trước khi người dùng kiểm tra clone/hash/demo Windows.
- Các log audit có bytes giống nhau ở các release và một ảnh menu lịch sử trùng đã tồn tại trong repo; giữ vị trí/provenance cũ để không phá link QA. Vòng bàn giao không thêm bản sao các file đó.

## Điều chưa chuyển / chưa kiểm chứng

Local không kế thừa quyền/session cloud, proxy/GitHub credentials, browser cache, localStorage Reduce motion, node_modules hoặc các process đang chạy. Cài dependencies từ lockfile. Dữ liệu/ảnh/video Behance chưa đọc vì cloud CONNECT 403; source TCV đang là cover/overview trung tính và gallery rỗng, không tự gán credit.

NBNZIA được khảo sát live ngày 06/10 trong vòng trước, bằng chứng có trong docs; không tuyên bố khảo sát lại khi bàn giao. QA 83/83 là kết quả Linux/Chromium vòng film-media. Windows và thư mục ổ D: cần người dùng/Codex local xác minh.
