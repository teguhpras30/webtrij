import { Quote } from "lucide-react";
import Image from "next/image";

interface Props {
    testimonial: {
        id: number;
        name: string;
        review: string;
        avatar: string;
    };
}

export default function MarketplaceTestimonialCard({
    testimonial,
}: Props) {
    return (
        <div
            className="
        flex
        h-[300px]
        w-full
        max-w-[408px]
        flex-col
        justify-between
        rounded-[32px]
        border
        border-[#E5E5E5]
        bg-white
        p-10
        transition-all
        duration-300
        hover:-translate-y-2
        
      "
        >
            {/* Quote */}
            <img
                src="/petik.svg"
                alt="Quote"
                width="48"
                height="48"
            />

            {/* Review */}
            <p className="text-[18px] leading-8 text-[#1D1D1F]">
                {testimonial.review}
            </p>

            {/* User */}
            <div className="flex w-full items-center gap-4">
                <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={52}
                    height={52}
                    className="rounded-full object-cover"
                />

                <h4 className="text-[22px] font-semibold text-[#1D1D1F]">
                    {testimonial.name}
                </h4>
            </div>
        </div>
    );
}