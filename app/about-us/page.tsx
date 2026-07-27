import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import AboutHero from "@/components/aboutUs/AboutHero";
import AboutSection from "@/components/aboutUs/AboutSection";
import MarketplaceTestimonial from "@/components/aboutUs/MarketplaceTestimonial";

export default function AboutPage() {
    return (
        <main className="relative overflow-hidden bg-[#F2F4F5]">

            {/* ================= Background Bubble ================= */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">

                {/* Yellow Bubble Bottom Left */}
                <div
                    className="
                        absolute

                        -left-24
                        top-56

                        w-[260px]
                        h-[260px]

                        sm:-left-32
                        sm:top-64
                        sm:w-[360px]
                        sm:h-[360px]

                        md:-left-40
                        md:top-72
                        md:w-[480px]
                        md:h-[480px]

                        lg:-left-[220px]
                        lg:top-[280px]
                        lg:w-[620px]
                        lg:h-[620px]

                        rounded-full
                    "
                    style={{
                        background:
                            "radial-gradient(50% 50% at 50% 50%, #FFE100 0%, rgba(255,225,0,0) 100%)",
                        filter: "blur(80px)",
                    }}
                />

                {/* Yellow Bubble Top */}
                <div
                    className="
                        absolute

                        left-[180px]
                        top-[120px]

                        w-[80px]
                        h-[80px]

                        sm:left-[260px]
                        sm:top-[120px]
                        sm:w-[110px]
                        sm:h-[110px]

                        md:left-[380px]
                        md:top-[100px]
                        md:w-[140px]
                        md:h-[140px]

                        lg:left-[520px]
                        lg:top-[90px]
                        lg:w-[180px]
                        lg:h-[180px]

                        rounded-full
                    "
                    style={{
                        background:
                            "radial-gradient(50% 50% at 50% 50%, #FFE100 0%, rgba(255,225,0,0) 100%)",
                        filter: "blur(35px)",
                    }}
                />

                {/* Purple Bubble Small */}
                <div
                    className="
                        absolute

                        right-4
                        top-48

                        w-[50px]
                        h-[50px]

                        sm:right-8
                        sm:top-56
                        sm:w-[70px]
                        sm:h-[70px]

                        md:right-12
                        md:top-56
                        md:w-[90px]
                        md:h-[90px]

                        lg:right-[90px]
                        lg:top-[230px]
                        lg:w-[120px]
                        lg:h-[120px]

                        rounded-full
                    "
                    style={{
                        background:
                            "radial-gradient(50% 50% at 50% 50%, #774EFC 0%, rgba(119,78,252,0) 100%)",
                        filter: "blur(28px)",
                    }}
                />

                {/* Purple Bubble Bottom Right */}
                <div
                    className="
                        absolute

                        -right-24
                        top-[520px]

                        w-[300px]
                        h-[300px]

                        sm:-right-32
                        sm:top-[560px]
                        sm:w-[420px]
                        sm:h-[420px]

                        md:-right-40
                        md:top-[520px]
                        md:w-[560px]
                        md:h-[560px]

                        lg:-right-[240px]
                        lg:top-[420px]
                        lg:w-[760px]
                        lg:h-[760px]

                        rounded-full
                    "
                    style={{
                        background:
                            "radial-gradient(50% 50% at 50% 50%, #774EFC 0%, rgba(119,78,252,0) 100%)",
                        filter: "blur(90px)",
                    }}
                />

            </div>

            {/* ================= Content ================= */}
            <div className="relative z-10">
                <Navbar />

                <AboutHero />

                <AboutSection />

                <MarketplaceTestimonial />

                <Footer />
            </div>

        </main>
    );
}