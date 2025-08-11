const cds = require('@sap/cds');
const axios = require('axios');
const { SELECT, UPDATE, INSERT } = cds;

module.exports = cds.service.impl(function () {
  const { SupplierOrdersReprocess, AuditLog } = this.entities;

  async function writeAudit(tx, action, ID, user) {
    if (!AuditLog) return;
    try {
      await tx.run(INSERT.into(AuditLog).entries({
        action,
        referenceID: ID,
        timestamp: new Date(),
        user
      }));
    } catch (err) {
      // ignore audit failures
    }
  }

  this.on('Resend', async (req) => {
    const { orderIDs = [] } = req.data;
    const tx = cds.transaction(req);
    let successCount = 0;
    let failureCount = 0;

    for (const ID of orderIDs) {
      try {
        const record = await tx.run(SELECT.one.from(SupplierOrdersReprocess).where({ ID }));
        if (!record || record.status !== 1) throw new Error('Not found or invalid status');

        let payload;
        try {
          payload = JSON.parse(record.rawData || '{}');
        } catch (err) {
          throw new Error('Invalid JSON');
        }

        await axios.post(process.env.CPI_REPROCESS_ENDPOINT, payload);

        await tx.run(
          UPDATE(SupplierOrdersReprocess)
            .set({
              status: 2,
              lastRetryDate: new Date(),
              reprocessCounter: (record.reprocessCounter || 0) + 1
            })
            .where({ ID })
        );

        await writeAudit(tx, 'Resend', ID, req.user?.id);
        successCount++;
      } catch (err) {
        console.error(`Resend failed for ${ID}: ${err.message}`);
        failureCount++;
      }
    }

    return {
      message: `\u2705 ${successCount} reprocessed, \u274c ${failureCount} failed.`,
      successCount,
      failureCount
    };
  });

  this.on('Cancel', async (req) => {
    const { orderIDs = [] } = req.data;
    const tx = cds.transaction(req);
    let successCount = 0;
    let failureCount = 0;

    for (const ID of orderIDs) {
      try {
        const updated = await tx.run(UPDATE(SupplierOrdersReprocess).set({ status: 3 }).where({ ID }));
        if (updated === 0) throw new Error('Not found');

        await writeAudit(tx, 'Cancel', ID, req.user?.id);
        successCount++;
      } catch (err) {
        console.error(`Cancel failed for ${ID}: ${err.message}`);
        failureCount++;
      }
    }

    return {
      message: `\u2705 ${successCount} cancelled, \u274c ${failureCount} failed.`,
      successCount,
      failureCount
    };
  });

  this.on('Archive', async (req) => {
    const { orderIDs = [] } = req.data;
    const tx = cds.transaction(req);
    let successCount = 0;
    let failureCount = 0;

    for (const ID of orderIDs) {
      try {
        const updated = await tx.run(UPDATE(SupplierOrdersReprocess).set({ status: 4 }).where({ ID }));
        if (updated === 0) throw new Error('Not found');

        await writeAudit(tx, 'Archive', ID, req.user?.id);
        successCount++;
      } catch (err) {
        console.error(`Archive failed for ${ID}: ${err.message}`);
        failureCount++;
      }
    }

    return {
      message: `\u2705 ${successCount} archived, \u274c ${failureCount} failed.`,
      successCount,
      failureCount
    };
  });
});
