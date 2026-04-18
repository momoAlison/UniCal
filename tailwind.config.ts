import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: "#534AB7",
                    "primary-tint": "#EEEDFE",
                    "primary-dark": "#3C3489",
                    "sky-blue": "#c6e2f1",
                    "petal-pink": "#F4C0D1",
                    lavender: "#CECBF6",
                    mint: "#5DCAA5",
                    "blush-bg": "#FFF0FA",
                    "app-bg": "#f8f6ff",
                    conflict: "#D4537E",
                },
            },
            fontFamily: {
                sans: [
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "sans-serif",
                ],
            },
        },
    },
    plugins: [],
};
export default config;
