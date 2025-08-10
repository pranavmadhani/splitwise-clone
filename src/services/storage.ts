let mem = '';
export function getToken(){ try { return localStorage?.getItem('jwt') || mem } catch { return mem } }
export function setToken(v:string){ try { localStorage?.setItem('jwt', v) } catch { mem = v } }
export function clearToken(){ try { localStorage?.removeItem('jwt') } catch { mem = '' } }
