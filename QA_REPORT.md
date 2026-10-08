# Kiểm tra — 2026.10.08-intro-hero

Ngày 08/10/2026. Tiếp tục từ checkout sạch `ef5a1175b1e4ee8f27bd4f21c8e882e70ee7e80c`, nhánh `codex/portfolio-demo`. Phạm vi intro/hero; không reset source. Đọc clip đính kèm 18,33 giây và giải nén được ba ảnh RAR bằng libarchive. Clip là tài liệu tham khảo, không phải asset website.

Môi trường thực: Linux cloud, Node 24.19.0/npm 11.9.0, Chromium hệ thống; mobile Chromium có touch emulation. **Chưa thử Chrome Windows/điện thoại thật**, chưa deploy và chưa đóng ZIP theo yêu cầu.

| Lệnh / kiểm tra mới | Kết quả |
| --- | --- |
| `npm run build` | Đạt content validator/TypeScript/Vite 7.3.6; 6 dự án, 36 media entries, demo. [Log](docs/intro-hero-preview/qa/build.txt) |
| `npm audit --json` | 0 lỗ hổng gồm dev dependencies, theo registry lúc chạy. [JSON](docs/intro-hero-preview/qa/audit.json) |
| `npm test` trên source cuối | **71/71 đạt**, không skip, 2,7 phút. [Log](docs/intro-hero-preview/qa/tests.txt) |
| Scope / dữ liệu | Profile/projects/ui/package/lockfile byte-for-byte như commit đầu; 33 media records cũ giữ nguyên, chỉ thêm 3. Public assets cũ giữ nguyên. Contact giữ ảnh camera-bts cũ qua `contactMediaId` |
| Geometry / chuỗi ảnh | Kiểm tra 1440×900, 1536×730, 390×844, 320×844: opacity thực lần lượt [1,0,0] → [0,1,0] → [0,0,1]; khung mở lớn hơn 2×, width layout cố định; ảnh cuối cùng currentSrc/transform với hero, width trước–sau lệch <1 px; không tràn ngang |
| Replay / fallback | Reload homepage replay kể cả đã cuộn xuống, về đầu hero; Skip/Enter/Escape/touch/resize/reduced và lỗi từng ảnh/API trả trang đọc được, tháo inert/khóa cuộn. Link case/hash bypass. Reuse route/history/focus và các kiểm tra cũ |
| Demo | 0 video/source/iframe; suite xác minh 0 request video kể cả cấu hình fixture có URL video. Intro dùng 3 ảnh, không GIF/video |
| Preview | [Desktop](docs/intro-hero-preview/desktop.mp4) 1440×900, 10,52 giây / 1.111.227 B; [Mobile](docs/intro-hero-preview/mobile.mp4) 390×844 touch, 10,56 giây / 246.091 B. Mỗi clip có mở trang và reload. Đã xem các frame thực; PNG từng ảnh dùng timeline có kiểm soát riêng |

Bảy test mới kiểm tra chuỗi ảnh/geometry trên bốn viewport, hai ảnh intro lỗi, reload ở vị trí cuộn cũ. Test không phải intro dùng nút Skip thật thay cho session marker cũ. Test debug đọc release config hiện tại. Trong run trung gian, test mới dùng currentTime chưa trừ độ trễ khởi tạo WAAPI, assertion tràn ngang đòi đúng 0 dù scrollbar tạo giá trị âm, và test debug còn hardcode release cũ; đã sửa cách đo/fixture rồi chạy lại toàn bộ, không disable assertion hoặc skip test.

Tái sử dụng intro overlay/WAAPI handoff, Skip/focus/reduced/resize và hệ media/config có sẵn. Tune duration 2400→3400 ms, giữ tên lâu hơn, thêm finite sequence và khớp transform/gutter khi bàn giao; không animation width/height mỗi frame, không thêm dependency. JS gzip 76,85 kB, CSS gzip 10,49 kB theo build cuối; ảnh mới có responsive variants. Không đo benchmark mạng thật hoặc đưa bảo đảm hiệu năng Windows.

