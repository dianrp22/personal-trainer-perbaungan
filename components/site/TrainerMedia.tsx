import type { Trainer } from "@/data/trainers";
import { initials } from "@/lib/helpers";

/** Foto trainer, atau inisial nama kalau foto belum diisi. */
export function TrainerMedia({ trainer, eager = false }: { trainer: Trainer; eager?: boolean }) {
  if (trainer.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="media-photo"
        src={trainer.photo}
        alt={`Foto ${trainer.name}, personal trainer di Perbaungan`}
        width={800}
        height={800}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <div className="media-initials" aria-hidden="true">
      {initials(trainer.name)}
    </div>
  );
}
