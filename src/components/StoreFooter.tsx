import Link from "next/link";

type Props = {
  storeName: string;
  address: string;
  phone: string;
  hours: string;
};

export function StoreFooter({ storeName, address, phone, hours }: Props) {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[#090807]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {storeName}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--ink-muted)]">
            Reserve online. Pick up in store. Pay at the counter.
          </p>
          <Link href="/shop" className="mt-5 inline-block text-sm text-[var(--amber)] hover:text-[var(--amber-light)]">
            Shop the shelf
          </Link>
        </div>
        <div>
          <h3 className="kicker">Visit</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--ink-muted)]">
            {address}
            {"\n"}
            {phone}
          </p>
        </div>
        <div>
          <h3 className="kicker">Hours</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--ink-muted)]">
            {hours}
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)] px-5 py-4 text-xs tracking-wide text-[var(--ink-muted)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <span>Please drink responsibly. Must be 21+ to purchase.</span>
          <span>{storeName}</span>
        </div>
      </div>
    </footer>
  );
}
