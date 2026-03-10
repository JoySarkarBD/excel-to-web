// import mongoose, { Document, Schema } from "mongoose";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { trafficCommissionerRow } from "@/lib/traffic-commissioner/traffic-commissioner.type";
import { Eye, Pencil, Trash2 } from "lucide-react";

// // communication types
// export enum CommunicationType {
//   Email = "Email",
//   PhoneCall = "Phone Call",
//   Letter = "Letter",
// }

// // Define and export an interface representing a TrafficCommissionerCommunication document
// export interface ITrafficCommissionerCommunication extends Document {
//   type: CommunicationType;
//   contactedPerson: string;
//   reason: string;
//   communicationDate: Date;
//   attachments?: mongoose.Types.ObjectId[];
//   comments?: Date;
//   standAloneId?: mongoose.Types.ObjectId;
//   createdBy?: mongoose.Types.ObjectId;
// }

// // Define the TrafficCommissionerCommunication schema
// const TrafficCommissionerCommunicationSchema: Schema<ITrafficCommissionerCommunication> =
//   new Schema(
//     {
//       type: {
//         type: String,
//         enum: Object.values(CommunicationType),
//         required: true,
//       } /* Type of communication */,
//       contactedPerson: {
//         type: String,
//         required: true,
//       },
//       reason: {
//         type: String,
//         required: true,
//       },
//       communicationDate: {
//         type: Date,
//         required: true,
//       },
//       attachments: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "Document", // Reference from Document model
//         },
//       ],
//       comments: {
//         type: Date,
//       },
//       standAloneId: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//       },
//       createdBy: {
//         type: Schema.Types.ObjectId,
//         ref: "User", // Reference from User model
//       },
//     },
//     { timestamps: true, versionKey: false },
//   );

// // Create the TrafficCommissionerCommunication model
// const TrafficCommissionerCommunication =
//   mongoose.model<ITrafficCommissionerCommunication>(
//     "TrafficCommissionerCommunication",
//     TrafficCommissionerCommunicationSchema,
//   );

// // Export the TrafficCommissionerCommunication model
// export default TrafficCommissionerCommunication;

export interface TrafficCommissionerTableRow {
  _id: string;
  type: string;
  contactedPerson: string;
  reason: string;
  communicationDate: string;
  attachments?: string[]; // Assuming these are URLs or file names
  comments?: string;
  standAloneId?: string;
  createdBy?: string;
}

/** Map API response → flat table rows */
export function toTrafficCommissionerTableRows(
  communications: trafficCommissionerRow[],
): TrafficCommissionerTableRow[] {
  return communications.map((comm) => ({
    _id: comm._id,
    type: comm.type,
    contactedPerson: comm.contactedPerson,
    reason: comm.reason,
    communicationDate: new Date(comm.communicationDate).toLocaleDateString(),
    attachments: comm.attachments || [],
    comments: comm.comments || "—",
    standAloneId: comm.standAloneId || "—",
    createdBy: comm.createdBy || "—",
  }));
}

const columns: Column<TrafficCommissionerTableRow>[] = [
  { key: "type", title: "Type" },
  { key: "contactedPerson", title: "Contacted Person" },
  { key: "reason", title: "Reason" },
  { key: "communicationDate", title: "Communication Date" },
  { key: "attachments", title: "Attachments" },
  { key: "comments", title: "Comments" },
  { key: "standAloneId", title: "Stand Alone ID" },
  { key: "createdBy", title: "Created By" },
];

interface CommissionerTableProps {
  data: TrafficCommissionerTableRow[];
  onAddTrafficCommissioner: () => void;
  onView: (row: TrafficCommissionerTableRow) => void;
  onEdit: (row: TrafficCommissionerTableRow) => void;
  onDelete: (row: TrafficCommissionerTableRow) => void;
}

export default function CommissionerTable({
  data,
  onAddTrafficCommissioner,
  onView,
  onEdit,
  onDelete,
}: CommissionerTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Traffic Commissioner Communication",
          onClick: onAddTrafficCommissioner,
        },
      ],
    },
  ];

  const actions: TableAction<TrafficCommissionerTableRow>[] = [
    {
      label: "",
      variant: "view",
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
    },
    {
      label: "",
      variant: "edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      label: "",
      variant: "delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
    },
  ];

  // Table implementation would go here, using `columns` and `data`
  return (
    <UniversalTable<TrafficCommissionerTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
