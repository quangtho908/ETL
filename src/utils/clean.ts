import * as _ from 'lodash';

export const cleanAction = {
  replace(
    product: { [x: string]: string },
    attribute: string | number | undefined,
    data: { regex: any; text: string | RegExp; value: any },
  ) {
    if (product[attribute] === null || !!data?.regex)
      return product[attribute] || '';
    const regex = new RegExp(data.text, 'g');
    return product[attribute].replace(regex, data.value);
  },

  replaceBy(
    product: { [x: string]: any },
    attribute: string | number | undefined,
    data: { contains: any; value: any } | { contains: any; value: any }[],
  ) {
    if (Array.isArray(data)) {
      for (const child of data) {
        for (const contain of child.contains) {
          if (
            product[attribute].toLowerCase().indexOf(contain.toLowerCase()) >= 0
          ) {
            return child.value;
          }
        }
      }
      return product[attribute] || '';
    }
    for (const contain of data.contains) {
      if (
        product[attribute].toLowerCase().indexOf(contain.toLowerCase()) >= 0
      ) {
        return data.value;
      }
    }
    return product[attribute] || '';
  },
  replaceDepend(
    product: { [x: string]: any },
    attribute: string | number | undefined,
    data: { range: any[]; depend: string | number },
  ) {
    if (_.isEmpty(data?.range)) return product[attribute] || '';

    const array = (product[data.depend] || '').split(' ');
    return array.slice(data.range[0], data.range[1]).join(' ');
  },

  replaceAll(
    product: { [x: string]: any },
    attribute: string | number | undefined,
    data: { contains: any; value: any },
  ) {
    for (const field in product) {
      for (const contain of data.contains) {
        if (
          typeof product[field] === 'string' &&
          product[field].toLowerCase() === contain.toLowerCase()
        ) {
          product[field] = data.value;
        }
      }
    }
  },
};
