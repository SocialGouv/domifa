import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UsersService } from "src/app/modules/users/services/users.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "../../../../interfaces/usager";
import { DocumentService } from "../../../../services/document.service";
import { UsagerService } from "../../../../services/usager.service";

@Component({
  selector: "app-upload",
  styleUrls: ["./upload.component.css"],
  templateUrl: "./upload.component.html",
})
export class UploadComponent implements OnInit {
  /* Upload */
  public fileName = "";
  public uploadResponse: any;

  public submittedFile = false;
  public uploadForm!: FormGroup;

  public uploadError: {
    fileSize: boolean;
    fileType: boolean;
  };

  public httpError: any;

  @Input() public usager!: Usager;

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private userService: UsersService,
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "" };

    this.uploadError = {
      fileSize: true,
      fileType: true,
    };
  }

  public ngOnInit() {
    this.uploadResponse = { status: "", message: "", filePath: "" };

    this.uploadForm = this.formBuilder.group({
      imageInput: [this.fileName, Validators.required],
      label: ["", Validators.required],
    });

    this.uploadError = {
      fileSize: true,
      fileType: true,
    };
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const validFileExtensions = [
        "image/jpg",
        "application/pdf",
        "image/jpeg",
        "image/bmp",
        "image/gif",
        "image/png",
      ];
      const type = event.target.files[0].type;
      const size = event.target.files[0].size;

      this.fileName = event.target.files[0].name;
      this.uploadError = {
        fileSize: size < 5000000,
        fileType: validFileExtensions.includes(type),
      };

      this.uploadForm.controls.imageInput.setValue(file); // <-- Set Value for Validation
      if (!this.uploadError.fileSize || !this.uploadError.fileType) {
        return false;
      }
    }
  }

  public submitFile() {
    this.submittedFile = true;
    this.uploadError = {
      fileSize: true,
      fileType: true,
    };

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.imageInput.value);
    formData.append("label", this.uploadForm.controls.label.value);

    this.documentService.upload(formData, this.usager.id).subscribe(
      (res) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.usager.docs = new Usager(this.uploadResponse.body.usager).docs;
          this.uploadForm.reset();
          this.fileName = "";
        }
      },
      (err) => (this.httpError = err)
    );
  }
}
