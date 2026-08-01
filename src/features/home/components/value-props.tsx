const ITEMS = [
  { title: "Seamless Tech", copy: "Dệt liền mạch, giảm đường may, tăng độ co giãn." },
  { title: "Sweat Wicking", copy: "Thoát ẩm nhanh gấp 2 lần vải cotton thường." },
  { title: "Squat Proof", copy: "Vải dày dặn, không lộ khi tập chân." },
];

export function ValueProps() {
  return (
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-14 md:grid-cols-3 lg:px-8">
        {ITEMS.map((item) => (
          <div key={item.title}>
            <p className="eyebrow text-muted-foreground">{item.title}</p>
            <p className="mt-2 font-display text-xl font-extrabold uppercase">{item.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