Ghi hình ban đầu thiếu FFmpeg của Playwright; cài vào thư mục mặc định không có quyền, đổi cache sang /tmp thì CDN trả 403. Dùng FFmpeg đã có trên hệ thống qua registry path trong /tmp để quay thành công; không thay package/lockfile, không vô hiệu xác minh tải package. [Hướng dẫn quay và thay ảnh](docs/intro-hero-preview/README.md).

Các báo cáo dưới đây là lịch sử vòng trước; không phải kết quả mới của release này.

---

# Kiểm tra — 2026.10.06-layout-refinement

Ngày 06/10/2026. Checkout bắt đầu sạch: **`0bb99d48908a8eb2f1a16a06169f3b9ac674987f`**, nhánh `codex/portfolio-demo`; release trước là `2026.10.06-motion-controls`. Không reset về `c845f78`. Không tìm thấy AGENTS.md trong checkout/thư mục cha. Đã đọc kế hoạch, các hướng dẫn hiện có, handoff Markdown và storyboard PDF mới; [mapping M01–M12](docs/REFINEMENT_MAPPING.md).

Môi trường thực: **Linux cloud, Node.js 24.19.0, npm 11.9.0, Chromium 151.0.7922.173**. Mobile dùng giả lập Chromium, không phải điện thoại thật hoặc Chrome Windows. Kết quả dưới đây được chạy mới trong vòng này.

## Build, audit và suite

| Lệnh / kiểm tra | Kết quả mới |
| --- | --- |
| `npm run build` trên checkout bắt đầu | Đạt; [log baseline](docs/refinement/before/build.txt) |
| `npm test` trên checkout bắt đầu | **47/47 đạt**, không skip; [log baseline](docs/refinement/before/test.txt) |
| `npm run build` trên source cuối | Đạt validator, TypeScript, Vite; **6 dự án hiển thị, 33 media entries, demo**; [log](docs/build-results.txt) |
| `npm audit --json` | **0 lỗ hổng**, gồm dev dependencies; [JSON](docs/audit.json). Chỉ phản ánh registry lúc chạy |
| `npm test` trên source cuối | **64/64 đạt**, không skip, 1,9 phút; [log](docs/test-results.txt). 17 test mới, giữ suite cũ |
| `git diff --check` | Đạt |
| Đối chiếu nội dung/manifest/package | `profile.json`, `projects.json`, `media.json`, `ui.json`, `public/media/`, `site.json`, `presentation.json`, package/lockfile và Vite config không đổi so với 0bb99d4 |
| Vite / server | Vite **7.3.6**; `dev`/`preview` vẫn bind **127.0.0.1**. Không dependency/font/motion library mới. **Chưa deploy** |

Hai regression phát hiện trong quá trình triển khai đã sửa trước lượt suite cuối: clip 100% trên chính node được IntersectionObserver quan sát làm ảnh không reveal; lần đo stack đầu tiên khi Back ghi đè vị trí history. Clip nay đặt trên `.media-frame` con; lần khởi tạo route không tự phục hồi reading anchor. Phép thử pinned-title dùng tọa độ chuột thật để tránh thao tác tự cuộn của Playwright `locator.click()`; giữ ngưỡng sai lệch3 px, không nới kiểm tra Back.

## Hành vi được kiểm tra

