"use client";
import { motion } from "framer-motion";

export default function ContactForm() {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 80,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
                amount: 0.3,
            }}
            transition={{
                duration: 1,
                ease: "easeOut",
            }}
        >
            <form className="w-full max-w-[560px] space-y-6 md:space-y-8 lg:max-w-none">

                {/* Name */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <div>
                        <label className="mb-3 block font-medium">
                            First Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your first name"
                            className="h-14 w-full rounded-full bg-white px-6 outline-none md:h-16"
                        />
                    </div>

                    <div>
                        <label className="mb-3 block font-medium">
                            Last Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your last name"
                            className="h-14 w-full rounded-full bg-white px-6 outline-none md:h-16"
                        />
                    </div>

                </div>

                {/* Email */}
                <div>
                    <label className="mb-3 block font-medium">
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="h-14 w-full rounded-full bg-white px-6 outline-none md:h-16"
                    />
                </div>

                {/* Message */}
                <div>
                    <label className="mb-3 block font-medium">
                        How can we help you?
                    </label>

                    <textarea
                        rows={7}
                        placeholder="Write your message..."
                        className="min-h-[180px] w-full resize-none rounded-[24px] bg-white p-6 outline-none md:rounded-[30px]"
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="h-14 w-full rounded-full bg-[#774EFC] text-lg font-semibold text-white transition hover:opacity-90 md:h-16 md:text-xl"
                >
                    Send Message
                </button>

            </form>
        </motion.div>
    );
}