# HƯỚNG DẪN QUẢN TRỊ & THAY ẢNH THẬT (`assets/images/`)

Website **AN NHIÊN – THẾ GIỚI HOA ĐÀ LẠT** được thiết kế ưu tiên hình ảnh thực tế, đúng loài hoa, không cắt cúp méo tỷ lệ và không dùng ảnh AI làm tư liệu xác định đặc điểm khoa học.

---

## 1. Cách thay ảnh chân dung thật của Tác giả Trịnh Thị An (Mục 8)
Ảnh chân dung của Chị **Trịnh Thị An** xuất hiện đồng bộ tại **4 vị trí**:
1. Thanh điều hướng trên cùng (Header).
2. Khu vực giới thiệu tác giả trên Trang chủ.
3. Trang **“Về An Nhiên”** (`#/ve-an-nhien`).
4. Chân trang (Footer).

### Hai cách cập nhật ảnh chân dung:
- **Cách A – Đổi trực tiếp trên giao diện Website (Tức thì):**
  - Cuộn xuống khu vực giới thiệu tác giả hoặc mở trang **“Về An Nhiên”**.
  - Nhấn nút **“📷 Đổi ảnh chân dung thật”** (hoặc **“📷 Tải ảnh chân dung thật lên”**) và chọn bức ảnh chân dung từ điện thoại/máy tính.
  - Hệ thống sẽ tự động lưu và hiển thị ở cả 4 vị trí.
- **Cách B – Thay file ảnh cố định trong kho mã nguồn GitHub:**
  - Đặt bức ảnh chân dung thật của chị vào thư mục: `assets/images/author/trinh-thi-an.jpg`
  - Hoặc giữ nguyên tên file ảnh gốc trên kho GitHub: `41a8b9fd-8197-42f0-98ed-61ac18361b60.png`.

---

## 2. Cấu trúc thư mục ảnh hoa (`assets/images/flowers/`)
Mỗi loài hoa trong 26 loài đều đã được gán sẵn đường dẫn thay ảnh chuẩn hóa trong hồ sơ (`localReplacePath`):

| Mã hồ sơ | Tên loài hoa | Tên file ảnh gợi ý trong `assets/images/flowers/` |
| :--- | :--- | :--- |
| `AN-001` | Phượng tím | `assets/images/flowers/phuong-tim-1.jpg` |
| `AN-002` | Mai anh đào | `assets/images/flowers/mai-anh-dao-1.jpg` |
| `AN-003` | Mimosa | `assets/images/flowers/mimosa-1.jpg` |
| `AN-004` | Cẩm tú cầu | `assets/images/flowers/cam-tu-cau-1.jpg`, `cam-tu-cau-2.jpg` |
| `AN-005` | Hoa hồng | `assets/images/flowers/hoa-hong-1.jpg`, `hoa-hong-2.jpg` |
| `AN-006` | Hoa lan hồ điệp | `assets/images/flowers/lan-ho-diep-1.jpg`, `lan-ho-diep-2.jpg` |
| `AN-007` | Địa lan | `assets/images/flowers/dia-lan-1.jpg` |
| `AN-008` | Hoa ly | `assets/images/flowers/hoa-ly-1.jpg`, `hoa-ly-2.jpg` |
| `AN-009` | Hoa cúc | `assets/images/flowers/hoa-cuc-1.jpg`, `hoa-cuc-2.jpg` |
| `AN-010` | Hoa đồng tiền | `assets/images/flowers/hoa-dong-tien-1.jpg`, `hoa-dong-tien-2.jpg` |
| `AN-011` | Hoa cẩm chướng | `assets/images/flowers/hoa-cam-chuong-1.jpg` |
| `AN-012` | Hoa bất tử | `assets/images/flowers/hoa-bat-tu-1.jpg`, `hoa-bat-tu-2.jpg` |
| `AN-013` | Hoa oải hương | `assets/images/flowers/hoa-oai-huong-1.jpg` |
| `AN-014` | Hoa tulip | `assets/images/flowers/hoa-tulip-1.jpg`, `hoa-tulip-2.jpg` |
| `AN-015` | Hoa hướng dương | `assets/images/flowers/hoa-huong-duong-1.jpg` |
| `AN-016` | Hoa thạch thảo | `assets/images/flowers/hoa-thach-thao-1.jpg`, `hoa-thach-thao-2.jpg` |
| `AN-017` | Hoa mõm sói | `assets/images/flowers/hoa-mom-soi-1.jpg`, `hoa-mom-soi-2.jpg` |
| `AN-018` | Hoa dạ yến thảo | `assets/images/flowers/hoa-da-yen-thao-1.jpg`, `hoa-da-yen-thao-2.jpg` |
| `AN-019` | Hoa thu hải đường | `assets/images/flowers/hoa-thu-hai-duong-1.jpg`, `hoa-thu-hai-duong-2.jpg` |
| `AN-020` | Hoa pansy | `assets/images/flowers/hoa-pansy-1.jpg` |
| `AN-021` | Hoa dã quỳ | `assets/images/flowers/hoa-da-quy-1.jpg` |
| `AN-022` | Hoa chùm ớt | `assets/images/flowers/hoa-chum-ot-1.jpg` |
| `AN-023` | Hoa thanh anh | `assets/images/flowers/hoa-thanh-anh-1.jpg` |
| `AN-024` | Hoa lan hoàng thảo | `assets/images/flowers/lan-hoang-thao-1.jpg`, `lan-hoang-thao-2.jpg` |
| `AN-025` | Hoa lan Cattleya | `assets/images/flowers/lan-cattleya-1.jpg` |
| `AN-026` | Hoa lan hài Đà Lạt | `assets/images/flowers/lan-hai-1.jpg` |

### Quy tắc chuẩn bị ảnh để hiển thị đẹp nhất:
- **Tỷ lệ khuyến nghị:** Ảnh ngang tỷ lệ **4:3** hoặc **16:10** (ví dụ: `1200×900 px` hoặc `1600×1000 px`).
- **Định dạng:** `.jpg` hoặc `.webp` (dung lượng khoảng `150 KB – 400 KB`/ảnh để tải trang nhanh trên điện thoại).
- **Cách cập nhật đường dẫn:** Sau khi tải ảnh vào `assets/images/flowers/`, mở file `js/data-bundle.js` (và `data/flowers.json`), đổi trường `"url"` của loài hoa đó thành `"assets/images/flowers/<ten-file>.jpg"`.
