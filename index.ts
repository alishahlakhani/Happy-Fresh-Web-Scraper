import { getFileStream } from "./helpers/file-helper";
import { AppStoreModel } from "models/Store";
import signale = require("signale");
import {
  serviceInit,
  getStores,
  getStoreTaxonomies,
  getProductsByTaxonomyId
} from "./service";
import { AppTaxonomyModel } from "models/Taxonomy";

const HAPPY_FRESH_BASE_URL =
  "https://gvg1d6u3wk.execute-api.ap-southeast-1.amazonaws.com/prod";

type MenuOption = {
  index: number;
  desc: string;
  status: "PENDING" | "DONE" | "ERROR" | "STARTED";
  currentStep: number;
  steps: number;
};

type LogType = {
  parent: string;
  message: string;
};

class AppLogger {
  menu: Array<MenuOption> = [];
  logs: Array<LogType> = [{ parent: "", message: "Started..." }];
  concur: number = 1;

  constructor(options: Array<string>, concur: number = 1) {
    options.forEach((o, i) =>
      this.menu.push({
        index: i,
        desc: o,
        status: "PENDING",
        currentStep: 0,
        steps: 1
      })
    );
    this.print();
    this.concur = concur;
  }

  set(
    desc: string,
    status: "PENDING" | "DONE" | "ERROR" | "STARTED",
    currentStep?: number,
    totalSteps?: number
  ) {
    // More than one can run at once.
    if (this.concur === 1) {
      this.menu = this.menu.map(item => {
        if (item.desc === desc) {
          return {
            ...item,
            currentStep:
              (status === "STARTED" && currentStep) || item.currentStep,
            steps: (status === "STARTED" && totalSteps) || item.steps,
            status: status
          };
        } else {
          return item;
        }
      });
    }
    this.print();
  }

  log(parent: string, message: string) {
    this.logs.push({ parent: parent, message: message });
    this.print();
  }

  print() {
    console.log(`\n\n`);
    console.log(`\n\n`);
    console.log(`\n\n`);
    console.clear();
    this.menu.forEach(m => {
      this.printLog(m);
    });
    console.log(`\n\n`);
    console.log("==================================");
    this.logs.slice(this.logs.length - 10, this.logs.length).forEach(l => {
      signale.log(`~> ${l.message}`);
    });
    console.log("==================================");
  }

  printLog(option: MenuOption) {
    console.clear();
    switch (option.status) {
      case "PENDING":
        signale.log(
          `🌕 - ${option.desc}(${option.currentStep}/${option.steps})`
        );
        break;
      case "DONE":
        signale.log(
          `✅ - ${option.desc}(${option.currentStep}/${option.steps})`
        );
        break;
      case "ERROR":
        signale.log(
          `🔴 - ${option.desc}(${option.currentStep}/${option.steps})`
        );
        break;
      case "STARTED":
        signale.log(
          `🔵 - ${option.desc}(${option.currentStep}/${option.steps})`
        );
        break;
    }
  }
}

async function getStoresCount(): Promise<Array<AppStoreModel>> {
  const stores: Array<AppStoreModel> = await getStores().catch(() => {
    return [];
  });

  // Save
  // let tWrite = getFileStream(`stores`, "csv", false);
  // fileWrite(
  //   tWrite,
  //   stores,
  //   v => {
  //     return `${v.id}; ${v.name}; ${v.address}; ${v.phone}; ${
  //       v.location.lat
  //     }; ${v.location.lon}`;
  //   },
  //   ["id", "name", "address", "phone", "lat", "lon"]
  // );
  // tWrite.close();
  return stores;
}

async function getTaxonsForStore(
  store: AppStoreModel
): Promise<Array<AppTaxonomyModel>> {
  const taxons: Array<AppTaxonomyModel> = await getStoreTaxonomies(store.id);
  return taxons;
}

