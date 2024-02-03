const url = "https://pwa.baby:8000/";
export const getUrl = () => url;

export async function getApi(route: string) {
  const accessToken = localStorage.getItem("accessToken");
  return await fetch(url + route, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
}

export async function postApi(route: string, body: any) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(url + route, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}

export async function patchApi(route: string, body?: any) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(url + route, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}

export async function deleteApi(route: string, body?: any) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(url + route, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}

export function urlBase64ToUint8Array(base64String: string) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}