namespace orders;

using { cuid, managed } from '@sap/cds/common';

entity SupplierOrdersReprocess : managed {
  key ID: Integer;                              // Use SERIAL in PostgreSQL
  supplier: String(10);
  supplierName: String(50);
  supplierReferenceNumber: String(17);
  purchaseOrderNumber: String(10);
  poLineNumber: String(6);
  status: Integer;                              // 1=Failed, 2=Reprocessed, 3=Cancelled, 4=Archived
  salesOrderNumber: String(10);
  purchaseOrderDate: String(10);
  lastRetryDate: Timestamp;
  reprocessCounter: Integer;
  errorText: String(250);
  rawData: LargeString;                         // Store as JSONB in PostgreSQL
  receiverIflowName: String(100);
}
