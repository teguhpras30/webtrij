interface Props {
    title: string;
    subtitle?: string;
}

export default function SectionTitle({
    title,
    subtitle,
}: Props) {
    return (
        <div className="text-center">
            <h2 className="font-['MADE_Sunflower'] text-[56px]">
                {title}
            </h2>

            {subtitle && (
                <p className="mx-auto mt-4 max-w-xl text-[#666]">
                    {subtitle}
                </p>
            )}
        </div>
    );
}