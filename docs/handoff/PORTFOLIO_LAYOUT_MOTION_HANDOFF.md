# Trung Hau — Layout & Motion Handoff

Ngày: 06/10/2026 · Phiên bản đề xuất: 1.0

Mục tiêu: sau khi xem, người xem trả lời được “Hậu là ai, làm được gì, đã làm gì và liên hệ thế nào?”. Tài liệu này kết hợp bố cục, chuyển động và yêu cầu triển khai cho Codex trên website đang có.

## 1. Cơ sở và phạm vi

### Trạng thái đã được ghi nhận trong tài liệu nguồn

Đã đọc CHANGELOG.md và QA_REPORT.md mới nhất được cung cấp, bản `2026.10.06-motion-controls`. QA ghi baseline source `c845f78`; đây là thông tin của báo cáo, chưa đối chiếu với checkout hiện tại. Codex phải đọc repository thực tế, dùng thay đổi mới hơn nếu có, không reset về commit này.

- Đã có: intro 2,4 giây, ảnh nối vào hero, Skip/Escape, không lặp cùng tab, deep link đi thẳng.
- Đã có: native scroll, hero parallax nhẹ, tagline đậm dần, Work panel xếp lớp khi vừa màn hình, tự về normal flow khi không vừa.
- Đã có: cover morph/fade vào case, history/focus/scroll restoration, accordion Experience, Retouch before/after, menu mobile và công tắc Reduce motion.
- Nội dung chỉnh qua JSON, gồm profile/projects/media/ui/site; cấu hình trình bày và chuyển động riêng trong presentation.json và motion.json. Cần tìm đúng đường dẫn trong repo.
- QA ghi sáu dự án hiển thị, 33 media entries, chế độ demo không tạo phần tử/request video. Không suy ra danh tính sáu dự án từ tài liệu này.
- Đã xử lý PDF 44 trang; ưu tiên phần biên tập trang 1–14. Không quay lại giả định chỉ có PDF 29 trang hay chỉ có placeholder.
- QA ghi 47/47 kiểm tra đạt trên Linux cloud, Vite 7.3.6, chưa deploy. Các con số này là kết quả cũ trong báo cáo, không phải kiểm thử của bộ bàn giao này.

### Hướng đề xuất

Tinh chỉnh art direction và thứ bậc nội dung trên nền hiện có. Bản phác không phải screenshot website hiện tại, không phải kết quả đã dựng trên canvas Superdesign. Phiên ChatGPT này chưa xác thực được Superdesign; đăng nhập trên Windows không tự chuyển sang đây.

Phân tích NBNZIA trước đó trong cuộc trò chuyện dựa trên HTML/CSS/JS công khai; trình duyệt của phiên đó hiển thị trống. QA từ vòng triển khai trước ghi đã khảo sát live ở một môi trường khác. Hai phạm vi này không thay thế nhau. Không cần đăng nhập Superdesign hoặc truy cập lại trang mẫu để thực hiện các refinement đã mô tả.

Nguồn phong cách: https://www.nbnzia.com/ — học cách mở cảnh, reveal ảnh, chuyển chương và trình bày dự án lớn. Các thời lượng/thông số dưới đây là đề xuất cho Trung Hau, không được trình bày như thông số gốc của NBNZIA.

## 2. Một hướng thiết kế thống nhất

Tên hướng: **Tác phẩm dẫn câu chuyện**.

Nền tối và kem tạo nhịp nghỉ; màu nhấn riêng đánh dấu số thứ tự, CTA và một số panel. Tên thương hiệu được phép lớn, các đoạn mô tả giữ cỡ vừa và dễ đọc. Sans-serif hiện tại được ưu tiên; chỉ thay font khi đã xác nhận hỗ trợ tiếng Việt và có lý do rõ ràng.

Người xem đi theo trật tự:

1. Hero — tên, vai trò và một hình ảnh chủ đạo.
2. Selected Work — sáu dự án hiện có, ảnh lớn và credit rõ.
3. About + Experience — cách làm việc và kinh nghiệm có nguồn.
4. Approach — Plan / Produce / Finish.
5. Contact — lời mời ngắn và kênh liên hệ thật.

