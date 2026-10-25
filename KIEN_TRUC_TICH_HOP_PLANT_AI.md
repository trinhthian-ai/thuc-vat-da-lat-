# KIẾN TRÚC TÍCH HỢP NHẬN DIỆN CÂY BẰNG AI & KHÓA HÌNH THÁI

Theo yêu cầu kỹ thuật tại **Mục 7** và **Mục 10**:
> *"Chỉ hiển thị chức năng thực sự hoạt động; những chức năng cần API hoặc backend phải được giải thích rõ. Không có nút chức năng giả."*

## 1. Chức năng đang hoạt động trực tiếp 100% trên trình duyệt (Không cần Backend)
- **Khóa tra cứu & đối chiếu đặc điểm hình thái (Morphology Matcher):** Người dùng chọn màu sắc hoa, dạng sống/không gian bắt gặp và mùa nở hoa tại Đà Lạt → Hệ thống đối chiếu tức thì trên cơ sở dữ liệu thực của 26 loài hoa Đà Lạt và trả về các hồ sơ khớp nhất.

## 2. Hướng dẫn khi muốn kết nối API Thị giác máy tính (Gemini Vision / PlantNet API)
Do GitHub Pages chỉ phục vụ tệp tĩnh (`HTML/CSS/JS`), việc đặt trực tiếp khóa `API_KEY` trong mã nguồn JavaScript phía trình duyệt sẽ làm lộ khóa bảo mật. Để triển khai nhận diện qua ảnh tải lên bằng AI thực tế, khuyến nghị sử dụng một **Cloudflare Worker** miễn phí làm cầu nối trung gian:

```javascript
// Ví dụ cấu hình Cloudflare Worker Proxy (Ẩn API Key an toàn)
export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const body = await request.json();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    return new Response(await response.text(), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};
```
