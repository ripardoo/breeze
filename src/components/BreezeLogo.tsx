function BreezeLogo() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-primary to-secondary text-primary-content shrink-0">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6.5 h-6.5"
        >
          <path
            d="M6 8C6 8 10 6 16 6C22 6 26 8 26 8C26 8 22 14 16 14C10 14 6 8 6 8Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M6 16C6 16 10 14 16 14C22 14 26 16 26 16C26 16 22 22 16 22C10 22 6 16 6 16Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M6 24C6 24 10 22 16 22C22 22 26 24 26 24C26 24 22 28 16 28C10 28 6 24 6 24Z"
            fill="currentColor"
            opacity="0.35"
          />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-base-content">
        Breeze
      </span>
    </div>
  );
}

export default BreezeLogo;
