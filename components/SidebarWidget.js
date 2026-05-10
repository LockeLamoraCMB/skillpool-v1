export default function SidebarWidget({ title, description, children }) {
  return (
    <section className="soft-panel p-5">
      <header className="mb-4">
        <h3 className="text-lg font-bold text-[#000100]">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-black/60">{description}</p>
        ) : null}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
