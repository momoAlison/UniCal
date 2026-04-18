export default function UnicornLogo({ size = 28 }: { size?: number }) {
    return (
        <svg
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
        >
            <rect width="28" height="28" rx="8" fill="#EEEDFE" />
            <path d="M14 6 L16 10 L14 8 L12 10 Z" fill="#534AB7" />
            <ellipse cx="14" cy="16" rx="7" ry="6" fill="#c6e2f1" />
            <ellipse cx="10" cy="17" rx="2.5" ry="2" fill="#F4C0D1" />
            <ellipse cx="18" cy="17" rx="2.5" ry="2" fill="#F4C0D1" />
            <circle cx="12" cy="15" r="1" fill="#534AB7" />
            <circle cx="16" cy="15" r="1" fill="#534AB7" />
            <path
                d="M12 18.5 Q14 20 16 18.5"
                stroke="#534AB7"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
}
