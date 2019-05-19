const stringifyPrimitive = function(v: any): string | number {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

export const stringify = (obj: any, sep?: any, eq?: any, name?: any) => {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj)
      .map(function(k) {
        var ks = encodeURIComponent(stringifyPrimitive(k) as string) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k]
            .map(function(v: any) {
              return ks + encodeURIComponent(stringifyPrimitive(v) as string);
            })
            .join(sep);
        } else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]) as string);
        }
      })
      .filter(Boolean)
      .join(sep);
  }

  if (!name) return '';
  return (
    encodeURIComponent(stringifyPrimitive(name) as string) +
    eq +
    encodeURIComponent(stringifyPrimitive(obj) as string)
  );
};
