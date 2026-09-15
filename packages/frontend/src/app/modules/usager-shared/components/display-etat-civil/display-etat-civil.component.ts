import { UsagerFormModel } from "../../interfaces/UsagerFormModel";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { LIEN_PARENTE_LABELS, UsagerLienSummary } from "@domifa/common";
import { Subscription } from "rxjs";
import { UsagerLienService } from "../../services/usager-lien.service";

@Component({
  selector: "app-display-etat-civil",
  templateUrl: "./display-etat-civil.component.html",
  standalone: false,
})
export class DisplayEtatCivilComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  public lienConjoint: UsagerLienSummary | null = null;

  private readonly subscription = new Subscription();

  constructor(private readonly usagerLienService: UsagerLienService) {
    this.subscription.add(
      this.usagerLienService.changed$.subscribe(() => this.loadLienConjoint())
    );
  }

  public get ayantDroitConjoint() {
    return this.usager?.ayantsDroits?.find((a) => a.lien === "CONJOINT");
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.usager && this.usager?.ref) {
      this.loadLienConjoint();
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadLienConjoint(): void {
    this.subscription.add(
      this.usagerLienService.getLien(this.usager.ref).subscribe({
        next: (lien) => (this.lienConjoint = lien),
      })
    );
  }
}
