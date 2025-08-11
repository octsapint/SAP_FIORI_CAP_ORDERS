const cds = require('@sap/cds');
const axios = require('axios');

module.exports = cds.service.impl(async function () {
  const { SupplierOrdersReprocess, AuditLog } = this.entities;

  // RESEND ACTION
  this.on('Resend', async (req) => {
    const { orderIDs } = req.data;

    let successCount = 0;
    let failureCount = 0;
    const processedIDs = [];
    const failedIDs = [];

    for (const ID of orderIDs) {
      try {
        const record = await SELECT.one.from(SupplierOrdersReprocess).where({ ID });

        if (!record || record.status !== 1) {
          failedIDs.push({ ID, reason: 'Order not found or not eligible for resend.' });
          failureCount++;
          continue;
        }

        await axios.post(process.env.CPI_REPROCESS_ENDPOINT, JSON.parse(record.rawData));

        await UPDATE(SupplierOrdersReprocess)
          .set({
            status: 2,
            lastRetryDate: new Date(),
            reprocessCounter: { '+=': 1 }
          })
          .where({ ID });

        await INSERT.into(AuditLog).entries({
          action: 'Resend',
          referenceID: ID,
          timestamp: new Date(),
          user: req.user.id
        });

        successCount++;
        processedIDs.push(ID);
      } catch (err) {
        console.error(`Resend failed for ID ${ID}: ${err.message}`);
        failedIDs.push({ ID, reason: err.message });
        failureCount++;
      }
    }

    return {
      message: `✅ ${successCount} reprocessed, ❌ ${failureCount} failed.`,
      successCount,
      failureCount,
      processedIDs,
      failedIDs
    };
  });

  // CANCEL ACTION
  this.on('Cancel', async (req) => {
    const { orderIDs } = req.data;

    let successCount = 0;
    let failureCount = 0;
    const processedIDs = [];
    const failedIDs = [];

    for (const ID of orderIDs) {
      try {
        const updated = await UPDATE(SupplierOrdersReprocess)
          .set({ status: 3 }) // 3 = Cancelled
          .where({ ID });

        if (updated === 0) {
          failedIDs.push({ ID, reason: 'Order not found.' });
          failureCount++;
        } else {
          await INSERT.into(AuditLog).entries({
            action: 'Cancel',
            referenceID: ID,
            timestamp: new Date(),
            user: req.user.id
          });

          successCount++;
          processedIDs.push(ID);
        }
      } catch (err) {
        console.error(`Cancel failed for ID ${ID}: ${err.message}`);
        failedIDs.push({ ID, reason: err.message });
        failureCount++;
      }
    }

    return {
      message: `✅ ${successCount} cancelled, ❌ ${failureCount} failed.`,
      successCount,
      failureCount,
      processedIDs,
      failedIDs
    };
  });

  // ARCHIVE ACTION
  this.on('Archive', async (req) => {
    const { orderIDs } = req.data;

    let successCount = 0;
    let failureCount = 0;
    const processedIDs = [];
    const failedIDs = [];

    for (const ID of orderIDs) {
      try {
        const updated = await UPDATE(SupplierOrdersReprocess)
          .set({ status: 4 }) // 4 = Archived
          .where({ ID });

        if (updated === 0) {
          failedIDs.push({ ID, reason: 'Order not found.' });
          failureCount++;
        } else {
          await INSERT.into(AuditLog).entries({
            action: 'Archive',
            referenceID: ID,
            timestamp: new Date(),
            user: req.user.id
          });

          successCount++;
          processedIDs.push(ID);
        }
      } catch (err) {
        console.error(`Archive failed for ID ${ID}: ${err.message}`);
        failedIDs.push({ ID, reason: err.message });
        failureCount++;
      }
    }

    return {
      message: `✅ ${successCount} archived, ❌ ${failureCount} failed.`,
      successCount,
      failureCount,
      processedIDs,
      failedIDs
    };
  });
});