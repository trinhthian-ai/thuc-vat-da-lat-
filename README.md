# AN NHIÊN – THẾ GIỚI HOA ĐÀ LẠT
**Bách khoa hoa, cây cảnh và thực vật cao nguyên**  
*“Mỗi loài hoa một câu chuyện – Mỗi sắc hoa một miền thương nhớ.”*

- **Tác giả:** Trịnh Thị An  
- **Thương hiệu:** An Nhiên AI (TTA)  
- **Zalo / Điện thoại:** 0834 133 344  
- **Facebook:** [https://www.facebook.com/trinhthi.an.5](https://www.facebook.com/trinhthi.an.5)  
- **YouTube:** [https://youtube.com/@annhienaimusictta?si=5pXWSG77iLaLYkJh](https://youtube.com/@annhienaimusictta?si=5pXWSG77iLaLYkJh)  
- **Website GitHub Pages:** [https://annhienai.github.io/thucvatdalat-7an/](https://annhienai.github.io/thucvatdalat-7an/)  
- **Kho mã nguồn:** [https://github.com/annhienai/thucvatdalat-7an](https://github.com/annhienai/thucvatdalat-7an)

---

## 1. Trọng tâm thiết kế mới (Version 2.0 – Dalat Flowers First)
1. **Định vị rõ ràng ngay từ giây đầu tiên:** Lấy **Hoa Đà Lạt** làm trung tâm với khu vườn nghệ thuật 5 sao, Banner 6 loài hoa biểu tượng (*Phượng tím, Mai anh đào, Mimosa, Cẩm tú cầu, Hoa lan, Hoa hồng*) và thanh tìm kiếm lớn ngay dưới banner.
2. **Hiển thị trọn vẹn 26 thẻ hoa Đà Lạt trên trang chủ:** Bao gồm **20 loài hoa chủ lực** theo danh mục ưu tiên và **6 loài hoa Đà Lạt mở rộng** (*Dã quỳ, Chùm ớt, Thanh anh, Lan hoàng thảo, Lan Cattleya, Lan hài*). Khắc phục triệt để lỗi giới hạn 12 thẻ và lỗi mất thư mục ảnh `assets/` của phiên bản cũ.
3. **Mỗi loài hoa có một trang hồ sơ chuyên sâu riêng (`#/hoa/<slug>`):** Gồm đầy đủ 20 mục thực vật học, hình thái, màu sắc, khí hậu, ánh sáng, nhiệt độ, đất/giá thể, tưới nước, bón phân, nhân giống, kỹ thuật kích hoa, sâu bệnh, mùa hoa Đà Lạt, đặc điểm thú vị, văn hóa và nguồn tham khảo khoa học (Kew POWO, Wikimedia Commons).
4. **11 Bộ sưu tập phân loại hoa Đà Lạt:** Hoa đường phố Đà Lạt, Hoa mùa xuân, Hoa mùa hè, Hoa mùa thu, Hoa mùa đông, Hoa lan, Hoa trồng chậu, Hoa leo, Hoa vườn, Hoa dại, Hoa dùng để cắt cành.
5. **Chuyên mục mở rộng đặt phía sau phần Hoa Đà Lạt:** Cây cảnh Đà Lạt, Cây rừng và sinh thái, Rau và nông sản, Cây ăn quả, Bách khoa thực vật A–Z, Nhận diện hoa theo đặc điểm hình thái & AI, Nhật ký khu vườn, Sách điện tử.
6. **Chân dung thương hiệu Trịnh Thị An tại 4 vị trí:** Thanh điều hướng, Khu vực giới thiệu tác giả, Trang “Về An Nhiên” và Chân trang (hỗ trợ nút tải ảnh chân dung thật trực tiếp trên trình duyệt hoặc thay file trong `assets/images/author/`).

---

## 2. Cấu trúc thư mục dự án
```text
thucvatdalat-7an/
├── index.html                           # Trang chính SPA (Trang chủ + Trang Hồ sơ hoa + Trang Về An Nhiên)
├── css/
│   └── style.css                        # Giao diện Vườn hoa Đà Lạt nghệ thuật 5 sao
├── js/
│   ├── data-bundle.js                   # Gói dữ liệu tích hợp (26 hồ sơ hoa, 11 bộ sưu tập, 16 thực vật mở rộng)
│   └── main.js                          # Bộ điều khiển tìm kiếm, bộ lọc, hồ sơ 20 mục, Lightbox, Nhật ký
├── data/
│   ├── flowers.json                     # Dữ liệu JSON chuẩn hóa của 26 loài hoa Đà Lạt
│   ├── collections.json                 # Dữ liệu 11 bộ sưu tập mùa hoa & không gian sống
│   ├── supplementary_plants.json        # Dữ liệu Cây cảnh, Cây rừng, Rau nông sản, Cây ăn quả
│   └── plants.json                      # Gói dữ liệu tổng hợp tương thích ngược
├── assets/
│   └── images/
│       ├── banner/                      # Thư mục đặt ảnh Banner 6 loài hoa biểu tượng
│       ├── flowers/                     # Thư mục đặt ảnh thật của từng loài hoa (phuong-tim-1.jpg...)
│       ├── collections/                 # Thư mục đặt ảnh bìa 11 bộ sưu tập
│       └── author/                      # Thư mục đặt ảnh chân dung thật (trinh-thi-an.jpg)
├── backup_v1_audit/
│   └── BAO_CAO_KIEM_TRA_VA_SAO_LUU_V1.md # Báo cáo kiểm tra nguyên nhân lỗi bản v1 & sao lưu cấu trúc
├── HUONG_DAN_GITHUB_PAGES.md            # Hướng dẫn cập nhật mã nguồn lên GitHub Pages
├── HUONG_DAN_QUAN_TRI_VA_THAY_ANH.md    # Hướng dẫn chi tiết cách thay ảnh hoa & ảnh chân dung thật
└── KIEN_TRUC_TICH_HOP_PLANT_AI.md       # Giải thích kiến trúc khóa phân loại hình thái & kết nối API AI
```
