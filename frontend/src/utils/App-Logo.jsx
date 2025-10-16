const AppLogo = ({ size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" rx="40" fill="#0F172A" />
      <text
        x="100"
        y="120"
        textAnchor="middle"
        fontFamily="Fira Code, monospace"
        fontSize="72"
        fill="#38BDF8"
      >
        {"</>"}
      </text>
    </svg>
  );
};

export default AppLogo;
