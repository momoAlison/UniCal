export default function UnicornAvatar({ size = 20 }: { size?: number }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
            <path d="M12 4 L13.5 8 L12 6.5 L10.5 8 Z" fill="#534AB7" />
            <ellipse cx="12" cy="14" rx="6" ry="5" fill="#c6e2f1" />
            <ellipse cx="8.5" cy="15" rx="2" ry="1.5" fill="#F4C0D1" />
            <ellipse cx="15.5" cy="15" rx="2" ry="1.5" fill="#F4C0D1" />
            <circle cx="10.5" cy="13" r="0.9" fill="#534AB7" />
            <circle cx="13.5" cy="13" r="0.9" fill="#534AB7" />
            <path
                d="M10.5 16 Q12 17.2 13.5 16"
                stroke="#534AB7"
                strokeWidth="0.7"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
}
