export const isJsonString = (str: string | null): str is string => {
  try {
    if (!str) {
      return false
    }
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}
