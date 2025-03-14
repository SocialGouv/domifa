import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageFiltersComponent } from "./manage-filters.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { ManageUsagersModule } from "../../manage-usagers.module";
import {
  CriteriaSearchField,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";

describe("ManageFiltersComponent", () => {
  let component: ManageFiltersComponent;
  let fixture: ComponentFixture<ManageFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageFiltersComponent],
      imports: [NgbModule, ManageUsagersModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageFiltersComponent);
    component = fixture.componentInstance;
    component.filters = {
      echeance: null,
      interactionType: null,
      entretien: null,
      searchString: null,
      searchStringField: CriteriaSearchField.DEFAULT,
      page: 0,
      lastInteractionDate: null,
      sortKey: "NOM",
      sortValue: "asc",
      statut: UsagersFilterCriteriaStatut.VALIDE,
    };

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("getSortKeys", () => {
    it("devrait toujours retourner les éléments de tri de base", () => {
      const result = component.getSortKeys();
      expect(result).toContainEqual({ id: "ID", label: "ID" });
      expect(result).toContainEqual({ id: "NOM", label: "nom" });
      expect(result).toContainEqual({
        id: "ECHEANCE",
        label: expect.any(String),
      });
    });

    it("devrait inclure PASSAGE quand statut est TOUS", () => {
      component.filters = {
        ...component.filters,
        statut: UsagersFilterCriteriaStatut.TOUS,
      };
      const result = component.getSortKeys();
      expect(result).toContainEqual({
        id: "PASSAGE",
        label: "dernier passage",
      });
      expect(result.length).toBe(4);
    });

    it("devrait inclure PASSAGE quand statut est VALIDE", () => {
      component.filters = {
        ...component.filters,
        statut: UsagersFilterCriteriaStatut.VALIDE,
      };
      const result = component.getSortKeys();
      expect(result).toContainEqual({
        id: "PASSAGE",
        label: "dernier passage",
      });
      expect(result.length).toBe(4);
    });

    it("ne devrait pas inclure PASSAGE pour les autres statuts", () => {
      component.filters = {
        ...component.filters,
        statut: UsagersFilterCriteriaStatut.RADIE,
      };
      const result = component.getSortKeys();
      expect(result).not.toContainEqual({
        id: "PASSAGE",
        label: "dernier passage",
      });
      expect(result.length).toBe(3);
    });
  });

  describe("getEcheanceLabel", () => {
    it('devrait retourner "radiation" quand statut est RADIE', () => {
      component.filters = {
        ...component.filters,
        statut: UsagersFilterCriteriaStatut.RADIE,
      };
      expect(component.getEcheanceLabel()).toBe("radiation");
    });

    it('devrait retourner "refus" quand statut est REFUS', () => {
      component.filters = {
        ...component.filters,
        statut: UsagersFilterCriteriaStatut.REFUS,
      };
      expect(component.getEcheanceLabel()).toBe("refus");
    });

    it('devrait retourner "échéance" pour tout autre statut', () => {
      component.filters = {
        ...component.filters,
        statut: UsagersFilterCriteriaStatut.VALIDE,
      };
      expect(component.getEcheanceLabel()).toBe("échéance");

      component.filters = {
        ...component.filters,
        statut: UsagersFilterCriteriaStatut.TOUS,
      };
      expect(component.getEcheanceLabel()).toBe("échéance");

      component.filters = { ...component.filters, statut: undefined };
      expect(component.getEcheanceLabel()).toBe("échéance");
    });
  });
});
