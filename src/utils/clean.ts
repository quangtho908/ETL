export const cleanAction = {
  replace (product, attribute, data) {
    if(product[attribute] === null || !data?.regex) return product[attribute] || ""
    const regex = new RegExp(data.text, "g")
    return product[attribute].replace(regex, data.value)
  },

  replaceBy(product, attribute, data) {
    for(let contain of data.contains) {
      if(product[attribute].toLowerCase().indexOf(contain.toLowerCase()) >= 0) {
        return data.value
      }
    }
    return product[attribute] || ""
  },

  fillMissing(product, attribute, data) {
    if(!!product[attribute] || !data?.range[0]) return product[attribute] || "";
    const array = (product[data.depend] || "").split(" ")
    return array.slice(data.range[0], data.range[1]).join(" ")
  }
}