const sizeMap = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const gradients = [
  "from-[#94C5CC] via-[#B4D2E7] to-white",
  "from-[#B4D2E7] via-[#94C5CC] to-white",
  "from-[#94C5CC] via-white to-[#B4D2E7]",
  "from-[#B4D2E7] via-white to-[#94C5CC]",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Avatar({ name, size = "md" }) {
  const avatarSize = sizeMap[size] || sizeMap.md;
  const gradient = gradients[name.length % gradients.length];

  return (
    <div
      className={`inline-flex ${avatarSize} items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} font-semibold text-[#000100] shadow-sm ring-1 ring-black/5`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
