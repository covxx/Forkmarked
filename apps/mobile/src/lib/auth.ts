let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  _getToken = getter;
}

export async function getToken(): Promise<string | null> {
  if (!_getToken) return null;
  return _getToken();
}
