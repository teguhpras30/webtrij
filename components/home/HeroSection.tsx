export default function HeroSection() {
  return (
    <section className="bg-[#f5f5f5]">
      <div className="container mx-auto grid md:grid-cols-2 items-center min-h-screen">

        <div className="space-y-6">
          <h1 className="text-6xl font-bold leading-tight">
            Penyedia Home Appliance
            <span className="text-purple-600">
              {" "}Berkualitas
            </span>
          </h1>

          <p className="text-gray-600 max-w-lg">
            Solusi tepat untuk kebutuhan bisnis Anda dengan kualitas konsisten,
            pasokan stabil, dan efisiensi yang terjaga.
          </p>

          <button className="bg-purple-600 text-white px-8 py-4 rounded-xl">
            Contact us
          </button>
        </div>

        <div className="flex justify-center">
          <img
            src="/images/home/hero.png"
            alt="hero"
            className="max-h-[700px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}