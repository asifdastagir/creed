function getQuantityStatusClass({
  inventoryQuantity,
  inventoryManagement,
  inventoryPolicy,
  inventoryManyInStockFrom,
  inventoryLowInStockLessThan
}) {
  // console.log({
  //   inventoryQuantity,
  //   inventoryManagement,
  //   inventoryPolicy,
  //   inventoryManyInStockFrom,
  //   inventoryLowInStockLessThan
  // });


  let qs_class = ''
  let qs_width = 0

  if (inventoryQuantity >= inventoryManyInStockFrom || (inventoryManagement == 'shopify' && inventoryPolicy == 'continue')) {
    qs_class = 'start'
    qs_width = 100
  } else {
    if (inventoryQuantity < inventoryManyInStockFrom) {
      qs_class = 'middle'
      qs_width = 60
    }

    if (inventoryQuantity < inventoryLowInStockLessThan) {
      qs_class = 'full'
      qs_width = 30
    }
  }

  if (qs_class == 'full' && inventoryManagement != 'shopify') {

    qs_class = 'start'
    qs_width = 100
  }





  return {
    qs_class,
    qs_width
  }
}

function parseHtmlJsonToArray(htmlString) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  let jsonString = tempDiv.textContent || tempDiv.innerText || "";

  jsonString = jsonString.replace(/,(\s*})/g, "$1");
  const dataObject = JSON.parse(jsonString);

  const dataArray = Object.keys(dataObject).map(key => ({
    id: key,
    ...dataObject[key]
  }));

  return dataArray;
}

function mergeInventoryData(products, inventoryUpdates) {
  const inventoryMap = new Map(inventoryUpdates.map(item => [item.id, item]));

  products.forEach(product => {
    if (inventoryMap.has(product.id)) {
      const inventoryItem = inventoryMap.get(product.id);
      product.inventory_quantity = inventoryItem.inventory_quantity;
      product.inventory_policy = inventoryItem.inventory_policy;
    }
  });

  return products;
}