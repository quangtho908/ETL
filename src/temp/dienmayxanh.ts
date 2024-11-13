[
  {
    "action": {
      "replaceAll": {
        "contains": ["undefined", "Hãng không công bố"],
        "value": ""
      }
    }
  },
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
      "replaceDepend": {
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
        "text": "[\\.₫]",
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
  },
  {
    "attr": "back_cam_movie",
    "action": {
      "replaceBy": [
        {
          "contains": ["FullHD", "1080p"],
          "value": "FullHD"
        },
        {
          "contains": ["HD", "720p"],
          "value": "HD"
        },
        {
          "contains": ["4k", "2160p"],
          "value": "4k"
        },
        {
          "contains": ["8k", "4320p"],
          "value": "8k"
        }
      ]
    }
  },
  {
    "attr": "battery_size",
    "action": {
      "replace": {
        "text": "\\b\\d+\\s*giờ|mAh",
        "value": ""
      }
    }
  },
  {
    "attr": "max_charge",
    "action": {
      "replace": {
        "text": " W",
        "value": ""
      }
    }
  }
]
