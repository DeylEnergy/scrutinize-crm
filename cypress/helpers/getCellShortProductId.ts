import {TEST_DATA_ATTR} from '../../src/constants'

function getParentWithAttribute(element: JQuery, attr = TEST_DATA_ATTR) {
  return Array.from(element.parents()).find(parentEl =>
    parentEl.hasAttribute(attr),
  )
}

function extractShortIdFromAttribute(element, attr = TEST_DATA_ATTR) {
  return element
    .getAttribute(attr)
    .split('_')
    .slice(-1)
}

export default function getCellShortProductId(element) {
  const foundParent = getParentWithAttribute(element)

  if (!foundParent) {
    return null
  }

  return extractShortIdFromAttribute(foundParent)
}