| Nhóm | Phạm vi / kết quả |
| --- | --- |
| Nội dung và layout | Hero mobile theo identity→image→CTA, CTA chính trong390×844. Work có title rộng và DOM credit→image→summary/link. Poster contain; tên Chuyến Đi Bất Ý / Chuyen Di Bat Y, DoP và giải của phim giữ riêng. TCV không thêm vai trò/khách hàng; gallery trống vẫn ẩn |
| Stack | Đo toàn bộ mặt thẻ và header/viewport, gap24/16 + an toàn16 px. Không thay chiều cao tự nhiên khi đổi mode. Summary dài và title nhiều dòng làm stack tắt; khôi phục nội dung thì stack trở lại. Không chặn wheel/touch |
| Intro | 2400 ms cấu hình; Skip/Escape/Tab/Enter/tap, replay, session/deep link, resize/reduced không kẹt inert/overflow. WAAPI thiếu/ném lỗi hoặc ảnh lỗi giải phóng ngay; hero không chờ reveal lần hai |
| Reveal/hover | Đo opacity và clip của ảnh thay đổi qua nhiều frame khi cuộn, tới trạng thái hiện hoàn toàn. Badge đi theo chuột; hero/nav/stack có transform thực. Coarse/tablet không parallax hoặc heading drift |
| Reduce motion | Giữ global-off > user choice > OS; lưu qua reload, đồng bộ tab, fallback khi storage bị chặn. Người xem chọn Off vẫn có motion dù OS reduced. Bật On giữa intro/transition giải phóng UI và hoàn tất route đúng một lần |
| API lỗi/lifecycle | IO/RO thiếu hoặc constructor lỗi vẫn đọc và mở dự án được. View Transition ném lỗi trước/sau callback không push history hai lần; delayed callback/reduced cũng chỉ apply một lần. Cleanup observer/listener/timeline và không RAF lặp lúc đứng yên |
| Keyboard/touch | Menu focus trap/Escape/resize/unlock gồm switch, Experience Enter/Space/Escape/tap, Retouch tap/hold/release/cancel. Tab trong stack trở về flow để link không bị che |
| Sáu case | Home→case, refresh, Back/Forward, vị trí/focus; direct link/404/click nhanh. Shared case template giữ nguyên |
| Demo media | **0 video/source/iframe, 0 request video**, cả fixture có URL video. Ảnh decode, fallback ảnh hỏng vẫn điều hướng được |
| Live sau này | Các fixture có kiểm tra load/play/stop theo yêu cầu, hover/leave/offscreen/pause preview khác, reduced ngăn auto preview và lỗi media. Không thêm video vào public |
| Accessibility | Axe WCAG 2 A/AA và 2.1 A/AA đạt ở intro/home/case đại diện; keyboard riêng. Không phải chứng nhận toàn diện screen reader/WCAG 2.2 |

## Kích thước và motion thực

[Số đo từng viewport](docs/motion-check.json), không chỉ kiểm tra class hoặc build.

| Viewport CSS px | Cao nhất trong 6 mặt thẻ | Stack | Tràn ngang | RAF mới trong 400 ms đứng yên |
| --- | --- | --- | --- | --- |
|1440×900|660 px|Có|0 px|0|
|1536×730|600 px|Có|0 px|0|
|1366×650|517 px|Có|0 px|0|
|1093×560|507 px|Không — flow|0 px|0|
|390×844 touch|843 px|Không — flow|0 px|0|
|320×844 touch|808 px|Không — flow|0 px|0|

Suite còn kiểm tra1366×768,430,768,1024 px, landscape844×390 và viewport nhỏ tương đương không gian CSS khi zoom. Đây không phải thao tác zoom trên Windows thật.

Ví dụ 1536×730: hover Work làm chữ nav dịch **−22,39 px**; cuộn hero y 0→240 làm transform ảnh dịch0→−10,19 px. Native scroll y1300→1482→1665 làm mặt thẻ đầu scale **1→0,98383→0,96346** và Y **0→−5,17→−11,67 px**. Bật reduced đưa transform về none. Tiêu đề thẻ thứ hai: **155,1875→155,1719→155,1875 px** qua full→reduced→full; không có animation chạy trong reduced. Sai lệch mode ở ba viewport stack đo được dưới0,5 px; quay lại full về vị trí cũ nếu chưa cuộn tiếp.