Giữ một homepage và mẫu trang case chung đang có. Anchor/header labels dùng ngôn ngữ và dữ liệu UI hiện tại. Bản phác có nhãn tiếng Việt để thảo luận; đó không phải yêu cầu tạo hệ thống đa ngôn ngữ mới.

### Tính liên tục của nội dung

- Giữ mọi dự án, thứ tự/visibility và credit theo projects.json. Có thể đề xuất phim là tác phẩm mở đầu, nhưng chỉ áp dụng nếu vị trí hiện tại/dữ liệu cấu hình cho phép; không âm thầm ghi lại thứ tự.
- Chuyến Đi Bất Ý / Chuyen Di Bat Y: tên phụ không dấu; vai trò Director of Photography và giải Best Cinematography tại HUGFIA 2023 phải trình bày riêng. Giải thuộc bộ phim; không biến thành giải cá nhân.
- TCV giữ mô tả trung tính concept shot list/reference 2024. Không tự thêm khách hàng, vai trò hay thành tích.
- Gallery film/TCV hiện thiếu thì ẩn phần trống. Không lấy ảnh dự án khác để lấp.
- Nhãn “Dự án 02…06” trong phác thảo chỉ biểu thị các vị trí dữ liệu, không phải nội dung thật cần đưa lên web.

## 3. Layout desktop

### Khung chung

| Quy tắc | Desktop ≥ 1024 CSS px | Tablet 768–1023 | Mobile ≤ 767 |
|---|---|---|---|
| Lưới nội dung | 12 cột; gap 24 px | 8 cột; gap 20 px | 4 cột; gap 16 px |
| Lề ngang | 48 px tại 1440; tối thiểu 32 px | 24 px | 20 px; 16 px tại 320 |
| Chiều rộng đọc | Container tối đa 1440 px; body 55–68ch | Body ≤ 60ch | Theo vùng khả dụng |
| Nhịp section | 88–120 px | 64–88 px | 48–64 px |
| Header | 72 px; anchor có scroll-margin | 64 px | 64 px; vùng bấm ≥ 44 px |
| Hành vi Work | Stack chỉ khi đo thấy đủ chỗ | Normal flow | Normal flow |

Các mốc là đề xuất; tái sử dụng breakpoint gần nhất của repo thay vì sinh thêm hệ breakpoint cạnh tranh. Full-bleed hero và panel có thể vượt container; nội dung bên trong vẫn canh chung trục lề.

### A. Header + hero

- Header: wordmark trái; Work / About / Contact hoặc nhãn tương ứng ở phải. Công tắc giảm chuyển động dễ tìm và nằm trong thứ tự focus. Giữ menu mobile đang có.
- Hero: một ảnh BTS/ảnh chủ đạo đã có; ảnh là nội dung chính, không thêm carousel. Tên TRUNG HAU ở vùng đầu hoặc cuối ảnh, tránh đè vào mặt người/chủ thể quan trọng. Cho phép overlay tối tĩnh để bảo đảm tương phản.
- Vai trò lấy từ profile.json. Ba dòng nghề nếu có: Media Executive / Videographer / Video Editor; không nhét thêm kỹ năng chưa xác nhận.
- Primary CTA “Xem dự án” đi tới #work. Secondary CTA tới Contact. Demo không đặt nút Play khi không có video phát được.
- Hero desktop có min-height khoảng 70svh, max khoảng 900 px, vẫn cho nội dung đẩy chiều cao khi cần. Không ép 100vh trên điện thoại làm CTA biến mất.
- Một đoạn dẫn ngắn dưới ảnh, đề xuất: “Từ ý tưởng đến khuôn hình và bản dựng cuối.” Đây là microcopy đề xuất, không phải trích từ profile.
- Asset hiện có cần object-position riêng cho desktop/mobile. Không tự suy ra hero từ nguyên một trang PDF.

### B. Selected Work

