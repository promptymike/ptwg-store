import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Templify — ebooki i planery",
    short_name: "Templify",
    description:
      "Praktyczne ebooki i planery dla codziennego życia: finanse, zdrowie, macierzyństwo, produktywność, kariera.",
    start_url: "/biblioteka",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf6f0",
    theme_color: "#1a1612",
    lang: "pl",
    icons: [
      {
        src: "/api/pwa-icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/pwa-icon?maskable=1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Biblioteka",
        short_name: "Biblioteka",
        description: "Twoje kupione ebooki",
        url: "/biblioteka",
      },
      {
        name: "Lista życzeń",
        short_name: "Życzenia",
        url: "/lista-zyczen",
      },
      {
        name: "Katalog",
        short_name: "Produkty",
        url: "/produkty",
      },
    ],
    categories: ["books", "education", "lifestyle"],
  };
}
