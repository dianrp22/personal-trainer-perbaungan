import Link from "next/link";
import type { Trainer } from "@/data/trainers";
import { trainerPath, trainerWhatsappLink } from "@/lib/helpers";
import { TrainerAvatar } from "./TrainerAvatar";
import { WhatsAppButton } from "./WhatsAppButton";

export function TrainerCard({ trainer, eager }: { trainer: Trainer; eager?: boolean }) {
  return (
    <article className="card">
      <div className="card-head">
        <TrainerAvatar trainer={trainer} eager={eager} />
        <div>
          <h3 className="card-name">
            <Link href={trainerPath(trainer)}>{trainer.name}</Link>
          </h3>
          {trainer.gym && <p className="card-gym">{trainer.gym}</p>}
        </div>
      </div>

      {trainer.gymAddress && (
        <p className="card-address">
          <span aria-hidden="true">📍</span> {trainer.gymAddress}
        </p>
      )}

      {trainer.specialties.length > 0 && (
        <ul className="tags" aria-label="Spesialisasi">
          {trainer.specialties.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}

      <div className="card-actions">
        {trainer.whatsapp && <WhatsAppButton href={trainerWhatsappLink(trainer)} />}
        <Link className="btn btn-outline" href={trainerPath(trainer)}>
          Lihat profil
        </Link>
      </div>
    </article>
  );
}
