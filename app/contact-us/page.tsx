import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import ContactHero from "@/components/contactUs/ContactHero";


export default function ContactPage() {
    return (
        <main className="bg-[#F2F4F5]">
            <Navbar />

            <ContactHero />

            <Footer />
        </main>
    );
}