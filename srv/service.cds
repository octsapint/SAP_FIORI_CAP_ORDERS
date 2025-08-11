using orders from '../db/data-model';

@path             : 'supplier-order'
@cds.odata.publish: true
service SupplierOrderService {
  entity SupplierOrdersReprocess as projection on orders.SupplierOrdersReprocess;

  type ActionResult : {
    message      : String;
    successCount : Integer;
    failureCount : Integer;
  };

  action Resend(orderIDs : array of Integer)  returns ActionResult;
  action Cancel(orderIDs : array of Integer)  returns ActionResult;
  action Archive(orderIDs : array of Integer) returns ActionResult;
}
