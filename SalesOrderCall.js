/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/search', 'N/log'], function (record, search, log) {
    function fetchSalesOrder() {
        try {
            var salesOrders = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['status', 'anyOf', 'SalesOrd:B']
                ],
                columns: ['entity']
            });

            salesOrders.run().each(function (result) {
                var customerId = result.getValue({ name: 'entity' });
                if (customerId) {
                    var customerName = getCustomerName(customerId);
                    log.debug({
                        title: "Result of FetchSalesOrder",
                        details: {
                            'salesOrderId': result.id,
                            'customerName': customerName
                        }
                    });
                } else {
                    log.error({
                        title: "Customer ID Not Found",
                        details: "Customer ID is empty or undefined"
                    });
                }
                return true;
            });
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            });
        }
    }

    function getCustomerName(customerId) {
        try {
            var customer = record.load({
                type: record.Type.CUSTOMER,
                id: customerId
            });
            return customer.getValue({ fieldId: 'companyname' });
        } catch (e) {
            log.error({
                title: "Error Loading customer record",
                details: e.message
            });
        }
    }

    function execute(context) {
        fetchSalesOrder();
    }

    return {
        execute: execute
    };
});
