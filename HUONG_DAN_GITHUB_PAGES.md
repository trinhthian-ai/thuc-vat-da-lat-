# HƯỚNG DẪN ĐƯA WEBSITE LÊN GITHUB PAGES (`annhienai/thucvatdalat-7an`)

Tài liệu này hướng dẫn từng bước để Chị **Trịnh Thị An (An Nhiên AI – TTA)** cập nhật bộ mã nguồn mới lên kho lưu trữ `https://github.com/annhienai/thucvatdalat-7an` và xuất bản tại `https://annhienai.github.io/thucvatdalat-7an/`.

---

## Cách 1: Tải trực tiếp qua giao diện web GitHub (Nhanh và dễ nhất – Không cần cài phần mềm)

1. Giải nén file **`an-nhien-the-gioi-hoa-dalat-github-pages.zip`** trên máy tính của chị.
2. Mở trình duyệt và đăng nhập vào kho mã nguồn:  
   [https://github.com/annhienai/thucvatdalat-7an](https://github.com/annhienai/thucvatdalat-7an)
3. Nhấn nút **Add file** → chọn **Upload files**.
4. Kéo toàn bộ các tệp và thư mục bên trong thư mục vừa giải nén (`index.html`, `css/`, `js/`, `data/`, `assets/`, `README.md`...) thả vào khung tải lên của GitHub.
5. Ở ô **Commit changes** phía dưới:
   - Nhập tiêu đề: `Nâng cấp toàn diện AN NHIÊN – THẾ GIỚI HOA ĐÀ LẠT v2.0 (Ưu tiên Hoa Đà Lạt)`
   - Chọn **Commit directly to the `main` branch**.
   - Nhấn nút xanh **Commit changes**.
6. Chờ khoảng **1 – 2 phút** để GitHub Pages tự động cập nhật, sau đó mở lại địa chỉ:  
   [https://annhienai.github.io/thucvatdalat-7an/](https://annhienai.github.io/thucvatdalat-7an/)  
   *(Mẹo: Nhấn `Ctrl + F5` trên máy tính hoặc làm mới trang trên điện thoại để xóa bộ nhớ đệm cũ).*

---

## Cách 2: Cập nhật bằng Git trên máy tính (Dành cho quản trị mã nguồn)

```bash
# 1. Sao chép kho lưu trữ hiện tại về máy
git clone https://github.com/annhienai/thucvatdalat-7an.git
cd thucvatdalat-7an

# 2. Tạo nhánh sao lưu phiên bản cũ (Bước 3 bắt buộc)
git checkout -b backup-v1-before-flower-redesign
git push origin backup-v1-before-flower-redesign
git checkout main

# 3. Giải nén bộ mã nguồn mới đè vào thư mục thucvatdalat-7an
# (Đảm bảo có đầy đủ index.html, css/, js/, data/, assets/)

# 4. Đưa lên GitHub Pages
git add .
git commit -m "Thiết kế lại toàn diện AN NHIÊN – THẾ GIỚI HOA ĐÀ LẠT v2.0"
git push origin main
```

---

## Kiểm tra sau khi xuất bản (Danh sách nghiệm thu)
- [x] Mở trang chủ thấy ngay Banner 6 loài hoa Đà Lạt rực rỡ (*Phượng tím, Mai anh đào, Mimosa, Cẩm tú cầu, Hoa lan, Hoa hồng*).
- [x] Ô tìm kiếm lớn ngay dưới banner với dòng chữ **“HÔM NAY BẠN MUỐN KHÁM PHÁ LOÀI HOA NÀO?”**.
- [x] Gõ tìm **“Phượng tím”** → Mở ngay hồ sơ chuyên sâu Phượng tím (`#/hoa/phuong-tim`).
- [x] Gõ tìm **“Cẩm tú cầu”** → Mở ngay hồ sơ chuyên sâu Cẩm tú cầu (`#/hoa/cam-tu-cau`).
- [x] Gõ tìm **“Hoa lan”** → Mở danh sách 5 nhóm/loài hoa lan Đà Lạt (*Lan hồ điệp, Địa lan, Lan hoàng thảo, Lan Cattleya, Lan hài*).
- [x] Hiển thị đầy đủ 26 thẻ hoa trên trang chủ (không bị ẩn sau giới hạn 12 thẻ, không có ảnh lỗi 404).
