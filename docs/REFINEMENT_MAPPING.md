# Refinement từ handoff — 2026.10.06-layout-refinement

Checkout bắt đầu: `0bb99d48908a8eb2f1a16a06169f3b9ac674987f` (`codex/portfolio-demo`), sạch; release cũ `2026.10.06-motion-controls`. Đã đọc kế hoạch, CHANGELOG, QA_REPORT, EDITING_GUIDE và hai tài liệu [handoff](handoff/PORTFOLIO_LAYOUT_MOTION_HANDOFF.md), [storyboard](handoff/PORTFOLIO_LAYOUT_STORYBOARD.pdf). Không tìm thấy AGENTS.md trong checkout hoặc thư mục cha. PDF là phác thảo đề xuất; không phải ảnh chụp website hiện tại. Phân tích live NBNZIA từ vòng trước nằm ở [bảng tham chiếu](NBNZIA_COMPARISON.md); vòng này không tuyên bố khảo sát live mới.

## Mapping M01–M12 trước khi triển khai

| ID | Implementation thật / tình trạng khi bắt đầu | Quyết định vòng này |
| --- | --- | --- |
| M01 Intro | `src/motion/Intro.tsx`, `motion.css`, `editorial.css`, `motion.json`: đã có intro ảnh handoff 2400 ms, session, Escape/Skip/deep link/resize/reduced | Tune nhịp tên/ảnh, chữ hero hiện ngay khi intro rời; fallback khi ảnh hoặc WAAPI lỗi. Dùng transform/clip/opacity, không animation kích thước mỗi frame. |
| M02 Hero | `.hero-stage`, `.hero-frame` trong `App.tsx`/`editorial.css`: đã có CSS view timeline | Tune parallax tối đa 24 px, chỉ desktop con trỏ chính xác; tablet/coarse/mobile ảnh đứng yên. Trình duyệt thiếu timeline vẫn có ảnh. |
| M03 Text reveal | `MotionText.tsx`, `usePageMotion.ts`, `motion.css`: đã có observer, mask từ | Tune block 500 ms/Y16, từ stagger35 ms tối đa245 ms; mobile320 ms/Y8. Nội dung luôn đọc được nếu observer lỗi/không có. |
| M04 Work stack | `usePageMotion.ts`, `.project-card/.project-surface`: đã đo card nhưng còn hằng số top104/cushion124 | Tune đo header và toàn bộ mặt thẻ, gap24/16 + an toàn16; không thay kích thước khi bật stack. Không vừa thì normal flow, giữ vị trí đang đọc khi đổi chế độ. Lùi tối đa Y−16/scale.95/nghiêng1°. |
| M05 Media reveal | Media thật qua `MediaFrame.tsx`; chưa có reveal riêng theo handoff | Tận dụng cùng observer với `data-reveal="media"`; desktop clip600 ms, mobile fade250 ms. Poster contain, không scale/crop. |
| M06 Card hover | Badge pointer, keyboard focus, preview live sau này đã có | Tune ảnh tối đa1.02/200 ms và badge200 ms. Poster không phóng, reduced không chuyển động. Không làm lại preview media. |
| M07 Case transition | `navigation.tsx`, View Transition trong `app.css`: đã có morph/fade/history/focus/scroll | Tune cover480 ms, root180 ms; fallback apply đúng một lần nếu API ném lỗi hoặc giảm motion giữa chuyển trang. Giữ shared case template. |
| M08 Experience | `components/Experience.tsx`: accordion/keyboard/touch đã có | Reuse logic; tune panel280 ms/opacity180 ms, credit/thời gian luôn hiện. |
| M09 Approach | `.approach-grid` và `usePageMotion.ts`: đã có scroll assembly/tilt liên tục theo tiến độ | Thay bằng reveal một lần450 ms/Y20/stagger80; mobile280 ms. Ba card giữ trục, tablet/mobile một cột. |
| M10 Nav/CTA | `Header.tsx`, arrow/button/nav CSS: đã có tương tác | Tune200 ms, arrow tối đa3 px; focus-visible tương ứng hover, tương phản CTA luôn đủ trong sweep. |
| M11 Contact | `Contact` trong `App.tsx`: đã có reveal và ảnh nhỏ | Tune hierarchy/spacing; reveal400 ms/Y12, mobilefade220 ms; bỏ thay gap khi hover email. |
| M12 Mobile menu | `Header.tsx`, `editorial.css`: đã có overlay/focus trap/lock/cleanup | Reuse logic; tune180 ms/Y8, không đẩy nội dung. Giữ Reduce motion trong vòng focus. |

Không áp dụng: đổi font/brand theo phác PDF, scroll hijacking/Lenis/GSAP, cursor vật lý, video nền/hover tải sẵn trong demo, gallery giả, CMS/config nội dung thứ hai. Những phần này không cần cho refinement và nằm ngoài phạm vi.

## Layout và nội dung

- Giữ Inter và token thật `#171717`, `#f04b32`, `#f3f0e8`; không dùng mã minh họa `#F04B3A` làm brand mới.
- Hero desktop: tên/nghề rõ, ảnh rộng, CTA nằm trong hero; mobile: tên/nghề → ảnh → CTA, không ép 100vh.
- Work: title nguyên hàng; cột credit/mô tả khoảng1/3, ảnh khoảng2/3. DOM mobile: title → credit → ảnh → summary → link. Không rút chữ để ép card vừa stack.
- Retouch giữ nguyên logic và nội dung, là phần kết của Work; tiếp đến About/Experience → Plan/Produce/Finish → Contact. About ảnh trái/bio phải, mobile normal flow.
- `profile.json`, `projects.json`, `media.json`, `ui.json`, `public/media/`, route/slug, visibility/order và credit giữ nguyên. Reuse nhãn `My role`/`Film recognition` đã có để phân biệt DoP và giải của phim. Film/TCV gallery thiếu tiếp tục ẩn.
- Không thêm dependency/schema/config; package và lockfile không đổi. Release trong config debug cập nhật để nhận biết ZIP mới.

## Cần xem ở bản chạy

1. Tỷ lệ hero, CTA mobile và poster phim giữ nguyên tỷ lệ.
2. Khi cuộn Work: stack chỉ chạy nếu toàn bộ thẻ vừa; cửa sổ thấp/nội dung dài tự chuyển flow, vẫn đọc hết credit.
3. Nhịp nối tên → ảnh → hero và reveal Work; Approach nay ổn định, không nghiêng/xê dịch liên tục.
4. Bật Reduce motion giữa phần Work hoặc khi mở case: giữ phần đang đọc, không kẹt overlay.

Kết quả và sai lệch có chủ đích so với handoff được ghi sau kiểm tra trong [QA_REPORT](../QA_REPORT.md), không lấy kết quả cũ làm kết quả mới.
