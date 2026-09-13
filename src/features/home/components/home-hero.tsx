import { Link } from "@tanstack/react-router";
import heroMen from "@/assets/hero-men-onyx.png";
import heroWomen from "@/assets/hero-women-onyx.jpg";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative">
      <div className="grid md:grid-cols-2">
        <div className="relative group overflow-hidden">
          <img
            src={heroMen}
            alt="Đồ tập gym nam hiệu năng cao Onyx"
            width={1600}
            height={1008}
            className="h-[62vh] w-full object-cover object-top md:h-[78vh] transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8">
            <p className="eyebrow text-primary-foreground/80 tracking-widest uppercase font-bold text-xs">Bộ sưu tập AW26 · Onyx Tech</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">Đồ tập nam</h2>
            <Button asChild variant="secondary" className="mt-4 font-bold">
              <Link to="/products" search={{ gender: "Men" }}>
                Mua ngay
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative group overflow-hidden">
          <img
            src={heroWomen}
            alt="Đồ tập gym nữ nâng mông tôn dáng Onyx"
            width={1600}
            height={1008}
            loading="lazy"
            className="h-[62vh] w-full object-cover object-top md:h-[78vh] transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8">
            <p className="eyebrow text-primary-foreground/80 tracking-widest uppercase font-bold text-xs">Seamless Series · Tôn Dáng Tối Đa</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">Đồ tập nữ</h2>
            <Button asChild variant="secondary" className="mt-4 font-bold">
              <Link to="/products" search={{ gender: "Women" }}>
                Mua ngay
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