- Mở section bằng nhãn nhỏ và statement một câu; số lượng dự án lấy từ dữ liệu hiển thị, không hardcode “06”.
- Mỗi panel: hàng tiêu đề rộng ở trên; dưới là hai vùng credit/mô tả và ảnh. Đây là cấu trúc đã xuất hiện ở baseline; refinement tập trung vào khoảng cách và ưu tiên thị giác.
- Desktop: mô tả khoảng 4/12, media khoảng 8/12. Hàng title có số thứ tự, tên dự án và loại hình nếu có dữ liệu. Body 16–18 px; summary đọc trong 2–4 dòng nếu nguồn phù hợp, không cắt nội dung thật chỉ để vừa stack.
- CTA “Xem dự án” là link thật, hoạt động bằng chuột, tap và Enter. Badge theo con trỏ chỉ là trang trí, không thay link.
- Panel tone dùng presentation.json hiện có. Gợi ý nhịp kem → tối → kem → màu nhấn → tối → kem, nhưng không ghi đè tone riêng của dự án khi chưa đọc cấu hình. Tránh đổi cả trang thành màu gắt liên tục.
- Ảnh dùng srcSet/sizes đã có. Poster dọc của phim giữ `contain`; cho một nền phẳng bao quanh, không ép crop thành ảnh ngang. Thumbnail/video still có thể dùng cover theo media config.
- Card normal flow là layout chuẩn. Stack chỉ là lớp nâng cao: nếu một mặt card cao hơn vùng khả dụng, toàn nhóm quay về flow để credit và nút luôn đọc được.

### C. About + Experience

- About: ảnh portrait/BTS 4 cột, bio 8 cột. Một heading ngắn, đoạn giới thiệu có nguồn và các nhãn kỹ năng có thật.
- Experience đặt ngay sau bio. Vai trò, đơn vị và thời gian luôn hiện; phần mở chứa mô tả.
- Mỗi hàng là button có aria-expanded/aria-controls. Click, Enter, Space và tap cùng một kết quả. Hover chỉ đổi màu/nét, không thay việc mở.
- Không thêm số năm kinh nghiệm, số khách hàng hay số dự án nếu không có trong dữ liệu.

### D. Approach

- Giữ ba bước đã có nguồn: Plan / Produce / Finish.
- Desktop ba cột đều; tablet/mobile xếp dọc. Số bước nhỏ, tiêu đề vừa, mỗi thẻ có mô tả ngắn.
- Có thể dùng ba nền khác nhau như baseline, nhưng kiểm tra tương phản của từng cặp màu.
- Tinh chỉnh reveal khi đi vào viewport. Không thêm đẩy/xoay card theo vận tốc chuột; thông tin cần ổn định để đọc.

### E. Contact

- Nền tối; heading cỡ 48–64 desktop, 32–40 mobile. Gợi ý microcopy: “Cùng làm nên dự án tiếp theo.”
- Email/link lấy từ profile/site data, không điền địa chỉ giả. Ảnh nhỏ dùng asset Contact đã cấu hình để nối lại hero.
- Giữ kênh liên hệ hiện tại. Không tự thêm form cần backend hoặc form giả báo thành công.
- Footer gồm thông tin hiện có và tùy chọn giảm chuyển động nếu thiết kế hiện tại đặt ở đây. Không nhân đôi công tắc nếu không cần.

## 4. Layout mobile và trang case

### Mobile

- Thứ tự đọc: tên → nghề → ảnh → CTA → tác phẩm. Vị trí chữ trên ảnh có thể chuyển xuống dưới nếu không đạt tương phản; không hy sinh crop gương mặt để giữ layout desktop.
- Work chuyển một cột: title/index → role/credit → media → summary/link. Không ẩn credit sau hover.
- Hero/Work dùng ảnh tĩnh trong demo; không preload file video hoặc iframe khi có video URL trong fixture.
- Sticky stack, badge theo pointer, parallax và xoay card tắt ở mobile/coarse pointer. Reveal nhẹ vẫn có trong full motion.
- Menu phủ dưới header, không đẩy nội dung. Giữ focus trap, Escape, body-lock cleanup trên resize và trả focus về nút mở.
- Retouch giữ tap/hold/release/cancel hiện có, đồng thời luôn có nhãn trước/sau đọc được.

### Case template dùng chung

1. “Quay lại dự án” + navigation đang có.
2. Tên dự án; tên phụ nếu có. Dòng role/year/category dùng dữ liệu.
3. Cover thật, giữ aspect ratio/objectFit.
4. Tóm tắt và vai trò cụ thể. Giải thưởng thuộc phim đặt trong nhóm thông tin riêng với credit cá nhân.
5. Gallery / deliverables / retouch khi có nội dung. Không dựng các section rỗng.
6. Dự án tiếp theo theo danh sách hiện có và Contact.

