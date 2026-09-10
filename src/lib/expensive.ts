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

export type SearchResult = {
  items: Product[]
  /** Lần tính gần nhất mất bao nhiêu ms */
  ms: number
  /** Hàm này đã thực sự chạy bao nhiêu lần cho khu vực đo `meterId` */
  runs: number
  /** Tổng thời gian đã tiêu tốn (ms) */
  totalMs: number
}

const meters = new Map<string, { runs: number; totalMs: number }>()

export function resetMeters() {
  meters.clear()
}

/**
 * Lọc + sắp xếp 2000 sản phẩm, kèm một vòng lặp giả lập công việc nặng
 * (khoảng 40ms) — đủ lớn để khán giả CẢM NHẬN được độ giật khi gõ phím,
 * nhưng chưa tới mức làm ô nhập không dùng được.
 *
 * `meterId` chỉ phục vụ việc đếm cho demo, không liên quan tới logic.
 */
export function expensiveSearch(products: Product[], query: string, meterId: string): SearchResult {
  const started = performance.now()
  const q = query.trim().toLowerCase()

  const items = products
    .filter((p) => {
      // giả lập phần tính toán tốn CPU (~40ms cho cả 2000 sản phẩm)
      let noise = 0
      for (let i = 0; i < 9000; i++) {
        noise += Math.sqrt((i * p.id) % 97)
      }
      return noise > 0 && (q === '' || p.name.toLowerCase().includes(q))
    })
    .sort((a, b) => a.price - b.price)
    .slice(0, 5)

  const ms = Math.round(performance.now() - started)
  const meter = meters.get(meterId) ?? { runs: 0, totalMs: 0 }
  meter.runs += 1
  meter.totalMs += ms
  meters.set(meterId, meter)

  return { items, ms, runs: meter.runs, totalMs: meter.totalMs }
}

export function formatVnd(value: number) {
  return value.toLocaleString('vi-VN') + '₫'
}
