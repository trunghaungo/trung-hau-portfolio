# Kiểm tra bàn giao — 08/10/2026

Vòng này chỉ docs/helper/integrity, **không đổi runtime, content, public media, package hoặc lockfile**. Application baseline `2e860f0`, release `2026.10.08-film-media`; branch `codex/portfolio-demo`. Manifest kiểm tra snapshot bàn giao; không yêu cầu HEAD phải là baseline khi commit docs mới hơn.

Môi trường thực: **Linux cloud, Node 24.19.0, npm 11.9.0, Git 2.52.0, Chromium hệ thống**. Bản sao sạch từ staged snapshot tại `/tmp/hew-local-transfer-check`, build/serve bằng dependencies cài từ lockfile; không dùng node_modules của checkout đang chạy. Không phải máy Windows hoặc điện thoại thật.

| Kiểm tra mới | Kết quả |
| --- | --- |
| Repo vs GitHub trước bàn giao | Working tree sạch; origin/codex/portfolio-demo = `2e860f0740e98b1e55c542348c554bb532f18e2a`. `main` = `0936f8c`, cũ |
| SHA-256 source/media/docs | Verifier khớp toàn bộ files được liệt kê trong integrity.json, 0 missing/changed. Manifest không hash chính nó; hash bundle ngoài repo bảo vệ snapshot đầy đủ |
| Original archives | 4 ZIP độc lập, mỗi ZIP dưới 32 MiB; CRC giải nén và SHA-256 bytes từng entry đều khớp. 6 originals độc nhất, không đóng lại full trailer/handoff/storyboard đã trong Git; gộp hai clip tham khảo trùng |
| Verifier đọc originals sau giải nén | **6/6 match**. Sửa bytes một file → 1 changed, exit 1; giấu file → 1 missing, exit 1; phục hồi → 6/6. Chỉ thử trên bản copy /tmp, không sửa original hoặc public |
| `npm ci` trên bản sao sạch | Lần đầu ENOENT cache `/home/agent/.npm/_cacache`, không thuộc vùng ghi. Một lần thử lại có căn cứ: `npm ci --cache /tmp/hew-local-npm-cache` → đạt, 75 packages. Không tắt TLS/integrity, không đổi lockfile. [Log](qa/install.txt) |
| `npm run build` trên bản sao sạch | Đạt check:content/TypeScript/Vite 7.3.6: 6 projects, 49 media, live. JS gzip 79,48 kB; CSS gzip 11,15 kB, cùng bản đã duyệt. [Log](qa/build.txt) |
| `npm audit --json --cache /tmp/hew-local-npm-cache` | **0 lỗ hổng** gồm dev dependencies tại thời điểm chạy. [JSON](qa/audit.json) |
| Production smoke | `npm run preview -- --port 4188 --strictPort`, bind localhost; homepage + 6 case routes thực HTTP 200 và heading đúng; 0 video trước tương tác, hover preview currentTime 0,133384 s, Play trailer 0,119278 s, đủ 12 album images, 0 JS page errors. [JSON](qa/smoke.json) |
| Source scope | Nội dung/profile/projects/media/ui/config, styles/components, public, dependency manifests không thay. Existing doc links không gỡ; các báo cáo cũ giữ lịch sử |
| Suite | **Không chạy lại toàn suite** vì không thay runtime; 83/83 là kết quả vòng film-media trước, xem QA_REPORT, không ghi là kết quả mới |

## Kiểm tra gói Git và phần cần người dùng xác nhận

Bản Git bundle xuất sau commit bàn giao đã được clone lại vào thư mục mới, `git bundle verify` và verifier khớp snapshot sạch; remote clone backup được đặt lại đúng GitHub. CRC/hash ZIP đã kiểm tra trước đóng gói; checksum của bundle/ZIP nằm trong `TRANSFER_SHA256SUMS.txt` ngoài repo để tránh tự tham chiếu hash/commit.

Các kiểm tra khôi phục được chốt trước bàn giao cuối. Không deploy, không push originals/bundle lên GitHub, không chuyển cài đặt/secret/session cloud. Chưa đọc `D:\HEW-media\TVC TCV Rebranding` hoặc chạy lệnh trên Windows. Người dùng cần xác nhận clone/checksum/demo trên máy đó trước khi bỏ bản cloud hay source Windows cũ. Nếu source GitHub có thay đổi mới sau snapshot, đối chiếu và tôn trọng bản mới, không reset để checksum bản cũ đạt.

M3u8 đã bỏ theo xác nhận trước: không xuất URL ký/token. Backup bao phủ project hiện hành + các originals đã tải còn trong workspace; không khẳng định đã sao lưu những upload không tải được hoặc toàn bộ ổ D:.