Giữ route/slug hiện tại, direct URL, reload, Back/Forward và khôi phục scroll. Bấm nhanh nhiều lần không để lại overlay hoặc khóa cuộn. Khi transition không đủ điều kiện, chuyển trang bình thường với fade ngắn hoặc không motion.

## 5. Tokens đề xuất, không tự thay giá trị gốc

| Token | Giá trị minh họa / nguyên tắc |
|---|---|
| ink | `#171717`, theo hướng màu đã nêu |
| paper | `#F2F0E8`, màu kem đề xuất cho phác thảo |
| accent | `#F04B3A` chỉ để minh họa; mã thật đang thiếu trong ngữ cảnh, lấy nguyên từ repo |
| body | 16–18 px, line-height 1.5–1.65 |
| meta | 12–14 px, line-height ≥ 1.35; không dùng cho credit quan trọng nếu quá nhỏ |
| hero name | desktop 80–112 px; mobile 44–56 px, không tràn tên |
| section title | desktop 40–56 px; mobile 28–36 px |
| project title | desktop 36–48 px; mobile 26–32 px |
| radius | 0–8 px cho media, theo thiết kế hiện tại |
| spacing | 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 |

Sans-serif hiện tại là mặc định. Các font trong PDF chỉ dùng để dựng tài liệu, không yêu cầu cài vào website. Màu cam minh họa dùng chữ tối; không mặc định chữ trắng trên cam đạt chuẩn cho text nhỏ. Body/focus/control cần kiểm tra tương phản với token cuối cùng.

## 6. Hợp đồng motion chung

Định nghĩa dưới đây là mục tiêu đề xuất. Trước khi sửa, map từng mục với implementation hiện tại; giữ hành vi đã đạt nếu không có sai lệch rõ ràng.

- Native scroll luôn là cơ sở; không chặn wheel/touch để mô phỏng cuộn, không thêm Lenis chỉ vì trang mẫu có dùng.
- Ưu tiên transform/opacity, dùng clip-path khi có lý do và đo lại. Intro không animate width/height mỗi frame. Không dùng blur nặng.
- Không cài GSAP hay thư viện motion mới trong vòng này. Dùng hạ tầng đang có; nếu thực sự cần dependency, báo blocker và lý do cụ thể.
- Nội dung phải nhìn thấy và dùng được khi lớp motion lỗi/không hỗ trợ. JS không được để heading/ảnh opacity 0 vĩnh viễn.
- Chỉ một chuyển động lớn giữ vai trò chính tại mỗi thời điểm: intro, hero hoặc card Work. Các text reveal đi cùng phải ngắn, không kéo dài thời gian đọc.
- Full motion không chạy vòng requestAnimationFrame vô hạn khi đứng yên. Event/listener/observer dọn sạch khi đổi route, breakpoint, chế độ motion hoặc unmount.
- Nếu support API timeline thiếu, fallback về reveal đơn giản/flow; không tải polyfill nặng để giữ hiệu ứng phụ.

### Ưu tiên chế độ chuyển động

1. `enableMotion:false` trong config → tắt toàn bộ chuyển động không thiết yếu.
2. Nếu người dùng đã chọn Reduce motion On/Off → dùng lựa chọn đó.
3. Nếu chưa chọn → theo `prefers-reduced-motion` của OS.

Giữ persistence, sync tab, fallback khi storage bị chặn. Bật On giữa intro phải kết thúc intro, trả giao diện về trạng thái đọc được ngay; không đổi scroll section người xem đang đọc. On không làm ảnh nhẹ hơn, chỉ giảm công việc animation.

## 7. Đặc tả animation theo phần

Các mốc millisecond là mục tiêu thiết kế, có thể tinh chỉnh ±15% sau quan sát, nhưng giữ tổng intro theo giới hạn đã chốt. `ease-out` cho xuất hiện; `ease-in-out` cho chuyển hai trạng thái; scroll progress tuyến tính rồi áp easing nhẹ nếu implementation hiện tại cần.

