import { Heart, ShoppingCart, User } from "lucide-react";

export default function Navbar() {
    return (
        <header className="w-full border-b bg-white">
            <div className="container mx-auto flex items-center justify-between py-4">

                <h1 className="text-2xl font-bold">
                    TRI J
                </h1>

                <nav className="hidden md:flex gap-8 text-sm font-medium">
                    <a href="/">Home</a>
                    <a href="/products">Products</a>
                    <a href="/about">About us</a>
                    <a href="/contact">Contact us</a>
                </nav>

                <div className="flex items-center gap-4">
                    <Heart size={20} />
                    <User size={20} />
                    <ShoppingCart size={20} />
                </div>
            </div>
        </header>
    );
}