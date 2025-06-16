export default function isJSONData(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