| ID | Trigger và hành vi full motion | Mốc đề xuất | Mobile / Reduce motion |
|---|---|---|---|
| M01 Intro | Lần đầu trong tab, vào homepage tại đầu trang. Chữ và ảnh nhỏ xuất hiện; ảnh nối đúng khung hero | Tổng giữ 2.400 ms; storyboard phía dưới | Mobile giữ bản nhẹ theo baseline. Reduced/deep link/bỏ qua đi thẳng hero |
| M02 Hero | Ảnh dịch nhẹ khi rời đầu trang; chữ và frame giữ trục | 0 → −24 px desktop; clamp trong section | Coarse/mobile tắt parallax; Reduced transform none |
| M03 Đoạn dẫn/heading | Khi top chạm khoảng 85% viewport; reveal theo từ hoặc làm đậm đoạn có sẵn | Y 16 px → 0, opacity 0 → 1; 500 ms, stagger 35 ms, tổng ≤ 900 ms | Mobile Y 8 px, 320 ms; Reduced hiện đầy đủ |
| M04 Work stack | Chỉ desktop đủ rộng/cao, từng card vừa vùng khả dụng; card trước lùi khi card kế đến | Scale 1 → 0,95; Y 0 → −16 px; nghiêng tối đa 1°; progress theo cuộn | Mobile, thấp, nội dung dài: flow. Reduced không stack/pin/transform |
| M05 Media reveal | Media đi vào viewport, một lần mỗi lượt vào section theo logic hiện tại | 550–650 ms; clip inset từ dưới 100% về 0; scale ≤ 1,03 → 1 | Mobile fade 250 ms; Reduced hiện ngay; contain poster không méo |
| M06 Work hover | Chỉ hover:hover + pointer:fine; pointer badge và nhích media nhỏ | 160–220 ms; scale ảnh tối đa 1,02 | Tap/keyboard dùng link thật. Reduced bỏ badge bám chuột và transform |
| M07 Mở case | Link nội bộ tới case, media nguồn/đích có thể xác định | Morph 420–520 ms; fallback fade 160–200 ms | Mobile fade ≤ 180 ms; Reduced không morph, giữ focus/history |
| M08 Experience | Click / Enter / Space / tap; không phụ thuộc hover | Mở/đóng 240–300 ms; mô tả Y 8 px → 0 và fade 180 ms | Cùng thao tác trên mobile; Reduced đổi trạng thái ngay |
| M09 Approach | Nhóm vào viewport; ba thẻ xuất hiện theo thứ tự | Y 20 px → 0; 450 ms; stagger 80 ms | Mobile reveal từng thẻ 280 ms; Reduced tĩnh |
| M10 Nav/CTA | Hover và focus-visible cùng có phản hồi | Trượt chữ 180–220 ms; quét nền 200 ms; arrow ≤ 3 px | Mobile trạng thái nhấn; Reduced chỉ màu/outline, không animated transform |
| M11 Contact | Khi section tới gần viewport; ảnh/heading reveal nhẹ | 400 ms; Y ≤ 12 px; không spotlight mặc định | Mobile fade 220 ms; Reduced tĩnh |
| M12 Menu mobile | Nút menu / Escape / chọn anchor | Fade/translate ≤ 180 ms; nội dung không bị đẩy | Reduced đổi tức thì; focus trap và trả focus luôn giữ |

### Storyboard M01: 2,4 giây

| Khoảng thời gian | Cảnh | Điều kiện kết thúc an toàn |
|---|---|---|
| 0–400 ms | Tên hiện; ảnh nhỏ đã giữ chỗ giữa TRUNG và HAU | Skip luôn nhìn thấy và focus được |
| 250–800 ms | Ảnh mở bằng clip/transform; không kéo giãn tỷ lệ | Ảnh lỗi thì kết thúc intro và dùng fallback |
| 800–1.950 ms | Ảnh chuyển vào hero; tên intro dịu đi | Đo đích trước khi chạy; resize hủy an toàn |
| 1.950–2.400 ms | Nội dung hero và CTA ổn định | Tháo overlay/khóa cuộn; không thêm một lượt chờ reveal |

