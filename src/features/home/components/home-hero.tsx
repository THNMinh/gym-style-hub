import { Link } from "@tanstack/react-router";
import heroMen from "@/assets/hero-men.jpg";
import heroWomen from "@/assets/hero-women.jpg";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative">
      <div className="grid md:grid-cols-2">
        <div className="relative">
          <img
            src={heroMen}
            alt="Nam giới tập luyện với tạ tay trong phòng gym tối"
            width={1600}
            height={1008}
            className="h-[62vh] w-full object-cover md:h-[78vh]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent p-8">
            <p className="eyebrow text-primary-foreground/80">Bộ sưu tập AW26</p>
            <h2 className="mt-2 text-3xl text-primary-foreground md:text-4xl">Đồ tập nam</h2>
            <Button asChild variant="secondary" className="mt-4">
              <Link to="/products" search={{ gender: "Men" }}>
                Mua ngay
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroWomen}
            alt="Nữ giới giãn cơ trong studio tập luyện tối màu"
            width={1600}
            height={1008}
            loading="lazy"
            className="h-[62vh] w-full object-cover md:h-[78vh]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent p-8">
            <p className="eyebrow text-primary-foreground/80">Seamless Series</p>
            <h2 className="mt-2 text-3xl text-primary-foreground md:text-4xl">Đồ tập nữ</h2>
            <Button asChild variant="secondary" className="mt-4">
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
