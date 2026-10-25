# BÁO CÁO KIỂM TRA & SAO LƯU PHIÊN BẢN HIỆN TẠI (BƯỚC 1, BƯỚC 2 & BƯỚC 3)

## 1. Kết quả kiểm tra website thực tế (`https://annhienai.github.io/thucvatdalat-7an/`) và kho mã nguồn (`https://github.com/annhienai/thucvatdalat-7an`)
- **Tên hiển thị ở bản cũ:** `AN NHIÊN – BÁCH KHOA THỰC VẬT ĐÀ LẠT / AN NHIÊN - DALAT BOTANICAL ENCYCLOPEDIA`.
- **Cấu trúc tệp bản cũ:**
  - `index.html`, `css/style.css`, `41a8b9fd-8197-42f0-98ed-61ac18361b60.png`
  - `data/`: `calendar.json`, `categories.json`, `gallery.json`, `plants.json` (100 hồ sơ: `AN-001` đến `AN-100`), `sources.json`
  - `js/`: `data-bundle.js`, `encyclopedia.js`, `gallery.js`, `garden-diary.js`, `main.js`, `plant-ai.js`, `print.js`, `search.js`, `speech.js`

## 2. Nguyên nhân cốt lõi khiến các loài hoa chưa hiển thị nổi bật hoặc bị lỗi ở bản cũ (Bước 2)
1. **Thiếu thư mục `assets/` trên GitHub Repository:**
   - Trong `data/plants.json` và `js/data-bundle.js` của bản cũ, tất cả các trường ảnh đều trỏ tới `"assets/images/plants/..."` hoặc `"assets/images/hero/..."`.
   - Tuy nhiên, trên kho GitHub thực tế **không có thư mục `assets/`**, dẫn tới lỗi `404 Not Found` cho các ảnh hoa từ mã `AN-004` trở đi.
2. **Giới hạn phân trang mặc định chỉ hiển thị 12 thẻ đầu tiên:**
   - Khi mở trang chủ, hàm render trong `js/main.js` cũ cắt danh sách chỉ hiển thị 12 hồ sơ đầu tiên (*"đang hiển thị 12 hồ sơ"*), khiến người xem không nhìn thấy trọn vẹn 20 loài hoa Đà Lạt nếu không tự tìm nút lọc hoặc bấm mở rộng.
3. **Định vị dàn trải 100 loài thực vật ngang nhau:**
   - Hoa Đà Lạt bị xếp chung mức ưu tiên với rau củ, cây gia vị, cây gỗ rừng, kèm quá nhiều khối công cụ kỹ thuật (tính phân bón NPK, tạo JSON cục bộ) ngay trên một trang đơn làm loãng cảm xúc thưởng lãm hoa.

## 3. Giải pháp khắc phục triệt để trong Phiên bản 2.0
- Định vị lại toàn bộ thương hiệu thành **AN NHIÊN – THẾ GIỚI HOA ĐÀ LẠT** (*Bách khoa hoa, cây cảnh và thực vật cao nguyên*).
- Đưa **6 loài hoa biểu tượng** lên Banner lớn và hiển thị ngay **26 thẻ hoa Đà Lạt** (20 loài chủ lực + 6 loài mở rộng) trên trang chủ với hình ảnh thật từ Wikimedia Commons (không còn bất kỳ lỗi 404 nào) cùng cơ chế fallback SVG an toàn.
- Xây dựng **trang hồ sơ chuyên sâu riêng biệt (`#/hoa/<slug>`)** với đầy đủ 20 mục kiến thức khoa học và chăm sóc cho từng loài hoa.
- Thiết lập **11 bộ sưu tập phân loại hoa Đà Lạt** và đặt các chuyên mục Cây cảnh, Cây rừng, Rau nông sản, Cây ăn quả, Bách khoa A–Z, AI, Nhật ký, Sách điện tử ở phần mở rộng phía sau.
