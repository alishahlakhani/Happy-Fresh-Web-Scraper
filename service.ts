import { AppStoreModel } from "./models/Store";
import { AppTaxonomyModel, HFTaxonomyModel } from "./models/Taxonomy";
import { HttpRequest } from "./helpers/request-helper";
import { HFProductsModel, AppProductsModel } from "./models/Products";
import { getFormattedTime } from "./helpers/file-helper";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

const adapter = new FileSync(`db-${getFormattedTime()}.json`);
const db = low(adapter);
// Set some defaults (required if your JSON file is empty)
db.defaults({ errors: [] }).write();

export function getStores(): Promise<Array<AppStoreModel>> {
  return HttpRequest.get("sprinkles/v2/stock_locations/nearby", {
    // keep it fixed for now because it works.
    lat: 3.058623,
    lon: 101.596634
  })
    .then(results => {
      return results.data["stock_locations"].map(store => {
        return {
          id: store.id,
          name: store.name,
          address: `${store.address1}, ${store.address2}, ${store.city}, ${
            store.country.name
          }, ${store.zipcode}`,
          phone: store.phone,
          location: store.location,
          photo: store.photo.url
        };
      });
    })
    .catch(e => {
      db.get("errors")
        .push(e)
        .write();
      return [];
    });
}

export function getStoreTaxonomies(
  storeId: string | number
): Promise<Array<AppTaxonomyModel>> {
  return HttpRequest.get<HFTaxonomyModel>(
    `sprinkles/taxonomies/${storeId}/taxons`,
    {
      stock_location_id: storeId
    }
  )
    .then(results => {
      return results.data.taxons;
    })
    .then(taxons => {
      return taxons
        .map(tax => {
          return [
            {
              id: tax.id,
              name: tax.name || "-",
              description: tax.description || "-",
              products_count: -1 || "-"
            }
          ].concat(
            tax.taxons.map(v => {
              return {
                id: v.id,
                name: v.name || "-",
                description: v.description || "-",
                products_count: v.products_count
              };
            })
          );
        })
        .reduce((final, value) => {
          return final.concat(value);
        }, [])
        .sort((a, b) => a.id - b.id);
    })
    .catch(e => {
      db.get("errors")
        .push(e)
        .write();
      return [];
    });
}

export function getProductsByTaxonomyId(
  storeId: string | number,
  taxonId: string | number
): Promise<Array<AppProductsModel>> {
  return HttpRequest.get<HFProductsModel>(
    `catalog/stock_locations/${storeId}/taxons/${taxonId}/products`,
    {
      popular: true,
      page: 1,
      taxon_id: taxonId,
      per_page: 5000
    }
  )
    .then(results => {
      return results.data.products;
    })
    .then(prods => {
      let newProds: Array<AppProductsModel> = [];

      prods.forEach(prod => {
        if (prod.variants.length > 1) {
          let prodX = [
            {
              id: prod.id,
              name: prod.name,
              description: prod.description,
              supermarket_unit_cost_price: prod.supermarket_unit_cost_price,
              display_supermarket_unit_cost_price:
                prod.display_supermarket_unit_cost_price,
              normal_price: prod.normal_price,
              display_normal_price: prod.display_normal_price,
              price: prod.price,
              display_price: prod.display_price,
              unit_price: prod.unit_price,
              display_unit_price: prod.display_unit_price,
              display_promo_price_percentage:
                prod.display_promo_price_percentage,
              display_promotion_actions_combination_text:
                prod.display_promotion_actions_combination_text,
              display_unit: prod.display_unit,
              supermarket_unit: prod.supermarket_unit,
              natural_average_weight: prod.natural_average_weight,
              display_average_weight: prod.display_average_weight,
              sku: `-`,
              images: null
            }
          ];

          prodX = prodX.concat(
            prod.variants.map(variant => {
              return {
                id: variant.id,
                name: variant.name,
                description: variant.description,
                supermarket_unit_cost_price: null,
                display_supermarket_unit_cost_price: null,
                normal_price: null,
                display_normal_price: null,
                price: null,
                display_price: null,
                unit_price: null,
                display_unit_price: null,
                display_promo_price_percentage: null,
                display_promotion_actions_combination_text: null,
                display_unit: null,
                supermarket_unit: null,
                natural_average_weight: null,
                display_average_weight: null,
                sku: variant.sku,
                images: variant.images
              };
            }) || []
          );
          newProds = newProds.concat(prodX);
        } else {
          newProds.push({
            id: prod.variants[0].id,
            name: prod.variants[0].name,
            description: prod.variants[0].description,
            supermarket_unit_cost_price: prod.supermarket_unit_cost_price,
            display_supermarket_unit_cost_price:
              prod.display_supermarket_unit_cost_price,
            normal_price: prod.normal_price,
            display_normal_price: prod.display_normal_price,
            price: prod.price,
            display_price: prod.display_price,
            unit_price: prod.unit_price,
            display_unit_price: prod.display_unit_price,
            display_promo_price_percentage: prod.display_promo_price_percentage,
            display_promotion_actions_combination_text:
              prod.display_promotion_actions_combination_text,
            display_unit: prod.display_unit,
            supermarket_unit: prod.supermarket_unit,
            natural_average_weight: prod.natural_average_weight,
            display_average_weight: prod.display_average_weight,
            sku: prod.variants[0].sku,
            images: prod.variants[0].images
          });
        }
      });
      return newProds;
    })
    .catch(e => {
      db.get("errors")
        .push(e)
        .write();
      return [];
    });
}

export function serviceInit(baseURL: string, headers: any) {
  HttpRequest.init(baseURL, headers);
}

// export const Services = {
//   init: (baseURL: string, headers: any) => {
//     HttpRequest.init(baseURL, headers);
//   },
//   getStores: getStores,
//   getStoreTaxonomies: getStoreTaxonomies,
//   getProductsByTaxonomyId: getProductsByTaxonomyId
// };
