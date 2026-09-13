import { Link } from "@tanstack/react-router";
import onyxReturns from "@/assets/onyx-v1-returns.png";
import onyxTeam from "@/assets/onyx-team.jpg";
import onyxMidnight from "@/assets/onyx-midnight.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Flame, Sparkles, ShieldCheck } from "lucide-react";

export function OnyxPromo() {
  return (
    <section className="relative overflow-hidden bg-black text-white py-16 px-4 md:px-8 border-y border-neutral-800">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5">
                <Sparkles className="size-3 mr-1" /> Limited Edition 2026
              </Badge>
              <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[11px] font-bold">
                Gymshark x David Laid
              </Badge>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase italic">
              Onyx™ Collection
            </h2>
            <p className="text-sm md:text-base text-neutral-400 max-w-2xl font-medium leading-relaxed">
              Dòng sản phẩm nén cơ bắp Compression huyền thoại trở lại. Công nghệ dệt đa tầng định hình chữ V (V-Taper), hỗ trợ tối ưu từng sợi cơ và kiểm soát thân nhiệt vượt bậc.
            </p>
          </div>

          <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm px-6 h-12 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-105 gap-2">
            <Link to="/products" search={{ q: "onyx" }}>
              <Flame className="size-4 fill-current" />
              Khám Phá Bộ Sưu Tập ONYX
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Gallery Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Main Poster: ONYX V1 RETURNS (Left Col - 7 cols) */}
          <div className="md:col-span-7 relative group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
            <Link to="/products" search={{ q: "onyx" }} className="block h-full">
              <img
                src={onyxReturns}
                alt="Bộ sưu tập Gymshark Onyx V1 Returns"
                className="w-full h-full object-cover object-center max-h-[580px] transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    The Most Physique-Enhancing Top Ever
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    ONYX V1 RETURNS
                  </h3>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                  Xem ngay <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* Right Col (5 cols) - 2 cards */}
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-5">
            {/* Top Card: Onyx Midnight */}
            <div className="relative group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl max-h-[280px]">
              <Link to="/products" search={{ q: "onyx" }} className="block h-full">
                <img
                  src={onyxMidnight}
                  alt="Gymshark Onyx Midnight Edition"
                  className="w-full h-[280px] object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Limited Colorway
                  </span>
                  <h4 className="text-lg font-black text-white">ONYX MIDNIGHT</h4>
                </div>
              </Link>
            </div>

            {/* Bottom Card: Onyx Team Lineup */}
            <div className="relative group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl max-h-[280px]">
              <Link to="/products" search={{ q: "onyx" }} className="block h-full">
                <img
                  src={onyxTeam}
                  alt="Gymshark Onyx Athlete Lineup"
                  className="w-full h-[280px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Athlete Approved
                  </span>
                  <h4 className="text-lg font-black text-white">TRAIN IN THE SHADOWS</h4>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Tags Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center gap-2 font-bold text-neutral-300">
            <ShieldCheck className="size-4 text-cyan-400" />
            Vải Nén Siêu Bền (Heavy Duty)
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center gap-2 font-bold text-neutral-300">
            <Sparkles className="size-4 text-cyan-400" />
            Cắt May V-Taper Tôn Dáng
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center gap-2 font-bold text-neutral-300">
            <Flame className="size-4 text-cyan-400" />
            Họa Tiết Shark Tooth Độc Quyền
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center gap-2 font-bold text-neutral-300">
            <ArrowRight className="size-4 text-cyan-400" />
            Logo 3D Silicon Nổi Bật
          </div>
        </div>
      </div>
    </section>
  );
}
