/**
 * Dữ liệu + một hàm tính toán CỐ TÌNH nặng, để nhìn thấy rõ sự khác biệt
 * giữa "có memo hoá" và "không memo hoá".
 */

export type Product = {
  id: number
  name: string
  price: number
  category: string
}

const CATEGORIES = ['Laptop', 'Bàn phím', 'Chuột', 'Màn hình', 'Tai nghe', 'Webcam']
const BRANDS = ['Acer', 'Asus', 'Dell', 'HP', 'Lenovo', 'Logitech', 'Razer', 'Sony', 'MSI']

export const PRODUCTS: Product[] = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  name: `${BRANDS[i % BRANDS.length]} ${CATEGORIES[i % CATEGORIES.length]} ${1000 + i}`,
  price: 500_000 + ((i * 137_000) % 40_000_000),
  category: CATEGORIES[i % CATEGORIES.length],
}))

/**
 * Số vòng lặp "vô nghĩa" cho MỖI sản phẩm. 60_000 × 2000 sản phẩm ≈ 85ms trên
 * máy dev — vượt ngưỡng ~50ms mà mắt người bắt đầu thấy khựng khi gõ phím.
 * Máy yếu hơn sẽ chậm hơn; nếu trình diễn trên máy khác thì chỉnh số này.
 */
const NOISE_LOOPS_PER_PRODUCT = 60_000

/**
 * Lọc + sắp xếp 2000 sản phẩm, kèm một vòng lặp giả lập công việc nặng
 * (khoảng 85ms) — đủ lớn để khán giả CẢM NHẬN được độ giật khi gõ phím,
 * nhưng chưa tới mức làm ô nhập không dùng được.
 *
 * Mỗi lần chạy trả về một mảng MỚI — nhờ vậy bên ngoài đếm được hàm đã
 * thực sự chạy bao nhiêu lần (xem useSearchMeter trong AutoUseMemoDemo).
 */
export function expensiveSearch(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase()

  return products
    .filter((p) => {
      let noise = 0
      for (let i = 0; i < NOISE_LOOPS_PER_PRODUCT; i++) {
        noise += Math.sqrt((i * p.id) % 97)
      }
      return noise > 0 && (q === '' || p.name.toLowerCase().includes(q))
    })
    .sort((a, b) => a.price - b.price)
    .slice(0, 5)
}

export function formatVnd(value: number) {
  return value.toLocaleString('vi-VN') + '₫'
}
