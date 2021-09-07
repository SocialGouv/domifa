import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { UsagerLight } from "../../../../../_common/model";
import { bounce } from "../../../../shared/animations";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  animations: [bounce],
  selector: "app-profil-add-note-form",
  templateUrl: "./profil-add-note-form.component.html",
  styleUrls: ["./profil-add-note-form.component.css"],
})
export class ProfilAddNoteFormComponent implements OnInit {
  @Input() public usager: UsagerLight;

  @Output()
  public cancel = new EventEmitter();

  @Output()
  public confirm = new EventEmitter();

  public addNoteForm: FormGroup;

  constructor(
    private usagerService: UsagerService,
    private notifService: ToastrService,
    private formBuilder: FormBuilder
  ) {}

  public ngOnInit(): void {
    this.addNoteForm = this.formBuilder.group({
      message: ["", [Validators.required, Validators.maxLength(1000)]],
    });
  }

  public submit() {
    if (this.addNoteForm.valid) {
      this.usagerService
        .createNote({
          note: {
            ...this.addNoteForm.value,
          },
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: (usager) => {
            this.notifService.success("Note enregistrée avec succès");
            this.confirm.emit(usager);
          },
          error: () => {
            this.notifService.error("Impossible d'enregistrer cette note");
          },
        });
    }
  }
}
