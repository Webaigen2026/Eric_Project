type Props = {
  storeName: string;
  address: string;
  phone: string;
  hours: string;
};

export function StoreFooter({ storeName, address, phone, hours }: Props) {
  return (
    <footer className="mt-auto border-t border-[var(--line)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[var(--ink)]">{storeName}</p>
          <p className="mt-2 max-w-xs text-sm text-[var(--ink-muted)]">
            Reserve online. Pick up in store. Pay at the counter.
          </p>
        </div>
        <div>
          <h3 className="kicker">Visit</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-[var(--ink-muted)]">
            {address}
            {"\n"}
            {phone}
          </p>
        </div>
        <div>
          <h3 className="kicker">Hours</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-[var(--ink-muted)]">
            {hours}
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)] px-4 py-3 text-xs text-[var(--ink-muted)]">
        <div className="mx-auto max-w-6xl">
          Please drink responsibly. Must be 21+ to purchase.
        </div>
      </div>
    </footer>
  );
}
