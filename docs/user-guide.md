# 📘 BloxTCGShop — Hướng dẫn sử dụng

> **Phiên bản:** 1.0  
> **Cập nhật:** 22/05/2026  
> **Website:** [https://bloxtcgshop.com](https://bloxtcgshop.com)

---

## Mục lục

- [Phần 1: Trang người dùng (User)](#phần-1-trang-người-dùng-user)
  - [1.1 Trang chủ](#11-trang-chủ)
  - [1.2 Đăng ký tài khoản](#12-đăng-ký-tài-khoản)
  - [1.3 Đăng nhập](#13-đăng-nhập)
  - [1.4 Sản phẩm](#14-sản-phẩm)
  - [1.5 Danh mục](#15-danh-mục)
  - [1.6 Pokémon](#16-pokémon)
  - [1.7 Bộ thẻ (Sets)](#17-bộ-thẻ-sets)
  - [1.8 Bảng xếp hạng](#18-bảng-xếp-hạng)
  - [1.9 Tin tức](#19-tin-tức)
  - [1.10 Sự kiện & Quay số](#110-sự-kiện--quay-số)
  - [1.11 Chuyển đổi ngôn ngữ](#111-chuyển-đổi-ngôn-ngữ)
  - [1.12 Menu người dùng](#112-menu-người-dùng)
- [Phần 2: Trang quản trị (Admin)](#phần-2-trang-quản-trị-admin)
  - [2.1 Đăng nhập Admin](#21-đăng-nhập-admin)
  - [2.2 Bảng điều khiển (Dashboard)](#22-bảng-điều-khiển-dashboard)
  - [2.3 Quản lý Sản phẩm](#23-quản-lý-sản-phẩm)
  - [2.4 Quản lý Danh mục](#24-quản-lý-danh-mục)
  - [2.5 Quản lý Banner](#25-quản-lý-banner)
  - [2.6 Quản lý Tin tức](#26-quản-lý-tin-tức)
  - [2.7 Quản lý Sự kiện](#27-quản-lý-sự-kiện)
  - [2.8 Quản lý Người dùng](#28-quản-lý-người-dùng)

---

# Phần 1: Trang người dùng (User)

## 1.1 Trang chủ

**URL:** `https://bloxtcgshop.com/ja` (hoặc `https://bloxtcgshop.com/en`, `https://bloxtcgshop.com/vi`)

Trang chủ hiển thị tổng quan toàn bộ nội dung của shop, bao gồm:

| Khu vực | Mô tả |
|---|---|
| **Hero Banner** | Banner chính với nút "Mua ngay" và "Xếp hạng" |
| **Banner quảng cáo** | Ảnh banner khuyến mãi (do admin tạo) |
| **Pokémon** | Dãy scroll ngang các Pokémon, bấm để xem sản phẩm liên quan |
| **Danh mục** | Grid các danh mục sản phẩm (Booster Pack, Battle Deck, Singles...) |
| **Hàng mới** | Sản phẩm mới nhất được đánh dấu `isNewArrival` |
| **Bảng xếp hạng** | Top 10 sản phẩm bán chạy (podium top 3 + danh sách 4–10) |
| **Tin tức** | 5 bài viết mới nhất |

> **Mẹo:** Tất cả các khu vực đều có link "Xem thêm" để chuyển đến trang chi tiết.

---

## 1.2 Đăng ký tài khoản

**URL:** `https://bloxtcgshop.com/ja/register`

**Các bước:**
1. Bấm **"Đăng ký"** (hoặc "Register" / "新規登録") từ trang đăng nhập
2. Điền thông tin:
   - **Họ tên** — Tên hiển thị
   - **Email** — Địa chỉ email (dùng để đăng nhập)
   - **Mật khẩu** — Tối thiểu 6 ký tự
3. Bấm **"Đăng ký"**
4. Hệ thống tự chuyển về trang đăng nhập → Đăng nhập bằng tài khoản vừa tạo

---

## 1.3 Đăng nhập

**URL:** `https://bloxtcgshop.com/ja/login`

**Các bước:**
1. Bấm **"Login"** trên thanh Header (góc trên bên phải)
2. Nhập **Email** và **Mật khẩu**
3. Bấm **"Đăng nhập"**
4. Đăng nhập thành công → chuyển về trang chủ

> Nếu nhập sai email hoặc mật khẩu, hệ thống sẽ hiện thông báo lỗi màu đỏ.

---

## 1.4 Sản phẩm

### Danh sách sản phẩm
**URL:** `https://bloxtcgshop.com/ja/products`

- Hiển thị grid sản phẩm (2 cột mobile, 4 cột desktop)
- Hỗ trợ phân trang (Prev / Next)
- Hỗ trợ lọc theo:
  - `?q=keyword` — Tìm kiếm theo tên
  - `?categorySlug=booster-packs` — Lọc theo danh mục
  - `?setSlug=scarlet-violet` — Lọc theo bộ thẻ
  - `?sortBy=price` — Sắp xếp

### Chi tiết sản phẩm
**URL:** `https://bloxtcgshop.com/ja/products/[slug]`

- Ảnh sản phẩm
- Tên, giá gốc, giá sale (nếu có)
- Mô tả chi tiết
- Thông tin danh mục

---

## 1.5 Danh mục

**URL:** `https://bloxtcgshop.com/ja/categories`

- Hiển thị danh sách tất cả danh mục dạng grid
- Mỗi danh mục có icon + tên
- Bấm vào → chuyển đến `https://bloxtcgshop.com/ja/categories/[slug]` xem sản phẩm thuộc danh mục đó

---

## 1.6 Pokémon

**URL:** `https://bloxtcgshop.com/ja/pokemon`

- Hiển thị danh sách Pokémon với sprite
- Bấm vào → chuyển đến `https://bloxtcgshop.com/ja/pokemon/[slug]` xem sản phẩm liên quan

---

## 1.7 Bộ thẻ (Sets)

**URL:** `https://bloxtcgshop.com/ja/sets`

- Hiển thị các bộ thẻ TCG
- Bấm vào → xem sản phẩm thuộc bộ thẻ đó

---

## 1.8 Bảng xếp hạng

**URL:** `https://bloxtcgshop.com/ja/rankings`

- Top 25 sản phẩm bán chạy nhất
- Top 3 có badge vàng nổi bật
- Hiển thị: thứ hạng, ảnh, tên, giá

---

## 1.9 Tin tức

### Danh sách tin tức
**URL:** `https://bloxtcgshop.com/ja/news`

- Grid 2 cột các bài viết
- Hiển thị: ngày đăng, tiêu đề
- Bấm vào → xem chi tiết

### Chi tiết tin tức
**URL:** `https://bloxtcgshop.com/ja/news/[slug]`

- Nội dung đầy đủ bài viết
- Đa ngôn ngữ (JA/EN/VI)

---

## 1.10 Sự kiện & Quay số

### Danh sách sự kiện
**URL:** `https://bloxtcgshop.com/ja/events`

- Grid 3 cột hiển thị các sự kiện
- Mỗi sự kiện hiển thị:
  - Ảnh (hoặc icon mặc định)
  - Trạng thái: Sắp diễn ra / Đang mở / Đã đóng / Đã quay
  - Số người tham gia / Tối đa
  - Ngày quay (nếu có)
  - Số trúng thưởng (nếu đã quay)

### Chi tiết sự kiện
**URL:** `https://bloxtcgshop.com/ja/events/[slug]`

**Nếu chưa đăng nhập:**
- Hiển thị nút **"Đăng nhập"** để tham gia

**Nếu đã đăng nhập và sự kiện đang mở:**
1. Bấm **"🎲 Tham gia"**
2. Hệ thống cấp **số may mắn** (Lucky Number) ngẫu nhiên
3. Số may mắn hiển thị to trên trang

**Nếu đã tham gia:**
- Hiển thị số may mắn của bạn
- Nếu bạn thắng → hiện badge **"🏆 Chúc mừng! Bạn đã thắng!"**

**Nếu sự kiện đã đóng/quay:**
- Hiển thị số trúng thưởng

---

## 1.11 Chuyển đổi ngôn ngữ

- Trên **Header** có 3 nút: **EN** | **VI** | **JA**
- Bấm vào để chuyển ngôn ngữ toàn bộ website
- Hỗ trợ: Tiếng Nhật (JA), Tiếng Anh (EN), Tiếng Việt (VI)

---

## 1.12 Menu người dùng

Sau khi đăng nhập, góc trên bên phải hiện **avatar + tên người dùng**.

Bấm vào sẽ hiện dropdown:
- **Email** (chỉ hiển thị)
- **⚙️ Admin** — Nếu tài khoản có role ADMIN → truy cập trang quản trị
- **🚪 Logout** — Đăng xuất

---

# Phần 2: Trang quản trị (Admin)

> **Yêu cầu:** Tài khoản phải có role **ADMIN** mới truy cập được.

## 2.1 Đăng nhập Admin

**URL:** `https://bloxtcgshop.com/vi/admin/login`

**Các bước:**
1. Truy cập URL trên
2. Nhập **Email** và **Mật khẩu** của tài khoản Admin
3. Bấm **"Đăng nhập"**
4. Thành công → chuyển đến bảng điều khiển

---

## 2.2 Bảng điều khiển (Dashboard)

**URL:** `https://bloxtcgshop.com/vi/admin`

Hiển thị 4 thẻ thống kê:

| Thẻ | Mô tả |
|---|---|
| 📦 Tổng sản phẩm | Tổng số sản phẩm trong hệ thống |
| 📁 Danh mục | Tổng số danh mục |
| ⚠️ Hết hàng | Số sản phẩm có stock = 0 |
| 🆕 Mới tuần này | Sản phẩm thêm trong tuần |

### Thanh điều hướng bên trái (Sidebar)

| Menu | Chức năng |
|---|---|
| 📊 Bảng điều khiển | Trang tổng quan |
| 📦 Sản phẩm | Quản lý sản phẩm |
| 📁 Danh mục | Quản lý danh mục |
| 🖼️ Banner | Quản lý banner quảng cáo |
| 📰 Tin tức | Quản lý bài viết |
| 🎉 Sự kiện | Quản lý sự kiện & quay số |
| 👥 Người dùng | Quản lý tài khoản |
| ← Về trang chủ | Quay lại trang user |

---

## 2.3 Quản lý Sản phẩm

**URL:** `https://bloxtcgshop.com/vi/admin/products`

### Danh sách sản phẩm
- Bảng hiển thị: Ảnh, Tên, SKU, Giá, Kho, Danh mục, Thao tác
- **Tìm kiếm:** Ô tìm theo tên, SKU, slug, danh mục
- **Phân trang:** 15 sản phẩm/trang, có nút chuyển trang
- **Bấm vào dòng** → mở popup chi tiết sản phẩm

### Thêm sản phẩm
1. Bấm **"+ Thêm sản phẩm"**
2. Điền form:

| Trường | Mô tả |
|---|---|
| Slug | URL-friendly identifier (vd: `pikachu-vmax`) |
| SKU | Mã sản phẩm (vd: `PKM-001`) |
| Giá (¥) | Giá gốc |
| Giá sale (¥) | Giá khuyến mãi (để trống nếu không sale) |
| Tồn kho | Số lượng trong kho |
| Danh mục | Chọn từ dropdown |
| Tên (JA/EN/VI) | Tên sản phẩm 3 ngôn ngữ |
| Mô tả (JA/EN/VI) | Mô tả sản phẩm 3 ngôn ngữ |
| Ảnh sản phẩm | Upload file ảnh |
| Nổi bật | Đánh dấu sản phẩm featured |
| Hàng mới | Đánh dấu sản phẩm new arrival |

3. Bấm **"💾 Lưu"**

### Sửa sản phẩm
- Bấm **"Sửa"** trên dòng sản phẩm → mở form chỉnh sửa

### Xóa sản phẩm
- Bấm **"Xóa"** → hệ thống hỏi xác nhận → bấm OK để xóa

---

## 2.4 Quản lý Danh mục

**URL:** `https://bloxtcgshop.com/vi/admin/categories`

### Hiển thị
- Dạng danh sách phân cấp (cha → con)
- Mỗi danh mục hiển thị: Icon, Tên, Slug, Thứ tự
- Hover vào → hiện nút **Sửa**, **+ Con**, **Xóa**

### Thêm danh mục
1. Bấm **"+ Thêm danh mục"**
2. Điền form:

| Trường | Mô tả |
|---|---|
| Slug | URL identifier (vd: `booster-packs`) |
| Thứ tự sắp xếp | Số thứ tự hiển thị |
| Tên (JA/EN/VI) | Tên danh mục 3 ngôn ngữ |
| Icon | Chọn 1 trong 3 cách: **Emoji** / **Upload ảnh** / **URL** |

3. Bấm **"💾 Lưu"**

### Thêm danh mục con
- Bấm **"+ Con"** trên danh mục cha → form sẽ tự gán parentId

### Sửa / Xóa
- Tương tự sản phẩm

> ⚠️ **Lưu ý:** Xóa danh mục cha sẽ xóa luôn tất cả danh mục con.

---

## 2.5 Quản lý Banner

**URL:** `https://bloxtcgshop.com/vi/admin/banners`

### Hiển thị
- Grid 3 cột, mỗi banner hiển thị: ảnh, tiêu đề, thứ tự, trạng thái (hiển thị/ẩn)
- Hover → hiện nút **Sửa**, **Xóa**

### Thêm banner
1. Bấm **"+ Thêm banner"**
2. Điền form:

| Trường | Mô tả |
|---|---|
| Ảnh banner | Upload file ảnh |
| Link URL | URL khi bấm vào banner |
| Thứ tự | Số thứ tự hiển thị |
| Tiêu đề (JA) | Tiêu đề tiếng Nhật |
| Tiêu đề (VI) | Tiêu đề tiếng Việt |
| Đang hiển thị | Bật/tắt hiển thị banner |

3. Bấm **"💾 Lưu"**

---

## 2.6 Quản lý Tin tức

**URL:** `https://bloxtcgshop.com/vi/admin/news`

### Danh sách
- Bảng hiển thị: Tiêu đề, Slug, Trạng thái (Đã xuất bản / Nháp), Ngày, Thao tác
- Bấm vào dòng → xem chi tiết bài viết (cả JA và VI)

### Thêm bài viết
1. Bấm **"+ Thêm bài viết"**
2. Điền form:

| Trường | Mô tả |
|---|---|
| Slug | URL identifier (vd: `new-expansion-release`) |
| Xuất bản ngay | Tick để publish, bỏ tick để lưu nháp |
| Tiêu đề (JA/VI) | Tiêu đề 2 ngôn ngữ |
| Nội dung (JA/VI) | Nội dung 2 ngôn ngữ |

3. Bấm **"💾 Lưu"**

---

## 2.7 Quản lý Sự kiện

**URL:** `https://bloxtcgshop.com/vi/admin/events`

### Danh sách sự kiện
- Bảng: Tên, Trạng thái, Người tham gia, Số trúng, Thao tác
- Bấm vào dòng → xem chi tiết + danh sách đăng ký

### Trạng thái sự kiện

| Trạng thái | Ý nghĩa | Hành động |
|---|---|---|
| **Sắp diễn ra** | Chưa mở đăng ký | Bấm **"Mở"** để chuyển sang OPEN |
| **Đang mở** | User có thể đăng ký | Bấm **"Đóng"** hoặc **"Quay"** |
| **Đã đóng** | Ngừng nhận đăng ký | Bấm **"Quay"** để quay số |
| **Đã quay** | Đã có kết quả | Chỉ xem |
| **Đã hủy** | Sự kiện bị hủy | Chỉ xem |

### Thêm sự kiện
1. Bấm **"+ Thêm sự kiện"**
2. Điền form:

| Trường | Mô tả |
|---|---|
| Slug | URL identifier |
| Tên sự kiện | Tiêu đề |
| Số người tối đa | Giới hạn người tham gia |
| Ngày quay | Ngày dự kiến quay số |
| Mô tả | Mô tả sự kiện |
| Mô tả giải thưởng | Thông tin giải thưởng |

3. Bấm **"Lưu"**

### Quay số trúng thưởng
1. Tại sự kiện **Đang mở** hoặc **Đã đóng**, bấm **"Quay"**
2. Modal **"Quay số trúng thưởng"** mở ra:
   - **Số lượng người thắng:** Nhập số lượng (mặc định 1)
   - **Ngôn ngữ email thông báo:** Tiếng Nhật (JA) hoặc Tiếng Anh (EN)
3. Bấm **"Xác nhận quay số"**
4. Modal xác nhận hiện ra → Bấm **"Xác nhận"**
5. Hệ thống:
   - Random người thắng từ danh sách đã đăng ký
   - Gửi email thông báo cho người thắng
   - Chuyển trạng thái sự kiện sang **"Đã quay"**
6. Modal **"Kết quả quay số"** hiện bảng danh sách người thắng

### Xem chi tiết sự kiện
- Bấm vào dòng sự kiện → popup hiển thị:
  - Thông tin sự kiện
  - Danh sách đăng ký (Số, Email, Tên, Trạng thái thắng)

---

## 2.8 Quản lý Người dùng

**URL:** `https://bloxtcgshop.com/vi/admin/users`

### Danh sách
- Bảng: Email, Tên, Role, Ngôn ngữ, Ngày tạo, Thao tác
- **Tìm kiếm:** Ô tìm theo email, tên, role
- **Phân trang:** 20 user/trang

### Thay đổi quyền
- Cột **Role** có dropdown: `USER` / `ADMIN`
- Chọn giá trị mới → tự động cập nhật

### Xóa người dùng
- Bấm **"Xóa"** → hệ thống hỏi xác nhận → OK để xóa

> ⚠️ **Lưu ý:** Xóa người dùng là hành động không thể hoàn tác.