## Hiệu năng trước–sau

Cùng production preview localhost 4180, cùng Chromium/máy, DPR1, không throttle CPU/mạng, **3 context mới liên tiếp cho mỗi viewport**, OS no-preference; không chạy suite song song lúc đo. Ban đầu chờ intro biến mất + font ready + 1100 ms; toàn trang đi qua reveal/ảnh và decode rồi về đầu. Logic lấy mẫu giống nhau trước/sau; chỉ sửa cách chụp từng thẻ sticky sau khi đã lấy xong 6 mẫu để ảnh đúng tên dự án.

[Baseline mới](docs/refinement/before/performance.json) · [số đo cuối](docs/performance.json) · [đối chiếu](docs/refinement/comparison.json). Source cuối nhận diện bằng release và [SHA256 của 133 file runtime](docs/refinement/runtime-sha256.json); trường commit trong dữ liệu đo là HEAD nền 0bb99d4 vì phép đo chạy trên working tree trước commit bàn giao.

| Chỉ tiêu | Trước | Sau |
| --- | --- | --- |
|JS gzip|75.217 B|76.351 B (**+1,51%**, dưới budget+10%)|
|CSS gzip|10.234 B|10.489 B|
|Mobile: tải ban đầu, trung vị|320.536 B|321.925 B|
|Mobile: toàn homepage|493.218 B|494.607 B|
|Desktop: tải ban đầu|386.690 B|607.915 B|
|Desktop: toàn homepage|975.928 B|977.317 B|
|CLS mobile, trung vị|0|0|
|CLS desktop, trung vị|0,017788|0,012491|
|LCP mobile / desktop|284 /284 ms|264 /280 ms|
|Intro rời DOM mobile /desktop, tính từnavigation|2610 /2598 ms|2629 /2609 ms|

Tổng tải tăng **1.389 B** ở cả hai viewport. Desktop tải ban đầu tăng **221.225 B**: poster phim `cover.webp` 219.836 B được lazy-load sớm hơn do Work gần viewport hơn, cộng phần bundle tăng. Không kết luận mọi chỉ số đều tốt hơn. Không đổi/cắt/nén lại media của người dùng để làm đẹp số đo.

ResourceTiming ghi cả encoded/decoded/transfer; JS response cuối encoded 76.351 B nhưng decoded 248.095 B. Không đồng nhất transfer với kích thước source hoặc dung lượng thô. CLS là session-window maximum; desktop từng mẫu ≤0,012513, dưới mục tiêu0,02. LCP có thể là chữ intro, **không phản ánh thời điểm giao diện chính sẵn sàng**; khoảng chờ cuối không phải TTI. Kết quả localhost không bảo đảm mạng thật, FPS/pin hay Chrome Windows.

## ZIP và hướng dẫn chạy

Đã giải nén source ZIP vào thư mục mới, cài riêng dependencies, chạy đúng `npm ci`, `npm audit`, `npm run build`, `npm run dev`, `npm run preview`. Dev in **http://127.0.0.1:5173/**; preview in **http://127.0.0.1:4173/**; đã kiểm tra socket chỉ lắng nghe localhost. [Install](docs/refinement/zip-install.txt) · [build](docs/refinement/zip-build.txt) · [audit 0](docs/refinement/zip-audit.json).

[Smoke browser từ ZIP](docs/refinement/zip-smoke.json): cả dev/preview, desktop 1536×730 và mobile 390×844; đúng release, 6 dự án, intro/motion switch/stack, 6 case + refresh; 0 pageerror,0 video request, không tràn ngang. Gói cuối được kiểm traCRC và hash 133 file runtime khớp bản đã chạy; không chứa node_modules/dist/.git/.env/key hoặc test-results. Các cập nhật tài liệu/ảnh/clip cuối không đổi runtime.

