import { Component, OnInit } from "@angular/core";
import * as XLSX from "xlsx";
import { regexp } from "../../../../shared/validators";

type AOA = any[][];

@Component({
  selector: "app-import",
  styleUrls: ["./import.component.css"],
  templateUrl: "./import.component.html"
})
export class ImportComponent implements OnInit {
  public data: AOA = [[], []];
  public showTable: boolean;
  public wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "array" };
  public title: string;

  public ngOnInit() {
    this.showTable = false;
    this.title = "Importer vos domiciliés";
  }

  public onFileChange(evt: any) {
    this.showTable = true;
    const target: DataTransfer = evt.target as DataTransfer;

    if (target.files.length !== 1) {
      throw new Error("Cannot use multiple files");
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: "binary" });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as AOA;
    };
    reader.readAsBinaryString(target.files[0]);
  }

  public isValidDate(date: string, required: boolean) {
    if (date === null && required === false) {
      return true;
    }
    return RegExp(regexp.date).test(date);
  }

  public isValidPhone(phone: string) {
    return phone === null || RegExp(regexp.phone).test(phone);
  }

  public isValidEmail(email: string) {
    return email === null || RegExp(regexp.email).test(email);
  }
}
