export default function Container({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto max-w-[1280px] px-6">
            {children}
        </div>
    );
}