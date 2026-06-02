export default function Footer() {
    return (
        <footer className="bg-[#f5f5f5] py-16 mt-20">
            <div className="container mx-auto grid md:grid-cols-2 gap-10">

                <div>
                    <h2 className="text-2xl font-bold mb-4">
                        TRI J
                    </h2>

                    <p className="text-gray-600 max-w-sm">
                        Menyediakan peralatan rumah tangga yang dirancang dengan kualitas
                        konsisten dan pasokan terjaga.
                    </p>
                </div>

                <div className="flex md:justify-end gap-10">
                    <a href="/">Home</a>
                    <a href="/products">Products</a>
                    <a href="/about">About us</a>
                </div>
            </div>
        </footer>
    );
}