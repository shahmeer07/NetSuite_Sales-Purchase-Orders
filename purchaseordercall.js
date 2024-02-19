/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

define(['N/search', 'N/log', 'N/record'], function (search, log, record) {
    
    function execute(context) {
        try {
            
            var searchPurchaseOrders = search.create({
                type: search.Type.PURCHASE_ORDER,
                filters: [ ['mainline' , 'is' , 'F'] ], 
                columns: ['tranid', 'trandate'],
                title: 'Recently Created Purchase Orders',
                sortBy: [{
                    column: 'trandate',
                    sort: search.Sort.DESC
                }],
                isDynamic: false
            });

            var searchResults = searchPurchaseOrders.run().getRange({
                start: 0,
                end: 9 
            });

            
            searchResults.forEach(function (result) {
                var purchaseOrderId = result.id;
                var purchaseOrder = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: purchaseOrderId,
                    isDynamic: true
                });  

                
                var lineCount = purchaseOrder.getLineCount({sublistId: 'item'});
                
                
                for (var i = 0; i < lineCount; i++) {
                    var itemQuantity = purchaseOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    }) || 'empty'
                    var itemName = purchaseOrder.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    }) || 'empty'

                    var detailsText = 'Purchase Order ID:' + purchaseOrderId + '\n' +
                    'Item Quantity:' + itemQuantity + '\n' +
                    'Item Name: ' + itemName
                    
                    log.debug({
                        title: 'Purchase Order Line Item Details',
                        details: detailsText
                    });
                }    
            });
        } catch (e) {
            log.error({
                title: e.name,
                details: e.message
            });
        }
    }

    return {
        execute: execute
    };
});
