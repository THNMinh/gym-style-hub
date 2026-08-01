import { Link } from "@tanstack/react-router";

const COLUMNS = [
  {
    title: "Mua sắm",
    links: [
      { label: "Đồ nam", to: "/products", search: { gender: "Men" as const } },
      { label: "Đồ nữ", to: "/products", search: { gender: "Women" as const } },
      { label: "Unisex", to: "/products", search: { gender: "Unisex" as const } },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Đơn hàng của tôi", to: "/account", search: {} },
      { label: "Danh sách yêu thích", to: "/wishlist", search: {} },
      { label: "Giỏ hàng", to: "/cart", search: {} },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-16 md:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-3xl font-extrabold uppercase">Gymkitten</p>
          <p className="mt-3 max-w-xs text-sm opacity-70">
            Trang phục tập luyện được thiết kế để bạn tiến xa hơn mỗi ngày.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="eyebrow opacity-60">{column.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} search={link.search} className="opacity-80 hover:opacity-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="eyebrow opacity-60">Bản tin</p>
          <p className="mt-4 text-sm opacity-80">
            Nhận thông báo drop mới và ưu đãi riêng cho thành viên.
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-4 py-6 text-center text-xs opacity-60 lg:px-8">
        © {new Date().getFullYear()} Gymkitten. Dự án demo phi thương mại.
      </div>
    </footer>
  );
}
