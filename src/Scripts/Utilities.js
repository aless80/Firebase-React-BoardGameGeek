// Helper method to extract values from the parsed XML response
export const extractValueFromElement = (
  doc,
  elem,
  attr,
  attrFilter,
  attrOut = "value"
) => {
  // Get elements <elem>
  let linksHTMLCollection = doc.getElementsByTagName(elem);
  let elements = Array.from(linksHTMLCollection);
  // Filter on <elem>.<attrOut>. This also prevents errors
  elements = elements.filter(x => x.attributes.hasOwnProperty(attrOut));
  // Filter on <elem>.<attr> === <attrFilter>
  if (attrFilter !== "") {
    elements = elements.filter(
      x => x.attributes[attr].nodeValue === attrFilter
    );
  }
  return elements.map(x => x.attributes[attrOut].nodeValue);
};
