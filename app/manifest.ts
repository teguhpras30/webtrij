import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TRI J - Peralatan Rumah Tangga Berkualitas",
    short_name: "TRI J",
    description:
      "Penyedia perabotan rumah tangga berkualitas tinggi, fungsional, dan tahan lama.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2F4F5",
    theme_color: "#774EFC",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
