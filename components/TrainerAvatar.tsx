import type { Trainer } from "@/data/trainers";
import { initials } from "@/lib/helpers";

export function TrainerAvatar({
  trainer,
  size = 72,
  eager = false,
}: {
  trainer: Trainer;
  size?: number;
  eager?: boolean;
}) {
  if (trainer.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="avatar"
        src={trainer.photo}
        alt={`Foto ${trainer.name}, personal trainer di Perbaungan`}
        width={size}
        height={size}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <div
      className="avatar avatar-initials"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials(trainer.name)}
    </div>
  );
}
