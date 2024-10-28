import * as _ from 'lodash';

export const cleanAction = {
  replace(
    product: { [x: string]: string },
    attribute: string | number,
    data: { regex: any; text: string | RegExp; value: any },
  ) {
    if (product[attribute] === null || !!data?.regex)
      return product[attribute] || '';
    const regex = new RegExp(data.text, 'g');
    return product[attribute].replace(regex, data.value);
  },

  replaceBy(
    product: { [x: string]: any },
    attribute: string | number,
    data: { contains: any; value: any },
  ) {
    for (const contain of data.contains) {
      if (
        product[attribute].toLowerCase().indexOf(contain.toLowerCase()) >= 0
      ) {
        return data.value;
      }
    }
    return product[attribute] || '';
  },

  fillMissing(
    product: { [x: string]: any },
    attribute: string | number,
    data: { range: any[]; depend: string | number },
  ) {
    if (_.isEmpty(data?.range)) return product[attribute] || '';

    const array = (product[data.depend] || '').split(' ');
    return array.slice(data.range[0], data.range[1]).join(' ');
  },
};
