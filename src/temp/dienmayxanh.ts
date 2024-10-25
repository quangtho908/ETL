[
  {
    "attr": "cpu",
    "action": {
      "replace": {
        "text": "\\b\\d+ nhân\\b",
        "value": ""
      }
    }
  },
  {
    "attr": "brand",
    "action": {
      "replace": {
        "text": ". Xem thông tin hãng",
        "value": ""
      },
      "fillMissing": {
        "range": [0, 1],
        "depend": "name"
      },
      "replaceBy": {
        "contains": ["iphone"],
        "value": "Apple"
      }
    }
  },
  {
    "attr": "pricing",
    "action": {
      "replace": {
        "text": "[\\.đ]",
        "value": ""
      }
    }
  },
  {
    "attr": "name",
    "action": {
      "replace": {
        "text": "\\b\\d+GB\\/\\d+GB\\b",
        "value": ""
      }
    }
  }
]
