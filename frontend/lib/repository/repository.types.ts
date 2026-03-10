/**
 * The 21 boolean flags from the backend RepositorySettings schema.
 * Keys must match the backend field names exactly.
 */
export interface RepositorySettingsFlags {
  vehicleList: boolean;
  spotChecks: boolean;
  driverDetailsLicenceAndDoc: boolean;
  driverTachoGraphAndWTDInfringements: boolean;
  trainingAndToolboxTalks: boolean;
  renewalsTracker: boolean;
  OCRSChecksAndRectification: boolean;
  trafficCommissionerCommunicate: boolean;
  transportManager: boolean;
  selfServiceAndLogin: boolean;
  Planner: boolean;
  PG9sPG13FGClearanceInvesting: boolean;
  contactLog: boolean;
  GV79DAndMaintenanceProvider: boolean;
  complianceTimetable: boolean;
  auditsAndRectificationReports: boolean;
  fuelUsage: boolean;
  wheelRetorquePolicyAndMonitoring: boolean;
  workingTimeDirective: boolean;
  policyProcedureReviewTracker: boolean;
  subcontractorDetails: boolean;
}

/**
 * Metadata for each setting — display label & dashboard href.
 */
export interface SettingMeta {
  key: keyof RepositorySettingsFlags;
  label: string;
  href: string;
}

/**
 * Master list mapping each backend flag key → human label + href.
 * Order here = display order on the Repository Settings page.
 */
export const SETTINGS_META: SettingMeta[] = [
  { key: "vehicleList", label: "Vehicle List", href: "/dashboard/vehicle-list" },
  { key: "spotChecks", label: "Spot Checks", href: "/dashboard/spot-checks" },
  {
    key: "driverDetailsLicenceAndDoc",
    label: "Driver details, license and WTD infringements",
    href: "/dashboard/driver-details",
  },
  {
    key: "driverTachoGraphAndWTDInfringements",
    label: "Driver tachograph and WTD infringements",
    href: "/dashboard/driver-tachograph",
  },
  {
    key: "trainingAndToolboxTalks",
    label: "Training and Toolbox Talks",
    href: "/dashboard/training",
  },
  { key: "renewalsTracker", label: "Renewals Tracker", href: "/dashboard/renewals" },
  {
    key: "OCRSChecksAndRectification",
    label: "OCRS checks and rectification action plans",
    href: "/dashboard/ocrs-checks",
  },
  {
    key: "trafficCommissionerCommunicate",
    label: "Traffic Commissioner Communications",
    href: "/dashboard/traffic-commissioner",
  },
  { key: "transportManager", label: "Transport Manager", href: "/dashboard/transport-manager" },
  { key: "selfServiceAndLogin", label: "Self service and login", href: "/dashboard/self-service" },
  { key: "Planner", label: "Planner", href: "/dashboard/planner" },
  {
    key: "PG9sPG13FGClearanceInvesting",
    label: "PG9s PG13 FG Clearance Investigation and TC Reporting",
    href: "/dashboard/pg9s",
  },
  { key: "contactLog", label: "Contact log", href: "/dashboard/contact-log" },
  {
    key: "GV79DAndMaintenanceProvider",
    label: "GV79 and Maintenance Provider Communication and Meeting Agenda",
    href: "/dashboard/gv79",
  },
  { key: "complianceTimetable", label: "Compliance Timetable", href: "/dashboard/compliance-timetable" },
  {
    key: "auditsAndRectificationReports",
    label: "Audits and rectification Reports",
    href: "/dashboard/audits-rectification-reports",
  },
  { key: "fuelUsage", label: "Fuel Usage", href: "/dashboard/fuel-usage" },
  {
    key: "wheelRetorquePolicyAndMonitoring",
    label: "Wheel Re-torque and Monitoring",
    href: "/dashboard/wheel-retorque-monitoring",
  },
  {
    key: "workingTimeDirective",
    label: "Working Time Directive",
    href: "/dashboard/working-time-directive",
  },
  {
    key: "policyProcedureReviewTracker",
    label: "Policy Procedure Review Tracker",
    href: "/dashboard/policy-review-tracker",
  },
  {
    key: "subcontractorDetails",
    label: "Subcontractor Details",
    href: "/dashboard/subcontractor-details",
  },
];