async function initApp() {
  // 1. Init
  serviceInit(HAPPY_FRESH_BASE_URL, {
    "X-Spree-Client-Token":
      "0115f406e71219ec9ea58e2eaaa4480ef966bdc42e245ec4bf601b23f07bd48e",
    "X-API-Key": "HdI3wa6E3L6ECd1XYZZjJ92d4wUGOD4X6CrtO6MM"
  });

  const logger = new AppLogger(
    ["Get Stores", "Get Store Taxonomies", "Get Products"],
    1
  );

  // Step 1 - Get Stores
  logger.set("Get Stores", "STARTED");
  const stores = await getStoresCount();

  logger.log("Get Stores", `Found ${stores.length} stores.`);
  logger.set("Get Stores", "DONE", 1);

  // Step 2 - Get taxonomy for each store
  const storeWiseTaxonomies: {
    [id: string]: {
      store: AppStoreModel;
      taxonomies: Array<AppTaxonomyModel>;
    };
  } = {};
  logger.set("Get Store Taxonomies", "STARTED", 0, stores.length);
  for (let storeIndex = 0; storeIndex < stores.length; storeIndex++) {
    const store = stores[storeIndex];
    const storeTaxons: Array<AppTaxonomyModel> = await getTaxonsForStore(store);

    logger.log(
      "Get Store Taxonomies",
      `Found ${storeTaxons.length} taxonomies for ${store.name}(${store.id}).`
    );
    logger.set("Get Store Taxonomies", "STARTED", storeIndex + 1);
    storeWiseTaxonomies[store.id] = {
      store: store,
      taxonomies: storeTaxons
    };

    // db.get("taxonomies")
    //   .push({
    //     store: store,
    //     taxonomies: storeTaxons
    //   })
    //   .write();
  }
  logger.set("Get Store Taxonomies", "DONE");

  // if (true) {
  //   return;
  // }
  // Step 3 - Get products for each taxonomy in each store
  const storeIds = Object.values(storeWiseTaxonomies);
  let productsWriter = getFileStream(`products`, "csv", false);
  productsWriter.write(
    `Store Id@ Store Name@ Store Address@ Store Phone@ Store Lat@ Store Long@ Store Photo@ Taxon Id@ Taxon Name@ Taxon Description@ Product Id@ Product Name@ Product description@ Product supermarket_unit_cost_price@ Product display_supermarket_unit_cost_price@ Product normal_price@ Product display_normal_price@ Product price@ Product display_price@ Product unit_price@ Product display_unit_price@ Product display_promo_price_percentage@ Product display_promotion_actions_combination_text@ Product display_unit@ Product supermarket_unit@ Product natural_average_weight@ Product display_average_weight@ Product sku@ \n`
  );
  for (let sObj = 0; sObj < storeIds.length; sObj++) {
    // Get single store with taxons
    const storeTaxonObj = storeIds[sObj];

    // Loop for all taxons
    for (let stObj = 0; stObj < storeTaxonObj.taxonomies.length; stObj++) {
      logger.set(
        "Get Products",
        "STARTED",
        (sObj + 1) * stObj + 1,
        storeTaxonObj.taxonomies.length * storeIds.length
      );
      // Single taxon
      const taxonObj = storeTaxonObj.taxonomies[stObj];
      const products = await getProductsByTaxonomyId(
        storeTaxonObj.store.id,
        taxonObj.id
      );

      logger.log(
        "Get Products",
        `Found ${products.length} products in ${taxonObj.name} of ${
          storeTaxonObj.store.name
        } store`
      );

      products.forEach(product => {
        // db.get("products")
        //   .push({
        //     "Store Id": storeTaxonObj.store.id || "-",
        //     "Store Name": storeTaxonObj.store.name || "-",
        //     "Store Address": storeTaxonObj.store.address || "-",
        //     "Store Phone": storeTaxonObj.store.phone || "-",
        //     "Store Lat": storeTaxonObj.store.location.lat || "-",
        //     "Store Long": storeTaxonObj.store.location.lon || "-",
        //     "Store Photo": storeTaxonObj.store.photo || "-",
        //     "Taxon Id": taxonObj.id || "-",
        //     "Taxon Name": taxonObj.name || "-",
        //     "Taxon Description": taxonObj.description || "-",
        //     "Product Id": product.id || "-",
        //     "Product Name": product.name || "-",
        //     "Product description": product.description || "-",
        //     "Product supermarket_unit_cost_price":
        //       product.supermarket_unit_cost_price || "-",
        //     "Product display_supermarket_unit_cost_price":
        //       product.display_supermarket_unit_cost_price || "-",
        //     "Product normal_price": product.normal_price || "-",
        //     "Product display_normal_price": product.display_normal_price || "-",
        //     "Product price": product.price || "-",
        //     "Product display_price": product.display_price || "-",
        //     "Product unit_price": product.unit_price || "-",
        //     "Product display_unit_price": product.display_unit_price || "-",
        //     "Product display_promo_price_percentage":
        //       product.display_promo_price_percentage || "-",
        //     "Product display_promotion_actions_combination_text":
        //       product.display_promotion_actions_combination_text || "-",
        //     "Product display_unit": product.display_unit || "-",
        //     "Product supermarket_unit": product.supermarket_unit || "-",
        //     "Product natural_average_weight":
        //       product.natural_average_weight || "-",
        //     "Product display_average_weight":
        //       product.display_average_weight || "-",
        //     "Product sku": product.sku || "-"
        //   })
        //   .write();

        productsWriter.write(
          `${storeTaxonObj.store.id}@ ${storeTaxonObj.store.name}@ ${
            storeTaxonObj.store.address
          }@ ${storeTaxonObj.store.phone}@ ${
            storeTaxonObj.store.location.lat
          }@ ${storeTaxonObj.store.location.lon}@ ${
            storeTaxonObj.store.photo
          }@ ${taxonObj.id}@ ${taxonObj.name}@ ${taxonObj.description}@ ${
            product.id
          }@ ${product.name}@ ${product.description}@ ${
            product.supermarket_unit_cost_price
          }@ ${product.display_supermarket_unit_cost_price}@ ${
            product.normal_price
          }@ ${product.display_normal_price}@ ${product.price}@ ${
            product.display_price
          }@ ${product.unit_price}@ ${product.display_unit_price}@ ${
            product.display_promo_price_percentage
          }@ ${product.display_promotion_actions_combination_text}@ ${
            product.display_unit
          }@ ${product.supermarket_unit}@ ${product.natural_average_weight}@ ${
            product.display_average_weight
          }@ ${product.sku}@ `.replace(new RegExp("\r?\n", "g"), "<br />") +
            `\n`
        );
      });
    }
  }
}

initApp();
