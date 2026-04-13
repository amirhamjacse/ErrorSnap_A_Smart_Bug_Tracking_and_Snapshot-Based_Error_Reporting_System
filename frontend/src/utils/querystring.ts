import { keyValueObject } from "types/types";

export const queryStringParse = (str: string): keyValueObject<string> => {
  if (!str) return {};

  const pairs = str.startsWith("?") ? str.slice(1).split("&") : str.split("&");
  return pairs.reduce((acc, pair) => {
    let current = acc;
    const [key, value] = pair.split("=");
    if (key.indexOf("[") !== -1) {
      const keyPartsWithBrac = key
        .split("[")
        .map((part) => part.replace("]", ""));
      for (let i = 0; i < keyPartsWithBrac.length - 1; i++) {
        const part = keyPartsWithBrac[i];
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part];
      }
      current[keyPartsWithBrac[keyPartsWithBrac.length - 1]] =
        decodeURIComponent(value || "");
    } else {
      current[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
};

export const queryStringStringify = (obj?: keyValueObject): string => {
  if (!(typeof obj === "object" && !!obj)) {
    return "";
  }
  const params: Array<string> = [];
  Object.keys(obj).forEach((key: keyof keyValueObject) => {
    if (Array.isArray(obj[key]) /* && obj[key].length > 0 */) {
      if (obj[key].length === 0) {
        params.push(`${encodeURIComponent(key as string)}=`);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        obj[key].forEach((arrValue, arrKey: string) => {
          if (typeof arrValue === "object" && !!arrValue) {
            Object.keys(arrValue).forEach((arrValueKey) => {
              if (
                typeof arrValue[arrValueKey] === "object" &&
                !!arrValue[arrValueKey]
              ) {
                Object.keys(arrValue[arrValueKey]).forEach((arrValue2Key) => {
                  params.push(
                    `${encodeURIComponent(
                      key as string
                    )}[${arrKey}][${arrValueKey}][${arrValue2Key}]=${encodeURIComponent(
                      arrValue[arrValueKey][arrValue2Key]
                    )}`
                  );
                });
              } else {
                params.push(
                  `${encodeURIComponent(
                    key as string
                  )}[${arrKey}][${arrValueKey}]=${encodeURIComponent(
                    arrValue[arrValueKey]
                  )}`
                );
              }
            });
          } else {
            params.push(
              `${encodeURIComponent(
                key as string
              )}[${arrKey}]=${encodeURIComponent(arrValue)}`
            );
          }
        });
      }
    } else if (typeof obj[key] === "object" && !!obj[key]) {
      Object.keys(obj[key]).forEach((objKey) => {
        if (typeof obj[key][objKey] === "object" && !!obj[key][objKey]) {
          Object.keys(obj[key][objKey]).forEach((objKey2) => {
            if (
              typeof obj[key][objKey][objKey2] === "object" &&
              !!obj[key][objKey][objKey2]
            ) {
              Object.keys(obj[key][objKey][objKey2]).forEach((objKey3) => {
                params.push(
                  `${encodeURIComponent(key as string)}[${encodeURIComponent(
                    objKey
                  )}][${encodeURIComponent(objKey2)}][${encodeURIComponent(
                    objKey3
                  )}]=${encodeURIComponent(obj[key][objKey][objKey2][objKey3])}`
                );
              });
            } else {
              params.push(
                `${encodeURIComponent(key as string)}[${encodeURIComponent(
                  objKey
                )}][${encodeURIComponent(objKey2)}]=${encodeURIComponent(
                  obj[key][objKey][objKey2]
                )}`
              );
            }
          });
        } else {
          params.push(
            `${encodeURIComponent(key as string)}[${encodeURIComponent(
              objKey
            )}]=${encodeURIComponent(obj[key][objKey])}`
          );
        }
      });
    } else {
      params.push(
        `${encodeURIComponent(key as string)}=${encodeURIComponent(obj[key])}`
      );
    }
  });
  return params.join("&");
};