Skip, Escape, reduced On, resize hoặc điều hướng phải giải phóng overlay và body lock trong lần cập nhật kế tiếp; không đợi timeline chạy hết. Link sâu, Back/Forward và quay lại trong cùng tab giữ hành vi đi thẳng. Nếu hero image chưa decode, không chờ quá giới hạn intro; hiển thị nội dung và fallback ảnh.

### Điều kiện Work stack

`availableHeight = viewportHeight − visibleHeaderHeight − topGap − bottomGap`.

Đo tất cả card sau khi font/ảnh và layout sẵn sàng. Chỉ bật stack nếu mọi card vừa availableHeight với khoảng đệm tối thiểu 16 px, breakpoint phù hợp và motion full. Khi nội dung/font/viewport thay đổi, đo lại bằng cơ chế hiện có. Không ép min-height cứng, giấu summary hoặc thu chữ để ép card vừa.

Phần tử được focus phải ở trên các lớp khác hoặc card tương ứng được đưa về vị trí nhìn thấy. Fallback flow khi không bảo đảm được focus visibility. Không có card trong suốt phủ lên link card khác.

### Chuyển case và retouch

- Intercept chỉ primary unmodified click đúng route nội bộ; Ctrl/Cmd-click vẫn mở tab mới theo hành vi trình duyệt.
- Navigation manager hiện tại là nguồn trạng thái duy nhất. Tránh tạo thêm overlay/timeline ngoài lifecycle đang có.
- Update document title và focus heading khi case sẵn sàng; quay lại khôi phục vị trí Work. Nếu người xem bật reduced giữa transition, hoàn tất navigation trước khi dọn lớp chuyển.
- Giữ Retouch thực hiện được bằng bàn phím/touch, không thêm hiệu ứng làm mờ before/after hoặc thay cặp ảnh thật.

## 8. Media và khả năng tự cập nhật

- Dùng ảnh thật đã xử lý từ PDF qua media manifest hiện tại. Không lấy screenshot nguyên trang PDF làm giao diện.
- Nội dung dài, thiếu ảnh, poster dọc, mục không có gallery đều có layout hợp lệ.
- Thay ảnh phải cập nhật/xóa đúng responsive variants cũ theo EDITING_GUIDE hiện có.
- Không thêm dữ liệu copy/paste song song trong component. presentation/motion giữ style và tham số; profile/projects/media giữ nội dung.
- Demo phải có 0 video/source/iframe và 0 request video, kể cả fixture có URL video.
- Giữ đường đi của live media đã kiểm thử; full motion và reduced có hành vi preview đúng. Không đưa clip benchmark hoặc video tham khảo vào public media.

## 9. Thứ tự thực hiện cho Codex

### P0 — Đối chiếu, bảo vệ baseline

Đọc AGENTS.md nếu có, tài liệu, cấu trúc và code đang chạy. Ghi lại commit/dirty state; không đụng thay đổi chưa liên quan của người dùng. Tạo bảng map `M01…M12 → file/component → đã có / cần chỉnh / không áp dụng`. Chạy build và smoke check phù hợp trước khi sửa để phân biệt lỗi có sẵn.

### P1 — Layout trước

Tinh chỉnh hero, tiêu đề Work, lưới credit/media, khoảng trắng và typography. Dùng nội dung thật; giữ sáu route và config hiện có. Hoàn thiện mobile normal flow và case template trước khi bật các thay đổi motion. Không tổ chức lại source chỉ để đổi tên component.

### P2 — Motion có chọn lọc

Tune những mục khác biệt với spec; giữ những mục đã đạt. Ưu tiên M01 handoff, M04 stack, M07 case và chế độ reduced. Sau đó mới M03/M05/M06/M08… Không thêm cursor toàn trang, emoji rain, SVG text path ghim dài hoặc physics card trong vòng này.

### P3 — QA và bàn giao

Chạy suite hiện có, bổ sung chỉ những assertion kiểm tra hành vi mới chưa được cover. Chụp desktop/mobile thực tế, ghi clip ngắn, cập nhật CHANGELOG/QA với phạm vi đo. Giữ package/lockfile và config bind localhost trừ khi có yêu cầu mới. Chưa deploy.

## 10. Nghiệm thu