Trên Windows: giải nén thư mục mới, mở cmd tại thư mục có package.json, chạy `npm ci` rồi `npm run dev`, mở đúng dòng Local. Chọn **Reduce motion → Off** để xem đầy đủ; dùng `/?intro=1` để replay, `/?motionDebug=1` phải hiện **2026.10.06-layout-refinement**. Hướng dẫn chi tiết: [README](README.md), [MOTION_GUIDE](docs/MOTION_GUIDE.md), [EDITING_GUIDE](EDITING_GUIDE.md), [MEDIA_GUIDE](MEDIA_GUIDE.md). Chưa thực thi trên máy Windows của Hậu.

## Bàn giao và điểm cần xem

- Ảnh thật từ bản chạy: [hero desktop](docs/screenshots/home-desktop.png), [hero mobile](docs/screenshots/home-mobile.png), [Work desktop](docs/screenshots/project-1-desktop.png), [Work mobile](docs/screenshots/project-1-mobile.png), [case desktop](docs/screenshots/case-desktop.png), [case mobile](docs/screenshots/case-mobile.png).
- Clip màn hình HEW: [desktop 27,44 giây](docs/motion-preview/desktop.mp4), [mobile 19,08 giây](docs/motion-preview/mobile.mp4), [intro GIF](docs/motion-preview/intro.gif). Clip nằm trong docs, không tải trong portfolio.
- Xem tỷ lệ ảnh/credit, CTA mobile, khoảng nghỉ giữa Work–About, nhịp intro và stack trên laptop. Poster giữ contain nên có khoảng trống hai bên desktop; cửa sổ thấp/mobile không stack là lựa chọn bảo vệ khả năng đọc.
- Cần Hậu xác nhận trên Windows đúng ZIP: replay intro, cuộn/hover, chuyển case+Back, bật/tắt Reduce motion và mở menu mobile. Chưa kiểm thử Safari/iOS/Firefox hoặc điện thoại thật.
- Nội dung/media thiếu vẫn theo [CONTENT_TODO](CONTENT_TODO.md); vòng này không yêu cầu thêm ảnh để hoàn thành layout, không tự thêm gallery hoặc thông tin dự án.

## File sửa / phần reuse

| Nhóm | File / phạm vi |
| --- | --- |
|Layout/tokens|`src/App.tsx`, `src/styles/tokens.css`, `editorial.css`: hero/Work/About/Approach/Contact; nội dung lấy config cũ|
|Motion CSS|`src/styles/motion.css`, `app.css`, `src/motion/MotionText.tsx`, `src/config/motion.json`: tune timing/transform, media reveal, bỏ Approach assembly|
|Motion safeguards|`src/motion/usePageMotion.ts`, `Intro.tsx`, `preference.ts`, `src/navigation.tsx`, `components/MediaFrame.tsx`: reuse observer/route/preference/media, bổ sung guard/anchor/cleanup|
|Nhận biết bản|`src/config/release.json`|
|Test|`tests/refinement.spec.ts` thêm 17 case; ba suite cũ cập nhật label/geometry/version assertions theo layout mới, giữ ý nghĩa hành vi|
|Tài liệu/QA|CHANGELOG,QA_REPORT,README,EDITING_GUIDE,MOTION_GUIDE; mapping và 2 handoff; `scripts/review-performance.mjs`, `review-motion.mjs`; log/metrics/screenshot/clip mới|
|Reuse nguyên logic|Header/menu, Experience, Retouch, shared case template, mô hình JSON và video demo/live; global/user/OS priority và persistence không làm lại|

Không dựng lại trang từ đầu, không thêm hệ cấu hình hoặc thư viện motion; NBNZIA/Superdesign không được khảo sát lại trong vòng refinement này. Các quyết định khác bản phác: dùng brand/font thật, giữ Retouch trong Work, title có line-height 1,2 cho dấu tiếng Việt và thẻ dài về flow thay vì giảm font/cắt credit.
