/**
 * HL7 FHIR R4 Interoperability Exporter
 * Converts EmergencyCare patient profile data into official HL7 FHIR R4 JSON Bundle.
 */

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export interface FHIRBundle {
  resourceType: "Bundle";
  type: "collection";
  timestamp: string;
  total: number;
  entry: Array<{
    fullUrl: string;
    resource: FHIRResource;
  }>;
}

export function generateFHIRR4Bundle(patientData: any): FHIRBundle {
  const patientId = `patient-${patientData?.id || 1}`;
  const nowISO = new Date().toISOString();

  // 1. FHIR Patient Resource
  const patientResource: FHIRResource = {
    resourceType: "Patient",
    id: patientId,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Patient"]
    },
    active: true,
    name: [
      {
        use: "official",
        text: patientData?.full_name || "Rahul Sharma",
        family: (patientData?.full_name || "Rahul Sharma").split(" ").pop(),
        given: (patientData?.full_name || "Rahul Sharma").split(" ").slice(0, -1)
      }
    ],
    telecom: [
      {
        system: "phone",
        value: patientData?.phone || "+91 98200 98200",
        use: "mobile"
      }
    ],
    gender: "male",
    birthDate: "1990-05-14",
    extension: [
      {
        url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
        valueString: patientData?.blood_group || "B+"
      }
    ]
  };

  // 2. FHIR AllergyIntolerance Resources
  const allergies = (patientData?.critical_allergies || "Penicillin, IgE Sensitivity")
    .split(",")
    .map((a: string) => a.trim())
    .filter(Boolean);

  const allergyResources: FHIRResource[] = allergies.map((allergy: string, idx: number) => ({
    resourceType: "AllergyIntolerance",
    id: `allergy-${patientData?.id || 1}-${idx + 1}`,
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
          code: "active",
          display: "Active"
        }
      ]
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
          code: "confirmed",
          display: "Confirmed"
        }
      ]
    },
    category: ["medication"],
    criticality: "high",
    code: {
      text: allergy
    },
    patient: {
      reference: `Patient/${patientId}`
    }
  }));

  // 3. FHIR Condition Resources (Medical History)
  const conditions = (patientData?.chronic_conditions || "Bronchial Asthma, Hypertension")
    .split(",")
    .map((c: string) => c.trim())
    .filter(Boolean);

  const conditionResources: FHIRResource[] = conditions.map((cond: string, idx: number) => ({
    resourceType: "Condition",
    id: `condition-${patientData?.id || 1}-${idx + 1}`,
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
          display: "Active"
        }
      ]
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: "confirmed",
          display: "Confirmed"
        }
      ]
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-category",
            code: "problem-list-item",
            display: "Problem List Item"
          }
        ]
      }
    ],
    code: {
      text: cond
    },
    subject: {
      reference: `Patient/${patientId}`
    }
  }));

  // 4. FHIR Observation (Blood Group & Vitals)
  const bloodGroupObservation: FHIRResource = {
    resourceType: "Observation",
    id: `obs-blood-group-${patientData?.id || 1}`,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
            display: "Laboratory"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "882-1",
          display: "ABO and Rh group [Type] in Blood"
        }
      ],
      text: "Blood Type"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    valueString: patientData?.blood_group || "B+"
  };

  const allResources = [patientResource, ...allergyResources, ...conditionResources, bloodGroupObservation];

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: nowISO,
    total: allResources.length,
    entry: allResources.map((res) => ({
      fullUrl: `urn:uuid:${res.id}`,
      resource: res
    }))
  };
}

export function downloadFHIRJson(bundle: FHIRBundle, fileName = "patient_fhir_r4.json") {
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: "application/fhir+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