| Nhóm | Tiêu chí |
|---|---|
| Nội dung | Tên, credit, giải phim, dữ liệu dự án/media khớp baseline; không phát sinh dự án/thành tích giả |
| Desktop | 1440×900, 1536×730, 1366×768 và 1366×650 đọc được title/credit/CTA; stack đo thực tế |
| Chiều cao thấp | 1093×560, 844×390 và nội dung dài: tự về normal flow, không cắt hoặc che link |
| Mobile | 320/390/430 px, tablet 768/1024 px: không tràn ngang; menu/CTA chạm được; poster không méo |
| Intro | Full first visit, session revisit, Skip/Escape/Tab, deep link, resize, storage blocked, image error, reduced thay đổi giữa intro |
| Motion | Đo transform/progress thực, không chỉ assert class. Không RAF liên tục lúc đứng yên. Full/reduced đổi ngay, giữ vị trí đọc |
| Case | Sáu route, link trực tiếp, refresh, Back/Forward, focus, click nhanh, Ctrl/Cmd-click, lỗi media và 404 |
| Accessibility | Heading nguyên vẹn cho screen reader; aria-hidden cho bản chữ trang trí; accordion semantics; focus-visible; reduced; tương phản token thật |
| Demo | 0 video/source/iframe và 0 request video sau cuộn, hover, mở case và fixture có URL video |
| Editable | Thêm/ẩn/đổi thứ tự qua JSON không cần sửa component; schema/validator đúng |
| Regression | Build, suite hiện có và git diff --check. Audit ghi thời điểm và kết quả thật nếu thực hiện; không ghi lại “0” từ báo cáo cũ |

### Hiệu năng: mục tiêu, không phải kết quả đã đo

QA cũ báo initial JS gzip 75,22 KB, CSS gzip 10,23 KB; transfer đầu 320,54 KB, toàn home sau cuộn 493,22 KB; CLS 0,00748 trong production localhost không throttle. Dùng làm baseline tham khảo, không kết luận hiệu năng trên mạng thật.

- Mục tiêu vòng refinement: không thêm dependency, JS gzip tăng không quá 10% so với build baseline cùng môi trường nếu thực sự có thêm logic; lý tưởng giữ gần mức cũ.
- Không preload toàn bộ gallery, không tải video demo. Đo image transfer và bundle trước/sau cùng cấu hình.
- Mục tiêu CLS ≤ 0,02 trong phép thử lab tương đương; ảnh có aspect ratio/dimension rõ. Nếu không đạt, ghi số đo và nguyên nhân thay vì che kết quả.
- Báo riêng thời điểm intro kết thúc và thời điểm nội dung dùng được; không dùng LCP localhost 0,2 giây để nói trang đã hiện đầy đủ ngay.
- Safari/iOS, Firefox, thiết bị vật lý và Windows cần kiểm tra nếu có môi trường; chưa có thì ghi “chưa kiểm thử”. Không tuyên bố FPS, INP hay field Core Web Vitals khi chưa đo.

## 11. Gói bàn giao và điều còn mở

- `PORTFOLIO_LAYOUT_STORYBOARD.pdf`: bản phác và storyboard để xem nhanh.
- `PORTFOLIO_LAYOUT_MOTION_HANDOFF.md`: đặc tả chính; ưu tiên hơn hình minh họa khi có chi tiết kỹ thuật cần đối chiếu.
- `CODEX_NEXT_PROMPT.md`: prompt để bắt đầu vòng triển khai.
- `PORTFOLIO_LAYOUT_OVERVIEW.png`: một trang tổng quan của hướng bố cục, không phải ảnh website đã chạy.

Những điểm Codex tự giải quyết bằng repo: mã màu nhấn đầy đủ, font thật, đường dẫn JSON, nội dung/ảnh của sáu dự án, route/component names và scope thay đổi mới hơn baseline. Chỉ hỏi người dùng nếu repo và tài liệu không giải quyết được mâu thuẫn ảnh hưởng nội dung công khai. Thiếu gallery giữ ẩn theo baseline; không chặn toàn bộ công việc.

Không thay đổi source portfolio trong lượt tạo tài liệu này. Bộ bàn giao mô tả công việc tiếp theo; kết quả triển khai phải có ảnh, log và QA mới do Codex thực sự chạy.
