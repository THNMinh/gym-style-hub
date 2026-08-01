const MESSAGES = [
  "MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN TỪ 1.200.000₫",
  "ĐỔI TRẢ TRONG 30 NGÀY",
  "GIẢM ĐẾN 40% BỘ SƯU TẬP MÙA HÈ",
  "GIAO NHANH 2H NỘI THÀNH HCM & HÀ NỘI",
];

export function AnnouncementBar() {
  const items = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden bg-primary py-2 text-primary-foreground">
      <div className="marquee-track">
        {items.map((message, index) => (
          <span key={index} className="eyebrow whitespace-nowrap px-6">
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
